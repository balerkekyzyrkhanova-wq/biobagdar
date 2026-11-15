import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type V3 = [number, number, number];
type St = {light: boolean; water: boolean; stoma: boolean; playing: boolean; step: number; mode: 'flow' | 'step'; labels: boolean};
const STEPS: {title: string; text: string; g: string[]}[] = [
  {title: 'Свет падает на лист', text: 'Свет проходит через прозрачную кожицу и попадает в клетки столбчатой ткани. В них больше всего хлоропластов с зелёным хлорофиллом — он улавливает энергию света.', g: ['light']},
  {title: 'Вода приходит по ксилеме', text: 'Корни всасывают воду, и по сосудам ксилемы в жилке она поднимается к клеткам листа.', g: ['water']},
  {title: 'Углекислый газ входит через устьица', text: 'Устьица на нижней стороне листа открыты: углекислый газ из воздуха попадает в воздушные полости губчатой ткани, а оттуда в клетки.', g: ['co2']},
  {title: 'В хлоропластах образуется глюкоза', text: 'Из углекислого газа и воды с помощью энергии света в хлоропластах образуется глюкоза (сахар). При этом выделяется кислород.', g: ['light', 'water', 'co2', 'chl']},
  {title: 'Кислород выходит наружу', text: 'Кислород — побочный продукт фотосинтеза. Он выходит из листа через устьица в воздух. Им дышат все живые организмы.', g: ['o2']},
  {title: 'Сахара уходят по флоэме', text: 'Глюкоза превращается в другие вещества (например, крахмал) или по флоэме жилки уходит к корням, плодам и растущим частям растения.', g: ['sugar']},
];
const FLOWS: {key: string; color: string; size: number; n: number; speed: number; paths: V3[][]}[] = [
  {key: 'light', color: '#ffe066', size: 0.07, n: 30, speed: 0.5, paths: [-2.4, -1.4, -0.4, 0.6, 1.6, 2.5].map(x => [[x - 0.5, 3.3, 0.5], [x, 0.95, 0.5]] as V3[])},
  {key: 'water', color: '#4aa8ff', size: 0.085, n: 14, speed: 0.22, paths: [[[1.6, -0.3, 0.2], [1.1, 0.15, 0.4], [0.35, 0.7, 0.45]], [[1.6, -0.3, 0.2], [2.1, 0.2, 0.4], [2.45, 0.7, 0.45]]]},
  {key: 'co2', color: '#c9ced6', size: 0.085, n: 14, speed: 0.2, paths: [[[-1.2, -2.7, 0.3], [-1.2, -1.45, 0.3], [-1.0, -0.8, 0.45], [-0.6, 0.0, 0.5], [-0.55, 0.7, 0.5]], [[-1.3, -2.7, 0.3], [-1.2, -1.45, 0.3], [-1.5, -0.7, 0.45], [-1.85, 0.05, 0.5], [-1.8, 0.7, 0.5]]]},
  {key: 'o2', color: '#9ff0ff', size: 0.085, n: 12, speed: 0.2, paths: [[[0.0, 0.7, 0.6], [-0.4, -0.25, 0.6], [-0.95, -0.9, 0.45], [-1.2, -1.5, 0.3], [-1.7, -2.7, 0.3]]]},
  {key: 'sugar', color: '#ff9a3c', size: 0.09, n: 12, speed: 0.2, paths: [[[0.9, 0.7, 0.55], [1.3, 0.0, 0.55], [1.6, -0.68, 0.5], [1.6, -0.68, 1.3], [1.6, -0.68, 2.3]]]},
];
const LAB: [string, V3, string][] = [['Верхняя кожица', [-2.1, 1.55, 1.3], ''], ['Столбчатая ткань', [-2.0, 0.75, 1.3], ''], ['Губчатая ткань', [-2.1, -0.45, 1.3], ''], ['Устьице', [-1.2, -1.75, 1.3], ''], ['Жилка: ксилема и флоэма', [1.7, -1.3, 1.3], ''], ['Хлоропласты', [0.5, 1.05, 1.3], '']];

