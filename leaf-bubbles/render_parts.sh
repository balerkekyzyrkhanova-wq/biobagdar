#!/bin/sh
# render the picture in 3 pieces (15 s each), then join them losslessly
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; cd "$LIB"
mkdir -p "$HERE/out/parts"
for i in 0 1 2; do
  t0=$((i*15)); f="$HERE/out/parts/p$i.mp4"
  [ -f "$f" ] && { echo "skip p$i"; continue; }
  LEMO_ANGLE=${LEMO_ANGLE:-default} node core/render/video.mjs "$HERE" --fps 24 --workers ${WORKERS:-3} --q "ss=1&t0=$t0&dur=15" --out "$f.tmp.mp4"
  mv "$f.tmp.mp4" "$f"; echo "done p$i $(date +%T)"
done
cd "$HERE/out/parts" && printf "file 'p0.mp4'\nfile 'p1.mp4'\nfile 'p2.mp4'\n" > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy "$HERE/out/video.mp4" && echo "video ready"
