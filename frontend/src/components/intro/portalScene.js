import * as THREE from "three";

const EMBER = 0x6aa8ff;
const EMBER_SOFT = 0x9ec5ff;
const WHITE = 0xf4f1ec;

/**
 * Lightweight WebGL portal: stacked ember rings + particle dust.
 * Driven entirely by a 0..1 progress value (scroll / wheel).
 */
export function createPortalScene(canvas) {
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lightScene = prefersReduced || isMobile;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

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
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
  camera.position.set(0, 0.15, 8);

  const root = new THREE.Group();
  scene.add(root);

  // Soft nebula glow behind everything
  const glowGeo = new THREE.SphereGeometry(6.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: EMBER,
    transparent: true,
    opacity: 0.07,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  root.add(glow);

  // Portal rings
  const rings = [];
  for (let i = 0; i < 7; i++) {
    const radius = 1.05 + i * 0.38;
    const tube = 0.018 + (i % 2) * 0.01;
    const geo = new THREE.TorusGeometry(radius, tube, 12, 96);
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? EMBER : EMBER_SOFT,
      transparent: true,
      opacity: 0.55 - i * 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2.15;
    ring.position.z = -i * 0.85;
    ring.userData = {
      baseZ: ring.position.z,
      spin: (i % 2 === 0 ? 1 : -1) * (0.15 + i * 0.03),
      tilt: (i - 3) * 0.04,
    };
    root.add(ring);
    rings.push(ring);
  }

  // Core ember orb
  const coreGeo = new THREE.SphereGeometry(0.28, 24, 24);
  const coreMat = new THREE.MeshBasicMaterial({
    color: EMBER,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  root.add(core);

  const haloGeo = new THREE.SphereGeometry(0.55, 24, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: EMBER_SOFT,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  root.add(halo);

  // Dust particles along the tunnel
  const COUNT = lightScene ? 80 : 220;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.4 + Math.random() * 3.2;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
    positions[i * 3 + 2] = -Math.random() * 14;
    speeds[i] = 0.4 + Math.random() * 1.2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: WHITE,
    size: 0.035,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  root.add(dust);

  // Outer stars
  const STAR_COUNT = lightScene ? 60 : 160;
  const starPos = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 28;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    starPos[i * 3 + 2] = -8 - Math.random() * 30;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: WHITE,
    size: 0.04,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  let progress = 0;
  let targetProgress = 0;
  let raf = 0;
  let disposed = false;
  let t = 0;

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

    progress += (targetProgress - progress) * 0.085;

    // Dolly into the portal
    camera.position.z = 8 - progress * 9.2;
    camera.position.y = 0.15 - progress * 0.08;
    camera.rotation.z = progress * 0.08;

    root.rotation.y = t * 0.08 + progress * 0.35;
    root.rotation.x = Math.sin(t * 0.4) * 0.04;

    const corePulse = 1 + Math.sin(t * 2.2) * 0.08 + progress * 0.55;
    core.scale.setScalar(corePulse);
    halo.scale.setScalar(1.1 + Math.sin(t * 1.6) * 0.1 + progress * 0.8);
    haloMat.opacity = 0.18 + progress * 0.35;
    glowMat.opacity = 0.05 + progress * 0.12;

    for (const ring of rings) {
      ring.rotation.z += ring.userData.spin * 0.016;
      ring.rotation.x = Math.PI / 2.15 + ring.userData.tilt + Math.sin(t + ring.userData.baseZ) * 0.03;
      ring.position.z = ring.userData.baseZ + progress * 4.5;
      ring.material.opacity = Math.max(0.08, 0.6 - progress * 0.35 - Math.abs(ring.userData.baseZ) * 0.04);
    }

    const pos = dustGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 2] += (0.035 + progress * 0.12) * speeds[i];
      if (pos[i * 3 + 2] > 2) pos[i * 3 + 2] = -14;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dustMat.opacity = 0.45 + progress * 0.45;

    stars.rotation.y = t * 0.02;
    starMat.opacity = 0.35 + (1 - progress) * 0.3;

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
    glowGeo.dispose();
    glowMat.dispose();
    coreGeo.dispose();
    coreMat.dispose();
    haloGeo.dispose();
    haloMat.dispose();
    dustGeo.dispose();
    dustMat.dispose();
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