function label(text: string, s = 1) {
  const c = document.createElement('canvas'); c.width = 380; c.height = 72; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(10,20,34,0.78)'; x.beginPath(); (x as any).roundRect(4, 6, 372, 60, 22); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2; x.stroke();
  x.font = '600 29px system-ui, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 190, 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false})); sp.scale.set(1.9 * s, 0.36 * s, 1); sp.renderOrder = 30; return sp;
}
function blob(r: number, amp: number, seed: number) {
  const g0 = new THREE.SphereGeometry(r, 28, 20); g0.deleteAttribute('normal'); g0.deleteAttribute('uv'); const g = mergeVertices(g0, 1e-4), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 5 + seed) * Math.cos(v.y * 4 + seed * 1.7) + Math.sin(v.z * 6 - seed); v.multiplyScalar(1 + amp * n * 0.5); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
const phys = (color: string, op: number, extra: any = {}) => new THREE.MeshPhysicalMaterial({color, transparent: op < 1, opacity: op, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2, depthWrite: op >= 0.9, envMapIntensity: 1.1, ...extra});
let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };

function build() {
  sd = 7; const root = new THREE.Group();
  // кутикула и верхняя кожица
  const cut = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.07, 2.5), phys('#f4ffd8', 0.35, {roughness: 0.05})); cut.position.y = 1.66; root.add(cut);
  const epi = phys('#d6ecb4', 0.6);
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.26, 2.36), epi); m.position.set(-2.7 + i * 0.6, 1.47, 0); root.add(m); }
  // столбчатая ткань с хлоропластами
  const pal = phys('#7cc45a', 0.42, {depthWrite: false}), capsule = new THREE.CapsuleGeometry(0.25, 0.62, 8, 18), cells: V3[] = [];
  for (let i = 0; i < 10; i++) for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(capsule, pal); const p: V3 = [-2.7 + i * 0.6, 0.75, -0.8 + k * 0.8]; m.position.set(...p); m.renderOrder = 3; root.add(m); cells.push(p); }
  const chlMat = new THREE.MeshPhysicalMaterial({color: '#1f8a2e', roughness: 0.4, clearcoat: 0.6, emissive: '#7dff5a', emissiveIntensity: 0});
  const chl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 10, 8), chlMat, cells.length * 7), d = new THREE.Object3D();
  cells.forEach((c, i) => { for (let j = 0; j < 7; j++) { const a = rnd() * 6.28; d.position.set(c[0] + Math.cos(a) * 0.16, c[1] - 0.4 + j * 0.13, c[2] + Math.sin(a) * 0.16); d.scale.set(1, 0.6, 1); d.updateMatrix(); chl.setMatrixAt(i * 7 + j, d.matrix); } }); root.add(chl);
  // губчатая ткань
  const sp = phys('#9ad27a', 0.5, {depthWrite: false});
  for (let n = 0, tries = 0; n < 30 && tries < 600; tries++) { const x = -2.8 + rnd() * 5.6, y = -1.05 + rnd() * 1.05, z = -0.9 + rnd() * 1.8; if (Math.hypot(x - 1.6, y + 0.48) < 0.85 || Math.hypot(x + 1.2, y + 1.0) < 0.6) continue; const m = new THREE.Mesh(blob(0.26 + rnd() * 0.12, 0.18, rnd() * 9), sp); m.position.set(x, y, z); m.renderOrder = 3; root.add(m); n++; }
  // жилка
  const tube = (r: number, color: string, x: number, y: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 2.5, 16), phys(color, 0.9)); m.rotation.x = Math.PI / 2; m.position.set(x, y, 0); root.add(m); };
  const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.44, 28), phys('#efe6b8', 0.22, {depthWrite: false})); sheath.rotation.x = Math.PI / 2; sheath.position.set(1.6, -0.48, 0); sheath.renderOrder = 2; root.add(sheath);
  [-0.2, 0, 0.2].forEach(dx => { tube(0.11, '#3f8fe0', 1.6 + dx, -0.28); tube(0.09, '#f08a3c', 1.6 + dx, -0.7); });
  // нижняя кожица и устьице
  for (let i = 0; i < 10; i++) { if (i === 2 || i === 3) continue; const m = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.26, 2.36), epi); m.position.set(-2.7 + i * 0.6, -1.47, 0); root.add(m); }
  [-1, 1].forEach(sx => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 2.36), epi); m.position.set(-1.2 + sx * 0.75 * 0.6 - sx * 0.02, -1.47, 0); m.scale.x = 0.9; root.add(m); });
  const gMat = phys('#4fae45', 0.95), guards = [-1, 1].map(sx => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.7, 8, 16), gMat); m.rotation.x = Math.PI / 2; m.position.set(-1.2 + sx * 0.2, -1.47, 0.6); root.add(m); return {m, sx}; });
  [-0.6, -1.4].forEach(z => { const fill = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.26, 0.95), epi); fill.position.set(-1.2, -1.47, z + 0.2); root.add(fill); });
  // подписи
  const labs = LAB.map(([t, p]) => { const l = label(t, 0.95); l.position.set(...p); root.add(l); return l; });
  // потоки
  const flows = FLOWS.map(f => { const curves = f.paths.map(p => p.length === 2 ? new THREE.LineCurve3(new THREE.Vector3(...p[0]), new THREE.Vector3(...p[1])) : new THREE.CatmullRomCurve3(p.map(q => new THREE.Vector3(...q)), false, 'catmullrom', 0.5));
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(f.size, 12, 8), new THREE.MeshBasicMaterial({color: f.color}), f.n); im.frustumCulled = false; im.renderOrder = 12; root.add(im);
    return {f, curves, im, ph: Array.from({length: f.n}, (_, i) => i / f.n + rnd() * 0.05), on: 0}; });
  const pt = new THREE.Vector3(); let open = 1, glow = 0;
  const update = (t: number, s: St, dt: number) => {
    const active = s.light && s.water && s.stoma, cur = STEPS[s.step];
    const want: Record<string, boolean> = {light: s.light, water: s.water, co2: s.stoma, o2: active, sugar: active};
    flows.forEach(fl => { const show = s.mode === 'step' ? cur.g.includes(fl.f.key) : want[fl.f.key]; fl.on += ((show ? 1 : 0) - fl.on) * Math.min(1, dt * 5);
      for (let i = 0; i < fl.f.n; i++) { const c = fl.curves[i % fl.curves.length]; const u = (fl.ph[i] + (s.playing ? t * fl.f.speed : 0)) % 1; c.getPoint(u, pt); d.position.copy(pt); d.scale.setScalar(Math.max(0.0001, fl.on * (fl.f.key === 'light' ? 0.8 : 1) * Math.min(1, u * 8, (1 - u) * 8))); d.updateMatrix(); fl.im.setMatrixAt(i, d.matrix); }
      fl.im.instanceMatrix.needsUpdate = true; });
    const so = s.mode === 'step' ? 1 : s.stoma ? 1 : 0; open += (so - open) * Math.min(1, dt * 4); guards.forEach(g => { g.m.position.x = -1.2 + g.sx * (0.13 + 0.1 * open); });
    const gl = (s.mode === 'step' ? cur.g.includes('chl') || s.step === 0 : active) ? 1 : 0; glow += (gl - glow) * Math.min(1, dt * 3); chlMat.emissiveIntensity = glow * (0.45 + 0.2 * Math.sin(t * 4));
    labs.forEach(l => { l.visible = s.labels; });
  };
  return {root, update};
}

