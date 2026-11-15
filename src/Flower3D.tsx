import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const PARTS: {k: string; n: string; c: string; t: string}[] = [
  {k: 'petal', n: 'Лепестки (венчик)', c: '#f472b6', t: 'Яркие лепестки привлекают насекомых-опылителей и защищают тычинки и пестик.'},
  {k: 'sepal', n: 'Чашелистики (чашечка)', c: '#4ade80', t: 'Зелёные листочки снаружи. Защищают бутон, пока цветок не раскрылся.'},
  {k: 'stamen', n: 'Тычинки', c: '#facc15', t: 'Мужская часть цветка. Состоит из тычиночной нити и пыльника, в пыльнике созревает пыльца. В пыльце образуются мужские половые клетки — спермии.'},
  {k: 'pistil', n: 'Пестик', c: '#84cc16', t: 'Женская часть цветка. Состоит из рыльца (ловит пыльцу), столбика и завязи. Из завязи после оплодотворения развивается плод.'},
  {k: 'ovule', n: 'Семязачаток', c: '#fb923c', t: 'Находится внутри завязи. В нём есть яйцеклетка и крупная центральная клетка. Из семязачатка развивается семя.'},
];
const STEPS = [
  {t: 'Опыление', x: 'Пыльца с пыльника тычинки попадает на рыльце пестика. Её переносят насекомые, ветер, вода или птицы.'},
  {t: 'Пыльцевая трубка', x: 'Пыльцевое зерно на липком рыльце прорастает: длинная пыльцевая трубка растёт вниз по столбику к семязачатку в завязи.'},
  {t: 'Два спермия', x: 'По пыльцевой трубке к семязачатку движутся два спермия — мужские половые клетки.'},
  {t: 'Первое оплодотворение', x: 'Первый спермий сливается с яйцеклеткой. Образуется зигота, из неё разовьётся зародыш нового растения.'},
  {t: 'Второе оплодотворение', x: 'Второй спермий сливается с центральной клеткой. Из неё разовьётся эндосперм — запас питательных веществ для зародыша. Поэтому оплодотворение называют двойным.'},
  {t: 'Семя и плод', x: 'Из семязачатка образуется семя (зародыш + эндосперм + кожура), а стенки завязи разрастаются в плод. Лепестки и тычинки увядают и опадают.'},
];

