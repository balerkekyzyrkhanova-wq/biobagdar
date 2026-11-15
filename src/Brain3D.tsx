import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const R: Record<string, {name: string; col: string; grp: string; fn: string}> = {
  frontal: {name: 'Лобная доля', col: '#f28b6b', grp: 'Большие полушария', fn: 'Управляет произвольными движениями, речью, мышлением и планированием действий. Здесь принимаются решения.'},
  parietal: {name: 'Теменная доля', col: '#f2c14e', grp: 'Большие полушария', fn: 'Принимает сигналы от кожи и мышц: прикосновение, боль, тепло и холод, положение тела.'},
  temporal: {name: 'Височная доля', col: '#6fbf73', grp: 'Большие полушария', fn: 'Отвечает за слух и понимание речи, а также за обоняние, вкус и память.'},
  occipital: {name: 'Затылочная доля', col: '#5b9bd5', grp: 'Большие полушария', fn: 'Зрительная зона: сюда приходят сигналы от глаз, и здесь возникает зрительный образ.'},
  cerebellum: {name: 'Мозжечок', col: '#b07cc6', grp: 'Задний мозг', fn: 'Координирует движения, делает их точными и плавными, поддерживает равновесие и тонус мышц.'},
  pons: {name: 'Мост', col: '#e08fb1', grp: 'Задний мозг', fn: 'Связывает спинной и продолговатый мозг с вышележащими отделами, проводит сигналы. Участвует в управлении мимикой и жеванием.'},
  medulla: {name: 'Продолговатый мозг', col: '#d1695a', grp: 'Ствол мозга', fn: 'Центры жизненно важных функций: дыхания и сердцебиения. Защитные рефлексы: кашель, чихание, глотание, рвота. Повреждение опасно для жизни.'},
  mid: {name: 'Средний мозг', col: '#4fb3a5', grp: 'Ствол мозга', fn: 'Ориентировочные рефлексы: поворот головы и глаз на свет и звук. Регулирует тонус мышц и размер зрачка.'},
  dien: {name: 'Промежуточный мозг', col: '#e8a23d', grp: 'Виден в разрезе', fn: 'Через него проходят сигналы от органов чувств к коре. Регулирует температуру тела, голод, жажду, сон и работу желёз.'},
};
const ORDER = ['frontal', 'parietal', 'temporal', 'occipital', 'cerebellum', 'pons', 'medulla', 'mid', 'dien'];
const lobe = (x: number, y: number, z: number) => (y < 0.42 && x > -0.75 && x < 0.55 && Math.abs(z) > 0.42) ? 'temporal' : x > 0.22 ? 'frontal' : x > -0.62 ? 'parietal' : 'occipital';

function label(text: string) {
  const c = document.createElement('canvas'); c.width = 420; c.height = 72; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(10,20,34,0.82)'; x.beginPath(); (x as any).roundRect(4, 6, 412, 60, 22); x.fill();
  x.font = '600 30px system-ui, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 210, 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false})); sp.scale.set(2.3, 0.4, 1); sp.renderOrder = 30; return sp;
}
function geo(r: [number, number, number], fold: number, f: number, fissure = false) {
  const g0 = new THREE.SphereGeometry(1, 96, 64); g0.deleteAttribute('normal'); g0.deleteAttribute('uv'); const g = mergeVertices(g0, 1e-4), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * f + Math.sin(v.y * f * 0.7) * 1.7) * Math.cos(v.y * f * 0.9 + Math.sin(v.z * f) * 1.3) + 0.6 * Math.sin(v.z * f * 1.3 + v.x * 3);
    let k = 1 + fold * n; if (fissure && v.y > -0.2) k *= 1 - 0.16 * Math.exp(-((v.z / 0.07) ** 2)); if (fissure && v.y < -0.35) k *= 0.82 + 0.18 * Math.min(1, Math.abs(v.y + 0.35) < 0.65 ? 1 - (Math.abs(v.y + 0.35) / 0.65) * 0.35 : 0.65);
    p.setXYZ(i, v.x * k * r[0], v.y * k * r[1], v.z * k * r[2]); }
  g.computeVertexNormals(); return g;
}

