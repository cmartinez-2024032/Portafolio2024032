import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createEditor, createPreview } from "./screens.js";
import {
  RED,
  glow,
  makeChair,
  makeCurvedMonitor,
  makeDesk,
  makeHeadphones,
  makeHexPanels,
  makeKeyboard,
  makeMug,
  makePC,
  makeVerticalMonitor,
} from "./props.js";

const ASSETS = "/room";
const ROOM = { w: 5, d: 4.5, h: 2.7 };
const BACK = -ROOM.d / 2;
const RIGHT = ROOM.w / 2;
const WIN = { z0: -1.75, z1: -0.45, y0: 0.9, y1: 2.2 };
const MODELS = [
  "wooden_bookshelf_worn",
  "book_encyclopedia_set_01",
  "Sofa_01",
  "coffee_table_round_01",
  "potted_plant_02",
  "potted_plant_04",
  "hanging_picture_frame_02",
  "ceramic_vase_01",
];

let rectLightsReady = false;

/**
 * Night-time gamer room the camera walks through, ending inside the main monitor.
 * `setProgress` takes the target (0 → 1); the camera eases toward it every frame and
 * `onFrame` reports where it actually is.
 */
export function createRoomScene(canvas, { content, onLoadProgress, onFrame }) {
  if (!rectLightsReady) {
    RectAreaLightUniformsLib.init();
    rectLightsReady = true;
  }
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050506);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.07;

  const camera = new THREE.PerspectiveCamera(50, 1, 0.03, 60);

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_url, loaded, total) => onLoadProgress?.(total ? loaded / total : 0);
  const texLoader = new THREE.TextureLoader(manager);
  const gltfLoader = new GLTFLoader(manager);

  function pbr(id, repeat, extra = {}) {
    const load = (map, color) => {
      const t = texLoader.load(`${ASSETS}/textures/${id}/${map}.jpg`);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.anisotropy = 8;
      if (color) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    return new THREE.MeshStandardMaterial({
      map: load("Diffuse", true),
      normalMap: load("nor_gl"),
      roughnessMap: load("Rough"),
      ...extra,
    });
  }

  // Box/plane UVs run 0..1 per face; scaling them to meters keeps textures at a real size.
  function metricUV(geometry, w, h) {
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
    return geometry;
  }

  function mesh(geo, mat, x = 0, y = 0, z = 0, { cast = true, receive = true } = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = receive;
    scene.add(m);
    return m;
  }

  function rectLight(color, intensity, w, h, pos, look) {
    const l = new THREE.RectAreaLight(color, intensity, w, h);
    l.position.copy(pos);
    l.lookAt(look);
    scene.add(l);
    return l;
  }
  const v = (x, y, z) => new THREE.Vector3(x, y, z);

  // ── Room shell ──────────────────────────────────────────
  const wallMat = pbr("beige_wall_001", 0.45, { color: 0x5d6066, shadowSide: THREE.DoubleSide });
  const floorMat = pbr("wood_floor", 0.55, { color: 0x6b5a4c });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1a1b1d, roughness: 0.5 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x3d3f44, roughness: 0.95 });

  const floor = mesh(metricUV(new THREE.PlaneGeometry(ROOM.w, ROOM.d), ROOM.w, ROOM.d), floorMat, 0, 0, 0, { cast: false });
  floor.rotation.x = -Math.PI / 2;
  const ceiling = mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), ceilingMat, 0, ROOM.h, 0);
  ceiling.rotation.x = Math.PI / 2;

  const wall = (width, x, z, ry) => {
    const m = mesh(metricUV(new THREE.PlaneGeometry(width, ROOM.h), width, ROOM.h), wallMat, x, ROOM.h / 2, z);
    m.rotation.y = ry;
  };
  wall(ROOM.w, 0, BACK, 0);
  wall(ROOM.d, -RIGHT, 0, Math.PI / 2);
  wall(ROOM.w, 0, ROOM.d / 2, Math.PI);

  // Right wall with a window. Local +x runs along world +z once rotated.
  const rightShape = new THREE.Shape();
  rightShape.moveTo(-ROOM.d / 2, 0);
  rightShape.lineTo(ROOM.d / 2, 0);
  rightShape.lineTo(ROOM.d / 2, ROOM.h);
  rightShape.lineTo(-ROOM.d / 2, ROOM.h);
  rightShape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(WIN.z0, WIN.y0);
  hole.lineTo(WIN.z0, WIN.y1);
  hole.lineTo(WIN.z1, WIN.y1);
  hole.lineTo(WIN.z1, WIN.y0);
  hole.closePath();
  rightShape.holes.push(hole);
  const rightWall = mesh(new THREE.ShapeGeometry(rightShape), wallMat, RIGHT, 0, 0);
  rightWall.rotation.y = -Math.PI / 2;

  mesh(new THREE.BoxGeometry(ROOM.w, 0.08, 0.015), trimMat, 0, 0.04, BACK + 0.008);
  mesh(new THREE.BoxGeometry(0.015, 0.08, ROOM.d), trimMat, -RIGHT + 0.008, 0.04, 0);
  mesh(new THREE.BoxGeometry(0.015, 0.08, ROOM.d), trimMat, RIGHT - 0.008, 0.04, 0);

  // Window reveal, frame and half-drawn blinds.
  const DEPTH = 0.2;
  const winW = WIN.z1 - WIN.z0;
  const winH = WIN.y1 - WIN.y0;
  const wz = (WIN.z0 + WIN.z1) / 2;
  const wy = (WIN.y0 + WIN.y1) / 2;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.4 });
  mesh(new THREE.BoxGeometry(DEPTH + 0.06, 0.03, winW + 0.02), trimMat, RIGHT + DEPTH / 2 - 0.03, WIN.y0 - 0.015, wz);
  mesh(new THREE.BoxGeometry(DEPTH, 0.02, winW), wallMat, RIGHT + DEPTH / 2, WIN.y1 + 0.01, wz);
  mesh(new THREE.BoxGeometry(DEPTH, winH, 0.02), wallMat, RIGHT + DEPTH / 2, wy, WIN.z0 - 0.01);
  mesh(new THREE.BoxGeometry(DEPTH, winH, 0.02), wallMat, RIGHT + DEPTH / 2, wy, WIN.z1 + 0.01);
  const fx = RIGHT + DEPTH - 0.04;
  mesh(new THREE.BoxGeometry(0.06, 0.05, winW), frameMat, fx, WIN.y0 + 0.025, wz);
  mesh(new THREE.BoxGeometry(0.06, 0.05, winW), frameMat, fx, WIN.y1 - 0.025, wz);
  mesh(new THREE.BoxGeometry(0.06, winH, 0.05), frameMat, fx, wy, WIN.z0 + 0.025);
  mesh(new THREE.BoxGeometry(0.06, winH, 0.05), frameMat, fx, wy, WIN.z1 - 0.025);
  mesh(new THREE.BoxGeometry(0.06, winH, 0.04), frameMat, fx, wy, wz);

  const SLAT_GAP = 0.042;
  const slatCount = Math.floor((winH * 0.55) / SLAT_GAP);
  const slats = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 0.004, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x2a2b2e, roughness: 0.5, side: THREE.DoubleSide }),
    slatCount
  );
  slats.castShadow = true;
  slats.receiveShadow = true;
  const tmp = new THREE.Object3D();
  for (let i = 0; i < slatCount; i++) {
    tmp.position.set(RIGHT - 0.03, WIN.y1 - 0.07 - i * SLAT_GAP, wz);
    tmp.rotation.set(-0.5, Math.PI / 2, 0, "YXZ");
    tmp.scale.set(winW - 0.04, 1, 1);
    tmp.updateMatrix();
    slats.setMatrixAt(i, tmp.matrix);
  }
  scene.add(slats);
  mesh(new THREE.BoxGeometry(0.05, 0.035, winW - 0.02), frameMat, RIGHT - 0.03, WIN.y1 - 0.03, wz);

  const outside = mesh(
    new THREE.PlaneGeometry(14, 7),
    new THREE.MeshBasicMaterial({ map: nightTexture() }),
    RIGHT + 6,
    1.8,
    -0.5,
    { cast: false, receive: false }
  );
  outside.rotation.y = -Math.PI / 2;

  // ── Light ───────────────────────────────────────────────
  const moon = new THREE.DirectionalLight(0x9db2ff, 2.6);
  moon.position.set(RIGHT + 6, 4.6, 0.3);
  moon.target.position.set(-0.8, 0, -1.4);
  moon.castShadow = true;
  moon.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 2, far: 20 });
  moon.shadow.bias = -0.0004;
  moon.shadow.normalBias = 0.025;
  moon.shadow.radius = 2;
  scene.add(moon, moon.target);
  rectLight(0x8ea0d8, 0.9, winW, winH, v(RIGHT - 0.02, wy, wz), v(0, wy, wz));
  scene.add(new THREE.HemisphereLight(0x5a6890, 0x120c0c, 0.2));

  // ── Desk setup ──────────────────────────────────────────
  const desk = makeDesk();
  const deskZ = BACK + 0.4;
  desk.position.set(0, 0, deskZ);
  scene.add(desk);
  const top = desk.userData.top;

  const editor = createEditor(content);
  const preview = createPreview(content);

  const main = makeCurvedMonitor(preview);
  main.position.set(-0.12, top, deskZ - 0.12);
  scene.add(main);
  const side = makeVerticalMonitor(editor);
  side.position.set(-0.68, top, deskZ - 0.05);
  side.rotation.y = 0.5;
  scene.add(side);

  const keyboard = makeKeyboard();
  keyboard.position.set(-0.14, top, deskZ + 0.16);
  const pc = makePC();
  pc.position.set(0.56, top, deskZ - 0.2);
  const mug = makeMug();
  mug.position.set(0.3, top, deskZ + 0.22);
  const headphones = makeHeadphones();
  headphones.position.set(0.66, top, deskZ + 0.22);
  headphones.rotation.y = -0.4;
  const chair = makeChair();
  chair.position.set(-1.0, 0, deskZ + 0.85);
  chair.rotation.y = 0.7;
  const hex = makeHexPanels();
  hex.position.set(-0.12, 1.88, BACK);
  scene.add(keyboard, pc, mug, headphones, chair, hex);

  // LED strips: wall wash behind the desk, under the desk, the hex cluster and a ceiling cove.
  rectLight(RED, 14, 1.5, 0.08, v(0, top + 0.02, BACK + 0.2), v(0, top + 0.5, BACK));
  rectLight(RED, 4, 1.4, 0.05, v(0, top - 0.04, deskZ + 0.3), v(0, 0, deskZ + 0.45));
  rectLight(RED, 2.2, 1.1, 0.5, v(-0.12, 1.88, BACK + 0.03), v(-0.12, 1.6, 0));
  rectLight(0xdfe4f2, 1.6, ROOM.w - 0.2, 0.05, v(0, ROOM.h - 0.06, BACK + 0.06), v(0, ROOM.h, 0.6));
  mesh(new THREE.BoxGeometry(ROOM.w - 0.2, 0.012, 0.012), glow(0xdfe4f2, 0.9), 0, ROOM.h - 0.07, BACK + 0.05, { cast: false });
  mesh(new THREE.BoxGeometry(ROOM.w - 0.2, 0.04, 0.05), trimMat, 0, ROOM.h - 0.1, BACK + 0.04);
  rectLight(0xb4c2ff, 1.4, 0.72, 0.45, v(-0.12, top + 0.42, deskZ - 0.1), v(-0.12, top + 0.2, deskZ + 1.5));

  const rugTex = rugTexture();
  const rug = mesh(
    new THREE.CircleGeometry(1.05, 64),
    new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1, bumpMap: rugTex, bumpScale: 2 }),
    0.05,
    0.006,
    deskZ + 1.0,
    { cast: false }
  );
  rug.rotation.x = -Math.PI / 2;

  // ── Post-processing ─────────────────────────────────────
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: small ? 0 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  let gtao = null;
  if (!small) {
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.3, distanceExponent: 1.5, thickness: 1.5, scale: 1.1, samples: 16 });
    gtao.blendIntensity = 0.8;
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.25, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ── Camera path ─────────────────────────────────────────
  const { panel } = main.userData;
  main.updateMatrixWorld(true);
  const screenCenter = panel.getWorldPosition(new THREE.Vector3());
  const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(panel.getWorldQuaternion(new THREE.Quaternion()));
  let posCurve;
  let lookCurve;

  function fillDistance() {
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const { W, H } = main.userData;
    const fitWidth = W / 2 / Math.tan(hfov / 2);
    // Portrait screens fit the monitor's width so its text stays readable.
    if (camera.aspect < 1) return fitWidth * 1.04;
    return Math.min(fitWidth, H / 2 / Math.tan(vfov / 2)) * 0.97;
  }

  function buildPath() {
    const back = camera.aspect < 1 ? 1 : 0;
    const front = screenCenter.clone().addScaledVector(screenNormal, fillDistance());
    posCurve = new THREE.CatmullRomCurve3(
      [
        v(1.75, 1.6, 1.95 + back * 0.1),
        v(0.2, 1.5, 1.1 + back * 0.3),
        v(1.2, 1.35, 0.4 + back * 0.4),
        v(0.95, 1.12, deskZ + 0.85 + back * 0.3),
        v(-0.12, 1.2, deskZ + 1.0 + back * 0.25),
        front,
      ],
      false,
      "centripetal"
    );
    lookCurve = new THREE.CatmullRomCurve3(
      [
        v(-0.7, 1.1, -1.2),
        v(2.5, 1.2, -1.1),
        v(0.2, 1.0, BACK),
        v(0.5, top + 0.22, deskZ - 0.2),
        v(-0.12, top + 0.38, deskZ - 0.1),
        screenCenter.clone(),
      ],
      false,
      "centripetal"
    );
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 64 : 50;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    gtao?.setSize(w, h);
    bloom.setSize(w, h);
    buildPath();
  }
  resize();
  window.addEventListener("resize", resize);

  // ── Loop ────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const sway = new THREE.Vector3();
  const segment = (p, a, b) => THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
  const fans = pc.userData.fans;
  let goal = 0;
  let current = 0;
  let disposed = false;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    current = THREE.MathUtils.damp(current, goal, 3.2, dt);
    if (Math.abs(goal - current) < 0.0005) current = goal;
    const k = THREE.MathUtils.smoothstep(current, 0, 1);
    posCurve.getPoint(k, pos);
    lookCurve.getPoint(k, look);
    // Handheld drift fades out as the camera reaches the screen.
    const drift = 1 - segment(current, 0.75, 0.95);
    sway.set(Math.sin(t * 0.5) * 0.02, Math.sin(t * 0.7 + 1) * 0.012, 0).multiplyScalar(drift);
    camera.position.copy(pos).add(sway);
    camera.lookAt(look);

    for (const rotor of fans) rotor.rotation.x += dt * 14;
    editor.draw(0.12 + 0.88 * segment(current, 0.2, 0.72), t);
    preview.draw(0.3 + 0.7 * segment(current, 0.45, 0.88), t);
    composer.render();
    onFrame?.(current);
  }

  // Furniture from Poly Haven (CC0). The room renders once everything has arrived.
  const ready = (async () => {
    const entries = await Promise.all(
      MODELS.map(async (id) => [id, prepare((await gltfLoader.loadAsync(`${ASSETS}/models/${id}/${id}.gltf`)).scene)])
    );
    if (disposed) return;
    furnish(Object.fromEntries(entries));
    renderer.setAnimationLoop(frame);
  })();

  function place(obj, { x = 0, y = 0, z = 0, ry = 0 }) {
    obj.rotation.y = ry;
    obj.position.set(0, 0, 0);
    obj.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(obj);
    const c = b.getCenter(new THREE.Vector3());
    obj.position.set(x - c.x, y - b.min.y, z - c.z);
    scene.add(obj);
    obj.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(obj);
  }

  function furnish(models) {
    const shelfModel = models.wooden_bookshelf_worn;
    shelfModel.traverse((o) => o.isMesh && o.material.color.set(0x5a5550));
    const shelf = place(shelfModel, { x: -2.2, z: -1.1, ry: Math.PI / 2 });
    shelfModel.position.x += -RIGHT + 0.01 - shelf.min.x;
    shelfModel.updateMatrixWorld(true);
    const shelfBox = new THREE.Box3().setFromObject(shelfModel);
    const boards = shelvesOf(shelfModel, shelfBox);
    const shelfCenter = shelfBox.getCenter(new THREE.Vector3());
    if (boards.length > 4) {
      [1, 3].forEach((board, i) => {
        const books = i === 0 ? models.book_encyclopedia_set_01 : models.book_encyclopedia_set_01.clone();
        place(books, { x: shelfCenter.x + 0.02, y: boards[board], z: shelfCenter.z + (i ? 0.12 : -0.1), ry: Math.PI / 2 });
      });
      place(models.ceramic_vase_01, { x: shelfCenter.x, y: boards[2], z: shelfCenter.z + 0.15 });
      place(models.potted_plant_04, { x: shelfCenter.x, y: boards[4], z: shelfCenter.z - 0.1 });
      const stripMat = glow(RED, 3);
      for (const y of boards.slice(1, 5)) {
        mesh(new THREE.BoxGeometry(0.01, 0.006, shelfBox.max.z - shelfBox.min.z - 0.2), stripMat, shelfBox.max.x - 0.03, y - 0.03, shelfCenter.z, {
          cast: false,
        });
      }
    }
    const shelfGlow = new THREE.PointLight(RED, 0.8, 2.2, 2);
    shelfGlow.position.set(shelfBox.max.x + 0.15, 1.2, shelfCenter.z);
    scene.add(shelfGlow);

    const sofa = place(models.Sofa_01, { x: -2.0, z: 1.0, ry: Math.PI / 2 });
    models.Sofa_01.position.x += -RIGHT + 0.03 - sofa.min.x;
    models.coffee_table_round_01.traverse((o) => o.isMesh && o.material.color.set(0x3a3a3c));
    const table = place(models.coffee_table_round_01, { x: -1.15, z: 1.0 });
    place(models.ceramic_vase_01.clone(), { x: -1.15, y: table.max.y, z: 0.95 });
    place(models.potted_plant_02, { x: 2.1, z: BACK + 0.35 });
    const frameModel = models.hanging_picture_frame_02;
    const frameBox = place(frameModel, { x: -2.4, y: 1.35, z: 1.0, ry: Math.PI / 2 });
    frameModel.position.x += -RIGHT + 0.01 - frameBox.min.x;
  }

  return {
    ready,
    setProgress(p) {
      goal = THREE.MathUtils.clamp(p, 0, 1);
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      const textures = new Set();
      scene.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry?.dispose();
        for (const m of [].concat(o.material)) {
          for (const value of Object.values(m)) if (value?.isTexture) textures.add(value);
          m.dispose();
        }
      });
      textures.forEach((t) => t.dispose());
      editor.texture.dispose();
      preview.texture.dispose();
      envTarget.dispose();
      pmrem.dispose();
      composer.dispose();
      gtao?.dispose();
      bloom.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

