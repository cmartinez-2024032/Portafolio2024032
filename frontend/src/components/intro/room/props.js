import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// Large emissive areas stay near 1.0 so tone mapping keeps them red instead of salmon.
export const RED = 0xff0024;

const mats = {
  top: new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.5, metalness: 0.15 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.38, metalness: 0.6 }),
  black: new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.55, metalness: 0.2 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x151517, roughness: 0.42 }),
  redFabric: new THREE.MeshStandardMaterial({ color: 0x8e0d18, roughness: 0.6 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0x9a9ca0, roughness: 0.22, metalness: 1 }),
  key: new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.55 }),
  mat: new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.92 }),
  board: new THREE.MeshStandardMaterial({ color: 0x16181b, roughness: 0.6, metalness: 0.3 }),
  grille: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8, transparent: true, opacity: 0.55 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.04, transparent: true, opacity: 0.16 }),
};

export const glow = (color, intensity) =>
  new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity, roughness: 0.4 });

const rbox = (w, h, d, r = 0.01) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2));
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

function add(parent, geo, mat, x = 0, y = 0, z = 0, cast = true) {
  const o = new THREE.Mesh(geo, mat);
  o.position.set(x, y, z);
  o.castShadow = cast;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}

// Origin: floor, center. Front edge faces +z.
export function makeDesk({ w = 1.6, d = 0.75, h = 0.75 } = {}) {
  const g = new THREE.Group();
  add(g, rbox(w, 0.03, d, 0.008), mats.top, 0, h - 0.015, 0);
  for (const s of [-1, 1]) {
    const x = s * (w / 2 - 0.12);
    add(g, box(0.07, h - 0.07, 0.07), mats.metal, x, (h - 0.03 + 0.04) / 2, 0);
    add(g, rbox(0.07, 0.04, d - 0.06, 0.01), mats.metal, x, 0.02, 0);
    add(g, box(0.05, 0.04, d - 0.1), mats.metal, x, h - 0.05, 0);
  }
  add(g, box(w - 0.24, 0.05, 0.04), mats.metal, 0, h - 0.08, -d / 2 + 0.1);

  add(g, rbox(1.02, 0.003, 0.442, 0.002), mats.redFabric, 0, h + 0.0015, 0.12, false);
  add(g, rbox(1.0, 0.004, 0.42, 0.002), mats.mat, 0, h + 0.002, 0.12, false);

  add(g, box(w - 0.1, 0.006, 0.01), glow(RED, 5), 0, h - 0.034, d / 2 - 0.05, false);
  add(g, box(w - 0.1, 0.006, 0.01), glow(RED, 5), 0, h - 0.034, -d / 2 + 0.02, false);
  g.userData.top = h + 0.004;
  return g;
}

