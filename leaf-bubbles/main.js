// «Лист в горячей воде» — a classroom experiment filmed in a realistic 3D lab. No voice; the film ends on the question.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makePost } from '/core/three/post.js';
import { clamp, seg, eio, eo, ss, lerp, hash } from '/core/lib.js';
import { DUR, T, SHOTS, shotAt, LABELS, SFX } from './story.js';
import { makeLab, makeLeaf, makeBubbles, makeSteam, BEAKER, LEAF } from './scene.js';

const QS = new URLSearchParams(location.search), NOSUB = QS.has('nosub'), SSAA = +(QS.get('ss') || 1.5);
const W = innerWidth || 1920, H = innerHeight || 1080, K = H / 1080;
await document.fonts.load('500 46px "Inter Tight"', 'мл0123456789');
for (const f of ['200 100px "Inter Tight"', '300 40px "Inter Tight"', '400 28px "Inter Tight"', '500 28px "Inter Tight"']) await document.fonts.load(f, 'АБВЖЯабв 0123456789 ≈°C:?');

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, .05, 800);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, ao: false });
post.bloom.strength = .12; post.bloom.threshold = 1.1; post.bloom.radius = .35;
post.vig.uniforms.amt.value = .38; post.vig.uniforms.contrast.value = .06; post.vig.uniforms.sat.value = .98;

// —— lab light: a room environment for reflections, an overhead softbox spot, a cool fill ——
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .75;
const spot = new THREE.SpotLight('#fff6ea', 900, 120, .62, .9, 1.6); spot.position.set(-10, 42, 18); spot.target.position.set(0, 4, 0); scene.add(spot, spot.target);
const fill = new THREE.DirectionalLight('#dfe9ff', .55); fill.position.set(30, 12, 20); scene.add(fill);
const rim = new THREE.DirectionalLight('#ffffff', 1.1); rim.position.set(-4, 18, -30); scene.add(rim);
const bgc = document.createElement('canvas'); bgc.width = 64; bgc.height = 256;
{ const g = bgc.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#202426'); gr.addColorStop(.55, '#33393b'); gr.addColorStop(1, '#2a2f31'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); }
const bgTex = new THREE.CanvasTexture(bgc); bgTex.colorSpace = THREE.SRGBColorSpace; scene.background = bgTex;
scene.fog = new THREE.Fog('#1d2123', 45, 150);

// table + soft contact shadow under the plate
const table = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: '#25292b', roughness: .38 }));
table.rotation.x = -Math.PI / 2; table.position.y = -1.66; scene.add(table);
const shc = document.createElement('canvas'); shc.width = shc.height = 256;
{ const g = shc.getContext('2d'), gr = g.createRadialGradient(128, 128, 60, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(21, 21), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shc), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.655; scene.add(shadow);

const lab = makeLab(); scene.add(lab.plate, lab.beaker, lab.water.g);
lab.thermo.g.position.set(3.3, 15.5, -2.6); lab.thermo.g.rotation.y = -.35; scene.add(lab.thermo.g);
const leaf = makeLeaf(); scene.add(leaf.root);
const bub = makeBubbles(leaf.root);
const steam = makeSteam(); scene.add(steam.g);

const V = (x, y, z) => new THREE.Vector3(x, y, z);
// —— the leaf's performance ——
const Q_HANG = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, -1, 0), V(0, 0, 1), V(-1, 0, 0)));
const Q_FLIP = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI).multiply(Q_HANG);
const Q_FLAT = new THREE.Quaternion();
const P_IN = V(0.2, 30, 0), P_HANG = V(0.2, 21, 0), P_OVER = V(-1.2, 12.5, 0), P_WATER = V(-1.2, 5.5, 0);
const LEAN = .22;                     // tweezers' lean from vertical once the leaf lies flat
function leafPose(t) {
  const q = new THREE.Quaternion(), p = V(0, 0, 0);
  const f = eio(seg(t, ...T.flip)), b = eio(seg(t, ...T.toBeaker)), s = ss(seg(t, ...T.sink));
  q.slerpQuaternions(Q_HANG, Q_FLIP, f); if (b > 0) q.slerp(Q_FLAT, b);
  p.lerpVectors(P_IN, P_HANG, eo(seg(t, 9.3, 10.4))); if (b > 0) p.lerpVectors(P_HANG, P_OVER, b); if (s > 0) p.lerpVectors(P_OVER, P_WATER, s);
  // a slight hand sway while held in the air; still once it is under water
  const sway = 1 - s; p.x += .06 * Math.sin(t * 1.3) * sway; p.y += .05 * Math.sin(t * 1.7 + 1) * sway;
  leaf.root.position.copy(p); leaf.root.quaternion.copy(q);
  // tweezers: in line with the petiole while the leaf hangs, steep once it lies flat
  leaf.tweezers.rotation.z = lerp(Math.PI / 2, LEAN, b);
}

