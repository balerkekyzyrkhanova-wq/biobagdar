import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const SEQ = 'ATGCCGTAAGCTTGACGT', PAIR: Record<string, string> = {A: 'T', T: 'A', G: 'C', C: 'G'};
const BC: Record<string, string> = {A: '#22c55e', T: '#ef4444', G: '#3b82f6', C: '#eab308'}, BN: Record<string, string> = {A: 'аденин', T: 'тимин', G: 'гуанин', C: 'цитозин'};
const G0 = 5, G1 = 12;

function letter(ch: string) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d')!; x.font = '700 46px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 6; x.strokeStyle = 'rgba(0,0,0,.55)'; x.strokeText(ch, 32, 34); x.fillStyle = '#fff'; x.fillText(ch, 32, 34);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false});
}
function build() {
  const root = new THREE.Group(), N = SEQ.length, rise = 0.44, R = 1.05, pick: THREE.Mesh[] = [];
  const lm: Record<string, THREE.SpriteMaterial> = {A: letter('А'), T: letter('Т'), G: letter('Г'), C: letter('Ц')};
  const bm: Record<string, THREE.MeshPhysicalMaterial> = {}; Object.entries(BC).forEach(([k, c]) => { bm[k] = new THREE.MeshPhysicalMaterial({color: c, roughness: 0.35, clearcoat: 0.6}); });
  const back = new THREE.MeshPhysicalMaterial({color: '#cbd5e1', roughness: 0.3, clearcoat: 0.8}), gene = new THREE.MeshPhysicalMaterial({color: '#f59e0b', roughness: 0.3, clearcoat: 0.8, emissive: '#f59e0b', emissiveIntensity: 0.25});
  const half = new THREE.CylinderGeometry(0.11, 0.11, R * 0.92, 12); half.rotateZ(Math.PI / 2); const sph = new THREE.SphereGeometry(0.2, 18, 12), link = new THREE.CylinderGeometry(0.1, 0.1, 1, 10);
  const pairs = Array.from(SEQ).map((b, i) => { const g = new THREE.Group(); g.position.y = (i - (N - 1) / 2) * rise; root.add(g);
    const mk = (base: string, sx: number) => { const m = new THREE.Mesh(half, bm[base].clone()); m.position.x = sx * R * 0.5; m.userData.i = i; g.add(m); pick.push(m); const s = new THREE.Sprite(lm[base]); s.scale.setScalar(0.42); s.position.set(sx * R * 0.5, 0, 0); s.renderOrder = 20; g.add(s); const bb = new THREE.Mesh(sph, back); bb.position.x = sx * R; g.add(bb); return {m, bb}; };
    return {g, a: mk(b, -1), b: mk(PAIR[b], 1)}; });
  const links = [0, 1].map(side => Array.from({length: N - 1}, () => { const m = new THREE.Mesh(link, back); root.add(m); return {m, side}; }));
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(); let tw = 0.62;
  const update = (t: number, s: {helix: boolean; gene: boolean; sel: number}, dt: number) => {
    tw += ((s.helix ? 0.62 : 0) - tw) * Math.min(1, dt * 3);
    pairs.forEach((p, i) => { p.g.rotation.y = i * tw; const ing = s.gene && i >= G0 && i <= G1, on = s.sel === i; p.a.bb.material = p.b.bb.material = ing ? gene : back;
      [p.a.m, p.b.m].forEach(m => { const mm = m.material as THREE.MeshPhysicalMaterial; mm.emissive.set(on ? '#ffffff' : '#000'); mm.emissiveIntensity = on ? 0.35 + 0.15 * Math.sin(t * 6) : 0; }); p.g.scale.setScalar(on ? 1.12 : 1); });
    links.forEach(arr => arr.forEach((l, i) => { const A = pairs[i], B = pairs[i + 1]; (l.side ? A.b.bb : A.a.bb).getWorldPosition(va); (l.side ? B.b.bb : B.a.bb).getWorldPosition(vb); root.worldToLocal(va); root.worldToLocal(vb);
      l.m.position.copy(va).add(vb).multiplyScalar(0.5); dir.copy(vb).sub(va); l.m.scale.set(1, dir.length(), 1); l.m.quaternion.setFromUnitVectors(up, dir.normalize()); l.m.material = s.gene && i >= G0 && i < G1 ? gene : back; }));
  };
  return {root, update, pick};
}

