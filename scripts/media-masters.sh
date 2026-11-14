#!/usr/bin/env bash
# Builds SEO-named masters from the raw client media in .agents/context:
#   - photos  -> public/images/<seo-name>.webp   (masters; variants come from scripts/images.mjs)
#   - videos  -> public/videos/<seo-name>.mp4    (muted H.264 loops) + a poster master in public/images
#   - frames  -> .agents/context/frames/          (8 frames + contact sheet per video, for context only)
# Requires ffmpeg and ImageMagick 7 (`magick`). Run from the project root: bash scripts/media-masters.sh
set -euo pipefail

SRC=".agents/context"
IMG="public/images"
VID="public/videos"
mkdir -p "$IMG" "$VID" "$SRC/frames"

master() { magick "$1" "${@:3}" -strip -quality 90 "$IMG/$2.webp"; echo "image  $IMG/$2.webp"; }

# --- Photos (client originals) ---
master "$SRC/WhatsApp Image 2026-11-14 at 09.31.46.jpeg"   gerp-dj-ourense-controladora-denon-dj
master "$SRC/WhatsApp Image 2026-11-14 at 09.31.47.jpeg"   gerp-dj-ourense-cabina-iluminacion-led
# Portrait: blur the private family photos on the wall, crop the "HONOR 400" camera watermark.
master "$SRC/WhatsApp Image 2026-11-14 at 09.31.47 4.jpeg" gerp-dj-ourense-retrato-equipo-sonido \
  -region 300x340+6+300 -blur 0x28 -region 250x260+306+282 -blur 0x28 -region 170x250+570+376 -blur 0x28 +region \
  -gravity north -crop 1200x1480+0+0 +repage

# --- Videos: web loop + poster ---
video() { # $1 source, $2 seo name, $3 start (s), $4 length (s), $5 poster time within the clip (s)
  ffmpeg -v error -y -ss "$3" -t "$4" -i "$SRC/$1" -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
    -movflags +faststart "$VID/$2.mp4"
  ffmpeg -v error -y -ss "$5" -i "$VID/$2.mp4" -frames:v 1 "$IMG/$2.png"
  magick "$IMG/$2.png" -strip -quality 90 "$IMG/$2.webp" && rm "$IMG/$2.png"
  echo "video  $VID/$2.mp4 ($(du -h "$VID/$2.mp4" | cut -f1)) + poster $IMG/$2.webp"
}
video "WhatsApp Video 2026-11-14 at 09.31.39 1.mp4" gerp-dj-fiesta-aldea-ourense    0 11.7 4
video "WhatsApp Video 2026-11-14 at 09.31.46 3.mp4" gerp-dj-sesion-terraza-ourense  5 12   1.5
# Ambient background still (lights only, no people)
ffmpeg -v error -y -ss 30 -i "$SRC/WhatsApp Video 2026-11-14 at 09.31.46 3.mp4" -frames:v 1 "$IMG/tmp.png"
magick "$IMG/tmp.png" -strip -quality 90 "$IMG/gerp-dj-luces-fiesta-ourense.webp" && rm "$IMG/tmp.png"
echo "image  $IMG/gerp-dj-luces-fiesta-ourense.webp"

# --- Context frames (8 per video, evenly spaced, plus a contact sheet) ---
: > "$SRC/frames/INDEX.txt"
i=0
for f in "$SRC"/*.mp4; do
  i=$((i + 1)); d="$SRC/frames/video-$i"; mkdir -p "$d"
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  for k in 0 1 2 3 4 5 6 7; do
    t=$(awk -v d="$dur" -v k="$k" 'BEGIN { printf "%.3f", d * (k + 0.5) / 8 }')
    ffmpeg -v error -y -ss "$t" -i "$f" -frames:v 1 -q:v 3 "$d/frame-$k.jpg"
  done
  magick montage "$d"/frame-*.jpg -tile 4x2 -geometry 424x240+4+4 -background '#111' "$d/contact-sheet.jpg"
  echo "video-$i <- $(basename "$f") (${dur}s)" >> "$SRC/frames/INDEX.txt"
done
echo "frames $SRC/frames ($(wc -l < "$SRC/frames/INDEX.txt" | tr -d ' ') videos)"

# --- Press kit images: JPEG keeps the PDF small (Chrome embeds WebP decoded, JPEG as-is) ---
mkdir -p design/press/img
for m in "$IMG"/*.webp; do
  n=$(basename "$m" .webp)
  [[ "$n" =~ -[0-9]+$ ]] && continue   # skip generated variants
  magick "$m" -resize '1400x1400>' -strip -quality 78 "design/press/img/$n.jpg"
done
echo "press  design/press/img ($(ls design/press/img | wc -l | tr -d ' ') jpg)"
