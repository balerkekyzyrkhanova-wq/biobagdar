// «Как устроен лист» — a glass-render explainer of leaf structure and function
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { clamp, seg, eio, eo, ei, ss, lerp, hash } from '/core/lib.js';
import { DUR, T, SHOTS, shotAt, VO, LABELS, XYLEM_PULSES, PHLOEM_PULSES, VEIN_PULSES, SFX, BEAT } from './story.js';
import { makeLeaf, makeBlock, explodeBlock, setPulses, GREEN, CYAN, STOMATA, BUNDLE, BZ } from './leaf.js';

const QS = new URLSearchParams(location.search), NOSUB = QS.has('nosub'), SSAA = +(QS.get('ss') || 1.5);
const W = innerWidth || 1920, H = innerHeight || 1080, K = H / 1080;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.1;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, 1, 3000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, ao: false });
post.bloom.strength = .22; post.bloom.threshold = 1.05; post.bloom.radius = .45;
post.vig.uniforms.amt.value = .32; post.vig.uniforms.contrast.value = .1; post.vig.uniforms.sat.value = 1.0;

// —— studio: strip-light scene baked to an environment every frame ——
const env = new THREE.Scene(); env.background = new THREE.Color('#000');
const strip = (w, h, col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col), side: THREE.DoubleSide })); env.add(m); m.userData.c = new THREE.Color(col); return m; };
const face = (m, p) => { m.position.set(...p); m.lookAt(0, 0, 0); };
const L = { left: strip(26, 190, '#f2f8ff'), right: strip(26, 190, '#fbfff6'), top: strip(180, 80, '#ffffff'), front: strip(170, 50, '#ffffff'), back: strip(280, 16, '#e6fff0'), sweep: strip(28, 260, '#ffffff'), sun: strip(120, 120, '#f4fff0'), aura: strip(160, 160, '#5dff9a') };
face(L.left, [-160, 40, -60]); face(L.right, [160, 40, -70]); face(L.top, [0, 180, 10]); face(L.front, [0, 10, 180]); face(L.back, [0, 20, -200]); face(L.sun, [-30, 200, 60]); face(L.aura, [0, -80, 120]);
const BASE = { left: 3.0, right: 3.0, top: 1.0, front: .16, back: 1.3, sun: 0, aura: 0 };
const pmrem = new THREE.PMREMGenerator(renderer); let envRT = null, envKey = '';
function updateEnv(o) {
  for (const k in BASE) { const I = (o[k] ?? 1) * BASE[k]; L[k].material.color.copy(L[k].userData.c).multiplyScalar(I); L[k].visible = I > 0; }
  const sw = o.sweep; L.sweep.visible = !!(sw && sw.I > 0);
  if (L.sweep.visible) { const a = sw.az + sw.x * 1.35, r = 180; L.sweep.position.set(Math.sin(a) * r, 30, Math.cos(a) * r); L.sweep.lookAt(0, 0, 0); L.sweep.rotateZ(sw.tilt || 0); L.sweep.material.color.setRGB(sw.I, sw.I, sw.I); }
  if (o.auraCol) L.aura.material.color.copy(o.auraCol).multiplyScalar((o.aura ?? 0) * 1);
  const key = JSON.stringify(o, (k, v) => typeof v === 'number' ? +v.toFixed(3) : v);
  if (key === envKey && envRT) return; envKey = key;
  const rt = pmrem.fromScene(env, 0, 1, 1000); scene.environment = rt.texture; if (envRT) envRT.dispose(); envRT = rt;
}
const bgc = document.createElement('canvas'); bgc.width = 512; bgc.height = 288;
{ const g = bgc.getContext('2d'), gr = g.createRadialGradient(256, 130, 10, 256, 150, 300); gr.addColorStop(0, '#2c3631'); gr.addColorStop(.45, '#121614'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, 512, 288); }
const bgTex = new THREE.CanvasTexture(bgc); bgTex.colorSpace = THREE.SRGBColorSpace; scene.background = bgTex;

