import { Fragment, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import "./design-fx.css";

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span className="scroll-word" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

/** Paragraph whose words light up one by one as it scrolls through the viewport. */
export default function ScrollWords({ text, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.5"] });

  if (reduce) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);
  const step = 1 / words.length;

  return (
    <p ref={ref} className={`scroll-words ${className}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <Word progress={scrollYProgress} range={[i * step, (i + 1) * step]}>
            {w}
          </Word>{" "}
        </Fragment>
      ))}
    </p>
  );
}
