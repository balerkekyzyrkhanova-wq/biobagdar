import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

type Stage = {name: string; years: string; text: string; sp: number};
type Sc = {name: string; what: string; ground: string[]; stages: Stage[]; d: Record<string, number[]>};
const SC: Record<string, Sc> = {
  primary: {name: '🪨 Первичная: на голой скале', what: 'Первичная сукцессия начинается там, где жизни и почвы не было совсем: на скалах, застывшей лаве, песчаных дюнах.',
    ground: ['#8d9096', '#8d9096', '#84896f', '#7d7350', '#6a5a3c', '#4f4230'],
    stages: [
      {name: 'Голая скала', years: '0 лет', sp: 0, text: 'Почвы нет. Камень разрушают только ветер, вода и перепады температуры.'},
      {name: 'Лишайники', years: '≈ 5 лет', sp: 3, text: 'Первыми поселяются лишайники — организмы-пионеры. Они выделяют кислоты, разрушают камень и после отмирания дают первые крупицы почвы.'},
      {name: 'Мхи', years: '≈ 20 лет', sp: 8, text: 'На тонком слое почвы растут мхи. Они удерживают влагу и накапливают перегной.'},
      {name: 'Травы', years: '≈ 50 лет', sp: 20, text: 'Почвы стало больше — появляются травы, а с ними насекомые и мелкие животные.'},
      {name: 'Кустарники', years: '≈ 100 лет', sp: 35, text: 'Кустарники затеняют травы. Приходят птицы, они приносят семена деревьев.'},
      {name: 'Лес (устойчивое сообщество)', years: '≈ 200 лет', sp: 60, text: 'Вырастает лес. Сообщество становится устойчивым: видов много, и состав почти не меняется. Такое сообщество называют климаксным.'}],
    d: {rock: [1, 1, 1, .7, .4, .2], lichen: [0, 1, .8, .3, .1, 0], moss: [0, 0, 1, .6, .3, .2], grass: [0, 0, 0, 1, .8, .5], shrub: [0, 0, 0, 0, 1, .5], birch: [0, 0, 0, 0, .3, .4], conifer: [0, 0, 0, 0, 0, 1]}},
  secondary: {name: '🔥 Вторичная: после пожара', what: 'Вторичная сукцессия идёт там, где сообщество разрушено, но почва с семенами сохранилась: после пожара, вырубки, на заброшенном поле. Она проходит быстрее первичной.',
    ground: ['#3a3532', '#4a4038', '#5a4a36', '#5a4a36', '#54452f', '#4a3d2b'],
    stages: [
      {name: 'Гарь', years: '0 лет', sp: 2, text: 'Лес сгорел, но почва, семена и корни в ней сохранились. Зола удобряет почву.'},
      {name: 'Однолетние травы', years: '1–2 года', sp: 10, text: 'Первыми вырастают быстрорастущие однолетние травы, например иван-чай. Им нужно много света.'},
      {name: 'Многолетние травы', years: '3–5 лет', sp: 22, text: 'Многолетние травы с мощными корнями вытесняют однолетние.'},
      {name: 'Кустарники', years: '≈ 10 лет', sp: 32, text: 'Появляются кустарники и всходы деревьев.'},
      {name: 'Берёзы и осины', years: '≈ 25 лет', sp: 45, text: 'Светолюбивые берёза и осина растут быстро. Под их пологом подрастают теневыносливые сосны.'},
      {name: 'Сосновый бор', years: '≈ 80 лет', sp: 60, text: 'Сосны перерастают берёзы и затеняют их. Восстанавливается устойчивый сосновый бор — такой, как ленточные боры Прииртышья.'}],
    d: {burnt: [1, 1, .7, .4, .1, 0], weed: [0, 1, .5, .2, 0, 0], grass: [0, .1, 1, .8, .5, .4], shrub: [0, 0, .1, 1, .5, .3], birch: [0, 0, 0, .3, 1, .35], conifer: [0, 0, 0, 0, .3, 1]}},
  lake: {name: '🌊 Зарастание озера', what: 'Экосистема может смениться и без катастроф: небольшое озеро постепенно мелеет, зарастает и превращается в болото, а затем в луг.',
    ground: ['#6f8a4a', '#6f8a4a', '#66803f', '#5d7338', '#5f7a3a'],
    stages: [
      {name: 'Открытое озеро', years: '0 лет', sp: 25, text: 'Вода чистая, растений немного. На дне начинают накапливаться ил и остатки организмов.'},
      {name: 'Водные растения', years: '≈ 50 лет', sp: 40, text: 'Озеро мелеет. Разрастаются кувшинки, рдест, ряска. Отмирая, они ещё быстрее заполняют дно.'},
      {name: 'Тростник наступает', years: '≈ 150 лет', sp: 50, text: 'По берегам стеной встаёт тростник и рогоз. Открытой воды становится всё меньше.'},
      {name: 'Болото', years: '≈ 300 лет', sp: 35, text: 'Открытая вода почти исчезла. На торфе растут мхи и осоки. Рыбы исчезают, появляются болотные виды.'},
      {name: 'Луг и кустарники', years: '≈ 500 лет', sp: 45, text: 'Болото подсыхает и превращается в сырой луг, на нём появляются кустарники и первые деревья.'}],
    d: {water: [4, 3.4, 2.4, 1.0, 0], lily: [.1, 1, 1, .5, 0], reed: [.1, .5, 1, 1, .3], moss: [0, 0, .3, 1, .3], grass: [.4, .5, .6, .8, 1], shrub: [0, 0, .1, .3, .8], birch: [0, 0, 0, .1, .5]}},
};
const lerpA = (a: number[] | undefined, t: number) => { if (!a) return 0; const i = Math.min(a.length - 2, Math.floor(t)), f = Math.min(1, t - i); return a[i] + (a[i + 1] - a[i]) * f; };

