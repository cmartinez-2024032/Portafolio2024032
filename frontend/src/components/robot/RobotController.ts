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
import { getEmberLines, getEmberTips } from "./EmberLines";

const SECTION_IDS: RobotSection[] = [
  "hero",
  "intro",
  "skills",
  "abilities",
  "timeline",
  "achievements",
  "projects",
  "contact",
];

const ROBOT_WIDTH = 104;
const ROBOT_HEIGHT = 120;
const SPEECH_HOLD_MS = 5600;
const TIP_HOLD_MS = 4200;

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
  private speechTimer = 0;
  private lastSpeechSection: RobotSection | null = null;
  private velocity = { x: 0, y: 0 };
  /** While true, Ember holds position so speech stays readable. */
  private speaking = false;
  private speakAnchor: RobotPoint | null = null;
  private tipIndex = 0;
  private lastClickAt = 0;
  private clickTimer = 0;
  private hoverTimer = 0;
  private idleTipTimer = 0;
  private summonTimer = 0;

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
      this.bindInteractiveEvents();
      this.bindBehaviorEvents();
      window.setTimeout(() => this.speakForSection("hero"), 400);
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
    this.bindInteractiveEvents();
    this.bindBehaviorEvents();
    this.resetInactivity();
    this.updateDestination();
    setRobotMode(this.element, "idle");
    this.scheduleFrame();
    // Intro greeting after Ember flies in
    window.setTimeout(() => this.speakForSection("hero"), 900);
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
    this.element.removeEventListener("pointerenter", this.onPointerEnter);
    this.element.removeEventListener("pointerleave", this.onPointerLeave);
    this.element.removeEventListener("click", this.onClick);
    window.removeEventListener("forge:locale", this.onLocaleChange as EventListener);
    window.removeEventListener("forge:contact-success", this.onContactSuccess as EventListener);
    document.removeEventListener("selectionchange", this.onSelectionChange);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.clearTimeout(this.inactivityTimer);
    window.clearTimeout(this.scrollEndTimer);
    window.clearTimeout(this.modeTimer);
    window.clearTimeout(this.sequenceTimer);
    window.clearTimeout(this.speechTimer);
    window.clearTimeout(this.hoverTimer);
    window.clearTimeout(this.idleTipTimer);
    window.clearTimeout(this.summonTimer);
    window.clearTimeout(this.clickTimer);
    clearRobotTarget(this.activeTarget);
  }

  private bindEvents() {
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private bindInteractiveEvents() {
    this.element.addEventListener("pointerenter", this.onPointerEnter);
    this.element.addEventListener("pointerleave", this.onPointerLeave);
    this.element.addEventListener("click", this.onClick);
  }

  private bindBehaviorEvents() {
    window.addEventListener("forge:locale", this.onLocaleChange as EventListener);
    window.addEventListener("forge:contact-success", this.onContactSuccess as EventListener);
    document.addEventListener("selectionchange", this.onSelectionChange);
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
        this.endSpeech(false);
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

    // Don't chase a new route mid-sentence — settle first, then speak.
    if (!this.speaking) {
      this.updateDestination();
    }
    this.speakForSection(this.activeSection);
    this.scheduleFrame();
  }

  private speakForSection(section: RobotSection) {
    const line = getEmberLines()[section];
    if (!line) return;
    if (this.lastSpeechSection === section && this.speaking) return;
    this.lastSpeechSection = section;
    this.openSpeech(line, SPEECH_HOLD_MS);
  }

  private openSpeech(line: string, holdMs: number) {
    const bubble = this.element.querySelector<HTMLElement>(".robot-speech");
    const textEl = this.element.querySelector<HTMLElement>(".robot-speech-text");
    if (!bubble || !textEl) return;

    // Freeze where we are so the bubble is readable.
    this.speaking = true;
    this.speakAnchor = {
      x: this.current.x,
      y: this.current.y,
      scale: this.current.scale,
      rotation: 0,
    };
    this.destination = { ...this.speakAnchor };
    this.velocity.x = 0;
    this.velocity.y = 0;
    window.clearTimeout(this.sequenceTimer);

    textEl.textContent = line;
    bubble.dataset.open = "true";
    this.element.dataset.speaking = "true";
    this.setTemporaryMode("greet", Math.min(900, holdMs), this.activeSection === "skills" ? "analyze" : "idle");

    window.clearTimeout(this.speechTimer);
    this.speechTimer = window.setTimeout(() => this.endSpeech(true), holdMs);
    this.scheduleFrame();
  }

  private endSpeech(resume: boolean) {
    const bubble = this.element.querySelector<HTMLElement>(".robot-speech");
    if (bubble) bubble.dataset.open = "false";
    this.element.dataset.speaking = "false";
    this.speaking = false;
    this.speakAnchor = null;
    window.clearTimeout(this.speechTimer);

    if (!resume || this.destroyed || this.suspended) return;

    this.updateDestination();
    if (this.activeSection === "skills") this.beginSkillSequence();
    else if (this.activeSection === "projects") this.selectNearestProject();
    this.scheduleFrame();
  }

  private beginSkillSequence() {
    if (this.speaking) return;
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
    if (this.speaking && this.speakAnchor) {
      this.destination = { ...this.speakAnchor };
      return;
    }

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

    if (!this.speaking && this.routeDirty && now - this.lastRouteUpdate >= 72) {
      if (this.activeSection === "projects") this.selectNearestProject();
      this.updateDestination();
      this.routeDirty = false;
      this.lastRouteUpdate = now;
    }

    const prevX = this.current.x;
    const prevY = this.current.y;
    // Near-frozen while speaking so the message stays easy to read.
    const stiffness = this.speaking ? 0.035 : this.scrolling ? 0.16 : 0.11;
    this.current.x += (this.destination.x - this.current.x) * stiffness;
    this.current.y += (this.destination.y - this.current.y) * stiffness;
    this.current.scale += (this.destination.scale - this.current.scale) * (this.speaking ? 0.04 : 0.1);

    this.velocity.x = (this.current.x - prevX) / (dt || 16);
    this.velocity.y = (this.current.y - prevY) / (dt || 16);

    const lean = this.speaking ? 0 : Math.max(-10, Math.min(10, this.velocity.x * 18));
    const pitch = this.speaking ? 0 : Math.max(-6, Math.min(6, -this.velocity.y * 12));
    this.current.rotation +=
      (this.destination.rotation + lean + pitch - this.current.rotation) * (this.speaking ? 0.08 : 0.12);

    this.updateLook();
    this.render();

    const unsettled =
      Math.abs(this.destination.x - this.current.x) > 0.2 ||
      Math.abs(this.destination.y - this.current.y) > 0.2 ||
      Math.abs(this.destination.scale - this.current.scale) > 0.002 ||
      Math.abs(this.destination.rotation + lean + pitch - this.current.rotation) > 0.08 ||
      Math.abs(this.velocity.x) > 0.02 ||
      Math.abs(this.velocity.y) > 0.02;

    if (unsettled || this.routeDirty || this.speaking || this.element.dataset.inactive !== "true") {
      this.scheduleFrame();
    }
  };

  private updateLook() {
    if (this.speaking) {
      // Soft glance toward cursor only — no chase.
      const lookX = (this.pointer.x - 0.5) * 0.35;
      const lookY = (this.pointer.y - 0.5) * 0.25;
      setRobotLook(this.element, lookX, lookY);
      return;
    }

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
      !this.speaking &&
      (Math.hypot(this.velocity.x, this.velocity.y) > 0.08 || this.scrolling);
    this.element.dataset.moving = traveling ? "true" : "false";
    this.element.style.transform = `translate3d(${this.current.x.toFixed(2)}px, ${this.current.y.toFixed(2)}px, 0) scale(${this.current.scale.toFixed(3)}) rotate(${this.current.rotation.toFixed(2)}deg)`;
  }

  private resetInactivity() {
    setRobotActivity(this.element, false);
    window.clearTimeout(this.inactivityTimer);
    window.clearTimeout(this.idleTipTimer);
    this.inactivityTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      setRobotActivity(this.element, true);
      setRobotLook(this.element, 0, 0);
      // After a longer idle, offer a soft tip.
      this.idleTipTimer = window.setTimeout(() => {
        if (this.destroyed || this.speaking || this.suspended) return;
        this.speakTip();
      }, 5200);
    }, ROBOT_TIMING.inactivityDelay);
    this.scheduleFrame();
  }

  private speakTip() {
    const tips = getEmberTips();
    const tip = tips[this.tipIndex % tips.length];
    this.tipIndex += 1;
    this.lastSpeechSection = null;
    this.openSpeech(tip, TIP_HOLD_MS);
  }

  private onPointerEnter = () => {
    if (this.suspended || this.reducedMotion) return;
    this.element.dataset.hover = "true";
    window.clearTimeout(this.hoverTimer);
    if (!this.speaking) {
      this.setTemporaryMode("greet", 720, this.element.dataset.mode === "analyze" ? "analyze" : "idle");
    }
  };

  private onPointerLeave = () => {
    this.element.dataset.hover = "false";
  };

  private onClick = (event: MouseEvent) => {
    if (this.suspended) return;
    event.stopPropagation();
    this.resetInactivity();

    const now = performance.now();
    const isDouble = now - this.lastClickAt < 320;
    this.lastClickAt = now;

    if (isDouble && !this.reducedMotion) {
      window.clearTimeout(this.clickTimer);
      this.summonNearCursor(event.clientX, event.clientY);
      return;
    }

    window.clearTimeout(this.clickTimer);
    this.clickTimer = window.setTimeout(() => {
      if (this.destroyed || this.suspended) return;
      if (this.speaking) {
        this.endSpeech(true);
        return;
      }
      this.speakTip();
    }, 280);
  };

  private summonNearCursor(clientX: number, clientY: number) {
    const scale = this.current.scale || 0.95;
    const target: RobotPoint = {
      x: Math.max(
        18,
        Math.min(window.innerWidth - ROBOT_WIDTH * scale - 18, clientX - ROBOT_WIDTH * scale * 0.5),
      ),
      y: Math.max(
        82,
        Math.min(
          window.innerHeight - ROBOT_HEIGHT * scale - 18,
          clientY - ROBOT_HEIGHT * scale * 0.45,
        ),
      ),
      scale,
      rotation: 0,
    };

    window.clearTimeout(this.speechTimer);
    const bubble = this.element.querySelector<HTMLElement>(".robot-speech");
    const textEl = this.element.querySelector<HTMLElement>(".robot-speech-text");

    // Fly to the cursor, then hold there while speaking.
    this.speaking = false;
    this.speakAnchor = null;
    this.destination = target;
    this.setTemporaryMode("greet", 900, "idle");
    this.scheduleFrame();

    window.clearTimeout(this.summonTimer);
    this.summonTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      this.speakAnchor = { ...target };
      this.speaking = true;
      this.destination = { ...target };
      if (bubble && textEl) {
        textEl.textContent =
          document.documentElement.lang === "en"
            ? "Here I am! Back to my route in a second."
            : "¡Aquí estoy! Vuelvo a mi ruta en un segundo.";
        bubble.dataset.open = "true";
        this.element.dataset.speaking = "true";
      }
      this.speechTimer = window.setTimeout(() => this.endSpeech(true), 2800);
    }, 480);
  }

  private onPointerMove = (event: PointerEvent) => {
    this.pointer.x = event.clientX / window.innerWidth;
    this.pointer.y = event.clientY / window.innerHeight;
    this.resetInactivity();
  };

  private onScroll = () => {
    const scrollY = window.scrollY;
    const delta = Math.abs(scrollY - this.previousScrollY);
    this.scrollDirection = scrollY >= this.previousScrollY ? 1 : -1;
    this.previousScrollY = scrollY;

    // While explaining, stay put — only remember scroll direction for later.
    if (this.speaking) {
      window.clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = window.setTimeout(() => {
        if (this.destroyed || this.speaking) return;
        this.scrolling = false;
        this.applySectionBehavior();
      }, 220);
      return;
    }

    this.scrolling = true;

    // Fast scroll → escort boost (lean harder, travel mode)
    if (delta > 48) {
      this.element.dataset.escort = "true";
      this.setMode("travel");
    }

    if (this.activeSection !== "skills" && this.activeSection !== "projects") {
      this.setMode("travel");
    }
    this.routeDirty = true;
    this.scheduleFrame();
    window.clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      this.scrolling = false;
      this.element.dataset.escort = "false";
      this.applySectionBehavior();
    }, 160);
  };

  private onLocaleChange = () => {
    if (this.destroyed || this.suspended) return;
    this.lastSpeechSection = null;
    const tip =
      document.documentElement.lang === "en"
        ? "Language locked to English. I'll guide you from here."
        : "Idioma en español. Sigo contigo en el recorrido.";
    this.openSpeech(tip, 3600);
    this.setTemporaryMode("greet", 900, "idle");
  };

  private onContactSuccess = () => {
    if (this.destroyed || this.suspended) return;
    this.lastSpeechSection = null;
    const tip =
      document.documentElement.lang === "en"
        ? "Message sent. Nice move — Cristopher will see it soon."
        : "Mensaje enviado. Buena jugada — Cristopher lo verá pronto.";
    this.openSpeech(tip, 4200);
    this.setTemporaryMode("greet", 1600, "idle");
    this.element.dataset.celebrate = "true";
    window.setTimeout(() => {
      if (!this.destroyed) this.element.dataset.celebrate = "false";
    }, 2200);
  };

  private onSelectionChange = () => {
    if (this.destroyed || this.speaking || this.suspended) return;
    const selection = window.getSelection()?.toString().trim() ?? "";
    if (selection.length < 18) return;
    // Peek interest without spamming
    if (this.element.dataset.curious === "true") return;
    this.element.dataset.curious = "true";
    this.setTemporaryMode("observe", 1100, this.element.dataset.mode as RobotMode || "idle");
    window.setTimeout(() => {
      if (!this.destroyed) this.element.dataset.curious = "false";
    }, 1800);
  };

  private onResize = () => {
    if (this.reducedMotion) {
      this.current = this.getReducedPoint();
      this.destination = { ...this.current };
      this.render();
      return;
    }
    if (!this.speaking) this.updateDestination();
    this.scheduleFrame();
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      return;
    }
    if (!this.speaking) this.updateDestination();
    this.scheduleFrame();
  };
}