// —— models ——
const leaf = makeLeaf(); scene.add(leaf.root); leaf.root.position.x = 5;
const block = makeBlock(); scene.add(block.root);
// cutting blade: a thin plane of light that passes through the leaf
const blade = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color('#dffff0').multiplyScalar(1.6), transparent: true, opacity: 1, side: THREE.DoubleSide }));
blade.rotation.y = Math.PI / 2; scene.add(blade);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const orbit = (c, az, el, d) => V(c.x + Math.sin(az) * Math.cos(el) * d, c.y + Math.sin(el) * d, c.z + Math.cos(az) * Math.cos(el) * d);
const SW = (t, a, b) => { const u = seg(t, a, b); return u > 0 && u < 1 ? u : null; };

// —— light state ——
function leafLight(t, on) {
  // pulses from the petiole along the midrib, then out along each lateral vein
  const ps = VEIN_PULSES.filter(p => t >= p && t - p < 3.2);
  const amp = p => (on ? 7 : 5) * Math.exp(-(t - p) / 1.4);
  setPulses(leaf.veins.pet.material, ps.map(p => ({ h: (t - p) / .5, a: amp(p) })), on ? .04 : .006);
  setPulses(leaf.veins.mid.material, ps.map(p => ({ h: (t - p - .4) / 1.5, a: amp(p) })), on ? .05 : .008);
  for (const v of leaf.veins.lat) setPulses(v.m.material, ps.map(p => ({ h: (t - p - .4 - 1.5 * v.s0) / .6, a: amp(p) * .8 })), on ? .04 : .006);
}
function bundleLight(t, k) {
  const xs = XYLEM_PULSES.filter(p => t >= p && t - p < 2), ph = PHLOEM_PULSES.filter(p => t >= p && t - p < 3);
  block.xylem.forEach((m, i) => { setPulses(m.material, xs.map(p => ({ h: (t - p - i * .05) / 1.3, a: 6 * k * Math.exp(-(t - p) / 1.2) })), .12 + .1 * k); });
  block.phloem.forEach((m, i) => { m.material.userData.U.uDir.value = -1; setPulses(m.material, ph.map(p => ({ h: (t - p - i * .04) / 2.0, a: 5 * k * Math.exp(-(t - p) / 1.6) })), .12 + .1 * k); });
}
const M4 = new THREE.Matrix4(), PV = new THREE.Vector3(), SV = new THREE.Vector3(), QI = new THREE.Quaternion();
function bubbles(t, show) {
  const B = block.bubbles; for (const k in B) B[k].count = 0;
  if (!show) return;
  const lo = block.layers.lower;
  STOMATA.forEach((s, si) => {
    const base = V(s.x, -13.8, s.z).applyMatrix4(lo.matrixWorld);
    // out: O2 (cyan) and water vapour (pale) drift down and away from the open slit
    for (let i = 0; i < 14; i++) {
      const per = 1.9, ph = (t - 50 + i * per / 14 + si * .37) / per; if (t < 50 - (i * per / 14)) continue;
      const u = ph - Math.floor(ph); const kind = (i + si) % 3 === 0 ? 'h2o' : 'o2';
      const sx = (hash(i * 7 + si) - .5) * 10, sz = (hash(i * 11 + si * 3) - .5) * 10;
      PV.set(base.x + sx * u, base.y - 2 - u * 24, base.z + sz * u);
      const r = (kind === 'h2o' ? .55 : .8) * Math.sin(Math.PI * Math.min(1, u * 1.4)) * (show);
      M4.compose(PV, QI, SV.set(r, r, r)); const im = B[kind]; im.setMatrixAt(im.count++, M4);
    }
    // in: CO2 rises from below and is swallowed by the slit
    for (let i = 0; i < 8; i++) {
      const per = 2.2, ph = (t - 38.5 + i * per / 8 + si * .21) / per; if (ph < 0) continue;
      const u = ph - Math.floor(ph);
      const sx = (hash(i * 5 + si * 13) - .5) * 14, sz = (hash(i * 3 + si * 17) - .5) * 14;
      PV.set(base.x + sx * (1 - u), base.y - 22 * (1 - u), base.z + sz * (1 - u));
      const r = .75 * Math.min(1, (1 - u) * 3) * Math.min(1, u * 4) * show;
      M4.compose(PV, QI, SV.set(r, r, r)); B.co2.setMatrixAt(B.co2.count++, M4);
    }
  });
  for (const k in B) B[k].instanceMatrix.needsUpdate = true;
}

