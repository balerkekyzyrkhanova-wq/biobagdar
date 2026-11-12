import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

type Node = {name: string; role: string; em: string; y?: number; text: string};
type Eco = {name: string; sky: string; ground: string; fog: string; chain: Node[]; dec: Node; intro: string};
const DEC = (where: string): Node => ({name: 'Грибы и бактерии', role: 'Редуценты', em: '🍄', text: `Редуценты разлагают остатки растений и животных ${where}. Так минеральные вещества возвращаются в почву (воду), и продуценты снова могут ими питаться. Вещества идут по кругу, а энергия — только в одну сторону.`});
const ECOS: Record<string, Eco> = {
  steppe: {name: '🌾 Степь', sky: '#bfe3ff', ground: '#b6b35a', fog: '#dcebf7', intro: 'Степь — ровная местность с травами. Лето жаркое и засушливое, зима холодная. Деревьев почти нет, много растительноядных и зарывающихся животных.',
    chain: [
      {name: 'Ковыль', role: 'Продуцент', em: '🌾', text: 'Ковыль — продуцент. Он создаёт органические вещества при фотосинтезе. Узкие жёсткие листья уменьшают испарение воды.'},
      {name: 'Суслик', role: 'Консумент I порядка', em: '🐿️', text: 'Суслик питается растениями — консумент первого порядка. Зиму он спит в норе, когда нет корма.'},
      {name: 'Степной орёл', role: 'Консумент II порядка', em: '🦅', text: 'Степной орёл ест сусликов и других мелких зверей — консумент второго порядка (хищник). Он регулирует численность грызунов.'}],
    dec: DEC('на поверхности почвы')},
  desert: {name: '🏜️ Пустыня', sky: '#ffe2b8', ground: '#e0bd7c', fog: '#f4dcc0', intro: 'Пустыня жаркая и сухая, осадков очень мало. Растения и животные приспособлены беречь воду; многие активны ночью.',
    chain: [
      {name: 'Саксаул', role: 'Продуцент', em: '🌳', text: 'Саксаул — продуцент. Вместо листьев у него зелёные веточки-чешуйки, а корни уходят глубоко к воде, поэтому воды расходуется мало.'},
      {name: 'Тушканчик', role: 'Консумент I порядка', em: '🐭', text: 'Тушканчик питается семенами и побегами. Днём прячется в норе от жары, ночью ищет корм. Воду берёт из пищи.'},
      {name: 'Корсак', role: 'Консумент II порядка', em: '🦊', text: 'Корсак — небольшая степная лисица, охотится ночью на грызунов и ящериц. Он консумент второго порядка.'}],
    dec: DEC('в песке и почве')},
  mountain: {name: '🏔️ Горы', sky: '#a9d3f5', ground: '#7f9a62', fog: '#cfe3ee', intro: 'В горах климат меняется с высотой: чем выше, тем холоднее. Поэтому растительность образует пояса: лес, луга, голые скалы и снег.',
    chain: [
      {name: 'Альпийские травы', role: 'Продуцент', em: '🌱', text: 'Низкие травы и кустарники альпийских лугов — продуценты. Они растут быстро в короткое тёплое лето.'},
      {name: 'Горный козёл (кийк)', role: 'Консумент I порядка', em: '🐐', text: 'Горный козёл питается травой и ловко лазает по скалам. Это консумент первого порядка.'},
      {name: 'Снежный барс', role: 'Консумент II порядка', em: '🐆', text: 'Снежный барс — редкий хищник гор. Густая шерсть спасает от холода, длинный хвост помогает держать равновесие. Он охотится на горных козлов и баранов.'}],
    dec: DEC('на склонах')},
  lake: {name: '🌊 Озеро (Балхаш)', sky: '#bfe3ff', ground: '#3f7da3', fog: '#d4e8f2', intro: 'Озеро Балхаш — необычное: в западной части вода пресная, в восточной солёная. В водоёме пищевые цепи длиннее: до четырёх звеньев.',
    chain: [
      {name: 'Водоросли (фитопланктон)', role: 'Продуцент', em: '🟢', y: -0.15, text: 'Микроскопические водоросли — главные продуценты водоёма. Они делают органические вещества на свету в верхнем слое воды.'},
      {name: 'Рачки (зоопланктон)', role: 'Консумент I порядка', em: '🦐', y: -0.35, text: 'Мелкие рачки фильтруют воду и едят водоросли. Консументы первого порядка.'},
      {name: 'Сазан', role: 'Консумент II порядка', em: '🐟', y: -0.6, text: 'Сазан питается рачками, личинками и мелкими животными, консумент второго порядка. Он сам становится кормом для хищных рыб и птиц.'},
      {name: 'Пеликан', role: 'Консумент III порядка', em: '🐦', y: 0.9, text: 'Пеликан ловит рыбу. Он консумент третьего порядка — последнее звено цепи. Энергии здесь остаётся совсем мало, поэтому хищников всегда мало.'}],
    dec: DEC('на дне')},
};
const CONS: Record<string, string> = {
  'Продуцент': 'Без продуцентов исчезает источник органических веществ и энергии: все остальные звенья остаются без пищи.',
  'Консумент I порядка': 'Хищникам нечем питаться, и их становится меньше. Растения без травоядных размножаются сильнее, пока не начнёт не хватать воды и места.',
  'Консумент II порядка': 'Без хищников растительноядных становится слишком много. Они съедают растения, и экосистема может обеднеть.',
  'Консумент III порядка': 'Численность рыбы и нижних звеньев вырастает, пока им хватает корма. Затем корм заканчивается.',
};

