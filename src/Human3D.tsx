import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type V3 = [number, number, number];
type Seg = {pts: V3[]; r: number; part: string; color: string; c0: string; c1: string};
type Organ = {part: string; pos: V3; r: V3; color: string; op: number; name: string; rot?: V3; lab?: V3};
type Step = {title: string; text: string; parts: string[]; segs: number[]};
type Mode = {name: string; segs: Seg[]; loops: number[][]; organs: Organ[]; steps: Step[]; summary: string};

const ZIG: V3[] = []; for (let i = 0; i < 9; i++) ZIG.push([i % 2 ? 0.55 : -0.55, -0.55 - i * 0.17, 0.1 + (i % 3) * 0.04]);
const MODES: Record<string, Mode> = {
  breath: {
    name: 'Дыхание',
    summary: 'При вдохе диафрагма сокращается и опускается, рёбра поднимаются, объём грудной полости растёт, и воздух входит в лёгкие. При выдохе диафрагма расслабляется и поднимается, воздух выходит. Газообмен идёт в альвеолах: кислород переходит в кровь, углекислый газ — из крови в воздух.',
    segs: [
      {pts: [[0, 3.85, 0.75], [0, 3.5, 0.45], [0, 3.1, 0.1], [0, 2.7, 0]], r: 0.15, part: 'nose', color: '#cfe0f5', c0: '#bfe3ff', c1: '#9fd0ff'},
      {pts: [[0, 2.7, 0], [0, 2.0, 0], [0, 1.45, 0]], r: 0.19, part: 'trachea', color: '#cfe0f5', c0: '#9fd0ff', c1: '#8cc4ff'},
      {pts: [[0, 1.45, 0], [-0.45, 1.15, 0], [-0.95, 0.55, 0]], r: 0.12, part: 'bronchi', color: '#cfe0f5', c0: '#8cc4ff', c1: '#7fd6c0'},
      {pts: [[0, 1.45, 0], [0.45, 1.15, 0], [0.95, 0.55, 0]], r: 0.12, part: 'bronchi', color: '#cfe0f5', c0: '#8cc4ff', c1: '#7fd6c0'},
    ],
    loops: [[0, 1, 2], [0, 1, 3]],
    organs: [
      {part: 'lungs', pos: [-1.15, 0.55, 0], r: [0.8, 1.3, 0.65], color: '#f4a3b8', op: 0.5, name: 'Лёгкое', lab: [0, 1.75, 0.5]},
      {part: 'lungs', pos: [1.15, 0.55, 0], r: [0.8, 1.3, 0.65], color: '#f4a3b8', op: 0.5, name: 'Лёгкое', lab: [0, 1.75, 0.5]},
      {part: 'diaph', pos: [0, -0.75, 0], r: [1.95, 0.14, 0.8], color: '#c96f6f', op: 0.85, name: 'Диафрагма', lab: [0, -0.5, 0.9]},
    ],
    steps: [
      {title: 'Носовая полость и глотка', text: 'Воздух входит через нос: здесь он согревается, увлажняется и очищается от пыли.', parts: ['nose'], segs: [0]},
      {title: 'Гортань и трахея', text: 'Воздух проходит гортань и трахею. Стенки трахеи поддерживают хрящевые полукольца, поэтому она не спадается.', parts: ['trachea'], segs: [1]},
      {title: 'Бронхи', text: 'Трахея делится на два бронха, они ветвятся внутри лёгких на всё более тонкие трубочки.', parts: ['bronchi'], segs: [2, 3]},
      {title: 'Альвеолы: газообмен', text: 'Бронхи заканчиваются пузырьками — альвеолами. Через их тонкие стенки кислород переходит в кровь, а углекислый газ выходит из крови.', parts: ['lungs'], segs: [2, 3]},
      {title: 'Вдох и выдох: диафрагма', text: 'При вдохе диафрагма опускается и лёгкие расширяются, при выдохе диафрагма поднимается и воздух выходит наружу.', parts: ['diaph', 'lungs'], segs: [0, 1, 2, 3]},
    ],
  },
  food: {
    name: 'Пищеварение',
    summary: 'Пищеварительный тракт: ротовая полость → глотка → пищевод → желудок → тонкая кишка → толстая кишка. Печень (желчь) и поджелудочная железа (пищеварительный сок) помогают в тонкой кишке. Всасывание питательных веществ идёт главным образом в тонкой кишке, воды — в толстой.',
    segs: [
      {pts: [[0, 3.55, 0.5], [0, 3.35, 0.3], [0, 3.0, 0.1], [0, 2.8, 0]], r: 0.2, part: 'mouth', color: '#e6a08a', c0: '#e8c27a', c1: '#e8c27a'},
      {pts: [[0, 2.8, 0], [0, 2.0, 0], [0.02, 1.2, 0.03], [0.12, 0.85, 0.08]], r: 0.13, part: 'esoph', color: '#e6a08a', c0: '#e8c27a', c1: '#dcae66'},
      {pts: [[0.12, 0.85, 0.08], [0.45, 0.6, 0.12], [0.6, 0.1, 0.12], [0.3, -0.25, 0.1]], r: 0.1, part: 'stomach', color: '#d97a6a', c0: '#dcae66', c1: '#c98f4f'},
      {pts: [[0.3, -0.25, 0.1], ...ZIG, [-0.2, -2.3, 0.1]], r: 0.115, part: 'small', color: '#e89b7e', c0: '#c98f4f', c1: '#a87442'},
      {pts: [[-0.2, -2.3, 0.1], [-0.9, -2.2, 0.1], [-0.95, -0.5, 0.1], [0.95, -0.35, 0.1], [0.95, -2.1, 0.1], [0.4, -2.7, 0.1], [0, -3.0, 0.1]], r: 0.2, part: 'large', color: '#c98a58', c0: '#a87442', c1: '#6b4a2a'},
    ],
    loops: [[0, 1, 2, 3, 4]],
    organs: [
      {part: 'stomach', pos: [0.5, 0.3, 0.1], r: [0.62, 0.5, 0.42], color: '#e08878', op: 0.45, name: 'Желудок', rot: [0, 0, -0.5], lab: [1.0, 0.95, 0.5]},
      {part: 'liver', pos: [-0.75, 0.65, 0.08], r: [0.8, 0.42, 0.45], color: '#8e4a3a', op: 0.62, name: 'Печень', rot: [0, 0, 0.18], lab: [-1.3, 1.25, 0.5]},
      {part: 'pancreas', pos: [0.05, -0.18, 0.02], r: [0.55, 0.11, 0.16], color: '#e9c46a', op: 0.85, name: 'Поджелудочная железа', lab: [1.5, -0.2, 0.5]},
    ],
    steps: [
      {title: 'Ротовая полость', text: 'Зубы измельчают пищу, язык смешивает её со слюной. Фермент слюны начинает расщеплять крахмал. Проглатывание проталкивает пищу в глотку.', parts: ['mouth'], segs: [0]},
      {title: 'Пищевод', text: 'Пищевод — мышечная трубка. Волны сокращений его стенок (перистальтика) проталкивают пищу в желудок.', parts: ['esoph'], segs: [1]},
      {title: 'Желудок', text: 'Желудочный сок с соляной кислотой и ферментом пепсином начинает расщеплять белки. Пища переваривается несколько часов.', parts: ['stomach'], segs: [2]},
      {title: 'Тонкая кишка', text: 'Сюда поступают желчь печени (помогает переваривать жиры) и сок поджелудочной железы. Расщепление заканчивается, питательные вещества всасываются в кровь и лимфу.', parts: ['small', 'liver', 'pancreas'], segs: [3]},
      {title: 'Толстая кишка', text: 'В толстой кишке всасывается вода, остатки уплотняются, и непереваренное удаляется наружу.', parts: ['large'], segs: [4]},
    ],
  },
};