// —— per-frame staging ——
let STATE = {};
function frame(t) {
  const [t0, t1, name] = shotAt(t), u = seg(t, t0, t1);
  let pos, look, fov = 30, focus = null, aper = 220, bg = .6, sweep = null, bloom = .22;
  const envO = { left: 1, right: 1, top: 1, front: 1, back: 1, sun: 0, aura: 0, auraCol: GREEN };
  let showLeaf = false, showBlock = false, e = 0, chl = .15, stoma = 0, bundleK = .0, bub = 0, leafOn = false;
  blade.visible = false;

  // layer explode: apart 15–17.5, hover, ease-in snap on the downbeat at 57.5
  if (t < T.explode[0]) e = 0;
  else if (t < T.explode[1]) e = eo(seg(t, ...T.explode));
  else if (t < T.snap - .3) e = 1 + .03 * seg(t, T.explode[1], T.snap - .3);
  else if (t < T.snap) e = 1.03 * (1 - ei(seg(t, T.snap - .3, T.snap)));
  else e = 0;

  switch (name) {
    case 'hook': {
      showLeaf = true;
      const amb = ss(seg(t, .8, 3.8));
      Object.assign(envO, { left: .1 + .5 * amb, right: .1 + .5 * amb, top: .05 + .3 * amb, front: 0, back: .15 + .4 * amb });
      const s1 = SW(t, ...T.sweep1), s2 = SW(t, ...T.sweep2);
      if (s1 != null) sweep = { x: lerp(-1, 1, s1), I: 7 * Math.sin(s1 * Math.PI) };
      if (s2 != null) sweep = { x: lerp(1, -1, s2), I: 7 * Math.sin(s2 * Math.PI), tilt: .25 };
      const c = V(0, 0, 0); pos = orbit(c, lerp(.08, .16, eio(u)), lerp(.78, .72, eio(u)), lerp(190, 160, eio(u))); look = V(-2, -2, 0); fov = 34; focus = V(0, 0, 0); aper = 120; bg = .15 + .3 * amb;
      break;
    }
    case 'outer': {
      showLeaf = true; leafOn = true;
      const c = V(0, 0, 0); pos = orbit(c, lerp(.2, .62, eio(u)), lerp(.66, .52, eio(u)), lerp(170, 158, eio(u))); look = V(-4, -2, 0); fov = 32; focus = V(0, 0, 0); aper = 110;
      bg = .6; break;
    }
    case 'cut': {
      showLeaf = true; leafOn = true;
      const c = V(18, 0, 0); pos = orbit(c, lerp(1.25, 1.12, eio(u)), lerp(.22, .26, eio(u)), lerp(96, 84, eio(u))); look = V(12, 1, 0); fov = 30; focus = V(16, 2, 0); aper = 260;
      // the blade falls through the leaf, landing on the beat
      const bu = seg(t, T.cut - .4, T.cut + .05);
      if (bu > 0 && bu < 1) { blade.visible = true; blade.position.set(16, lerp(70, -50, eo(bu)), 0); blade.material.opacity = Math.sin(bu * Math.PI) ** .5; }
      const fl = t >= T.cut ? Math.exp(-(t - T.cut) / .25) : 0;
      envO.aura = fl * .6; envO.auraCol = new THREE.Color('#e0fff0'); bloom = .22 + fl * .2; bg = .5;
      break;
    }
    case 'layers': {
      showBlock = true;
      const c = V(0, 0, 0); pos = orbit(c, lerp(.62, .34, eio(u)), lerp(.3, .22, eio(u)), lerp(168, 150, eio(u))); look = V(0, 0, 0); fov = 31; focus = V(0, 2, 20); aper = 90;
      Object.assign(envO, { top: 1.4, front: .5, back: 1.5 }); bg = .9; break;
    }
    case 'bundle': {
      showBlock = true; bundleK = .35;
      const c = V(BUNDLE.x, BUNDLE.y, BZ); pos = c.clone().add(V(-34, 16, 52).lerp(V(-24, 10, 40), eio(u))); look = c.clone().add(V(-2, 0, -2)); fov = 32;
      focus = c.clone().add(V(-10, 12, 0)).lerp(c, ss(seg(t, 30.4, 31.4))); aper = 520; bg = .7; Object.assign(envO, { top: 1.3, front: .4 });
      break;
    }
    case 'stoma': {
      showBlock = true; stoma = eio(seg(t, ...T.stomaOpen)); bub = seg(t, 38.6, 39.4);
      block.root.updateMatrixWorld(true);
      const s = block.anchors.stoma();
      pos = s.clone().add(V(26, -30, 34).lerp(V(20, -24, 27), eio(u))); look = s.clone().add(V(0, 1, 0)); fov = 32; focus = s.clone(); aper = 420; bg = .6;
      Object.assign(envO, { front: .8, aura: .2 });
      break;
    }
    case 'photo': {
      showBlock = true; stoma = 1; bub = 1;
      const fl = t >= T.sun ? Math.exp(-(t - T.sun) / .35) : 0, on = ss(seg(t, T.sun, T.sun + 1.2));
      chl = .15 + 3.2 * fl + .9 * on + .25 * on * Math.max(0, Math.sin((t - T.sun) / BEAT * Math.PI));
      envO.sun = 4 * ss(seg(t, T.sun - .6, T.sun)) * (1 - .4 * on); envO.aura = on * .6 + fl;
      const c = V(0, 10, 0); pos = orbit(c, lerp(-.5, -.34, eio(u)), lerp(.5, .42, eio(u)), lerp(150, 134, eio(u))); look = V(-2, 4, 4); fov = 31; focus = V(0, 10, 14); aper = 120; bg = .55;
      const s = SW(t, T.sun - .7, T.sun + .2); if (s != null) sweep = { x: lerp(-1, 1, s), I: 6 * Math.sin(s * Math.PI), tilt: .9 };
      bloom = .25 + fl * .3; break;
    }
    case 'flow': {
      showBlock = true; stoma = 1; chl = 1.05; bundleK = 1; bub = 1;
      const quiet = seg(t, T.silence[0], T.silence[1]);
      const c = V(4, -2, 0); pos = orbit(c, lerp(.5, .38, eio(u)), lerp(.16, .1, eio(u)), lerp(190, 168, eio(u))); look = V(4, -5, 0); fov = 31; focus = V(10, -2, BZ); aper = 80;
      envO.aura = .5; bg = .75 - .4 * quiet; bundleK = 1 - .7 * quiet; break;
    }
    case 'snap': {
      showBlock = true; chl = 1.05 * (1 - .4 * seg(t, 57.5, 59.5)); stoma = 1 - eio(seg(t, 58, 59.5)); bundleK = .5;
      const push = eo(seg(t, T.snap, T.snap + 1.2));
      const c = V(2, 0, 0); pos = orbit(c, .36 - .08 * push, .14 + .1 * push, 178 - 22 * push); look = V(2, 0, 0); fov = 31; focus = V(4, 0, BZ); aper = 120;
      const k = Math.exp(-(t - T.snap) / .08), fr = Math.floor(t * 24); pos.add(V(hash(fr) - .5, hash(fr + 9) - .5, 0).multiplyScalar(k * 2.4));
      envO.aura = .9 * Math.exp(-(t - T.snap) / .6); bloom = .22 + .3 * Math.exp(-(t - T.snap) / .3); bg = .8; break;
    }
    case 'end': {
      showLeaf = true; leafOn = true;
      const c = V(0, 0, 0); pos = orbit(c, lerp(.32, .18, eio(u)), lerp(.62, .8, eio(u)), lerp(150, 205, eio(u))); look = V(-4, lerp(-2, 12, eio(u)), 0); fov = 32; focus = V(0, 0, 0); aper = 100;
      envO.aura = .5; bg = .7 - .3 * seg(t, 64, DUR); bloom = .3;
      const s = SW(t, 60.2, 61.7); if (s != null) sweep = { x: lerp(-1, 1, s), I: 6 * Math.sin(s * Math.PI) };
      break;
    }
  }
  leaf.root.visible = showLeaf; block.root.visible = showBlock;
  explodeBlock(block, e, t);
  block.setStoma(stoma);
  block.chlMat.emissiveIntensity = chl; block.guardMat.emissiveIntensity = .05 + .3 * stoma * (chl > .5 ? 1 : 0);
  block.root.updateMatrixWorld(true);
  bubbles(t, showBlock ? bub : 0);
  if (showLeaf) leafLight(t, leafOn);
  if (showBlock) bundleLight(t, bundleK);
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look);
  const az = Math.atan2(camera.position.x, camera.position.z);
  if (sweep) sweep.az = az + Math.PI;
  updateEnv(Object.assign(envO, { sweep }));
  scene.backgroundIntensity = bg;
  post.dof.focus = focus ? camera.position.distanceTo(focus) : 100; post.dof.aper = aper; post.dof.maxCoc = 12;
  post.bloom.strength = bloom;
  STATE = { name, e };
  return name;
}

