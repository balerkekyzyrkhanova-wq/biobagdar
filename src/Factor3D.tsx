import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

type Tol = [number, number, number, number]; // гибель снизу, оптимум от, оптимум до, гибель сверху
type Sp = {name: string; em: string; where: string; t: Tol; w: Tol; l: Tol};
const SPECIES: Record<string, Sp> = {
  wheat: {name: 'Пшеница', em: '🌾', where: 'поля северного Казахстана', t: [2, 18, 26, 40], w: [20, 50, 70, 95], l: [20, 65, 100, 130]},
  saxaul: {name: 'Саксаул', em: '🌳', where: 'пустыни юга Казахстана', t: [-5, 25, 40, 55], w: [3, 10, 35, 65], l: [35, 75, 100, 130]},
  spruce: {name: 'Ель Шренка', em: '🌲', where: 'горы Тянь-Шаня', t: [-25, 8, 18, 30], w: [35, 60, 85, 100], l: [10, 35, 80, 120]},
};
const F = [{k: 't', name: 'Температура', unit: ' °C', min: -30, max: 55, col: '#ef6a4c'}, {k: 'w', name: 'Влажность почвы', unit: ' %', min: 0, max: 100, col: '#2aa7e0'}, {k: 'l', name: 'Освещённость', unit: ' %', min: 0, max: 100, col: '#e0a800'}] as const;
const resp = ([a, b, c, d]: Tol, x: number) => x <= a || x >= d ? 0 : x < b ? (x - a) / (b - a) : x <= c ? 1 : (d - x) / (d - c);
const zone = (v: number) => v <= 0 ? 'гибель' : v < 0.5 ? 'сильное угнетение' : v < 1 ? 'угнетение' : 'оптимум';

function Curve({tol, f, x}: {tol: Tol; f: typeof F[number]; x: number}) {
  const W = 300, H = 92, px = (v: number) => 8 + (v - f.min) / (f.max - f.min) * (W - 16), py = (v: number) => H - 18 - v * (H - 30);
  const pts = Array.from({length: 61}, (_, i) => { const v = f.min + (f.max - f.min) * i / 60; return `${px(v).toFixed(1)},${py(resp(tol, v)).toFixed(1)}`; }).join(' ');
  const cl = (v: number) => Math.min(f.max, Math.max(f.min, v)), y = resp(tol, x);
  return <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: 420, display: 'block'}} role="img" aria-label={`Кривая выносливости: ${f.name}. Сейчас ${zone(y)}`}>
    <rect x={px(cl(tol[1]))} y={8} width={Math.max(0, px(cl(tol[2])) - px(cl(tol[1])))} height={H - 26} fill={f.col} opacity=".16"/>
    <line x1="8" y1={H - 18} x2={W - 8} y2={H - 18} stroke="var(--bd)" strokeWidth="2"/>
    <polyline points={pts} fill="none" stroke={f.col} strokeWidth="3" strokeLinejoin="round"/>
    <line x1={px(x)} y1={6} x2={px(x)} y2={H - 18} stroke="var(--tx)" strokeDasharray="4 3"/><circle cx={px(x)} cy={py(y)} r="6" fill={y <= 0 ? '#b91c1c' : f.col} stroke="#fff" strokeWidth="2"/>
    <text x={(px(cl(tol[1])) + px(cl(tol[2]))) / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="var(--mu)">оптимум</text>
    <text x="8" y={H - 4} fontSize="11" fill="var(--mu)">{f.min}</text><text x={W - 8} y={H - 4} textAnchor="end" fontSize="11" fill="var(--mu)">{f.max}</text></svg>;
}

