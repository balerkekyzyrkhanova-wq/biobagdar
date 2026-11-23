// Lab models in centimetres: hot plate, beaker with graduations, water with a live surface, digital thermometer,
// a leaf (glossy dark upper side, pale matte lower side with raised veins), tweezers, steam and air bubbles.
import * as THREE from 'three';
import { hash, clamp, ss } from '/core/lib.js';

export const BEAKER = { r: 4.5, wall: .12, h: 12, water: 9 };
export const LEAF = { L: 5, W: 2.7, pet: 1.4 };
const RIN = BEAKER.r - BEAKER.wall;

// —— glass: transparent, with Fresnel-driven opacity so the edges catch light like real glass ——
export function glassMat(o = {}) {
  const m = new THREE.MeshPhysicalMaterial({ color: o.color || '#000000', roughness: o.rough ?? .04, metalness: 0, transparent: true, opacity: o.opacity ?? .08, depthWrite: false, side: o.side ?? THREE.DoubleSide, envMapIntensity: o.env ?? 1.6, specularIntensity: 1, ior: 1.5 });
  const fres = o.fres ?? .75, pw = o.pow ?? 3.0;
  m.onBeforeCompile = s => {
    s.fragmentShader = s.fragmentShader.replace('#include <opaque_fragment>',
      `float fr = pow(1. - abs(dot(normalize(vViewPosition), normal)), ${pw.toFixed(2)});
       diffuseColor.a = clamp(diffuseColor.a + fr * ${fres.toFixed(3)}, 0., 1.);
       #include <opaque_fragment>`);
  };
  return m;
}

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// —— hot plate ——
function makePlate() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.5, 1.6, 64), new THREE.MeshStandardMaterial({ color: '#e9ebe8', roughness: .45 }));
  body.position.y = -.8 - .05; g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, .12, 64), new THREE.MeshPhysicalMaterial({ color: '#0d0f10', roughness: .12, clearcoat: 1, clearcoatRoughness: .05 }));
  top.position.y = -.06; g.add(top);
  // heating ring printed on the ceramic top
  const ring = new THREE.Mesh(new THREE.RingGeometry(4.6, 4.75, 96), new THREE.MeshBasicMaterial({ color: '#3a3f42' }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .002; g.add(ring);
  // knob and a small red indicator lamp on the front
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(.55, .6, .5, 32), new THREE.MeshStandardMaterial({ color: '#2b2f31', roughness: .4 }));
  knob.rotation.x = Math.PI / 2; knob.position.set(-1.6, -.85, 7.45); g.add(knob);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff3b2f').multiplyScalar(2.2) }));
  lamp.position.set(1.2, -.8, 7.42); g.add(lamp);
  return g;
}

// —— beaker: lathe profile (outer wall, lip, inner wall, bottom) + printed graduations ——
function makeBeaker() {
  const g = new THREE.Group(); const { r, wall, h } = BEAKER;
  const P = [[0, 0], [r - .5, 0], [r - .12, .12], [r, .6], [r, h - .1], [r + .18, h], [r + .12, h + .12], [r - wall, h + .02], [r - wall, .6 + wall], [r - .6, wall], [0, wall]].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(P, 96);
  const glass = new THREE.Mesh(geo, glassMat({ opacity: .07, fres: .8, pow: 2.4 })); glass.renderOrder = 4; g.add(glass);
  // graduation print: white enamel marks and numbers on the front-left
  const ml = 1000 / (Math.PI * RIN * RIN);      // cm of height per 100 ml → 100 ml step
  const tex = canvasTex(2048, 1024, (c, w, hh) => {
    c.clearRect(0, 0, w, hh); c.fillStyle = 'rgba(255,255,255,.92)'; c.strokeStyle = 'rgba(255,255,255,.92)';
    const y = cm => hh - cm / h * hh, u0 = .885 * w;
    for (let k = 1; k <= 30; k++) {
      const cm = k * ml / 5; if (cm > h - 1) break;
      const big = k % 5 === 0, len = big ? 70 : (k % 5 === 0 ? 70 : 34);
      c.lineWidth = big ? 6 : 4; c.beginPath(); c.moveTo(u0, y(cm)); c.lineTo(u0 + len, y(cm)); c.stroke();
      if (big) { c.font = '500 46px "Inter Tight"'; c.textBaseline = 'middle'; c.fillText(String(k * 20), u0 + 84, y(cm)); }
    }
    c.font = '600 52px "Inter Tight"'; c.fillText('мл', u0 + 10, y(h - .9));
    c.font = '400 30px "Inter Tight"'; c.fillText('600', u0 - 60, y(h - 2.0));
  });
  const print = new THREE.Mesh(new THREE.CylinderGeometry(r + .006, r + .006, h, 96, 1, true), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.FrontSide }));
  print.position.y = h / 2; print.renderOrder = 5; g.add(print);
  return g;
}

