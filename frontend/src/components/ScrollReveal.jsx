import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

/** No filter:blur — it leaves titles looking foggy / broken on many GPUs. */
const VARIANTS = {
  fade: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
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

export default function ScrollReveal({ children, className = "", variant = "fade", delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  const chosen = VARIANTS[variant] || VARIANTS.fade;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8% 0px -6% 0px" }}
      variants={chosen}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