function build(clip: THREE.Plane) {
  const root = new THREE.Group(), mats: Record<string, THREE.MeshPhysicalMaterial[]> = {};
  const mat = (k: string, c?: string, cut = false, op = 1) => { const m = new THREE.MeshPhysicalMaterial({color: c || PARTS.find(p => p.k === k)!.c, roughness: 0.5, clearcoat: 0.4, side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 0.9, clippingPlanes: cut ? [clip] : []}); (mats[k] = mats[k] || []).push(m); return m; };
  const sph = new THREE.SphereGeometry(1, 32, 22);
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 12), new THREE.MeshPhysicalMaterial({color: '#4d7c0f'})); stalk.position.y = -0.95; root.add(stalk);
  const recp = new THREE.Mesh(sph, new THREE.MeshPhysicalMaterial({color: '#65a30d'})); recp.position.y = -0.1; recp.scale.set(0.42, 0.16, 0.42); root.add(recp);
  const petals = new THREE.Group(), pm = mat('petal', undefined, true), sm = mat('sepal', undefined, true); root.add(petals);
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.rotation.y = i * Math.PI / 3 + 0.26; const m = new THREE.Mesh(sph, pm); m.scale.set(0.5, 0.05, 0.95); m.position.set(0, 0.55, 1.0); m.rotation.x = -0.75; g.add(m); petals.add(g); }
  for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.rotation.y = i * Math.PI * 0.4; const m = new THREE.Mesh(sph, sm); m.scale.set(0.24, 0.04, 0.55); m.position.set(0, 0.05, 0.55); m.rotation.x = -0.25; g.add(m); root.add(g); }
  const stam = new THREE.Group(), fm = mat('stamen', '#e7e2b0'), am = mat('stamen'); root.add(stam);
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.rotation.y = i * Math.PI / 3; const f = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.45, 6), fm); f.position.set(0, 0.72, 0.62); f.rotation.x = 0.16; const a = new THREE.Mesh(sph, am); a.scale.set(0.09, 0.17, 0.09); a.position.set(0, 1.5, 0.74); g.add(f, a); stam.add(g); }
  const ovary = new THREE.Mesh(sph, mat('pistil', undefined, true)); ovary.scale.set(0.4, 0.52, 0.4); ovary.position.y = 0.45; root.add(ovary);
  const style = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.25, 12), mat('pistil', undefined, true, 1)); style.position.y = 1.5; root.add(style);
  const stigma = new THREE.Mesh(sph, mat('pistil', '#a3e635')); stigma.scale.set(0.17, 0.11, 0.17); stigma.position.y = 2.16; root.add(stigma);
  const ovule = new THREE.Mesh(sph, mat('ovule', undefined, false, 0.55)); ovule.scale.set(0.22, 0.3, 0.2); ovule.position.set(0, 0.45, -0.02); ovule.renderOrder = 4; root.add(ovule);
  const egg = new THREE.Mesh(sph, new THREE.MeshPhysicalMaterial({color: '#f43f5e'})); egg.scale.setScalar(0.06); egg.position.set(0, 0.27, 0); root.add(egg);
  const central = new THREE.Mesh(sph, new THREE.MeshPhysicalMaterial({color: '#60a5fa'})); central.scale.setScalar(0.085); central.position.set(0, 0.5, 0); root.add(central);
  const pollen = Array.from({length: 5}, () => { const m = new THREE.Mesh(sph, new THREE.MeshPhysicalMaterial({color: '#fde047', emissive: '#fde047', emissiveIntensity: 0.3})); m.scale.setScalar(0.06); root.add(m); return m; });
  const tubeCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.02, 2.2, 0.02), new THREE.Vector3(0.0, 1.5, 0.01), new THREE.Vector3(0.0, 0.95, 0.0), new THREE.Vector3(0.08, 0.6, 0.01), new THREE.Vector3(0.05, 0.22, 0.0), new THREE.Vector3(0.0, 0.25, 0.0)]);
  const tg = new THREE.TubeGeometry(tubeCurve, 80, 0.028, 8), tube = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({color: '#fde047'})); tube.renderOrder = 8; (tube.material as any).depthTest = false; root.add(tube); const total = tg.index!.count;
  const sperm = [0, 1].map(() => { const m = new THREE.Mesh(sph, new THREE.MeshBasicMaterial({color: '#ffffff', depthTest: false})); m.scale.setScalar(0.04); m.renderOrder = 9; root.add(m); return m; });
  const a0 = new THREE.Vector3(0, 1.5, 0.74), s0 = new THREE.Vector3(0, 2.24, 0), pt = new THREE.Vector3(), cE = new THREE.Color(), cC = new THREE.Color();
  let p = 0, last = -2;
  const update = (t: number, s: {sel: string; step: number; cut: boolean}, dt: number) => {
    if (s.step !== last) { last = s.step; p = 0; } p = Math.min(1, p + dt / 1.8); const st = s.step, e = p * p * (3 - 2 * p);
    Object.entries(mats).forEach(([k, arr]) => arr.forEach(m => { const on = st < 0 && s.sel === k; m.emissive.set(on ? '#ffd166' : '#000'); m.emissiveIntensity = on ? 0.4 + 0.15 * Math.sin(t * 5) : 0; if ((m as any).userData.c === undefined) (m as any).userData.c = m.clippingPlanes!.length > 0; m.clippingPlanes = (m as any).userData.c && s.cut ? [clip] : []; }));
    pollen.forEach((m, i) => { const q = st < 0 ? 0 : st === 0 ? Math.max(0, Math.min(1, e * 1.4 - i * 0.08)) : 1; const src = pt.copy(a0).applyAxisAngle(new THREE.Vector3(0, 1, 0), i * Math.PI / 3); m.position.lerpVectors(src, s0, q); m.position.y += Math.sin(q * Math.PI) * 0.7; m.position.x += (i - 2) * 0.05 * q; m.visible = st >= 0 && st < 5; });
    const grow = st < 1 ? 0 : st === 1 ? e : 1; tg.setDrawRange(0, Math.floor(total * grow / 48) * 48); tube.visible = st >= 1 && st < 5;
    const sp = st < 2 ? -1 : st === 2 ? e * 0.9 : 0.92;
    sperm.forEach((m, i) => { m.visible = st >= 2 && st < 5 && !(i === 0 && st >= 4) ; if (sp < 0) return; tubeCurve.getPoint(Math.max(0, sp - i * 0.06), m.position); if (st === 3 && i === 0) m.position.lerp(egg.position, e); if (st >= 3 && i === 0 && (st > 3 || e > 0.95)) m.visible = false; if (st === 4 && i === 1) { m.position.lerp(central.position, e); if (e > 0.95) m.visible = false; } });
    cE.set('#f43f5e'); if (st > 3 || (st === 3 && e > 0.9)) cE.set('#16a34a'); (egg.material as THREE.MeshPhysicalMaterial).color.copy(cE);
    cC.set('#60a5fa'); if (st > 4 || (st === 4 && e > 0.9)) cC.set('#fbbf24'); (central.material as THREE.MeshPhysicalMaterial).color.copy(cC);
    const f = st === 5 ? e : 0; egg.scale.setScalar(0.06 + (st >= 3 ? 0.03 : 0) + f * 0.05); central.scale.setScalar(0.085 + (st >= 4 ? 0.04 : 0) + f * 0.12);
    ovary.scale.set(0.4 + f * 0.35, 0.52 + f * 0.3, 0.4 + f * 0.35); ovule.scale.set(0.22 + f * 0.16, 0.3 + f * 0.12, 0.2 + f * 0.16); (mats.pistil[0]).color.set('#84cc16').lerp(new THREE.Color('#ef4444'), f * 0.8);
    petals.scale.setScalar(1 - f * 0.75); petals.position.y = -f * 0.4; stam.scale.set(1, 1 - f * 0.6, 1); style.scale.y = 1 - f * 0.6; style.position.y = 1.5 - f * 0.45; stigma.position.y = 2.16 - f * 0.85;
  };
  return {root, update};
}

