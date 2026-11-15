import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

type Part = {k: string; n: string; c: string; t: string};
const M: Record<string, {name: string; note: string; parts: Part[]}> = {
  bac: {name: '🦠 Бактерия', note: 'Бактерия — одна клетка без ядра. Размер — тысячные доли миллиметра.', parts: [
    {k: 'caps', n: 'Капсула', c: '#93c5fd', t: 'Слизистый слой снаружи. Защищает от высыхания и от защитных клеток организма хозяина. Есть не у всех бактерий.'},
    {k: 'wall', n: 'Клеточная стенка', c: '#a3b86c', t: 'Плотная оболочка, придаёт клетке форму и защищает её.'},
    {k: 'memb', n: 'Клеточная мембрана', c: '#f59e0b', t: 'Тонкая плёнка под стенкой. Пропускает в клетку нужные вещества и выводит ненужные.'},
    {k: 'cyto', n: 'Цитоплазма', c: '#fde68a', t: 'Полужидкое содержимое клетки, в котором идут все процессы жизнедеятельности.'},
    {k: 'dna', n: 'Кольцевая ДНК (нуклеоид)', c: '#ef4444', t: 'У бактерий нет оформленного ядра: молекула ДНК замкнута в кольцо и лежит прямо в цитоплазме. Поэтому бактерии — прокариоты (доядерные).'},
    {k: 'ribo', n: 'Рибосомы', c: '#7c3aed', t: 'Мелкие органоиды, на которых образуются белки.'},
    {k: 'flag', n: 'Жгутик', c: '#34d399', t: 'Вращается, как винт, и двигает бактерию. Есть не у всех бактерий.'},
    {k: 'pili', n: 'Ворсинки (пили)', c: '#f472b6', t: 'Помогают прикрепляться к поверхностям и к другим клеткам.'}]},
  vir: {name: '⚛️ Вирус', note: 'Вирус — неклеточная форма жизни. Он в сотни раз меньше бактерии и размножается только внутри живой клетки.', parts: [
    {k: 'na', n: 'Нуклеиновая кислота (ДНК или РНК)', c: '#ef4444', t: 'Наследственная информация вируса: «инструкция», по которой заражённая клетка собирает новые вирусы.'},
    {k: 'capsid', n: 'Капсид (белковая оболочка)', c: '#60a5fa', t: 'Защищает нуклеиновую кислоту. Состоит из одинаковых белковых частиц, часто имеет форму правильного многогранника.'},
    {k: 'env', n: 'Наружная оболочка', c: '#fbbf24', t: 'Есть у некоторых вирусов (например, у вируса гриппа). Вирус получает её из мембраны клетки хозяина, когда выходит наружу.'},
    {k: 'spike', n: 'Шипики', c: '#f472b6', t: 'Белки на поверхности. Ими вирус узнаёт «свою» клетку и прикрепляется к ней, как ключ к замку.'}]},
  phage: {name: '🔩 Бактериофаг', note: 'Бактериофаг — вирус, поражающий бактерий. Его используют для лечения некоторых бактериальных инфекций.', parts: [
    {k: 'head', n: 'Головка', c: '#60a5fa', t: 'Белковая оболочка в форме многогранника. Внутри неё упакована ДНК.'},
    {k: 'na', n: 'ДНК', c: '#ef4444', t: 'Наследственная информация фага. Он впрыскивает её в бактерию, сам фаг остаётся снаружи.'},
    {k: 'tail', n: 'Хвост (чехол)', c: '#a78bfa', t: 'Полая трубка с сократимым чехлом. Чехол сжимается и проталкивает ДНК в бактерию, как шприц.'},
    {k: 'plate', n: 'Базальная пластинка', c: '#fbbf24', t: 'Площадка на конце хвоста, которой фаг закрепляется на поверхности бактерии.'},
    {k: 'fib', n: 'Хвостовые нити', c: '#34d399', t: 'Тонкие «ножки». Ими фаг находит бактерию и прикрепляется к её клеточной стенке.'}]},
};
const fib = (n: number, i: number) => { const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996; return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); };

