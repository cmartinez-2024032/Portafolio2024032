import { useEffect, useRef } from "react";
import { RobotController } from "../components/robot/RobotController";

/**
 * Only hide on real phone/tablet primaries — not Windows hybrids that
 * falsely report maxTouchPoints while still being mouse-first desktops.
 */
function isCoarseTouchPrimary() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

export function useRobot() {
  const robotRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = robotRef.current;
    if (!element) return;

    if (isCoarseTouchPrimary()) {
      element.dataset.touch = "true";
      element.dataset.ready = "false";
      return;
    }

    element.dataset.touch = "false";
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let controller = new RobotController(element, motionQuery.matches);
    controller.start();

    const handleMotionPreference = () => {
      controller.destroy();
      controller = new RobotController(element, motionQuery.matches);
      controller.start();
    };

    motionQuery.addEventListener?.("change", handleMotionPreference);

    return () => {
      motionQuery.removeEventListener?.("change", handleMotionPreference);
      controller.destroy();
    };
  }, []);

  return robotRef;
}
