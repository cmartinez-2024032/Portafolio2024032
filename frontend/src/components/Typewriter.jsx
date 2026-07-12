import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Typewriter({ text }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <span ref={ref}>
      <span className="text-accent/60 mr-2" aria-hidden="true">//</span>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: i * 0.025, duration: 0.08 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