function sprite(em: string, name: string, role: string) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 300; const x = c.getContext('2d')!;
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '150px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.fillText(em, 160, 90);
  x.fillStyle = 'rgba(10,20,34,0.78)'; x.beginPath(); (x as any).roundRect(8, 170, 304, 120, 24); x.fill();
  x.fillStyle = '#fff'; x.font = '600 32px system-ui,sans-serif'; x.fillText(name.length > 20 ? name.slice(0, 19) + '…' : name, 160, 208); x.fillStyle = '#ffd166'; x.font = '500 25px system-ui,sans-serif'; x.fillText(role, 160, 255);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false})); s.scale.set(2.1, 1.97, 1); s.renderOrder = 20; return s;
}
const H = (k: string, x: number, z: number) => k === 'desert' ? 0.45 * Math.sin(x * 0.7 + z * 0.35) * Math.cos(z * 0.5) : k === 'steppe' ? 0.18 * Math.sin(x * 0.5) * Math.cos(z * 0.6) : k === 'mountain' ? 0.25 * Math.sin(x * 0.6) + Math.max(0, -z - 2.5) * 0.9 : -0.9 + 0.12 * Math.sin(x * 0.8 + z);

function build(k: string) {
  const E = ECOS[k], root = new THREE.Group();
  const geo = new THREE.PlaneGeometry(15, 11, 90, 66); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, col = new Float32Array(p.count * 3), base = new THREE.Color(E.ground), cc = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = H(k, x, z); p.setY(i, h); cc.copy(base).offsetHSL(0, 0, (Math.sin(x * 3) * Math.cos(z * 2.6) * 0.03) + h * 0.05); if (k === 'mountain' && h > 1.5) cc.lerp(new THREE.Color('#e8eef2'), Math.min(1, (h - 1.5) / 1.5)); col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.95})); root.add(ground);
  let water: THREE.Mesh | null = null;
  if (k === 'lake') { const wg = new THREE.PlaneGeometry(15, 11, 60, 44); wg.rotateX(-Math.PI / 2); water = new THREE.Mesh(wg, new THREE.MeshPhysicalMaterial({color: '#4aa8d8', transparent: true, opacity: 0.55, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.5})); water.position.y = 0; root.add(water); }
  // декор
  const dec = new THREE.Object3D(), mk = (g: THREE.BufferGeometry, color: string, n: number, f: (i: number) => void, rough = 0.8) => { const im = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({color, roughness: rough}), n); for (let i = 0; i < n; i++) { f(i); dec.updateMatrix(); im.setMatrixAt(i, dec.matrix); } root.add(im); return im; };
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  if (k === 'steppe') mk(new THREE.ConeGeometry(0.04, 0.5, 5), '#d8c872', 700, () => { const x = rnd(-7, 7), z = rnd(-5, 5); dec.position.set(x, H(k, x, z) + 0.2, z); dec.rotation.set(rnd(-0.3, 0.3), 0, rnd(-0.3, 0.3)); dec.scale.setScalar(rnd(0.7, 1.4)); });
  if (k === 'desert') { mk(new THREE.IcosahedronGeometry(0.22, 1), '#7d8a4e', 16, () => { const x = rnd(-6.5, 6.5), z = rnd(-4.5, 1); dec.position.set(x, H(k, x, z) + 0.1, z); dec.rotation.set(0, 0, 0); dec.scale.set(rnd(0.8, 1.6), rnd(0.8, 1.2), rnd(0.8, 1.6)); }); mk(new THREE.DodecahedronGeometry(0.15, 0), '#9a8466', 14, () => { const x = rnd(-7, 7), z = rnd(-5, 5); dec.position.set(x, H(k, x, z) + 0.05, z); dec.rotation.set(rnd(0, 3), rnd(0, 3), 0); dec.scale.setScalar(rnd(0.6, 1.6)); }); }
  if (k === 'mountain') {
    [[-5, -4.6, 2.9], [-2, -5, 3.6], [1.8, -4.9, 3.2], [5, -4.5, 2.6]].forEach(([x, z, h]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(1.8 + h * 0.3, h * 1.6, 7), new THREE.MeshStandardMaterial({color: '#8b8f97', roughness: 0.9, flatShading: true})); m.position.set(x, h * 0.8 + 0.6, z); root.add(m); const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75 + h * 0.12, h * 0.6, 7), new THREE.MeshStandardMaterial({color: '#f5f8fa', roughness: 0.5, flatShading: true})); cap.position.set(x, h * 1.6 + 0.3 - h * 0.1 + 0.6, z); root.add(cap); });
    mk(new THREE.ConeGeometry(0.22, 0.9, 7), '#1f5a3a', 60, () => { const x = rnd(-7, 7), z = rnd(-3.8, 3.5); dec.position.set(x, H(k, x, z) + 0.4, z); dec.rotation.set(0, 0, 0); dec.scale.setScalar(rnd(0.7, 1.5)); }); }
  if (k === 'lake') mk(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 5), '#6f8f4a', 50, () => { const x = rnd(-7, 7), z = rnd(4.4, 5.2); dec.position.set(x, 0.1, z); dec.rotation.set(rnd(-0.15, 0.15), 0, rnd(-0.15, 0.15)); dec.scale.setScalar(rnd(0.7, 1.4)); });
  // звенья
  const all = [...E.chain, E.dec], n = all.length, pos: THREE.Vector3[] = [], sps: THREE.Sprite[] = [], rings: THREE.Mesh[] = [];
  all.forEach((nd, i) => { const x = -5.4 + i * (10.8 / (n - 1)), z = i % 2 ? 1.4 : 0.2; const y = nd.y !== undefined ? nd.y : (nd.role === 'Редуценты' ? H(k, x, z) : H(k, x, z)) + (nd.role === 'Редуценты' ? 0.1 : 0.2); const v = new THREE.Vector3(x, y, z); pos.push(v);
    const s = sprite(nd.em, nd.name, nd.role); s.position.set(x, y + 1.2, z); root.add(s); sps.push(s);
    const r = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.6, 32), new THREE.MeshBasicMaterial({color: '#ffd166', transparent: true, opacity: 0.0, side: THREE.DoubleSide})); r.rotation.x = -Math.PI / 2; r.position.set(x, Math.max(y - 0.15, H(k, x, z) + 0.03), z); root.add(r); rings.push(r); });
  // стрелки энергии: i -> i+1 (последняя цепь→редуценты от всех)
  const arcs = all.slice(0, -1).map((_, i) => { const a = pos[i].clone().add(new THREE.Vector3(0, 0.9, 0)), b = pos[i + 1].clone().add(new THREE.Vector3(0, 0.9, 0)); const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 0.7, 0)); const cv = new THREE.QuadraticBezierCurve3(a, mid, b); const t = new THREE.Mesh(new THREE.TubeGeometry(cv, 24, 0.028, 8, false), new THREE.MeshBasicMaterial({color: i === n - 2 ? '#c98f4f' : '#ffffff', transparent: true, opacity: 0.45})); root.add(t); return {cv, t}; });
  const ball = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({color: '#fff2a8'}), arcs.length * 6); ball.frustumCulled = false; root.add(ball);
  const d = new THREE.Object3D(), pt = new THREE.Vector3();
  const update = (time: number, st: {playing: boolean; step: number; mode: 'flow' | 'step'; removed: number}) => {
    const act = st.mode === 'step' ? [st.step, st.step - 1] : [], hi = (i: number) => (st.mode === 'step' ? st.step === i : st.playing && Math.floor((time / 2) % n) === i);
    sps.forEach((s, i) => { const gone = st.removed === i, on = hi(i); s.material.opacity = gone ? 0.15 : 1; const sc = (gone ? 0.6 : on ? 1.15 + 0.05 * Math.sin(time * 5) : 1); s.scale.set(2.1 * sc, 1.97 * sc, 1); s.position.y = pos[i].y + 1.2 + (gone ? 0 : on ? 0.08 * Math.sin(time * 4) : 0); (rings[i].material as THREE.MeshBasicMaterial).opacity = on ? 0.9 : 0; });
    arcs.forEach((a, i) => { const dead = st.removed === i || st.removed === i + 1; (a.t.material as THREE.MeshBasicMaterial).opacity = dead ? 0.08 : (st.mode === 'step' ? (st.step === i + 1 ? 0.95 : 0.3) : 0.5);
      for (let j = 0; j < 6; j++) { const idx = i * 6 + j; const show = !dead && (st.mode === 'flow' ? st.playing : st.step === i + 1); const u = ((j / 6) + time * 0.28) % 1; a.cv.getPoint(u, pt); d.position.copy(pt); d.scale.setScalar(show ? 1 : 0.0001); d.updateMatrix(); ball.setMatrixAt(idx, d.matrix); } });
    ball.instanceMatrix.needsUpdate = true;
    if (water) { const wp = water.geometry.attributes.position; for (let i = 0; i < wp.count; i++) wp.setY(i, 0.04 * Math.sin(wp.getX(i) * 1.3 + time * 1.5) * Math.cos(wp.getZ(i) * 1.1 + time)); wp.needsUpdate = true; }
    void act;
  };
  return {root, update, n};
}

