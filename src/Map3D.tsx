import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

// контур: Natural Earth (через github.com/johan/world.geo.json)
const OUT: [number, number][] = [[70.96,42.27],[70.39,42.08],[69.07,41.38],[68.63,40.67],[68.26,40.66],[67.99,41.14],[66.71,41.17],[66.51,41.99],[66.02,41.99],[66.1,43.0],[64.9,43.73],[63.19,43.65],[62.01,43.5],[61.06,44.41],[60.24,44.78],[58.69,45.5],[58.5,45.59],[55.93,45.0],[55.97,41.31],[55.46,41.26],[54.76,42.04],[54.08,42.32],[52.94,42.12],[52.5,41.78],[52.45,42.03],[52.69,42.44],[52.5,42.79],[51.34,43.13],[50.89,44.03],[50.34,44.28],[50.31,44.61],[51.28,44.51],[51.32,45.25],[52.17,45.41],[53.04,45.26],[53.22,46.23],[53.04,46.85],[52.04,46.8],[51.19,47.05],[50.03,46.61],[49.1,46.4],[48.59,46.56],[48.69,47.08],[48.06,47.74],[47.32,47.72],[46.47,48.39],[47.04,49.15],[46.75,49.36],[47.55,50.45],[48.58,49.87],[48.7,50.61],[50.77,51.69],[52.33,51.72],[54.53,51.03],[55.72,50.62],[56.78,51.04],[58.36,51.06],[59.64,50.55],[59.93,50.84],[61.34,50.8],[61.59,51.27],[59.97,51.96],[60.93,52.45],[60.74,52.72],[61.7,52.98],[60.98,53.66],[61.44,54.01],[65.18,54.35],[65.67,54.6],[68.17,54.97],[69.07,55.39],[70.87,55.17],[71.18,54.13],[72.22,54.38],[73.51,54.04],[73.43,53.49],[74.38,53.55],[76.89,54.49],[76.53,54.18],[77.8,53.4],[80.04,50.86],[80.57,51.39],[81.95,50.81],[83.38,51.07],[83.94,50.89],[84.42,50.31],[85.12,50.12],[85.54,49.69],[86.83,49.83],[87.36,49.21],[86.6,48.55],[85.77,48.46],[85.72,47.45],[85.16,47.0],[83.18,47.33],[82.46,45.54],[81.95,45.32],[79.97,44.92],[80.87,43.18],[80.18,42.92],[80.26,42.35],[79.64,42.5],[79.14,42.86],[77.66,42.96],[76.0,42.99],[75.64,42.88],[74.21,43.3],[73.65,43.09],[73.49,42.5],[71.84,42.85],[71.19,42.7]];
const X = (lon: number) => (lon - 67) * 0.216, Y = (lat: number) => (lat - 48) * 0.32;
type Site = {name: string; kind: 'З' | 'П'; lon: number; lat: number; zone: string; text: string};
const SITES: Site[] = [
  {name: 'Аксу-Жабаглы', kind: 'З', lon: 70.6, lat: 42.4, zone: 'горы Западного Тянь-Шаня', text: 'Первый заповедник Казахстана, создан в 1926 году. Охраняет горные леса и луга, тюльпаны Грейга и Кауфмана, снежного барса, архара, тянь-шаньского бурого медведя.'},
  {name: 'Наурзумский', kind: 'З', lon: 64.5, lat: 51.5, zone: 'степь', text: 'Сохраняет участки нетронутой степи, островные сосновые боры и озёра. Здесь гнездятся орлы, останавливаются перелётные птицы. Входит в список Всемирного наследия ЮНЕСКО.'},
  {name: 'Коргалжынский', kind: 'З', lon: 69.5, lat: 50.4, zone: 'степные озёра', text: 'Озёра Тенгиз и Коргалжын — место отдыха миллионов перелётных птиц. Здесь находится самое северное в мире гнездовье розового фламинго. Объект ЮНЕСКО.'},
  {name: 'Алматинский', kind: 'З', lon: 77.4, lat: 43.1, zone: 'горы Заилийского Алатау', text: 'Охраняет высотные пояса гор: ельники из ели Шренка, альпийские луга, ледники. Обитают снежный барс, горный козёл, беркут.'},
  {name: 'Барсакельмес', kind: 'З', lon: 59.9, lat: 45.7, zone: 'пустыня у Аральского моря', text: 'Раньше был островом в Аральском море, после его обмеления соединился с сушей. Охраняет куланов, джейранов и пустынные сообщества.'},
  {name: 'Маркакольский', kind: 'З', lon: 85.8, lat: 48.7, zone: 'горы Южного Алтая', text: 'Охраняет горное озеро Маркаколь, тайгу и редких птиц: чёрного аиста, скопу. В озере живёт рыба ускуч.'},
  {name: 'Устюртский', kind: 'З', lon: 54.6, lat: 43.3, zone: 'пустыня плато Устюрт', text: 'Охраняет глинистые и каменистые пустыни с обрывами — чинками. Обитают устюртский горный баран, джейран, каракал.'},
  {name: 'Алтын-Эмель', kind: 'П', lon: 78.7, lat: 44.0, zone: 'пустыня и горы у реки Или', text: 'Национальный парк. Известен Поющим барханом. Охраняет куланов, джейранов, архаров. Сюда можно приехать как туристу, соблюдая правила.'},
  {name: 'Баянаульский', kind: 'П', lon: 75.7, lat: 50.8, zone: 'горы среди степи', text: 'Первый национальный парк Казахстана, создан в 1985 году. Сосновые леса на гранитных скалах, озёра Жасыбай и Сабындыколь, архары.'},
  {name: 'Чарынский', kind: 'П', lon: 79.1, lat: 43.4, zone: 'каньон реки Чарын', text: 'Национальный парк. Охраняет Чарынский каньон и рощу реликтового ясеня согдийского — дерева, сохранившегося с древних времён.'},
];
const SPEC: {name: string; em: string; where: string; why: string; sites: number[]}[] = [
  {name: 'Снежный барс (ирбис)', em: '🐆', where: 'высокогорья Тянь-Шаня, Жетысуского Алатау, Алтая', why: 'Браконьерство ради меха, уменьшение числа горных козлов — его добычи.', sites: [0, 3]},
  {name: 'Кулан', em: '🫏', where: 'пустыни и полупустыни', why: 'Был истреблён охотой в начале XX века. Его вернули: завезли на Барсакельмес, затем расселили в Алтын-Эмель.', sites: [4, 7]},
  {name: 'Джейран', em: '🦌', where: 'пустыни юга и запада', why: 'Браконьерство и распашка земель, заборы и дороги на путях кочёвок.', sites: [4, 6, 7]},
  {name: 'Архар (горный баран)', em: '🐏', where: 'горы и мелкосопочник', why: 'Охота ради рогов, вытеснение домашним скотом с пастбищ.', sites: [0, 7, 8]},
  {name: 'Розовый фламинго', em: '🦩', where: 'солёные озёра', why: 'Гнездится только в нескольких местах; страдает от беспокойства и изменения уровня воды в озёрах.', sites: [2]},
  {name: 'Беркут', em: '🦅', where: 'горы и степи', why: 'Гибель на линиях электропередачи, разорение гнёзд, уменьшение добычи.', sites: [0, 1, 3]},
  {name: 'Тюльпан Грейга', em: '🌷', where: 'предгорья Западного Тянь-Шаня', why: 'Сбор цветов и выкапывание луковиц, распашка предгорий, выпас скота.', sites: [0]},
  {name: 'Яблоня Сиверса', em: '🍎', where: 'горные леса Заилийского и Жетысуского Алатау', why: 'Предок культурных сортов яблони. Дикие яблоневые леса вырубали и застраивали.', sites: [3]},
];
const ARAL = [{y: '1960', s: 1, t: 'Аральское море — четвёртое по площади озеро мира. В него впадают Сырдарья и Амударья.'}, {y: '1980', s: 0.8, t: 'Воду рек всё больше забирают на полив хлопка и риса. Уровень моря падает, вода становится солонее.'}, {y: '2000', s: 0.52, t: 'Море распалось на Малый (северный) и Большой (южный) Арал. Рыболовство прекратилось, порты оказались в десятках километров от воды.'}, {y: 'сегодня', s: 0.3, t: 'От моря осталось около десятой части. На высохшем дне — пустыня Аралкум, ветер разносит соль и пыль. Кокаральская плотина (2005) помогла частично восстановить Малый Арал.'}];

