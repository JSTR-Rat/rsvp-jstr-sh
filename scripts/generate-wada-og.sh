#!/usr/bin/env bash
#
# Generate public/wada-og.jpg (1200×630) for OpenGraph / Twitter preview cards.
# Center-crops engagement_04 (desktop hero) to the standard OG aspect ratio.
#
# Requires: vipsthumbnail, vipsheader (libvips)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT}/public/wada-og.jpg"
OG_W=1200
OG_H=630

ORIGINAL="${ROOT}/image_originals/engagement_04.jpg"
FALLBACK="${ROOT}/public/images/generated/lightbox/engagement_04_lightbox.jpg"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: required command '$1' not found. Install libvips (e.g. package 'libvips-tools' or 'vips-tools')." >&2
    exit 1
  fi
}

main() {
  require_cmd vipsthumbnail
  require_cmd vipsheader

  local input
  if [[ -f "$ORIGINAL" ]]; then
    input="$ORIGINAL"
  elif [[ -f "$FALLBACK" ]]; then
    input="$FALLBACK"
    echo "note: using fallback ${FALLBACK} (original not found)"
  else
    echo "error: no source image found. Expected ${ORIGINAL} or ${FALLBACK}" >&2
    exit 1
  fi

  local w h
  w="$(vipsheader -f width "$input")"
  h="$(vipsheader -f height "$input")"

  echo "Source: ${input} (${w}x${h}px)"
  echo "Output: ${OUT} (${OG_W}x${OG_H}px, center crop)"

  mkdir -p "$(dirname "$OUT")"

  # Shrink and centre-crop to exact OG dimensions (1200×630).
  vipsthumbnail "$input" -t \
    -s "${OG_W}x${OG_H}" \
    -m centre \
    -o "${OUT}[strip,Q=85]"

  local ow oh
  ow="$(vipsheader -f width "$OUT")"
  oh="$(vipsheader -f height "$OUT")"
  echo "Done: ${OUT} (${ow}x${oh}px)"
}

main "$@"
