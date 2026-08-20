#!/usr/bin/env python3
"""Build preview/live-simulation.html — the page inside the real site shell.

Where build-preview.py wraps the page body in a stand-in header and a small
subset of the theme, this one is the acceptance test: it drops
umbraco/page-body.html into the *actual* markup and stylesheets served by
humanappealusa.org — real header, real footer, real theme.css, real DIN Next
webfont — so what you see is what Umbraco will render.

Everything is inlined, so the result opens offline as a single file.

    python3 build-live-preview.py

Cached live assets live in preview/assets/live/ (see the README in that
folder). Nothing here is uploaded anywhere; it exists to prove the page
inherits the site's styling without collisions.
"""

import base64
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
ASSETS = ROOT / "preview" / "assets"
LIVE_ASSETS = ASSETS / "live"
BODY = ROOT / "umbraco" / "page-body.html"
BLOCK_CSS = ROOT / "umbraco" / "recurring-giving-block.css"
BLOCK_JS = ROOT / "umbraco" / "recurring-giving-block.js"
CART_JS = ROOT / "preview" / "preview-cart-demo.js"
OUT = ROOT / "preview" / "live-simulation.html"

LIVE = "https://humanappealusa.org"

# Loaded in the same order the live page loads them.
SITE_CSS = [
    "css_theme-iPrkB63a.css",
    "css_header-DLItl0-v.css",
    "css_hero-carousel-CpOyZvtG.css",
    "css_text-one-column-block-DIgmWmZk.css",
    "css__text-block-BDzzuFi9.css",
    "css_footer-Bzi_ijX7.css",
]


def data_uri(path: pathlib.Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    if path.suffix == ".woff":
        mime = "font/woff"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def cached(url_path: str) -> pathlib.Path | None:
    """Map /fonts/din-next/X.woff to preview/assets/live/fonts_din-next_X.woff."""
    name = url_path.lstrip("/").split("?")[0].replace("/", "_")
    local = LIVE_ASSETS / name
    return local if local.exists() else None


def inline_css_urls(css: str) -> str:
    """Swap url(/fonts/...) and url(/img/...) for data URIs."""

    def repl(match: re.Match) -> str:
        raw = match.group(1).strip("\"'")
        if not raw.startswith("/"):
            return match.group(0)
        local = cached(raw)
        if local is None:
            return "url(about:blank)"
        return f"url({data_uri(local)})"

    return re.sub(r"url\(([^)]+)\)", repl, css)


def inline_media(match: re.Match) -> str:
    """Swap a /media/... asset for a data URI, falling back to the live URL."""
    attr, path = match.group(1), match.group(2)
    name = path.split("/")[-1].split("?")[0].lower()
    name = re.sub(r"[^a-z0-9._-]", "_", name)

    for candidate in (ASSETS / name, LIVE_ASSETS / f"media_{path.strip('/').replace('/', '_')}"):
        if candidate.exists():
            return f'{attr}="{data_uri(candidate)}"'
    return f'{attr}="{LIVE}{path}"'


def main() -> None:
    body = BODY.read_text(encoding="utf-8")

    # Umbraco resolves these two tags itself; here the assets are inlined.
    body = re.sub(r'^\s*<link rel="stylesheet" href="/css/[^"]*" />\s*$', "", body, flags=re.M)
    body = re.sub(r'^\s*<script defer src="/js/[^"]*"></script>\s*$', "", body, flags=re.M)

    header = (LIVE_ASSETS / "header.html").read_text(encoding="utf-8")
    footer = (LIVE_ASSETS / "footer.html").read_text(encoding="utf-8")
    sprites = (LIVE_ASSETS / "img_svg-sprites.svg").read_text(encoding="utf-8")

    page = header + body + footer
    page = re.sub(r'(src|data-src)="(/media/[^"]+)"', inline_media, page)
    page = page.replace('"/img/svg-sprites.svg#', '"#')
    page = re.sub(r'href="(/(?!#)[^"]*)"', rf'href="{LIVE}\1"', page)

    css = "\n".join(
        inline_css_urls((LIVE_ASSETS / name).read_text(encoding="utf-8")) for name in SITE_CSS
    )

    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Barakah Circle — inside the live humanappealusa.org shell</title>
<meta name="robots" content="noindex, nofollow">
<style>
/* ===== the site's own stylesheets, byte-for-byte, fonts inlined ===== */
{css}
</style>
<style>
/* ===== the one new stylesheet this page adds ===== */
{BLOCK_CSS.read_text(encoding="utf-8")}
</style>
<style>
/* Simulation only: the live header script isn't loaded, so pin the sticky
   header and hide the sprite sheet. Nothing here affects the deliverable. */
.__sim-sprites {{ display: none; }}
.header-wrapper {{ position: relative; }}
</style>
</head>
<body>
<div class="__sim-sprites">{sprites}</div>
{page}
<script>
{BLOCK_JS.read_text(encoding="utf-8")}
</script>
<script>
{CART_JS.read_text(encoding="utf-8")}
</script>
</body>
</html>
"""

    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT} ({len(html):,} bytes)")


if __name__ == "__main__":
    main()
