import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

type Part = {n: string; c: string; t: string};
const P: Record<string, Part> = {
  brain: {n: 'Головной мозг', c: '#f2a7b5', t: 'Главный орган нервной системы. Управляет работой всех органов, движениями, мышлением и памятью.'},
  trachea: {n: 'Трахея', c: '#8fd3f4', t: 'Дыхательная трубка длиной 10–12 см. Хрящевые полукольца не дают ей спадаться. Внизу делится на два бронха.'},
  lungR: {n: 'Правое лёгкое', c: '#f28ca0', t: 'Состоит из трёх долей. В лёгких бронхи ветвятся и заканчиваются альвеолами, где кислород переходит в кровь, а углекислый газ выходит из крови.'},
  lungL: {n: 'Левое лёгкое', c: '#f28ca0', t: 'Состоит из двух долей: оно немного меньше правого, потому что слева расположено сердце.'},
  heart: {n: 'Сердце', c: '#d62828', t: 'Мышечный орган размером с кулак. Четыре камеры: два предсердия и два желудочка. Перекачивает кровь по двум кругам кровообращения.'},
  aorta: {n: 'Аорта', c: '#ff5a4d', t: 'Самая крупная артерия. Выходит из левого желудочка и несёт артериальную кровь ко всем органам.'},
  diaphragm: {n: 'Диафрагма', c: '#c96a5a', t: 'Куполообразная мышца, отделяющая грудную полость от брюшной. При вдохе сокращается и опускается, при выдохе расслабляется и поднимается.'},
  esophagus: {n: 'Пищевод', c: '#e8a07a', t: 'Мышечная трубка около 25 см. Волны сокращений стенок (перистальтика) проталкивают пищу в желудок.'},
  stomach: {n: 'Желудок', c: '#f0937a', t: 'Мышечный мешок. Желудочный сок с соляной кислотой и пепсином начинает расщеплять белки.'},
  liver: {n: 'Печень', c: '#a8553f', t: 'Самая крупная железа. Вырабатывает желчь, которая помогает переваривать жиры, обезвреживает вредные вещества, запасает питательные вещества.'},
  pancreas: {n: 'Поджелудочная железа', c: '#f2c66b', t: 'Выделяет в тонкую кишку пищеварительный сок, расщепляющий белки, жиры и углеводы, а в кровь — гормон инсулин.'},
  smallInt: {n: 'Тонкая кишка', c: '#f2a98a', t: 'Длина 5–6 метров. Здесь завершается расщепление пищи и питательные вещества всасываются в кровь и лимфу через ворсинки.'},
  largeInt: {n: 'Толстая кишка', c: '#d98c6a', t: 'Длина около 1,5 метра. Здесь всасывается вода и формируются непереваренные остатки, работают полезные бактерии.'},
  kidneyR: {n: 'Правая почка', c: '#b34a55', t: 'Почки фильтруют кровь: удаляют лишнюю воду, соли и продукты обмена. Образуется моча.'},
  kidneyL: {n: 'Левая почка', c: '#b34a55', t: 'Парный орган выделения бобовидной формы. Через почки за сутки проходит вся кровь организма много раз.'},
  bladder: {n: 'Мочевой пузырь', c: '#f2d27a', t: 'Мышечный мешок, где накапливается моча перед выведением из организма.'},
};
type Step = {t: string; x: string; parts: string[]};
const SETS: Record<string, {title: string; parts: string[]; focus: string[]; steps: Step[]; play: string}> = {
  all: {title: '3D-атлас: органы человека', parts: Object.keys(P), focus: ['heart', 'lungR', 'lungL', 'liver', 'stomach', 'smallInt', 'largeInt', 'brain', 'bladder'], steps: [], play: ''},
  breath: {title: '3D-модель: дыхательная система', parts: ['trachea', 'lungR', 'lungL', 'diaphragm', 'heart'], focus: ['trachea', 'lungR', 'lungL', 'diaphragm'], play: '▶ Запустить дыхание', steps: [
    {t: 'Носовая полость и глотка', x: 'Воздух входит через нос: здесь он согревается, увлажняется и очищается от пыли. Затем проходит через глотку и гортань.', parts: []},
    {t: 'Трахея', x: 'Воздух проходит по трахее. Её стенки поддерживают хрящевые полукольца, поэтому она не спадается.', parts: ['trachea']},
    {t: 'Бронхи и лёгкие', x: 'Трахея делится на два бронха, они входят в лёгкие и ветвятся на всё более тонкие трубочки.', parts: ['trachea', 'lungR', 'lungL']},
    {t: 'Альвеолы: газообмен', x: 'Бронхи заканчиваются пузырьками — альвеолами. Через их тонкие стенки кислород переходит в кровь, а углекислый газ выходит из крови.', parts: ['lungR', 'lungL']},
    {t: 'Вдох и выдох: диафрагма', x: 'При вдохе диафрагма опускается и лёгкие расширяются, при выдохе диафрагма поднимается и воздух выходит наружу.', parts: ['diaphragm', 'lungR', 'lungL']}]},
  food: {title: '3D-модель: пищеварительная система', parts: ['esophagus', 'stomach', 'liver', 'pancreas', 'smallInt', 'largeInt'], focus: ['esophagus', 'stomach', 'liver', 'smallInt', 'largeInt'], play: '▶ Запустить путь пищи', steps: [
    {t: 'Ротовая полость', x: 'Зубы измельчают пищу, язык смешивает её со слюной. Фермент слюны начинает расщеплять крахмал.', parts: []},
    {t: 'Пищевод', x: 'Пищевод — мышечная трубка. Волны сокращений его стенок (перистальтика) проталкивают пищу в желудок.', parts: ['esophagus']},
    {t: 'Желудок', x: 'Желудочный сок с соляной кислотой и ферментом пепсином начинает расщеплять белки. Пища переваривается несколько часов.', parts: ['stomach']},
    {t: 'Тонкая кишка', x: 'Сюда поступают желчь печени и сок поджелудочной железы. Расщепление заканчивается, питательные вещества всасываются в кровь и лимфу.', parts: ['smallInt', 'liver', 'pancreas']},
    {t: 'Толстая кишка', x: 'В толстой кишке всасывается вода, остатки уплотняются, и непереваренное удаляется наружу.', parts: ['largeInt']}]},
};
const xray = (color: string, power: number, gain: number) => new THREE.ShaderMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  uniforms: {c: {value: new THREE.Color(color)}, p: {value: power}, g: {value: gain}},
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 c; uniform float p; uniform float g; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), p); gl_FragColor = vec4(c * (0.25 + f * 1.4), (0.04 + f) * g); }'});