function label(text: string, s = 1) {
  const c = document.createElement('canvas'); c.width = 360; c.height = 72; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(10,20,34,0.74)'; x.beginPath(); (x as any).roundRect(4, 6, 352, 60, 22); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2; x.stroke();
  x.font = '600 29px system-ui, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 180, 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false})); sp.scale.set(2.2 * s, 0.44 * s, 1); sp.renderOrder = 30; return sp;
}
function wobble(g0: THREE.BufferGeometry, amp: number, f: number, seed: number) {
  g0.deleteAttribute('normal'); g0.deleteAttribute('uv'); const g = mergeVertices(g0, 1e-4); const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * f + seed) * Math.cos(v.y * f * 0.8 + seed * 1.7) + Math.sin(v.z * f * 1.3 - seed); v.multiplyScalar(1 + amp * n * 0.5); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
const phys = (color: string, op: number, extra: any = {}) => new THREE.MeshPhysicalMaterial({color, transparent: op < 1, opacity: op, roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.15, sheen: 0.7, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#fff'), 0.5), side: THREE.DoubleSide, depthWrite: op >= 0.9, envMapIntensity: 1.2, ...extra});

function build(key: string, bodyOn: boolean) {
  const m = MODES[key], root = new THREE.Group(), parts: Record<string, THREE.MeshPhysicalMaterial[]> = {}, lungs: THREE.Object3D[] = [];
  const reg = (k: string, mat: THREE.MeshPhysicalMaterial) => { (parts[k] = parts[k] || []).push(mat); };
  let diaph: THREE.Object3D | null = null;
  if (bodyOn) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.75, 3.1, 12, 40), phys('#f2c9a5', 0.13, {depthWrite: false, roughness: 0.5})); body.scale.set(1, 1, 0.55); body.position.set(0, -0.2, 0); body.renderOrder = 1; root.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 40, 28), phys('#f2c9a5', 0.13, {depthWrite: false, roughness: 0.5})); head.position.set(0, 3.75, 0); head.scale.set(0.9, 1, 0.95); head.renderOrder = 1; root.add(head);
  }
  m.organs.forEach((o, i) => {
    const g = new THREE.Group(); g.position.set(...o.pos); if (o.rot) g.rotation.set(...o.rot); root.add(g);
    const mat = phys(o.color, o.op, {depthWrite: false}); reg(o.part, mat);
    const mesh = new THREE.Mesh(wobble(new THREE.SphereGeometry(1, 44, 30), o.part === 'diaph' ? 0.02 : 0.06, 2.4 + i, 2 + i), mat); mesh.scale.set(...o.r); mesh.renderOrder = 3; g.add(mesh);
    if (o.part === 'lungs') {
      lungs.push(g);
      const alv = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 10, 8), phys('#ff7aa2', 1, {roughness: 0.4}), 140); const d = new THREE.Object3D();
      for (let k = 0; k < 140; k++) { let v: THREE.Vector3; do { v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1); } while (v.lengthSq() > 0.6); d.position.set(v.x * o.r[0], v.y * o.r[1] * 0.9, v.z * o.r[2]); d.scale.setScalar(0.6 + Math.random() * 0.7); d.updateMatrix(); alv.setMatrixAt(k, d.matrix); }
      g.add(alv); reg('lungs', alv.material as THREE.MeshPhysicalMaterial);
    }
    if (o.part === 'diaph') diaph = g;
    if (o.lab && !(o.part === 'lungs' && o.pos[0] > 0)) { const l = label(o.name, 0.85); l.position.set(o.lab[0] - o.pos[0], o.lab[1] - o.pos[1], o.lab[2]); if (o.rot) l.position.applyEuler(new THREE.Euler(-o.rot[0], -o.rot[1], -o.rot[2])); g.add(l); }
  });
  const curves = m.segs.map(s => new THREE.CatmullRomCurve3(s.pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.5));
  const SEGLAB: Record<string, [string, V3]> = {nose: ['Нос, глотка', [0.9, 3.5, 0.5]], trachea: ['Гортань и трахея', [0.95, 2.2, 0.4]], bronchi: ['Бронхи', [0, 0.95, 0.5]], mouth: ['Ротовая полость', [1.2, 3.4, 0.5]], esoph: ['Пищевод', [0.85, 2.0, 0.4]], small: ['Тонкая кишка', [-1.5, -1.2, 0.5]], large: ['Толстая кишка', [1.5, -1.6, 0.5]]};
  const done = new Set<string>();
  m.segs.forEach((s, i) => {
    const mat = phys(s.color, 0.5, {depthWrite: false}); reg(s.part, mat);
    const t = new THREE.Mesh(new THREE.TubeGeometry(curves[i], s.part === 'small' ? 220 : 64, s.r, 14, false), mat); t.renderOrder = 4; root.add(t);
    if (SEGLAB[s.part] && !done.has(s.part)) { done.add(s.part); const l = label(SEGLAB[s.part][0], 0.85); l.position.set(...SEGLAB[s.part][1]); root.add(l); }
  });
  // частицы (воздух или пищевой комок)
  const lens = curves.map(c => c.getLength()), tot = m.loops.map(l => l.reduce((a, i) => a + lens[i], 0));
  const per = key === 'breath' ? 14 : 22, N = per * m.loops.length;
  const pm = new THREE.InstancedMesh(new THREE.SphereGeometry(key === 'breath' ? 0.07 : 0.085, 14, 10), new THREE.MeshPhysicalMaterial({color: '#fff', roughness: 0.3, clearcoat: 0.8, emissive: '#fff', emissiveIntensity: 0.15}), N);
  pm.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3); pm.frustumCulled = false; pm.renderOrder = 10; root.add(pm);
  const P = Array.from({length: N}, (_, i) => ({loop: Math.floor(i / per), k: (i % per) / per, off: (Math.random() - 0.5) * 0.12}));
  const c0 = new THREE.Color(), c1 = new THREE.Color(), cc = new THREE.Color(), d = new THREE.Object3D(), pt = new THREE.Vector3(), tmpS = {u: 0};
  let flow = 0;
  const update = (time: number, st: {playing: boolean; step: number; mode: 'flow' | 'step'}, dt: number) => {
    const step = m.steps[st.step], act = new Set(step.segs);
    const ph = (time / 4) % 1, e = st.playing ? 0.5 * (1 - Math.cos(2 * Math.PI * ph)) : 0;
    if (key === 'food' && st.playing) flow = (flow + dt * 0.045) % 1;
    for (let i = 0; i < N; i++) {
      const p = P[i], L = m.loops[p.loop], total = tot[p.loop];
      const u = key === 'breath' ? p.k * 0.62 + 0.38 * e : (p.k + flow) % 1;
      let dist = u * total, si = L[0], tt = 0; for (const s of L) { si = s; if (dist <= lens[s]) { tt = dist / lens[s]; break; } dist -= lens[s]; tt = 1; }
      curves[si].getPoint(Math.min(1, Math.max(0, tt)), pt);
      const sg = m.segs[si]; c0.set(sg.c0); c1.set(sg.c1); cc.copy(c0).lerp(c1, tt); tmpS.u = u;
      const on = act.has(si), sc = st.mode === 'flow' ? 1 : on ? 1.3 : 0.0001;
      d.position.set(pt.x + p.off, pt.y, pt.z + p.off * 0.7); d.scale.setScalar(sc); d.updateMatrix(); pm.setMatrixAt(i, d.matrix); pm.setColorAt(i, cc);
    }
    pm.instanceMatrix.needsUpdate = true; if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    lungs.forEach(g => g.scale.set(1 + 0.1 * e, 1 + 0.12 * e, 1 + 0.1 * e));
    if (diaph) diaph.position.y = -0.75 - 0.38 * e;
    Object.entries(parts).forEach(([k, arr]) => { const on = step.parts.includes(k); arr.forEach(mm => { mm.emissive.set(on ? '#ffd166' : '#000'); mm.emissiveIntensity = on ? 0.3 + 0.1 * Math.sin(time * 5 + 1) : 0; }); });
  };
  return {root, update};
}