// Origin: floor, center. The occupant faces -z.
export function makeChair() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.04, 0.05, 0.05, 20), mats.metal, 0, 0.09, 0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = add(g, rbox(0.04, 0.035, 0.3, 0.012), mats.metal, Math.sin(a) * 0.15, 0.075, Math.cos(a) * 0.15);
    arm.rotation.y = a;
    add(g, new THREE.SphereGeometry(0.028, 16, 12), mats.black, Math.sin(a) * 0.3, 0.03, Math.cos(a) * 0.3);
  }
  add(g, new THREE.CylinderGeometry(0.022, 0.022, 0.3, 16), mats.chrome, 0, 0.26, 0);
  add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.14, 16), mats.black, 0, 0.17, 0);
  add(g, box(0.3, 0.04, 0.3), mats.metal, 0, 0.41, 0);

  add(g, rbox(0.52, 0.1, 0.5, 0.04), mats.leather, 0, 0.47, 0);
  for (const s of [-1, 1]) {
    add(g, rbox(0.07, 0.07, 0.48, 0.03), mats.leather, s * 0.25, 0.53, 0);
    add(g, rbox(0.008, 0.05, 0.44, 0.003), mats.redFabric, s * 0.287, 0.53, 0);
  }

  const back = new THREE.Group();
  back.position.set(0, 0.52, 0.23);
  back.rotation.x = 0.14;
  g.add(back);
  add(back, rbox(0.5, 0.82, 0.1, 0.045), mats.leather, 0, 0.45, 0);
  for (const s of [-1, 1]) {
    add(back, rbox(0.08, 0.7, 0.13, 0.035), mats.leather, s * 0.26, 0.38, -0.02);
    add(back, rbox(0.06, 0.62, 0.012, 0.005), mats.redFabric, s * 0.16, 0.42, -0.048);
    add(back, rbox(0.008, 0.62, 0.11, 0.003), mats.redFabric, s * 0.302, 0.38, -0.02);
  }
  add(back, rbox(0.28, 0.13, 0.08, 0.035), mats.leather, 0, 0.72, -0.07);
  add(back, rbox(0.3, 0.14, 0.07, 0.03), mats.leather, 0, 0.12, -0.075);
  const emblem = add(back, new THREE.CircleGeometry(0.06, 4), mats.redFabric, 0, 0.6, 0.0505, false);
  emblem.rotation.z = Math.PI / 4;

  for (const s of [-1, 1]) {
    add(g, box(0.06, 0.03, 0.05), mats.metal, s * 0.27, 0.45, 0.02);
    add(g, box(0.04, 0.22, 0.05), mats.metal, s * 0.29, 0.58, 0.02);
    add(g, rbox(0.08, 0.035, 0.26, 0.015), mats.black, s * 0.29, 0.705, -0.01);
  }
  return g;
}

function makeFan(r = 0.055) {
  const fan = new THREE.Group();
  const ring = add(fan, new THREE.TorusGeometry(r, 0.004, 10, 48), glow(RED, 6), 0, 0, 0, false);
  ring.rotation.y = Math.PI / 2;
  add(fan, box(0.012, r * 2.25, r * 2.25), mats.black, -0.004, 0, 0, false);
  const rotor = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const blade = add(rotor, box(0.003, r * 0.75, 0.022), mats.board, 0.004, 0, 0, false);
    const a = (i / 7) * Math.PI * 2;
    blade.position.set(0.004, Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45);
    blade.rotation.x = -a;
    blade.rotation.y = 0.35;
  }
  const hub = add(rotor, new THREE.CylinderGeometry(r * 0.32, r * 0.32, 0.012, 20), mats.board, 0.004, 0, 0, false);
  hub.rotation.z = Math.PI / 2;
  fan.add(rotor);
  fan.userData.rotor = rotor;
  return fan;
}

