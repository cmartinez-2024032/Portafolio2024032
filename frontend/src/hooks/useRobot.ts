import { useEffect, useRef } from "react";
import { RobotController } from "../components/robot/RobotController";

export function useRobot() {
  const robotRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = robotRef.current;
    if (!element) return;

    // Ember runs everywhere now — desktop and touch alike. Touch devices
    // drive it via taps + scroll/section tracking (pointer events fire on
    // touch), so behaviour matches the desktop experience.
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
