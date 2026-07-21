import {
  ROBOT_TIMING,
  activateRobotTarget,
  clearRobotTarget,
  setRobotActivity,
  setRobotLook,
  setRobotMode,
  type RobotMode,
  type RobotTargetKind,
} from "./RobotAnimations";
import {
  getVisibleRobotTargets,
  resolveRobotPoint,
  type RobotPoint,
  type RobotSection,
} from "./RobotPath";

const SECTION_IDS: RobotSection[] = [
  "hero",
  "intro",
  "skills",
  "timeline",
  "achievements",
  "projects",
  "contact",
];

const ROBOT_WIDTH = 104;
const ROBOT_HEIGHT = 120;

export class RobotController {
  private element: HTMLElement;
  private reducedMotion: boolean;
  private sectionObserver: IntersectionObserver | null = null;
  private modalObserver: MutationObserver | null = null;
  private sectionRatios = new Map<RobotSection, number>();
  private activeSection: RobotSection = "hero";
  private activeTarget: HTMLElement | null = null;
  private focusElement: HTMLElement | null = null;
  private targetKind: RobotTargetKind = "observe";
  private current: RobotPoint = { x: -160, y: 140, scale: 0.95, rotation: 0 };
  private destination: RobotPoint = { ...this.current };
  private scrollDirection: 1 | -1 = 1;
  private previousScrollY = 0;
  private rafId = 0;
  private destroyed = false;
  private scrolling = false;
  private inactivityTimer = 0;
  private scrollEndTimer = 0;
  private modeTimer = 0;
  private sequenceTimer = 0;
  private skillIndex = 0;
  private routeDirty = false;
  private lastRouteUpdate = 0;
  private suspended = false;
  private pointer = { x: 0.5, y: 0.5 };
  private lastFrame = 0;
  private velocity = { x: 0, y: 0 };

  constructor(element: HTMLElement, reducedMotion: boolean) {
    this.element = element;
    this.reducedMotion = reducedMotion;
  }

  start() {
    if (this.destroyed) return;

    this.element.dataset.ready = "true";
    this.previousScrollY = window.scrollY;

    if (this.reducedMotion) {
      setRobotMode(this.element, "reduced");
      this.current = this.getReducedPoint();
      this.destination = { ...this.current };
      this.render();
      return;
    }

    // Start off-screen then ease into hero after reveal CSS delay.
    this.current = {
      x: window.innerWidth * 0.72,
      y: -140,
      scale: 0.85,
      rotation: 8,
    };
    this.render();

    this.observeSections();
    this.observeProjectModal();
    this.bindEvents();
    this.resetInactivity();
    this.updateDestination();
    setRobotMode(this.element, "idle");
    this.scheduleFrame();
  }

  destroy() {
    this.destroyed = true;
    this.sectionObserver?.disconnect();
    this.sectionObserver = null;
    this.modalObserver?.disconnect();
    this.modalObserver = null;
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.clearTimeout(this.inactivityTimer);
    window.clearTimeout(this.scrollEndTimer);
    window.clearTimeout(this.modeTimer);
    window.clearTimeout(this.sequenceTimer);
    clearRobotTarget(this.activeTarget);
  }

