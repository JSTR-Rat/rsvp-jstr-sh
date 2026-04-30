#!/usr/bin/env bash
#
# Generate WebP derivatives (placeholder, gallery, lightbox) from engagement_*.jpg
# using libvips vipsthumbnail. Originals are never modified or removed.
#
# Reads originals from image_originals/ (not deployed with static assets). Writes WebP
# derivatives to public/images/generated/. Processes every engagement_*.jpg (version-sorted).
#
# Requires: vipsthumbnail, vipsheader (libvips)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="${ROOT}/image_originals"
OUT_BASE="${ROOT}/public/images/generated"
OUT_PH="${OUT_BASE}/placeholders"
OUT_GA="${OUT_BASE}/gallery"
OUT_LB="${OUT_BASE}/lightbox"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: required command '$1' not found. Install libvips (e.g. package 'libvips-tools' or 'vips-tools')." >&2
    exit 1
  fi
}

# Fit (w,h) inside a square box of side 'box', never enlarge (vipsthumbnail uses MxM> for that).
# Prints predicted output dimensions after shrink-only fit.
predict_fit_in_square() {
  local w="$1" h="$2" box="$3"
  local ow oh
  if ((w >= h)); then
    if ((w > box)); then
      ow=$box
      oh=$(( (h * box + w / 2) / w ))
    else
      ow=$w
      oh=$h
    fi
  else
    if ((h > box)); then
      oh=$box
      ow=$(( (w * box + h / 2) / h ))
    else
      ow=$w
      oh=$h
    fi
  fi
  printf "%sx%s" "$ow" "$oh"
}

# Longest edge of width x height.
long_edge() {
  local w="$1" h="$2"
  if ((w >= h)); then echo "$w"; else echo "$h"; fi
}

# Placeholder square: 32–64px on the long edge after fit; scales choice with source resolution.
placeholder_box_for() {
  local long="$1"
  if ((long >= 4500)); then echo 64
  elif ((long >= 2800)); then echo 48
  else echo 32
  fi
}

# Gallery: longest edge after fit targets ~800–1200 depending on source (never upscale; MxM>).
gallery_box_for() {
  local w="$1" h="$2"
  local long
  long="$(long_edge "$w" "$h")"
  if ((long <= 800)); then echo "$long"
  elif ((long < 2000)); then echo 800
  elif ((long < 4000)); then echo 1000
  else echo 1200
  fi
}

# Lightbox: longest edge capped at 2560px (typical 1920–2560 range), never upscale.
lightbox_box_for() {
  local w="$1" h="$2"
  local long
  local cap=2560
  long="$(long_edge "$w" "$h")"
  if ((long < cap)); then echo "$long"
  else echo "$cap"
  fi
}

main() {
  require_cmd vipsthumbnail
  require_cmd vipsheader

  if [[ ! -d "$SRC_DIR" ]]; then
    echo "error: missing directory: ${SRC_DIR}" >&2
    exit 1
  fi

  mkdir -p "$OUT_PH" "$OUT_GA" "$OUT_LB"

  shopt -s nullglob
  local files=("${SRC_DIR}"/engagement_*.jpg)
  shopt -u nullglob

  if ((${#files[@]} == 0)); then
    echo "error: no files matching ${SRC_DIR}/engagement_*.jpg (expected e.g. engagement_01.jpg … engagement_15.jpg)." >&2
    exit 1
  fi

  # Stable version sort so engagement_2 does not sort after engagement_10
  mapfile -t sorted < <(printf '%s\n' "${files[@]}" | sort -V)

  echo "Processing engagement JPEGs → WebP (strip metadata, -t EXIF orientation)"
  echo "Source: ${SRC_DIR}"
  echo "Outputs: ${OUT_PH}, ${OUT_GA}, ${OUT_LB}"
  echo ""

  for input in "${sorted[@]}"; do
    local base w h long ph_box ga_box lb_box ph_dims ga_dims lb_dims
    base="$(basename "$input")"
    w="$(vipsheader -f width "$input")"
    h="$(vipsheader -f height "$input")"
    long="$(long_edge "$w" "$h")"

    ph_box="$(placeholder_box_for "$long")"
    ga_box="$(gallery_box_for "$w" "$h")"
    lb_box="$(lightbox_box_for "$w" "$h")"

    ph_dims="$(predict_fit_in_square "$w" "$h" "$ph_box")"
    ga_dims="$(predict_fit_in_square "$w" "$h" "$ga_box")"
    lb_dims="$(predict_fit_in_square "$w" "$h" "$lb_box")"

    echo "------------------------------------------------------------------"
    echo "file:     ${base}"
    echo "source:   ${w}x${h}px (long edge ${long}px)"
    echo "placeholder:  ${ph_box}x${ph_box}>  → ~${ph_dims}px  (Q≈28, tiny blur-up)"
    echo "gallery:      ${ga_box}x${ga_box}>  → ~${ga_dims}px  (Q≈82)"
    echo "lightbox:     ${lb_box}x${lb_box}>  → ~${lb_dims}px  (Q≈90)"
    echo ""

    # Absolute -o paths: relative paths are resolved from the input file’s directory.
    vipsthumbnail "$input" -t \
      -s "${ph_box}x${ph_box}>" \
      -o "${OUT_PH}/%s_placeholder.webp[strip,Q=28,effort=2]"

    vipsthumbnail "$input" -t \
      -s "${ga_box}x${ga_box}>" \
      -o "${OUT_GA}/%s_gallery.webp[strip,Q=82,effort=4]"

    vipsthumbnail "$input" -t \
      -s "${lb_box}x${lb_box}>" \
      -o "${OUT_LB}/%s_lightbox.webp[strip,Q=90,effort=5]"

    echo "  wrote: $(basename "$input" .jpg)_{placeholder,gallery,lightbox}.webp → ${OUT_BASE}/"
    echo ""
  done

  echo "Done. Original JPEGs unchanged."
}

main "$@"
