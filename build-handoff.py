#!/usr/bin/env python3
"""Build handoff/barakah-circle.zip — the package the web team receives.

Contains only what they need: the two assets to deploy, the page body to paste,
an English README, and the offline preview so they can see it before touching
anything.

    python3 build-handoff.py
"""

import pathlib
import zipfile

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "handoff" / "barakah-circle.zip"

FILES = [
    (ROOT / "handoff" / "README.md", "barakah-circle/README.md"),
    (ROOT / "umbraco" / "page-body.html", "barakah-circle/page-body.html"),
    (ROOT / "umbraco" / "recurring-giving-block.css", "barakah-circle/recurring-giving-block.css"),
    (ROOT / "umbraco" / "recurring-giving-block.js", "barakah-circle/recurring-giving-block.js"),
    (ROOT / "preview" / "live-simulation.html", "barakah-circle/preview.html"),
]


def main() -> None:
    missing = [str(src) for src, _ in FILES if not src.exists()]
    if missing:
        raise SystemExit("missing, run the build scripts first:\n  " + "\n  ".join(missing))

    OUT.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for src, name in FILES:
            zf.write(src, name)

    body = (ROOT / "umbraco" / "page-body.html").read_text(encoding="utf-8")
    placeholders = body.count("REPLACE_ME")

    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")
    for _, name in FILES:
        print(f"  {name}")
    print(f"\n{placeholders} REPLACE_ME placeholder(s) still in page-body.html")


if __name__ == "__main__":
    main()
