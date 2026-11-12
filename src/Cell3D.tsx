import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Kind = 'plant' | 'animal';
const INFO: Record<string, [string, string, string]> = {
  wall: ['Клеточная стенка', '#86c46f', 'Прочный каркас из целлюлозы (только у растений, грибов и бактерий). Придаёт клетке форму и защищает её; вода и растворы проходят через неё свободно.'],
  mem: ['Клеточная мембрана', '#d9f99d', 'Тонкая двойная плёнка из жиров и белков. Выбирает, какие вещества входят в клетку и выходят из неё. Есть у всех клеток.'],
  nuc: ['Ядро', '#a78bfa', 'Хранит наследственную информацию (ДНК), упакованную в хроматин, и управляет клеткой. Окружено двойной оболочкой с порами; тёмный шарик внутри — ядрышко, там собираются рибосомы.'],
  mit: ['Митохондрии', '#fb923c', 'Энергетические станции: здесь при клеточном дыхании высвобождается энергия из органических веществ. Внутренняя мембрана собрана в складки — кристы — чтобы вместить больше «оборудования».'],
  chl: ['Хлоропласты', '#22c55e', 'Есть только у растений. На свету здесь идёт фотосинтез: стопки дисков (граны) содержат хлорофилл и улавливают солнечный свет.'],
  vac: ['Центральная вакуоль', '#7dd3fc', 'У растений крупная и занимает большую часть клетки. Запасает воду и вещества, создаёт упругость (тургор) и оттесняет остальное содержимое к стенке.'],
  er: ['Эндоплазматическая сеть (ЭПС)', '#f9a8d4', 'Сеть мембранных каналов вокруг ядра. Шероховатая ЭПС покрыта рибосомами и участвует в создании и транспорте белков.'],
  rib: ['Рибосомы', '#a855f7', 'Мельчайшие «фабрики» белка. Свободно лежат в цитоплазме и сидят на ЭПС.'],
  golgi: ['Аппарат Гольджи', '#fde047', 'Стопка плоских мембранных мешочков: «упаковывает» и сортирует вещества, формирует пузырьки для вывода из клетки.'],
  lys: ['Лизосомы и пузырьки', '#84cc16', 'Лизосомы — пузырьки с ферментами, переваривающие ненужные частицы (в основном в клетках животных). Мелкие пузырьки перевозят вещества между органоидами.'],
};
const KEYS: Record<Kind, string[]> = {
  plant: ['wall', 'mem', 'vac', 'nuc', 'chl', 'mit', 'er', 'rib', 'golgi', 'lys'],
  animal: ['mem', 'nuc', 'mit', 'er', 'rib', 'golgi', 'lys'],
};

