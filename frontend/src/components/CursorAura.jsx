import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

function isTouchDevice() {
  return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

/**
 * Large soft glow that trails the cursor with spring lag, layered
 * behind the small custom cursor dot for depth and warmth.
 */
export default function CursorAura() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 60, damping: 18, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (isTouchDevice()) return;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (isTouchDevice()) return null;

  return (
    <motion.div
      className="cursor-aura"
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    />
  );
}