// —— water: inner volume + a polar-grid surface that carries ripples ——
function makeWater() {
  const g = new THREE.Group(); const H = BEAKER.water;
  const side = new THREE.Mesh(new THREE.CylinderGeometry(RIN - .01, RIN - .01, H - BEAKER.wall, 96, 1, true), glassMat({ color: '#0a1414', opacity: .03, fres: .12, pow: 3, env: .8 }));
  side.position.y = BEAKER.wall + (H - BEAKER.wall) / 2; side.renderOrder = 3; g.add(side);
  const RN = 44, SN = 128, pos = [], idx = [];
  for (let i = 0; i <= RN; i++) for (let j = 0; j < SN; j++) { const rr = (RIN - .01) * i / RN, a = j / SN * Math.PI * 2; pos.push(Math.sin(a) * rr, 0, Math.cos(a) * rr); }
  for (let i = 0; i < RN; i++) for (let j = 0; j < SN; j++) { const a = i * SN + j, b = i * SN + (j + 1) % SN, c = (i + 1) * SN + j, d = (i + 1) * SN + (j + 1) % SN; idx.push(a, c, b, b, c, d); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setIndex(idx); sg.computeVertexNormals();
  const surf = new THREE.Mesh(sg, glassMat({ color: '#0a1414', opacity: .05, fres: .7, pow: 3, env: 1.6 })); surf.position.y = H; surf.renderOrder = 6; g.add(surf);
  const base = new Float32Array(pos);
  // ripples: list of {x, z, t0, a}; plus a faint constant shimmer of hot water
  function update(t, rip) {
    const p = sg.attributes.position.array;
    for (let v = 0; v < p.length; v += 3) {
      const x = base[v], z = base[v + 2]; let y = .006 * Math.sin(x * 3.1 + t * 2.3) * Math.cos(z * 2.7 - t * 1.9);
      for (const R of rip) { const age = t - R.t0; if (age < 0 || age > 3.5) continue;
        const d = Math.hypot(x - R.x, z - R.z), f = d - age * 6.0; y += R.a * Math.exp(-age / 1.1) * Math.sin(f * 4.2) * Math.exp(-f * f / 2.2) / (1 + d * .25); }
      const edge = Math.hypot(x, z) / RIN; y += .05 * Math.pow(edge, 14);   // meniscus climbs the glass
      p[v + 1] = y;
    }
    sg.attributes.position.needsUpdate = true; sg.computeVertexNormals();
  }
  return { g, update, surf };
}

// —— digital probe thermometer clipped to the rim ——
function makeThermo() {
  const g = new THREE.Group();
  let shown = '';
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  function draw(v) {
    const s = v.toFixed(1); if (s === shown) return; shown = s;
    const x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#c9d3c4'); gr.addColorStop(1, '#aebba9');
    x.fillStyle = gr; x.fillRect(0, 0, 512, 256);
    x.fillStyle = 'rgba(20,28,22,.08)'; x.font = '300 170px "Inter Tight"'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText('88.8', 400, 136);
    x.fillStyle = '#1a221c'; x.fillText(s, 400, 136); x.font = '400 64px "Inter Tight"'; x.textAlign = 'left'; x.fillText('°C', 412, 110);
    tex.needsUpdate = true;
  }
  const bodyM = new THREE.MeshPhysicalMaterial({ color: '#f1f3f0', roughness: .35, clearcoat: .6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 5.2, 1.1), bodyM); g.add(body);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.55, .08), new THREE.MeshStandardMaterial({ color: '#1f2622', roughness: .3 })); bezel.position.set(0, 1.25, .56); g.add(bezel);
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.3), new THREE.MeshStandardMaterial({ map: tex, roughness: .25, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: .35 })); lcd.position.set(0, 1.25, .605); g.add(lcd);
  const glassF = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.3), glassMat({ opacity: .02, fres: .3 })); glassF.position.set(0, 1.25, .62); g.add(glassF);
  for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .12, 24), new THREE.MeshStandardMaterial({ color: i ? '#2e7d4f' : '#5b6460', roughness: .4 })); b.rotation.x = Math.PI / 2; b.position.set(i ? .7 : -.7, -.9, .58); g.add(b); }
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 11, 24), new THREE.MeshStandardMaterial({ color: '#c9ccce', metalness: 1, roughness: .22 })); probe.position.y = -2.6 - 5.5; g.add(probe);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 10), probe.material); tip.position.y = -2.6 - 11; g.add(tip);
  draw(80.0);
  const anchor = new THREE.Vector3(0, 1.25, .62);
  return { g, draw, anchor };
}