// —— shots ——
let FOCUS = null, APER = 0;
function cam(pos, look, fov, focus, aper = 0) { camera.position.copy(pos); camera.lookAt(look); camera.fov = fov; camera.updateProjectionMatrix(); FOCUS = focus; APER = aper; }
const L3 = (a, b, u) => a.clone().lerp(b, u);
const leafC = () => V(LEAF.L / 2, 0, 0).applyMatrix4(leaf.root.matrixWorld);
function frame(t) {
  leafPose(t); leaf.root.updateMatrixWorld(true);
  const sh = shotAt(t), u = seg(t, sh[0], sh[1]);
  const dipT = T.dip, rip = [{ x: .6, z: 0, t0: dipT, a: .09 }, { x: -1.4, z: .2, t0: dipT + .12, a: .05 }, { x: 2.6, z: -.3, t0: dipT + .2, a: .04 }];
  lab.water.update(t, rip);
  steam.update(t, 1);
  lab.thermo.draw(80 + (Math.floor(t) % 3 === 1 ? .1 : Math.floor(t) % 5 === 3 ? -.1 : 0));
  const depth = BEAKER.water - P_WATER.y - .1;
  bub.update(t, T.bubbles, depth);
  switch (sh[2]) {
    case 'wide': cam(L3(V(19, 17, 36), V(15.5, 15, 30), eio(u)), V(1.2, 9.6, 0), 31, V(0, 8, 0), 1.2); break;
    case 'thermo': cam(L3(V(9.6, 18.2, 9.6), V(8.6, 17.6, 8.2), eio(u)), V(3.1, 16.4, -2.2), 26, V(3.3, 16.75, -2.0), 6); break;
    case 'leaf': { const a = seg(t, 13.9, 15.6), e = eio(a);
      const pos = L3(V(.8, 18.6, 23), V(.6, 10.6, 21), e), look = L3(V(.1, 18.4, 0), V(.8, 8.6, 0), e);
      pos.x += -.4 * seg(t, 10, 13.9); cam(pos, look, 30, leafC(), 3.5); break; }
    case 'side': cam(L3(V(.6, 5.15, 11.5), V(1.1, 5.2, 9.2), eio(u)), V(1.3, 5.5, 0), 26, V(1.3, 5.5, 0), 5); break;
    case 'top': cam(L3(V(1.0, 7.9, 2.9), V(1.3, 7.5, 2.4), eio(u)), V(1.5, 5.5, -.1), 34, V(1.5, 5.52, -.1), 22); break;
    case 'bottom': cam(L3(V(1.0, 3.2, 2.9), V(1.3, 3.55, 2.4), eio(u)), V(1.5, 5.45, -.1), 34, V(1.5, 5.45, -.1), 22); break;
    case 'final': cam(L3(V(.2, 5.0, 12.5), V(.6, 5.1, 11.2), eio(u)), V(1.3, 6.6, 0), 28, V(1.3, 5.5, 0), 4); break;
  }
  post.dof.focus = FOCUS ? camera.position.distanceTo(FOCUS) : 100; post.dof.aper = APER; post.dof.maxCoc = 12;
  // the thermometer would block the macro shots from inside the beaker: it stays, it is behind the camera there
}

