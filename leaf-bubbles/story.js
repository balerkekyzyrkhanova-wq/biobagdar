// Timeline: 96 BPM, bar = 2.5 s. One source for picture, sound and text.
export const BPM = 96, BEAT = 60 / BPM, BAR = BEAT * 4;
export const DUR = 45;

export const SHOTS = [
  [0, 6, 'wide'],
  [6, 10, 'thermo'],
  [10, 15.6, 'leaf'],
  [15.6, 25, 'side'],
  [25, 30, 'top'],
  [30, 35, 'bottom'],
  [35, DUR, 'final'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];

export const T = {
  title: [0.6, 5.6],
  safety: [1.6, 5.6],
  showTop: [10.0, 12.5],     // the leaf faces the camera with its upper side
  flip: [12.5, 13.4],        // turned over: lower side
  toBeaker: [14.0, 14.9],
  dip: 15.5,                 // the leaf touches the water
  sink: [14.9, 16.1],
  bubbles: 16.3,             // first bubbles appear
  task: [16.4, 34.6],        // reminder chip
  question: [35.4, DUR],
  count: [36.0, 44.0],       // 8 s countdown
  think: [41.6, DUR],
};

// on-screen labels: text, time, anchor, leader offset (px at 1080p)
export const LABELS = [
  { id: 'temp', text: 'Температура воды ≈ 80 °C', t: [6.6, 9.8], at: 'display', dx: -340, dy: -150 },
  { id: 'upper', text: 'Верхняя сторона', t: [10.5, 12.6], at: 'faceTop', dx: 300, dy: -170 },
  { id: 'lower', text: 'Нижняя сторона', t: [13.2, 14.6], at: 'faceBottom', dx: 300, dy: -170 },
  { id: 'sideU', text: 'Верхняя сторона', t: [18.0, 24.7], at: 'sideTop', dx: 340, dy: -200 },
  { id: 'sideL', text: 'Нижняя сторона', t: [18.6, 24.7], at: 'sideBottom', dx: 340, dy: 190 },
  { id: 'macroU', text: 'Верхняя сторона', t: [25.5, 29.7], at: 'none', dx: 0, dy: 0, fixed: true },
  { id: 'macroL', text: 'Нижняя сторона', t: [30.5, 34.7], at: 'none', dx: 0, dy: 0, fixed: true },
];

export const SFX = [
  ...LABELS.map(l => ({ t: l.t[0], type: 'ding', id: l.id })),
  { t: T.flip[0], type: 'whoosh', d: .9 },
  { t: T.dip, type: 'splash' },
  { t: T.bubbles, type: 'fizz', d: DUR - T.bubbles },
  { t: 25.0, type: 'cut' }, { t: 30.0, type: 'cut' }, { t: 35.0, type: 'cut' },
  { t: T.question[0], type: 'question' },
  ...Array.from({ length: 8 }, (_, i) => ({ t: T.count[0] + i, type: 'tick', n: 8 - i })),
  { t: T.count[1] - .01, type: 'end' },
];