// Origin: bottom center. Glass faces +z, fans sit behind the +x side.
export function makePC() {
  const g = new THREE.Group();
  const W = 0.42;
  const H = 0.46;
  const D = 0.27;
  add(g, box(W, H, 0.006), mats.black, 0, H / 2, -D / 2 + 0.003);
  add(g, box(0.006, H, D), mats.black, -W / 2 + 0.003, H / 2, 0);
  add(g, box(W, 0.012, D), mats.black, 0, 0.006 + 0.012, 0);
  add(g, box(W, 0.012, D), mats.black, 0, H - 0.006, 0);
  add(g, box(0.012, H, 0.012), mats.black, W / 2 - 0.006, H / 2, D / 2 - 0.006);
  add(g, box(0.004, H - 0.02, D - 0.02), mats.grille, W / 2 - 0.002, H / 2, 0, false);
  const glass = add(g, new THREE.PlaneGeometry(W - 0.012, H - 0.024), mats.glass, -0.006, H / 2, D / 2, false);
  glass.receiveShadow = false;
  for (const x of [-W / 2 + 0.04, W / 2 - 0.04]) {
    for (const z of [-D / 2 + 0.03, D / 2 - 0.03]) add(g, new THREE.CylinderGeometry(0.012, 0.014, 0.012, 12), mats.black, x, 0.006, z);
  }

  add(g, box(0.25, 0.3, 0.004), mats.board, -0.06, H - 0.19, -D / 2 + 0.01);
  for (let i = 0; i < 4; i++) {
    const x = 0.03 + i * 0.013;
    add(g, box(0.007, 0.11, 0.035), mats.black, x, H - 0.13, -D / 2 + 0.03);
    add(g, box(0.007, 0.01, 0.036), glow(0xffffff, 3), x, H - 0.07, -D / 2 + 0.03, false);
  }
  const pump = add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.02, 32), mats.black, -0.07, H - 0.16, -D / 2 + 0.025);
  pump.rotation.x = Math.PI / 2;
  add(g, new THREE.TorusGeometry(0.031, 0.004, 10, 48), glow(RED, 7), -0.07, H - 0.16, -D / 2 + 0.036, false);
  add(g, rbox(0.3, 0.05, 0.12, 0.008), mats.metal, -0.04, H - 0.33, -D / 2 + 0.07);
  add(g, box(0.26, 0.006, 0.004), glow(RED, 6), -0.04, H - 0.315, -D / 2 + 0.131, false);
  add(g, box(W - 0.012, 0.09, D - 0.03), mats.black, 0, 0.012 + 0.045 + 0.006, -0.01);

  const fans = [0.17, 0.29, 0.41].map((y) => {
    const fan = makeFan();
    fan.position.set(W / 2 - 0.03, y - 0.02, 0);
    g.add(fan);
    return fan.userData.rotor;
  });
  const inside = new THREE.PointLight(RED, 0.6, 0.8, 2);
  inside.position.set(0, H / 2, 0);
  g.add(inside);
  g.userData.fans = fans;
  return g;
}

// Origin: desk surface, center.
export function makeKeyboard() {
  const g = new THREE.Group();
  add(g, rbox(0.44, 0.022, 0.14, 0.006), mats.black, 0, 0.011, 0);
  const plate = add(g, new THREE.PlaneGeometry(0.42, 0.12), glow(RED, 0.9), 0, 0.0225, 0, false);
  plate.rotation.x = -Math.PI / 2;
  const keys = new THREE.InstancedMesh(box(0.0215, 0.012, 0.0215), mats.key, 15 * 5);
  keys.castShadow = true;
  const t = new THREE.Object3D();
  let k = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 15; c++) {
      t.position.set(-0.1855 + c * 0.0265, 0.0285, -0.053 + r * 0.0265);
      t.updateMatrix();
      keys.setMatrixAt(k++, t.matrix);
    }
  }
  g.add(keys);
  const mouse = add(g, new THREE.SphereGeometry(1, 24, 16), mats.black, 0.32, 0.014, 0.01);
  mouse.scale.set(0.032, 0.02, 0.058);
  add(g, box(0.004, 0.003, 0.03), glow(RED, 5), 0.32, 0.033, -0.01, false);
  return g;
}

function stand(g, neckH, z) {
  add(g, rbox(0.05, neckH, 0.03, 0.01), mats.metal, 0, neckH / 2 + 0.008, z);
  for (const s of [-1, 1]) {
    const leg = add(g, rbox(0.04, 0.012, 0.24, 0.005), mats.metal, s * 0.08, 0.006, z + 0.06);
    leg.rotation.y = s * 0.55;
  }
}

// Origin: desk surface, center. Screen faces +z, edges curve toward the viewer.
export function makeCurvedMonitor(screen, { W = 0.72, H = 0.45, R = 2.2, y = 0.42 } = {}) {
  const g = new THREE.Group();
  const bend = (geo) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const a = p.getX(i) / R;
      p.setXYZ(i, R * Math.sin(a), p.getY(i), p.getZ(i) + R * (1 - Math.cos(a)));
    }
    geo.computeVertexNormals();
    return geo;
  };
  const body = add(g, bend(new THREE.BoxGeometry(W + 0.018, H + 0.018, 0.018, 48, 1, 1)), mats.black, 0, y, -0.0095);
  body.castShadow = true;
  const mat = new THREE.MeshBasicMaterial({ map: screen.texture });
  mat.color.setScalar(0.85);
  const panel = add(g, bend(new THREE.PlaneGeometry(W, H, 48, 1)), mat, 0, y, 0.0005, false);
  add(g, rbox(0.3, 0.2, 0.05, 0.02), mats.black, 0, y, -0.04);
  stand(g, y - 0.05, -0.07);
  g.userData = { panel, W, H, y };
  return g;
}

