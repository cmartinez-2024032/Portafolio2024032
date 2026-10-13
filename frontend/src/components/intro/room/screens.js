import * as THREE from "three";

const C = {
  bg: "#0a0a0c",
  panel: "#111114",
  line: "#1f1f24",
  text: "#e8e8ea",
  dim: "#6b6b74",
  red: "#ff4d5e",
  led: "#e8132b",
  str: "#f5f5f5",
  attr: "#a1a1aa",
};

const MONO = "Consolas, 'Courier New', monospace";
const SANS = "Manrope, Arial, sans-serif";
const DISPLAY = "'Bebas Neue', Impact, 'Arial Narrow', sans-serif";

function makeScreen(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return { canvas, ctx, texture, w, h };
}

// Each line is a list of [text, color] runs.
function heroSource({ name, role, phrase, cta }) {
  return [
    [["import", C.red], [" { motion } ", C.text], ["from", C.red], [' "framer-motion"', C.str], [";", C.text]],
    [],
    [["export default function", C.red], [" Hero", C.str], ["() {", C.text]],
    [["  return", C.red], [" (", C.text]],
    [["    <section", C.dim], [" className", C.attr], ["=", C.text], ['"hero"', C.str], [">", C.dim]],
    [["      <h1>", C.dim], [name, C.text], ["</h1>", C.dim]],
    [["      <h2>", C.dim], [role, C.text], ["</h2>", C.dim]],
    [["      <p>", C.dim], [phrase, C.text], ["</p>", C.dim]],
    [["      <Button", C.dim], [" variant", C.attr], ["=", C.text], ['"led"', C.str], [">", C.dim], [cta, C.text], ["</Button>", C.dim]],
    [["    </section>", C.dim]],
    [["  );", C.text]],
    [["}", C.text]],
  ];
}

const TERMINAL = [
  ["$ pnpm dev", C.text],
  ["  VITE ready in 312 ms", C.text],
  ["  ➜  Local: http://localhost:5173/", C.dim],
  ["  ✓ hmr update /src/Hero.jsx", C.red],
];

// Portrait editor for the vertical monitor; the code types itself as `progress` goes 0 → 1.
export function createEditor(content, { w = 640, h = 1024, font = 17 } = {}) {
  const s = makeScreen(w, h);
  const code = heroSource(content);
  const total = code.reduce((n, line) => n + line.reduce((m, [t]) => m + t.length, 0) + 1, 0);
  const lineH = Math.round(font * 1.62);
  let lastKey = "";

  s.draw = (progress, time) => {
    const typed = Math.floor(progress * total);
    const blink = Math.floor(time * 2) % 2;
    const key = `${typed}:${blink}`;
    if (key === lastKey) return;
    lastKey = key;

    const { ctx } = s;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = C.panel;
    ctx.fillRect(0, 0, w, 54);
    ctx.fillStyle = C.led;
    ctx.fillRect(20, 50, 92, 3);
    ctx.font = `600 ${font}px ${MONO}`;
    ctx.fillStyle = C.text;
    ctx.fillText("Hero.jsx", 24, 35);
    ctx.fillStyle = C.dim;
    ctx.fillText("index.css", 24 + font * 6.5, 35);

    ctx.font = `${font}px ${MONO}`;
    const maxW = w - 24 - (16 + font * 2.6);
    let left = typed;
    let cursor = null;
    let row = 0;
    code.forEach((line, i) => {
      let y = 100 + row * lineH;
      ctx.fillStyle = C.dim;
      ctx.fillText(String(i + 1).padStart(2, " "), 16, y);
      const x0 = 16 + font * 2.6;
      let x = x0;
      for (const [text, color] of line) {
        if (left <= 0) break;
        const part = text.slice(0, left);
        left -= part.length;
        ctx.fillStyle = color;
        // Long prose wraps onto continuation rows so it stays inside the portrait panel.
        for (const word of part.split(/(?<= )/)) {
          const ww = ctx.measureText(word).width;
          if (x + ww > x0 + maxW && x > x0) {
            row += 1;
            y = 100 + row * lineH;
            x = x0 + font * 2;
          }
          ctx.fillText(word, x, y);
          x += ww;
        }
      }
      if (left > 0) left -= 1;
      if (left <= 0 && !cursor) cursor = [x, y];
      row += 1;
    });
    if (cursor && blink) {
      ctx.fillStyle = C.text;
      ctx.fillRect(cursor[0] + 2, cursor[1] - font * 0.9, font * 0.5, font * 1.15);
    }

    const top = h - 260;
    ctx.fillStyle = C.panel;
    ctx.fillRect(0, top, w, h - top);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, top, w, 2);
    ctx.fillStyle = C.dim;
    ctx.fillText("TERMINAL", 24, top + 40);
    const shown = progress >= 1 ? TERMINAL.length : Math.min(2, Math.floor(progress * 3));
    TERMINAL.slice(0, shown).forEach(([text, color], i) => {
      ctx.fillStyle = color;
      ctx.fillText(text, 24, top + 90 + i * lineH);
    });
    s.texture.needsUpdate = true;
  };
  return s;
}