function build(kind: string, clip: THREE.Plane) {
  const root = new THREE.Group(), mats: Record<string, THREE.MeshPhysicalMaterial[]> = {}, spin: THREE.Object3D[] = [];
  const mat = (k: string, op = 1, cut = false, extra: any = {}) => { const c = M[kind].parts.find(p => p.k === k)!.c; const m = new THREE.MeshPhysicalMaterial({color: c, roughness: 0.4, clearcoat: 0.6, transparent: op < 1, opacity: op, depthWrite: op >= 0.9, side: THREE.DoubleSide, clippingPlanes: cut ? [clip] : [], ...extra}); (mats[k] = mats[k] || []).push(m); return m; };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, p?: [number, number, number], r?: [number, number, number], s?: [number, number, number]) => { const o = new THREE.Mesh(g, m); if (p) o.position.set(...p); if (r) o.rotation.set(...r); if (s) o.scale.set(...s); root.add(o); return o; };
  const Z: [number, number, number] = [0, 0, Math.PI / 2];
  if (kind === 'bac') {
    add(new THREE.CapsuleGeometry(1.12, 2.6, 16, 40), mat('caps', 0.3, true), undefined, Z).renderOrder = 5;
    add(new THREE.CapsuleGeometry(1.0, 2.6, 16, 40), mat('wall', 1, true), undefined, Z);
    add(new THREE.CapsuleGeometry(0.93, 2.6, 16, 40), mat('memb', 1, true), undefined, Z);
    add(new THREE.CapsuleGeometry(0.88, 2.6, 16, 40), mat('cyto', 0.35, true, {depthWrite: false}), undefined, Z).renderOrder = 2;
    add(new THREE.TorusKnotGeometry(0.42, 0.05, 220, 10, 3, 7), mat('dna'), [0.1, 0, -0.1], [0.4, 0.2, 0], [1.9, 1, 1]);
    const rm = mat('ribo'), ri = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), rm, 90), d = new THREE.Object3D(); let sd = 5; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 90; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.7; d.position.set(-1.9 + rnd() * 3.8, Math.cos(a) * r, -Math.abs(Math.sin(a) * r) - 0.03); if (Math.abs(d.position.x) > 1.3) d.position.multiply(new THREE.Vector3(1, 0.6, 0.6)); d.updateMatrix(); ri.setMatrixAt(i, d.matrix); } root.add(ri);
    const pts = Array.from({length: 60}, (_, i) => new THREE.Vector3(-i * 0.06, Math.sin(i * 0.5) * 0.2 * Math.min(1, i / 8), Math.cos(i * 0.5) * 0.2 * Math.min(1, i / 8)));
    const fg = new THREE.Group(); fg.position.set(-2.4, 0, 0); fg.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.045, 8), mat('flag'))); root.add(fg); spin.push(fg);
    const pm = mat('pili'), up = new THREE.Vector3(0, 1, 0); for (let i = 0; i < 46; i++) { const a = i * 1.37 + (i % 3) * 0.5, x = -1.9 + ((i * 0.618) % 1) * 3.8, v = new THREE.Vector3(0, Math.cos(a), -Math.abs(Math.sin(a))); const o = add(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 5), pm, [x, v.y * 1.28, v.z * 1.28]); o.quaternion.setFromUnitVectors(up, v); }
  } else if (kind === 'vir') {
    add(new THREE.SphereGeometry(1.22, 48, 32), mat('env', 0.55, true)).renderOrder = 5;
    add(new THREE.IcosahedronGeometry(0.98, 1), mat('capsid', 1, true, {flatShading: true}));
    add(new THREE.TorusKnotGeometry(0.42, 0.055, 200, 10, 2, 5), mat('na'));
    const sm = mat('spike', 1, true), st = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 6), sm, 60), hd = new THREE.InstancedMesh(new THREE.SphereGeometry(0.085, 10, 8), sm, 60), d = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 60; i++) { const v = fib(60, i); d.quaternion.setFromUnitVectors(up, v); d.position.copy(v).multiplyScalar(1.36); d.updateMatrix(); st.setMatrixAt(i, d.matrix); d.position.copy(v).multiplyScalar(1.55); d.updateMatrix(); hd.setMatrixAt(i, d.matrix); } root.add(st, hd);
  } else {
    add(new THREE.IcosahedronGeometry(0.75, 0), mat('head', 0.5, false, {flatShading: true, depthWrite: false}), [0, 1.55, 0], undefined, [1, 1.3, 1]).renderOrder = 5;
    add(new THREE.TorusKnotGeometry(0.3, 0.045, 160, 8, 2, 5), mat('na'), [0, 1.55, 0], [1.2, 0, 0]);
    add(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16), mat('tail'), [0, 0.6, 0]);
    for (let i = 0; i < 12; i++) add(new THREE.TorusGeometry(0.2, 0.06, 8, 20), mats.tail[0], [0, 0.45 - i * 0.12, 0], [Math.PI / 2, 0, 0]);
    add(new THREE.CylinderGeometry(0.42, 0.34, 0.12, 6), mat('plate'), [0, -1.0, 0]);
    const fm = mat('fib'); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, g = new THREE.Group(); g.rotation.y = a; const u = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), fm); u.position.set(0.62, -0.72, 0); u.rotation.z = -1.0; const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), fm); l.position.set(1.12, -1.0, 0); l.rotation.z = 0.5; g.add(u, l); root.add(g); }
    root.position.y = -0.2;
  }
  const update = (t: number, s: {sel: string; cut: boolean}, dt: number) => {
    spin.forEach(o => { o.rotation.x += dt * 9; });
    Object.entries(mats).forEach(([k, arr]) => arr.forEach(m => { const on = s.sel === k; m.emissive.set(on ? '#ffd166' : '#000'); m.emissiveIntensity = on ? 0.4 + 0.15 * Math.sin(t * 5) : 0; if (m.clippingPlanes && (m as any).userData.cut === undefined) (m as any).userData.cut = m.clippingPlanes.length > 0; m.clippingPlanes = (m as any).userData.cut && s.cut ? [clip] : []; }));
  };
  return {root, update};
}

