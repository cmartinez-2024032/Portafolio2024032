import { useRef } from "react";
import { useSpring } from "framer-motion";

/**
 * Magnetic-pull effect for buttons/links: translates the element
 * slightly toward the cursor while hovering, springs back on leave.
 */
export function useMagnetic(strength = 16) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 300, damping: 20, mass: 0.4 });
  const y = useSpring(0, { stiffness: 300, damping: 20, mass: 0.4 });

  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { ref, style: { x, y }, onMouseMove, onMouseLeave };
}