// —— 2D layer ——
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const g = ov.getContext('2d');
const px = v => v * K;
function plate(x, y, w, h, r, a) {
  g.save(); g.globalAlpha = a;
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, r); g.clip(); g.filter = `blur(${px(18)}px) brightness(.75)`;
  g.drawImage(renderer.domElement, 0, 0, W, H); g.filter = 'none'; g.fillStyle = 'rgba(14,18,17,.55)'; g.fillRect(x, y, w, h); g.restore();
  g.lineWidth = px(1.2); g.strokeStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.roundRect(x + .5, y + .5, w - 1, h - 1, r); g.stroke();
  g.fillStyle = '#5fd18a'; g.beginPath(); g.roundRect(x, y + h * .22, px(4), h * .56, px(2)); g.fill();
  g.restore();
}
function text(s, x, y, size, weight, col, a, align = 'left', spacing = 0) {
  g.save(); g.globalAlpha = a; g.font = `${weight} ${px(size)}px "Inter Tight"`; g.letterSpacing = px(spacing) + 'px'; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); const w = g.measureText(s).width; g.restore(); return w;
}
const tw = (s, size, weight, spacing = 0) => { g.font = `${weight} ${px(size)}px "Inter Tight"`; g.letterSpacing = px(spacing) + 'px'; const w = g.measureText(s).width; g.letterSpacing = '0px'; return w; };
const fadeA = (t, a, b, i = .45, o = .35) => ss(seg(t, a, a + i)) * (1 - ss(seg(t, b - o, b)));
const toScreen = v => { const p = v.clone().project(camera); return { x: (p.x * .5 + .5) * W, y: (-p.y * .5 + .5) * H, z: p.z }; };
const anchor = id => id === 'display' ? lab.thermo.anchor.clone().applyMatrix4(lab.thermo.g.matrixWorld) : leaf.anchors[id].clone().applyMatrix4(leaf.root.matrixWorld);
const BOX = {};
function label(l, t) {
  const a = fadeA(t, l.t[0], l.t[1]); if (a <= 0) return;
  const size = l.fixed ? 40 : 30, pw = tw(l.text, size, 500, 1) + px(l.fixed ? 64 : 48), ph = px(l.fixed ? 78 : 60);
  let bx, by;
  if (l.fixed) { bx = (W - pw) / 2; by = H - px(150); }
  else {
    const p = toScreen(anchor(l.at)); if (p.z > 1) return;
    const grow = eo(seg(t, l.t[0], l.t[0] + .5));
    const tx = p.x + px(l.dx), ty = p.y + px(l.dy);
    bx = clamp(l.dx < 0 ? tx - pw : tx, px(40), W - px(40) - pw); by = clamp(ty - ph / 2, px(40), H - px(60) - ph);
    const lx = l.dx < 0 ? bx + pw : bx, ly = by + ph / 2, ex = lerp(p.x, lx, grow), ey = lerp(p.y, ly, grow);
    g.save(); g.globalAlpha = a;
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(p.x, p.y, px(5), 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = px(1.4); g.beginPath(); g.arc(p.x, p.y, px(11), 0, 7); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = px(1.6); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(ex, ey); g.stroke(); g.restore();
  }
  plate(bx, by, pw, ph, px(14), a);
  text(l.text, bx + px(l.fixed ? 34 : 26), by + ph / 2 + 1, size, 500, '#f4f7f5', a, 'left', 1);
  if (a > .99) BOX[l.id] = { x0: bx, y0: by, x1: bx + pw, y1: by + ph }; else delete BOX[l.id];
}
function hud(t) {
  g.clearRect(0, 0, W, H); for (const k in BOX) delete BOX[k];
  if (t < .5) { g.fillStyle = `rgba(0,0,0,${1 - ss(seg(t, .0, .5))})`; g.fillRect(0, 0, W, H); }
  // cut flashes are hard cuts — no overlay
  if (!NOSUB) {
    if (t < T.title[1]) {
      const a = fadeA(t, ...T.title, .7, .5);
      text('ОПЫТ', px(110), px(118), 22, 500, '#7fe0a3', a, 'left', 8);
      text('Лист в горячей воде', px(106), px(186), 76, 200, '#f2f5f3', a, 'left', 1);
      const a2 = fadeA(t, ...T.safety, .6, .5), s = 'Опыт проводит учитель: вода горячая', w = tw(s, 26, 400) + px(56);
      plate(px(110), H - px(150), w, px(62), px(14), a2); text(s, px(110) + px(30), H - px(150) + px(32), 26, 400, '#f1f4f2', a2);
      BOX.title = { x0: px(100), y0: px(90), x1: px(1000), y1: px(230) };
    }
    for (const l of LABELS) if (t >= l.t[0] && t < l.t[1]) label(l, t);
    if (t >= T.task[0] && t < T.task[1]) {
      const a = fadeA(t, ...T.task, .6, .4), s1 = 'НАБЛЮДАЙ', s2 = 'С какой стороны листа больше пузырьков?';
      const w = Math.max(tw(s1, 18, 500, 5), tw(s2, 30, 400)) + px(64);
      plate(px(56), px(50), w, px(112), px(16), a);
      text(s1, px(88), px(84), 18, 500, '#7fe0a3', a, 'left', 5); text(s2, px(88), px(124), 30, 400, '#f4f7f5', a);
      if (a > .99) BOX.task = { x0: px(56), y0: px(50), x1: px(56) + w, y1: px(162) };
    }
    if (t >= T.question[0]) {
      const a = fadeA(t, T.question[0], DUR + 1, .7), q = 'С какой стороны листа больше пузырьков?';
      const pw = tw(q, 54, 300) + px(120), ph = px(250), x = (W - pw) / 2, y = px(70);
      plate(x, y, pw, ph, px(26), a);
      text('ВОПРОС', W / 2, y + px(52), 20, 500, '#7fe0a3', a, 'center', 8);
      text(q, W / 2, y + px(118), 54, 300, '#f6f8f7', a, 'center');
      const a2 = ss(seg(t, T.question[0] + .9, T.question[0] + 1.5));
      text('Запиши ответ в тетрадь', W / 2, y + px(190), 32, 400, '#cfdcd4', a2 * (1 - ss(seg(t, T.think[0] - .4, T.think[0]))), 'center');
      const a3 = ss(seg(t, T.think[0], T.think[0] + .6));
      text('Подумай: почему так?', W / 2, y + px(190), 32, 400, '#9fe8bb', a3, 'center');
      if (a > .99) BOX.question = { x0: x, y0: y, x1: x + pw, y1: y + ph };
      // countdown ring
      if (t >= T.count[0] - .3) {
        const ca = ss(seg(t, T.count[0] - .3, T.count[0] + .2)) * (1 - ss(seg(t, T.count[1], T.count[1] + .4)));
        const left = clamp(T.count[1] - t, 0, 8), n = Math.ceil(left - 1e-6), cx = W - px(150), cy = H - px(150), R = px(62);
        g.save(); g.globalAlpha = ca;
        g.fillStyle = 'rgba(12,16,15,.55)'; g.beginPath(); g.arc(cx, cy, R + px(14), 0, 7); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = px(6); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
        g.strokeStyle = '#5fd18a'; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left / 8); g.stroke(); g.restore();
        if (n > 0) text(String(n), cx, cy + px(3), 54, 300, '#ffffff', ca, 'center');
      }
    }
  }
  const fo = seg(t, DUR - .8, DUR); if (fo > 0) { g.fillStyle = `rgba(0,0,0,${ss(fo)})`; g.fillRect(0, 0, W, H); }
}

// —— entry points ——
const OFF = +(QS.get('t0') || 0);
window.render = t => {
  t += OFF;
  frame(t); scene.updateMatrixWorld(); camera.updateMatrixWorld();
  post.composer.render();
  hud(t);
};
window.DUR = QS.get('dur') ? +QS.get('dur') : DUR - OFF;
window.EV = SFX;
window.SUBS = [];
window.TEXTS = t => {
  frame(t); scene.updateMatrixWorld(); camera.updateMatrixWorld(); hud(t);
  const out = []; const TX = { title: 'ОПЫТ Лист в горячей воде', task: 'НАБЛЮДАЙ С какой стороны листа больше пузырьков?', question: 'ВОПРОС С какой стороны листа больше пузырьков? Запиши ответ в тетрадь' };
  for (const k in BOX) out.push({ id: k, text: TX[k] || (LABELS.find(l => l.id === k) || {}).text || k, ...BOX[k] });
  return out;
};
window.BUB = () => bub.counts();
window.READY = true;
