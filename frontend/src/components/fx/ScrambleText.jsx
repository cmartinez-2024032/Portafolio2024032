import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}#%&*+=";
const FRAME_MS = 45;

/** Text that decrypts from random glyphs, left to right, the first time it scrolls into view. */
export default function ScrambleText({ text, duration = 900, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    if (!inView || reduced) return undefined;
    let raf = 0;
    let last = 0;
    let start = 0;

    const tick = (now) => {
      if (!start) start = now + delay * 1000;
      if (now < start || now - last < FRAME_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      last = now;
      const progress = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(progress * text.length);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        next += i < revealed || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, text, duration, delay]);

  const hidden = !reduced && display == null;

  return (
    <span ref={ref} className="fx-scramble">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" style={hidden ? { visibility: "hidden" } : undefined}>
        {reduced ? text : display ?? text}
      </span>
    </span>
  );
}
