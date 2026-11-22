"""Score + foley + voice → out/mix.wav. Everything is synthesised with numpy (no samples).
Reads events.json (exported from the page by core/render/events.mjs) so every sound sits on its frame.
Score: 96 BPM, A dorian, minimal electronic glass palette (glass bells, FM glass plucks, warm pad, tick grid, soft kick, 808)."""
import json, os, sys, numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', '/root/lemo-opuscar'); sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, bp, lp, hp, norm, compress, limit, add, noise

rng = np.random.default_rng(11)
EVJ = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EVJ['dur']; EV = EVJ['ev']
N = int(DUR * SR) + SR
BPM = 96; BEAT = 60 / BPM; BAR = BEAT * 4
SIL = [(12.5, 13.75), (56.8, 57.5)]           # true silences: music and tails cut
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def adsr(d, a=.01, r=.3):
    n = len(t_(d)); e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(min(r, d) * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

# —— instruments ——
def glass_bell(f, d=3.0, v=1.0):
    t = t_(d); x = np.zeros_like(t)
    for k, (m, a, tau) in enumerate([(1, 1, 1.6), (2.76, .5, .9), (5.4, .28, .45), (8.93, .14, .25), (1.5, .12, 1.1)]):
        x += a * np.sin(2 * np.pi * f * m * t + k) * np.exp(-t / (tau * d / 3))
    return x * v * adsr(d, .002, .4)
def fm_pluck(f, d=.6, v=1.0):
    t = t_(d); I = 3.2 * np.exp(-t / .06)
    return np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t / .22) * v * adsr(d, .002, .1)
def pad(fs, d, v=1.0):
    t = t_(d); x = np.zeros_like(t)
    for f in fs:
        for dt in (-.11, 0, .13):   # detuned saw-ish via a few harmonics, low-passed
            ff = f * 2 ** (dt / 12)
            for h in range(1, 6): x += np.sin(2 * np.pi * ff * h * t + rng.random() * 6) / h ** 1.3
    x = lp(x, 1600) * (1 + .15 * np.sin(2 * np.pi * .25 * t))
    return norm(x, .5) * v * adsr(d, 1.2, 1.4)
def kick(v=1.0):
    t = t_(.45); f = 48 + 90 * np.exp(-t / .03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .16) * v
def b808(f, d=.6, v=1.0):
    t = t_(d); ff = f * (1 + .6 * np.exp(-t / .02))
    x = np.sin(2 * np.pi * np.cumsum(ff) / SR); x = np.tanh(1.8 * x) * np.exp(-t / .5)
    return x * v * adsr(d, .003, .12)
def tick(v=1.0):
    t = t_(.04); return bp(noise(.04), 5000, 9000) * np.exp(-t / .006) * v
def shimmer(d, v=1.0):
    t = t_(d); x = bp(noise(d), 3500, 9000, 2) * .4
    for f in (2093, 2637, 3136, 3951): x += .15 * np.sin(2 * np.pi * f * t * (1 + .002 * np.sin(2 * np.pi * 3 * t)))
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * v
def reverse_whoosh(d, v=1.0):
    t = t_(d); x = bp(noise(d), 500, 6000) * (t / d) ** 3
    return x * v
def impact(v=1.0):
    t = t_(2.5); x = .9 * np.sin(2 * np.pi * 42 * t) * np.exp(-t / .5)
    x[:len(t_(1.6))] += glass_bell(1318, 1.6, .7)
    x[:len(t_(.05))] += bp(noise(.05), 2000, 9000) * np.exp(-t_(.05) / .008) * 1.5
    return x * v
def click_cluster(v=1.0):
    x = np.zeros(len(t_(2.2)))
    for i in range(6):
        c = bp(noise(.003), 3000, 5000) * 2 + .3 * np.sin(2 * np.pi * 60 * t_(.003)); s = int(i * .015 * SR); x[s:s + len(c)] += c
    base = 659.25
    for m, a in ((1, 1), (2.76, .5), (5.4, .3)): x += a * np.sin(2 * np.pi * base * m * t_(2.2)) * np.exp(-t_(2.2) / (.9 / m ** .5)) * .5
    x += .8 * np.sin(2 * np.pi * 50 * t_(2.2)) * np.exp(-t_(2.2) / .2)
    return x * v
