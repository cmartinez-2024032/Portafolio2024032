import { useEffect } from "react";

const SELECTOR =
  ".glass, .card, .contact-card, .contact-card-cinema, .contact-form, .forge-panel, .forge-meta-row, .forge-skill-card, .forge-strip-item, .about-float-chip";

/** Feeds the cursor position to the glass card under it (--mx / --my), which paints a soft light there. */
export default function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    let current = null;
    let raf = 0;
    const clear = (el) => {
      el?.style.removeProperty("--mx");
      el?.style.removeProperty("--my");
    };
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = e.target instanceof Element ? e.target.closest(SELECTOR) : null;
        if (el !== current) {
          clear(current);
          current = el;
        }
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${Math.round(e.clientX - r.left)}px`);
        el.style.setProperty("--my", `${Math.round(e.clientY - r.top)}px`);
      });
    };
    const onLeave = () => {
      clear(current);
      current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      clear(current);
    };
  }, []);
  return null;
}
