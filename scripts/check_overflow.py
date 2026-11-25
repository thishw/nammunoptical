#!/usr/bin/env python3
"""No built page scrolls sideways on a phone (390x844 and 320x844 by default).

  python3 scripts/check_overflow.py [--dist dist] [--widths 390,320]

Needs Chrome: $CHROME, or google-chrome/chromium on PATH (CI uses the one preinstalled on
ubuntu-latest). Exit 0 = clean, 1 = a page is wider than the window, 2 = no browser found.
"""

from __future__ import annotations

import argparse
import html
import http.server
import os
import re
import shutil
import subprocess
import sys
import threading
from functools import partial
from pathlib import Path

# --- sideways overflow on a phone ------------------------------------------------
#
# Every built page is opened in headless Chrome at each width (x844) and must not be wider than the
# window. Pages are served from a throwaway local server that appends a measuring script to
# each HTML response (nothing in dist/ is touched); the script writes the result into the
# top document's <title>, which --dump-dom prints. The title is "ovf|<scrollWidth>|<clientWidth>|<culprits>".
#
# 주의: macOS 의 headless Chrome 은 창 너비를 최소 500px 로 고정한다(--window-size=390 이 무시됨).
# 그래서 페이지를 정확한 너비의 같은 출처 iframe 안에 띄워 측정한다 — 미디어 쿼리도 iframe 너비 기준으로 동작한다.
PHONE_HEIGHT = 844
DEFAULT_WIDTHS = "390,320"  # 일반 휴대폰 + 가장 좁은 휴대폰(구형 iPhone SE)
CHROME_NAMES = ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome")
MEASURE = (
    "<script>addEventListener('load',function(){var d=document.documentElement,w=d.clientWidth,"
    "c=function(e){for(e=e.parentElement;e;e=e.parentElement)if(getComputedStyle(e).overflowX!='visible')return 1},"
    "o=[].filter.call(document.body.querySelectorAll('*'),function(e){"
    "var r=e.getBoundingClientRect();return r.width>0&&r.right>w+1&&!c(e)}).slice(0,4).map(function(e){"
    "return e.tagName.toLowerCase()+(typeof e.className=='string'&&e.className?'.'+e.className.split(' ')[0]:'')});"
    "(parent!==window?parent.document:document).title='ovf|'+d.scrollWidth+'|'+w+'|'+o.join(';')})</script>"
)
FRAME_PREFIX = "/__frame__/"
# 검색엔진 소유확인 파일(naver….html, google….html)은 한 줄 텍스트라 휴대폰 화면 검사 대상이 아니다.
VERIFY_FILE = re.compile(r"(?:naver[0-9a-f]{32}|google[0-9a-f]{16})\.html$")
REDIRECT = re.compile(r"http-equiv=[\"']?refresh", re.I)
MEASURED = re.compile(r"<title>ovf\|(\d+)\|(\d+)\|([^<]*)</title>")


def find_chrome() -> str | None:
    env = os.environ.get("CHROME")
    if env:
        return env if Path(env).is_file() else None
    for name in CHROME_NAMES:
        found = shutil.which(name)
        if found:
            return found
    return None


class _Measuring(http.server.SimpleHTTPRequestHandler):
    """Serves dist/ and appends MEASURE to every HTML page."""

    def do_GET(self):  # noqa: N802 (stdlib name)
        if self.path.startswith(FRAME_PREFIX):  # /__frame__/<width>/<page path>
            width, _, rel = self.path[len(FRAME_PREFIX):].partition("/")
            body = (
                "<!doctype html><html><head><meta charset='utf-8'><title>waiting</title></head>"
                "<body style='margin:0'><iframe src='/" + html.escape(rel, quote=True) + "' "
                f"style='display:block;border:0;width:{int(width)}px;height:{PHONE_HEIGHT}px'></iframe></body></html>"
            ).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            path = path / "index.html"
        if path.suffix != ".html" or not path.is_file():
            return super().do_GET()
        body = (path.read_text(encoding="utf-8") + MEASURE).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def measure_page(chrome: str, url: str, width: int) -> tuple[int, int, str] | None:
    cmd = [
        chrome, "--headless", "--no-sandbox", "--disable-gpu",
        f"--window-size={max(width, 500) + 40},{PHONE_HEIGHT + 40}", "--virtual-time-budget=5000",
        "--dump-dom", url,
    ]
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout
    except subprocess.TimeoutExpired:
        return None
    m = MEASURED.search(out)
    return (int(m.group(1)), int(m.group(2)), html.unescape(m.group(3))) if m else None


def overflow(public: Path, chrome: str, width: int) -> list[str]:
    pages = sorted(public.rglob("*.html")) if public.is_dir() else []
    if not pages:
        return [f"{public}: no HTML pages (run npm run build first)"]
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(_Measuring, directory=str(public))
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    problems: list[str] = []
    try:
        for f in pages:
            rel = f.relative_to(public).as_posix()
            if VERIFY_FILE.match(f.name):
                continue
            if REDIRECT.search(f.read_text(encoding="utf-8")):
                continue  # an alias page: it renders nothing and sends the browser elsewhere
            got = measure_page(chrome, f"http://127.0.0.1:{server.server_port}{FRAME_PREFIX}{width}/{rel}", width)
            if got is None:
                problems.append(f"[{width}px] {rel}: could not be measured (no result from Chrome)")
                continue
            scroll, client, culprits = got
            if scroll > client:
                problems.append(
                    f"[{width}px] {rel}: {scroll}px wide in a {client}px window"
                    + (f" (wider than the window: {culprits})" if culprits else "")
                )
    finally:
        server.shutdown()
    return problems


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--dist", type=Path, default=Path("dist"))
    ap.add_argument("--widths", default=DEFAULT_WIDTHS, help="comma-separated viewport widths (default 390,320)")
    args = ap.parse_args(argv)
    widths = [int(w) for w in args.widths.split(",") if w.strip()]
    chrome = find_chrome()
    if not chrome:
        print("overflow: no Chrome found (set CHROME=/path/to/chrome)", file=sys.stderr)
        return 2
    problems: list[str] = []
    for width in widths:
        problems += overflow(args.dist, chrome, width)
    for p in problems:
        print(p)
    print(
        f"overflow: {'FAIL' if problems else 'ok'} @ {','.join(map(str, widths))}px"
        f" ({len(problems)} problem{'s' if len(problems) != 1 else ''})"
    )
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
