import { useScroll, useTransform } from "framer-motion";

export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return { scrollYProgress, scaleX };
}