function label(text: string) {
  const c = document.createElement('canvas'); c.width = 460; c.height = 76; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(6,14,26,0.86)'; x.beginPath(); (x as any).roundRect(4, 6, 452, 64, 24); x.fill(); x.strokeStyle = 'rgba(120,200,255,.7)'; x.lineWidth = 2.5; x.stroke();
  x.font = '600 32px system-ui, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 230, 40, 430);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export default function Body3D({set = 'all'}: {set?: string}) {
  const S = SETS[set], host = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(''), [step, setStep] = useState(-1), [play, setPlay] = useState(false), [bones, setBones] = useState(false), [state, setState] = useState<'load' | 'ok' | 'err'>('load');
  const st = useRef<any>({}); st.current = {sel, step, play, bones};
  const pick = useRef<(k: string) => void>(() => {}); pick.current = (k: string) => { setStep(-1); setPlay(false); setSel(k === sel ? '' : k); };
  useEffect(() => {
    const el = host.current; if (!el) return; let dead = false, raf = 0;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true}); } catch { setState('err'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none;cursor:pointer';
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#02060d');
    const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight('#cfe6ff', '#1a0d10', 0.9)); const k1 = new THREE.DirectionalLight('#ffffff', 2.2); k1.position.set(4, 6, 9); scene.add(k1); const k2 = new THREE.DirectionalLight('#6fb7ff', 1.4); k2.position.set(-7, 2, -5); scene.add(k2);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.minDistance = 1.2; ctl.maxDistance = 30;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const organs: Record<string, {m: THREE.Mesh; mat: THREE.MeshPhysicalMaterial; c: THREE.Vector3; r: number; s: number; base: THREE.Vector3}> = {}, picks: THREE.Mesh[] = [];
    const lb = new THREE.Sprite(new THREE.SpriteMaterial({transparent: true, depthTest: false})); lb.renderOrder = 50; lb.visible = false; scene.add(lb);
    const bolus = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({color: '#ffe14a'})); bolus.visible = false; bolus.renderOrder = 40; (bolus.material as any).depthTest = false; scene.add(bolus);
    let skel: THREE.Object3D[] = [], home = {t: new THREE.Vector3(), d: 8}, tgt = new THREE.Vector3(), dist = 8, lastSel = '?', lastStep = -9, stepT = 0, top = new THREE.Vector3();
    new GLTFLoader().load(import.meta.env.BASE_URL + 'models/body.glb', g => {
      if (dead) return; const root = new THREE.Group(); const meshes: THREE.Mesh[] = []; g.scene.traverse((o: any) => { if (o.isMesh) meshes.push(o); });
      const skin = meshes.find(m => (m.name || m.parent?.name || '').startsWith('skin'))!; skin.geometry.computeBoundingBox(); const bb = skin.geometry.boundingBox!, size = bb.getSize(new THREE.Vector3()), ctr = bb.getCenter(new THREE.Vector3());
      const zUp = size.z > size.y, H = zUp ? size.z : size.y, k = 10 / H;
      meshes.forEach(m => { const name = (m.name || m.parent?.name || '').replace(/_\d+$/, ''); const geo = m.geometry.clone(); geo.translate(-ctr.x, -ctr.y, -ctr.z); if (zUp) geo.rotateX(-Math.PI / 2); geo.scale(k, k, k); geo.computeVertexNormals(); geo.computeBoundingSphere();
        if (name === 'skin') { const o = new THREE.Mesh(geo, xray('#3fa9ff', 2.4, 0.5)); o.renderOrder = 6; root.add(o); return; }
        if (name === 'ribs' || name === 'spine') { const o = new THREE.Mesh(geo, xray('#9fd8ff', 1.8, 0.4)); o.renderOrder = 5; root.add(o); skel.push(o); return; }
        if (!P[name]) return;
        const c = geo.boundingSphere!.center.clone(); geo.translate(-c.x, -c.y, -c.z);
        const mat = new THREE.MeshPhysicalMaterial({color: P[name].c, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: new THREE.Color('#ffd9d0'), emissive: new THREE.Color(P[name].c), emissiveIntensity: 0.18, transparent: true, opacity: 1});
        const o = new THREE.Mesh(geo, mat); o.position.copy(c); o.userData.k = name; o.renderOrder = 10; root.add(o); organs[name] = {m: o, mat, c, r: geo.boundingSphere!.radius, s: 1, base: c.clone()}; if (S.parts.includes(name)) picks.push(o); else o.visible = set === 'all'; });
      scene.add(root);
      const box = new THREE.Box3(); S.focus.forEach(n => organs[n] && box.expandByObject(organs[n].m)); const bs = box.getBoundingSphere(new THREE.Sphere());
      home = {t: bs.center.clone(), d: bs.radius / Math.sin(18 * Math.PI / 180) * (cam.aspect < 1 ? 1.15 / cam.aspect : 1.05)}; tgt.copy(home.t); dist = home.d; ctl.target.copy(home.t); cam.position.set(home.t.x + home.d * 0.18, home.t.y + home.d * 0.05, home.t.z + home.d);
      top.set(0, organs.trachea ? organs.trachea.c.y + organs.trachea.r * 1.6 : 3.6, 0.3);
      setState('ok');
    }, undefined, () => setState('err'));
    const ray = new THREE.Raycaster(), v = new THREE.Vector2(); let dx = 0, dy = 0, moved = 0;
    const down = (e: PointerEvent) => { dx = e.clientX; dy = e.clientY; };
    const up = (e: PointerEvent) => { if (Math.hypot(e.clientX - dx, e.clientY - dy) > 8) { moved = performance.now(); return; } const b = r.domElement.getBoundingClientRect(); v.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(v, cam); const h = ray.intersectObjects(picks.filter(p => p.visible))[0]; pick.current(h ? h.object.userData.k : ''); };
    r.domElement.addEventListener('pointerdown', down); r.domElement.addEventListener('pointerup', up);
    const clock = new THREE.Clock(), dir = new THREE.Vector3(), wc = new THREE.Color('#ffffff'), a = new THREE.Vector3(), bq = new THREE.Vector3(); let t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); t += dt; const s = st.current, act: string[] = s.step >= 0 ? S.steps[s.step].parts : s.sel ? [s.sel] : [];
      skel.forEach(o => { o.visible = s.bones; });
      const key = s.sel + '|' + s.step;
      if (key !== lastSel) { lastSel = key; const o = s.sel && organs[s.sel]; if (o) { tgt.copy(o.base); dist = Math.max(o.r * 4.2, home.d * 0.42); lb.material.map?.dispose(); lb.material.map = label(P[s.sel].n); lb.material.needsUpdate = true; } else { tgt.copy(home.t); dist = home.d; } }
      if (s.step !== lastStep) { lastStep = s.step; stepT = 0; } stepT = Math.min(1, stepT + dt / 2.2);
      const breathing = set === 'breath' && s.play, e = breathing ? 0.5 * (1 - Math.cos(t * 1.6)) : 0;
      Object.entries(organs).forEach(([k, o]) => { const on = act.includes(k), any = act.length > 0, want = on ? 1.14 : 1; o.s += (want - o.s) * Math.min(1, dt * 7); let sc = o.s * (on ? 1 + 0.025 * Math.sin(t * 5) : 1), y = o.base.y;
        if (k === 'lungR' || k === 'lungL') sc *= 1 + 0.07 * e; if (k === 'diaphragm') y -= 0.16 * e; o.m.scale.setScalar(sc); o.m.position.y = y;
        o.mat.emissiveIntensity += ((on ? 0.55 + 0.25 * Math.sin(t * 5) : any ? 0.03 : 0.18) - o.mat.emissiveIntensity) * Math.min(1, dt * 8); o.mat.opacity += ((any && !on ? 0.16 : 1) - o.mat.opacity) * Math.min(1, dt * 6); o.mat.depthWrite = o.mat.opacity > 0.6; o.m.renderOrder = on ? 12 : 10;
        o.mat.color.set(P[k].c); if (on) o.mat.color.lerp(wc, 0.04 + 0.04 * Math.sin(t * 5)); });
      const so = s.sel && organs[s.sel]; lb.visible = !!so; if (so) { const sc = cam.position.distanceTo(ctl.target) * 0.11; lb.scale.set(sc * 3.0, sc * 0.5, 1); lb.position.set(so.base.x, so.base.y + so.r * 1.25 + sc * 0.3, so.base.z + so.r); }
      // движение комка пищи / воздуха между органами по шагам
      bolus.visible = false; if (s.step >= 0 && s.play) { const cur = S.steps[s.step].parts[0], prev = s.step > 0 ? S.steps[s.step - 1].parts[0] : ''; a.copy(prev && organs[prev] ? organs[prev].base : top); bq.copy(cur && organs[cur] ? organs[cur].base : top); if (set === 'food' && (cur || s.step === 0)) { bolus.visible = true; bolus.position.lerpVectors(a, bq, stepT * stepT * (3 - 2 * stepT)); bolus.scale.setScalar((cam.position.distanceTo(ctl.target) / 8) * (1 + 0.2 * Math.sin(t * 8))); } }
      if (performance.now() - moved > 1500 || key !== lastSel) { ctl.target.lerp(tgt, Math.min(1, dt * 3)); dir.copy(cam.position).sub(ctl.target); const d0 = dir.length(); dir.multiplyScalar((d0 + (dist - d0) * Math.min(1, dt * 2.5)) / d0); if (Math.abs(d0 - dist) > 0.02 && performance.now() - moved > 1500) cam.position.copy(ctl.target).add(dir); }
      ctl.update(); r.render(scene, cam); };
    loop();
    return () => { dead = true; cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); r.domElement.removeEventListener('pointerdown', down); r.domElement.removeEventListener('pointerup', up); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); }); }); r.dispose(); el.removeChild(r.domElement); };
  }, [set]);
  useEffect(() => { if (!play || !S.steps.length) return; const id = setInterval(() => setStep(x => (x + 1) % S.steps.length), 4200); return () => clearInterval(id); }, [play, set]);
  const go = (i: number) => { setSel(''); setStep((i + S.steps.length) % S.steps.length); }, cur = sel ? P[sel] : null, chip = {minHeight: 38, padding: '4px 10px', fontSize: '.9rem'};
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>{S.title}</b>
    {S.play && <button style={{minHeight: 40, padding: '4px 12px'}} onClick={() => { if (!play) { setSel(''); if (step < 0) setStep(0); } setPlay(!play); }}>{play ? '⏸ Пауза' : S.play}</button>}
    <button className={bones ? '' : 's'} aria-pressed={bones} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => setBones(!bones)}>🦴 Скелет</button>
    {(sel || step >= 0) && <button className="s" style={{minHeight: 40, padding: '4px 10px'}} onClick={() => { setSel(''); setStep(-1); setPlay(false); }}>↺ Весь вид</button>}</div>
    <div ref={host} className="lcv" style={{height: 'min(68vh, 560px)', margin: '0 10px', background: '#02060d', borderRadius: 14, position: 'relative'}}>
      {state !== 'ok' && <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#cfe6ff', padding: 20, textAlign: 'center'}}>{state === 'load' ? 'Загружаю 3D-модель тела… (около 3 МБ)' : 'Не удалось загрузить 3D-модель. Проверь интернет и обнови страницу.'}</div>}</div>
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      <div className="mu">Нажми на орган на модели или выбери название — он увеличится и подсветится, остальные станут прозрачными.</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0'}}>{S.parts.map(k => <button key={k} className={sel === k ? '' : 's'} style={chip} onClick={() => pick.current(k)}><span style={{color: sel === k ? '#fff' : P[k].c}} aria-hidden="true">●</span> {P[k].n}</button>)}</div>
      {cur && <div className="warn" aria-live="polite"><b>{cur.n}.</b> {cur.t}</div>}
      {S.steps.length > 0 && <><div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0', alignItems: 'center'}}><b>По порядку:</b>{S.steps.map((s, i) => <button key={i} className={step === i ? '' : 's'} style={{minHeight: 36, padding: '2px 12px'}} onClick={() => go(i)} aria-label={`Шаг ${i + 1}: ${s.t}`}>{i + 1}</button>)}<button className="s" style={{minHeight: 36, padding: '2px 10px'}} onClick={() => go(step + 1)}>Дальше ▶</button></div>
        {step >= 0 && <div className="warn" aria-live="polite"><b>Шаг {step + 1} из {S.steps.length}: {S.steps[step].t}.</b> {S.steps[step].x}</div>}</>}
      <div className="mu" style={{marginTop: 8}}>Формы органов — настоящие анатомические модели из открытой базы BodyParts3D, © The Database Center for Life Science, лицензия CC BY-SA 2.1 Japan. Цвета условные. Вращай модель пальцем или мышью, приближай двумя пальцами.</div></div></div>;
}
