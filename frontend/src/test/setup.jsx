import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

const MOTION_PROPS = [
  "initial", "animate", "exit", "whileHover", "whileTap", "whileInView",
  "whileFocus", "whileDrag", "layout", "layoutId", "transition", "variants",
  "viewport", "onAnimationStart", "onAnimationComplete",
];

function stripMotionProps(props) {
  const filtered = {};
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROPS.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

const motionProxy = new Proxy(
  {},
  {
    get: (_target, prop) => {
      return ({ children, ...props }) => {
        const Tag = prop;
        return <Tag {...stripMotionProps(props)}>{children}</Tag>;
      };
    },
  }
);

const useInView = (ref, options) => true;

const useScroll = () => ({
  scrollY: 0,
  scrollYProgress: 0,
});
const useTransform = (value, input, output) => {
  // Supports useTransform(mv, [in], [out]) and useTransform([mvs], fn)
  if (typeof input === "function") return "#0000";
  if (Array.isArray(output)) return output[0];
  return output ?? 0;
};

function useMotionValue(initial) {
  return { get: () => initial, set: () => {}, on: () => () => {} };
}

function useSpring(initial) {
  return useMotionValue(initial);
}

vi.mock("framer-motion", () => ({
  motion: motionProxy,
  AnimatePresence: ({ children }) => <>{children}</>,
  useInView: (ref, options) => true,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion: () => false,
}));

globalThis.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(target) {
    this.callback([{
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: target.getBoundingClientRect(),
    }], this);
  }
  unobserve() {}
  disconnect() {}
};

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