function build(kind: string) {
  const root = new THREE.Group(), plant = new THREE.Group(); root.add(plant);
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.6, 48), new THREE.MeshStandardMaterial({color: '#8a6a44', roughness: 1})); ground.position.y = -0.3; root.add(ground);
  const top = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), new THREE.MeshStandardMaterial({color: '#9c7a4e', roughness: 1})); top.rotation.x = -Math.PI / 2; top.position.y = 0.005; root.add(top);
  const green = new THREE.MeshStandardMaterial({color: '#3f9a45', roughness: 0.7}), wood = new THREE.MeshStandardMaterial({color: '#7a5a3a', roughness: 0.9});
  const parts: THREE.Object3D[] = [];
  if (kind === 'wheat') for (let i = 0; i < 26; i++) { const g = new THREE.Group(), a = i * 2.4, r = 0.25 + (i % 7) * 0.22; g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.9, 6), green); st.position.y = 0.95; g.add(st); const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.34, 4, 8), green); ear.position.y = 2.05; g.add(ear); const lf = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), green); lf.scale.set(1, 0.08, 0.16); lf.position.set(0.22, 0.9, 0); lf.rotation.z = 0.6; g.add(lf); plant.add(g); parts.push(g); }
  if (kind === 'saxaul') { const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 1.3, 8), wood); tr.position.y = 0.65; tr.rotation.z = 0.15; plant.add(tr); for (let i = 0; i < 16; i++) { const g = new THREE.Group(), a = i * 2.4, b = 0.4 + (i % 4) * 0.25; g.position.set(0.15, 1.2, 0); g.rotation.set(Math.sin(a) * b, a, Math.cos(a) * b); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 1.3, 6), wood); br.position.y = 0.65; g.add(br); for (let j = 0; j < 4; j++) { const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 5), green); tw.position.set(0.12 * (j % 2 ? 1 : -1), 0.6 + j * 0.2, 0); tw.rotation.z = (j % 2 ? -1 : 1) * 0.7; g.add(tw); } plant.add(g); parts.push(g); } }
  if (kind === 'spruce') { const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.2, 3.4, 8), wood); tr.position.y = 1.7; plant.add(tr); for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.25 - i * 0.15, 0.85, 14), green); c.position.y = 0.9 + i * 0.44; plant.add(c); parts.push(c); } }
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), new THREE.MeshBasicMaterial({color: '#ffd84a'})); sun.position.set(-3.4, 5.2, -2); root.add(sun);
  const N = 120, rain = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 4), new THREE.MeshBasicMaterial({color: '#9bd3ff'}), N), d = new THREE.Object3D(), seeds = Array.from({length: N}, (_, i) => [((i * 37) % 100) / 100, ((i * 61) % 100) / 100, ((i * 17) % 100) / 100]); rain.frustumCulled = false; root.add(rain);
  const cg = new THREE.Color(), dry = new THREE.Color('#b08a3c'), dead = new THREE.Color('#6b5236'), ok = new THREE.Color('#3f9a45'), wet = new THREE.Color('#5d4630'), soil = new THREE.Color('#b39160'); let h = 1;
  const update = (time: number, s: {t: number; w: number; l: number; health: number}, dt: number) => {
    h += (s.health - h) * Math.min(1, dt * 3);
    cg.copy(dead).lerp(dry, Math.min(1, h * 2)).lerp(ok, Math.max(0, h * 2 - 1)); green.color.copy(cg);
    plant.scale.set(0.75 + 0.25 * h, 0.55 + 0.45 * h, 0.75 + 0.25 * h);
    parts.forEach((p, i) => { const droop = (1 - h) * (kind === 'spruce' ? 0.12 : 0.9); if (kind === 'wheat') p.rotation.set(Math.sin(i * 1.7) * droop + Math.sin(time * 1.6 + i) * 0.04 * h, 0, Math.cos(i * 1.3) * droop); else if (kind === 'spruce') { p.scale.set(1 - (1 - h) * 0.35, 1 - droop, 1 - (1 - h) * 0.35); } else p.scale.setScalar(1 - (1 - h) * 0.25); });
    (top.material as THREE.MeshStandardMaterial).color.copy(soil).lerp(wet, s.w / 100);
    sun.scale.setScalar(0.4 + s.l / 100 * 1.1); (sun.material as THREE.MeshBasicMaterial).color.set(s.l < 15 ? '#8e8f9a' : '#ffd84a');
    const nr = Math.round(Math.max(0, (s.w - 35) / 65) * N), snow = s.t < 0;
    for (let i = 0; i < N; i++) { const q = seeds[i], y = 5.5 - ((time * (snow ? 0.6 : 2.6) + q[2] * 6) % 5.5); d.position.set(-3.6 + q[0] * 7.2, y, -3 + q[1] * 6); d.scale.set(snow ? 4 : 1, i < nr ? (snow ? 0.25 : 1) : 0.0001, snow ? 4 : 1); d.updateMatrix(); rain.setMatrixAt(i, d.matrix); }
    rain.instanceMatrix.needsUpdate = true; (rain.material as THREE.MeshBasicMaterial).color.set(snow ? '#ffffff' : '#9bd3ff');
  };
  return {root, update};
}