function prepare(root) {
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return root;
}

// Heights of the shelf boards, found by casting rays down through the middle.
function shelvesOf(obj, box) {
  const ray = new THREE.Raycaster();
  const c = box.getCenter(new THREE.Vector3());
  const heights = [];
  let y = box.max.y - 0.03;
  for (let i = 0; i < 12 && y > 0.05; i++) {
    ray.set(new THREE.Vector3(c.x, y, c.z), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObject(obj, true)[0];
    if (!hit) break;
    heights.push(hit.point.y);
    y = hit.point.y - 0.05;
  }
  return heights;
}

// City at night behind the glass.
function nightTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, "#04060c");
  sky.addColorStop(0.6, "#0b1222");
  sky.addColorStop(1, "#141a28");
  g.fillStyle = sky;
  g.fillRect(0, 0, 1024, 512);
  for (let x = 0; x < 1024; ) {
    const w = 40 + Math.random() * 90;
    const h = 120 + Math.random() * 260;
    g.fillStyle = "#06080d";
    g.fillRect(x, 512 - h, w, h);
    for (let wy = 512 - h + 10; wy < 500; wy += 14) {
      for (let wx = x + 6; wx < x + w - 8; wx += 12) {
        if (Math.random() < 0.18) {
          g.fillStyle = Math.random() < 0.85 ? "#f3e7c4" : "#d84a4a";
          g.fillRect(wx, wy, 5, 7);
        }
      }
    }
    x += w + 6;
  }
  g.filter = "blur(3px)";
  g.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function rugTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#1a1a1c";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) {
    const shade = 18 + Math.random() * 30;
    g.fillStyle = `rgb(${shade},${shade},${shade + 2})`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
