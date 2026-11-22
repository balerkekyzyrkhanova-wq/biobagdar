// Timeline: 96 BPM, bar = 2.5 s. Single source of truth for picture, score, foley and subtitles.
export const BPM = 96, BEAT = 60 / BPM, BAR = BEAT * 4;
export const DUR = 67.5;   // 27 bars

// shots: [t0, t1, name]
export const SHOTS = [
  [0, 5, 'hook'],
  [5, 12.5, 'outer'],
  [12.5, 15, 'cut'],
  [15, 30, 'layers'],
  [30, 37.5, 'bundle'],
  [37.5, 42.5, 'stoma'],
  [42.5, 50, 'photo'],
  [50, 57.5, 'flow'],
  [57.5, 60, 'snap'],
  [60, DUR, 'end'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

export const T = {
  title: [0.6, 4.7],
  sweep1: [0.5, 2.1], sweep2: [2.6, 4.3],
  cut: 13.75,               // the light blade slices the leaf (beat)
  explode: [15.0, 17.5],    // layers float apart
  stomaOpen: [38.75, 40.0],
  sun: 45.0,                // chloroplasts flash (downbeat, bar 19)
  formula: [46.0, 52.0],
  silence: [56.8, 57.5],
  snap: 57.5,               // layers snap shut (downbeat, bar 24)
  endTitle: [63.6, DUR],
};

// narration: start times; texts are in lines.json
export const VO = [
  { id: 'v01', t: 1.0 },
  { id: 'v02', t: 5.5 },
  { id: 'v04', t: 13.9 },
  { id: 'v05', t: 15.6 },
  { id: 'v06', t: 21.4 },
  { id: 'v07', t: 26.3 },
  { id: 'v08', t: 31.6 },
  { id: 'v09', t: 37.6 },
  { id: 'v10', t: 42.8 },
  { id: 'v11', t: 45.3 },
  { id: 'v12', t: 51.2 },
  { id: 'v13', t: 58.2 },
];

// labels: id, text, shown [t0, t1], anchor key (resolved in main.js), side of the leader
export const LABELS = [
  { id: 'petiole', text: 'Черешок', t: [6.3, 12.3], at: 'petiole', dx: -230, dy: 120 },
  { id: 'blade', text: 'Листовая пластинка', t: [7.3, 12.3], at: 'blade', dx: 210, dy: -170 },
  { id: 'veins', text: 'Жилки', t: [8.6, 12.3], at: 'veins', dx: 260, dy: 140 },
  { id: 'cuticle', text: 'Верхняя кожица', t: [16.2, 29.6], at: 'upperEpi', dx: -300, dy: -90 },
  { id: 'lower', text: 'Нижняя кожица', t: [17.6, 29.6], at: 'lowerEpi', dx: -300, dy: 80 },
  { id: 'palisade', text: 'Столбчатая ткань', t: [21.6, 29.6], at: 'palisade', dx: 330, dy: -120 },
  { id: 'spongy', text: 'Губчатая ткань', t: [26.5, 29.6], at: 'spongy', dx: 330, dy: 110 },
  { id: 'xylem', text: 'Ксилема · вода', t: [32.6, 37.3], at: 'xylem', dx: -320, dy: -150 },
  { id: 'phloem', text: 'Флоэма · сахар', t: [34.6, 37.3], at: 'phloem', dx: -320, dy: 150 },
  { id: 'stoma', text: 'Устьице', t: [38.2, 42.3], at: 'stoma', dx: 300, dy: -150 },
  { id: 'chloro', text: 'Хлоропласты', t: [43.0, 49.8], at: 'chloro', dx: 320, dy: -140 },
];

// beat helpers
export const bar = (n, beat = 0) => n * BAR + beat * BEAT;

// light pulses along the vascular tubes (water up the xylem, sugar out along the phloem): times of launch
export const XYLEM_PULSES = [];
export const PHLOEM_PULSES = [];
for (let b = 0; b < 12; b++) { XYLEM_PULSES.push(50 + b * BEAT); if (b % 2 === 1) PHLOEM_PULSES.push(50 + b * BEAT); }
// pulses along the leaf veins in the hook and the ending
export const VEIN_PULSES = [0.0, 1.25, 2.5, 3.75, 6.25, 8.75, 10.0, 11.25, 60.0, 61.25, 62.5, 63.75, 65.0, 66.25];

// sound / cue events
export const SFX = [
  { t: T.sweep1[0], type: 'sweep', d: T.sweep1[1] - T.sweep1[0] },
  { t: T.sweep2[0], type: 'sweep', d: T.sweep2[1] - T.sweep2[0] },
  ...LABELS.map(l => ({ t: l.t[0], type: 'ding', id: l.id })),
  { t: T.cut - 0.7, type: 'reverse', d: 0.7 },
  { t: T.cut, type: 'cut' },
  { t: 15.0, type: 'cutin' },
  { t: T.explode[0], type: 'explode', d: 2.5 },
  { t: T.stomaOpen[0], type: 'stoma', d: 1.25 },
  { t: T.sun - 0.4, type: 'sunrise', d: 0.4 },
  { t: T.sun, type: 'flash' },
  { t: 50.0, type: 'bubbles', d: 7.0 },
  { t: T.snap - 0.6, type: 'reverse', d: 0.6 },
  { t: T.snap, type: 'snap' },
  { t: 60.0, type: 'cutin' },
  { t: T.endTitle[0], type: 'ding', id: 'end' },
  ...XYLEM_PULSES.map(t => ({ t, type: 'tick', k: 'x' })),
];
