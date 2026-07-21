export type RobotMode =
  | "hidden"
  | "idle"
  | "travel"
  | "observe"
  | "analyze"
  | "point"
  | "greet"
  | "reduced";

export type RobotTargetKind = "skill" | "project" | "observe" | "contact";

export const ROBOT_EASE = {
  premium: "cubic-bezier(0.16, 1, 0.3, 1)",
  settle: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const ROBOT_TIMING = {
  revealDelay: 2000,
  observeDuration: 1900,
  greetDuration: 2100,
  skillPause: 1400,
  inactivityDelay: 4200,
} as const;

const TARGET_CLASS = "robot-target-active";
const TARGET_KIND_PREFIX = "robot-target-";

export function setRobotMode(element: HTMLElement, mode: RobotMode) {
  if (element.dataset.mode === mode) return;
  element.dataset.mode = mode;
}

export function setRobotActivity(element: HTMLElement, inactive: boolean) {
  element.dataset.inactive = inactive ? "true" : "false";
}

export function setRobotLook(element: HTMLElement, x: number, y: number) {
  const clampedX = Math.max(-1, Math.min(1, x));
  const clampedY = Math.max(-1, Math.min(1, y));
  element.style.setProperty("--robot-look-x", clampedX.toFixed(3));
  element.style.setProperty("--robot-look-y", clampedY.toFixed(3));
}

export function activateRobotTarget(
  previous: HTMLElement | null,
  next: HTMLElement | null,
  kind: RobotTargetKind,
) {
  if (previous === next) return next;

  if (previous) {
    previous.classList.remove(TARGET_CLASS);
    previous.classList.forEach((className) => {
      if (className.startsWith(TARGET_KIND_PREFIX)) previous.classList.remove(className);
    });
  }

  if (next) {
    next.classList.add(TARGET_CLASS, `${TARGET_KIND_PREFIX}${kind}`);
  }

  return next;
}

export function clearRobotTarget(target: HTMLElement | null) {
  if (!target) return;
  target.classList.remove(TARGET_CLASS);
  target.classList.forEach((className) => {
    if (className.startsWith(TARGET_KIND_PREFIX)) target.classList.remove(className);
  });
}
