#!/usr/bin/env bash
# Context frames for every client video in .agents/context (for understanding the footage, not for the site):
# ~1 frame per 10 s (min 8, max 24), evenly spaced, plus a contact sheet per video. Byte-identical duplicates are
# indexed as such and not extracted again. Run from the project root: bash scripts/video-frames.sh (bash 3.2 safe).
set -euo pipefail

SRC=".agents/context"
OUT="$SRC/frames"
mkdir -p "$OUT"
: > "$OUT/INDEX.txt"
seen=$(mktemp)
trap 'rm -f "$seen"' EXIT

i=0
for f in "$SRC"/*.mp4; do
  i=$((i + 1))
  name=$(basename "$f")
  sum=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | cut -d' ' -f1)
  first=$(awk -v s="$sum" '$1 == s { print $2; exit }' "$seen")
  if [[ -n "$first" ]]; then
    rm -rf "$OUT/video-$i"
    echo "video-$i <- $name (duplicate of $first)" >> "$OUT/INDEX.txt"
    continue
  fi
  echo "$sum video-$i" >> "$seen"

  read -r w h dur < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration \
    -of default=nw=1:nk=1 "$f" | tr '\n' ' '; echo)
  n=$(awk -v d="$dur" 'BEGIN { n = int(d / 10 + 0.999); print (n < 8 ? 8 : (n > 24 ? 24 : n)) }')
  d="$OUT/video-$i"
  rm -rf "$d" && mkdir -p "$d"
  for ((k = 0; k < n; k++)); do
    t=$(awk -v d="$dur" -v k="$k" -v n="$n" 'BEGIN { printf "%.3f", d * (k + 0.5) / n }')
    ffmpeg -v error -y -ss "$t" -i "$f" -frames:v 1 -q:v 3 "$d/frame-$(printf '%02d' "$k").jpg"
  done
  cols=$([[ "$h" -gt "$w" ]] && echo 6 || echo 4) # portrait clips get narrower tiles
  magick montage "$d"/frame-*.jpg -tile "${cols}x" -geometry 'x240+4+4' -background '#111' "$d/contact-sheet.jpg"
  echo "video-$i <- $name (${dur}s, ${w}x${h}, $n frames)" >> "$OUT/INDEX.txt"
done
echo "frames $OUT ($i videos)"