export default function DNA3D() {
  const host = useRef<HTMLDivElement>(null);
  const [helix, setHelix] = useState(true), [gene, setGene] = useState(false), [sel, setSel] = useState(-1), [spin, setSpin] = useState(true), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {helix, gene, sel, spin};
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь текстом ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none;cursor:pointer';
    const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    const a = new THREE.DirectionalLight('#fff', 1.6); a.position.set(3, 6, 7); scene.add(a);
    const {root, update, pick} = build(); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.minDistance = 4; ctl.maxDistance = 22;
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { cam.position.set(0, 0.5, Math.max(13, 6.5 / (w / h))); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const ray = new THREE.Raycaster(), v = new THREE.Vector2(); let dx = 0, dy = 0;
    const down = (e: PointerEvent) => { dx = e.clientX; dy = e.clientY; };
    const up = (e: PointerEvent) => { if (Math.hypot(e.clientX - dx, e.clientY - dy) > 8) return; const b = r.domElement.getBoundingClientRect(); v.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(v, cam); const h = ray.intersectObjects(pick)[0]; if (h) setSel(h.object.userData.i); };
    r.domElement.addEventListener('pointerdown', down); r.domElement.addEventListener('pointerup', up);
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; if (st.current.spin) root.rotation.y += dt * 0.35; update(t, st.current, dt); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); r.domElement.removeEventListener('pointerdown', down); r.domElement.removeEventListener('pointerup', up); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); }); }); pm.dispose(); r.dispose(); el.removeChild(r.domElement); };
  }, []);
  const b = sel >= 0 ? SEQ[sel] : '', tg = {minHeight: 40, padding: '4px 10px'};
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель: молекула ДНК</b>
    <button className={helix ? '' : 's'} style={tg} onClick={() => setHelix(true)}>🧬 Спираль</button><button className={!helix ? '' : 's'} style={tg} onClick={() => setHelix(false)}>🪜 Раскрутить в лесенку</button>
    <button className={gene ? '' : 's'} aria-pressed={gene} style={tg} onClick={() => setGene(!gene)}>📍 Показать ген</button><button className="s" style={tg} onClick={() => setSpin(!spin)}>{spin ? '⏸ Остановить' : '▶ Вращать'}</button></div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(64vh, 500px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 35%, #1f3358 0%, #0b1220 78%)', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      <div className="warn" aria-live="polite">{sel >= 0 ? <><b>Пара {sel + 1}: <span style={{color: BC[b]}}>{BN[b]}</span> — <span style={{color: BC[PAIR[b]]}}>{BN[PAIR[b]]}</span>.</b> Основания соединяются только так: аденин с тимином, гуанин с цитозином. Это правило называется комплементарностью.</> : 'Нажми на любую «ступеньку» модели, чтобы узнать, какие основания в ней соединены.'}</div>
      {gene && <div className="warn" style={{marginTop: 8, borderColor: '#f59e0b'}}><b>Ген</b> — участок ДНК (здесь он выделен золотым), в котором записана информация об одном белке, а значит, об одном признаке. В настоящем гене не 8 пар, а сотни и тысячи.</div>}
      <p style={{margin: '8px 0'}}>ДНК похожа на закрученную верёвочную лестницу. <b>Перила</b> — две цепи, <b>ступеньки</b> — пары оснований. Порядок оснований и есть запись наследственной информации, как порядок букв в слове.</p>
      <div className="mu">{Object.entries(BC).map(([k, c]) => <span key={k} style={{marginRight: 12, whiteSpace: 'nowrap'}}><span style={{color: c}}>●</span> {BN[k]} ({({A: 'А', T: 'Т', G: 'Г', C: 'Ц'} as any)[k]})</span>)}</div>
      <div className="mu" style={{marginTop: 6}}>Модель упрощена: показаны только 18 пар, цвета условные. Вращай её пальцем или мышью.</div></div></div>;
}