// Origin: desk surface, center. Portrait panel facing +z.
export function makeVerticalMonitor(screen, { W = 0.34, H = 0.55, y = 0.44 } = {}) {
  const g = new THREE.Group();
  add(g, box(W + 0.018, H + 0.018, 0.018), mats.black, 0, y, -0.0095);
  const mat = new THREE.MeshBasicMaterial({ map: screen.texture });
  mat.color.setScalar(0.85);
  add(g, new THREE.PlaneGeometry(W, H), mat, 0, y, 0.0005, false);
  add(g, rbox(0.18, 0.22, 0.045, 0.02), mats.black, 0, y, -0.035);
  stand(g, y - 0.12, -0.06);
  return g;
}

// Flat-top honeycomb, origin at the wall, facing +z.
export function makeHexPanels(r = 0.12) {
  const g = new THREE.Group();
  const cells = [
    [0, 0, false],
    [1, 0.5, true],
    [1, -0.5, false],
    [2, 0, true],
    [3, 0.5, false],
    [3, -0.5, true],
    [4, 0, false],
  ];
  const red = glow(RED, 0.9);
  const white = glow(0xffffff, 0.7);
  for (const [cx, cy, isRed] of cells) {
    const x = (cx - 2) * 1.5 * r * 1.07;
    const y = cy * Math.sqrt(3) * r * 1.07;
    const plate = add(g, new THREE.CylinderGeometry(r, r, 0.016, 6, 1, false, Math.PI / 2), mats.black, x, y, 0.008);
    plate.rotation.x = Math.PI / 2;
    add(g, new THREE.CircleGeometry(r * 0.86, 6), isRed ? red : white, x, y, 0.0165, false);
  }
  return g;
}

export function makeMug() {
  const g = new THREE.Group();
  const ceramic = new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.3, side: THREE.DoubleSide });
  add(g, new THREE.CylinderGeometry(0.042, 0.038, 0.1, 32, 1, true), ceramic, 0, 0.05, 0);
  const bottom = add(g, new THREE.CircleGeometry(0.038, 32), ceramic, 0, 0.004, 0);
  bottom.rotation.x = -Math.PI / 2;
  const coffee = add(g, new THREE.CircleGeometry(0.039, 32), new THREE.MeshStandardMaterial({ color: 0x1e0f07, roughness: 0.15 }), 0, 0.085, 0, false);
  coffee.rotation.x = -Math.PI / 2;
  const handle = add(g, new THREE.TorusGeometry(0.026, 0.007, 12, 24, Math.PI), ceramic, 0.042, 0.05, 0);
  handle.rotation.z = -Math.PI / 2;
  return g;
}

export function makeHeadphones() {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.06, 0.07, 0.012, 32), mats.metal, 0, 0.006, 0);
  add(g, new THREE.CylinderGeometry(0.008, 0.008, 0.28, 12), mats.metal, 0, 0.15, 0);
  add(g, rbox(0.03, 0.02, 0.06, 0.008), mats.metal, 0, 0.29, 0);
  const band = add(g, new THREE.TorusGeometry(0.085, 0.012, 12, 40, Math.PI), mats.leather, 0, 0.215, 0);
  band.rotation.y = Math.PI / 2;
  for (const s of [-1, 1]) {
    const cup = add(g, new THREE.CylinderGeometry(0.045, 0.045, 0.035, 32), mats.leather, 0, 0.2, s * 0.09);
    cup.rotation.x = Math.PI / 2;
    const ring = add(g, new THREE.TorusGeometry(0.038, 0.003, 8, 40), glow(RED, 5), 0, 0.2, s * 0.108, false);
    ring.rotation.y = 0;
  }
  return g;
}
