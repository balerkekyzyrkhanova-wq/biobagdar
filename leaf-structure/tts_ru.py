"""Russian narration with Piper (offline). usage: python tts_ru.py lines.json out_dir [voice_model.onnx]
Writes <id>.wav (22.05 kHz, silence trimmed) and dur.json."""
import json, sys, wave, io, numpy as np, soundfile as sf
from piper import PiperVoice
from piper.config import SynthesisConfig
lines = json.load(open(sys.argv[1])); out = sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else '/root/piper-ru/ru_RU-dmitri-medium.onnx'
v = PiperVoice.load(model); durs = {}
for L in lines:
    cfg = SynthesisConfig(length_scale=L.get('speed', 1.05), noise_scale=.6, noise_w_scale=.7)
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w: v.synthesize_wav(L.get('say', L['text']), w, syn_config=cfg)
    buf.seek(0); a, sr = sf.read(buf)
    nz = np.where(np.abs(a) > 0.01)[0]
    a = a[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.08 * sr)]
    sf.write(f"{out}/{L['id']}.wav", a, sr); durs[L['id']] = round(len(a) / sr, 3)
json.dump(durs, open(f'{out}/dur.json', 'w'), indent=1); print(durs, 'total', round(sum(durs.values()), 2))