// —— 2D layer: title, labels, formula, subtitles ——
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const g = ov.getContext('2d');
let TEXT = {}, DURS = {};
try { const r = await fetch('lines.json'); if (r.ok) for (const l of await r.json()) TEXT[l.id] = l.text; } catch (e) { }
try { const r = await fetch('voices/dur.json'); if (r.ok) DURS = await r.json(); } catch (e) { }
const voDur = v => DURS[v.id] ?? (TEXT[v.id] || '').length * .075;
const subEnd = v => v.t + Math.max(1.9, voDur(v) + .7);
for (const f of ['200 100px "Inter Tight"', '300 40px "Inter Tight"', '400 28px "Inter Tight"']) await document.fonts.load(f, 'АБВЖЯ abcCOH2→+');

const px = v => v * K;
function spaced(text, x, y, size, weight, spacing, align = 'center') {
  g.font = `${weight} ${px(size)}px "Inter Tight"`; g.letterSpacing = px(spacing) + 'px'; g.textAlign = align; g.textBaseline = 'middle';
  g.fillText(text, align === 'center' ? x + px(spacing) / 2 : x, y); const w = g.measureText(text).width; g.letterSpacing = '0px'; return w;
}
function glint(y, h, gx) {
  if (gx == null) return;
  g.save(); g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(gx - px(170), 0, gx + px(170), 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, y - h, W, h * 2); g.restore();
}
function frostPlate(x, y, w, h, r, a, accent = true) {
  g.save(); g.globalAlpha = a;
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, r); g.clip(); g.filter = `blur(${px(16)}px) brightness(1.25)`;
  g.drawImage(renderer.domElement, 0, 0, W, H); g.filter = 'none'; g.fillStyle = 'rgba(214,236,224,.10)'; g.fillRect(x, y, w, h); g.restore();
  g.lineWidth = 1.2; const eg = g.createLinearGradient(x, y, x + w, y + h);
  eg.addColorStop(0, 'rgba(255,255,255,.55)'); eg.addColorStop(.5, 'rgba(255,255,255,.12)'); eg.addColorStop(1, 'rgba(255,255,255,.35)');
  g.strokeStyle = eg; g.beginPath(); g.roundRect(x + .5, y + .5, w - 1, h - 1, r); g.stroke();
  if (accent) { g.strokeStyle = 'rgba(93,255,154,.4)'; g.beginPath(); g.moveTo(x + r, y + 1.5); g.lineTo(x + w * .5, y + 1.5); g.stroke(); g.strokeStyle = 'rgba(79,227,255,.35)'; g.beginPath(); g.moveTo(x + w * .5, y + 1.5); g.lineTo(x + w - r, y + 1.5); g.stroke(); }
  g.restore();
}
function subtitle(text, a) {
  g.font = `300 ${px(40)}px "Inter Tight"`; g.letterSpacing = px(1) + 'px';
  const tw = g.measureText(text).width, pw = tw + px(96), ph = px(76), x = (W - pw) / 2, y = H - px(128);
  frostPlate(x, y, pw, ph, ph / 2, a);
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(245,250,247,.96)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2 + .5, y + ph / 2 + 1); g.restore();
  g.letterSpacing = '0px';
}
const toScreen = v => { const p = v.clone().project(camera); return { x: (p.x * .5 + .5) * W, y: (-p.y * .5 + .5) * H, z: p.z }; };
const LBOX = {};
function label(l, t) {
  const a = ss(seg(t, l.t[0], l.t[0] + .45)) * (1 - ss(seg(t, l.t[1] - .35, l.t[1])));
  if (a <= 0) return;
  const w3 = typeof leaf.anchors[l.at] !== 'undefined' ? leaf.anchors[l.at].clone().applyMatrix4(leaf.root.matrixWorld) : block.anchors[l.at]();
  const p = toScreen(w3); if (p.z > 1) return;
  const grow = eo(seg(t, l.t[0], l.t[0] + .5));
  g.font = `400 ${px(28)}px "Inter Tight"`; g.letterSpacing = px(1.5) + 'px';
  const tw = g.measureText(l.text).width, pw = tw + px(44), ph = px(52); g.letterSpacing = '0px';
  const tx = p.x + px(l.dx), ty = p.y + px(l.dy);
  const bx = clamp(l.dx < 0 ? tx - pw : tx, px(36), W - px(36) - pw), by = clamp(ty - ph / 2, px(36), H - px(240) - ph);
  const lx = l.dx < 0 ? bx + pw : bx, ly = by + ph / 2;              // leader meets the plate's near edge
  const ex = lerp(p.x, lx, grow), ey = lerp(p.y, ly, grow);
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(236,255,244,.95)'; g.beginPath(); g.arc(p.x, p.y, px(4.5), 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(93,255,154,.5)'; g.lineWidth = px(1.2); g.beginPath(); g.arc(p.x, p.y, px(10 + 4 * Math.sin(t * 4)), 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(236,250,242,.75)'; g.lineWidth = px(1.4); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(ex, ey); g.stroke();
  g.restore();
  frostPlate(bx, by, pw, ph, px(12), a * grow, false);
  g.font = `400 ${px(28)}px "Inter Tight"`; g.letterSpacing = px(1.5) + 'px';
  g.save(); g.globalAlpha = a * grow; g.fillStyle = 'rgba(244,252,247,.97)'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(l.text, bx + px(22), by + ph / 2 + 1); g.restore();
  g.letterSpacing = '0px';
  if (a > .99 && grow > .99) LBOX[l.id] = { x0: bx, y0: by, x1: bx + pw, y1: by + ph }; else delete LBOX[l.id];
}
// chemistry line with real subscripts: tokens [text, sub?]
function chem(tokens, cx, y, size, a) {
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(240,252,246,.97)'; g.textBaseline = 'middle'; g.textAlign = 'left';
  const meas = tokens.map(([s, sub]) => { g.font = `300 ${px(sub ? size * .6 : size)}px "Inter Tight"`; g.letterSpacing = px(sub ? 0 : 2) + 'px'; return g.measureText(s).width; });
  let x = cx - meas.reduce((p, c) => p + c, 0) / 2;
  tokens.forEach(([s, sub, col], i) => { g.font = `300 ${px(sub ? size * .6 : size)}px "Inter Tight"`; g.letterSpacing = px(sub ? 0 : 2) + 'px'; g.fillStyle = col || 'rgba(240,252,246,.97)'; g.fillText(s, x, y + (sub ? px(size * .28) : 0)); x += meas[i]; });
  g.letterSpacing = '0px'; g.restore();
}
const FORMULA = [['CO'], ['2', 1], ['  +  H'], ['2', 1], ['O'], ['   →   ', 0, 'rgba(93,255,154,.95)'], ['сахар  +  O'], ['2', 1]];
function hud(t) {
  g.clearRect(0, 0, W, H);
  for (const k in LBOX) delete LBOX[k];
  if (t < .45) { g.fillStyle = `rgba(0,0,0,${1 - ss(seg(t, .05, .45))})`; g.fillRect(0, 0, W, H); }
  // hard light flash on the cut
  if (t >= T.cut && t < T.cut + .5) { g.fillStyle = `rgba(230,255,240,${.22 * Math.exp(-(t - T.cut) / .12)})`; g.fillRect(0, 0, W, H); }
  if (NOSUB) return;
  // opening title with a glint locked to the second sweep
  if (t >= T.title[0] && t < T.title[1]) {
    const a = ss(seg(t, T.title[0], T.title[0] + .6)) * (1 - ss(seg(t, T.title[1] - .5, T.title[1])));
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(236,246,240,.94)'; spaced('КАК УСТРОЕН ЛИСТ', W / 2, px(170), 96, 200, 34);
    const s2 = seg(t, ...T.sweep2); glint(px(170), px(70), s2 > 0 && s2 < 1 ? lerp(W * .78, W * .22, s2) : null); g.restore();
    g.save(); g.globalAlpha = a * .7; g.fillStyle = '#cfe2d6'; spaced('СТРОЕНИЕ  И  ФУНКЦИИ', W / 2, px(250), 19, 400, 9); g.restore();
  }
  for (const l of LABELS) if (t >= l.t[0] && t < l.t[1]) label(l, t);
  // formula card: the photosynthesis line, light above the arrow
  if (t >= T.formula[0] && t < T.formula[1]) {
    const a = ss(seg(t, T.formula[0], T.formula[0] + .6)) * (1 - ss(seg(t, T.formula[1] - .5, T.formula[1])));
    const pw = px(820), ph = px(150), x = (W - pw) / 2, y = px(70);
    frostPlate(x, y, pw, ph, px(26), a);
    g.save(); g.globalAlpha = a * .85; g.fillStyle = '#bff7d4'; spaced('СВЕТ', W / 2 + px(6), y + px(40), 18, 400, 8); g.restore();
    chem(FORMULA, W / 2, y + px(92), 48, a);
  }
  // subtitles
  const v = VO.find(v => t >= v.t - .05 && t < subEnd(v));
  if (v && TEXT[v.id]) { const e = subEnd(v), a = ss(seg(t, v.t - .05, v.t + .15)) * (1 - ss(seg(t, e - .2, e))); subtitle(TEXT[v.id], a); }
  // end title
  if (t >= T.endTitle[0]) {
    const a = ss(seg(t, T.endTitle[0], T.endTitle[0] + .8));
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(236,246,240,.95)'; spaced('ЛИСТ', W / 2, px(190), 120, 200, 60);
    const s = seg(t, T.endTitle[0] + .2, T.endTitle[0] + 1.6); glint(px(190), px(80), s > 0 && s < 1 ? lerp(W * .3, W * .7, s) : null); g.restore();
    const a2 = ss(seg(t, T.endTitle[0] + .6, T.endTitle[0] + 1.2));
    g.save(); g.globalAlpha = a2; g.fillStyle = '#dcefe3'; spaced('фабрика, которая работает на свете', W / 2, px(290), 36, 300, 2); g.restore();
    const fo = seg(t, DUR - .7, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${ss(fo)})`; g.fillRect(0, 0, W, H); }
  }
}

// —— entry points ——
const OFF = +(QS.get('t0') || 0);   // render a piece: ?t0=15&dur=2 (frames are still from the film's own timeline)
window.render = t => {
  t += OFF;
  frame(t);
  scene.updateMatrixWorld(); camera.updateMatrixWorld();
  post.composer.render();
  hud(t);
};
window.DUR = QS.get('dur') ? +QS.get('dur') : DUR - OFF;
window.EV = [...SFX, ...VO.map(v => ({ t: v.t, type: 'vo', id: v.id, d: voDur(v) }))];
window.SUBS = VO.map(v => ({ t0: v.t, t1: subEnd(v), text: TEXT[v.id] }));
window.TEXTS = t => {
  frame(t); scene.updateMatrixWorld(); camera.updateMatrixWorld();
  const out = [];
  if (t >= T.title[0] + .6 && t < T.title[1] - .5) out.push({ id: 'title', text: 'КАК УСТРОЕН ЛИСТ · СТРОЕНИЕ И ФУНКЦИИ', x0: W * .2, y0: px(110), x1: W * .8, y1: px(270) });
  if (t >= T.formula[0] + .6 && t < T.formula[1] - .5) out.push({ id: 'formula', text: 'СВЕТ CO2 + H2O → сахар + O2', x0: (W - px(820)) / 2, y0: px(70), x1: (W + px(820)) / 2, y1: px(220) });
  if (t >= T.endTitle[0] + 1.2) out.push({ id: 'end', text: 'ЛИСТ фабрика, которая работает на свете', x0: W * .2, y0: px(120), x1: W * .8, y1: px(320) });
  // labels: render the overlay at t to know where they are
  hud(t);
  for (const l of LABELS) if (LBOX[l.id]) out.push({ id: l.id, text: l.text, ...LBOX[l.id] });
  return out;
};
window.READY = true;