// The site's hero, drawn on the main monitor. It builds up as `progress` goes 0 → 1.
export function createPreview({ name, role, phrase, cta, ctaCv, eyebrow, nav }) {
  const W = 1024;
  const H = 640;
  const s = makeScreen(W, H);
  const [first, ...rest] = name.toUpperCase().split(" ");
  const last = rest.join(" ");
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  let lastKey = "";

  s.draw = (progress, time) => {
    const key = `${Math.round(progress * 200)}:${Math.floor(time * 8)}`;
    if (key === lastKey) return;
    lastKey = key;

    const { ctx } = s;
    const step = (a, b) => Math.min(1, Math.max(0, (progress - a) / (b - a)));
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = step(0.05, 0.2);
    ctx.fillStyle = C.led;
    ctx.fillRect(0, 92, W, 2);
    ctx.fillStyle = "#f5f5f5";
    ctx.font = `800 26px ${SANS}`;
    ctx.fillText(initials, 48, 60);
    ctx.font = `600 15px ${SANS}`;
    ctx.fillStyle = "#a1a1aa";
    nav.forEach((label, i) => ctx.fillText(label.toUpperCase(), 450 + i * 130, 58));

    ctx.globalAlpha = step(0.15, 0.3);
    ctx.fillStyle = C.led;
    ctx.beginPath();
    ctx.arc(54, 146, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d4d4d8";
    ctx.font = `600 18px ${SANS}`;
    ctx.fillText(eyebrow, 70, 152);

    const nameIn = step(0.2, 0.45);
    ctx.globalAlpha = nameIn;
    ctx.fillStyle = "#f5f5f5";
    ctx.font = `400 108px ${DISPLAY}`;
    ctx.fillText(first, 48, 262 + (1 - nameIn) * 30);
    ctx.fillStyle = C.led;
    ctx.fillText(last, 48, 362 + (1 - nameIn) * 30);

    ctx.globalAlpha = step(0.45, 0.6);
    ctx.fillStyle = "#e4e4e7";
    ctx.font = `600 24px ${SANS}`;
    ctx.fillText(role, 50, 412);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `20px ${SANS}`;
    ctx.fillText(phrase, 50, 450);

    ctx.globalAlpha = step(0.6, 0.75);
    ctx.font = `700 18px ${SANS}`;
    const ctaW = ctx.measureText(cta).width + 56;
    const cvW = ctx.measureText(ctaCv).width + 56;
    ctx.fillStyle = C.led;
    roundRect(ctx, 50, 488, ctaW, 54, 10);
    ctx.fillStyle = "#fff";
    ctx.fillText(cta, 78, 521);
    ctx.strokeStyle = "#f5f5f5";
    ctx.lineWidth = 2;
    roundRect(ctx, 66 + ctaW, 488, cvW, 54, 10, true);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillText(ctaCv, 94 + ctaW, 521);

    const orb = step(0.3, 0.7);
    ctx.globalAlpha = orb;
    const cx = 790;
    const cy = 330;
    ctx.fillStyle = "#141418";
    ctx.beginPath();
    ctx.arc(cx, cy, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 190, 48, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    const a = time * 1.2;
    const tilt = -0.25;
    ctx.fillStyle = C.led;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(a) * 190 * Math.cos(tilt) - Math.sin(a) * 48 * Math.sin(tilt),
      cy + Math.cos(a) * 190 * Math.sin(tilt) + Math.sin(a) * 48 * Math.cos(tilt),
      9,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#f5f5f5";
    ctx.font = `400 96px ${DISPLAY}`;
    ctx.textAlign = "center";
    ctx.fillText(initials, cx, cy + 34);
    ctx.textAlign = "left";

    ctx.globalAlpha = 1;
    s.texture.needsUpdate = true;
  };
  return s;
}

function roundRect(ctx, x, y, w, h, r, stroke = false) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (stroke) ctx.stroke();
  else ctx.fill();
}
