import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Mobile address bars resize the viewport while scrolling; refreshing on each
// of those makes pinned sections jump.
ScrollTrigger.config({ ignoreMobileResize: true });

// Late images and fonts change the page height, which would leave pinned
// sections starting at stale offsets.
if (typeof window !== "undefined" && "ResizeObserver" in window) {
  let lastHeight = 0;
  let timer = 0;
  new ResizeObserver(([entry]) => {
    const height = Math.round(entry.contentRect.height);
    if (Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.body);
}

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