function build(cutPlane: THREE.Plane) {
  const root = new THREE.Group(), pick: THREE.Mesh[] = [], mats: Record<string, THREE.MeshPhysicalMaterial> = {};
  const mat = (k: string, extra: any = {}) => (mats[k] = new THREE.MeshPhysicalMaterial({color: R[k].col, roughness: 0.6, envMapIntensity: 0.2, ...extra}));
  // большие полушария: цвет вершин по долям
  const cg = geo([1.55, 1.08, 1.2], 0.045, 11, true), cp = cg.attributes.position, cols = new Float32Array(cp.count * 3), lob: string[] = [];
  for (let i = 0; i < cp.count; i++) lob.push(lobe(cp.getX(i), cp.getY(i) + 0.55, cp.getZ(i)));
  cg.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const cm = new THREE.MeshPhysicalMaterial({vertexColors: true, roughness: 0.6, envMapIntensity: 0.2, clippingPlanes: [cutPlane], side: THREE.DoubleSide});
  const cer = new THREE.Mesh(cg, cm); cer.position.y = 0.55; cer.userData.k = 'cerebrum'; root.add(cer); pick.push(cer);
  const add = (k: string, g: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number]) => { const m = new THREE.Mesh(g, mat(k)); m.position.set(...pos); if (rot) m.rotation.set(...rot); m.userData.k = k; root.add(m); pick.push(m); return m; };
  const cbg = geo([0.62, 0.44, 0.82], 0.0, 1); { const p = cbg.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + 0.035 * Math.sin(p.getY(i) * 46); p.setXYZ(i, p.getX(i) * k, p.getY(i), p.getZ(i) * k); } cbg.computeVertexNormals(); }
  add('cerebellum', cbg, [-0.95, -0.38, 0]);
  add('dien', new THREE.SphereGeometry(0.3, 28, 20), [0.02, 0.22, 0]).scale.set(1.25, 0.85, 0.9);
  add('mid', new THREE.CylinderGeometry(0.17, 0.2, 0.34, 20), [-0.12, -0.12, 0], [0, 0, 0.35]);
  add('pons', new THREE.SphereGeometry(0.27, 24, 18), [-0.2, -0.47, 0]).scale.set(1.05, 0.95, 1.15);
  add('medulla', new THREE.CylinderGeometry(0.17, 0.12, 0.62, 20), [-0.4, -0.95, 0], [0, 0, -0.38]);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.8, 16), new THREE.MeshPhysicalMaterial({color: '#e8d9c8', roughness: 0.6})); cord.position.set(-0.62, -1.6, 0); cord.rotation.z = -0.2; root.add(cord);
  const lb = label(''); root.add(lb); lb.visible = false;
  const LP: Record<string, [number, number, number]> = {frontal: [1.1, 1.75, 0.9], parietal: [-0.2, 2.0, 0.6], temporal: [0.1, 0.3, 1.5], occipital: [-1.5, 1.5, 0.6], cerebellum: [-1.5, -1.05, 0.6], pons: [0.75, -0.55, 0.6], medulla: [0.55, -1.15, 0.5], mid: [0.9, -0.1, 0.6], dien: [0.9, 0.6, 0.6]};
  const c = new THREE.Color(), w = new THREE.Color('#e9d2c6'), hi = new THREE.Color(); let lastSel = '?', lastTex: THREE.Texture | null = null;
  const update = (t: number, s: {sel: string; cut: boolean; quiz: boolean}) => {
    cm.clippingPlanes = s.cut ? [cutPlane] : [];
    const pulse = 0.75 + 0.25 * Math.sin(t * 4);
    for (let i = 0; i < lob.length; i++) { const k = lob[i]; c.set(R[k].col); if (s.quiz) c.set('#d9a79a'); else if (s.sel && s.sel !== k) c.lerp(w, 0.45); else if (s.sel === k) c.lerp(hi.set('#ffe9a8'), 0.25 * (pulse - 0.5)); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
    cg.attributes.color.needsUpdate = true;
    Object.entries(mats).forEach(([k, m]) => { m.color.set(R[k].col); if (s.quiz) m.color.set('#d9a79a'); else if (s.sel && s.sel !== k) m.color.lerp(w, 0.45); m.emissive.set(!s.quiz && s.sel === k ? '#ffd166' : '#000'); m.emissiveIntensity = 0.35 * pulse; });
    if (s.sel !== lastSel) { lastSel = s.sel; if (s.sel && !s.quiz) { const n = label(R[s.sel].name); lastTex?.dispose(); lastTex = n.material.map; lb.material.map = n.material.map; lb.material.needsUpdate = true; lb.position.set(...LP[s.sel]); } }
    lb.visible = !!s.sel && !s.quiz;
  };
  return {root, update, pick};
}

