import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { markPortalSeen } from "../introSession";
import { createRoomScene } from "./roomScene";
import "./room-intro.css";

const EXIT_MS = 700;
const END_AT = 0.985;
// Wheel/trackpad momentum must die out before the site takes over, or it scrolls the page.
const SETTLE_MS = 450;
const MAX_HOLD_MS = 2500;

/**
 * Intro: a night-time gamer setup. Scrolling (wheel, swipe or arrow keys) walks the camera
 * through the room and into the main monitor, which is already showing the site's hero.
 */
export default function RoomIntro({ personal, onComplete }) {
  const { t, locale } = useLanguage();
  const stageRef = useRef(null);
  const fillRef = useRef(null);
  const sceneRef = useRef(null);
  const goalRef = useRef(0);
  const doneRef = useRef(false);
  const lastInputRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    markPortalSeen();
    setExiting(true);
    const start = performance.now();
    const handOff = () => {
      const now = performance.now();
      const settled = now - lastInputRef.current >= SETTLE_MS;
      if (now - start < EXIT_MS || (!settled && now - start < MAX_HOLD_MS)) {
        window.setTimeout(handOff, 100);
        return;
      }
      window.scrollTo(0, 0);
      onCompleteRef.current?.();
    };
    window.setTimeout(handOff, EXIT_MS);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return undefined;
    }
    const nav = t.nav.sections.slice(0, 4).map((s) => s.label);
    // A fresh canvas per mount: a disposed scene leaves its WebGL context lost.
    const canvas = document.createElement("canvas");
    canvas.className = "room-intro-canvas";
    canvas.setAttribute("aria-hidden", "true");
    stageRef.current.appendChild(canvas);
    let cancelled = false;
    let scene;
    try {
      scene = createRoomScene(canvas, {
        content: {
          name: personal?.name || "Cristopher Martínez",
          role: t.hero.title,
          phrase: locale === "en" ? t.personalFallback.phrase : personal?.phrase || t.hero.phraseFallback,
          eyebrow: t.hero.eyebrow,
          cta: t.hero.ctaProjects,
          ctaCv: t.hero.ctaCv,
          nav,
        },
        onLoadProgress: setLoaded,
        onFrame: (p) => {
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
          if (p >= END_AT) finish();
        },
      });
    } catch {
      canvas.remove();
      finish();
      return undefined;
    }
    sceneRef.current = scene;
    scene.ready.then(
      () => !cancelled && setReady(true),
      () => !cancelled && finish(),
    );
    return () => {
      cancelled = true;
      scene.dispose();
      canvas.remove();
      sceneRef.current = null;
    };
    // The scene is built once; language changes only affect the HUD.
  }, [finish]);

  useEffect(() => {
    if (!ready) return undefined;
    const advance = (delta) => {
      lastInputRef.current = performance.now();
      goalRef.current = Math.max(0, Math.min(1, goalRef.current + delta));
      sceneRef.current?.setProgress(goalRef.current);
      if (goalRef.current > 0.02) setMoved(true);
    };
    const onWheel = (e) => {
      e.preventDefault();
      advance(e.deltaY * 0.0009);
    };
    let touchY = null;
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e) => {
      if (touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      advance((touchY - y) * 0.0032);
      touchY = y;
      e.preventDefault();
    };
    const onKey = (e) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) advance(0.1);
      else if (["ArrowUp", "PageUp"].includes(e.key)) advance(-0.1);
      else if (e.key === "Escape") finish();
      else return;
      e.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready, finish]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className={`room-intro ${ready ? "is-ready" : ""} ${exiting ? "is-exiting" : ""}`} role="dialog" aria-label={t.portal.aria}>
      <div ref={stageRef} className="room-intro-stage" />

      <div className="room-intro-loader" role="status" aria-hidden={ready}>
        <p>{t.portal.loading}</p>
        <span className="room-intro-bar">
          <i style={{ transform: `scaleX(${loaded})` }} />
        </span>
        <small>{Math.round(loaded * 100)}%</small>
      </div>

      <button type="button" className="room-intro-skip" onClick={finish}>
        {t.portal.skip}
      </button>

      <p className={`room-intro-hint ${ready && !moved ? "is-visible" : ""}`}>
        {t.portal.hint}
        <span className="room-intro-hint-line" />
      </p>

      <span className="room-intro-progress" aria-hidden="true">
        <i ref={fillRef} />
      </span>
    </div>
  );
}
