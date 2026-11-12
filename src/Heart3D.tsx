import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const BLUE = '#3b82f6', RED = '#ef4444', MIX = '#a855f7';
type V3 = [number, number, number];
type Seg = {pts: V3[]; c0: string; c1: string; vessel?: string; exch?: boolean; label?: string};
type Step = {title: string; text: string; segs: number[]; chambers: string[]};
type Chamber = {key: string; name: string; pos: V3; r: V3; type: 'atrium' | 'ventricle'; blood: string; rot?: V3};
type Organ = {kind: 'body' | 'lungs' | 'gills'; pos: V3; name: string};
type Model = {name: string; chambers: Chamber[]; organs: Organ[]; segs: Seg[]; loops: number[][]; steps: Step[]; septa: {pos: V3; size: V3}[]; summary: string};

const TOP_VEIN: V3[] = [[-3.3, 0.1, 0], [-2.8, 2.0, 0.2], [-1.4, 2.1, 0.15], [-1.05, 1.15, 0.15]];
const PULM_VEINS: V3[] = [[2.8, 2.6, 0], [2.2, 2.1, -0.2], [1.05, 1.1, -0.2]];
const PULM_ART_FROM_RV: V3[] = [[-0.85, -0.45, 0.3], [-0.2, 0.7, 0.55], [0.2, 2.3, 0.55], [1.6, 3.0, 0.3], [2.8, 2.6, 0]];
const AORTA_DOWN: V3[] = [[0.95, -0.7, -0.05], [1.7, -1.1, -0.4], [0.2, -2.7, -0.4], [-2.2, -2.5, -0.2], [-3.3, -0.5, 0]];

