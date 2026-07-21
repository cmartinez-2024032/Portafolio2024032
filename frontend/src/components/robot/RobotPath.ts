export type RobotSection = "hero" | "intro" | "skills" | "timeline" | "achievements" | "projects" | "contact";

export type RobotPoint = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type RouteContext = {
  section: RobotSection;
  viewportWidth: number;
  viewportHeight: number;
  robotWidth: number;
  robotHeight: number;
  scrollDirection: 1 | -1;
  focusElement?: HTMLElement | null;
};

const SAFE_MARGIN = 18;
const AVOID_SELECTOR = [
  "h1",
  "h2",
  "h3",
  ".forge-cta",
  ".project-cell",
  ".contact-card",
  ".main-nav",
  "[data-robot-avoid]",
].join(",");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function overlapArea(a: DOMRect, b: DOMRect) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function pointRect(point: RobotPoint, width: number, height: number) {
  return new DOMRect(point.x, point.y, width * point.scale, height * point.scale);
}

function collectObstacles(focusElement?: HTMLElement | null) {
  return Array.from(document.querySelectorAll<HTMLElement>(AVOID_SELECTOR))
    .filter((element) => element !== focusElement && !focusElement?.contains(element))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 8 && rect.height > 8);
}

function scoreCandidate(
  point: RobotPoint,
  preferred: RobotPoint,
  obstacles: DOMRect[],
  robotWidth: number,
  robotHeight: number,
) {
  const rect = pointRect(point, robotWidth, robotHeight);
  const collision = obstacles.reduce((sum, obstacle) => sum + overlapArea(rect, obstacle), 0);
  const distance = Math.hypot(point.x - preferred.x, point.y - preferred.y);
  return collision * 18 + distance;
}

function nearElement(
  element: HTMLElement,
  viewportWidth: number,
  viewportHeight: number,
  robotWidth: number,
  robotHeight: number,
  scale: number,
) {
  const rect = element.getBoundingClientRect();
  const scaledWidth = robotWidth * scale;
  const scaledHeight = robotHeight * scale;
  const roomRight = viewportWidth - rect.right;
  const roomLeft = rect.left;
  const useRight = roomRight >= scaledWidth + SAFE_MARGIN || roomRight > roomLeft;

  return {
    x: useRight
      ? clamp(rect.right + SAFE_MARGIN, SAFE_MARGIN, viewportWidth - scaledWidth - SAFE_MARGIN)
      : clamp(rect.left - scaledWidth - SAFE_MARGIN, SAFE_MARGIN, viewportWidth - scaledWidth - SAFE_MARGIN),
    y: clamp(rect.top + Math.min(rect.height * 0.28, 72), 82, viewportHeight - scaledHeight - SAFE_MARGIN),
    scale,
    rotation: useRight ? -4 : 4,
  } satisfies RobotPoint;
}

function sectionPreference(context: RouteContext): RobotPoint {
  const { section, viewportWidth: width, viewportHeight: height, robotWidth, robotHeight, scrollDirection } = context;
  const mobile = width < 760;
  const scale = mobile ? 0.72 : 1;
  const maxX = width - robotWidth * scale - SAFE_MARGIN;
  const maxY = height - robotHeight * scale - SAFE_MARGIN;

  const points: Record<RobotSection, RobotPoint> = {
    hero: {
      x: mobile ? maxX : maxX - 12,
      y: mobile ? Math.min(height * 0.62, maxY) : 108,
      scale: mobile ? 0.74 : 1.05,
      rotation: -4,
    },
    intro: {
      x: mobile ? maxX : width * 0.82,
      y: height * 0.34,
      scale,
      rotation: -7,
    },
    skills: {
      x: mobile ? SAFE_MARGIN : maxX,
      y: height * 0.46,
      scale: mobile ? 0.68 : 0.94,
      rotation: scrollDirection * 3,
    },
    timeline: {
      x: scrollDirection > 0 ? maxX : SAFE_MARGIN,
      y: height * 0.4,
      scale: mobile ? 0.68 : 0.9,
      rotation: scrollDirection * 5,
    },
    achievements: {
      x: mobile ? maxX : width * 0.12,
      y: height * 0.56,
      scale: mobile ? 0.68 : 0.88,
      rotation: 2,
    },
    projects: {
      x: mobile ? maxX : SAFE_MARGIN,
      y: height * 0.42,
      scale: mobile ? 0.7 : 0.96,
      rotation: 5,
    },
    contact: {
      x: mobile ? maxX : width * 0.78,
      y: height * 0.38,
      scale,
      rotation: -5,
    },
  };

  const point = points[section];
  return {
    ...point,
    x: clamp(point.x, SAFE_MARGIN, maxX),
    y: clamp(point.y, 82, maxY),
  };
}

export function resolveRobotPoint(context: RouteContext): RobotPoint {
  const preferred = context.focusElement
    ? nearElement(
        context.focusElement,
        context.viewportWidth,
        context.viewportHeight,
        context.robotWidth,
        context.robotHeight,
        context.viewportWidth < 760 ? 0.7 : 0.94,
      )
    : sectionPreference(context);

  const scale = preferred.scale;
  const maxX = context.viewportWidth - context.robotWidth * scale - SAFE_MARGIN;
  const maxY = context.viewportHeight - context.robotHeight * scale - SAFE_MARGIN;
  const mirroredX = clamp(context.viewportWidth - preferred.x - context.robotWidth * scale, SAFE_MARGIN, maxX);

  const candidates: RobotPoint[] = [
    preferred,
    { ...preferred, x: mirroredX, rotation: -preferred.rotation },
    { ...preferred, y: clamp(preferred.y - context.viewportHeight * 0.2, 82, maxY) },
    { ...preferred, y: clamp(preferred.y + context.viewportHeight * 0.2, 82, maxY) },
    {
      ...preferred,
      x: context.scrollDirection > 0 ? maxX : SAFE_MARGIN,
      y: clamp(context.viewportHeight * 0.7, 82, maxY),
    },
  ];

  const obstacles = collectObstacles(context.focusElement);
  return candidates.reduce((best, candidate) => {
    const candidateScore = scoreCandidate(
      candidate,
      preferred,
      obstacles,
      context.robotWidth,
      context.robotHeight,
    );
    const bestScore = scoreCandidate(best, preferred, obstacles, context.robotWidth, context.robotHeight);
    return candidateScore < bestScore ? candidate : best;
  }, candidates[0]);
}

export function getVisibleRobotTargets(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 80 && rect.top < window.innerHeight - 24;
  });
}
