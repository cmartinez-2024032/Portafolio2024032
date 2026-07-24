import { useEffect, useRef, useState } from "react";

function isTouchDevice() {
  return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

/**
 * Elegant forge cursor: lagged ring + sharp core + modes for hover / text / click.
 */
export default function CustomCursor() {
  const [touch] = useState(() => isTouchDevice());
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const coreRef = useRef(null);
  const labelRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const mode = useRef("default");
  const pressed = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    if (touch) return;

    const setMode = (next) => {
      mode.current = next;
      const el = rootRef.current;
      if (!el) return;
      el.dataset.mode = next;
    };

    const move = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };

    const over = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      if (el.closest("input, textarea, [contenteditable='true']")) {
        setMode("text");
        return;
      }
      if (el.closest("a, button, [role='button'], .project-cell, .pill, .nav-lang-toggle, .robot-companion")) {
        const label = el.closest("[data-cursor]")?.getAttribute("data-cursor");
        if (labelRef.current) labelRef.current.textContent = label || "";
        setMode(label ? "label" : "hover");
        return;
      }
      setMode("default");
    };

    const down = () => {
      pressed.current = true;
      rootRef.current?.classList.add("is-down");
    };
    const up = () => {
      pressed.current = false;
      rootRef.current?.classList.remove("is-down");
    };

    const tick = () => {
      raf.current = requestAnimationFrame(tick);
      const lag = mode.current === "hover" || mode.current === "label" ? 0.22 : 0.16;
      ring.current.x += (pos.current.x - ring.current.x) * lag;
      ring.current.y += (pos.current.y - ring.current.y) * lag;

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
      if (labelRef.current && mode.current === "label") {
        labelRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(raf.current);
    };
  }, [touch]);

  if (touch) return null;

  return (
    <div ref={rootRef} className="forge-cursor" data-mode="default" aria-hidden="true">
      <div ref={ringRef} className="forge-cursor-ring">
        <span className="forge-cursor-cross forge-cursor-cross-h" />
        <span className="forge-cursor-cross forge-cursor-cross-v" />
      </div>
      <div ref={coreRef} className="forge-cursor-core" />
      <div ref={labelRef} className="forge-cursor-label" />
    </div>
  );
}