export default function Leaf3D() {
  const host = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState(true), [water, setWater] = useState(true), [stoma, setStoma] = useState(true), [playing, setPlaying] = useState(false), [step, setStep] = useState(0), [mode, setMode] = useState<'flow' | 'step'>('flow'), [labels, setLabels] = useState(true), [err, setErr] = useState('');
  const st = useRef<St>({} as St); st.current = {light, water, stoma, playing, step, mode, labels};
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь текстом ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    const a = new THREE.DirectionalLight('#fff6d8', 2.2); a.position.set(3, 8, 6); scene.add(a); scene.add(new THREE.HemisphereLight('#e6f6ff', '#2a3b22', 0.6));
    const {root, update} = build(); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.minDistance = 4; ctl.maxDistance = 24; ctl.target.set(0, 0.15, 0);
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { const dd = Math.max(9.6, 10.2 / (w / h)); cam.position.set(dd * 0.18, dd * 0.12, dd); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; update(t, st.current, dt); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); }); }); pm.dispose(); r.dispose(); el.removeChild(r.domElement); };
  }, []);
  useEffect(() => {
    if (!playing || mode !== 'step') return;
    const id = setInterval(() => setStep(s => (s + 1) % STEPS.length), 4000); return () => clearInterval(id);
  }, [playing, mode]);
  const cur = STEPS[step], active = light && water && stoma;
  const go = (n: number) => { setMode('step'); setPlaying(true); setStep((n + STEPS.length) % STEPS.length); };
  const missing = [!light && 'нет света', !water && 'нет воды', !stoma && 'устьица закрыты — нет углекислого газа'].filter(Boolean).join(', ');
  const tg = (on: boolean, set: (b: boolean) => void, a: string, b: string) => <button className={on ? '' : 's'} aria-pressed={on} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => { set(!on); setMode('flow'); setPlaying(true); }}>{on ? a : b}</button>;
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель: лист в разрезе и фотосинтез</b>
    {tg(light, setLight, '☀️ Свет есть', '🌑 Света нет')}{tg(water, setWater, '💧 Вода есть', '🏜️ Воды нет')}{tg(stoma, setStoma, '🟢 Устьица открыты', '⛔ Устьица закрыты')}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(64vh, 480px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 20%, #24456b 0%, #0b1622 78%)', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      <div className="warn" aria-live="polite" style={mode === 'flow' ? {} : {display: 'none'}}><b>{active ? 'Фотосинтез идёт.' : 'Фотосинтез остановился:'}</b> {active ? 'Есть свет, вода и углекислый газ — в хлоропластах образуется глюкоза и выделяется кислород.' : missing + '. Попробуй вернуть условие и посмотри, что изменится.'}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8}}>
        <button onClick={() => { if (!playing) { setPlaying(true); } else setPlaying(false); }}>{playing ? '⏸ Пауза' : '▶ Запустить фотосинтез'}</button>
        <button className="s" onClick={() => go(mode === 'step' ? step - 1 : 0)}>◀ Шаг назад</button><button className="s" onClick={() => go(mode === 'step' ? step + 1 : 0)}>Шаг вперёд ▶</button>
        {mode === 'step' && <button className="s" onClick={() => setMode('flow')}>Показывать всё сразу</button>}
        <button className="s" onClick={() => setLabels(!labels)}>{labels ? '🏷 Скрыть подписи' : '🏷 Показать подписи'}</button></div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{STEPS.map((s, i) => <button key={i} className={mode === 'step' && i === step ? '' : 's'} style={{minHeight: 34, padding: '2px 12px'}} onClick={() => go(i)} aria-label={`Шаг ${i + 1}: ${s.title}`}>{i + 1}</button>)}</div>
      {mode === 'step' && <div className="warn" aria-live="polite"><b>Шаг {step + 1} из {STEPS.length}: {cur.title}.</b> {cur.text}</div>}
      <div className="card" style={{margin: '8px 0 0', textAlign: 'center', fontWeight: 700}}>углекислый газ + вода <span style={{color: 'var(--au)'}}>—(свет, хлорофилл)→</span> глюкоза + кислород</div>
      <div className="mu" style={{marginTop: 8}}><span style={{color: '#e0b400'}}>●</span> свет · <span style={{color: '#4aa8ff'}}>●</span> вода · <span style={{color: '#9aa3ad'}}>●</span> углекислый газ · <span style={{color: '#5cc8e0'}}>●</span> кислород · <span style={{color: '#ff9a3c'}}>●</span> сахара</div>
      <div className="mu" style={{marginTop: 6}}>Вращай модель пальцем или мышью, приближай двумя пальцами или колёсиком. Модель упрощена: настоящие клетки намного мельче и их гораздо больше.</div></div></div>;
}