// —— leaf ——
const outline = s => { // half-width along the blade (s 0..1): rounded base, pointed tip, fine teeth
  const w = Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.02)), .78) * (1 - .18 * s) * (s < .1 ? .55 + 4.5 * s : 1);
  return Math.max(0, w) * LEAF.W / 2 * (1 + .025 * Math.abs(Math.sin(s * 70)));
};
const VEINS = Array.from({ length: 8 }, (_, k) => ({ s: .1 + k * .1, side: 1 })).flatMap(v => [v, { ...v, side: -1, s: v.s + .035 }]);
function leafTextures() {
  const w = 1024, h = 560, L = LEAF.L, W = LEAF.W;
  const U = x => x / L * w, Vv = y => h / 2 - y / W * h;           // leaf coords (x along, y across) → canvas
  const veinPath = (c, v) => { const x0 = v.s * L, x1 = Math.min(L * .98, x0 + .55 + .25 * v.s), y1 = v.side * outline(x1 / L) * .9;
    c.beginPath(); c.moveTo(U(x0), Vv(0)); c.quadraticCurveTo(U(x0 + .15), Vv(y1 * .55), U(x1), Vv(y1)); };
  const net = (c, a, seed) => { c.strokeStyle = a; c.lineWidth = 1.2; for (let i = 0; i < 900; i++) { const x = hash(i * 3 + seed) * L, y = (hash(i * 7 + seed) - .5) * W; if (Math.abs(y) > outline(x / L)) continue; const an = hash(i * 11 + seed) * 6.3, d = .05 + .08 * hash(i * 13); c.beginPath(); c.moveTo(U(x), Vv(y)); c.lineTo(U(x + Math.cos(an) * d), Vv(y + Math.sin(an) * d)); c.stroke(); } };
  const top = canvasTex(w, h, c => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1f4a1c'); gr.addColorStop(.5, '#28581f'); gr.addColorStop(1, '#1c441a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${hash(i) > .5 ? '60,110,40' : '15,40,15'},.08)`; c.beginPath(); c.arc(hash(i * 5) * w, hash(i * 9) * h, 10 + 40 * hash(i * 2), 0, 7); c.fill(); }
    net(c, 'rgba(120,170,90,.18)', 1);
    c.strokeStyle = 'rgba(150,190,110,.55)'; c.lineCap = 'round'; for (const v of VEINS) { c.lineWidth = 3; veinPath(c, v); c.stroke(); }
    c.lineWidth = 6; c.strokeStyle = 'rgba(170,205,120,.7)'; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w * .97, h / 2); c.stroke();
  });
  const bot = canvasTex(w, h, c => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#6e9a5a'); gr.addColorStop(1, '#7ea766'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(${hash(i) > .5 ? '150,190,120' : '80,120,60'},.08)`; c.beginPath(); c.arc(hash(i * 5 + 1) * w, hash(i * 9 + 2) * h, 10 + 40 * hash(i * 2), 0, 7); c.fill(); }
    net(c, 'rgba(190,220,160,.35)', 2);
    c.strokeStyle = 'rgba(200,228,170,.85)'; c.lineCap = 'round'; for (const v of VEINS) { c.lineWidth = 6; veinPath(c, v); c.stroke(); }
    c.lineWidth = 12; c.strokeStyle = 'rgba(214,236,180,.9)'; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w * .97, h / 2); c.stroke();
  });
  const bump = (sign) => canvasTex(w, h, c => {
    c.fillStyle = '#808080'; c.fillRect(0, 0, w, h); net(c, sign > 0 ? '#9a9a9a' : '#6a6a6a', sign > 0 ? 2 : 1);
    c.strokeStyle = sign > 0 ? '#e0e0e0' : '#404040'; c.lineCap = 'round'; for (const v of VEINS) { c.lineWidth = sign > 0 ? 9 : 5; veinPath(c, v); c.stroke(); }
    c.lineWidth = sign > 0 ? 16 : 8; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w * .97, h / 2); c.stroke();
  }, false);
  return { top, bot, bumpTop: bump(-1), bumpBot: bump(1) };
}
export const inLeaf = (x, z) => x > 0.02 && x < LEAF.L * .995 && Math.abs(z) < outline(x / LEAF.L);
export function makeLeaf() {
  const root = new THREE.Group();     // origin: petiole joint; blade along +x, upper side +y
  const { L } = LEAF, N = 140, pts = [];
  for (let i = 0; i <= N; i++) { const s = i / N; pts.push(new THREE.Vector2(s * L, outline(s))); }
  for (let i = N; i >= 0; i--) { const s = i / N; pts.push(new THREE.Vector2(s * L, -outline(s))); }
  const shape = new THREE.Shape(pts);
  const flat = new THREE.ShapeGeometry(shape, 1);
  { const p = flat.attributes.position, uv = flat.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / L, .5 + p.getY(i) / LEAF.W); }
  flat.rotateX(-Math.PI / 2);         // shape y → −z, normal → +y
  const tx = leafTextures();
  const topM = new THREE.MeshPhysicalMaterial({ map: tx.top, bumpMap: tx.bumpTop, bumpScale: 1.2, roughness: .34, clearcoat: .7, clearcoatRoughness: .25, side: THREE.FrontSide });
  const botM = new THREE.MeshPhysicalMaterial({ map: tx.bot, bumpMap: tx.bumpBot, bumpScale: 2.2, roughness: .78, sheen: .6, sheenColor: new THREE.Color('#cfe6c0'), sheenRoughness: .6, side: THREE.BackSide });
  const T = new THREE.Mesh(flat, topM); T.position.y = .014; root.add(T);
  const B = new THREE.Mesh(flat, botM); B.position.y = -.014; root.add(B);
  const edge = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .028, bevelEnabled: false, curveSegments: 1 }), [new THREE.MeshBasicMaterial({ visible: false }), new THREE.MeshStandardMaterial({ color: '#4d7a3a', roughness: .6 })]);
  edge.geometry.rotateX(-Math.PI / 2); edge.position.y = -.014; root.add(edge);
  // midrib ridge on the lower side, petiole
  const mid = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, -.03, 0), new THREE.Vector3(L * .95, -.02, 0)), 8, .055, 10), new THREE.MeshStandardMaterial({ color: '#9cbf80', roughness: .7 }));
  root.add(mid);
  const petC = new THREE.CatmullRomCurve3([new THREE.Vector3(.15, 0, 0), new THREE.Vector3(-.6, .04, 0), new THREE.Vector3(-LEAF.pet, .12, .05)]);
  const pet = new THREE.Mesh(new THREE.TubeGeometry(petC, 16, .065, 10), new THREE.MeshStandardMaterial({ color: '#5f8c45', roughness: .55 })); root.add(pet);
  // tweezers: two stainless arms from the petiole tip, up and back over the rim
  const tw = new THREE.Group(); tw.position.set(-LEAF.pet + .05, .12, .05); root.add(tw);
  const steel = new THREE.MeshStandardMaterial({ color: '#d7dadc', metalness: 1, roughness: .2 });
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.32, 22, .07), steel);
    arm.geometry.translate(0, 11, 0); arm.position.z = s * .06; arm.rotation.x = s * .028; tw.add(arm);
  }
  const anchors = { faceTop: new THREE.Vector3(L * .5, .02, -.3), faceBottom: new THREE.Vector3(L * .5, -.02, .3), sideTop: new THREE.Vector3(L * .62, .05, 0), sideBottom: new THREE.Vector3(L * .45, -.12, 0) };
  return { root, anchors, tweezers: tw };
}