export default function Flower3D() {
  const host = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState('petal'), [step, setStep] = useState(-1), [cut, setCut] = useState(true), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {sel, step, cut};
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь описанием ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.localClippingEnabled = true;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    const a = new THREE.DirectionalLight('#fff', 1.3); a.position.set(3, 6, 7); scene.add(a);
    const {root, update} = build(new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.02)); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.minDistance = 2.5; ctl.maxDistance = 16; ctl.target.set(0, 0.75, 0);
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { const dd = Math.max(6.4, 5.4 / (w / h)); cam.position.set(dd * 0.12, 0.75 + dd * 0.22, dd); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; update(t, st.current, dt); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => x.dispose()); }); pm.dispose(); r.dispose(); el.removeChild(r.domElement); };
  }, []);
  const cur = PARTS.find(p => p.k === sel)!, tg = {minHeight: 40, padding: '4px 10px'};
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель: цветок, опыление и двойное оплодотворение</b>
    <button className={step < 0 ? '' : 's'} style={tg} onClick={() => setStep(-1)}>🔍 Строение цветка</button><button className={step >= 0 ? '' : 's'} style={tg} onClick={() => setStep(0)}>🐝 Опыление и оплодотворение</button>
    <button className={cut ? '' : 's'} aria-pressed={cut} style={tg} onClick={() => setCut(!cut)}>✂ Разрез</button></div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(62vh, 480px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 30%, #2b4a3a 0%, #0b1620 80%)', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      {step < 0 ? <><div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8}}>{PARTS.map(p => <button key={p.k} className={sel === p.k ? '' : 's'} style={{minHeight: 38, padding: '4px 10px', fontSize: '.9rem'}} onClick={() => setSel(p.k)}><span style={{color: sel === p.k ? '#fff' : p.c}} aria-hidden="true">●</span> {p.n}</button>)}</div>
        <div className="warn" aria-live="polite"><b>{cur.n}.</b> {cur.t}</div></>
        : <><div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}><button className="s" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>◀ Назад</button><button onClick={() => setStep(step === 5 ? 0 : step + 1)}>{step === 5 ? '↺ Сначала' : 'Дальше ▶'}</button></div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{STEPS.map((s, i) => <button key={i} className={step === i ? '' : 's'} style={{minHeight: 34, padding: '2px 12px'}} onClick={() => setStep(i)} aria-label={`Шаг ${i + 1}: ${s.t}`}>{i + 1}</button>)}</div>
          <div className="warn" aria-live="polite"><b>Шаг {step + 1} из 6: {STEPS[step].t}.</b> {STEPS[step].x}</div>
          <div className="mu" style={{marginTop: 8}}><span style={{color: '#e0b400'}}>●</span> пыльца и пыльцевая трубка · <span style={{color: '#f43f5e'}}>●</span> яйцеклетка → <span style={{color: '#16a34a'}}>●</span> зародыш · <span style={{color: '#60a5fa'}}>●</span> центральная клетка → <span style={{color: '#d49a1a'}}>●</span> эндосперм</div></>}
      <div className="mu" style={{marginTop: 8}}>Модель упрощена: показан один семязачаток, размеры клеток сильно увеличены. Вращай её пальцем или мышью.</div></div></div>;
}

