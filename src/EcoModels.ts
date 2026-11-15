import * as THREE from 'three';

const M = (c: string, flat = true) => new THREE.MeshStandardMaterial({color: c, roughness: 0.8, flatShading: flat});
const sph = new THREE.SphereGeometry(1, 14, 10), cone = new THREE.ConeGeometry(1, 1, 8), cyl = new THREE.CylinderGeometry(1, 1, 1, 8);
type V = [number, number, number];
function P(g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, p: V, s: V, r?: V) { const o = new THREE.Mesh(geo, m); o.position.set(...p); o.scale.set(...s); if (r) o.rotation.set(...r); g.add(o); return o; }

type Q = {c: string; c2?: string; len: number; br: number; leg: number; legR?: number; head: number; snout?: number; ear?: number; earC?: string; tail?: number; tailR?: number; tailUp?: number; tailTip?: string; spots?: string; horns?: number; beard?: boolean; hind?: number};
function quad(q: Q) {
  const g = new THREE.Group(), m = M(q.c), m2 = M(q.c2 || q.c), dark = M('#2b2420'), y = q.leg + q.br * 0.8, lr = q.legR || q.br * 0.22;
  P(g, sph, m, [0, y, 0], [q.len, q.br, q.br * 0.85]);
  P(g, sph, m2, [0, y - q.br * 0.25, 0], [q.len * 0.85, q.br * 0.7, q.br * 0.7]);
  ([[q.len * 0.6, 1], [q.len * 0.6, -1], [-q.len * 0.6, 1], [-q.len * 0.6, -1]] as [number, number][]).forEach(([x, s], i) => { const h = i > 1 && q.hind ? q.leg * q.hind : q.leg; P(g, cyl, m, [x, h / 2, s * q.br * 0.5], [lr, h, lr]); });
  const hx = q.len + q.head * 0.5, hy = y + q.br * 0.45;
  P(g, sph, m, [q.len * 0.8, y + q.br * 0.2, 0], [q.head * 0.8, q.head * 0.9, q.head * 0.7], [0, 0, -0.5]);
  P(g, sph, m, [hx, hy, 0], [q.head, q.head * 0.9, q.head * 0.85]);
  if (q.snout) { P(g, sph, m2, [hx + q.head * 0.8, hy - q.head * 0.2, 0], [q.snout, q.head * 0.45, q.head * 0.45]); P(g, sph, dark, [hx + q.head * 0.8 + q.snout * 0.9, hy - q.head * 0.15, 0], [0.04, 0.04, 0.04]); }
  [-1, 1].forEach(s => { P(g, sph, dark, [hx + q.head * 0.55, hy + q.head * 0.25, s * q.head * 0.5], [0.035, 0.035, 0.035]); if (q.ear) P(g, cone, M(q.earC || q.c), [hx - q.head * 0.2, hy + q.head * 0.8 + q.ear * 0.4, s * q.head * 0.5], [q.head * 0.3, q.ear, q.head * 0.15], [0, 0, 0.15]); });
  if (q.horns) [-1, 1].forEach(s => { const t = new THREE.Mesh(new THREE.TorusGeometry(q.horns!, 0.035, 6, 14, Math.PI * 0.75), M('#4a3b2a')); t.position.set(hx - q.horns! * 0.9, hy + q.head * 0.7, s * q.head * 0.35); t.rotation.set(0, 0, 0.2); g.add(t); });
  if (q.beard) P(g, cone, M('#4a3b2a'), [hx + q.head * 0.4, hy - q.head * 1.0, 0], [0.05, 0.2, 0.05], [Math.PI, 0, 0]);
  if (q.tail) { const a = q.tailUp || 0; P(g, sph, m, [-q.len - q.tail * 0.45 * Math.cos(a), y + q.tail * 0.45 * Math.sin(a), 0], [q.tail * 0.5, q.tailR || 0.05, q.tailR || 0.05], [0, 0, -a]); if (q.tailTip) P(g, sph, M(q.tailTip), [-q.len - q.tail * 0.9 * Math.cos(a), y + q.tail * 0.9 * Math.sin(a), 0], [(q.tailR || 0.05) * 1.6, (q.tailR || 0.05) * 1.3, (q.tailR || 0.05) * 1.3]); }
  if (q.spots) for (let i = 0; i < 22; i++) { const a = i * 2.4, u = -0.8 + ((i * 0.37) % 1) * 1.6; P(g, sph, M(q.spots), [u * q.len, y + Math.cos(a) * q.br * 0.92 * Math.sqrt(1 - u * u * 0.8), Math.sin(a) * q.br * 0.8 * Math.sqrt(1 - u * u * 0.8)], [0.045, 0.045, 0.045]); }
  return g;
}
function bird(c: string, wing: number, beak: string, o: {beakL?: number; pouch?: string; stand?: boolean; belly?: string} = {}) {
  const g = new THREE.Group(), m = M(c), y = o.stand ? 0.42 : 0.5;
  P(g, sph, m, [0, y, 0], [0.38, 0.24, 0.22]); if (o.belly) P(g, sph, M(o.belly), [0.05, y - 0.06, 0], [0.3, 0.19, 0.19]);
  P(g, sph, m, [0.36, y + 0.2, 0], [0.14, 0.14, 0.13]); P(g, cone, M(beak), [0.5 + (o.beakL || 0.14) / 2, y + 0.17, 0], [0.05, o.beakL || 0.14, 0.05], [0, 0, -Math.PI / 2]);
  if (o.pouch) P(g, sph, M(o.pouch), [0.56, y + 0.08, 0], [0.16, 0.08, 0.05]);
  [-1, 1].forEach(s => { P(g, sph, M('#1c1917'), [0.42, y + 0.25, s * 0.1], [0.025, 0.025, 0.025]); if (o.stand) { P(g, sph, m, [-0.02, y + 0.03, s * 0.2], [0.3, 0.16, 0.06]); P(g, cyl, M(beak), [0.02, 0.1, s * 0.08], [0.02, 0.22, 0.02]); } else { const w = P(g, sph, m, [0, y + 0.06, s * (0.2 + wing / 2)], [0.2, 0.03, wing / 2], [s * 0.25, 0, 0]); w.userData.wing = s; } });
  P(g, sph, m, [-0.42, y, 0], [0.2, 0.03, 0.12]);
  return g;
}
function tuft(c: string, n: number, h: number, tip?: string, spread = 0.3) {
  const g = new THREE.Group(), m = M(c), mt = tip ? M(tip) : null;
  for (let i = 0; i < n; i++) { const a = i * 2.4, r = spread * Math.sqrt((i + 0.5) / n), hh = h * (0.7 + ((i * 0.31) % 1) * 0.5), lean = 0.12 + r * 0.9; const b = P(g, cone, m, [Math.cos(a) * r, hh / 2, Math.sin(a) * r], [0.025, hh, 0.025], [Math.sin(a) * lean, 0, -Math.cos(a) * lean]); if (mt && i % 2 === 0) P(g, sph, mt, [b.position.x + Math.cos(a) * lean * hh * 0.5, hh * 0.98, b.position.z + Math.sin(a) * lean * hh * 0.5], [0.03, 0.14, 0.03], [Math.sin(a) * lean, 0, -Math.cos(a) * lean]); }
  return g;
}
export function makeOrganism(name: string): THREE.Group {
  const g = new THREE.Group();
  const add = (o: THREE.Object3D, s = 1, y = 0) => { o.scale.setScalar(s); o.position.y = y; g.add(o); return g; };
  switch (name) {
    case 'Ковыль': return add(tuft('#cdbf78', 34, 1.25, '#f3ecd0', 0.34));
    case 'Альпийские травы': { const t = tuft('#5fa64a', 26, 0.5, undefined, 0.42); [['#f472b6', 0], ['#fde047', 2.1], ['#a78bfa', 4.2], ['#ffffff', 1.2]].forEach(([c, a]) => P(t, sph, M(c as string), [Math.cos(a as number) * 0.25, 0.55, Math.sin(a as number) * 0.25], [0.07, 0.05, 0.07])); return add(t, 1.3); }
    case 'Саксаул': { const t = new THREE.Group(), w = M('#8a7256'), gr = M('#8fa05a'); P(t, cyl, w, [0, 0.35, 0], [0.09, 0.7, 0.09], [0, 0, 0.2]); for (let i = 0; i < 9; i++) { const a = i * 2.4, b = 0.5 + (i % 3) * 0.2, br = new THREE.Group(); br.position.set(-0.06, 0.65, 0); br.rotation.set(Math.sin(a) * b, a, Math.cos(a) * b); P(br, cyl, w, [0, 0.35, 0], [0.03, 0.7, 0.03]); for (let j = 0; j < 4; j++) P(br, cyl, gr, [(j % 2 ? 1 : -1) * 0.1, 0.35 + j * 0.13, 0], [0.014, 0.36, 0.014], [0, 0, (j % 2 ? -1 : 1) * 0.8]); t.add(br); } return add(t, 1.15); }
    case 'Суслик': { const t = new THREE.Group(), m = M('#c9a26a'), l = M('#ead9b0'); P(t, sph, m, [0, 0.36, 0], [0.19, 0.36, 0.18]); P(t, sph, l, [0.06, 0.34, 0], [0.15, 0.3, 0.15]); P(t, sph, m, [0.03, 0.76, 0], [0.15, 0.14, 0.14]); P(t, sph, l, [0.15, 0.72, 0], [0.07, 0.06, 0.07]); [-1, 1].forEach(s => { P(t, sph, M('#1c1917'), [0.12, 0.8, s * 0.09], [0.028, 0.028, 0.028]); P(t, sph, m, [-0.03, 0.87, s * 0.1], [0.04, 0.04, 0.03]); P(t, sph, m, [0.17, 0.46, s * 0.1], [0.09, 0.04, 0.04], [0, 0, -0.5]); P(t, sph, m, [0.06, 0.05, s * 0.12], [0.12, 0.05, 0.07]); }); P(t, sph, m, [-0.24, 0.1, 0], [0.16, 0.05, 0.05], [0, 0, 0.3]); return add(t, 1.25); }
    case 'Степной орёл': return add(bird('#5b4630', 0.95, '#f2b705', {belly: '#6f573c'}), 1.25, 0.9);
    case 'Тушканчик': return add(quad({c: '#d9b98a', c2: '#f3e7cf', len: 0.2, br: 0.15, leg: 0.1, legR: 0.025, hind: 2.6, head: 0.12, snout: 0.06, ear: 0.24, earC: '#e8c8a0', tail: 0.75, tailR: 0.02, tailUp: 0.5, tailTip: '#2b2420'}), 1.5);
    case 'Корсак': return add(quad({c: '#d2a86a', c2: '#f1e2c4', len: 0.42, br: 0.17, leg: 0.3, legR: 0.04, head: 0.15, snout: 0.13, ear: 0.2, tail: 0.6, tailR: 0.1, tailUp: -0.3, tailTip: '#3b2f25'}), 1.25);
    case 'Горный козёл (кийк)': return add(quad({c: '#9a7b56', c2: '#c9b08a', len: 0.48, br: 0.24, leg: 0.42, legR: 0.045, head: 0.15, snout: 0.14, ear: 0.08, tail: 0.12, tailR: 0.04, tailUp: 0.8, horns: 0.3, beard: true}), 1.15);
    case 'Снежный барс': return add(quad({c: '#d9d6cc', c2: '#f4f2ec', len: 0.56, br: 0.2, leg: 0.3, legR: 0.06, head: 0.17, snout: 0.09, ear: 0.07, tail: 0.95, tailR: 0.085, tailUp: 0.25, spots: '#3f3d3a'}), 1.2);
    case 'Водоросли (фитопланктон)': { const t = new THREE.Group(), cs = ['#22c55e', '#84cc16', '#16a34a']; for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 0.5 * Math.sqrt((i + 0.5) / 26); P(t, i % 4 === 0 ? cyl : sph, M(cs[i % 3], false), [Math.cos(a) * r, 0.25 + ((i * 0.37) % 1) * 0.5, Math.sin(a) * r], i % 4 === 0 ? [0.03, 0.18, 0.03] : [0.06, 0.06, 0.06], [a, 0, a]); } return add(t, 1.1); }
    case 'Рачки (зоопланктон)': { const t = new THREE.Group(); for (let k = 0; k < 4; k++) { const s = new THREE.Group(), m = M('#f59e6b', false); for (let i = 0; i < 6; i++) P(s, sph, m, [-i * 0.07, Math.sin(i * 0.5) * 0.09, 0], [0.07 - i * 0.007, 0.055 - i * 0.005, 0.05]); P(s, sph, M('#1c1917'), [0.05, 0.03, 0.04], [0.018, 0.018, 0.018]); P(s, cyl, m, [0.14, 0.06, 0], [0.006, 0.2, 0.006], [0, 0, -1.0]); s.position.set(Math.cos(k * 1.7) * 0.32, 0.3 + (k % 2) * 0.3, Math.sin(k * 1.7) * 0.32); s.rotation.y = k * 1.3; t.add(s); } return add(t, 1.3); }
    case 'Сазан': { const t = new THREE.Group(), m = M('#c9a23c', false); P(t, sph, m, [0, 0.4, 0], [0.5, 0.2, 0.12]); P(t, sph, M('#e9d38a', false), [0.02, 0.33, 0], [0.42, 0.13, 0.1]); P(t, cone, M('#a67c2a'), [-0.6, 0.4, 0], [0.2, 0.26, 0.03], [0, 0, -Math.PI / 2]); P(t, sph, M('#a67c2a'), [-0.02, 0.6, 0], [0.26, 0.07, 0.02]); P(t, sph, M('#a67c2a'), [0.12, 0.24, 0.08], [0.1, 0.05, 0.02], [0, 0, -0.5]); [-1, 1].forEach(s => P(t, sph, M('#1c1917'), [0.36, 0.44, s * 0.08], [0.03, 0.03, 0.02])); t.userData.swim = true; return add(t, 1.35); }
    case 'Пеликан': return add(bird('#f5f3ee', 0.5, '#f59e0b', {beakL: 0.42, pouch: '#fbbf24', stand: true}), 1.6);
    default: { const t = new THREE.Group(); ([[0, 0.22, '#c2410c', 0.2], [0.28, 0.14, '#e7b98a', 0.13], [-0.22, 0.12, '#b45309', 0.11]] as number[][] as any[]).forEach(([x, h, c, r]) => { P(t, cyl, M('#f3ead8'), [x, h / 2, 0.02], [r * 0.25, h, r * 0.25]); P(t, sph, M(c), [x, h, 0.02], [r, r * 0.55, r]); }); for (let i = 0; i < 10; i++) P(t, sph, M('#8b9bb4', false), [Math.cos(i * 2.4) * 0.4, 0.03, Math.sin(i * 2.4) * 0.4], [0.035, 0.02, 0.02], [0, i, 0]); return add(t, 1.5); }
  }
}