// —— air bubbles: silver rim (total internal reflection), clear core, a small highlight ——
export function bubbleMat() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.); vN = normalize(normalMatrix * mat3(instanceMatrix) * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec3 n = normalize(vN), v = normalize(vV); float c = abs(dot(n, v)); float f = 1. - c;
        float rim = smoothstep(.25, .95, f);
        vec3 L1 = normalize(vec3(-.4, .75, .55)); float sp = pow(max(dot(reflect(-L1, n), v), 0.), 60.);
        vec3 col = mix(vec3(.55, .66, .66), vec3(1.05, 1.08, 1.08), rim) + sp * 2.2;
        float a = .12 + .82 * pow(rim, 1.2) + sp;
        float inner = 0.;  // the faint inner ring
        gl_FragColor = vec4(col + inner, clamp(a + inner, 0., 1.)); }`,
  });
}

// bubble sites in leaf coordinates
function sample(n, seed, filter = () => true) {
  const out = []; let i = 0;
  while (out.length < n && i < n * 60) { i++; const x = hash(i * 1.37 + seed) * LEAF.L, z = (hash(i * 2.91 + seed * 3) - .5) * LEAF.W; if (inLeaf(x, z) && filter(x, z)) out.push({ x, z, k: out.length }); }
  return out;
}
const edgeDist = (x, z) => outline(x / LEAF.L) - Math.abs(z);
export function makeBubbles(leafRoot) {
  const geo = new THREE.SphereGeometry(1, 18, 12), mat = bubbleMat();
  const bot = new THREE.InstancedMesh(geo, mat, 900), top = new THREE.InstancedMesh(geo, mat, 200);
  bot.renderOrder = top.renderOrder = 2; bot.frustumCulled = top.frustumCulled = false;
  leafRoot.add(bot, top);
  const BS = sample(460, 1.7, (x, z) => edgeDist(x, z) > .05).map((s, i) => ({ ...s, t0: hash(i * 5.1) ** 1.7 * 7.5 + .2, rmax: .035 + .075 * hash(i * 8.3) ** 1.5, tau: 1 + 1.6 * hash(i * 2.2), det: edgeDist(s.x, s.z) < .32 && hash(i * 9.9) < .55, P: 1.6 + 2.2 * hash(i * 4.4) }));
  const TS = sample(16, 9.3, (x, z) => edgeDist(x, z) > .1).map((s, i) => ({ ...s, t0: 2.5 + hash(i * 3.3) * 9, rmax: .025 + .035 * hash(i * 6.1), tau: 1.4 + hash(i), det: i % 4 === 0, P: 2.5 + 2 * hash(i * 7.7) }));
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3();
  const put = (im, x, y, z, r, sq = 1) => { if (r < .004) return; M.compose(P.set(x, y, z), Q, S.set(r, r * sq, r)); im.setMatrixAt(im.count++, M); };
  // depth: distance (local +y) from the leaf to the water surface, so rising bubbles vanish there
  function update(t, t0, depth) {
    bot.count = top.count = 0; const a = t - t0; if (a < 0) { bot.instanceMatrix.needsUpdate = top.instanceMatrix.needsUpdate = true; return; }
    for (const [list, im, sgn] of [[BS, bot, -1], [TS, top, 1]]) for (const s of list) {
      const age = a - s.t0; if (age < 0) continue;
      if (!s.det) { const r = s.rmax * (1 - Math.exp(-age / s.tau)); put(im, s.x, sgn * (.016 + r * .85), s.z, r, .9); continue; }
      // cycling sites: grow, let go, slide to the edge (lower side) and rise to the surface; regrow
      const k = Math.floor(age / s.P), u = age / s.P - k, r = s.rmax * ss(u * 1.25);
      put(im, s.x, sgn * (.016 + r * .85), s.z, r, .9);
      if (k > 0) { const ra = u * s.P, rr = s.rmax * .95, wob = .04 * Math.sin(ra * 14 + s.k);
        if (sgn < 0) { const out = Math.sign(s.z) || 1, e = edgeDist(s.x, s.z) + rr * 1.4, sl = Math.min(1, ra / .45);
          const y = -(.016 + rr) + Math.max(0, ra - .45) ** 1.25 * 3.4; if (y < depth) put(im, s.x + wob, y + (sl < 1 ? 0 : 0), s.z + out * e * ss(sl), rr * (y > .05 ? 1.05 : 1)); }
        else { const y = .016 + rr + ra ** 1.25 * 3.2; if (y < depth) put(im, s.x + wob, y, s.z + wob * .7, rr); } }
    }
    bot.instanceMatrix.needsUpdate = top.instanceMatrix.needsUpdate = true;
  }
  return { update, bot, top, counts: () => [bot.count, top.count] };
}

// —— steam: soft sprites rising off the surface ——
export function makeSteam() {
  const tex = canvasTex(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.5, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  const g = new THREE.Group(), list = [];
  for (let i = 0; i < 46; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })); m.renderOrder = 8; g.add(m); list.push(m); }
  function update(t, k = 1) {
    list.forEach((m, i) => { const life = 4.2 + 1.5 * hash(i * 3.1), u = ((t + hash(i) * life) / life) % 1;
      const a0 = hash(i * 7.3) * 6.28, r0 = RIN * .8 * Math.sqrt(hash(i * 5.7));
      m.position.set(Math.sin(a0) * r0 + Math.sin(t * .6 + i) * .6 * u, BEAKER.water + .3 + u * 9 + (BEAKER.h - BEAKER.water) * .2, Math.cos(a0) * r0 + u * 1.2);
      const sc = 1.6 + u * 5; m.scale.set(sc, sc, sc); m.material.opacity = .085 * Math.sin(Math.PI * u) ** 1.5 * k; m.material.rotation = i + u; });
  }
  return { g, update };
}

export function makeLab() {
  const plate = makePlate(), beaker = makeBeaker(), water = makeWater(), thermo = makeThermo();
  return { plate, beaker, water, thermo };
}
export { RIN };
