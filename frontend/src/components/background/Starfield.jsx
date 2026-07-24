import { useEffect, useRef } from "react";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/** Occasional falling streak — diagonal meteor across the viewport. */
function spawnMeteor(w, h) {
  const startX = rand(-w * 0.05, w * 0.95);
  const startY = rand(-40, h * 0.15);
  const angle = rand(0.55, 0.85);
  const speed = rand(11, 18);
  return {
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: rand(32, 52),
    width: rand(1.4, 2.2),
  };
}

/**
 * Solid black sky with occasional falling meteors (shooting streaks).
 * No static starfield — only intermittent background trails while browsing.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Phones/tablets: cheaper canvas (dpr 1), fewer meteors, ~30fps throttle.
    const lowPower = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const maxMeteors = lowPower ? 4 : 10;
    const frameStep = lowPower ? 33 : 0; // ms between draws (0 = every frame)

    let raf = null;
    let w = 0;
    let h = 0;
    let t = 0;
    let last = 0;
    let meteors = [];
    let nextAt = rand(8, 20);

    function resize() {
      const dpr = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now) {
      raf = requestAnimationFrame(draw);
      if (frameStep && now - last < frameStep) return;
      last = now || 0;

      t += 1;
      ctx.clearRect(0, 0, w, h);

      if (t > nextAt && meteors.length < maxMeteors) {
        const burst = 1 + Math.floor(Math.random() * 3); // 1–3 per wave
        for (let i = 0; i < burst; i++) meteors.push(spawnMeteor(w, h));
        nextAt = t + rand(14, 38); // ~0.25–0.6s between waves
      }

      meteors = meteors.filter((m) => m.life < m.maxLife);
      for (const m of meteors) {
        m.life += 1;
        m.x += m.vx;
        m.y += m.vy;
        const progress = m.life / m.maxLife;
        const fade = progress < 0.1 ? progress / 0.1 : 1 - (progress - 0.1) / 0.9;
        const tailX = m.x - m.vx * 5.5;
        const tailY = m.y - m.vy * 5.5;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, "rgba(255,140,90,0)");
        grad.addColorStop(0.55, `rgba(255,170,130,${0.35 * fade})`);
        grad.addColorStop(1, `rgba(255,248,240,${0.95 * fade})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${fade})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(m.x, m.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,140,90,${fade * 0.22})`;
        ctx.fill();
      }
    }

    resize();
    for (let i = 0; i < (lowPower ? 2 : 4); i++) meteors.push(spawnMeteor(w, h));
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="signal-field" aria-hidden="true" />;
}
