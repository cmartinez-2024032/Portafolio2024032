import { useEffect, useState, useRef } from "react";

function isTouchDevice() {
  return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [touch] = useState(() => isTouchDevice());
  const raf = useRef(null);
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (touch) return;

    const move = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!raf.current) {
        raf.current = requestAnimationFrame(() => {
          setPos({ ...target.current });
          raf.current = null;
        });
      }
    };

    const over = (e) => {
      const el = e.target;
      const interactive = el.closest("a, button, [role='button'], input, textarea, .project-cell, .pill");
      setHovering(Boolean(interactive));
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [touch]);

  if (touch) return null;

  return (
    <div
      className={`custom-cursor ${hovering ? "is-hover" : ""}`}
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    >
      <div className="custom-cursor-ring" />
      <div className="custom-cursor-dot" />
    </div>
  );
}
