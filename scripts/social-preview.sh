#!/bin/sh
# Regenerates docs/images/readme/social-preview.png (1280x640) from themes-side-by-side.png.
# Crops the top 1600x800 (all four themes and their labels), then scales to 1280x640. macOS only (sips).
set -e
dir="$(cd "$(dirname "$0")/.." && pwd)/docs/images/readme"
sips -c 800 1600 --cropOffset 0 0 "$dir/themes-side-by-side.png" --out "$dir/social-preview.png" >/dev/null
sips -z 640 1280 "$dir/social-preview.png" >/dev/null