const RU: Record<string, string> = {A: 'А', T: 'Т', G: 'Г', C: 'Ц'};
export function Complement() {
  const mk = () => Array.from({length: 7}, () => 'ATGC'[Math.floor(Math.random() * 4)]);
  const [q, setQ] = useState(mk), [a, setA] = useState<string[]>([]), [n, setN] = useState([0, 0]);
  const done = a.length === q.length, ok = done && a.every((x, i) => x === PAIR[q[i]]);
  const cell = (ch: string, i: number, wrong = false) => <span key={i} style={{display: 'inline-grid', placeItems: 'center', width: 38, height: 44, borderRadius: 10, margin: 2, fontWeight: 800, fontSize: '1.15rem', color: '#fff', background: ch ? BC[ch] : 'var(--bd)', outline: wrong ? '3px solid #b91c1c' : undefined}}>{ch ? RU[ch] : '?'}</span>;
  return <div className="card"><h3>Дострой вторую цепь ДНК</h3>
    <div className="mu">Дана одна цепь. Нажимай буквы по порядку, чтобы собрать вторую цепь по правилу: А — Т, Г — Ц.</div>
    <div style={{margin: '10px 0', overflowX: 'auto', whiteSpace: 'nowrap'}}><div><span className="mu" style={{display: 'inline-block', width: 64}}>1-я цепь</span>{q.map((c, i) => cell(c, i))}</div>
      <div><span className="mu" style={{display: 'inline-block', width: 64}}>2-я цепь</span>{q.map((c, i) => cell(a[i] || '', i, done && a[i] !== PAIR[c]))}</div></div>
    {!done ? <div>{'ATGC'.split('').map(c => <button key={c} style={{minWidth: 56, background: BC[c], boxShadow: 'none'}} onClick={() => { const na = [...a, c]; setA(na); if (na.length === q.length) setN([n[0] + (na.every((x, i) => x === PAIR[q[i]]) ? 1 : 0), n[1] + 1]); }}>{RU[c]}</button>)}<button className="s" onClick={() => setA(a.slice(0, -1))} disabled={!a.length}>⌫ Стереть</button></div>
      : <div className="warn" aria-live="polite"><b style={{color: ok ? '#15803d' : '#b91c1c'}}>{ok ? '✓ Верно! Цепи комплементарны.' : '✗ Есть ошибки (обведены красным).'}</b> {!ok && <>Правильно: {q.map(c => RU[PAIR[c]]).join(' ')}. </>}<button onClick={() => { setQ(mk()); setA([]); }}>Новая цепь ▶</button></div>}
    <div style={{marginTop: 6}}><b>Счёт: {n[0]} из {n[1]}</b></div></div>;
}

