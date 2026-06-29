#!/usr/bin/env bash
# Rasterize stationery-floral-rule.svg → stationery-floral-rule.png for HTML email
# (Gmail needs rasters). Requires ImageMagick 6+, Python 3 + Pillow.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SVG="$ROOT/public/images/email/stationery-floral-rule.svg"
PNG="$ROOT/public/images/email/stationery-floral-rule.png"
TMP="$(mktemp /tmp/floral-rasterXXXXXX.png)"
trap 'rm -f "$TMP"' EXIT

convert -density 300 -background none "$SVG" "PNG32:$TMP"

python3 <<PY
from PIL import Image
import sys

tmp = "$TMP"
outp = "$PNG"
TARGET_W = 608
ALPHA_MIN = 15
PAD = 4

im = Image.open(tmp).convert("RGBA")
px = im.load()
w, h = im.size
xs, ys = [], []
for x in range(w):
    for y in range(h):
        if px[x, y][3] > ALPHA_MIN:
            xs.append(x)
            ys.append(y)
if not xs:
    sys.exit("no visible pixels exported from svg (check stroke width / svg)")

l, t, r, b = min(xs) - PAD, min(ys) - PAD, max(xs) + PAD, max(ys) + PAD
l, t = max(0, l), max(0, t)
r, b = min(w - 1, r), min(h - 1, b)
cropped = im.crop((l, t, r + 1, b + 1))
ratio = TARGET_W / cropped.width
target_h = max(1, int(round(cropped.height * ratio)))
resized = cropped.resize((TARGET_W, target_h), Image.Resampling.LANCZOS)
resized.save(outp, "PNG", optimize=True)
print(outp, resized.size)
PY