function rng(seed: number) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function build(kind: Kind, plane: THREE.Plane) {
  const R = rng(kind === 'plant' ? 7 : 11);
  const root = new THREE.Group();
  const byKey: Record<string, THREE.Material[]> = {};
  const pick: THREE.Object3D[] = [];
  const anim: ((t: number) => void)[] = [];
  const reg = (key: string, m: THREE.Mesh | THREE.InstancedMesh) => { m.userData.key = key; pick.push(m); (byKey[key] = byKey[key] || []).push(m.material as THREE.Material); };
  const glass = (color: string, opacity: number, clip = false) => new THREE.MeshPhysicalMaterial({color, transparent: true, opacity, roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 1, sheenRoughness: 0.25, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.5), side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.3, clippingPlanes: clip ? [plane] : [], clipShadows: false});
  const solid = (color: string, rough = 0.42) => new THREE.MeshPhysicalMaterial({color, roughness: rough, metalness: 0.02, clearcoat: 0.5, clearcoatRoughness: 0.35, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.4), envMapIntensity: 1});
  const wobble = (g0: THREE.BufferGeometry, amp: number, f: number, seed: number) => {
    g0.deleteAttribute('normal'); g0.deleteAttribute('uv'); const g = mergeVertices(g0, 1e-4);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const l = v.length(); const n = Math.sin(v.x * f + seed) * Math.cos(v.y * f * 0.8 + seed * 1.7) + Math.sin(v.z * f * 1.3 - seed); v.multiplyScalar(1 + (amp * n) / Math.max(l, 0.001) * 0.5); p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g;
  };
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, key: string | null, parent: THREE.Object3D) => { const o = new THREE.Mesh(g, m); parent.add(o); if (key) reg(key, o); return o; };
  const rnd = (a: number, b: number) => a + (b - a) * R();

  // ----- оболочка -----
  const innerR = kind === 'plant' ? 0 : 3;
  if (kind === 'animal') {
    const o = mesh(wobble(new THREE.IcosahedronGeometry(innerR, 5), 0.16, 1.6, 2), glass('#ffb48a', 0.17, true), 'mem', root); o.renderOrder = 5;
    const c = mesh(new THREE.SphereGeometry(innerR - 0.08, 32, 24), glass('#ffe1c9', 0.07, true), null, root); c.renderOrder = 1;
  } else {
    const w = mesh(new RoundedBoxGeometry(6.6, 4.7, 4.7, 6, 0.6), glass('#7fc46a', 0.3, true), 'wall', root); w.renderOrder = 6;
    const m = mesh(new RoundedBoxGeometry(6.3, 4.4, 4.4, 6, 0.55), glass('#d9f99d', 0.2, true), 'mem', root); m.renderOrder = 5;
    const c = mesh(new RoundedBoxGeometry(6.2, 4.3, 4.3, 4, 0.5), glass('#f0fdd4', 0.06, true), null, root); c.renderOrder = 1;
  }
  const inside = (): THREE.Vector3 => {
    if (kind === 'animal') { for (;;) { const v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)); if (v.length() < 1) return v.multiplyScalar(2.45); } }
    return new THREE.Vector3(rnd(-2.7, 2.7), rnd(-1.7, 1.7), rnd(-1.7, 1.7));
  };

  // ----- ядро -----
  const nPos = kind === 'plant' ? new THREE.Vector3(2.0, 0.85, -0.9) : new THREE.Vector3(0.4, 0.2, -0.2);
  const nr = kind === 'plant' ? 0.68 : 0.98;
  const nuc = new THREE.Group(); nuc.position.copy(nPos); root.add(nuc);
  mesh(new THREE.SphereGeometry(nr, 48, 32), glass('#c4b5fd', 0.38), 'nuc', nuc).renderOrder = 4;
  mesh(wobble(new THREE.IcosahedronGeometry(nr * 0.82, 4), 0.18, 3.5, 4), solid('#7c5cff', 0.5), 'nuc', nuc);
  const nucleolus = mesh(new THREE.SphereGeometry(nr * 0.28, 24, 16), solid('#3b1d8f', 0.4), 'nuc', nuc); nucleolus.position.set(nr * 0.22, nr * 0.12, nr * 0.2);
  const poreG = new THREE.SphereGeometry(nr * 0.06, 8, 6), poreM = solid('#4c1d95'), pores = new THREE.InstancedMesh(poreG, poreM, 46), d = new THREE.Object3D();
  for (let i = 0; i < 46; i++) { const u = R() * 2 - 1, th = R() * Math.PI * 2, s = Math.sqrt(1 - u * u); d.position.set(s * Math.cos(th), u, s * Math.sin(th)).multiplyScalar(nr * 1.005); d.updateMatrix(); pores.setMatrixAt(i, d.matrix); }
  nuc.add(pores); reg('nuc', pores);

  // ----- ЭПС с рибосомами -----
  const erG = new THREE.Group(); erG.position.copy(nPos); root.add(erG);
  const ribCount = 260, ribs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), solid('#a855f7', 0.5), ribCount); let ri = 0;
  for (let k = 0; k < 3; k++) {
    const pts: THREE.Vector3[] = [], N = 70, rr = nr * 1.28 + k * 0.17;
    for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 3.3 + k * 2.1, yy = (i / N - 0.5) * nr * 2.1 + 0.18 * Math.sin(i * 0.8 + k); const r2 = rr * Math.sqrt(Math.max(0.15, 1 - (yy / (nr * 1.5)) ** 2)) * (1 + 0.07 * Math.sin(i * 1.7)); pts.push(new THREE.Vector3(r2 * Math.cos(a), yy, r2 * Math.sin(a))); }
    const curve = new THREE.CatmullRomCurve3(pts);
    mesh(new THREE.TubeGeometry(curve, 160, 0.055, 8, false), solid('#f9a8d4', 0.45), 'er', erG);
    for (let i = 0; i < 80 && ri < ribCount; i++, ri++) { const p = curve.getPoint(R()); d.position.set(p.x + rnd(-0.06, 0.06), p.y + rnd(-0.06, 0.06), p.z + rnd(-0.06, 0.06)); d.updateMatrix(); ribs.setMatrixAt(ri, d.matrix); }
  }
  ribs.count = ri; ribs.instanceMatrix.needsUpdate = true; erG.add(ribs); reg('rib', ribs);
  // свободные рибосомы
  const free = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), solid('#a855f7', 0.5), 120);
  for (let i = 0; i < 120; i++) { const p = inside(); d.position.copy(p); d.updateMatrix(); free.setMatrixAt(i, d.matrix); }
  root.add(free); reg('rib', free);

  // ----- аппарат Гольджи -----
  const golgi = new THREE.Group(); golgi.position.copy(kind === 'plant' ? new THREE.Vector3(1.4, -0.9, 0.9) : new THREE.Vector3(-1.5, -0.7, 0.9)); golgi.rotation.set(0.3, 0.6, 0.2); root.add(golgi);
  for (let i = 0; i < 6; i++) { const s = 1 - i * 0.09; const t = mesh(new THREE.TorusGeometry(0.5 * s, 0.045, 10, 36, Math.PI * 1.15), solid('#fde047', 0.38), 'golgi', golgi); t.position.y = (i - 2.5) * 0.14; t.rotation.x = Math.PI / 2; t.scale.set(1, 1.35, 1); }
  const vesicles: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) { const v = mesh(new THREE.SphereGeometry(rnd(0.05, 0.09), 14, 10), glass('#67e8f9', 0.7), 'lys', root); v.position.copy(golgi.position).add(new THREE.Vector3(rnd(-0.9, 0.9), rnd(-0.5, 0.5), rnd(-0.9, 0.9))); v.userData.base = v.position.clone(); v.userData.ph = R() * 6; vesicles.push(v); }
  anim.push(t => vesicles.forEach(v => { const b = v.userData.base as THREE.Vector3; v.position.set(b.x + 0.12 * Math.sin(t * 0.9 + v.userData.ph), b.y + 0.1 * Math.cos(t * 0.7 + v.userData.ph), b.z + 0.12 * Math.sin(t * 0.6 + v.userData.ph * 2)); }));

  // ----- митохондрии -----
  const mitos: THREE.Group[] = [];
  const mitoN = kind === 'plant' ? 6 : 8;
  for (let i = 0; i < mitoN; i++) {
    const g = new THREE.Group(), len = rnd(0.5, 0.75), rad = rnd(0.17, 0.22);
    const outer = mesh(new THREE.CapsuleGeometry(rad, len, 10, 20), glass('#fb923c', 0.42), 'mit', g); outer.renderOrder = 4;
    mesh(new THREE.CapsuleGeometry(rad * 0.82, len * 0.92, 8, 16), solid('#fdba74', 0.55), 'mit', g);
    for (let s = -1; s <= 1; s += 2) {
      const pts: THREE.Vector3[] = []; for (let j = 0; j <= 10; j++) { const x = -(len / 2 + rad * 0.6) + (j / 10) * (len + rad * 1.2); pts.push(new THREE.Vector3(x, (j % 2 ? 1 : -1) * rad * 0.55, s * rad * 0.25)); }
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.022, 6, false), solid('#c2410c', 0.5), 'mit', g);
    }
    g.rotation.z = Math.PI / 2; const holder = new THREE.Group(); holder.add(g); holder.position.copy(inside()); holder.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6)); holder.userData.base = holder.position.clone(); holder.userData.ph = R() * 6; root.add(holder); mitos.push(holder);
  }
  anim.push(t => mitos.forEach(h => { const b = h.userData.base as THREE.Vector3, p = h.userData.ph; h.position.set(b.x + 0.1 * Math.sin(t * 0.5 + p), b.y + 0.1 * Math.cos(t * 0.45 + p), b.z + 0.08 * Math.sin(t * 0.35 + p * 2)); h.rotation.y += 0.002; }));

  // ----- особенности клетки -----
  if (kind === 'animal') {
    for (let i = 0; i < 6; i++) { const l = mesh(new THREE.SphereGeometry(rnd(0.1, 0.16), 20, 14), solid('#84cc16', 0.35), 'lys', root); l.position.copy(inside()); }
  } else {
    const vac = mesh(wobble(new THREE.SphereGeometry(1, 48, 32), 0.06, 2.2, 5), glass('#38bdf8', 0.34), 'vac', root); vac.scale.set(2.2, 1.45, 1.45); vac.position.set(-0.6, -0.1, 0); vac.renderOrder = 3;
    const cl = new THREE.Group(); root.add(cl); const chls: THREE.Group[] = [];
    for (let i = 0; i < 16; i++) {
      const g = new THREE.Group();
      const body = mesh(new THREE.SphereGeometry(1, 28, 18), glass('#34d399', 0.5), 'chl', g); body.scale.set(0.52, 0.26, 0.3); body.renderOrder = 4;
      for (let s = 0; s < 3; s++) for (let k = 0; k < 5; k++) { const dsk = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.022, 14), solid('#14532d', 0.55), 'chl', g); dsk.position.set(-0.22 + s * 0.22, -0.07 + k * 0.035, 0.0); }
      const face = Math.floor(R() * 4); const p = new THREE.Vector3(rnd(-2.6, 2.6), face === 0 ? 1.75 : face === 1 ? -1.75 : rnd(-1.5, 1.5), face === 2 ? 1.75 : face === 3 ? -1.75 : rnd(-1.5, 1.5));
      g.position.copy(p); g.rotation.set(rnd(-0.3, 0.3), rnd(0, 3), rnd(-0.3, 0.3)); g.userData.base = p.clone(); g.userData.ph = R() * 6; cl.add(g); chls.push(g);
    }
    anim.push(t => chls.forEach(g => { const b = g.userData.base as THREE.Vector3; g.position.y = b.y + 0.04 * Math.sin(t * 0.8 + g.userData.ph); }));
  }

  // ----- поток цитоплазмы (частицы) -----
  const pn = 380, pg = new THREE.BufferGeometry(), arr = new Float32Array(pn * 3);
  for (let i = 0; i < pn; i++) { const p = inside(); arr.set([p.x, p.y, p.z], i * 3); }
  pg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({color: kind === 'plant' ? '#fef9c3' : '#fff1e6', size: 0.045, transparent: true, opacity: 0.55, depthWrite: false})); root.add(pts);
  anim.push(t => { pts.rotation.y = t * 0.035; });

  return {root, byKey, pick, anim};
}

