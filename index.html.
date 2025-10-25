#!/usr/bin/env python3
"""
Embed three PNG images as base64 into the HTML template.

Usage:
1. Save the three PNGs into ./assets/ with the following names:
   - assets/engagement_vs_sentiment.png
   - assets/sentiment_by_verification.png
   - assets/distribution_sentiment.png

2. Put index-template.html in the same directory as this script.

3. Run:
   python3 embed_images.py

4. The script writes index-embedded.html (self-contained).
"""

import base64
from pathlib import Path
import sys

# Filenames (must match what you saved)
ASSETS = {
    "IMG2": Path("assets/engagement_vs_sentiment.png"),
    "IMG3": Path("assets/sentiment_by_verification.png"),
    "IMG4": Path("assets/distribution_sentiment.png"),
}

TEMPLATE = Path("index-template.html")
OUTPUT = Path("index-embedded.html")

def to_data_uri(p: Path, mime: str = "image/png") -> str:
    b = p.read_bytes()
    s = base64.b64encode(b).decode("ascii")
    return f"data:{mime};base64,{s}"

def main():
    if not TEMPLATE.exists():
        print(f"ERROR: template file {TEMPLATE} not found.", file=sys.stderr)
        return 1

    for key, path in ASSETS.items():
        if not path.exists():
            print(f"ERROR: expected image file not found: {path}", file=sys.stderr)
            return 1

    html = TEMPLATE.read_text(encoding="utf-8")
    for key, path in ASSETS.items():
        print(f"Converting {path} to base64...")
        data_uri = to_data_uri(path)
        placeholder = f"{{{{{key}_BASE64}}}}"
        html = html.replace(placeholder, data_uri)

    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Done. Wrote embedded HTML to {OUTPUT.resolve()}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
