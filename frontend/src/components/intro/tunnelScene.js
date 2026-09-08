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
  const charKey = new THREE.PointLight(0xffe8d8, 12, 8, 2);
  charKey.position.set(1.2, 2.2, 5);
  scene.add(charKey);

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

  // ── Stumble-style bean in elegant formal wear ──────────────
  const segs = isMobile ? 12 : 20;
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffc9a8,
    roughness: 0.62,
    metalness: 0.02,
  });
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x12161f,
    roughness: 0.48,
    metalness: 0.28,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xf4f7fb,
    roughness: 0.72,
    metalness: 0.05,
  });
  const accentCloth = new THREE.MeshStandardMaterial({
    color: ICE,
    roughness: 0.4,
    metalness: 0.35,
    emissive: ICE,
    emissiveIntensity: 0.18,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    roughness: 0.35,
    metalness: 0.45,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x1a1410,
    roughness: 0.85,
    metalness: 0.05,
  });
  const pantMat = new THREE.MeshStandardMaterial({
    color: 0x0e1219,
    roughness: 0.55,
    metalness: 0.2,
  });

  const walker = new THREE.Group();
  walker.position.set(0, 0, 3.2);
  walker.scale.setScalar(1.35);

  const root = new THREE.Group();
  root.position.y = 0.42;
  walker.add(root);

  // Bean torso (suit jacket)
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.42, segs, segs), suitMat);
  torso.scale.set(1.05, 1.18, 0.92);
  torso.position.y = 0.55;
  root.add(torso);

  // Soft belly read under jacket
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, segs, segs), shirtMat);
  belly.scale.set(0.95, 0.85, 0.8);
  belly.position.set(0, 0.38, -0.08);
  root.add(belly);

  // Lapel / collar ring
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 8, segs), shirtMat);
  collar.rotation.x = Math.PI / 2.4;
  collar.position.set(0, 0.88, -0.06);
  root.add(collar);

    // Bow / pocket toward exit (-Z)
    const bow = new THREE.Group();
    bow.position.set(0, 0.82, -0.28);
    const bowL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), accentCloth);
    bowL.scale.set(1.4, 0.7, 0.45);
    bowL.position.x = -0.08;
    const bowR = bowL.clone();
    bowR.position.x = 0.08;
    const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), accentCloth);
    bow.add(bowL, bowR, bowKnot);
    root.add(bow);

    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), accentCloth);
    pocket.position.set(0.22, 0.62, -0.28);
    root.add(pocket);

  // Big round head
  const head = new THREE.Group();
  head.position.y = 1.18;
  root.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, segs, segs), skinMat);
  skull.scale.set(1.05, 1.0, 1.0);
  head.add(skull);

  // Soft hair cap (back of head reads from camera)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.355, segs, segs), hairMat);
  hair.scale.set(1.02, 0.72, 1.05);
  hair.position.set(0, 0.12, -0.02);
  head.add(hair);

  // Ears
  const earGeo = new THREE.SphereGeometry(0.07, 10, 10);
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.33, 0.02, 0);
  const earR = earL.clone();
  earR.position.x = 0.33;
  head.add(earL, earR);

  // Face toward walk direction (-Z / exit). Walker is yawed in tick for a cute 3/4 read.
  const face = new THREE.Group();
  face.position.z = -0.3;
  head.add(face);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1f2a, roughness: 0.4, metalness: 0.1 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfff8f2, roughness: 0.55, metalness: 0 });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xff8fa3,
    roughness: 0.7,
    metalness: 0,
    transparent: true,
    opacity: 0.55,
  });

  function makeEye(x) {
    const g = new THREE.Group();
    g.position.set(x, 0.04, 0);
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), eyeWhite);
    white.scale.set(1, 1.15, 0.55);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), eyeMat);
    pupil.position.set(0.01, 0.01, -0.04);
    const shine = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    shine.position.set(-0.02, 0.03, -0.07);
    g.add(white, pupil, shine);
    return g;
  }
  face.add(makeEye(-0.11), makeEye(0.11));

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), skinMat);
  nose.position.set(0, -0.04, -0.06);
  face.add(nose);

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 16, Math.PI), eyeMat);
  smile.rotation.set(-0.2, Math.PI, 0);
  smile.position.set(0, -0.12, -0.04);
  face.add(smile);

  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), cheekMat);
  cheekL.position.set(-0.2, -0.06, -0.02);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.2;
  face.add(cheekL, cheekR);

  function makeStubbyLimb(opts) {
    const { len, radius, mat, handMat, handScale = 1 } = opts;
    const g = new THREE.Group();
    const bone = new THREE.Mesh(new THREE.CapsuleGeometry(radius, len, 4, segs), mat);
    bone.position.y = -len / 2 - radius * 0.2;
    g.add(bone);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.35 * handScale, 12, 12), handMat);
    hand.position.y = -len - radius * 1.1;
    g.add(hand);
    return { group: g, bone, hand };
  }

  // Short stubby legs + dress shoes
  const legL = makeStubbyLimb({ len: 0.22, radius: 0.1, mat: pantMat, handMat: shoeMat, handScale: 1.15 });
  const legR = makeStubbyLimb({ len: 0.22, radius: 0.1, mat: pantMat, handMat: shoeMat, handScale: 1.15 });
  legL.group.position.set(-0.16, 0.28, 0);
  legR.group.position.set(0.16, 0.28, 0);
  // Flatten shoes a bit
  legL.hand.scale.set(1.25, 0.7, 1.45);
  legR.hand.scale.set(1.25, 0.7, 1.45);
  root.add(legL.group, legR.group);

  // Arms + white gloves
  const armL = makeStubbyLimb({ len: 0.2, radius: 0.09, mat: suitMat, handMat: shirtMat, handScale: 1.2 });
  const armR = makeStubbyLimb({ len: 0.2, radius: 0.09, mat: suitMat, handMat: shirtMat, handScale: 1.2 });
  armL.group.position.set(-0.4, 0.72, 0);
  armR.group.position.set(0.4, 0.72, 0);
  armL.group.rotation.z = 0.35;
  armR.group.rotation.z = -0.35;
  root.add(armL.group, armR.group);

  scene.add(walker);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 28),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.42,
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
    // Stumble-style: exaggerated bob, lean, stubby limb flop
    const swing = Math.sin(phase) * 0.85;
    const swingOpp = Math.sin(phase + Math.PI) * 0.85;
    const bob = Math.abs(Math.sin(phase));
    const lean = Math.sin(phase) * 0.14;

    legL.group.rotation.x = swing;
    legR.group.rotation.x = swingOpp;
    legL.group.rotation.z = 0.08 + Math.sin(phase) * 0.06;
    legR.group.rotation.z = -0.08 + Math.sin(phase + Math.PI) * 0.06;

    armL.group.rotation.x = swingOpp * 0.95;
    armR.group.rotation.x = swing * 0.95;
    armL.group.rotation.z = 0.35 + Math.sin(phase * 2) * 0.12;
    armR.group.rotation.z = -0.35 - Math.sin(phase * 2) * 0.12;

    root.rotation.z = lean;
    root.rotation.x = Math.sin(phase * 2) * 0.06;
    root.rotation.y = Math.sin(phase) * 0.18;

    torso.scale.set(1.05 + bob * 0.04, 1.18 - bob * 0.06, 0.92 + bob * 0.03);
    head.rotation.z = -lean * 0.8;
    head.rotation.x = Math.sin(phase * 2) * 0.08;
    head.position.y = 1.18 + bob * 0.04;

    bow.rotation.z = Math.sin(phase) * 0.15;

    walker.position.y = bob * 0.085;
    shadow.scale.set(1.15 - bob * 0.2, 1.15 - bob * 0.2, 1);
    shadow.material.opacity = 0.32 + (1 - bob) * 0.18;
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
    camera.lookAt(0.15, 1.05, camZ - 6.2);

    const walkerZ = camZ - 3.55 - ease * 1.2;
    walker.position.z = walkerZ;
    // 3/4 view so the cute face + bow tie read clearly
    walker.rotation.y = 0.42 + Math.sin(t * 0.55) * 0.04;

    floorGlow.position.z = walkerZ + 0.5;
    floorGlow.intensity = 6 + ease * 10;
    charKey.position.set(walker.position.x + 1.1, 2.1, walkerZ + 1.4);
    charKey.intensity = 10 + ease * 6;

    // Snappier stumble cadence while scrolling; soft idle bounce otherwise
    const moving = Math.abs(delta) > 0.00015;
    walkPhase += moving ? 0.14 + Math.abs(delta) * 36 : 0.045;
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