export default function Micro3D() {
  const host = useRef<HTMLDivElement>(null);
  const [k, setK] = useState('bac'), [sel, setSel] = useState('dna'), [cut, setCut] = useState(true), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {sel, cut};
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь описанием ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.localClippingEnabled = true;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    const a = new THREE.DirectionalLight('#fff', 1.4); a.position.set(3, 6, 7); scene.add(a);
    const {root, update} = build(k, new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.minDistance = 3; ctl.maxDistance = 20;
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { const need = k === 'bac' ? 9.5 : 5.2, dd = Math.max(k === 'bac' ? 9 : 7.5, need / (w / h)); cam.position.set(dd * 0.3, dd * 0.22, dd); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; update(t, st.current, dt); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => x.dispose()); }); pm.dispose(); r.dispose(); el.removeChild(r.domElement); };
  }, [k]);
  const m = M[k], cur = m.parts.find(p => p.k === sel) || m.parts[0], tg = {minHeight: 40, padding: '4px 10px'};
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модели: бактерия, вирус, бактериофаг</b>
    {Object.entries(M).map(([id, x]) => <button key={id} className={k === id ? '' : 's'} style={tg} onClick={() => { setK(id); setSel(M[id].parts[0].k); }}>{x.name}</button>)}
    {k !== 'phage' && <button className={cut ? '' : 's'} aria-pressed={cut} style={tg} onClick={() => setCut(!cut)}>✂ Разрез</button>}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(60vh, 460px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 35%, #16384a 0%, #0b1220 78%)', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      <div className="mu">{m.note}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{m.parts.map(p => <button key={p.k} className={cur.k === p.k ? '' : 's'} style={{minHeight: 38, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setSel(p.k)}><span style={{color: cur.k === p.k ? '#fff' : p.c}} aria-hidden="true">●</span> {p.n}</button>)}</div>
      <div className="warn" aria-live="polite"><b>{cur.n}.</b> {cur.t}</div>
      <div className="mu" style={{marginTop: 8}}>Модели упрощены, цвета условные, размеры не в масштабе: вирус намного меньше бактерии. Вращай модель пальцем или мышью.</div></div></div>;
}

