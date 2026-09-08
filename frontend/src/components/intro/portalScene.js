import * as THREE from "three";

const EMBER = 0x6aa8ff;
const EMBER_SOFT = 0x9ec5ff;
const EMBER_DEEP = 0x3b82f6;
const WHITE = 0xf4f1ec;

/**
 * Cinematic WebGL portal: spiral tunnel rings, warp dust, pulsing core,
 * and a camera that dollies + rolls into the forge.
 * Driven by a 0..1 progress value (scroll / wheel / touch).
 */
export function createPortalScene(canvas) {
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lightScene = prefersReduced || isMobile;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x050506, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 0.12, 8.4);

  const root = new THREE.Group();
  scene.add(root);

  // Far nebula shells (layered atmosphere)
  const nebulaCount = lightScene ? 1 : 2;
  const nebulas = [];
  for (let i = 0; i < nebulaCount; i++) {
    const geo = new THREE.SphereGeometry(7.2 + i * 1.6, lightScene ? 20 : 28, lightScene ? 20 : 28);
    const mat = new THREE.MeshBasicMaterial({
      color: i === 0 ? EMBER_DEEP : EMBER,
      transparent: true,
      opacity: i === 0 ? 0.055 : 0.035,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = i * 0.6;
    root.add(mesh);
    nebulas.push({ mesh, mat, base: mat.opacity });
  }

  // Spiral tunnel rings
  const RING_COUNT = lightScene ? 6 : 11;
  const rings = [];
  for (let i = 0; i < RING_COUNT; i++) {
    const t = i / Math.max(RING_COUNT - 1, 1);
    const radius = 0.72 + t * 3.4;
    const tube = 0.012 + (i % 3 === 0 ? 0.018 : 0.008) + t * 0.01;
    const segments = lightScene ? 48 : 96;
    const geo = new THREE.TorusGeometry(radius, tube, lightScene ? 8 : 12, segments);
    const mat = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? EMBER : i % 3 === 1 ? EMBER_SOFT : EMBER_DEEP,
      transparent: true,
      opacity: 0.62 - t * 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geo, mat);
    const spiral = t * Math.PI * 1.35;
    ring.rotation.x = Math.PI / 2.05 + Math.sin(spiral) * 0.12;
    ring.rotation.y = Math.cos(spiral) * 0.08;
    ring.position.z = -i * (lightScene ? 0.95 : 0.78);
    ring.position.x = Math.sin(spiral) * 0.18;
    ring.position.y = Math.cos(spiral * 0.8) * 0.1;
    ring.userData = {
      baseZ: ring.position.z,
      baseX: ring.position.x,
      baseY: ring.position.y,
      spin: (i % 2 === 0 ? 1 : -1) * (0.12 + t * 0.22),
      tilt: (i - RING_COUNT / 2) * 0.035,
      spiral,
      t,
    };
    root.add(ring);
    rings.push(ring);
  }

  // Energy band near the core
  const bandGeo = new THREE.TorusGeometry(0.62, 0.016, 10, lightScene ? 48 : 80);
  const bandMat = new THREE.MeshBasicMaterial({
    color: EMBER_SOFT,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.rotation.x = Math.PI / 2.1;
  root.add(band);

  // Core ember orb + outer halo
  const coreGeo = new THREE.SphereGeometry(0.26, lightScene ? 16 : 28, lightScene ? 16 : 28);
  const coreMat = new THREE.MeshBasicMaterial({
    color: EMBER,
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  root.add(core);

  const coreInnerGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const coreInnerMat = new THREE.MeshBasicMaterial({
    color: WHITE,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const coreInner = new THREE.Mesh(coreInnerGeo, coreInnerMat);
  root.add(coreInner);

  const haloGeo = new THREE.SphereGeometry(0.58, lightScene ? 16 : 24, lightScene ? 16 : 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: EMBER_SOFT,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  root.add(halo);

  // Dust / warp particles along the tunnel
  const COUNT = lightScene ? 90 : 320;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.25 + Math.random() * 3.6;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
    positions[i * 3 + 2] = -Math.random() * 16;
    speeds[i] = 0.35 + Math.random() * 1.55;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: WHITE,
    size: lightScene ? 0.032 : 0.028,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  root.add(dust);

  // Warp streaks (fast radial lines that intensify near the end)
  const STREAK_COUNT = lightScene ? 24 : 56;
  const streakPos = new Float32Array(STREAK_COUNT * 2 * 3);
  const streakSpeeds = new Float32Array(STREAK_COUNT);
  for (let i = 0; i < STREAK_COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.5 + Math.random() * 2.8;
    const z = -Math.random() * 14;
    const len = 0.25 + Math.random() * 0.7;
    streakPos[i * 6] = Math.cos(a) * r;
    streakPos[i * 6 + 1] = Math.sin(a) * r * 0.65;
    streakPos[i * 6 + 2] = z;
    streakPos[i * 6 + 3] = Math.cos(a) * r;
    streakPos[i * 6 + 4] = Math.sin(a) * r * 0.65;
    streakPos[i * 6 + 5] = z + len;
    streakSpeeds[i] = 0.8 + Math.random() * 2.2;
  }
  const streakGeo = new THREE.BufferGeometry();
  streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPos, 3));
  const streakMat = new THREE.LineBasicMaterial({
    color: EMBER_SOFT,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const streaks = new THREE.LineSegments(streakGeo, streakMat);
  root.add(streaks);

  // Outer starfield with varied brightness via scale jitter in animation
  const STAR_COUNT = lightScene ? 70 : 220;
  const starPos = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 36;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
    starPos[i * 3 + 2] = -6 - Math.random() * 40;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: WHITE,
    size: lightScene ? 0.038 : 0.045,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  let progress = 0;
  let targetProgress = 0;
  let raf = 0;
  let disposed = false;
  let t = 0;
  let shake = 0;

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
    progress += (targetProgress - progress) * 0.09;
    const velocity = Math.abs(progress - prev);
    const ease = progress * progress * (3 - 2 * progress); // smoothstep
    const warp = Math.max(0, (progress - 0.55) / 0.45);

    // Camera: dolly + FOV punch + soft roll + end shake
    camera.position.z = 8.4 - ease * 10.2;
    camera.position.y = 0.12 - ease * 0.1 + Math.sin(t * 0.7) * 0.02 * (1 - ease);
    camera.position.x = Math.sin(t * 0.35) * 0.04 * (1 - ease * 0.6);

    const fovTarget = 52 + ease * 18 + warp * 10;
    camera.fov += (fovTarget - camera.fov) * 0.08;
    camera.updateProjectionMatrix();

    camera.rotation.z = ease * 0.12 + Math.sin(t * 0.5) * 0.015;

    if (warp > 0.65) {
      shake = Math.min(0.045, shake + velocity * 1.8);
    } else {
      shake *= 0.9;
    }
    if (shake > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake * 0.7;
    }

    root.rotation.y = t * 0.06 + ease * 0.42;
    root.rotation.x = Math.sin(t * 0.38) * 0.035;

    // Core pulse + energy band
    const pulse = 1 + Math.sin(t * 2.4) * 0.1 + ease * 0.7 + warp * 0.45;
    core.scale.setScalar(pulse);
    coreInner.scale.setScalar(pulse * 0.95);
    coreInnerMat.opacity = 0.55 + Math.sin(t * 3.2) * 0.2 + warp * 0.3;
    halo.scale.setScalar(1.05 + Math.sin(t * 1.7) * 0.12 + ease * 0.95);
    haloMat.opacity = 0.16 + ease * 0.4 + warp * 0.25;

    band.rotation.z += 0.02 + ease * 0.04;
    band.scale.setScalar(1 + ease * 1.8 + Math.sin(t * 2) * 0.05);
    bandMat.opacity = 0.35 + ease * 0.45 + Math.sin(t * 3) * 0.08;

    for (const n of nebulas) {
      n.mesh.rotation.y = t * 0.03;
      n.mat.opacity = n.base + ease * 0.08 + warp * 0.06;
    }

    for (const ring of rings) {
      const ud = ring.userData;
      ring.rotation.z += ud.spin * (0.016 + ease * 0.02);
      ring.rotation.x =
        Math.PI / 2.05 + ud.tilt + Math.sin(t + ud.spiral) * 0.04 + ease * 0.06;
      ring.position.z = ud.baseZ + ease * 5.6;
      ring.position.x = ud.baseX + Math.sin(t * 0.4 + ud.spiral) * 0.04 * (1 - ease);
      ring.position.y = ud.baseY + Math.cos(t * 0.35 + ud.spiral) * 0.03 * (1 - ease);
      ring.material.opacity = Math.max(
        0.06,
        0.68 - ease * 0.4 - ud.t * 0.28 + warp * 0.1,
      );
    }

    // Dust rush
    const pos = dustGeo.attributes.position.array;
    const dustBoost = 0.04 + ease * 0.16 + warp * 0.22;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 2] += dustBoost * speeds[i];
      if (pos[i * 3 + 2] > 2.5) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.25 + Math.random() * 3.6;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
        pos[i * 3 + 2] = -16;
      }
    }
    dustGeo.attributes.position.needsUpdate = true;
    dustMat.opacity = 0.4 + ease * 0.45;
    dustMat.size = (lightScene ? 0.028 : 0.024) + warp * 0.04;

    // Warp streaks kick in mid-tunnel
    const sPos = streakGeo.attributes.position.array;
    const streakBoost = 0.02 + warp * 0.55;
    for (let i = 0; i < STREAK_COUNT; i++) {
      const head = i * 6 + 2;
      const tail = i * 6 + 5;
      sPos[head] += streakBoost * streakSpeeds[i];
      sPos[tail] += streakBoost * streakSpeeds[i];
      if (sPos[head] > 2) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.4 + Math.random() * 2.6;
        const z = -14 - Math.random() * 4;
        const len = 0.2 + Math.random() * (0.4 + warp * 1.2);
        sPos[i * 6] = Math.cos(a) * r;
        sPos[i * 6 + 1] = Math.sin(a) * r * 0.65;
        sPos[head] = z;
        sPos[i * 6 + 3] = Math.cos(a) * r;
        sPos[i * 6 + 4] = Math.sin(a) * r * 0.65;
        sPos[tail] = z + len;
      }
    }
    streakGeo.attributes.position.needsUpdate = true;
    streakMat.opacity = Math.max(0, warp * 0.75 - 0.05);

    stars.rotation.y = t * 0.018 + ease * 0.05;
    stars.rotation.x = Math.sin(t * 0.1) * 0.02;
    starMat.opacity = 0.28 + (1 - ease) * 0.4 + Math.sin(t * 1.2) * 0.04;
    // Subtle twinkle via size
    starMat.size = (lightScene ? 0.036 : 0.042) + Math.sin(t * 2.1) * 0.004;

    renderer.render(scene, camera);
  }

  function start() {
    resize();
    if (!prefersReduced) tick();
    else {
      progress = targetProgress;
      renderer.render(scene, camera);
    }
    window.addEventListener("resize", resize);
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    for (const n of nebulas) {
      n.mesh.geometry.dispose();
      n.mat.dispose();
    }
    bandGeo.dispose();
    bandMat.dispose();
    coreGeo.dispose();
    coreMat.dispose();
    coreInnerGeo.dispose();
    coreInnerMat.dispose();
    haloGeo.dispose();
    haloMat.dispose();
    dustGeo.dispose();
    dustMat.dispose();
    streakGeo.dispose();
    streakMat.dispose();
    starGeo.dispose();
    starMat.dispose();
    for (const ring of rings) {
      ring.geometry.dispose();
      ring.material.dispose();
    }
    renderer.dispose();
  }

  return { start, dispose, setProgress, getProgress, resize };
}
