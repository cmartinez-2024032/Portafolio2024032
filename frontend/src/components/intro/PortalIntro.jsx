import { useEffect, useRef, useState, useCallback } from "react";
import { createPortalScene } from "./portalScene";
import "./portal-intro.css";

const STORAGE_KEY = "forge-portal-seen";

/**
 * Cinematic 3D portal gate.
 * Scroll / wheel / touch advances into the ember tunnel;
 * at the end the portfolio unlocks.
 */
export default function PortalIntro({ name = "Cristopher Martínez", onComplete }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const progressRef = useRef(0);
  const completingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  const finish = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;
    setExiting(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => onComplete?.(), 900);
  }, [onComplete]);

  const applyProgress = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(1, next));
      progressRef.current = clamped;
      setProgress(clamped);
      sceneRef.current?.setProgress(clamped);
      if (clamped > 0.04) setHintVisible(false);
      if (clamped >= 0.985) finish();
    },
    [finish],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Instant path for a11y — still show a brief branded beat.
      const timer = window.setTimeout(finish, 700);
      return () => window.clearTimeout(timer);
    }

    const scene = createPortalScene(canvas);
    sceneRef.current = scene;
    scene.start();

    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.00115;
      applyProgress(progressRef.current + delta);
    };

    let touchY = null;
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      const delta = (touchY - y) * 0.0045;
      touchY = y;
      applyProgress(progressRef.current + delta);
      e.preventDefault();
    };

    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        applyProgress(progressRef.current + 0.12);
      }
      if (e.key === "Escape") finish();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      scene.dispose();
      sceneRef.current = null;
    };
  }, [applyProgress, finish]);

  const first = name.split(" ")[0] || name;
  const pct = Math.round(progress * 100);

  return (
    <div className={`portal-intro ${exiting ? "is-exiting" : ""}`} aria-label="Introducción al portafolio">
      <canvas ref={canvasRef} className="portal-intro-canvas" aria-hidden="true" />

      <div className="portal-intro-vignette" aria-hidden="true" />
      <div
        className="portal-intro-flash"
        style={{ opacity: Math.max(0, (progress - 0.82) * 4.5) }}
        aria-hidden="true"
      />

      <div className="portal-intro-ui">
        <p className="portal-intro-eyebrow">
          <span className="portal-intro-dot" />
          Entrando al sistema
        </p>

        <h1 className="portal-intro-title">
          <span>{first}</span>
          <span className="portal-intro-title-accent">Forge</span>
        </h1>

        <p className="portal-intro-sub">Desplázate para atravesar el portal</p>

        <div className="portal-intro-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span className="portal-intro-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>

        <p className={`portal-intro-hint ${hintVisible ? "is-visible" : ""}`}>
          Scroll
          <span className="portal-intro-hint-line" />
        </p>

        <button type="button" className="portal-intro-skip" onClick={finish}>
          Saltar intro
        </button>
      </div>
    </div>
  );
}

/** Returns true if this browser session already completed the portal. */
export function hasSeenPortal() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