const MODELS: Record<string, Model> = {
  mam: {
    name: 'Млекопитающее и птица', summary: 'Четыре камеры и полная перегородка: венозная и артериальная кровь не смешиваются. Два круга кровообращения: малый (сердце → лёгкие → сердце) и большой (сердце → тело → сердце).',
    chambers: [
      {key: 'RA', name: 'Правое предсердие', pos: [-1.05, 0.95, 0.15], r: [0.8, 0.62, 0.7], type: 'atrium', blood: BLUE},
      {key: 'LA', name: 'Левое предсердие', pos: [1.05, 0.95, -0.2], r: [0.8, 0.62, 0.7], type: 'atrium', blood: RED},
      {key: 'RV', name: 'Правый желудочек', pos: [-0.85, -0.55, 0.3], r: [0.85, 1.1, 0.75], type: 'ventricle', blood: BLUE},
      {key: 'LV', name: 'Левый желудочек', pos: [0.95, -0.7, -0.05], r: [0.95, 1.25, 0.85], type: 'ventricle', blood: RED},
    ],
    organs: [{kind: 'body', pos: [-3.5, -0.2, 0], name: 'Тело'}, {kind: 'lungs', pos: [2.9, 2.6, 0], name: 'Лёгкие'}],
    septa: [{pos: [0, 0.95, 0], size: [0.07, 1.2, 1.0]}, {pos: [0, -0.65, 0.05], size: [0.09, 1.9, 1.2]}],
    segs: [
      {pts: TOP_VEIN, c0: BLUE, c1: BLUE, vessel: '#4a78d8', label: 'полые вены'},
      {pts: [[-1.05, 0.95, 0.15], [-0.95, 0.2, 0.25], [-0.85, -0.45, 0.3]], c0: BLUE, c1: BLUE},
      {pts: PULM_ART_FROM_RV, c0: BLUE, c1: RED, vessel: '#4a78d8', exch: true, label: 'лёгочная артерия'},
      {pts: PULM_VEINS, c0: RED, c1: RED, vessel: '#d94b4b', label: 'лёгочные вены'},
      {pts: [[1.05, 0.95, -0.2], [1.0, 0.2, -0.1], [0.95, -0.7, -0.05]], c0: RED, c1: RED},
      {pts: AORTA_DOWN, c0: RED, c1: BLUE, vessel: '#d94b4b', exch: true, label: 'аорта'},
    ],
    loops: [[0, 1, 2, 3, 4, 5]],
    steps: [
      {title: 'Тело → правое предсердие', text: 'Венозная кровь (бедная кислородом) по полым венам возвращается от тела в правое предсердие.', segs: [0], chambers: ['RA']},
      {title: 'Правое предсердие → правый желудочек', text: 'Предсердие сокращается и через клапан проталкивает кровь в правый желудочек.', segs: [1], chambers: ['RA', 'RV']},
      {title: 'Правый желудочек → лёгкие', text: 'Желудочек выталкивает кровь по лёгочной артерии в лёгкие. Там она отдаёт углекислый газ и насыщается кислородом.', segs: [2], chambers: ['RV']},
      {title: 'Лёгкие → левое предсердие', text: 'Артериальная кровь (богатая кислородом) по лёгочным венам поступает в левое предсердие.', segs: [3], chambers: ['LA']},
      {title: 'Левое предсердие → левый желудочек', text: 'Кровь переходит через клапан в самый мощный отдел сердца — левый желудочек.', segs: [4], chambers: ['LA', 'LV']},
      {title: 'Левый желудочек → тело', text: 'Левый желудочек выталкивает кровь в аорту, и она разносит кислород по всему телу. Круг замыкается.', segs: [5], chambers: ['LV']},
    ],
  },
  fish: {
    name: 'Рыба', summary: 'Сердце двухкамерное, кровь в нём только венозная. Из желудочка она идёт в жабры, обогащается кислородом и сразу расходится по телу — один круг кровообращения.',
    chambers: [
      {key: 'A', name: 'Предсердие', pos: [-0.9, 0.9, 0], r: [0.85, 0.65, 0.7], type: 'atrium', blood: BLUE},
      {key: 'V', name: 'Желудочек', pos: [0.35, -0.3, 0], r: [0.9, 1.0, 0.8], type: 'ventricle', blood: BLUE},
    ],
    organs: [{kind: 'body', pos: [-3.5, -0.2, 0], name: 'Тело'}, {kind: 'gills', pos: [3.0, 0.8, 0], name: 'Жабры'}],
    septa: [],
    segs: [
      {pts: [[-3.3, 0.3, 0], [-2.3, 1.5, 0.1], [-0.9, 0.95, 0]], c0: BLUE, c1: BLUE, vessel: '#4a78d8', label: 'вены'},
      {pts: [[-0.9, 0.9, 0], [-0.3, 0.3, 0], [0.35, -0.3, 0]], c0: BLUE, c1: BLUE},
      {pts: [[0.35, -0.3, 0], [1.3, 0.2, 0], [2.1, 0.8, 0], [3.0, 0.8, 0]], c0: BLUE, c1: RED, vessel: '#4a78d8', exch: true, label: 'к жабрам'},
      {pts: [[3.0, 0.8, 0], [3.0, -1.4, -0.2], [0.2, -2.6, -0.3], [-2.4, -1.8, -0.1], [-3.4, -0.5, 0]], c0: RED, c1: BLUE, vessel: '#d94b4b', exch: true, label: 'аорта'},
    ],
    loops: [[0, 1, 2, 3]],
    steps: [
      {title: 'Тело → предсердие', text: 'Венозная кровь собирается от всего тела и поступает в предсердие.', segs: [0], chambers: ['A']},
      {title: 'Предсердие → желудочек', text: 'Предсердие сокращается и переводит кровь в мышечный желудочек.', segs: [1], chambers: ['A', 'V']},
      {title: 'Желудочек → жабры', text: 'Желудочек толкает кровь к жабрам. Там она получает кислород из воды и становится артериальной.', segs: [2], chambers: ['V']},
      {title: 'Жабры → тело', text: 'Из жабр насыщенная кислородом кровь идёт по артерии ко всем органам и возвращается в сердце. Круг один.', segs: [3], chambers: []},
    ],
  },
};
function threeChamber(name: string, summary: string, mixing: number): Model {
  const mixA = mixing >= 1 ? MIX : '#7c6bd6', mixB = mixing >= 1 ? MIX : '#c0508f', mixO = mixing >= 1 ? MIX : '#a05bc4';
  return {
    name, summary,
    chambers: [
      {key: 'RA', name: 'Правое предсердие', pos: [-1.05, 0.95, 0.15], r: [0.8, 0.62, 0.7], type: 'atrium', blood: BLUE},
      {key: 'LA', name: 'Левое предсердие', pos: [1.05, 0.95, -0.2], r: [0.8, 0.62, 0.7], type: 'atrium', blood: RED},
      {key: 'V', name: 'Желудочек', pos: [0, -0.6, 0.05], r: [1.75, 1.05, 0.9], type: 'ventricle', blood: mixing >= 1 ? MIX : '#9060d0'},
    ],
    organs: [{kind: 'body', pos: [-3.5, -0.2, 0], name: 'Тело'}, {kind: 'lungs', pos: [2.9, 2.6, 0], name: 'Лёгкие и кожа'}],
    septa: mixing >= 1 ? [{pos: [0, 0.95, 0], size: [0.07, 1.2, 1.0]}] : [{pos: [0, 0.95, 0], size: [0.07, 1.2, 1.0]}, {pos: [0, -1.05, 0.05], size: [0.09, 0.8, 1.1]}],
    segs: [
      {pts: TOP_VEIN, c0: BLUE, c1: BLUE, vessel: '#4a78d8', label: 'вены'},
      {pts: [[-1.05, 0.95, 0.15], [-0.7, 0.2, 0.2], [-0.5, -0.5, 0.1]], c0: BLUE, c1: mixA},
      {pts: PULM_VEINS, c0: RED, c1: RED, vessel: '#d94b4b', label: 'лёгочные вены'},
      {pts: [[1.05, 0.95, -0.2], [0.7, 0.2, -0.05], [0.5, -0.5, 0]], c0: RED, c1: mixB},
      {pts: [[0.3, -0.6, 0.15], [0.25, 0.8, 0.55], [0.4, 2.3, 0.55], [1.6, 3.0, 0.3], [2.8, 2.6, 0]], c0: mixO, c1: RED, vessel: '#9a6cd0', exch: true, label: 'к лёгким'},
      {pts: [[-0.3, -1.0, 0.1], [-1.2, -1.7, -0.1], [-2.0, -2.6, -0.3], [-3.2, -0.5, 0]], c0: mixO, c1: BLUE, vessel: '#b05ac0', exch: true, label: 'к телу'},
    ],
    loops: [[0, 1, 5], [2, 3, 4]],
    steps: [
      {title: 'Тело → правое предсердие', text: 'Венозная кровь от тела поступает в правое предсердие.', segs: [0], chambers: ['RA']},
      {title: 'Лёгкие и кожа → левое предсердие', text: 'Артериальная кровь, насыщенная кислородом в лёгких и коже, поступает в левое предсердие.', segs: [2], chambers: ['LA']},
      {title: 'Оба предсердия → желудочек', text: mixing >= 1 ? 'Обе порции крови попадают в единственный желудочек и частично смешиваются.' : 'Обе порции крови попадают в желудочек. Неполная перегородка уменьшает смешивание, но не исключает его.', segs: [1, 3], chambers: ['V']},
      {title: 'Желудочек → лёгкие и тело', text: 'Желудочек выталкивает смешанную кровь к лёгким и к телу. Орган получает кровь с меньшим содержанием кислорода, чем у птиц и млекопитающих.', segs: [4, 5], chambers: ['V']},
    ],
  };
}
MODELS.amph = threeChamber('Земноводное', 'Два предсердия и один желудочек: в нём артериальная и венозная кровь частично смешиваются. Два круга кровообращения.', 1);
MODELS.rept = threeChamber('Пресмыкающееся', 'В желудочке есть неполная перегородка, поэтому смешивания меньше, чем у земноводных. У крокодилов перегородка полная и сердце четырёхкамерное.', 0.5);

