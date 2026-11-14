#!/usr/bin/env bash
# Builds SEO-named masters from the raw client media in .agents/context:
#   - photos  -> public/images/<seo-name>.webp   (masters; variants come from scripts/images.mjs)
#   - videos  -> .agents/cdn/gerp-dj/videos/<seo-name>.mp4 (lossless remux, uploaded to https://cdn.gerp-dj.com/videos/)
#                + a poster master per video in public/images/<seo-name>.webp
#   - frames  -> .agents/context/frames/          (scripts/video-frames.sh: frames + contact sheet per video, context only)
# Requires ffmpeg and ImageMagick 7 (`magick`). Run from the project root: bash scripts/media-masters.sh
set -euo pipefail

SRC=".agents/context"
IMG="public/images"
mkdir -p "$IMG" "$SRC/frames"

master() { magick "$1" "${@:3}" -strip -quality 90 "$IMG/$2.webp"; echo "image  $IMG/$2.webp"; }

# --- Photos (client originals) ---
master "$SRC/WhatsApp Image 2026-11-14 at 09.31.46.jpeg"   gerp-dj-ourense-controladora-denon-dj
master "$SRC/WhatsApp Image 2026-11-14 at 09.31.47.jpeg"   gerp-dj-ourense-cabina-iluminacion-led
# Portrait: blur the private family photos on the wall, crop the "HONOR 400" camera watermark.
master "$SRC/WhatsApp Image 2026-11-14 at 09.31.47 4.jpeg" gerp-dj-ourense-retrato-equipo-sonido \
  -region 300x340+6+300 -blur 0x28 -region 250x260+306+282 -blur 0x28 -region 170x250+570+376 -blur 0x28 +region \
  -gravity north -crop 1200x1480+0+0 +repage
# Full home setup: blur the three family photos on the wall, crop the "HONOR 400" camera watermark.
master "$SRC/WhatsApp Image 2026-11-14 at 22.05.19.jpeg" gerp-dj-ourense-equipo-sonido-luces \
  -region 175x235+535+280 -blur 0x28 -region 235x232+722+198 -blur 0x28 -region 240x285+985+235 -blur 0x28 +region \
  -gravity north -crop 1600x1100+0+0 +repage

# --- CDN videos (Cloudflare R2, https://cdn.gerp-dj.com/videos/): SEO-named, lossless remux with faststart ---
# The site streams them from the CDN (src/config/site.ts); upload these files after regenerating.
# Skipped duplicates: 19.42.05 = 09.31.46 2 (byte-identical); 09.31.46 = 09.31.46 3 (same clip, lower bitrate).
# Privacy before publishing: home-setup clips show family photos on the wall; 19.42.07 is a close-up of a guest.
CDN="$SRC/../cdn/gerp-dj/videos"
mkdir -p "$CDN"
cdn() { ffmpeg -v error -y -i "$SRC/WhatsApp Video 2026-11-14 at $1.mp4" -map 0 -c copy -movflags +faststart "$CDN/$2.mp4"; echo "cdn    $CDN/$2.mp4"; }
cdn "09.31.39 1" gerp-dj-fiesta-aldea-ourense
cdn "09.31.39"   gerp-dj-montaje-luces-casa-ourense
cdn "09.31.46 2" gerp-dj-sesion-terraza-microfono-ourense
cdn "09.31.46 3" gerp-dj-sesion-terraza-ourense
cdn "19.12.38"   gerp-dj-fiesta-sala-ourense-vertical
cdn "19.12.43"   gerp-dj-sesion-pub-ourense-vertical
cdn "19.14.55"   gerp-dj-mezcla-controladora-ourense-vertical
cdn "19.15.02"   gerp-dj-sesion-luces-casa-ourense
cdn "19.42.07"   gerp-dj-fiesta-terraza-invitados-ourense
cdn "22.05.57"   gerp-dj-montaje-equipo-casa-ourense-vertical

# --- Video posters (from the CDN copies): one still per video, at a sharp frame without flash or motion blur ---
poster() { # $1 seo name, $2 time (s), extra ImageMagick options
  ffmpeg -v error -y -ss "$2" -i "$CDN/$1.mp4" -frames:v 1 "$IMG/$1.png"
  master "$IMG/$1.png" "$1" "${@:3}" && rm "$IMG/$1.png"
}
poster gerp-dj-fiesta-aldea-ourense                 4
poster gerp-dj-sesion-terraza-ourense               6.5
poster gerp-dj-sesion-terraza-microfono-ourense     16.5
poster gerp-dj-sesion-pub-ourense-vertical          14.5
poster gerp-dj-fiesta-sala-ourense-vertical         20.3
poster gerp-dj-mezcla-controladora-ourense-vertical 53.9
poster gerp-dj-sesion-luces-casa-ourense            161.4
poster gerp-dj-fiesta-terraza-invitados-ourense     4.25
# Home setup clips: blur the family photos on the wall.
poster gerp-dj-montaje-luces-casa-ourense           4.6 \
  -region 64x106+219+149 -blur 0x14 -region 104x88+329+135 -blur 0x14 -region 92x104+449+161 -blur 0x14 +region
poster gerp-dj-montaje-equipo-casa-ourense-vertical 31 \
  -region 104x120+80+310 -blur 0x14 -region 116x104+185+292 -blur 0x14 -region 104x122+305+308 -blur 0x14 +region

# Ambient background still (lights only, no people)
ffmpeg -v error -y -ss 30 -i "$SRC/WhatsApp Video 2026-11-14 at 09.31.46 3.mp4" -frames:v 1 "$IMG/tmp.png"
magick "$IMG/tmp.png" -strip -quality 90 "$IMG/gerp-dj-luces-fiesta-ourense.webp" && rm "$IMG/tmp.png"
echo "image  $IMG/gerp-dj-luces-fiesta-ourense.webp"

# --- Context frames (see scripts/video-frames.sh) ---
bash scripts/video-frames.sh

# --- Press kit images: JPEG keeps the PDF small (Chrome embeds WebP decoded, JPEG as-is) ---
mkdir -p design/press/img
for m in "$IMG"/*.webp; do
  n=$(basename "$m" .webp)
  [[ "$n" =~ -[0-9]+$ ]] && continue   # skip generated variants
  magick "$m" -resize '1400x1400>' -strip -quality 78 "design/press/img/$n.jpg"
done
echo "press  design/press/img ($(ls design/press/img | wc -l | tr -d ' ') jpg)"
