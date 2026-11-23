"""남문안경 빌드 산출물(dist) 감사 — 표준 라이브러리만 사용, 아무것도 수정하지 않는다.

사용: python3 scripts/audit_site.py dist
검사:
  - 페이지별 h1 1개, title/description 존재·고유, canonical = 사이트URL+경로(noindex 는 canonical 없음), lang="ko", og:image
  - JSON-LD 파싱 + Optician 노드 1개 + 전화 = store.ts, 자기 게재 리뷰 마크업(aggregateRating/review) 금지
  - img alt·width·height
  - 내부 링크/앵커가 실제 파일·id 로 이어지는지
  - sitemap URL 집합 = 색인 대상 페이지 집합
  - NAP 정합: 모든 페이지 본문에 store.ts 의 전화·주소·영업시간, 다른 전화번호 패턴 없음
  - 대표 브랜드(store.ts 에서 읽음)를 2개 이상 나열한 블록/목록에는 "등"/"다수"/"여러" 동반
  - 금지 표현(최고/1위/No.1/넘버원/완벽) 0건 — 본문·meta·JSON-LD·alt·llms.txt·rss.xml
  - robots.txt(Sitemap 줄, 전체 차단 금지)·llms.txt·rss.xml
scanday(github.com/thishw/scanday) scripts/audit_site.py 의 검사 항목을 이식·확장.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
STORE_TS = (ROOT / "src/data/store.ts").read_text(encoding="utf-8")
CONFIG = (ROOT / "astro.config.mjs").read_text(encoding="utf-8")


def ts_value(key):
    m = re.search(rf"\b{key}:\s*'([^']+)'", STORE_TS)
    if not m:
        sys.exit(f"store.ts 에서 {key} 를 찾지 못함")
    return m.group(1)


def ts_brands(group):
    m = re.search(rf"\b{group}:\s*\[(.*?)\]", STORE_TS, re.S)
    if not m:
        sys.exit(f"store.ts 에서 brands.{group} 를 찾지 못함")
    # 브랜드 1개 = (영문, 한글) 한 쌍 — 같은 브랜드의 두 표기를 2개로 세지 않는다
    return re.findall(r"name:\s*'([^']+)',\s*ko:\s*'([^']+)'", m.group(1))


SITE = re.search(r"SITE_URL\s*=\s*'([^']+)'", CONFIG).group(1).rstrip("/")
PHONE = ts_value("phone")
PHONE_INTL = ts_value("phoneIntl")
STREET = ts_value("street")
HOURS = f"{ts_value('opens')}–{ts_value('closes')}"
BRAND_GROUPS = [ts_brands(g) for g in ("lenses", "frames", "sunglasses", "contactLenses")]
FORBIDDEN = ["최고", "1위", "No.1", "NO.1", "넘버원", "완벽"]
PHONE_RE = re.compile(r"(?<![\d+])0\d{1,2}[-. ]\d{3,4}[-. ]\d{4}(?!\d)")
# "등" 은 단어 경계 또는 조사가 붙은 형태만 인정 ("등록·등산·동등" 제외)
ETC_RE = re.compile(r"(?<![가-힣])등(?:(?![가-힣])|(?=입니다|이며|이고|을|의|과|은|도|으로|에서|이))|다수|여러")
# 취급·보유를 말하는 블록만 검사 (제조사 자료 인용 같은 문장은 제외)
CARRY_RE = re.compile(r"취급|갖추|갖춘|갖췄|보유|판매|만나|써 보고|직접 착용|대표 브랜드|브랜드 렌즈|브랜드 테")
BLOCK_TAGS = {
    "p",
    "li",
    "dd",
    "td",
    "th",
    "figcaption",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "summary",
    "a",
    "span",
    "ul",
    "ol",
    "dl",
    "title",
}
VOID = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
}


def digits(s):
    return re.sub(r"\D", "", s)


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids, self.links, self.images, self.canonicals, self.jsonld = (
            [],
            [],
            [],
            [],
            [],
        )
        self.meta, self.lang, self.h1, self.title = {}, None, 0, ""
        self._in_title = self._in_ld = False
        self._skip = 0
        self._ld_buf = []
        self.blocks = []
        self._stack = []
        self.text = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "html":
            self.lang = a.get("lang")
        elif tag == "h1":
            self.h1 += 1
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            k = a.get("name") or a.get("property")
            if k:
                self.meta[k] = a.get("content", "")
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonicals.append(a.get("href", ""))
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "img":
            self.images.append(a)
        elif tag == "script":
            if a.get("type") == "application/ld+json":
                self._in_ld = True
                self._ld_buf = []
            else:
                self._skip += 1
        elif tag in ("style", "noscript"):
            self._skip += 1
        if tag in BLOCK_TAGS and tag not in VOID:
            self._stack.append([tag, []])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "script":
            if self._in_ld:
                self.jsonld.append("".join(self._ld_buf))
                self._in_ld = False
            elif self._skip:
                self._skip -= 1
        elif tag in ("style", "noscript") and self._skip:
            self._skip -= 1
        if tag in BLOCK_TAGS:
            # 짝이 안 맞는 태그가 있어도 스택이 꼬이지 않게 해당 태그까지 닫는다
            while self._stack:
                t, buf = self._stack.pop()
                txt = "".join(buf).strip()
                if txt:
                    self.blocks.append(txt)
                if self._stack:
                    self._stack[-1][1].append(txt + " ")
                if t == tag:
                    break

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_ld:
            self._ld_buf.append(data)
            return
        if self._skip:
            return
        self.text.append(data)
        if self._stack:
            self._stack[-1][1].append(data)


def page_path(dist, f):
    rel = f.relative_to(dist).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def resolve(dist, path):
    p = unquote(path)
    cand = dist / p.lstrip("/")
    if p.endswith("/"):
        cand = cand / "index.html"
    elif cand.is_dir():
        cand = cand / "index.html"
    return cand if cand.exists() else None


def ld_nodes(data):
    items = data if isinstance(data, list) else [data]
    out = []
    for it in items:
        if isinstance(it, dict):
            out.extend(it.get("@graph", [it]))
    return [n for n in out if isinstance(n, dict)]


def ld_types(node):
    t = node.get("@type", [])
    return t if isinstance(t, list) else [t]


def forbidden_in(text):
    return [w for w in FORBIDDEN if w in text]


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: audit_site.py <dist>")
    dist = Path(sys.argv[1]).resolve()
    if not dist.is_dir():
        sys.exit(f"dist 없음: {dist}")
    errors = []
    err = errors.append

    files = sorted(dist.rglob("*.html"))
    pages = {f: Page(f) for f in files}
    indexable = {
        f: p for f, p in pages.items() if "noindex" not in p.meta.get("robots", "")
    }

    titles, descs = {}, {}
    for f, p in pages.items():
        where = page_path(dist, f)
        if p.lang != "ko":
            err(f"{where}: html lang 이 ko 가 아님")
        if p.h1 != 1:
            err(f"{where}: h1 개수 {p.h1}")
        if not p.title.strip():
            err(f"{where}: title 없음")
        d = p.meta.get("description", "")
        if not d:
            err(f"{where}: meta description 없음")
        if f in indexable:
            titles.setdefault(p.title.strip(), []).append(where)
            descs.setdefault(d, []).append(where)
            if len(p.canonicals) != 1:
                err(f"{where}: canonical {len(p.canonicals)}개")
            elif p.canonicals[0] != SITE + where:
                err(f"{where}: canonical 불일치 {p.canonicals[0]} != {SITE + where}")
            if not p.meta.get("og:image"):
                err(f"{where}: og:image 없음")
        elif p.canonicals:
            err(f"{where}: noindex 페이지에 canonical 있음")

        # JSON-LD
        if not p.jsonld:
            err(f"{where}: JSON-LD 없음")
        for raw in p.jsonld:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError as e:
                err(f"{where}: JSON-LD 파싱 실패 {e}")
                continue
            nodes = ld_nodes(data)
            opt = [n for n in nodes if "Optician" in ld_types(n)]
            if len(opt) != 1:
                err(f"{where}: Optician 노드 {len(opt)}개")
            elif opt[0].get("telephone") != PHONE_INTL:
                err(f"{where}: JSON-LD 전화 {opt[0].get('telephone')} != {PHONE_INTL}")
            if (
                re.search(r'"(aggregateRating|review|reviewRating)"\s*:', raw)
                or '"Review"' in raw
            ):
                err(f"{where}: 리뷰 마크업 금지(자기 게재 리뷰)")
            for w in forbidden_in(raw):
                err(f'{where}: JSON-LD 금지 표현 "{w}"')

        # 이미지
        for img in p.images:
            alt = (img.get("alt") or "").strip()
            if not alt:
                err(f"{where}: img alt 없음 {img.get('src')}")
            for w in forbidden_in(alt):
                err(f'{where}: img alt 금지 표현 "{w}"')
            if not img.get("width") or not img.get("height"):
                err(f"{where}: img width/height 없음 {img.get('src')}")

        # 내부 링크·앵커
        for href in p.links:
            if href.startswith(
                ("http://", "https://", "//", "tel:", "mailto:", "javascript:")
            ):
                continue
            parts = urlsplit(href)
            target_file = f if not parts.path else resolve(dist, parts.path)
            if parts.path and target_file is None:
                err(f"{where}: 깨진 내부 링크 {href}")
                continue
            if parts.fragment and target_file and target_file.suffix == ".html":
                if parts.fragment not in pages[target_file].ids:
                    err(f"{where}: 없는 앵커 {href}")

        # NAP + 영업시간
        text = " ".join(p.text)
        for need, label in ((PHONE, "전화"), (STREET, "주소"), (HOURS, "영업시간")):
            if need not in text:
                err(f"{where}: 본문에 {label} {need} 없음")
        for ph in set(PHONE_RE.findall(text)):
            if digits(ph) != digits(PHONE):
                err(f"{where}: 다른 전화번호 노출 {ph}")

        # 금지 표현 (본문 + meta)
        for w in forbidden_in(text + " " + " ".join(p.meta.values())):
            err(f'{where}: 금지 표현 "{w}"')

        # 브랜드 "등/다수" 표기 (블록·목록 단위, 렌즈/테 그룹 각각)
        for b in p.blocks:
            if not CARRY_RE.search(b):
                continue
            for group in BRAND_GROUPS:
                hits = {en for en, ko in group if en in b or ko in b}
                if len(hits) >= 2 and not ETC_RE.search(b):
                    err(f'{where}: 브랜드 나열에 "등/다수" 없음 → {b[:70]}')
                    break

    for t, ws in titles.items():
        if len(ws) > 1:
            err(f'title 중복 "{t}": {ws}')
    for d, ws in descs.items():
        if len(ws) > 1:
            err(f"description 중복: {ws}")

    # sitemap
    sm_urls = set()
    for sm in dist.glob("sitemap-*.xml"):
        if sm.name == "sitemap-index.xml":
            continue
        for loc in (
            ET.parse(sm)
            .getroot()
            .iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
        ):
            sm_urls.add(loc.text.strip())
    page_urls = {SITE + page_path(dist, f) for f in indexable}
    if not sm_urls:
        err("sitemap 비어 있음")
    for u in sorted(page_urls - sm_urls):
        err(f"sitemap 누락 {u}")
    for u in sorted(sm_urls - page_urls):
        err(f"sitemap 에 있으나 페이지 없음 {u}")

    # 부가 파일
    robots = dist / "robots.txt"
    if not robots.exists():
        err("robots.txt 없음")
    else:
        rt = robots.read_text(encoding="utf-8")
        if "Sitemap: " + SITE not in rt:
            err("robots.txt Sitemap 줄 불일치")
        if re.search(r"(?m)^\s*Disallow:\s*/\s*$", rt):
            err("robots.txt 가 전체 차단(Disallow: /)")
    for name in ("llms.txt", "rss.xml"):
        fp = dist / name
        if not fp.exists():
            err(f"{name} 없음")
            continue
        body = fp.read_text(encoding="utf-8")
        for w in forbidden_in(body):
            err(f'{name}: 금지 표현 "{w}"')
        if name == "rss.xml":
            ET.fromstring(body)
        else:
            for need in (PHONE, STREET, HOURS):
                if need not in body:
                    err(f"llms.txt 에 {need} 없음")

    print(
        f"[audit] 페이지 {len(pages)}개 (색인 {len(indexable)}) · sitemap {len(sm_urls)} URL · 사이트 {SITE}"
    )
    if errors:
        for e in errors:
            print("FAIL", e)
        print(f"[audit] FAIL {len(errors)}건")
        return 1
    print("[audit] PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