function label(text: string, scale = 1) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 72; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(10,20,34,0.72)'; x.beginPath(); (x as any).roundRect(4, 6, 312, 60, 22); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2; x.stroke();
  x.font = '600 30px system-ui, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 160, 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false})); s.scale.set(2.0 * scale, 0.45 * scale, 1); s.renderOrder = 30; return s;
}
function wobble(g0: THREE.BufferGeometry, amp: number, f: number, seed: number) {
  g0.deleteAttribute('normal'); g0.deleteAttribute('uv'); const g = mergeVertices(g0, 1e-4); const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * f + seed) * Math.cos(v.y * f * 0.8 + seed * 1.7) + Math.sin(v.z * f * 1.3 - seed); v.multiplyScalar(1 + amp * n * 0.5); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function build(m: Model, solidWalls: boolean) {
  const root = new THREE.Group(), mats: Record<string, THREE.MeshPhysicalMaterial[]> = {}, groups: Record<string, THREE.Group> = {}, segMats: THREE.MeshPhysicalMaterial[][] = m.segs.map(() => []);
  const addMat = (k: string, mat: THREE.MeshPhysicalMaterial) => { (mats[k] = mats[k] || []).push(mat); };
  const phys = (color: string, opacity: number, extra: any = {}) => new THREE.MeshPhysicalMaterial({color, transparent: opacity < 1, opacity, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.8, sheenRoughness: 0.35, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#fff'), 0.5), side: THREE.DoubleSide, depthWrite: opacity >= 0.9, envMapIntensity: 1.2, ...extra});

  m.chambers.forEach((c, i) => {
    const g = new THREE.Group(); g.position.set(...c.pos); if (c.rot) g.rotation.set(...c.rot); root.add(g); groups[c.key] = g;
    const geo = wobble(new THREE.SphereGeometry(1, 48, 32), c.type === 'atrium' ? 0.07 : 0.05, 2 + i, 3 + i);
    const wall = new THREE.MeshPhysicalMaterial({color: c.type === 'atrium' ? '#d98a82' : '#c2554f', transparent: !solidWalls, opacity: solidWalls ? 1 : c.type === 'atrium' ? 0.3 : 0.38, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2, sheen: 0.7, sheenColor: new THREE.Color('#ffb4a8'), side: THREE.DoubleSide, depthWrite: solidWalls, envMapIntensity: 1.1});
    const shell = new THREE.Mesh(geo, wall); shell.scale.set(...c.r); shell.renderOrder = 4; g.add(shell); addMat(c.key, wall);
    const poolMat = phys(c.blood, 0.28, {depthWrite: false, roughness: 0.1}); const pool = new THREE.Mesh(geo, poolMat); pool.scale.set(c.r[0] * 0.88, c.r[1] * 0.88, c.r[2] * 0.88); pool.renderOrder = 2; g.add(pool); addMat(c.key, poolMat);
    if (c.type === 'atrium') { const ear = new THREE.Mesh(wobble(new THREE.SphereGeometry(0.34, 20, 14), 0.1, 4, 8), wall.clone()); ear.position.set(c.pos[0] < 0 ? -0.55 : 0.55, 0.38, 0.35); ear.scale.set(1, 0.8, 0.7); g.add(ear); }
    else { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 12, 32), new THREE.MeshPhysicalMaterial({color: '#f3e4d8', roughness: 0.4, clearcoat: 0.6})); ring.position.set(c.pos[0] < 0 && m.chambers.length > 2 ? 0.1 : 0, c.r[1] * 0.78, 0); ring.rotation.x = Math.PI / 2; g.add(ring); }
    const t = label(c.name, 0.9); t.position.set(0, c.r[1] + 0.35, 0.4); g.add(t);
  });
  m.septa.forEach(s => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s.size), new THREE.MeshPhysicalMaterial({color: '#e8c4be', roughness: 0.4, clearcoat: 0.5, transparent: !solidWalls, opacity: solidWalls ? 1 : 0.75})); mesh.position.set(...s.pos); root.add(mesh); });

  m.organs.forEach(o => {
    const g = new THREE.Group(); g.position.set(...o.pos); root.add(g);
    if (o.kind === 'body') { const b = new THREE.Mesh(wobble(new THREE.SphereGeometry(1, 40, 28), 0.08, 2.5, 5), phys('#f6b87a', 0.4, {depthWrite: false})); b.scale.set(0.9, 1.45, 0.75); b.renderOrder = 2; g.add(b); }
    else if (o.kind === 'lungs') { [-0.5, 0.5].forEach((dx, i) => { const l = new THREE.Mesh(wobble(new THREE.SphereGeometry(1, 36, 24), 0.1, 2.8, 4 + i), phys('#f9a8c4', 0.42, {depthWrite: false})); l.scale.set(0.6, 0.95, 0.55); l.position.set(dx, 0, 0); l.renderOrder = 2; g.add(l); }); }
    else { for (let i = 0; i < 5; i++) { const gl = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), phys('#f25f6f', 0.7, {depthWrite: false})); gl.scale.set(0.08, 0.55, 0.45); gl.position.set(-0.4 + i * 0.2, 0, 0); gl.rotation.z = (i - 2) * 0.12; g.add(gl); } }
    const t = label(o.name, 0.9); t.position.set(0, o.kind === 'lungs' ? 1.35 : o.kind === 'gills' ? 0.95 : 1.9, 0.3); g.add(t);
  });

  const curves = m.segs.map(s => new THREE.CatmullRomCurve3(s.pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.5));
  m.segs.forEach((s, i) => { if (!s.vessel) return;
    const mat = phys(s.vessel, 0.34, {depthWrite: false, roughness: 0.12}); const tube = new THREE.Mesh(new THREE.TubeGeometry(curves[i], 60, 0.13, 14, false), mat); tube.renderOrder = 3; root.add(tube); segMats[i].push(mat);
    const mid = curves[i].getPoint(0.5); if (s.label) { const l = label(s.label, 0.7); l.position.copy(mid).add(new THREE.Vector3(0, 0.38, 0.35)); root.add(l); } });

  // кровяные клетки
  const lens = curves.map(c => c.getLength());
  const routeLen = m.loops.map(l => l.reduce((a, i) => a + lens[i], 0));
  const per = Math.floor(80 / m.loops.length), N = per * m.loops.length;
  const cell = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 14, 10), new THREE.MeshPhysicalMaterial({color: '#ffffff', roughness: 0.3, clearcoat: 0.8, emissive: '#ffffff', emissiveIntensity: 0.12}), N);
  cell.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3); root.add(cell); cell.frustumCulled = false; cell.renderOrder = 10;
  const parts = Array.from({length: N}, (_, i) => ({loop: Math.floor(i / per), u: ((i % per) + Math.random() * 0.5) / per, off: Math.random() * 0.12 - 0.06}));
  const col0 = new THREE.Color(), col1 = new THREE.Color(), tmp = new THREE.Color(), d = new THREE.Object3D(), pt = new THREE.Vector3();
  // beat: фазы предсердий и желудочков
  const update = (time: number, state: {playing: boolean; step: number; mode: 'flow' | 'step'}, dt: number) => {
    const step = m.steps[state.step]; const active = new Set(step.segs);
    const speed = state.playing ? 0.1 : 0.0;
    for (let k = 0; k < N; k++) {
      const p = parts[k]; const L = m.loops[p.loop], total = routeLen[p.loop]; p.u = (p.u + speed * dt * (10 / total) * 2.2) % 1;
      let dist = p.u * total, si = L[0], tt = 0; for (const s of L) { if (dist <= lens[s]) { si = s; tt = dist / lens[s]; break; } dist -= lens[s]; si = s; tt = 1; }
      const seg = m.segs[si]; curves[si].getPoint(Math.min(1, Math.max(0, tt)), pt);
      const w = seg.exch ? sm(0.55, 1, tt) : sm(0.3, 0.8, tt); col0.set(seg.c0); col1.set(seg.c1); tmp.copy(col0).lerp(col1, w);
      const on = active.has(si); const vis = state.mode === 'flow' ? 1 : on ? 1 : 0.0;
      const sc = state.mode === 'flow' ? (state.playing ? (on ? 1.25 : 0.85) : 1) : on ? 1.3 : 0.0001;
      d.position.set(pt.x + p.off * 0.5, pt.y + p.off * 0.4, pt.z + p.off * 0.4); d.scale.setScalar(Math.max(sc * (0.6 + 0.8 * vis), 0.0001)); d.updateMatrix(); cell.setMatrixAt(k, d.matrix); cell.setColorAt(k, tmp);
    }
    cell.instanceMatrix.needsUpdate = true; if (cell.instanceColor) cell.instanceColor.needsUpdate = true;
    // сокращение камер и подсветка активного шага
    const ph = (time * 1.0) % 1, bump = (a: number, b: number) => (ph > a && ph < b ? Math.sin(((ph - a) / (b - a)) * Math.PI) : 0);
    m.chambers.forEach(c => { const g = groups[c.key]; const on = step.chambers.includes(c.key); let k = state.playing ? (c.type === 'atrium' ? bump(0, 0.3) * 0.08 : bump(0.32, 0.62) * 0.1) : 0; if (state.playing && on) k += 0.03;
      g.scale.setScalar(1 + k); mats[c.key].forEach(mm => { mm.emissive.set(on ? '#ffd166' : '#000000'); mm.emissiveIntensity = on ? 0.28 + 0.12 * Math.sin(time * 5) : 0; }); });
    segMats.forEach((arr, i) => arr.forEach(mm => { const on = active.has(i); mm.emissive.set(on ? '#ffd166' : '#000000'); mm.emissiveIntensity = on ? 0.35 : 0; }));
  };
  return {root, update};
}

