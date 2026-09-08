import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

const VARIANTS = {
  fade: {
    hidden: { opacity: 0, y: 56, filter: "blur(12px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  scale: {
    hidden: { opacity: 0, y: 30, scale: 0.92, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  },
  left: {
    hidden: { opacity: 0, x: -64, filter: "blur(12px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)" },
  },
  right: {
    hidden: { opacity: 0, x: 64, filter: "blur(12px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)" },
  },
};

const LIGHT_VARIANTS = {
  fade: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  left: {
    hidden: { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 28 },
    visible: { opacity: 1, x: 0 },
  },
};

function useLowPowerMotion() {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (hover: none)");
    const sync = () => setLow(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);
  return low;
}

export default function ScrollReveal({ children, className = "", variant = "fade", delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  const lowPower = useLowPowerMotion();
  const map = lowPower ? LIGHT_VARIANTS : VARIANTS;
  const chosen = map[variant] || map.fade;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      variants={chosen}
      transition={{ duration: lowPower ? 0.45 : 0.95, delay: lowPower ? delay * 0.5 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
