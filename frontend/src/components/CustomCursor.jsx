import { useEffect, useState } from "react";

function isTouchDevice() {
  return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [touch] = useState(() => isTouchDevice());

  useEffect(() => {
    if (touch) return;

    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [touch]);

  if (touch) return null;

  return (
    <div className="custom-cursor" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
      <div className="custom-cursor-ring" />
      <div className="custom-cursor-dot" />
    </div>
  );
}