export default function Human3D() {
  const host = useRef<HTMLDivElement>(null);
  const [k, setK] = useState('breath'), [playing, setPlaying] = useState(false), [step, setStep] = useState(0), [mode, setMode] = useState<'flow' | 'step'>('flow'), [body, setBody] = useState(true), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {playing, step, mode};
  const M = MODES[k];
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь текстом и заданиями.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80); cam.position.set(0.3, 0.4, 11.5);
    const a = new THREE.DirectionalLight('#fff1e0', 2); a.position.set(4, 6, 7); scene.add(a); const b = new THREE.DirectionalLight('#8ec5ff', 1.1); b.position.set(-6, -3, -4); scene.add(b); scene.add(new THREE.HemisphereLight('#dbeafe', '#3b1d2a', 0.55));
    const {root, update} = build(k, body); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.minDistance = 6; ctl.maxDistance = 22; ctl.target.set(0, 0.5, 0);
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); if (st.current.playing) t += dt; update(t, st.current, dt); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); }); }); pm.dispose(); r.dispose(); el.removeChild(r.domElement); };
  }, [k, body]);
  useEffect(() => {
    if (!playing || mode !== 'flow') return;
    const id = setInterval(() => setStep(s => (s + 1) % M.steps.length), 3600);
    return () => clearInterval(id);
  }, [playing, mode, k]);
  const cur = M.steps[Math.min(step, M.steps.length - 1)];
  const go = (n: number) => { setMode('step'); setPlaying(true); setStep((n + M.steps.length) % M.steps.length); };
  return <div className="card lab"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель: тело человека</b>
    {[['breath', '🫁 Дыхание'], ['food', '🍽️ Пищеварение']].map(([id, t]) => <button key={id} className={k === id ? '' : 's'} style={{minHeight: 38, padding: '4px 10px'}} onClick={() => { setK(id); setStep(0); setMode('flow'); }}>{t}</button>)}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} style={{height: 'min(70vh, 520px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 35%, #2a1f3a 0%, #0b1220 78%)', borderRadius: 14}}/>}
    <div style={{padding: '8px 14px 14px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
        <button onClick={() => { if (!playing) { setPlaying(true); setMode('flow'); } else setPlaying(false); }}>{playing ? '⏸ Пауза' : k === 'breath' ? '▶ Запустить дыхание' : '▶ Запустить путь пищи'}</button>
        <button className="s" onClick={() => go(step - 1)}>◀ Шаг назад</button><button className="s" onClick={() => go(step + 1)}>Шаг вперёд ▶</button>
        {mode === 'step' && <button className="s" onClick={() => setMode('flow')}>Показывать всё сразу</button>}
        <button className="s" onClick={() => setBody(!body)}>{body ? '🙈 Скрыть контур тела' : '🧍 Показать контур тела'}</button></div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{M.steps.map((s, i) => <button key={i} className={i === step ? '' : 's'} style={{minHeight: 34, padding: '2px 12px'}} onClick={() => go(i)} aria-label={`Шаг ${i + 1}: ${s.title}`}>{i + 1}</button>)}</div>
      <div className="warn" aria-live="polite"><b>Шаг {Math.min(step, M.steps.length - 1) + 1} из {M.steps.length}: {cur.title}.</b> {cur.text}</div>
      <div className="warn" style={{marginTop: 8}}>{M.summary}</div>
      <div className="mu" style={{marginTop: 6}}>Вращай модель пальцем или мышью, приближай двумя пальцами или колёсиком. Модель упрощена: размеры и расположение органов условные.</div></div></div>;
}