export default function Cell3D() {
  const host = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<Kind>('animal'), [cut, setCut] = useState(false), [spin, setSpin] = useState(() => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches), [sel, setSel] = useState(''), [err, setErr] = useState('');
  const ref = useRef<any>({});
  ref.current.cut = cut; ref.current.spin = spin; ref.current.sel = sel;

  useEffect(() => {
    const el = host.current; if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь плоской схемой ниже.'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement); renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60); camera.position.set(0, 1.0, kind === 'plant' ? 10 : 8);
    const key = new THREE.DirectionalLight('#fff3e0', 2.2); key.position.set(5, 7, 6); scene.add(key);
    const rim = new THREE.DirectionalLight('#7dd3fc', 1.4); rim.position.set(-6, -2, -5); scene.add(rim); scene.add(new THREE.HemisphereLight('#cfe8ff', '#2a1a3a', 0.6));
    const plane = new THREE.Plane(new THREE.Vector3(-0.28, 0.12, -1).normalize(), 0);
    const {root, byKey, pick, anim} = build(kind, plane); scene.add(root);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.07; controls.minDistance = 4; controls.maxDistance = 16; controls.autoRotateSpeed = 0.9;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    // выбор органоида кликом
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let down = {x: 0, y: 0};
    const dom = renderer.domElement;
    const onDown = (e: PointerEvent) => { down = {x: e.clientX, y: e.clientY}; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const r = dom.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(mouse, camera);
      // ближайший пересечённый органоид; оболочки (стенка/мембрана) выбираем только если под курсором больше ничего нет
      const hits = ray.intersectObjects(pick, false).filter(h => !(ref.current.cut && plane.distanceToPoint(h.point) < 0 && ['wall', 'mem'].includes(h.object.userData.key)));
      const inner = hits.find(h => !['wall', 'mem', 'vac'].includes(h.object.userData.key)) || hits.find(h => h.object.userData.key === 'vac') || hits[0];
      setSel(inner ? inner.object.userData.key : '');
    };
    dom.addEventListener('pointerdown', onDown); dom.addEventListener('pointerup', onUp);
    ref.current.byKey = byKey;
    const clock = new THREE.Clock(); let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop); const t = clock.getElapsedTime();
      plane.constant = ref.current.cut ? 0 : 100;
      controls.autoRotate = ref.current.spin; controls.update();
      if (ref.current.spin) anim.forEach(f => f(t));
      Object.entries(byKey).forEach(([k, ms]) => ms.forEach(m => { const mm = m as THREE.MeshPhysicalMaterial; const on = ref.current.sel === k; mm.emissive = mm.emissive || new THREE.Color(); mm.emissive.set(on ? INFO[k][1] : '#000000'); mm.emissiveIntensity = on ? 0.35 + 0.15 * Math.sin(t * 4) : 0; }));
      renderer.render(scene, camera);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); dom.removeEventListener('pointerdown', onDown); dom.removeEventListener('pointerup', onUp); controls.dispose();
      scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: any) => m.dispose()); });
      pm.dispose(); renderer.dispose(); el.removeChild(dom);
    };
  }, [kind]);

  const keys = KEYS[kind];
  const cur = sel && keys.includes(sel) ? INFO[sel] : null;
  return <div className="card lab"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель клетки</b>
    <button className={kind === 'animal' ? '' : 's'} onClick={() => { setKind('animal'); setSel(''); }}>🐾 Животная клетка</button>
    <button className={kind === 'plant' ? '' : 's'} onClick={() => { setKind('plant'); setSel(''); }}>🌿 Растительная клетка</button>
    <button className={cut ? '' : 's'} onClick={() => setCut(!cut)} aria-pressed={cut}>✂ Разрез</button>
    <button className="s" onClick={() => setSpin(!spin)}>{spin ? '⏸ Остановить' : '▶ Вращение и движение'}</button></div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} style={{height: 'min(62vh, 440px)', margin: '0 10px', background: 'radial-gradient(ellipse at 50% 40%, #1d3b56 0%, #0b1622 75%)', borderRadius: 14}}/>}
    <div style={{padding: '8px 14px 14px'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '4px 0 8px'}}>{keys.map(k => <button key={k} className={sel === k ? '' : 's'} style={{minHeight: 36, padding: '4px 10px'}} onClick={() => setSel(sel === k ? '' : k)}>{INFO[k][0]}</button>)}</div>
      <div className="warn" aria-live="polite">{cur ? <><b style={{color: 'var(--tx)'}}>{cur[0]}.</b> {cur[2]}</> : 'Вращай клетку пальцем или мышью, приближай двумя пальцами или колёсиком. Нажми на органоид или на кнопку с названием, чтобы прочитать о нём. Кнопка «Разрез» открывает внутренность клетки.'}</div>
      <div className="mu" style={{marginTop: 6}}>Модель упрощена: число, размеры и расположение органоидов условные. Реальные органоиды видны только в электронный микроскоп.</div></div></div>;
}