export default function Heart3D({initial = 'mam'}: {initial?: string}) {
  const host = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(initial), [playing, setPlaying] = useState(false), [step, setStep] = useState(0), [mode, setMode] = useState<'flow' | 'step'>('flow'), [solid, setSolid] = useState(false), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {playing, step, mode};
  const model = MODELS[k];

  useEffect(() => {
    const el = host.current; if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь плоской схемой ниже.'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement); renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(); const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80); camera.position.set(0.4, 0.6, 12.2);
    const key = new THREE.DirectionalLight('#fff1e0', 2.0); key.position.set(4, 6, 7); scene.add(key); const rim = new THREE.DirectionalLight('#8ec5ff', 1.2); rim.position.set(-6, -3, -4); scene.add(rim); scene.add(new THREE.HemisphereLight('#dbeafe', '#3b1d2a', 0.55));
    const {root, update} = build(model, solid); scene.add(root);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = 5; controls.maxDistance = 18; controls.target.set(-0.2, 0.5, 0);
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); if (st.current.playing) t += dt; update(t, st.current, dt); controls.update(); renderer.render(scene, camera); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: any) => { if (m.map) m.map.dispose(); m.dispose(); }); }); pm.dispose(); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, [k, solid]);

  // автоматическая смена шагов в режиме потока
  useEffect(() => {
    if (!playing || mode !== 'flow') return;
    const id = setInterval(() => setStep(s => (s + 1) % model.steps.length), 3300);
    return () => clearInterval(id);
  }, [playing, mode, k]);

  const cur = model.steps[Math.min(step, model.steps.length - 1)];
  const go = (n: number) => { setMode('step'); setPlaying(true); setStep((n + model.steps.length) % model.steps.length); };
  return <div className="card lab"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель сердца: путь крови</b>
    {[['fish', '🐟 Рыба'], ['amph', '🐸 Земноводное'], ['rept', '🦎 Рептилия'], ['mam', '🦅🐆 Птица, млекопитающее']].map(([id, t]) => <button key={id} className={k === id ? '' : 's'} style={{minHeight: 38, padding: '4px 10px'}} onClick={() => { setK(id); setStep(0); }}>{t}</button>)}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} style={{height: 'min(64vh, 460px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 35%, #2a1f3a 0%, #0b1220 78%)', borderRadius: 14}}/>}
    <div style={{padding: '8px 14px 14px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
        <button onClick={() => { if (!playing) { setPlaying(true); setMode('flow'); } else setPlaying(false); }}>{playing ? '⏸ Пауза' : '▶ Запустить поток крови'}</button>
        <button className="s" onClick={() => go(step - 1)}>◀ Шаг назад</button><button className="s" onClick={() => go(step + 1)}>Шаг вперёд ▶</button>
        {mode === 'step' && <button className="s" onClick={() => setMode('flow')}>Показывать весь поток</button>}
        <button className="s" onClick={() => setSolid(!solid)}>{solid ? '👁 Прозрачные стенки' : '🫀 Плотные стенки'}</button></div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{model.steps.map((s, i) => <button key={i} className={i === step ? '' : 's'} style={{minHeight: 34, padding: '2px 12px'}} onClick={() => go(i)} aria-label={`Шаг ${i + 1}: ${s.title}`}>{i + 1}</button>)}</div>
      <div className="warn" aria-live="polite"><b>Шаг {Math.min(step, model.steps.length - 1) + 1} из {model.steps.length}: {cur.title}.</b> {cur.text}</div>
      <div className="mu" style={{marginTop: 8}}><span style={{color: BLUE}}>●</span> венозная кровь (мало кислорода) · <span style={{color: RED}}>●</span> артериальная (много кислорода) · <span style={{color: MIX}}>●</span> смешанная</div>
      <div className="warn" style={{marginTop: 8}}>{model.summary}</div>
      <div className="mu" style={{marginTop: 6}}>Вращай модель пальцем или мышью, приближай двумя пальцами или колёсиком. Модель упрощена: размеры и расположение камер условные.</div></div></div>;
}