const SP: [string, number][] = [['👤 Человек', 46], ['🐒 Шимпанзе', 48], ['🐕 Собака', 78], ['🐈 Кошка', 38], ['🪰 Дрозофила', 8], ['🌱 Горох', 14], ['🌾 Мягкая пшеница', 42], ['🥔 Картофель', 48]];
export function Chromo() {
  const [i, setI] = useState(0), n2 = SP[i][1], n = n2 / 2;
  const circ = (x: number, y: number, r: number, t: string, c: string) => <g><circle cx={x} cy={y} r={r} fill={c} stroke="var(--mu)" strokeWidth="2.5"/><text x={x} y={y + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f2d29">{t}</text></g>;
  const ar = (x1: number, y1: number, x2: number, y2: number) => <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="var(--mu)" strokeWidth="2.5" markerEnd="url(#ah)"/>;
  const tx = (x: number, y: number, t: string, an: 'start' | 'middle' | 'end' = 'middle') => <text x={x} y={y} textAnchor={an} fontSize="12" fill="var(--mu)">{t}</text>;
  return <div className="card"><h3>Сколько хромосом в клетке</h3>
    <div className="mu">У каждого вида своё постоянное число хромосом. Выбери организм и проследи, как число хромосом сохраняется при размножении.</div>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{SP.map((s, k) => <button key={s[0]} className={i === k ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setI(k)}>{s[0]}</button>)}</div>
    <svg viewBox="0 0 520 310" role="img" aria-label={`Клетки тела: ${n2} хромосом, половые клетки: ${n}, зигота: ${n2}`} style={{display: 'block', width: '100%', maxWidth: 620, margin: '0 auto'}}>
      <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="var(--mu)"/></marker></defs>
      {tx(150, 14, 'клетка тела матери (2n)')}{tx(370, 14, 'клетка тела отца (2n)')}
      {circ(150, 60, 36, String(n2), '#fbcfe8')}{circ(370, 60, 36, String(n2), '#bfdbfe')}
      {ar(158, 100, 182, 138)}{ar(362, 100, 338, 138)}{tx(260, 116, 'число хромосом')}{tx(260, 131, 'уменьшается вдвое')}
      {circ(190, 168, 26, String(n), '#fce7f3')}{circ(330, 168, 26, String(n), '#dbeafe')}{tx(156, 172, 'яйцеклетка (n)', 'end')}{tx(364, 172, 'сперматозоид (n)', 'start')}
      {ar(204, 194, 236, 232)}{ar(316, 194, 284, 232)}{tx(260, 204, 'оплодотворение')}
      {circ(260, 262, 34, String(n2), '#ddd6fe')}{tx(304, 258, 'зигота (2n):', 'start')}{tx(304, 274, `${n} + ${n} = ${n2}`, 'start')}</svg>
    <div className="warn" aria-live="polite"><b>{SP[i][0].slice(2).trim()}: в клетках тела {n2} хромосом, в половых клетках — {n}.</b> Клетки тела содержат двойной (диплоидный, 2n) набор: каждая хромосома в паре, одна от матери, другая от отца. Половые клетки содержат одинарный (гаплоидный, n) набор. При оплодотворении наборы складываются, поэтому из поколения в поколение число хромосом не меняется.</div>
    <div className="mu" style={{marginTop: 6}}>Число хромосом не говорит о сложности организма: у картофеля их больше, чем у человека.</div></div>;
}

const SORT: [string, number][] = [['Цвет глаз', 0], ['Шрам на руке', 1], ['Группа крови', 0], ['Загар', 1], ['Умение плавать', 1], ['Форма мочки уха', 0], ['Знание казахского и русского языков', 1], ['Веснушки', 0], ['Сильные мышцы спортсмена', 1]];
const GR = ['Наследственный', 'Приобретённый'];
export function TraitSort() {
  const [a, setA] = useState<Record<number, number>>({});
  const done = Object.keys(a).length === SORT.length, right = SORT.filter((s, i) => a[i] === s[1]).length;
  return <div className="card"><h3>Проверь себя: наследственный или приобретённый признак?</h3>
    {SORT.map(([t, g], i) => <div key={t} style={{padding: '8px 0', borderBottom: '1px solid var(--bd)'}}><b>{t}</b> {a[i] !== undefined && <span style={{color: a[i] === g ? '#15803d' : '#b91c1c', fontWeight: 700}}>{a[i] === g ? '✓ верно' : `✗ это ${GR[g].toLowerCase()} признак`}</span>}
      <div>{GR.map((n, j) => <button key={n} className={a[i] === j ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.88rem'}} onClick={() => setA({...a, [i]: j})}>{n}</button>)}</div></div>)}
    {done && <div className="warn" style={{marginTop: 8}}><b>Верно {right} из {SORT.length}.</b> <button className="s" onClick={() => setA({})}>Пройти ещё раз</button></div>}</div>;
}
