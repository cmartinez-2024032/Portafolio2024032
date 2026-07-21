import { useEffect, useRef } from "react";

const EMBER = "255,90,54";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function buildStars(w, h, density) {
  const count = Math.floor((w * h) / density);
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: rand(0.7, 2.6),
    baseAlpha: rand(0.55, 1),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.4, 1.1),
    drift: rand(-0.02, 0.02),
    feature: false,
  }));
}

// Extra oversized, always-bright stars concentrated in the upper viewport —
// guarantees an obvious effect the instant the page loads, regardless of
// what content sits in front of the canvas.
function buildFeatureStars(w, h, count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h * 0.72,
    r: rand(1.8, 3.4),
    baseAlpha: rand(0.85, 1),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.3, 0.7),
    drift: rand(-0.015, 0.015),
    feature: true,
  }));
}

function spawnShootingStar(w, h) {
  const startX = rand(-w * 0.1, w * 1.05);
  const startY = rand(-60, h * 0.2);
  const angle = rand(0.6, 0.8);
  const speed = rand(13, 21);
  return {
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: rand(26, 42),
  };
}

/**
 * Layered starfield: dense twinkling stars (with extra bright "feature"
 * stars up top so the effect reads instantly), drifting ember nebula glow,
 * and a steady rain of shooting stars streaking across the sky.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = null;
    let w = 0;
    let h = 0;
    let t = 0;
    let stars = [];
    let shootingStars = [];
    let nextShootAt = 0;
    const pointer = { x: 0.5, y: 0.5 };
    const pointerEased = { x: 0.5, y: 0.5 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [
        ...buildStars(w, h, 550),
        ...buildFeatureStars(w, h, Math.max(18, Math.floor((w * h) / 42000))),
      ];
    }

    function onMove(e) {
      pointer.x = e.clientX / w;
      pointer.y = e.clientY / h;
    }

    function draw() {
      t += 1;
      pointerEased.x += (pointer.x - pointerEased.x) * 0.03;
      pointerEased.y += (pointer.y - pointerEased.y) * 0.03;
      const px = (pointerEased.x - 0.5) * 26;
      const py = (pointerEased.y - 0.5) * 18;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0b0b0c";
      ctx.fillRect(0, 0, w, h);

      // Ember nebula wash
      const nebulas = [
        { x: 0.16 + Math.sin(t * 0.0022) * 0.05, y: 0.2 + Math.cos(t * 0.0016) * 0.04, r: 0.42 },
        { x: 0.82 + Math.cos(t * 0.0019) * 0.05, y: 0.32 + Math.sin(t * 0.0021) * 0.04, r: 0.46 },
        { x: 0.5 + Math.sin(t * 0.0014) * 0.06, y: 0.92, r: 0.55 },
      ];
      for (const n of nebulas) {
        const g = ctx.createRadialGradient(n.x * w, n.y * h, 0, n.x * w, n.y * h, n.r * Math.max(w, h));
        g.addColorStop(0, `rgba(${EMBER},0.13)`);
        g.addColorStop(0.5, `rgba(${EMBER},0.04)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Stars with twinkle + subtle parallax toward pointer
      ctx.save();
      for (const s of stars) {
        const twinkle = 0.72 + 0.28 * Math.sin(t * 0.02 * s.speed + s.phase);
        const alpha = Math.min(1, s.baseAlpha * twinkle);
        const parallax = s.r > 1.4 ? 1 : 0.4;
        const x = s.x + px * parallax * 0.4;
        const y = s.y + py * parallax * 0.4 + s.drift * t * 0.05;
        const wrappedY = ((y % h) + h) % h;
        ctx.shadowColor = "rgba(255,255,255,0.95)";
        ctx.shadowBlur = s.feature ? 8 : s.r > 1.6 ? 4.5 : 0;
        ctx.beginPath();
        ctx.arc(x, wrappedY, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        if (s.r > 1.5) {
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(x, wrappedY, s.r * (s.feature ? 3.4 : 2.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${EMBER},${alpha * (s.feature ? 0.22 : 0.16)})`;
          ctx.fill();
        }
      }
      ctx.restore();

      // Shooting star rain
      if (t > nextShootAt && shootingStars.length < 7) {
        const burst = Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < burst; i++) shootingStars.push(spawnShootingStar(w, h));
        nextShootAt = t + rand(28, 65);
      }
      shootingStars = shootingStars.filter((m) => m.life < m.maxLife);
      for (const m of shootingStars) {
        m.life += 1;
        m.x += m.vx;
        m.y += m.vy;
        const progress = m.life / m.maxLife;
        const fade = progress < 0.12 ? progress / 0.12 : 1 - (progress - 0.12) / 0.88;
        const tailX = m.x - m.vx * 4.8;
        const tailY = m.y - m.vy * 4.8;
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, "rgba(255,140,90,0)");
        grad.addColorStop(0.6, `rgba(255,180,140,${0.4 * fade})`);
        grad.addColorStop(1, `rgba(255,250,242,${fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${fade})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,150,100,${fade * 0.3})`;
        ctx.fill();
      }

      if (!prefersReduced) raf = requestAnimationFrame(draw);
    }

    resize();
    // Kick off with a small burst so the meteor rain is visible immediately.
    shootingStars.push(spawnShootingStar(w, h));
    shootingStars.push(spawnShootingStar(w, h));
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="signal-field" aria-hidden="true" />;
}
