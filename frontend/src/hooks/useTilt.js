import { useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * 3D pointer-tilt for cards. Attach `ref`, `style`, and the two mouse
 * handlers to any motion.* element to get a perspective tilt that
 * follows the cursor and springs back on leave.
 */
export function useTilt(strength = 10) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [strength, -strength]), {
    stiffness: 220,
    damping: 22,
    mass: 0.4,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-strength, strength]), {
    stiffness: 220,
    damping: 22,
    mass: 0.4,
  });
  const glowX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(py, [0, 1], ["0%", "100%"]);

  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function onMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return {
    ref,
    style: { rotateX, rotateY, transformPerspective: 900 },
    glowStyle: { "--glow-x": glowX, "--glow-y": glowY },
    onMouseMove,
    onMouseLeave,
  };
}