export default function Brain3D() {
  const host = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState('frontal'), [cut, setCut] = useState(false), [quiz, setQuiz] = useState(false), [target, setTarget] = useState('cerebellum'), [res, setRes] = useState<{ok: boolean; k: string} | null>(null), [score, setScore] = useState([0, 0]), [err, setErr] = useState('');
  const st = useRef<any>({}); st.current = {sel: quiz ? '' : sel, cut, quiz, target, res};
  const click = useRef<(k: string) => void>(() => {});
  const next = (prev: string) => { const pool = ORDER.filter(k => k !== prev); setTarget(pool[Math.floor(Math.random() * pool.length)]); setRes(null); };
  click.current = (k: string) => {
    if (!quiz) { setSel(k); if (k === 'dien') setCut(true); return; }
    if (res) return; const ok = k === target; setRes({ok, k}); setScore([score[0] + (ok ? 1 : 0), score[1] + 1]);
  };
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь списком отделов ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.localClippingEnabled = true;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none;cursor:pointer';
    const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
    const a = new THREE.DirectionalLight('#fff6ea', 1.5); a.position.set(3, 6, 7); scene.add(a); scene.add(new THREE.HemisphereLight('#ffffff', '#40304a', 0.3));
    const {root, update, pick} = build(new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.02)); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.minDistance = 3.5; ctl.maxDistance = 16; ctl.target.set(-0.1, 0.25, 0);
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { const dd = Math.max(6.6, 7.2 / (w / h)); cam.position.set(dd * 0.25, dd * 0.18, dd); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const ray = new THREE.Raycaster(), v = new THREE.Vector2(), lp = new THREE.Vector3(); let dx = 0, dy = 0;
    const down = (e: PointerEvent) => { dx = e.clientX; dy = e.clientY; };
    const up = (e: PointerEvent) => { if (Math.hypot(e.clientX - dx, e.clientY - dy) > 8) return; const b = r.domElement.getBoundingClientRect(); v.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(v, cam);
      for (const h of ray.intersectObjects(pick)) { let k = h.object.userData.k; if (k === 'cerebrum') { if (st.current.cut && h.point.z > 0.02) continue; lp.copy(h.point); k = lobe(lp.x, lp.y, lp.z); } click.current(k); break; } };
    r.domElement.addEventListener('pointerdown', down); r.domElement.addEventListener('pointerup', up);
    const clock = new THREE.Clock(); let raf = 0, t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); t += Math.min(clock.getDelta(), 0.05); update(t, st.current); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); r.domElement.removeEventListener('pointerdown', down); r.domElement.removeEventListener('pointerup', up); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); }); }); pm.dispose(); r.dispose(); el.removeChild(r.domElement); };
  }, []);
  const cur = R[sel], chip = {minHeight: 38, padding: '4px 10px', fontSize: '.9rem'};
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель: головной мозг</b>
    <button className={!quiz ? '' : 's'} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => setQuiz(false)}>🔍 Изучаю</button>
    <button className={quiz ? '' : 's'} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => { setQuiz(true); setScore([0, 0]); next(''); }}>🎯 Проверяю себя</button>
    <button className={cut ? '' : 's'} aria-pressed={cut} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => setCut(!cut)}>✂ Разрез</button></div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(60vh, 460px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 35%, #33254a 0%, #0b1220 78%)', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      {!quiz ? <><div className="mu">Нажми на часть мозга на модели или выбери название. Спереди мозга — справа.</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{ORDER.map(k => <button key={k} className={sel === k ? '' : 's'} style={{...chip, borderColor: R[k].col}} onClick={() => click.current(k)}><span style={{color: sel === k ? '#fff' : R[k].col}} aria-hidden="true">●</span> {R[k].name}</button>)}</div>
        <div className="warn" aria-live="polite"><b>{cur.name}</b> <span className="tag">{cur.grp}</span><div>{cur.fn}</div></div></>
        : <><div className="warn" aria-live="polite"><b>Найди на модели: {R[target].name.toLowerCase()}.</b> {target === 'dien' && !cut ? 'Подсказка: этот отдел виден только в разрезе.' : 'Нажми на нужную часть.'}</div>
          {res && <div className="warn" style={{marginTop: 8, borderColor: res.ok ? '#15803d' : '#b91c1c'}}><b style={{color: res.ok ? '#15803d' : '#b91c1c'}}>{res.ok ? '✓ Верно!' : `✗ Это ${R[res.k].name.toLowerCase()}.`}</b> {R[target].name}: {R[target].fn} <div><button onClick={() => next(target)}>Следующий вопрос ▶</button></div></div>}
          <div style={{marginTop: 8}}><b>Счёт: {score[0]} из {score[1]}</b></div></>}
      <div className="mu" style={{marginTop: 8}}>Цвета условные: настоящий мозг серовато-розовый. Модель упрощена. Вращай её пальцем или мышью, приближай двумя пальцами или колёсиком.</div></div></div>;
}
