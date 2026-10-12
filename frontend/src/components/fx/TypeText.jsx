import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/** Types its text out with a caret the first time it scrolls into view; the full text reserves the space. */
export default function TypeText({ text, speed = 32, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return undefined;
    setCount(0);
    let id = 0;
    const startTimer = window.setTimeout(() => {
      id = window.setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            window.clearInterval(id);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, delay * 1000);
    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(id);
    };
  }, [inView, reduced, text, speed, delay]);

  const shown = reduced ? text : text.slice(0, count);
  const typing = !reduced && inView && count < text.length;

  return (
    <span ref={ref} className="fx-type">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="fx-type-ghost">{text}</span>
      <span aria-hidden="true" className="fx-type-live">
        {shown}
        {typing && <i className="fx-caret" />}
      </span>
    </span>
  );
}
