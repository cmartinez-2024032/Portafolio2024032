import { useEffect, useRef, useState, useCallback } from "react";
import { createPortalScene } from "./portalScene";
import { useLanguage } from "../../i18n/LanguageContext";
import "./portal-intro.css";

const STORAGE_KEY = "forge-portal-seen";

/**
 * Cinematic 3D portal gate.
 * Scroll down enters the portfolio; from the site top, scroll up reopens
 * the tunnel so you can drift back toward the galaxy.
 */
export default function PortalIntro({
  name = "Cristopher Martínez",
  onComplete,
  initialProgress = 0,
  returning = false,
}) {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const progressRef = useRef(initialProgress);
  const completingRef = useRef(false);
  const canCompleteRef = useRef(initialProgress < 0.55);
  const [progress, setProgress] = useState(initialProgress);
  const [exiting, setExiting] = useState(false);
  const [hintVisible, setHintVisible] = useState(initialProgress < 0.04);

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

      if (clamped < 0.85) canCompleteRef.current = true;
      if (clamped > 0.04) setHintVisible(false);
      else setHintVisible(true);

      if (clamped >= 0.985 && canCompleteRef.current) finish();
    },
    [finish],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const timer = window.setTimeout(finish, 700);
      return () => window.clearTimeout(timer);
    }

    const scene = createPortalScene(canvas);
    sceneRef.current = scene;
    scene.setProgress(progressRef.current);
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
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        applyProgress(progressRef.current - 0.12);
      }
      if (e.key === "Escape" && !returning) finish();
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
  }, [applyProgress, finish, returning]);

  const pct = Math.round(progress * 100);
  const nearGalaxy = progress < 0.22;

  return (
    <div
      className={`portal-intro ${exiting ? "is-exiting" : ""} ${returning ? "is-returning" : ""}`}
      aria-label={t.portal.aria}
    >
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
          {returning || nearGalaxy ? t.portal.eyebrowReturn : t.portal.eyebrow}
        </p>

        <h1 className="portal-intro-title">
          <span>{name}</span>
        </h1>

        <p className="portal-intro-sub">
          {returning || nearGalaxy ? t.portal.subReturn : t.portal.sub}
        </p>

        <div
          className="portal-intro-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <span className="portal-intro-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>

        <p className={`portal-intro-hint ${hintVisible ? "is-visible" : ""}`}>
          {t.portal.hint}
          <span className="portal-intro-hint-line" />
        </p>

        {!returning && (
          <button type="button" className="portal-intro-skip" onClick={finish}>
            {t.portal.skip}
          </button>
        )}
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

export function clearPortalSeen() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