const VEG = [['🌿', 'Черенки', 'Отрезок стебля с почками сажают во влажную почву — он даёт корни. Так размножают смородину, тополь, иву, виноград, комнатные растения.'], ['🍓', 'Усы', 'Ползучие побеги, на которых вырастают новые растения с корнями: земляника, лапчатка.'], ['🥔', 'Клубни', 'Утолщённые подземные побеги с глазками-почками: картофель, топинамбур.'], ['🧅', 'Луковицы', 'Укороченный побег с сочными чешуями: лук, чеснок, тюльпан, лилия.'], ['🌾', 'Корневища', 'Подземный побег, похожий на корень, с почками: пырей, ландыш, ирис, мята.'], ['🪴', 'Отводки', 'Ветку пригибают к земле и присыпают почвой. Когда она укоренится, её отделяют: крыжовник, смородина.'], ['🌳', 'Прививка', 'Черенок или почку ценного сорта (привой) сращивают с другим растением (подвоем). Так размножают яблони, груши, розы.'], ['🌱', 'Корневые отпрыски', 'Новые побеги вырастают от корней: малина, вишня, осина, осот.']];
export function Vegetative() {
  const [i, setI] = useState(0);
  return <div className="card"><h3>Способы вегетативного размножения</h3>
    <div className="mu">Вегетативное размножение — бесполое размножение частями тела: побегом, корнем, листом. Потомство получается точной копией материнского растения.</div>
    <div className="shp" style={{gridTemplateColumns: 'repeat(auto-fill,minmax(104px,1fr))'}}>{VEG.map((e, k) => <button key={e[1]} className={i === k ? '' : 's'} style={{display: 'grid', justifyItems: 'center', gap: 2, padding: '8px 4px', margin: 0, minHeight: 78, fontSize: '.85rem'}} onClick={() => setI(k)}><span style={{fontSize: '1.7rem'}} aria-hidden="true">{e[0]}</span>{e[1]}</button>)}</div>
    <div className="warn" aria-live="polite" style={{marginTop: 10}}><b>{VEG[i][1]}.</b> {VEG[i][2]}</div></div>;
}