export default function Factor3D() {
  const host = useRef<HTMLDivElement>(null);
  const [k, setK] = useState('wheat'), [v, setV] = useState<any>({t: 22, w: 60, l: 80}), [err, setErr] = useState('');
  const sp = SPECIES[k], rs = F.map(f => resp((sp as any)[f.k], v[f.k])), health = Math.min(...rs), lim = rs.indexOf(health);
  const st = useRef<any>({}); st.current = {...v, health};
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь графиками ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(), bg = new THREE.Color(); scene.background = bg;
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    const sun = new THREE.DirectionalLight('#fff4d6', 2); sun.position.set(-4, 8, 4); scene.add(sun); const hemi = new THREE.HemisphereLight('#dbeafe', '#8a7a5a', 0.8); scene.add(hemi);
    const {root, update} = build(k); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.48; ctl.minDistance = 5; ctl.maxDistance = 20; ctl.target.set(0, 1.6, 0);
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { const dd = Math.max(10, 11 / (w / h)); cam.position.set(0, dd * 0.3 + 1.2, dd); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(), cold = new THREE.Color('#cfe4f7'), mild = new THREE.Color('#bfe3ff'), hot = new THREE.Color('#ffd9a8'), night = new THREE.Color('#2b3350'); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; const s = st.current;
      bg.copy(s.t < 10 ? cold : mild).lerp(hot, Math.max(0, Math.min(1, (s.t - 25) / 25))).lerp(night, Math.max(0, 1 - s.l / 45) * 0.85); sun.intensity = 0.3 + s.l / 100 * 2.2; hemi.intensity = 0.35 + s.l / 100 * 0.6;
      update(t, s, dt); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => x.dispose()); }); r.dispose(); el.removeChild(r.domElement); };
  }, [k]);
  const opt = () => setV({t: Math.round((sp.t[1] + sp.t[2]) / 2), w: Math.round((sp.w[1] + sp.w[2]) / 2), l: Math.round(Math.min(100, (sp.l[1] + sp.l[2]) / 2))});
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-опыт: как факторы среды действуют на растение</b>
    {Object.entries(SPECIES).map(([id, s]) => <button key={id} className={k === id ? '' : 's'} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => setK(id)}>{s.em} {s.name}</button>)}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(60vh, 440px)', margin: '0 10px', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      <div className="warn" aria-live="polite"><b>{sp.name} ({sp.where}): {health <= 0 ? 'растение гибнет' : health < 0.5 ? 'растению плохо' : health < 1 ? 'растение угнетено' : 'растению хорошо'}.</b> {health >= 1 ? 'Все три фактора в зоне оптимума.' : `Ограничивающий фактор — ${F[lim].name.toLowerCase()}: он дальше всех от оптимума, поэтому именно он определяет состояние растения.`}</div>
      {F.map((f, i) => <div key={f.k} style={{marginTop: 10}}><label htmlFor={'f' + f.k}><b>{f.name}: {v[f.k]}{f.unit}</b> <span className="tag" style={i === lim && health < 1 ? {background: '#fde2e2', color: '#991b1b'} : {}}>{zone(rs[i])}</span></label>
        <input id={'f' + f.k} type="range" min={f.min} max={f.max} value={v[f.k]} onChange={e => setV({...v, [f.k]: +e.target.value})} style={{width: '100%', padding: 0, border: 0, accentColor: f.col, minHeight: 36}}/>
        <Curve tol={(sp as any)[f.k]} f={f} x={v[f.k]}/></div>)}
      <button className="s" onClick={opt}>↺ Вернуть оптимум</button>
      <div className="mu" style={{marginTop: 6}}>Закрашенная полоса на графике — зона оптимума. Чем дальше от неё, тем хуже растению; за пределами выносливости оно гибнет. Числа учебные, условные.</div></div></div>;
}

const SORT: [string, number][] = [['Температура воздуха', 0], ['Хищник охотится на сайгака', 1], ['Вырубка леса', 2], ['Солёность воды', 0], ['Пчёлы опыляют цветки', 1], ['Свет', 0], ['Выбросы завода', 2], ['Конкуренция трав за воду', 1], ['Создание заповедника', 2]];
const GR = ['Абиотический', 'Биотический', 'Антропогенный'];
export function FactorSort() {
  const [a, setA] = useState<Record<number, number>>({});
  const done = Object.keys(a).length === SORT.length, right = SORT.filter((s, i) => a[i] === s[1]).length;
  return <div className="card"><h3>Проверь себя: к какой группе относится фактор?</h3>
    {SORT.map(([t, g], i) => <div key={t} style={{padding: '8px 0', borderBottom: '1px solid var(--bd)'}}><b>{t}</b> {a[i] !== undefined && <span style={{color: a[i] === g ? '#15803d' : '#b91c1c', fontWeight: 700}}>{a[i] === g ? '✓ верно' : `✗ это ${GR[g].toLowerCase()} фактор`}</span>}
      <div>{GR.map((n, j) => <button key={n} className={a[i] === j ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.88rem'}} onClick={() => setA({...a, [i]: j})}>{n}</button>)}</div></div>)}
    {done && <div className="warn" style={{marginTop: 8}}><b>Верно {right} из {SORT.length}.</b> <button className="s" onClick={() => setA({})}>Пройти ещё раз</button></div>}</div>;
}
