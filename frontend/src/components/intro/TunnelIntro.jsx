import { useEffect, useRef, useState, useCallback } from "react";
import { createTunnelScene } from "./tunnelScene";
import { useLanguage } from "../../i18n/LanguageContext";
import "./tunnel-intro.css";

const STORAGE_KEY = "forge-portal-seen";

/**
 * Scroll-driven architectural tunnel + walking silhouette.
 * Replaces the orbit portal as the portfolio entrance.
 */
export default function TunnelIntro({
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
  const [hintVisible, setHintVisible] = useState(initialProgress < 0.05);

  const finish = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;
    setExiting(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => onComplete?.(), 950);
  }, [onComplete]);

  const applyProgress = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(1, next));
      progressRef.current = clamped;
      setProgress(clamped);
      sceneRef.current?.setProgress(clamped);

      if (clamped < 0.85) canCompleteRef.current = true;
      if (clamped > 0.05) setHintVisible(false);
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

    const scene = createTunnelScene(canvas);
    sceneRef.current = scene;
    scene.setProgress(progressRef.current);
    scene.start();

    const onWheel = (e) => {
      e.preventDefault();
      applyProgress(progressRef.current + e.deltaY * 0.00105);
    };

    let touchY = null;
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      const delta = (touchY - y) * 0.0042;
      touchY = y;
      applyProgress(progressRef.current + delta);
      e.preventDefault();
    };

    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        applyProgress(progressRef.current + 0.1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        applyProgress(progressRef.current - 0.1);
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
  const nearExit = progress > 0.72;
  const uiFade = Math.max(0, 1 - Math.max(0, progress - 0.62) / 0.32);
  const flash = Math.max(0, (progress - 0.82) * 5.5);

  return (
    <div
      className={`tunnel-intro ${exiting ? "is-exiting" : ""} ${returning ? "is-returning" : ""}`}
      aria-label={t.portal.aria}
    >
      <canvas ref={canvasRef} className="tunnel-intro-canvas" aria-hidden="true" />

      <div className="tunnel-intro-vignette" aria-hidden="true" />
      <div className="tunnel-intro-flash" style={{ opacity: flash }} aria-hidden="true" />

      <div className="tunnel-intro-ui" style={{ opacity: uiFade }}>
        <p className="tunnel-intro-eyebrow">
          <span className="tunnel-intro-dot" />
          {returning || progress < 0.18 ? t.portal.eyebrowReturn : t.portal.eyebrow}
        </p>

        <h1 className="tunnel-intro-title">
          <span>{name}</span>
        </h1>

        <p className="tunnel-intro-sub">
          {returning || progress < 0.18 ? t.portal.subReturn : t.portal.sub}
        </p>
      </div>

      <div className="tunnel-intro-chrome" style={{ opacity: Math.max(uiFade, nearExit ? 0.85 : 0) }}>
        <div
          className="tunnel-intro-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <span className="tunnel-intro-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>

        <p className={`tunnel-intro-hint ${hintVisible || nearExit ? "is-visible" : ""} ${nearExit ? "is-exit" : ""}`}>
          {nearExit ? t.portal.hintExit : t.portal.hint}
          <span className="tunnel-intro-hint-line" />
        </p>

        {!returning && (
          <button type="button" className="tunnel-intro-skip" onClick={finish}>
            {t.portal.skip}
          </button>
        )}
      </div>
    </div>
  );
}

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