const SH: {n: string; ex: string; draw: JSX.Element}[] = [
  {n: 'Кокки (шаровидные)', ex: 'одиночные шарики', draw: <>{[[30, 30], [62, 44], [44, 66]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="11"/>)}</>},
  {n: 'Диплококки', ex: 'по два: возбудитель пневмонии', draw: <>{[[24, 34], [44, 34], [50, 64], [70, 64]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="10"/>)}</>},
  {n: 'Стрептококки', ex: 'цепочкой: возбудитель ангины', draw: <>{[0, 1, 2, 3, 4, 5].map(i => <circle key={i} cx={14 + i * 14} cy={48 + Math.sin(i * 1.1) * 14} r="7.5"/>)}</>},
  {n: 'Стафилококки', ex: 'гроздью: вызывают нагноения', draw: <>{[[40, 30], [56, 30], [32, 44], [48, 44], [64, 44], [40, 58], [56, 58], [48, 72]].map(([x, y]) => <circle key={x + '' + y} cx={x} cy={y} r="8"/>)}</>},
  {n: 'Бациллы (палочки)', ex: 'кишечная и сенная палочки', draw: <>{[[20, 24, 20], [38, 52, -30], [26, 70, 8]].map(([x, y, r]) => <rect key={y} x={x} y={y} width="40" height="14" rx="7" transform={`rotate(${r} ${x + 20} ${y + 7})`}/>)}</>},
  {n: 'Вибрионы (запятые)', ex: 'холерный вибрион', draw: <>{[[24, 30], [50, 56]].map(([x, y]) => <path key={x} d={`M${x} ${y} q16 -14 30 4`} fill="none" strokeWidth="12" strokeLinecap="round" className="st"/>)}</>},
  {n: 'Спириллы (спирали)', ex: 'извитые, как штопор', draw: <path d="M12 48 q8 -22 16 0 t16 0 t16 0 t16 0" fill="none" strokeWidth="9" strokeLinecap="round" className="st"/>},
];
export function Shapes() {
  return <div className="card"><h3>Формы бактерий</h3><div className="shp">{SH.map(s => <div key={s.n} className="shc"><svg viewBox="0 0 96 96" role="img" aria-label={s.n}><circle cx="48" cy="48" r="46" fill="var(--bg)" stroke="var(--bd)" strokeWidth="2"/><g fill="#12806f" stroke="#0d5c50" strokeWidth="1.5">{s.draw}</g></svg><b>{s.n}</b><div className="mu">{s.ex}</div></div>)}</div></div>;
}

const COND = [{n: '🌡️ В тепле (+37 °C)', dt: 20, t: 'В тепле при наличии пищи и влаги бактерии делятся примерно каждые 20–30 минут.'}, {n: '🧊 В холодильнике (+4 °C)', dt: 600, t: 'На холоде бактерии не погибают, но делятся очень медленно. Поэтому продукты в холодильнике хранятся дольше.'}, {n: '♨️ Кипячение (+100 °C)', dt: 0, t: 'При кипячении большинство бактерий погибает. Но споры некоторых бактерий выдерживают кипячение — для их уничтожения нужна стерилизация.'}];
export function Growth() {
  const [c, setC] = useState(0), [h, setH] = useState(2), dt = COND[c].dt, gen = dt ? Math.floor(h * 60 / dt) : 0, n = dt ? Math.pow(2, gen) : 0;
  const fmt = (x: number) => x >= 1e9 ? (x / 1e9).toFixed(1).replace('.0', '') + ' млрд' : x >= 1e6 ? (x / 1e6).toFixed(1).replace('.0', '') + ' млн' : x.toLocaleString('ru-RU'), dots = Math.min(160, n);
  return <div className="card"><h3>Опыт: как быстро размножаются бактерии</h3>
    <div className="mu">В молоко попала одна бактерия. Выбери условия и время и посмотри, сколько их станет.</div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{COND.map((x, i) => <button key={x.n} className={c === i ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setC(i)}>{x.n}</button>)}</div>
    <label htmlFor="gh"><b>Прошло времени: {h} ч</b></label><input id="gh" type="range" min={0} max={10} step={0.5} value={h} onChange={e => setH(+e.target.value)} style={{width: '100%', padding: 0, border: 0, minHeight: 36, accentColor: 'var(--g)'}}/>
    <div style={{minHeight: 84, background: 'var(--bg)', borderRadius: 14, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 3, alignContent: 'flex-start'}} aria-hidden="true">{Array.from({length: dots}, (_, i) => <span key={i} style={{width: 14, height: 7, borderRadius: 4, background: '#12806f'}}/>)}{n > 160 && <b style={{marginLeft: 6}}>…и ещё очень много</b>}{n === 0 && <span className="mu">Живых бактерий нет</span>}</div>
    <div className="warn" aria-live="polite" style={{marginTop: 8}}><b>{dt ? `Делений: ${gen}. Бактерий: ${fmt(n)}.` : 'Бактерии погибли.'}</b> {COND[c].t}</div>
    <div className="mu" style={{marginTop: 6}}>Расчёт упрощён: в жизни рост замедляется, когда заканчивается пища и накапливаются продукты обмена. Бактерии делятся пополам — это бесполое размножение.</div></div>;
}