function tag(text: string) {
  const c = document.createElement('canvas'); c.width = 420; c.height = 72; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(10,20,34,0.82)'; x.beginPath(); (x as any).roundRect(4, 6, 412, 60, 22); x.fill();
  x.font = '600 30px system-ui, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 210, 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false})); sp.scale.set(2.6, 0.45, 1); sp.renderOrder = 30; return sp;
}

function build() {
  const root = new THREE.Group();
  const sh = new THREE.Shape(); OUT.forEach(([a, b], i) => i ? sh.lineTo(X(a), Y(b)) : sh.moveTo(X(a), Y(b)));
  const g = new THREE.ExtrudeGeometry(sh, {depth: 0.22, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2}); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), cs = new THREE.Color('#b8c46a'), cd = new THREE.Color('#e3c98a'), cf = new THREE.Color('#7fae5c');
  for (let i = 0; i < p.count; i++) { const lat = 48 - p.getZ(i) / 0.32; c.copy(lat < 46.5 ? cd : cs).lerp(lat < 46.5 ? cs : cf, lat < 46.5 ? Math.max(0, (lat - 43) / 3.5) : Math.min(1, (lat - 46.5) / 7)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  root.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.9})));
  const wm = new THREE.MeshStandardMaterial({color: '#3f8fc4', roughness: 0.2}), disc = (lon: number, lat: number, rx: number, rz: number, rot = 0, y = 0.262) => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 40), wm); m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(X(lon), y, -Y(lat)); m.scale.set(rx, rz, 1); root.add(m); return m; };
  disc(74.6, 46.3, 0.62, 0.11, 0.25); disc(81.7, 46.1, 0.16, 0.1); disc(69.3, 50.6, 0.14, 0.1);
  const sea = disc(50.2, 42.6, 1.6, 2.4, 0, 0.02); sea.position.x -= 0.9;
  const dry = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({color: '#e9dcc0', roughness: 1})); dry.rotation.x = -Math.PI / 2; dry.position.set(X(60), 0.258, -Y(45)); dry.scale.set(0.48, 0.5, 1); root.add(dry);
  const aral = disc(60, 45, 0.48, 0.5, 0, 0.264);
  const mm = new THREE.MeshStandardMaterial({color: '#8b8f97', roughness: 0.9, flatShading: true}), sm = new THREE.MeshStandardMaterial({color: '#f5f8fa', flatShading: true});
  [[70.5, 42.3, .3], [72.5, 42.7, .28], [74.6, 43.0, .34], [76.8, 43.0, .42], [78.6, 42.8, .4], [79.8, 44.9, .36], [80.6, 45.3, .3], [84.5, 49.3, .4], [85.9, 49.0, .36], [83.4, 50.3, .3], [82.6, 47.0, .26]].forEach(([lon, lat, h]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(h * 0.8, h * 1.5, 6), mm); m.position.set(X(lon), 0.25 + h * 0.75, -Y(lat)); root.add(m); const s = new THREE.Mesh(new THREE.ConeGeometry(h * 0.33, h * 0.6, 6), sm); s.position.set(X(lon), 0.25 + h * 1.22, -Y(lat)); root.add(s); });
  const pins = SITES.map((s, i) => { const gp = new THREE.Group(); gp.position.set(X(s.lon), 0.26, -Y(s.lat));
    const mat = new THREE.MeshStandardMaterial({color: s.kind === 'З' ? '#d62839' : '#2563eb', roughness: 0.4, emissive: '#000'});
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), mat); head.position.y = 0.62; const st = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.5, 10), mat); st.rotation.x = Math.PI; st.position.y = 0.27;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), new THREE.MeshBasicMaterial({visible: false})); hit.position.y = 0.5; hit.userData.i = i;
    const lb = tag(s.name); lb.position.y = 1.15; lb.visible = false; gp.add(head, st, hit, lb); root.add(gp); return {gp, mat, hit, lb}; });
  let as = 1;
  const update = (t: number, s: {sel: number; hi: number[]; aral: number; tab: string}, dt: number) => {
    pins.forEach((pn, i) => { const on = s.tab === 'spec' ? s.hi.includes(i) : s.sel === i; const dim = s.tab === 'spec' && !on;
      pn.gp.scale.setScalar(on ? 1.25 + 0.12 * Math.sin(t * 5) : dim ? 0.6 : 1); pn.mat.emissive.set(on ? '#ffd166' : '#000'); pn.mat.emissiveIntensity = on ? 0.5 : 0; pn.mat.opacity = dim ? 0.35 : 1; pn.mat.transparent = dim; pn.lb.visible = on; pn.gp.visible = s.tab !== 'aral' || i === 4; });
    as += (s.aral - as) * Math.min(1, dt * 3); aral.scale.set(0.48 * as, 0.5 * as, 1); aral.position.x = X(60) - (1 - as) * 0.1; aral.position.z = -Y(45) - (1 - as) * 0.18;
  };
  return {root, update, hits: pins.map(p => p.hit)};
}

