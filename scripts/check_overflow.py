#!/usr/bin/env python3
"""No built page scrolls sideways on a phone (390x844).

  python3 scripts/check_overflow.py [--dist dist]

Needs Chrome: $CHROME, or google-chrome/chromium on PATH (CI uses the one preinstalled on
ubuntu-latest). Exit 0 = clean, 1 = a page is wider than the window, 2 = no browser found.
Ported from thishw/hiway scripts/check_site.py (overflow) so both sites share one check.
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
# Every built page is opened in headless Chrome at 390x844 and must not be wider than the
# window. Pages are served from a throwaway local server that appends a measuring script to
# each HTML response (nothing in dist/ is touched); the script writes the result into
# <title>, which --dump-dom prints. The title is "ovf|<scrollWidth>|<clientWidth>|<culprits>".
PHONE_WIDTH, PHONE_HEIGHT = 390, 844
CHROME_NAMES = ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome")
MEASURE = (
    "<script>addEventListener('load',function(){var d=document.documentElement,w=d.clientWidth,"
    "c=function(e){for(e=e.parentElement;e;e=e.parentElement)if(getComputedStyle(e).overflowX!='visible')return 1},"
    "o=[].filter.call(document.body.querySelectorAll('*'),function(e){"
    "var r=e.getBoundingClientRect();return r.width>0&&r.right>w+1&&!c(e)}).slice(0,4).map(function(e){"
    "return e.tagName.toLowerCase()+(typeof e.className=='string'&&e.className?'.'+e.className.split(' ')[0]:'')});"
    "document.title='ovf|'+d.scrollWidth+'|'+w+'|'+o.join(';')})</script>"
)
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


def measure_page(chrome: str, url: str) -> tuple[int, int, str] | None:
    cmd = [
        chrome, "--headless", "--no-sandbox", "--disable-gpu",
        f"--window-size={PHONE_WIDTH},{PHONE_HEIGHT}", "--virtual-time-budget=5000",
        "--dump-dom", url,
    ]
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout
    except subprocess.TimeoutExpired:
        return None
    m = MEASURED.search(out)
    return (int(m.group(1)), int(m.group(2)), html.unescape(m.group(3))) if m else None


def overflow(public: Path, chrome: str) -> list[str]:
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
            if REDIRECT.search(f.read_text(encoding="utf-8")):
                continue  # an alias page: it renders nothing and sends the browser elsewhere
            got = measure_page(chrome, f"http://127.0.0.1:{server.server_port}/{rel}")
            if got is None:
                problems.append(f"{rel}: could not be measured (no result from Chrome)")
                continue
            scroll, client, culprits = got
            if scroll > client:
                problems.append(
                    f"{rel}: {scroll}px wide in a {client}px window"
                    + (f" (wider than the window: {culprits})" if culprits else "")
                )
    finally:
        server.shutdown()
    return problems


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--dist", type=Path, default=Path("dist"))
    args = ap.parse_args(argv)
    chrome = find_chrome()
    if not chrome:
        print("overflow: no Chrome found (set CHROME=/path/to/chrome)", file=sys.stderr)
        return 2
    problems = overflow(args.dist, chrome)
    for p in problems:
        print(p)
    print(f"overflow: {'FAIL' if problems else 'ok'} ({len(problems)} problem{'s' if len(problems) != 1 else ''})")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
