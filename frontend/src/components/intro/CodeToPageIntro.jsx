import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
// code-portal.css still carries light-theme rules for the rest of the site.
import "./code-portal.css";
import "./code-to-page.css";

const STORAGE_KEY = "forge-portal-seen";
const CHAR_MS = 14;
const LINE_PAUSE_MS = 90;
const BLANK_PAUSE_MS = 60;
const COMPILE_MS = 1200;
const EXPAND_MS = 1150;
const FADE_MS = 500;

const KEYWORDS = new Set(["import", "from", "export", "default", "function", "return"]);
const TOKEN = /("[^"]*"?|<\/?[A-Za-z][\w.]*|\/?>|\b[A-Za-z]+\b)/;

/**
 * Intro: the hero's source is typed in an editor while a live preview renders each element,
 * then the build succeeds and the preview grows into the real page.
 */
export default function CodeToPageIntro({ personal, onComplete, returning = false }) {
  const { t, locale } = useLanguage();
  const name = personal?.name || "Cristopher Martínez";
  const photo = personal?.photo || null;
  const phrase = locale === "en" ? t.personalFallback.phrase : personal?.phrase || t.hero.phraseFallback;
  const speed = returning ? 0.45 : 1;

  const lines = useMemo(
    () =>
      buildLines({
        first: name.split(" ")[0],
        eyebrow: t.hero.eyebrow,
        name,
        role: t.hero.title,
        phrase,
        cta: t.hero.ctaProjects,
      }),
    [name, phrase, t.hero.eyebrow, t.hero.title, t.hero.ctaProjects],
  );
  const timeline = useMemo(() => buildTimeline(lines, speed), [lines, speed]);

  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState("type");
  const boostRef = useRef(0);
  const phaseRef = useRef(phase);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Typing clock
  useEffect(() => {
    if (phase !== "type") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) boostRef.current = timeline.total;
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const e = now - start + boostRef.current;
      if (e >= timeline.total) {
        setElapsed(timeline.total);
        setPhase("compile");
        return;
      }
      setElapsed(e);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, timeline]);

  // Build → expand → fade → hand off to the site
  useEffect(() => {
    let id = 0;
    if (phase === "compile") id = window.setTimeout(() => setPhase("expand"), COMPILE_MS * speed);
    if (phase === "expand") id = window.setTimeout(() => setPhase("fade"), EXPAND_MS);
    if (phase === "fade") {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      id = window.setTimeout(() => onCompleteRef.current?.(), FADE_MS);
    }
    return () => window.clearTimeout(id);
  }, [phase, speed]);

  // Enter / tap fast-forwards; the page behind stays locked meanwhile
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const advance = () => {
      if (phaseRef.current === "type") boostRef.current = Number.MAX_SAFE_INTEGER;
      else if (phaseRef.current === "compile") setPhase("expand");
    };
    const onKey = (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      advance();
    };
    const onPointer = (e) => {
      if (e.pointerType === "touch" || e.pointerType === "pen") advance();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      document.body.style.overflow = "";
    };
  }, []);

  const shown = [];
  const revealed = new Set();
  for (let i = 0; i < lines.length; i++) {
    const { start, end } = timeline.lines[i];
    if (elapsed < start) break;
    const done = elapsed >= end;
    const cols = done ? lines[i].text.length : Math.floor((elapsed - start) / timeline.charMs);
    shown.push({ i, text: lines[i].text.slice(0, cols) });
    if (done && lines[i].reveal) revealed.add(lines[i].reveal);
  }
  const currentLine = shown.length ? shown[shown.length - 1].i : 0;
  const typing = phase === "type";
  const built = phase !== "type" && phase !== "compile";
  const on = (key) => (revealed.has(key) ? "is-on" : "");

  return (
    <div
      className={`ctp ${phase === "expand" || phase === "fade" ? "is-expanding" : ""} ${phase === "fade" ? "is-fading" : ""}`}
      role="dialog"
      aria-label={t.portal.aria}
    >
      <div className="ctp-window">
        <div className="ctp-body">
          <section className="ctp-editor" aria-hidden="true">
            <div className="ctp-tabs">
              <span className="ctp-tab is-active">
                <i className={`ctp-tab-dot ${built ? "is-saved" : ""}`} />
                Hero.jsx
              </span>
              <span className="ctp-tab">App.jsx</span>
              <span className="ctp-tab">index.css</span>
            </div>

            <div className="ctp-code">
              {shown.map((line) => (
                <div key={line.i} className={`ctp-line ${line.i === currentLine ? "is-current" : ""}`}>
                  <span className="ctp-ln">{line.i + 1}</span>
                  <span className="ctp-src">
                    {highlight(line.text)}
                    {line.i === currentLine && <i className={`ctp-caret ${typing ? "" : "is-idle"}`} />}
                  </span>
                </div>
              ))}
            </div>

            <div className="ctp-status">
              <span className="ctp-branch">main</span>
              <span className={`ctp-build ${built ? "is-ok" : ""}`}>
                {phase === "type" && t.portal.writing}
                {phase === "compile" && (
                  <>
                    <i className="ctp-spin" />
                    {t.portal.building}
                  </>
                )}
                {built && `✓ ${t.portal.built}`}
              </span>
            </div>
          </section>

          <section className="ctp-preview" aria-hidden="true">
            <div className="ctp-chrome">
              <span className="ctp-dots">
                <span />
                <span />
                <span />
              </span>
              <span className="ctp-url">localhost:5173</span>
              <span className={`ctp-http ${built ? "is-live" : ""}`}>200 OK</span>
            </div>

            <div className="ctp-page">
              <div className={`ctp-el ctp-photo ${on("photo")}`}>
                {photo ? <img src={photo} alt="" /> : <span>{name.charAt(0)}</span>}
              </div>
              <p className={`ctp-el ctp-eyebrow ${on("eyebrow")}`}>
                <i />
                {t.hero.eyebrow}
              </p>
              <h2 className={`ctp-el ctp-name ${on("name")}`}>{name}</h2>
              <p className={`ctp-el ctp-role ${on("role")}`}>{t.hero.title}</p>
              <p className={`ctp-el ctp-phrase ${on("phrase")}`}>{phrase}</p>
              <div className={`ctp-el ctp-cta ${on("cta")}`}>
                <span className="ctp-btn is-primary">{t.hero.ctaProjects}</span>
                <span className="ctp-btn">{t.hero.ctaCv}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p className="ctp-hint">{t.portal.hint}</p>
    </div>
  );
}