export default function Map3D() {
  const host = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState('sites'), [sel, setSel] = useState(0), [sp, setSp] = useState(0), [ar, setAr] = useState(0), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {sel, hi: SPEC[sp].sites, aral: tab === 'aral' ? ARAL[ar].s : 0.3, tab};
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь списком ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none;cursor:grab';
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#d7ecf7');
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    const sun = new THREE.DirectionalLight('#fff4d6', 2.2); sun.position.set(-4, 9, 5); scene.add(sun); scene.add(new THREE.HemisphereLight('#ffffff', '#8a7a5a', 0.9));
    const {root, update, hits} = build(); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.45; ctl.minDistance = 4; ctl.maxDistance = 26; ctl.target.set(0, 0.2, 0.1);
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { const dd = Math.max(7, 13 / (w / h)); cam.position.set(0, dd * 0.72, dd * 0.7); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const ray = new THREE.Raycaster(), v = new THREE.Vector2(); let dx = 0, dy = 0;
    const down = (e: PointerEvent) => { dx = e.clientX; dy = e.clientY; };
    const up = (e: PointerEvent) => { if (Math.hypot(e.clientX - dx, e.clientY - dy) > 8) return; const b = r.domElement.getBoundingClientRect(); v.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(v, cam); const h = ray.intersectObjects(hits)[0]; if (h) { setTab('sites'); setSel(h.object.userData.i); } };
    r.domElement.addEventListener('pointerdown', down); r.domElement.addEventListener('pointerup', up);
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; update(t, st.current, dt); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); r.domElement.removeEventListener('pointerdown', down); r.domElement.removeEventListener('pointerup', up); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); }); }); r.dispose(); el.removeChild(r.domElement); };
  }, []);
  const s = SITES[sel], q = SPEC[sp], chip = {minHeight: 38, padding: '4px 10px', fontSize: '.9rem'};
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-карта: охрана природы Казахстана</b>
    {[['sites', '🏞️ Заповедники и парки'], ['spec', '📕 Красная книга'], ['aral', '🌊 Аральское море']].map(([id, t]) => <button key={id} className={tab === id ? '' : 's'} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => setTab(id)}>{t}</button>)}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(56vh, 420px)', margin: '0 10px', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      {tab === 'sites' && <><div className="mu">Нажми на метку на карте или выбери название. <span style={{color: '#d62839'}}>●</span> заповедник · <span style={{color: '#2563eb'}}>●</span> национальный парк</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{SITES.map((x, i) => <button key={x.name} className={sel === i ? '' : 's'} style={chip} onClick={() => setSel(i)}>{x.name}</button>)}</div>
        <div className="warn" aria-live="polite"><b>{s.name} — {s.kind === 'З' ? 'заповедник' : 'национальный парк'} ({s.zone}).</b> {s.text}</div></>}
      {tab === 'spec' && <><div className="mu">Выбери вид — на карте подсветятся охраняемые территории, где он обитает.</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{SPEC.map((x, i) => <button key={x.name} className={sp === i ? '' : 's'} style={chip} onClick={() => setSp(i)}>{x.em} {x.name}</button>)}</div>
        <div className="warn" aria-live="polite"><b><span aria-hidden="true">{q.em}</span> {q.name}.</b> Где живёт: {q.where}. <b>Почему редкий:</b> {q.why} <b>Где охраняется:</b> {q.sites.map(i => SITES[i].name).join(', ')}.</div></>}
      {tab === 'aral' && <><div className="mu">Пример влияния человека на экосистему. Двигай ползунок и следи за Аральским морем на карте.</div>
        <label htmlFor="arl" style={{display: 'block', marginTop: 8}}><b>Год: {ARAL[ar].y}</b></label>
        <input id="arl" type="range" min={0} max={3} step={1} value={ar} onChange={e => setAr(+e.target.value)} style={{width: '100%', padding: 0, border: 0, minHeight: 36, accentColor: 'var(--g)'}}/>
        <div className="warn" aria-live="polite"><b>{ARAL[ar].y}.</b> {ARAL[ar].t}</div></>}
      <div className="mu" style={{marginTop: 8}}>Границы страны нанесены по картографическим данным; горы, озёра и положение меток показаны приблизительно. Вращай карту пальцем или мышью.</div></div></div>;
}
