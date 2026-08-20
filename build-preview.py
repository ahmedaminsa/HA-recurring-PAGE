#!/usr/bin/env python3
"""Build preview/index.html from the single source of truth.

umbraco/page-body.html is the deliverable. This script wraps it with a subset
of the live theme, the block's own CSS/JS, and a stand-in cart so the page can
be opened as one standalone file for review.

    python3 build-preview.py
"""

import base64
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
ASSETS = ROOT / "preview" / "assets"
BODY = ROOT / "umbraco" / "page-body.html"
BLOCK_CSS = ROOT / "umbraco" / "recurring-giving-block.css"
BLOCK_JS = ROOT / "umbraco" / "recurring-giving-block.js"
THEME_CSS = ROOT / "preview" / "ha-theme-subset.css"
CART_JS = ROOT / "preview" / "preview-cart-demo.js"
OUT = ROOT / "preview" / "index.html"

LIVE = "https://humanappealusa.org"

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Barakah Circle — Human Appeal USA (preview)</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
<style>
/* --- preview chrome (not part of the deliverable) --- */
.preview-note{background:#32195c;color:#fff;font:500 13px/1.5 Barlow,sans-serif;padding:10px 20px;text-align:center}
.preview-note strong{color:#ffd166}
.preview-header{background:#fff;border-bottom:1px solid #ece9f2;padding:14px 0}
.preview-header__inner{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 auto;width:94%;max-width:1360px}
.preview-header__logo{font:700 20px/1 Barlow,sans-serif;color:#662d91;letter-spacing:-.3px;text-transform:uppercase}
.preview-header__nav{display:none;gap:26px;font:500 14px/1 Barlow,sans-serif;color:#3e3e3e}
.preview-header__nav span{color:#3e3e3e}
.preview-footer{background:#32195c;color:#cbb9dd;font:400 13px/1.7 Barlow,sans-serif;padding:34px 0;text-align:center}
@media (min-width:1024px){.preview-header__nav{display:flex}}
</style>
<style>
/* ============================ live theme subset ============================ */
__THEME__
</style>
<style>
/* ============================ new block styles ============================ */
__BLOCK__
</style>
</head>
<body>
<div class="preview-note">
  <strong>Preview.</strong> This is the page <em>body</em> only — on the live site Umbraco wraps it in the real header, footer and DIN&nbsp;Next webfont. Donation forms are stubbed.
</div>
<div class="preview-header">
  <div class="preview-header__inner">
    <span class="preview-header__logo">Human Appeal</span>
    <nav class="preview-header__nav"><span>Appeals</span><span>Projects</span><span>Zakat</span><span>About</span><span>Contact</span></nav>
  </div>
</div>
"""

FOOT = """
<div class="preview-footer">
  Preview footer placeholder — the live site renders its own footer here.<br>
  Human Appeal Inc. is a 501(c)(3) nonprofit · EIN 87-2410117
</div>
<script>
__BLOCKJS__
</script>
<script>
__CARTJS__
</script>
</body>
</html>
"""


def inline_media(match: re.Match) -> str:
    """Swap /media/... for a data: URI so the preview is one portable file.

    Falls back to the live URL when the asset hasn't been cached locally.
    """
    path = match.group(1)
    name = path.split("/")[-1].split("?")[0].lower()
    name = re.sub(r"[^a-z0-9._-]", "_", name)
    local = ASSETS / name
    if not local.exists():
        return f'src="{LIVE}{path}"'
    mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
    data = base64.b64encode(local.read_bytes()).decode("ascii")
    return f'src="data:{mime};base64,{data}"'


def main() -> None:
    body = BODY.read_text(encoding="utf-8")

    # The preview has no site root, so inline the media, point links at the
    # live host, and drop the two asset tags the CMS would resolve itself.
    body = re.sub(r'^\s*<link rel="stylesheet" href="/css/[^"]*" />\s*$', "", body, flags=re.M)
    body = re.sub(r'^\s*<script defer src="/js/[^"]*"></script>\s*$', "", body, flags=re.M)
    body = re.sub(r'src="(/media/[^"]+)"', inline_media, body)
    body = body.replace('href="/', f'href="{LIVE}/')
    body = body.replace(f'href="{LIVE}/#', 'href="#')

    html = (
        HEAD.replace("__THEME__", THEME_CSS.read_text(encoding="utf-8"))
        .replace("__BLOCK__", BLOCK_CSS.read_text(encoding="utf-8"))
        + body
        + FOOT.replace("__BLOCKJS__", BLOCK_JS.read_text(encoding="utf-8")).replace(
            "__CARTJS__", CART_JS.read_text(encoding="utf-8")
        )
    )

    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT} ({len(html):,} bytes)")


if __name__ == "__main__":
    main()
