import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Animates a leading number in `value` counting up from 0 when it
 * scrolls into view (e.g. "3+" -> counts 0..3 then appends "+").
 */
export default function Counter({ value, duration = 1.1 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const str = String(value ?? "");
  const match = str.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";
  const [display, setDisplay] = useState(target !== null ? "0" : str);

  useEffect(() => {
    if (!inView || target === null) return;
    let raf;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(eased * target)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