function buildLines({ first, eyebrow, name, role, phrase, cta }) {
  return [
    { text: 'import { motion } from "framer-motion";' },
    { text: "" },
    { text: "export default function Hero() {" },
    { text: "  return (" },
    { text: '    <motion.section className="hero">' },
    { text: `      <img src="/img/me.jpg" alt="${first}" />`, reveal: "photo" },
    { text: `      <Badge>${eyebrow}</Badge>`, reveal: "eyebrow" },
    { text: `      <h1>${name}</h1>`, reveal: "name" },
    { text: `      <h2>${role}</h2>`, reveal: "role" },
    { text: `      <p>${phrase}</p>`, reveal: "phrase" },
    { text: `      <Button>${cta}</Button>`, reveal: "cta" },
    { text: "    </motion.section>" },
    { text: "  );" },
    { text: "}" },
  ];
}

function buildTimeline(lines, speed) {
  const charMs = CHAR_MS * speed;
  let cursor = 250 * speed;
  const out = lines.map((line) => {
    const start = cursor;
    const end = start + line.text.length * charMs;
    cursor = end + (line.text.trim() ? LINE_PAUSE_MS : BLANK_PAUSE_MS) * speed;
    return { start, end };
  });
  return { lines: out, total: cursor, charMs };
}

function highlight(text) {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (!part) return null;
    const cls = tokenClass(part, parts[i + 1]);
    return cls ? (
      <span key={i} className={cls}>
        {part}
      </span>
    ) : (
      part
    );
  });
}

function tokenClass(part, next) {
  if (part.startsWith('"')) return "ctp-str";
  if (part.startsWith("<") || part === ">" || part === "/>") return "ctp-tag";
  if (KEYWORDS.has(part)) return "ctp-kw";
  if (next?.startsWith("=")) return "ctp-attr";
  return null;
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