const CY = ['Прикрепление: вирус узнаёт клетку и прикрепляется к её поверхности.', 'Проникновение: в клетку попадает нуклеиновая кислота вируса (у фага белковая оболочка остаётся снаружи).', 'Копирование: клетка по «инструкции» вируса начинает производить его нуклеиновую кислоту и белки вместо своих.', 'Сборка: из готовых частей собираются сотни новых вирусов.', 'Выход: клетка разрушается, вирусы выходят наружу и заражают соседние клетки.'];
export function VirusCycle() {
  const [s, setS] = useState(0);
  const ph = (x: number, y: number, k: number) => <g key={k} transform={`translate(${x} ${y}) scale(.9)`}><path d="M0 -16 L10 -8 L10 4 L0 12 L-10 4 L-10 -8 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1.5"/><rect x="-2.5" y="12" width="5" height="14" fill="#a78bfa"/><path d="M0 26 L-9 34 M0 26 L9 34" stroke="#34d399" strokeWidth="2"/></g>;
  return <div className="card"><h3>Как вирус размножается в клетке</h3>
    <div className="duo"><div className="art"><svg viewBox="0 0 300 200" role="img" aria-label={`Шаг ${s + 1}: ${CY[s]}`}>
      <rect x="40" y="96" width="220" height="84" rx="42" fill={s === 4 ? '#fecaca' : '#d9f2c4'} stroke="#6b8f3a" strokeWidth="3" strokeDasharray={s === 4 ? '10 8' : undefined}/>
      <path d="M110 138 q14 -22 28 0 t28 0 t28 0" fill="none" stroke="#ef4444" strokeWidth="3" opacity=".5"/>
      {s === 0 && ph(150, 62, 0)}{s >= 1 && s < 4 && <g opacity=".45">{ph(150, 62, 0)}</g>}
      {s === 1 && <path d="M150 96 q6 14 0 28" stroke="#b91c1c" strokeWidth="3.5" fill="none" className="npulse"/>}
      {s === 2 && [0, 1, 2, 3].map(i => <path key={i} d={`M${86 + i * 36} 150 q5 -10 10 0 t10 0`} stroke="#b91c1c" strokeWidth="3" fill="none"/>)}
      {s === 3 && [0, 1, 2, 3, 4].map(i => ph(80 + i * 35, 132, i))}
      {s === 4 && [[60, 50], [110, 30], [170, 26], [230, 48], [270, 110], [28, 120], [150, 70]].map(([x, y], i) => ph(x, y, i))}</svg></div>
      <div><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>{CY.map((_, i) => <button key={i} className={s === i ? '' : 's'} style={{minHeight: 38, padding: '2px 14px'}} onClick={() => setS(i)} aria-label={`Шаг ${i + 1}`}>{i + 1}</button>)}<button className="s" style={{minHeight: 38}} onClick={() => setS((s + 1) % 5)}>Дальше ▶</button></div>
        <div className="warn" aria-live="polite" style={{marginTop: 8}}><b>Шаг {s + 1} из 5.</b> {CY[s]}</div>
        <p>Вне клетки вирус не питается, не дышит и не размножается — он похож на неживую частицу. Поэтому антибиотики на вирусы не действуют: они рассчитаны на живые клетки бактерий.</p></div></div></div>;
}
