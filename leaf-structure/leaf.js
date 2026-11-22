// Glass models: the whole leaf (outside) and the cross-section block (inside). Fictional teaching model, not a product.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mulberry } from '/core/lib.js';

export const GREEN = new THREE.Color('#5dff9a'), CYAN = new THREE.Color('#4fe3ff');

// —— materials ——
export const glass = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({
  color: '#ffffff', transmission: 1, roughness: .03, metalness: 0, ior: 1.46, thickness: 3, dispersion: 2.5,
  attenuationColor: new THREE.Color('#d8f5e4'), attenuationDistance: 60, specularIntensity: 1, side: THREE.DoubleSide,
}, o));

// dark-field glass for the many small cells: additive, so only the strip reflections (bright at grazing angles) show,
// exactly what clear glass looks like on black — and far cheaper than a transmission pass for hundreds of instances
export const fieldGlass = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({
  color: '#0c1a12', roughness: .06, metalness: 0, clearcoat: .6, clearcoatRoughness: .05, envMapIntensity: 1.4,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
}, o));

// tube light guide: dark polished acrylic with comet pulses running along uv.x
export function guideMat(col = GREEN, base = .0) {
  const m = new THREE.MeshPhysicalMaterial({ color: '#0b1410', roughness: .22, clearcoat: 1, clearcoatRoughness: .08, metalness: 0 });
  const U = { uHeads: { value: new Float32Array(6).fill(-9) }, uAmp: { value: new Float32Array(6) }, uW: { value: .05 }, uBase: { value: base }, uA: { value: col.clone() }, uB: { value: CYAN.clone() }, uDir: { value: 1 } };
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGuv;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvGuv = uv;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
      varying vec2 vGuv; uniform float uHeads[6]; uniform float uAmp[6]; uniform float uW, uBase, uDir; uniform vec3 uA, uB;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { float u = uDir > 0. ? vGuv.x : 1. - vGuv.x; vec3 acc = uA * uBase;
        for (int i = 0; i < 6; i++) { float h = uHeads[i]; float d = h - u;
          float head = exp(-d * d / (uW * uW)); float tail = d > 0. ? exp(-d / (uW * 4.)) * .55 : 0.;
          float e = (head + tail) * uAmp[i]; vec3 c = mix(uA, uB, clamp(d * 2., 0., 1.) * .0);
          acc += c * e + vec3(1.) * pow(head, 3.) * uAmp[i] * .35; }
        totalEmissiveRadiance += acc; }`);
  };
  m.userData.U = U;
  return m;
}
export function setPulses(mat, list, base) {   // list: [{h, a}] (h in 0..1 along the tube)
  const U = mat.userData.U; U.uHeads.value.fill(-9); U.uAmp.value.fill(0);
  list.slice(0, 6).forEach((p, i) => { U.uHeads.value[i] = p.h; U.uAmp.value[i] = p.a; });
  if (base != null) U.uBase.value = base;
}

// —— the whole leaf ——
// lies in the XZ plane, petiole at -X, tip at +X; length ≈ 120
export function makeLeaf() {
  const root = new THREE.Group();
  const L0 = -38, L1 = 62, len = L1 - L0;
  const half = s => 30 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.02)), .78) * (1 - .32 * s) + (s < .04 ? 0 : 0);
  const tooth = s => s > .06 && s < .97 ? 1.1 * (1 - Math.abs(((s * 34) % 1) * 2 - 1)) : 0;
  const pts = [];
  for (let i = 0; i <= 160; i++) { const s = i / 160; pts.push(new THREE.Vector2(L0 + s * len, half(s) + tooth(s))); }
  for (let i = 160; i >= 0; i--) { const s = i / 160; pts.push(new THREE.Vector2(L0 + s * len, -half(s) - tooth(s + .015))); }
  const shape = new THREE.Shape(pts);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.6, bevelEnabled: true, bevelThickness: .9, bevelSize: .9, bevelSegments: 3, curveSegments: 4 });
  geo.translate(0, 0, -.8); geo.rotateX(-Math.PI / 2);
  // a gentle arch along the length and a slight fold along the midrib
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + 6 * Math.sin(Math.PI * (x - L0) / len) * .6 - .045 * Math.abs(z) * 2.2 + .0); }
  geo.computeVertexNormals();
  const blade = new THREE.Mesh(geo, glass({ transmission: .72, thickness: 4, roughness: .16, color: '#bff5cf', attenuationColor: new THREE.Color('#47c47a'), attenuationDistance: 8, clearcoat: 1, clearcoatRoughness: .04, emissive: new THREE.Color('#1d7a45'), emissiveIntensity: .32 }));
  root.add(blade);
  const archY = (x, z = 0) => 6 * Math.sin(Math.PI * (x - L0) / len) * .6 - .045 * Math.abs(z) * 2.2;
  // veins (opaque light guides embedded in the glass)
  const veins = [];
  const tube = (curve, r, col) => { const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, r, 10), guideMat(col)); root.add(m); veins.push(m); return m; };
  const mid = new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => { const x = L0 - 1 + i / 11 * (len - 4); return new THREE.Vector3(x, archY(x) + .15, 0); }));
  veins.mid = tube(mid, .95, GREEN);
  const lat = [];
  for (let k = 0; k < 7; k++) for (const sd of [-1, 1]) {
    const s0 = .1 + k * .115, x0 = L0 + s0 * len, s1 = Math.min(.97, s0 + .2), x1 = L0 + s1 * len, zz = sd * half(s1) * .86;
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x0, archY(x0), 0), new THREE.Vector3(x0 + (x1 - x0) * .35, archY(x0), zz * .55), new THREE.Vector3(x1, archY(x1, zz), zz));
    lat.push({ m: tube(c, .42, GREEN), s0 });
  }
  veins.lat = lat;
  // petiole: a glass stalk with the midrib guide continuing inside it
  const pc = new THREE.CatmullRomCurve3([new THREE.Vector3(L0 + 2, archY(L0) , 0), new THREE.Vector3(L0 - 12, -1.5, 1), new THREE.Vector3(L0 - 26, -5, 3), new THREE.Vector3(L0 - 34, -9, 4)]);
  const pet = new THREE.Mesh(new THREE.TubeGeometry(pc, 48, 2.0, 16), glass({ transmission: .72, thickness: 4, roughness: .16, color: '#bff5cf', attenuationColor: new THREE.Color('#47c47a'), attenuationDistance: 8, clearcoat: 1, emissive: new THREE.Color('#1d7a45'), emissiveIntensity: .32 }));
  root.add(pet);
  veins.pet = tube(pc, .9, GREEN);
  const anchors = { petiole: new THREE.Vector3(L0 - 20, -3.5, 2.2), blade: new THREE.Vector3(L0 + len * .62, archY(L0 + len * .62) + 1, -14), veins: new THREE.Vector3(L0 + len * .45, archY(L0 + len * .45) + .5, 13) };
  return { root, blade, pet, veins, anchors, L0, L1 };
}

// —— the cross-section block ——
export const BX = 40, BZ = 26;          // half sizes in x / z
export const BUNDLE = { x: 18, y: -1.5, r: 7.5 };
export const STOMATA = [{ x: -16, z: 4 }, { x: -2, z: -14 }, { x: -26, z: -12 }, { x: 4, z: 16 }];

export function makeBlock() {
  const R = mulberry(7);
  const root = new THREE.Group();
  const layers = {};
  const mkGroup = n => { const g = new THREE.Group(); root.add(g); layers[n] = g; return g; };
  const cellGlass = fieldGlass({ color: '#0d2416' });
  const epiGlass = fieldGlass({ color: '#16241c', emissive: new THREE.Color('#9fe8c0'), emissiveIntensity: .035 });
  const chlMat = new THREE.MeshStandardMaterial({ color: '#2a7f3f', roughness: .45, metalness: 0, emissive: new THREE.Color('#3dff7a'), emissiveIntensity: .15 });
  const chlGeo = new THREE.SphereGeometry(.62, 8, 6); chlGeo.scale(1, .62, .7);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), E = new THREE.Euler();
  const inst = (geo, mat, list, group) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((o, i) => { E.set(o.rx || 0, o.ry || 0, o.rz || 0); Q.setFromEuler(E); S.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1); P.set(o.x, o.y, o.z); M.compose(P, Q, S); im.setMatrixAt(i, M); });
    group.add(im); return im;
  };
  const nearBundle = (x, y, pad = 0) => Math.hypot(x - BUNDLE.x, y - BUNDLE.y) < BUNDLE.r + pad;
  const nearStoma = (x, z, pad) => STOMATA.some(s => Math.hypot(x - s.x, z - s.z) < pad);

  // upper epidermis + cuticle
  const up = mkGroup('upper');
  const epiCells = [], step = 6.6;
  for (let x = -BX + 3.3; x < BX; x += step) for (let z = -BZ + 3.3; z < BZ; z += step) epiCells.push({ x: x + (R() - .5) * .6, y: 13.6, z: z + (R() - .5) * .6, sx: .95 + R() * .1, sz: .95 + R() * .1 });
  inst(new RoundedBoxGeometry(6.3, 3.0, 6.3, 2, .9), epiGlass, epiCells, up);
  const cut = new THREE.Mesh(new THREE.BoxGeometry(BX * 2 + .6, .7, BZ * 2 + .6), fieldGlass({ color: '#0a0f0c', roughness: .02 }));
  cut.position.y = 15.5; up.add(cut);

  // palisade: tall capsules, packed, many chloroplasts along their walls
  const pal = mkGroup('palisade'), palCells = [], palChl = [];
  for (let x = -BX + 2.5; x < BX; x += 4.9) for (let z = -BZ + 2.5; z < BZ; z += 4.9) {
    const cx = x + (R() - .5) * .7, cz = z + (R() - .5) * .7;
    if (nearBundle(cx, 7, 1.2) && Math.abs(cx - BUNDLE.x) < 5) continue;
    const h = .92 + R() * .12;
    palCells.push({ x: cx, y: 7.2, z: cz, sy: h, rx: (R() - .5) * .05, rz: (R() - .5) * .05 });
    for (let k = 0; k < 7; k++) { const a = R() * Math.PI * 2, yy = 7.2 + (R() - .5) * 7.6 * h; palChl.push({ x: cx + Math.cos(a) * 1.35, y: yy, z: cz + Math.sin(a) * 1.35, ry: -a, rz: Math.PI / 2 }); }
  }
  inst(new THREE.CapsuleGeometry(2.15, 6.4, 4, 14), cellGlass, palCells, pal);
  const palChlIM = inst(chlGeo, chlMat, palChl, pal);

  // spongy: loose round cells with air spaces between them
  const spo = mkGroup('spongy'), spoCells = [], spoChl = [];
  let tries = 0;
  while (spoCells.length < 150 && tries < 6000) {
    tries++;
    const r = 2.2 + R() * 1.1, x = -BX + r + R() * (BX * 2 - 2 * r), z = -BZ + r + R() * (BZ * 2 - 2 * r), y = -8.4 + R() * 7.4;
    if (nearBundle(x, y, r + .6)) continue;
    if (spoCells.some(c => Math.hypot(c.x - x, c.y - y, c.z - z) < (c.r + r) * 1.02)) continue;
    spoCells.push({ x, y, z, r, sx: r, sy: r * (.75 + R() * .3), sz: r * (.9 + R() * .2), ry: R() * 3 });
    for (let k = 0; k < 4; k++) { const a = R() * Math.PI * 2, b = (R() - .5) * 2; spoChl.push({ x: x + Math.cos(a) * r * .7, y: y + b * r * .5, z: z + Math.sin(a) * r * .7, ry: -a }); }
  }
  inst(new THREE.SphereGeometry(1, 16, 10), cellGlass, spoCells, spo);
  const spoChlIM = inst(chlGeo, chlMat, spoChl, spo);

  // lower epidermis with stomata
  const lo = mkGroup('lower'), loCells = [];
  for (let x = -BX + 3.3; x < BX; x += step) for (let z = -BZ + 3.3; z < BZ; z += step) {
    if (nearStoma(x, z, 4.2)) continue;
    loCells.push({ x: x + (R() - .5) * .6, y: -11.6, z: z + (R() - .5) * .6, sx: .95 + R() * .1, sz: .95 + R() * .1 });
  }
  inst(new RoundedBoxGeometry(6.3, 2.6, 6.3, 2, .8), epiGlass, loCells, lo);
  const loCut = new THREE.Mesh(new THREE.BoxGeometry(BX * 2 + .6, .6, BZ * 2 + .6), fieldGlass({ color: '#0a0f0c', roughness: .02 }));
  loCut.position.y = -13.3; lo.add(loCut);
  // guard cells: two bean-shaped halves, satin green, opening a slit
  const guardMat = new THREE.MeshPhysicalMaterial({ color: '#2f6b45', roughness: .28, clearcoat: .8, emissive: new THREE.Color('#3dff7a'), emissiveIntensity: .05 });
  const guardGeo = new THREE.TorusGeometry(2.3, 1.05, 12, 24, Math.PI); guardGeo.scale(1, 1, .8);
  const guards = STOMATA.map(s => {
    const g = new THREE.Group(); g.position.set(s.x, -11.6, s.z); lo.add(g);
    const a = new THREE.Mesh(guardGeo, guardMat), b = new THREE.Mesh(guardGeo, guardMat);
    a.rotation.x = Math.PI / 2; b.rotation.x = Math.PI / 2; b.rotation.z = Math.PI;
    g.add(a, b); return { g, a, b };
  });
  const setStoma = o => guards.forEach(({ a, b }) => { a.position.z = -.5 * o; b.position.z = .5 * o; a.scale.set(1 - .08 * o, 1, 1); b.scale.set(1 - .08 * o, 1, 1); });
  setStoma(0);

  // vascular bundle (runs along z): glass sheath, xylem (water, cyan) above, phloem (sugar, green) below
  const vb = mkGroup('bundle');
  const sheath = [];
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; sheath.push({ x: BUNDLE.x + Math.cos(a) * 6.2, y: BUNDLE.y + Math.sin(a) * 6.2, z: 0, rx: Math.PI / 2 }); }
  inst(new THREE.CylinderGeometry(1.45, 1.45, BZ * 2, 14), fieldGlass({ color: '#16241c', emissive: new THREE.Color('#9fe8c0'), emissiveIntensity: .05 }), sheath, vb);
  const line = (x, y, r, col) => { const c = new THREE.LineCurve3(new THREE.Vector3(x, y, -BZ), new THREE.Vector3(x, y, BZ)); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 8, r, 14), guideMat(col)); vb.add(m); return m; };
  const xylem = [[-2.6, 1.8, 1.2], [0, 2.9, 1.35], [2.6, 1.8, 1.2], [-1.3, .3, .9], [1.3, .3, .9]].map(([dx, dy, r]) => line(BUNDLE.x + dx, BUNDLE.y + dy, r, CYAN));
  const phloem = [[-2.2, -1.9, .65], [0, -2.4, .7], [2.2, -1.9, .65], [-1.1, -3.6, .55], [1.1, -3.6, .55], [-3.2, -.6, .5], [3.2, -.6, .5]].map(([dx, dy, r]) => line(BUNDLE.x + dx, BUNDLE.y + dy, r, GREEN));
  xylem.forEach(m => { m.material.userData.U.uA.value.copy(CYAN); m.material.userData.U.uW.value = .06; });
  phloem.forEach(m => { m.material.userData.U.uW.value = .06; });

  // gas bubbles near the stomata
  const bubGeo = new THREE.SphereGeometry(.5, 10, 8);
  const bubMat = { o2: new THREE.MeshBasicMaterial({ color: new THREE.Color('#8ff7ff').multiplyScalar(1.6), transparent: true }), co2: new THREE.MeshBasicMaterial({ color: new THREE.Color('#d9e2e6').multiplyScalar(1.1), transparent: true }), h2o: new THREE.MeshBasicMaterial({ color: new THREE.Color('#e8fbff').multiplyScalar(1.3), transparent: true, opacity: .6 }) };
  const bubbles = { o2: new THREE.InstancedMesh(bubGeo, bubMat.o2, 60), co2: new THREE.InstancedMesh(bubGeo, bubMat.co2, 40), h2o: new THREE.InstancedMesh(bubGeo, bubMat.h2o, 60) };
  Object.values(bubbles).forEach(b => { b.count = 0; root.add(b); });

  const anchors = {
    upperEpi: () => new THREE.Vector3(-BX + 8, 15.5, BZ).applyMatrix4(up.matrixWorld),
    lowerEpi: () => new THREE.Vector3(-BX + 8, -13.2, BZ).applyMatrix4(lo.matrixWorld),
    palisade: () => new THREE.Vector3(BX - 10, 9, BZ - 1).applyMatrix4(pal.matrixWorld),
    spongy: () => new THREE.Vector3(BX - 14, -5, BZ - 2).applyMatrix4(spo.matrixWorld),
    xylem: () => new THREE.Vector3(BUNDLE.x, BUNDLE.y + 2.9, BZ).applyMatrix4(vb.matrixWorld),
    phloem: () => new THREE.Vector3(BUNDLE.x, BUNDLE.y - 2.4, BZ).applyMatrix4(vb.matrixWorld),
    stoma: () => new THREE.Vector3(STOMATA[0].x, -13.2, STOMATA[0].z).applyMatrix4(lo.matrixWorld),
    chloro: () => new THREE.Vector3(palChl[40].x, palChl[40].y, palChl[40].z).applyMatrix4(pal.matrixWorld),
  };
  return { root, layers, xylem, phloem, chlMat, guardMat, setStoma, guards, bubbles, anchors, palChlIM, spoChlIM };
}

// layer explode: e = 0 closed … 1 apart (the bundle stays in the middle)
export function explodeBlock(B, e, t = 0) {
  const off = { upper: 14, palisade: 6, spongy: -5, lower: -14 };
  let i = 0;
  for (const k in off) {
    const g = B.layers[k]; g.position.y = off[k] * e;
    g.rotation.z = Math.sin(i * 1.7) * .05 * e; g.rotation.x = Math.cos(i * 2.3) * .04 * e; i++;
  }
  B.layers.bundle.position.y = 0;
}