export default function Eco3D() {
  const host = useRef<HTMLDivElement>(null);
  const [k, setK] = useState('steppe'), [playing, setPlaying] = useState(false), [step, setStep] = useState(0), [mode, setMode] = useState<'flow' | 'step'>('step'), [removed, setRemoved] = useState(-1), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {playing, step, mode, removed};
  const E = ECOS[k], all = [...E.chain, E.dec];
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true, alpha: false}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь текстом ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(); scene.background = new THREE.Color(E.sky); scene.fog = new THREE.Fog(E.fog, 18, 34);
    const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 80); cam.position.set(0, 5.2, 11.5);
    const sun = new THREE.DirectionalLight('#fff4d6', 2.2); sun.position.set(5, 8, 5); scene.add(sun); scene.add(new THREE.HemisphereLight('#dbeafe', '#8a7a5a', 0.7));
    const {root, update} = build(k); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.47; ctl.minDistance = 6; ctl.maxDistance = 32; ctl.target.set(0, 0.6, 0.3);
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; const dd = Math.max(11.5, 19.5 / (w / h)); cam.position.set(0, dd * 0.42, dd); cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; update(t, st.current); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); }); }); pm.dispose(); r.dispose(); el.removeChild(r.domElement); };
  }, [k]);
  useEffect(() => {
    if (!playing || mode !== 'flow') return;
    const id = setInterval(() => setStep(s => (s + 1) % all.length), 3200); return () => clearInterval(id);
  }, [playing, mode, k]);
  const cur = all[Math.min(step, all.length - 1)], go = (i: number) => { setMode('step'); setPlaying(false); setStep((i + all.length) % all.length); };
  const rm = removed >= 0 ? all[removed] : null;
  return <div className="card lab"><div className="tb"><b style={{flexBasis: '100%'}}>3D-диорама: цепь питания</b>
    {Object.entries(ECOS).map(([id, e]) => <button key={id} className={k === id ? '' : 's'} style={{minHeight: 38, padding: '4px 10px'}} onClick={() => { setK(id); setStep(0); setRemoved(-1); }}>{e.name}</button>)}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} style={{height: 'min(62vh, 460px)', margin: '0 10px', borderRadius: 14}}/>}
    <div style={{padding: '8px 14px 14px'}}>
      <div className="mu" style={{marginBottom: 8}}>{E.intro}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
        <button onClick={() => { if (!playing || mode !== 'flow') { setMode('flow'); setPlaying(true); } else setPlaying(false); }}>{playing && mode === 'flow' ? '⏸ Пауза' : '▶ Запустить поток энергии'}</button>
        <button className="s" onClick={() => go(step - 1)}>◀ Шаг назад</button><button className="s" onClick={() => go(step + 1)}>Шаг вперёд ▶</button></div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{all.map((a, i) => <button key={i} className={i === step ? '' : 's'} style={{minHeight: 34, padding: '2px 10px'}} onClick={() => go(i)} aria-label={`Звено ${i + 1}: ${a.name}`}>{a.em} {i + 1}</button>)}</div>
      <div className="warn" aria-live="polite"><b>Звено {Math.min(step, all.length - 1) + 1} из {all.length}: {cur.name} ({cur.role}).</b> {cur.text}</div>
      <div style={{marginTop: 10}}><b>Что будет, если убрать звено?</b>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4}}>{all.map((a, i) => <button key={i} className={removed === i ? '' : 's'} style={{minHeight: 34, padding: '2px 10px'}} onClick={() => setRemoved(removed === i ? -1 : i)}>{removed === i ? '↩ Вернуть' : '✖ Убрать'}: {a.name}</button>)}</div>
        {rm && <div className="warn" style={{marginTop: 6}}><b>Без звена «{rm.name}».</b> {rm.role === 'Редуценты' ? 'Остатки не разлагаются, минеральные вещества не возвращаются в почву, и продуценты постепенно перестают получать питание.' : CONS[rm.role] || ''}</div>}</div>
      <div className="mu" style={{marginTop: 8}}>Стрелки показывают, куда идут вещества и энергия: от съеденного к тому, кто ест. Вращай диораму пальцем или мышью, приближай двумя пальцами. Модель упрощена.</div></div></div>;
}