function build() {
  let sd = 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const root = new THREE.Group(), d = new THREE.Object3D();
  const gm = new THREE.MeshStandardMaterial({color: '#888', roughness: 1}), ground = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.3, 0.7, 56), gm); ground.position.y = -0.35; root.add(ground);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({color: '#3f8fc4', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.9})); water.rotation.x = -Math.PI / 2; water.position.y = 0.02; root.add(water);
  const std = (c: string) => new THREE.MeshStandardMaterial({color: c, roughness: 0.85});
  type T = {key: string; n: number; parts: {g: THREE.BufferGeometry; c: string; y: number; s?: [number, number, number]}[]; inWater?: boolean; band?: boolean; im: THREE.InstancedMesh[]; pos: {x: number; z: number; r: number; o: number; sc: number; rot: number}[]};
  const defs: Omit<T, 'im' | 'pos'>[] = [
    {key: 'rock', n: 40, parts: [{g: new THREE.DodecahedronGeometry(0.4, 0), c: '#9a9da3', y: 0.12, s: [1, 0.6, 1]}]},
    {key: 'lichen', n: 90, parts: [{g: new THREE.SphereGeometry(0.2, 8, 6), c: '#cfdc6a', y: 0.04, s: [1, 0.18, 1]}]},
    {key: 'moss', n: 110, parts: [{g: new THREE.SphereGeometry(0.24, 8, 6), c: '#4f8a3a', y: 0.05, s: [1, 0.4, 1]}]},
    {key: 'weed', n: 160, parts: [{g: new THREE.ConeGeometry(0.06, 0.45, 5), c: '#a9cf52', y: 0.22}, {g: new THREE.SphereGeometry(0.07, 6, 5), c: '#d66ab0', y: 0.46}]},
    {key: 'grass', n: 260, parts: [{g: new THREE.ConeGeometry(0.07, 0.6, 5), c: '#7fb34a', y: 0.3}]},
    {key: 'shrub', n: 46, parts: [{g: new THREE.IcosahedronGeometry(0.42, 1), c: '#3f8a40', y: 0.36, s: [1, 0.85, 1]}]},
    {key: 'birch', n: 30, parts: [{g: new THREE.CylinderGeometry(0.06, 0.08, 1.7, 7), c: '#f0f0ea', y: 0.85}, {g: new THREE.IcosahedronGeometry(0.62, 1), c: '#8fcf5a', y: 2.0, s: [1, 1.15, 1]}]},
    {key: 'conifer', n: 44, parts: [{g: new THREE.CylinderGeometry(0.07, 0.11, 1.2, 7), c: '#6b4a30', y: 0.6}, {g: new THREE.ConeGeometry(0.62, 2.3, 9), c: '#1f5f3c', y: 2.1}]},
    {key: 'burnt', n: 34, parts: [{g: new THREE.CylinderGeometry(0.05, 0.1, 1.6, 6), c: '#1c1917', y: 0.8}]},
    {key: 'reed', n: 220, band: true, parts: [{g: new THREE.CylinderGeometry(0.02, 0.025, 1.1, 5), c: '#8fae58', y: 0.55}, {g: new THREE.CapsuleGeometry(0.04, 0.16, 3, 6), c: '#7a5230', y: 1.05}]},
    {key: 'lily', n: 70, inWater: true, parts: [{g: new THREE.CircleGeometry(0.2, 12), c: '#3f9a4a', y: 0.04}]},
  ];
  const types: T[] = defs.map(df => { const im = df.parts.map(p => { if (df.key === 'lily') p.g.rotateX(-Math.PI / 2); const m = new THREE.InstancedMesh(p.g, std(p.c), df.n); m.frustumCulled = false; root.add(m); return m; });
    const pos = Array.from({length: df.n}, (_, i) => { const r = Math.sqrt(rnd()) * 4.6, a = rnd() * 6.283; return {x: Math.cos(a) * r, z: Math.sin(a) * r, r, o: (i + 0.5) / df.n, sc: 0.7 + rnd() * 0.6, rot: rnd() * 6.28}; }); return {...df, im, pos}; });
  const cur: number[][] = types.map(t => t.pos.map(() => 0)), c0 = new THREE.Color(), c1 = new THREE.Color();
  const update = (sc: Sc, t: number, dt: number, time: number) => {
    const i = Math.min(sc.ground.length - 2, Math.floor(t)); c0.set(sc.ground[i]); c1.set(sc.ground[i + 1]); gm.color.copy(c0).lerp(c1, Math.min(1, t - i));
    const wr = lerpA(sc.d.water, t); water.visible = wr > 0.05; water.scale.setScalar(Math.max(0.01, wr));
    types.forEach((tp, ti) => { const dens = lerpA(sc.d[tp.key], t);
      tp.pos.forEach((p, k) => { let want = p.o < dens ? 1 : 0; if (tp.inWater) { if (p.r > wr - 0.25) want = 0; } else if (tp.band) { if (p.r < wr - 0.1 || p.r > wr + 1.3) want = 0; } else if (p.r < wr + 0.15) want = 0;
        const c = cur[ti][k] += (want - cur[ti][k]) * Math.min(1, dt * 2.5); const s = Math.max(0.0001, c * p.sc), sway = tp.key === 'grass' || tp.key === 'reed' || tp.key === 'weed' ? Math.sin(time * 1.5 + p.rot) * 0.06 : 0;
        tp.parts.forEach((pt, j) => { d.position.set(p.x, pt.y * s, p.z); d.rotation.set(sway, p.rot, sway); const ps = pt.s || [1, 1, 1]; d.scale.set(ps[0] * s, ps[1] * s, ps[2] * s); d.updateMatrix(); tp.im[j].setMatrixAt(k, d.matrix); }); });
      tp.im.forEach(m => { m.instanceMatrix.needsUpdate = true; }); });
  };
  return {root, update};
}