def friction(d, v=1.0):
    t = t_(d); x = bp(noise(d), 1800, 6000) * (.5 + .5 * np.sin(2 * np.pi * 7 * t) ** 2)
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) * v
def blip(f, v=1.0):
    t = t_(.12); ff = f * (1 + 1.2 * t / .12)
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t / .03) * v
def riser(d, v=1.0):
    t = t_(d); x = bp(noise(d), 800, 7000) * (t / d) ** 2
    x += .3 * np.sin(2 * np.pi * np.cumsum(200 + 1600 * (t / d) ** 2) / SR) * (t / d) ** 2
    return x * v
def squish(d, v=1.0):
    t = t_(d); return lp(noise(d), 900) * np.sin(np.pi * t / d) * v * .8

def stereo(): return np.zeros((N, 2))

# —— score ——
music = stereo()
CH = {  # chord per 2 bars (A dorian): Am9, D9, Cmaj7, Em7
    0: [57, 60, 64, 67, 71], 1: [50, 57, 60, 64, 66], 2: [48, 55, 59, 64, 67], 3: [52, 55, 59, 62, 66]}
ROOT = {0: 45, 1: 38, 2: 36, 3: 40}
chord_at = lambda t: int(t // (BAR * 2)) % 4
# intro shimmer cloud + bells
add(music, shimmer(5.0, .25), 0)
for t, f in ((0.0, 880), (2.5, 659.25), (5.0, 987.77)): add(music, glass_bell(f, 3.2, .35), t, pan=(-.3 if t else .2))
# pad: 5–12.5, 15–56.8, 57.5–end
for a, b in ((5.0, 12.5), (15.0, 56.8), (57.5, DUR)):
    t = a
    while t < b - .1:
        c = chord_at(t); d = min(BAR * 2, b - t) + 1.0
        add(music, pad([mtof(m) for m in CH[c][1:4]], d, .32 if a != 57.5 else .4), t, pan=0)
        t += BAR * 2
# tick grid on 1/8 (5–12.5 quiet, 15–56.8)
for a, b, g in ((5.0, 12.5, .06), (15.0, 56.8, .09)):
    k = 0; t = a
    while t < b: add(music, tick(1), t, g * (1.4 if k % 2 == 0 else .7), pan=(.35 if k % 2 else -.35)); t += BEAT / 2; k += 1
# kick + 808 from 17.5; four on the floor from 42.5
for i in range(int(17.5 / BEAT), int(56.8 / BEAT)):
    t = i * BEAT
    if t >= 42.5 or i % 2 == 0: add(music, kick(1), t, .55)
for bstart in np.arange(17.5, 56.8, BAR):
    c = chord_at(bstart)
    for bt, dd in ((0, .9), (1.5, .4), (2.5, .9)):
        tt = bstart + bt * BEAT
        if tt < 56.6: add(music, b808(mtof(ROOT[c]), dd * BEAT * 1.6, .38), tt)
# FM glass arpeggio 30–56.8 (thin) and 42.5–56.8 (full)
k = 0; t = 30.0
while t < 56.75:
    c = chord_at(t); notes = CH[c]; m = notes[[0, 2, 4, 3, 1, 3][k % 6]] + 12
    add(music, fm_pluck(mtof(m), .6, .22 if t >= 42.5 else .12), t, pan=.4 * np.sin(k * 1.3)); t += BEAT / 2; k += 1
# four-note glass motif on the flash and at the end
for i, m in enumerate((81, 76, 79, 83)): add(music, glass_bell(mtof(m), 2.6, .3), 45.0 + i * BEAT, pan=-.3 + .2 * i)
for i, m in enumerate((81, 76, 79, 74)): add(music, glass_bell(mtof(m), 3.4, .3), 60.0 + i * BEAT * 2, pan=-.2 + .15 * i)
# cut the silences (tails too)
def gate(buf, a, b, fade=.03):
    s, e = int(a * SR), int(b * SR); f = int(fade * SR)
    buf[s - f:s] *= np.linspace(1, 0, f)[:, None]; buf[s:e] = 0; buf[e:e + f] *= np.linspace(0, 1, f)[:, None]
for a, b in SIL: gate(music, a, b)

# —— foley from the page's events ——
fol = stereo()
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'sweep': add(fol, shimmer(e['d'], .5), t, pan=0)
    elif ty == 'ding': add(fol, glass_bell(1760 if e.get('id') != 'end' else 1318.5, 1.6, .35), t, pan=.25)
    elif ty == 'reverse': add(fol, reverse_whoosh(e['d'], .6), t)
    elif ty == 'cut': add(fol, impact(1.0), t)
    elif ty == 'cutin': add(fol, lp(noise(.5), 3000) * np.exp(-t_(.5) / .12) * .3, t)
    elif ty == 'explode':
        add(fol, friction(e['d'], .25), t)
        for i, dt in enumerate((0, .25, .5, .75)): add(fol, blip(900 + 200 * i, .3), t + dt, pan=(-.4 + .25 * i))
    elif ty == 'stoma': add(fol, squish(e['d'], .5), t)
    elif ty == 'sunrise': add(fol, riser(e['d'] + .2, .5), t - .2)
    elif ty == 'flash': add(fol, glass_bell(1760, 2.2, .45), t); add(fol, glass_bell(2637, 1.6, .25), t, pan=.3)
    elif ty == 'bubbles':
        for i in range(36):
            tt = t + i * e['d'] / 36 + rng.random() * .1
            if not (56.8 <= tt < 57.5): add(fol, blip(500 + rng.random() * 900, .16), tt, pan=rng.uniform(-.6, .6))
    elif ty == 'snap': add(fol, click_cluster(1.0), t)
    elif ty == 'tick': add(fol, tick(1) * .6, t + .02, pan=.2)
for a, b in SIL: gate(fol, a, b, .01)
# re-add the sounds that live inside the silences (the reverse whooshes) after gating
for e in EV:
    if e['type'] == 'reverse': add(fol, reverse_whoosh(e['d'], .6), e['t'])
# room tone (very low)
room = lp(noise(DUR + 1), 220) * .012; fol[:len(room), 0] += room[:N]; fol[:len(room), 1] += room[:N]

# —— voice ——
vo = np.zeros(N); vt = []
for e in EV:
    if e['type'] != 'vo': continue
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav'))
    if x.ndim > 1: x = x.mean(1)
    x = soxr.resample(x, sr, SR); s = int(e['t'] * SR); vo[s:s + len(x)] += x[:N - s]; vt.append((e['t'], e['t'] + len(x) / SR))
vo = hp(vo, 90); vo = compress(norm(vo, .9), thr=.3, ratio=3.0)
# ducking envelope under the voice
duck = np.ones(N); tt = np.arange(N) / SR
for a, b in vt: duck = np.minimum(duck, np.where((tt > a - .15) & (tt < b + .25), 0, 1))
from scipy.ndimage import uniform_filter1d
duck = uniform_filter1d(duck.astype(float), int(.2 * SR))
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1
mus = music * (.5 / rms(music[:, 0])) * .1
fo = fol * (.5 / rms(fol[:, 0])) * .14
mus *= (10 ** (-12 / 20) + (1 - 10 ** (-12 / 20)) * duck)[:, None]
fo *= (10 ** (-6 / 20) + (1 - 10 ** (-6 / 20)) * duck)[:, None]
v = vo * (.5 / rms(vo)) * .32
mix = mus + fo + v[:, None]
# low-end check: keep 20–120 Hz modest
lowb = lp(mix[:, 0], 120); print('low/all rms dB', round(20 * np.log10(rms(lowb) / rms(mix[:, 0])), 1))
mix = np.stack([limit(mix[:, 0], .9), limit(mix[:, 1], .9)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR, subtype='PCM_24'); print('mix.wav', round(len(mix) / SR, 2), 's')