  private bindEvents() {
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private observeSections() {
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as RobotSection;
          if (!SECTION_IDS.includes(id)) continue;
          this.sectionRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        const nextSection = [...this.sectionRatios.entries()].reduce<RobotSection>(
          (best, [section, ratio]) => {
            const bestRatio = this.sectionRatios.get(best) ?? 0;
            return ratio > bestRatio ? section : best;
          },
          this.activeSection,
        );

        if (nextSection !== this.activeSection && (this.sectionRatios.get(nextSection) ?? 0) > 0) {
          this.activeSection = nextSection;
          this.applySectionBehavior();
        }
      },
      {
        rootMargin: "-12% 0px -28% 0px",
        threshold: [0, 0.12, 0.28, 0.5, 0.72],
      },
    );

    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      if (section) this.sectionObserver.observe(section);
    }
  }

  private observeProjectModal() {
    const syncModalState = () => {
      const nextSuspended = Boolean(document.querySelector(".project-detail-overlay"));
      if (nextSuspended === this.suspended) return;

      this.suspended = nextSuspended;
      this.element.dataset.suspended = nextSuspended ? "true" : "false";

      if (nextSuspended) {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        clearRobotTarget(this.activeTarget);
        this.activeTarget = null;
        return;
      }

      this.applySectionBehavior();
    };

    this.modalObserver = new MutationObserver(syncModalState);
    this.modalObserver.observe(document.body, { childList: true, subtree: true });
    syncModalState();
  }

  private applySectionBehavior() {
    window.clearTimeout(this.modeTimer);
    window.clearTimeout(this.sequenceTimer);
    this.focusElement = null;

    switch (this.activeSection) {
      case "hero":
        this.setMode("idle");
        this.setTarget(null, "observe");
        break;
      case "intro": {
        const portrait = document.querySelector<HTMLElement>("[data-robot-portrait]");
        const portraitRect = portrait?.getBoundingClientRect();
        const portraitIsVisible = Boolean(
          portraitRect && portraitRect.bottom > 90 && portraitRect.top < window.innerHeight - 40,
        );
        this.focusElement = portraitIsVisible
          ? portrait
          : document.querySelector<HTMLElement>("[data-robot-observe]") ??
            document.querySelector<HTMLElement>(".forge-bento-bio");
        this.targetKind = "observe";
        this.setTarget(this.focusElement, "observe");
        this.setTemporaryMode("observe", ROBOT_TIMING.observeDuration, "idle");
        break;
      }
      case "skills":
        this.setMode("analyze");
        this.beginSkillSequence();
        break;
      case "projects":
        this.setMode("point");
        this.selectNearestProject();
        break;
      case "contact":
        this.focusElement =
          document.querySelector<HTMLElement>("[data-robot-contact]") ??
          document.getElementById("contact");
        this.targetKind = "contact";
        this.setTarget(this.focusElement, "contact");
        this.setTemporaryMode("greet", ROBOT_TIMING.greetDuration, "idle");
        break;
      default:
        this.setMode("travel");
        this.setTarget(null, "observe");
    }

    this.updateDestination();
    this.scheduleFrame();
  }

  private beginSkillSequence() {
    const skills = getVisibleRobotTargets("[data-robot-skill]");
    if (!skills.length || this.activeSection !== "skills") return;

    this.skillIndex %= skills.length;
    const skill = skills[this.skillIndex];
    this.focusElement = skill;
    this.targetKind = "skill";
    this.setTarget(skill, "skill");
    this.setMode("analyze");
    this.updateDestination();
    this.scheduleFrame();
    this.skillIndex = (this.skillIndex + 1) % skills.length;

    this.sequenceTimer = window.setTimeout(
      () => this.beginSkillSequence(),
      ROBOT_TIMING.skillPause,
    );
  }

  private selectNearestProject() {
    const projects = getVisibleRobotTargets("[data-robot-project]");
    if (!projects.length) {
      this.setTarget(null, "project");
      return;
    }

    const viewportCenter = window.innerHeight * 0.52;
    const nearest = projects.reduce((best, project) => {
      const projectCenter =
        project.getBoundingClientRect().top + project.getBoundingClientRect().height * 0.35;
      const bestCenter =
        best.getBoundingClientRect().top + best.getBoundingClientRect().height * 0.35;
      return Math.abs(projectCenter - viewportCenter) < Math.abs(bestCenter - viewportCenter)
        ? project
        : best;
    });

    this.focusElement = nearest;
    this.targetKind = "project";
    this.setTarget(nearest, "project");
  }

  private setTarget(target: HTMLElement | null, kind: RobotTargetKind) {
    this.activeTarget = activateRobotTarget(this.activeTarget, target, kind);
  }

  private setMode(mode: RobotMode) {
    setRobotMode(this.element, mode);
  }

  private setTemporaryMode(mode: RobotMode, duration: number, fallback: RobotMode) {
    this.setMode(mode);
    window.clearTimeout(this.modeTimer);
    this.modeTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      this.setMode(fallback);
    }, duration);
  }

  private updateDestination() {
    this.destination = resolveRobotPoint({
      section: this.activeSection,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      robotWidth: ROBOT_WIDTH,
      robotHeight: ROBOT_HEIGHT,
      scrollDirection: this.scrollDirection,
      focusElement: this.focusElement,
    });
  }

  private getReducedPoint(): RobotPoint {
    const scale = window.innerWidth < 760 ? 0.62 : 0.78;
    return {
      x: window.innerWidth - ROBOT_WIDTH * scale - 18,
      y: window.innerHeight - ROBOT_HEIGHT * scale - 22,
      scale,
      rotation: 0,
    };
  }

  private scheduleFrame() {
    if (this.rafId || this.destroyed || this.suspended || document.hidden) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.rafId = 0;
    if (this.destroyed) return;

    const dt = this.lastFrame ? Math.min(32, now - this.lastFrame) : 16;
    this.lastFrame = now;

    if (this.routeDirty && now - this.lastRouteUpdate >= 72) {
      if (this.activeSection === "projects") this.selectNearestProject();
      this.updateDestination();
      this.routeDirty = false;
      this.lastRouteUpdate = now;
    }

    const prevX = this.current.x;
    const prevY = this.current.y;
    const stiffness = this.scrolling ? 0.16 : 0.11;
    this.current.x += (this.destination.x - this.current.x) * stiffness;
    this.current.y += (this.destination.y - this.current.y) * stiffness;
    this.current.scale += (this.destination.scale - this.current.scale) * 0.1;

    this.velocity.x = (this.current.x - prevX) / (dt || 16);
    this.velocity.y = (this.current.y - prevY) / (dt || 16);

    const lean = Math.max(-10, Math.min(10, this.velocity.x * 18));
    const pitch = Math.max(-6, Math.min(6, -this.velocity.y * 12));
    this.current.rotation +=
      (this.destination.rotation + lean + pitch - this.current.rotation) * 0.12;

    this.updateLook();
    this.render();

    const unsettled =
      Math.abs(this.destination.x - this.current.x) > 0.2 ||
      Math.abs(this.destination.y - this.current.y) > 0.2 ||
      Math.abs(this.destination.scale - this.current.scale) > 0.002 ||
      Math.abs(this.destination.rotation + lean + pitch - this.current.rotation) > 0.08 ||
      Math.abs(this.velocity.x) > 0.02 ||
      Math.abs(this.velocity.y) > 0.02;

    // Keep a light idle loop so look-at / lean stay responsive.
    if (unsettled || this.routeDirty || this.element.dataset.inactive !== "true") {
      this.scheduleFrame();
    }
  };

  private updateLook() {
    // Prefer looking at the focused element when analyzing / observing.
    if (
      this.focusElement &&
      (this.element.dataset.mode === "analyze" ||
        this.element.dataset.mode === "observe" ||
        this.element.dataset.mode === "point")
    ) {
      const rect = this.focusElement.getBoundingClientRect();
      const targetX = rect.left + rect.width * 0.5;
      const targetY = rect.top + rect.height * 0.35;
      const robotCx = this.current.x + (ROBOT_WIDTH * this.current.scale) / 2;
      const robotCy = this.current.y + (ROBOT_HEIGHT * this.current.scale) * 0.4;
      const lookX = Math.max(-1, Math.min(1, (targetX - robotCx) / 180));
      const lookY = Math.max(-1, Math.min(1, (targetY - robotCy) / 140));
      setRobotLook(this.element, lookX, lookY);
      return;
    }

    if (this.element.dataset.inactive === "true") return;

    const lookX = (this.pointer.x - 0.5) * 1.35;
    const lookY = (this.pointer.y - 0.5) * 1.1;
    setRobotLook(this.element, lookX, lookY);
  }

  private render() {
    const traveling =
      Math.hypot(this.velocity.x, this.velocity.y) > 0.08 || this.scrolling;
    this.element.dataset.moving = traveling ? "true" : "false";
    this.element.style.transform = `translate3d(${this.current.x.toFixed(2)}px, ${this.current.y.toFixed(2)}px, 0) scale(${this.current.scale.toFixed(3)}) rotate(${this.current.rotation.toFixed(2)}deg)`;
  }

  private resetInactivity() {
    setRobotActivity(this.element, false);
    window.clearTimeout(this.inactivityTimer);
    this.inactivityTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      setRobotActivity(this.element, true);
      setRobotLook(this.element, 0, 0);
    }, ROBOT_TIMING.inactivityDelay);
    this.scheduleFrame();
  }

  private onPointerMove = (event: PointerEvent) => {
    this.pointer.x = event.clientX / window.innerWidth;
    this.pointer.y = event.clientY / window.innerHeight;
    this.resetInactivity();
  };

  private onScroll = () => {
    const scrollY = window.scrollY;
    this.scrollDirection = scrollY >= this.previousScrollY ? 1 : -1;
    this.previousScrollY = scrollY;
    this.scrolling = true;

    if (this.activeSection !== "skills" && this.activeSection !== "projects") {
      this.setMode("travel");
    }
    this.routeDirty = true;
    this.scheduleFrame();
    window.clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      this.scrolling = false;
      this.applySectionBehavior();
    }, 160);
  };

  private onResize = () => {
    if (this.reducedMotion) {
      this.current = this.getReducedPoint();
      this.destination = { ...this.current };
      this.render();
      return;
    }
    this.updateDestination();
    this.scheduleFrame();
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      return;
    }
    this.updateDestination();
    this.scheduleFrame();
  };
}
