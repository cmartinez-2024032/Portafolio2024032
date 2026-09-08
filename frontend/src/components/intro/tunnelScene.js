import * as THREE from "three";

const ICE = 0x6aa8ff;
const ICE_SOFT = 0x9ec5ff;
const VOID = 0x050608;

/**
 * Architectural light tunnel + walking silhouette.
 * Progress 0..1 drives camera travel and walk cycle (scroll/touch).
 */
export function createTunnelScene(canvas) {
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(VOID, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050608, 0.038);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
  camera.position.set(0, 1.62, 8);

  const amb = new THREE.AmbientLight(0x152033, 0.5);
  scene.add(amb);
  const key = new THREE.PointLight(ICE_SOFT, 48, 70, 2);
  key.position.set(0, 2.4, -44);
  scene.add(key);
  const rim = new THREE.DirectionalLight(ICE, 1.15);
  rim.position.set(-2.2, 3.5, 5);
  scene.add(rim);
  const floorGlow = new THREE.PointLight(ICE, 8, 18, 2);
  floorGlow.position.set(0, 0.4, 4);
  scene.add(floorGlow);

  const TUNNEL_LEN = 56;
  const HALF_W = 2.2;
  const HALF_H = 2.45;

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x090b0f,
    roughness: 0.94,
    metalness: 0.06,
  });
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x06080b,
    roughness: 0.82,
    metalness: 0.18,
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, TUNNEL_LEN), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -TUNNEL_LEN / 2);
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, TUNNEL_LEN), wallMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, HALF_H * 2, -TUNNEL_LEN / 2);
  scene.add(ceiling);

  const left = new THREE.Mesh(new THREE.PlaneGeometry(TUNNEL_LEN, HALF_H * 2), wallMat);
  left.rotation.y = Math.PI / 2;
  left.position.set(-HALF_W, HALF_H, -TUNNEL_LEN / 2);
  scene.add(left);

  const right = new THREE.Mesh(new THREE.PlaneGeometry(TUNNEL_LEN, HALF_H * 2), wallMat);
  right.rotation.y = -Math.PI / 2;
  right.position.set(HALF_W, HALF_H, -TUNNEL_LEN / 2);
  scene.add(right);

  // Corner light strips
  const stripMat = new THREE.MeshBasicMaterial({
    color: ICE,
    transparent: true,
    opacity: 0.78,
  });
  const stripGeo = new THREE.BoxGeometry(0.028, 0.028, TUNNEL_LEN);
  const stripPositions = [
    [-HALF_W + 0.04, 0.03, -TUNNEL_LEN / 2],
    [HALF_W - 0.04, 0.03, -TUNNEL_LEN / 2],
    [-HALF_W + 0.04, HALF_H * 2 - 0.03, -TUNNEL_LEN / 2],
    [HALF_W - 0.04, HALF_H * 2 - 0.03, -TUNNEL_LEN / 2],
  ];
  for (const [x, y, z] of stripPositions) {
    const s = new THREE.Mesh(stripGeo, stripMat);
    s.position.set(x, y, z);
    scene.add(s);
  }

  // Center floor runner
  const runner = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.012, TUNNEL_LEN),
    new THREE.MeshBasicMaterial({ color: ICE, transparent: true, opacity: 0.35 }),
  );
  runner.position.set(0, 0.01, -TUNNEL_LEN / 2);
  scene.add(runner);

  // Soft wall light panels
  const panelMat = new THREE.MeshBasicMaterial({
    color: ICE_SOFT,
    transparent: true,
    opacity: 0.06,
  });
  const panelCount = isMobile ? 6 : 12;
  for (let i = 0; i < panelCount; i++) {
    const z = -3 - i * (TUNNEL_LEN / panelCount);
    for (const side of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.35), panelMat);
      p.position.set(side * (HALF_W - 0.02), HALF_H * 0.95, z);
      p.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      scene.add(p);
    }
  }

  // Architectural ribs
  const ribCount = isMobile ? 12 : 20;
  const ribMat = new THREE.MeshBasicMaterial({
    color: ICE_SOFT,
    transparent: true,
    opacity: 0.18,
  });
  for (let i = 0; i < ribCount; i++) {
    const z = -1.5 - i * (TUNNEL_LEN / ribCount);
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(HALF_W * 2 - 0.16, 0.018, 0.018), ribMat);
    top.position.y = HALF_H * 2 - 0.12;
    const bot = top.clone();
    bot.position.y = 0.1;
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.018, HALF_H * 2 - 0.26, 0.018), ribMat);
    l.position.set(-HALF_W + 0.1, HALF_H, 0);
    const r = l.clone();
    r.position.x = HALF_W - 0.1;
    g.add(top, bot, l, r);
    g.position.z = z;
    scene.add(g);
  }

  // Exit aperture — layered glow
  const exitGroup = new THREE.Group();
  exitGroup.position.set(0, HALF_H, -TUNNEL_LEN + 1.4);
  scene.add(exitGroup);

  const exitMat = new THREE.MeshBasicMaterial({
    color: 0xf2f7ff,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const exit = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 1.55, HALF_H * 1.55), exitMat);
  exitGroup.add(exit);

  const exitHalo = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_W * 2.2, HALF_H * 2.2),
    new THREE.MeshBasicMaterial({
      color: ICE_SOFT,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  exitHalo.position.z = 0.04;
  exitGroup.add(exitHalo);

  const exitBloom = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF_W * 3.4, HALF_H * 3.4),
    new THREE.MeshBasicMaterial({
      color: ICE,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  exitBloom.position.z = 0.08;
  exitGroup.add(exitBloom);

  // Dust motes
  const DUST = isMobile ? 70 : 160;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * HALF_W * 1.55;
    dustPos[i * 3 + 1] = 0.25 + Math.random() * (HALF_H * 1.75);
    dustPos[i * 3 + 2] = -Math.random() * TUNNEL_LEN;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: ICE_SOFT,
    size: isMobile ? 0.032 : 0.026,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ── Walker silhouette (viewed from behind) ─────────────────
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x05060a,
    roughness: 0.8,
    metalness: 0.22,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x0c1018,
    roughness: 0.5,
    metalness: 0.4,
    emissive: ICE,
    emissiveIntensity: 0.12,
  });

  const walker = new THREE.Group();
  walker.position.set(0, 0, 3.2);

  const hips = new THREE.Group();
  hips.position.y = 0.95;
  walker.add(hips);

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.2, 0.52, 6, isMobile ? 8 : 12),
    bodyMat,
  );
  torso.position.y = 0.42;
  hips.add(torso);

  // Shoulder bar for silhouette read
  const shoulders = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.06, 0.42, 4, 8),
    bodyMat,
  );
  shoulders.rotation.z = Math.PI / 2;
  shoulders.position.y = 0.72;
  hips.add(shoulders);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, isMobile ? 10 : 16, isMobile ? 10 : 16),
    accentMat,
  );
  head.position.y = 0.92;
  hips.add(head);

  function makeLimb(len, radius = 0.07) {
    const g = new THREE.Group();
    const bone = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, len, 4, isMobile ? 6 : 10),
      bodyMat,
    );
    bone.position.y = -len / 2 - radius;
    g.add(bone);
    return g;
  }

  const thighL = makeLimb(0.36, 0.07);
  const thighR = makeLimb(0.36, 0.07);
  thighL.position.set(-0.11, 0, 0);
  thighR.position.set(0.11, 0, 0);
  hips.add(thighL, thighR);

  const shinL = makeLimb(0.34, 0.055);
  const shinR = makeLimb(0.34, 0.055);
  shinL.position.y = -0.4;
  shinR.position.y = -0.4;
  thighL.add(shinL);
  thighR.add(shinR);

  const armL = makeLimb(0.32, 0.05);
  const armR = makeLimb(0.32, 0.05);
  armL.position.set(-0.28, 0.68, 0);
  armR.position.set(0.28, 0.68, 0);
  hips.add(armL, armR);

  const foreL = makeLimb(0.28, 0.042);
  const foreR = makeLimb(0.28, 0.042);
  foreL.position.y = -0.34;
  foreR.position.y = -0.34;
  armL.add(foreL);
  armR.add(foreR);

  scene.add(walker);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;
  walker.add(shadow);

  let progress = 0;
  let targetProgress = 0;
  let raf = 0;
  let disposed = false;
  let t = 0;
  let walkPhase = 0;

  function setWalk(phase) {
    const swing = Math.sin(phase) * 0.58;
    const swingOpp = Math.sin(phase + Math.PI) * 0.58;
    const knee = Math.max(0, -Math.sin(phase)) * 0.75;
    const kneeOpp = Math.max(0, -Math.sin(phase + Math.PI)) * 0.75;

    thighL.rotation.x = swing;
    thighR.rotation.x = swingOpp;
    shinL.rotation.x = knee;
    shinR.rotation.x = kneeOpp;

    armL.rotation.x = swingOpp * 0.72;
    armR.rotation.x = swing * 0.72;
    foreL.rotation.x = -0.28 + Math.max(0, swingOpp) * 0.38;
    foreR.rotation.x = -0.28 + Math.max(0, swing) * 0.38;

    hips.rotation.y = Math.sin(phase) * 0.05;
    torso.rotation.x = Math.sin(phase * 2) * 0.025;
    head.rotation.y = Math.sin(phase) * 0.07;
    walker.position.y = Math.abs(Math.sin(phase)) * 0.032;
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }

  function setProgress(value) {
    targetProgress = Math.max(0, Math.min(1, value));
  }

  function getProgress() {
    return progress;
  }

  function tick() {
    if (disposed) return;
    raf = requestAnimationFrame(tick);
    t += 0.016;

    const prev = progress;
    progress += (targetProgress - progress) * 0.085;
    const delta = progress - prev;

    const ease = progress * progress * (3 - 2 * progress);
    const camZ = 8.2 - ease * (TUNNEL_LEN - 7.2);
    camera.position.z = camZ;
    camera.position.y = 1.58 + Math.sin(t * 0.65) * 0.018 * (1 - ease);
    camera.position.x = Math.sin(t * 0.32) * 0.025 * (1 - ease * 0.85);
    // Look slightly above walker so silhouette sits in lower third
    camera.lookAt(0, 1.15, camZ - 7.5);

    const walkerZ = camZ - 4.0 - ease * 1.4;
    walker.position.z = walkerZ;
    walker.rotation.y = 0;

    floorGlow.position.z = walkerZ + 0.5;
    floorGlow.intensity = 6 + ease * 10;

    walkPhase += Math.max(0.018, Math.abs(delta) * 30) + (Math.abs(delta) > 0.0002 ? 0.09 : 0.018);
    setWalk(walkPhase);

    const near = smoothstep(0.52, 0.98, progress);
    exitMat.opacity = 0.72 + near * 0.28;
    exitHalo.material.opacity = 0.18 + near * 0.42;
    exitBloom.material.opacity = 0.06 + near * 0.28;
    key.intensity = 40 + near * 70;
    stripMat.opacity = 0.5 + near * 0.45;
    runner.material.opacity = 0.22 + near * 0.45;

    const dp = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      dp[i * 3 + 2] += 0.012 + progress * 0.028;
      if (dp[i * 3 + 2] > camera.position.z + 2) dp[i * 3 + 2] -= TUNNEL_LEN;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dustMat.opacity = 0.32 + (1 - near) * 0.28;

    renderer.toneMappingExposure = 1.02 + near * 0.62;
    renderer.render(scene, camera);
  }

  function smoothstep(a, b, x) {
    const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  }

  function start() {
    resize();
    setWalk(0);
    if (!prefersReduced) tick();
    else {
      progress = targetProgress;
      camera.position.z = 8.2 - progress * (TUNNEL_LEN - 7.2);
      renderer.render(scene, camera);
    }
    window.addEventListener("resize", resize);
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
    renderer.dispose();
  }

  return { start, dispose, setProgress, getProgress, resize };
}
