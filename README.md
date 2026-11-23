# nammunoptical

부천역 **남문안경**(1988년 개업, 대표 안경사 김용진) 공식 홈페이지 — **https://nammunoptical.com** (GitHub Pages, Astro 정적 사이트).

목표: "부천역 안경 / 부천 안경점" 검색과 AI 답변에서 정확하게 먼저 추천되는 것(SEO + GEO).

- **매장 사실**(주소·전화·영업시간·브랜드·가격·A/S·리뷰 수치)은 `src/data/store.ts` 한 곳에만 쓴다. 본문·JSON-LD·푸터·llms.txt 가 모두 여기서 읽는다.
- **확인되지 않은 값은 출력하지 않는다** — `null` 이면 화면·구조화 데이터 어디에도 나오지 않는다.
- **분석**: GTM `GTM-WP3P69JF` 하나만 넣는다. GA4(`G-4EF3MVLQYH`)는 GTM 안의 Google 태그로 로드한다 — gtag 를 따로 넣지 않는다(중복 수집).

설계 스펙 `docs/specs/2026-11-06-namun-optical-site.md` · 구현 계획 `docs/plans/2026-11-06-namun-optical-site/plan.md`

## 구조

| 경로 | 역할 |
| --- | --- |
| `astro.config.mjs` | `SITE_URL` = `https://nammunoptical.com` — canonical·OG·sitemap·JSON-LD 의 기준. 빌드에서 덮어쓰지 않는다 |
| `src/data/store.ts` | **매장 사실 단일 소스** + 화면용 파생 문구 헬퍼(`priceText`, `aftercareText` …). 페이지에 사실 리터럴을 직접 쓰지 않는다 |
| `src/data/services.ts`, `src/data/faq.ts` | 서비스 페이지 본문·FAQ (본문과 FAQPage 마크업 공용) |
| `src/data/site.ts` | GTM ID, 서치콘솔·서치어드바이저 소유확인 코드, 메뉴 |
| `src/content/guide/*.md` | 안경 가이드 글 (frontmatter 스키마: `src/content.config.ts`) |
| `src/lib/schema.ts` | schema.org JSON-LD (Optician, WebSite, BreadcrumbList, FAQPage, Article, Person) |
| `src/pages/llms.txt.ts`, `robots.txt.ts`, `rss.xml.ts` | GEO·크롤러용 출력 — `store.ts` 에서 생성 |
| `public/` | `CNAME`, favicon, OG 이미지 |
| `scripts/audit_site.py` | 배포 전 감사 (아래 Checks) |
| `scripts/check_overflow.py` | 390px 가로 넘침 검사 (thishw/hiway 와 같은 검사) |
| `.github/workflows/` | `pages.yml` 배포, `check.yml` 은 PR 게이트 |

## 로컬 개발

Node 22.23.4 이상(`.nvmrc`), Python 3.9 이상.

```bash
npm ci
npm run dev        # http://localhost:4321/
```

## Checks

`check.yml` 이 모든 PR 에서 돌린다. PR 을 열기 전에 같은 명령을 로컬에서 돌린다:

```bash
npm run build                                   # 1. 빌드
npm run audit                                   # 2. 링크·앵커, h1=1, canonical, title·description 고유, JSON-LD,
                                                #    img alt, sitemap↔페이지, NAP 정합, 브랜드 "등/다수", 금지 표현
CHROME=/path/to/chrome npm run overflow         # 3. 390px 에서 가로 스크롤 생기는 페이지 0
```

`overflow` 는 빌드된 모든 페이지를 headless Chrome 으로 연다(`$CHROME`, 없으면 PATH 의 `google-chrome`/`chromium`). exit 2 = 브라우저 없음. macOS headless Chrome 은 창 폭이 500px 아래로 줄지 않으므로 CI(ubuntu) 결과가 기준이다.

CI 의 액션은 모두 커밋 SHA 로 고정한다(버전은 주석). 올릴 때는 SHA 와 주석을 같이 바꾼다.

## Deploy

`pages.yml` 은 `main` 푸시와 수동 실행 때 `npm ci` → `npm run build` → audit → GitHub Pages 순으로 배포한다. audit 이 실패하면 배포하지 않고, 이미 떠 있는 사이트는 그대로 남는다.

## 운영 규칙

- 브랜드는 항상 "대표 브랜드 + 등/다수". 감사 스크립트가 렌즈·테·선글라스·콘택트렌즈 브랜드를 2개 이상 나열하면서 "등/다수/여러"가 없는 블록을 실패 처리한다.
- "최고·1위·No.1·완벽" 같은 표현 금지(감사 스크립트 검사).
- 리뷰 수치는 네이버 플레이스 기준일(`store.reviews.asOf`)과 함께 갱신한다. `AggregateRating` 마크업은 넣지 않는다.
- 가이드 글 추가: `src/content/guide/<slug>.md` → 빌드하면 목록·sitemap·RSS·llms.txt 에 자동 반영.
- 운영자에게 새로 확인한 사실은 `store.ts` 에 `// 운영자 확인 YYYY-MM-DD` 주석과 함께 넣고, 스펙의 "운영자 확인" 표에 기록한다.

## 후속 (사이트 공개 후)

1. DNS: `nammunoptical.com` → GitHub Pages (apex A/AAAA, `www` CNAME → `thishw.github.io`), Pages 에서 Enforce HTTPS
2. 구글 서치콘솔(Domain property, DNS TXT)·네이버 서치어드바이저 등록 → 소유확인 코드는 `src/data/site.ts`, sitemap(`/sitemap-index.xml`) 제출
3. 네이버 스마트플레이스 영업시간·소개글·편의시설을 사이트와 같은 값으로