export default function Succ3D() {
  const host = useRef<HTMLDivElement>(null);
  const [k, setK] = useState('primary'), [t, setT] = useState(0), [playing, setPlaying] = useState(false), [err, setErr] = useState('');
  const sc = SC[k], last = sc.stages.length - 1, si = Math.round(t), cur = sc.stages[si];
  const st = useRef<any>({}); st.current = {sc, t};
  useEffect(() => {
    const el = host.current; if (!el) return;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({antialias: true}); } catch { setErr('Ваше устройство не поддерживает 3D-графику (WebGL). Пользуйтесь описанием стадий ниже.'); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.cssText = 'display:block;width:100%;height:100%;border-radius:14px;touch-action:none';
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#bfe3ff');
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    const sun = new THREE.DirectionalLight('#fff4d6', 2.2); sun.position.set(-4, 8, 5); scene.add(sun); scene.add(new THREE.HemisphereLight('#dbeafe', '#8a7a5a', 0.85));
    const {root, update} = build(); scene.add(root);
    const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * 0.47; ctl.minDistance = 5; ctl.maxDistance = 24; ctl.target.set(0, 0.8, 0); ctl.autoRotate = true; ctl.autoRotateSpeed = 0.6;
    let first = true;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; if (first) { const dd = Math.max(11.5, 13.5 / (w / h)); cam.position.set(0, dd * 0.42, dd); first = false; } cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const clock = new THREE.Clock(); let raf = 0, tm = 0;
    const loop = () => { raf = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05); tm += dt; update(st.current.sc, st.current.t, dt, tm); ctl.update(); r.render(scene, cam); };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctl.dispose(); scene.traverse((o: any) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x: any) => x.dispose()); }); r.dispose(); el.removeChild(r.domElement); };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT(x => { const n = x + 0.02; if (n >= last) { setPlaying(false); return last; } return n; }), 60);
    return () => clearInterval(id);
  }, [playing, k]);
  const W = 300, H = 80, mx = Math.max(...sc.stages.map(s => s.sp)), px = (i: number) => 14 + i / last * (W - 28), py = (v: number) => H - 16 - v / mx * (H - 28);
  return <div className="card lab l3"><div className="tb"><b style={{flexBasis: '100%'}}>3D-модель: как сменяются экосистемы</b>
    {Object.entries(SC).map(([id, s]) => <button key={id} className={k === id ? '' : 's'} style={{minHeight: 40, padding: '4px 10px'}} onClick={() => { setK(id); setT(0); setPlaying(false); }}>{s.name}</button>)}</div>
    {err ? <div className="warn" style={{margin: 14}}>{err}</div> : <div ref={host} className="lcv" style={{height: 'min(60vh, 440px)', margin: '0 10px', borderRadius: 14}}/>}
    <div className="lpn" style={{padding: '8px 14px 14px'}}>
      <div className="mu">{sc.what}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8}}>
        <button onClick={() => { if (!playing && t >= last) setT(0); setPlaying(!playing); }}>{playing ? '⏸ Пауза' : t >= last ? '↺ Сначала' : '▶ Запустить время'}</button>
        <button className="s" onClick={() => { setPlaying(false); setT(Math.max(0, si - 1)); }}>◀ Стадия назад</button><button className="s" onClick={() => { setPlaying(false); setT(Math.min(last, si + 1)); }}>Стадия вперёд ▶</button></div>
      <label htmlFor="sct" style={{display: 'block', marginTop: 8}}><b>Время: {cur.years}</b></label>
      <input id="sct" type="range" min={0} max={last} step={0.01} value={t} onChange={e => { setPlaying(false); setT(+e.target.value); }} style={{width: '100%', padding: 0, border: 0, minHeight: 36, accentColor: 'var(--g)'}}/>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '4px 0 8px'}}>{sc.stages.map((s, i) => <button key={i} className={i === si ? '' : 's'} style={{minHeight: 34, padding: '2px 12px'}} onClick={() => { setPlaying(false); setT(i); }} aria-label={`Стадия ${i + 1}: ${s.name}`}>{i + 1}</button>)}</div>
      <div className="warn" aria-live="polite"><b>Стадия {si + 1} из {sc.stages.length}: {cur.name}.</b> {cur.text}</div>
      <div style={{marginTop: 10}}><b>Число видов в сообществе</b>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: 420, display: 'block'}} role="img" aria-label="График числа видов по стадиям">
          <line x1="14" y1={H - 16} x2={W - 14} y2={H - 16} stroke="var(--bd)" strokeWidth="2"/>
          <polyline points={sc.stages.map((s, i) => `${px(i)},${py(s.sp)}`).join(' ')} fill="none" stroke="var(--g)" strokeWidth="3" strokeLinejoin="round"/>
          {sc.stages.map((s, i) => <g key={i}><circle cx={px(i)} cy={py(s.sp)} r={i === si ? 7 : 4} fill={i === si ? 'var(--au)' : 'var(--g)'} stroke="#fff" strokeWidth="2"/><text x={px(i)} y={H - 3} textAnchor="middle" fontSize="11" fill="var(--mu)">{i + 1}</text></g>)}</svg></div>
      <div className="mu" style={{marginTop: 6}}>Сроки и числа видов условные: в природе они зависят от климата и местности. Вращай модель пальцем или мышью.</div></div></div>;
}