const SORT: [string, number][] = [['Крупные яркие лепестки', 0], ['Мелкие невзрачные цветки без запаха', 1], ['Есть нектар и запах', 0], ['Очень много мелкой сухой лёгкой пыльцы', 1], ['Пыльца крупная и липкая', 0], ['Пыльники свисают на длинных нитях', 1], ['Цветут до распускания листьев: берёза, тополь', 1], ['Яблоня, подсолнечник, шиповник', 0]];
const GR = ['Насекомыми', 'Ветром'];
export function PollSort() {
  const [a, setA] = useState<Record<number, number>>({});
  const done = Object.keys(a).length === SORT.length, right = SORT.filter((s, i) => a[i] === s[1]).length;
  return <div className="card"><h3>Проверь себя: кто опыляет цветок?</h3>
    {SORT.map(([t, g], i) => <div key={t} style={{padding: '8px 0', borderBottom: '1px solid var(--bd)'}}><b>{t}</b> {a[i] !== undefined && <span style={{color: a[i] === g ? '#15803d' : '#b91c1c', fontWeight: 700}}>{a[i] === g ? '✓ верно' : `✗ это опыление ${GR[g].toLowerCase()}`}</span>}
      <div>{GR.map((n, j) => <button key={n} className={a[i] === j ? '' : 's'} style={{minHeight: 40, padding: '4px 10px', fontSize: '.88rem'}} onClick={() => setA({...a, [i]: j})}>{n}</button>)}</div></div>)}
    {done && <div className="warn" style={{marginTop: 8}}><b>Верно {right} из {SORT.length}.</b> <button className="s" onClick={() => setA({})}>Пройти ещё раз</button></div>}</div>;
}

export function TreeRings() {
  const mk = () => { const n = 5 + Math.floor(Math.random() * 10); return Array.from({length: n}, () => 5 + Math.random() * 12); };
  const [w, setW] = useState(mk), [g, setG] = useState(''), [chk, setChk] = useState(false);
  const tot = w.reduce((a, b) => a + b, 0), k = 118 / tot; let r = 0; const rings = w.map(x => { r += x * k; return r; }), wide = w.indexOf(Math.max(...w)), ok = +g === w.length;
  return <div className="card"><h3>Опыт: сколько лет дереву</h3>
    <div className="mu">Каждый год ствол утолщается на одно годичное кольцо. Сосчитай кольца на спиле (тёмные линии, считая границу с корой) и введи возраст дерева.</div>
    <div className="duo"><div className="art"><svg viewBox="0 0 260 260" role="img" aria-label="Спил дерева с годичными кольцами"><circle cx="130" cy="130" r="126" fill="#6b4a2f"/>
      {rings.slice().reverse().map((x, i) => { const idx = w.length - 1 - i; return <circle key={i} cx="130" cy="130" r={x} fill={chk && idx === wide ? '#f6dfb4' : idx % 2 ? '#e8c9a0' : '#e3c196'} stroke="#8a5a2b" strokeWidth="2.2"/>; })}<circle cx="130" cy="130" r="2.5" fill="#5b3a1a"/></svg></div>
      <div><input inputMode="numeric" placeholder="Возраст, лет" aria-label="Возраст дерева" value={g} onChange={e => { setG(e.target.value.replace(/\D/g, '')); setChk(false); }}/><button onClick={() => setChk(true)} disabled={!g}>Проверить</button><button className="s" onClick={() => { setW(mk()); setG(''); setChk(false); }}>Другое дерево</button>
        {chk && <div className="warn" aria-live="polite" style={{marginTop: 8}}><b style={{color: ok ? '#15803d' : '#b91c1c'}}>{ok ? '✓ Верно!' : '✗ Не совсем.'}</b> Колец {w.length}, значит дереву {w.length} лет. Самое широкое кольцо (оно подсвечено) — {wide + 1}-й год жизни: тогда было тепло и влажно, и дерево росло быстро. Узкие кольца — холодные или засушливые годы.</div>}
        <p>Кольцо образуется так: весной камбий откладывает крупные светлые клетки древесины, к осени — мелкие тёмные. Граница между осенней и весенней древесиной и видна как линия.</p></div></div></div>;
}
