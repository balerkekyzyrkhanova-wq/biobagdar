#!/bin/sh
# one command: picture → events → subtitles → mix → master
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
cd "$LIB"
node core/render/events.mjs "$HERE"
node "$HERE/subs.mjs" "$HERE" && "$LIB/.venv/bin/python" core/render/srt.py "$HERE/subs.json" "$HERE/subtitles_ru.srt"
"$HERE/render_parts.sh"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/leaf-structure.mp4" 24 0
# voices: "$LIB/.venv/bin/python" "$HERE/tts_ru.py" "$HERE/lines.json" "$HERE/voices" /path/to/ru_RU-dmitri-medium.onnx
