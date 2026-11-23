"""Score + foley → out/mix.wav, all synthesised with numpy (no samples). No voice in this film.
Reads events.json (exported from the page by core/render/events.mjs) so each sound sits on its frame.
Score: 96 BPM, D major, quiet music-box + pad; it thins out under the question so the countdown ticks and the fizz carry."""
import json, os, sys, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', '/root/lemo-opuscar'); sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, bp, lp, hp, norm, compress, limit, add, noise

rng = np.random.default_rng(23)
EVJ = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EVJ['dur']; EV = EVJ['ev']
N = int(DUR * SR) + SR
BPM = 96; BEAT = 60 / BPM; BAR = BEAT * 4
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
ev = lambda ty: [e for e in EV if e['type'] == ty]
DIP = ev('splash')[0]['t']; BUB = ev('fizz')[0]['t']; Q = ev('question')[0]['t']

def adsr(d, a=.01, r=.3):
    n = len(t_(d)); e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(min(r, d) * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def bell(f, d=2.5, v=1.0):
    t = t_(d); x = np.zeros_like(t)
    for k, (m, a, tau) in enumerate([(1, 1, 1.3), (2.0, .35, .8), (3.01, .18, .45), (4.2, .08, .25)]):
        x += a * np.sin(2 * np.pi * f * m * t + k) * np.exp(-t / (tau * d / 2.5))
    return x * v * adsr(d, .002, .3)
def pluck(f, d=.9, v=1.0):
    t = t_(d); return (np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)) * np.exp(-t / .35) * v * adsr(d, .003, .1)
def pad(fs, d, v=1.0):
    t = t_(d); x = np.zeros_like(t)
    for f in fs:
        for dt in (-.08, .09):
            ff = f * 2 ** (dt / 12)
            for h in range(1, 5): x += np.sin(2 * np.pi * ff * h * t + rng.random() * 6) / h ** 1.5
    return norm(lp(x, 1400), .5) * v * adsr(d, 1.5, 1.5)
def tick(v=1.0):
    t = t_(.05); return (bp(noise(.05), 2500, 7000) * np.exp(-t / .008) + .4 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t / .01)) * v
def whoosh(d, v=1.0):
    t = t_(d); return bp(noise(d), 400, 3500) * np.sin(np.pi * t / d) ** 2 * v
def splash(v=1.0):
    d = 1.6; t = t_(d); x = bp(noise(d), 300, 6000) * np.exp(-t / .18) * 1.2
    x += lp(noise(d), 500) * np.exp(-t / .1) * 1.5                         # the plop
    for i in range(30):                                                       # droplets
        s = int((.05 + rng.random() * .9) * SR); f = 900 + rng.random() * 2200; tt = t_(.05)
        x[s:s + len(tt)] += np.sin(2 * np.pi * np.cumsum(f * (1 + 2.5 * tt / .05)) / SR) * np.exp(-tt / .012) * .25 * rng.random()
    return x * v
def stereo(): return np.zeros((N, 2))
tt_all = np.arange(N) / SR

# —— score ——
music = stereo()
CH = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 69]]   # Dmaj7, Bm7, Gmaj7, A
chord_at = lambda t: CH[int(t // (BAR * 2)) % 4]
t = 0.0
while t < DUR:
    add(music, pad([mtof(m - 12) for m in chord_at(t)[:3]], BAR * 2 + 1.2, .3), t); t += BAR * 2
# music-box line from bar 2, sparse; a little denser while we watch
k = 0; t = 2.5
while t < DUR - 1:
    dense = 16 <= t < 35
    if dense or k % 2 == 0:
        c = chord_at(t); m = c[[0, 2, 1, 3, 2, 1][k % 6]] + 12
        add(music, pluck(mtof(m), .9, .25), t, pan=.35 * np.sin(k * 1.1))
    t += BEAT; k += 1
# music level: thins under the question and countdown
lvl = np.interp(tt_all, [0, Q - .3, Q + .6, DUR - 1.2, DUR], [1, 1, .38, .38, .0])
music *= lvl[:, None]

# —— foley ——
fol = stereo()
# hot water simmer + hot-plate hum (whole film), a little louder in the close shots inside the beaker
sim = bp(noise(DUR + 1), 250, 2500) * .25 * (1 + .3 * np.sin(2 * np.pi * .3 * t_(DUR + 1)))
crack = np.zeros(len(sim))
for i in range(int(DUR * 7)):
    s = int(rng.random() * DUR * SR); d = t_(.02); crack[s:s + len(d)] += bp(noise(.02), 1500, 5000) * np.exp(-d / .004) * rng.random() * .5
hum = .05 * np.sin(2 * np.pi * 100 * t_(DUR + 1)) + .02 * np.sin(2 * np.pi * 200 * t_(DUR + 1))
bed = (sim + crack + hum)[:N]
fol[:len(bed), 0] += bed; fol[:len(bed), 1] += bed
# fizz: tiny pops whose density follows the bubbles; louder on the lower-side close-up, quieter on the upper side
def fizz_gain(t):
    g = 1 - np.exp(-(t - BUB) / 3.5) if t > BUB else 0
    if 25 <= t < 30: g *= .35
    elif 30 <= t < 35: g *= 1.6
    return g
t = BUB
while t < DUR:
    g = fizz_gain(t)
    if g > 0:
        d = t_(.018); f = 2500 + rng.random() * 6000
        p = (bp(noise(.018), f * .7, min(f * 1.3, 20000)) * np.exp(-d / .003) + .3 * np.sin(2 * np.pi * f * d) * np.exp(-d / .004)) * (.25 + .5 * rng.random()) * g
        add(fol, p, t, .5, pan=rng.uniform(-.7, .7))
    t += 1 / (8 + 55 * max(g, .05))
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'ding': add(fol, bell(1568, 1.6, .22), t, pan=.2)
    elif ty == 'whoosh': add(fol, whoosh(e['d'], .35), t)
    elif ty == 'splash': add(fol, splash(1.0), t - .03)
    elif ty == 'cut': add(fol, lp(noise(.3), 2500) * np.exp(-t_(.3) / .06) * .12, t)
    elif ty == 'question':
        for i, m in enumerate((74, 78, 81)): add(fol, bell(mtof(m), 2.4, .3), t + i * BEAT / 2, pan=-.2 + .2 * i)
    elif ty == 'tick': add(fol, tick(.6 if e.get('n', 0) > 3 else .8), t)
    elif ty == 'end':
        for i, m in enumerate((62, 69, 74, 78)): add(fol, bell(mtof(m), 3.0, .28), t + i * .04)

rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1
mus = music * (.5 / rms(music[:, 0])) * .16
fo = fol * (.5 / rms(fol[:, 0])) * .2
mix = mus + fo
fade = np.interp(tt_all, [0, .3, DUR - .8, DUR], [0, 1, 1, 0]); mix *= fade[:, None]
mix = np.stack([limit(mix[:, 0], .9), limit(mix[:, 1], .9)], 1)[:int(DUR * SR)]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix, SR, subtype='PCM_24'); print('mix.wav', round(len(mix) / SR, 2), 's')
