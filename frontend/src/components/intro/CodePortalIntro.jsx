import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import "./code-portal.css";

const STORAGE_KEY = "forge-portal-seen";

/**
 * Code portal intro: auto-typing terminal that "compiles" into the portfolio.
 */
export default function CodePortalIntro({
  name = "Cristopher Martínez",
  onComplete,
  returning = false,
}) {
  const { t, locale } = useLanguage();
  const completingRef = useRef(false);
  const [lines, setLines] = useState([]);
  const [typed, setTyped] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(returning ? 72 : 0);
  const [phase, setPhase] = useState("boot"); // boot | compile | wipe
  const [exiting, setExiting] = useState(false);
  const bodyRef = useRef(null);

  const script = useMemo(() => buildScript(name, t, locale, returning), [name, t, locale, returning]);

  const finish = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;
    setPhase("wipe");
    setExiting(true);
    setProgress(100);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => onComplete?.(), 1100);
  }, [onComplete]);

  const skipAll = useCallback(() => {
    if (completingRef.current) return;
    setLines(script.map((s) => ({ ...s, text: s.text })));
    setTyped("");
    setLineIndex(script.length);
    setProgress(100);
    setPhase("compile");
    window.setTimeout(finish, 280);
  }, [script, finish]);

  // Auto-type lines
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const timer = window.setTimeout(finish, 500);
      return () => window.clearTimeout(timer);
    }

    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skipAll();
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Jump current line / accelerate
        if (phase === "wipe") return;
        if (lineIndex < script.length) {
          const current = script[lineIndex];
          setLines((prev) => [...prev, current]);
          setTyped("");
          setLineIndex((i) => i + 1);
          setProgress((p) => Math.min(96, p + 100 / (script.length + 2)));
        } else if (phase !== "compile") {
          setPhase("compile");
        } else {
          finish();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [finish, skipAll, script, lineIndex, phase]);

  // Typing engine
  useEffect(() => {
    if (phase === "wipe" || phase === "compile") return;
    if (lineIndex >= script.length) {
      setPhase("compile");
      return;
    }

    const entry = script[lineIndex];
    const speed = returning ? 8 : entry.speed ?? 22;
    let i = 0;
    let raf = 0;
    let last = performance.now();
    const delay = entry.delay ?? (returning ? 80 : 220);

    const startTimer = window.setTimeout(() => {
      const tick = (now) => {
        if (now - last >= speed) {
          last = now;
          i += 1;
          setTyped(entry.text.slice(0, i));
          if (i >= entry.text.length) {
            setLines((prev) => [...prev, entry]);
            setTyped("");
            setLineIndex((idx) => idx + 1);
            setProgress((p) => Math.min(92, p + 100 / (script.length + 1)));
            return;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, [lineIndex, script, phase, returning]);

  // Compile phase → fill to 100% then wipe
  useEffect(() => {
    if (phase !== "compile") return;
    setProgress(94);
    const a = window.setTimeout(() => setProgress(100), 320);
    const b = window.setTimeout(finish, returning ? 520 : 900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [phase, finish, returning]);

  // Keep terminal scrolled to bottom
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, typed]);

  const pct = Math.round(progress);
  const current = lineIndex < script.length ? script[lineIndex] : null;

  return (
    <div
      className={`code-portal ${exiting ? "is-exiting" : ""} ${returning ? "is-returning" : ""}`}
      aria-label={t.portal.aria}
    >
      <div className="code-portal-grid" aria-hidden="true" />
      <div className="code-portal-scan" aria-hidden="true" />
      <div className="code-portal-wipe" aria-hidden="true" />

      <div className="code-portal-stage">
        <p className="code-portal-eyebrow">
          <span className="code-portal-dot" />
          {returning ? t.portal.eyebrowReturn : t.portal.eyebrow}
        </p>

        <div className="code-portal-window">
          <div className="code-portal-titlebar">
            <div className="code-portal-traffic" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="code-portal-path">forge@portfolio — zsh</p>
            <span className="code-portal-badge">{phase === "compile" || phase === "wipe" ? "READY" : "BOOT"}</span>
          </div>

          <div className="code-portal-body" ref={bodyRef} role="log" aria-live="polite">
            {lines.map((line, idx) => (
              <TerminalLine key={`${idx}-${line.text.slice(0, 12)}`} line={line} />
            ))}
            {current && typed && (
              <TerminalLine line={{ ...current, text: typed }} caret />
            )}
            {phase === "compile" && (
              <p className="code-line code-line--ok">
                <span className="code-prefix">✔</span>
                <span>{t.portal.compileOk}</span>
              </p>
            )}
          </div>

          <div className="code-portal-footer">
            <div className="code-portal-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span className="code-portal-fill" style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <div className="code-portal-meta">
              <span>{t.portal.compiling}</span>
              <span className="code-portal-pct">{pct}%</span>
            </div>
          </div>
        </div>

        <p className="code-portal-hint">{t.portal.hint}</p>

        {!returning && (
          <button type="button" className="code-portal-skip" onClick={skipAll}>
            {t.portal.skip}
          </button>
        )}
      </div>
    </div>
  );
}

function TerminalLine({ line, caret = false }) {
  const kind = line.kind || "cmd";
  return (
    <p className={`code-line code-line--${kind}`}>
      {kind === "cmd" && <span className="code-prompt">{line.prompt || "$"}</span>}
      {kind === "out" && <span className="code-prefix">→</span>}
      {kind === "ok" && <span className="code-prefix">✔</span>}
      {kind === "info" && <span className="code-prefix">#</span>}
      <span className="code-text">{line.text}</span>
      {caret && <span className="code-caret" aria-hidden="true" />}
    </p>
  );
}

function buildScript(name, t, _locale, returning) {
  const n = name || "Cristopher Martínez";
  if (returning) {
    return [
      { kind: "info", text: t.portal.lines.restore, speed: 10, delay: 60 },
      { kind: "cmd", text: "forge resume --session portfolio", speed: 10, delay: 40 },
      { kind: "out", text: t.portal.lines.restoreOk, speed: 8, delay: 40 },
      { kind: "cmd", text: "launch --target hero", speed: 10, delay: 40 },
      { kind: "ok", text: t.portal.lines.ready, speed: 8, delay: 40 },
    ];
  }

  return [
    { kind: "info", text: "Forge runtime v2.0 — session start", speed: 16, delay: 180 },
    { kind: "cmd", text: "forge init portfolio", speed: 24, delay: 260 },
    { kind: "out", text: t.portal.lines.init, speed: 14, delay: 120 },
    { kind: "cmd", text: `load identity --user "${n}"`, speed: 18, delay: 200 },
    { kind: "ok", text: t.portal.lines.identity, speed: 12, delay: 100 },
    { kind: "cmd", text: "import skills --from ./stack.json", speed: 18, delay: 180 },
    { kind: "out", text: t.portal.lines.skills, speed: 12, delay: 100 },
    { kind: "cmd", text: "compile projects --release", speed: 18, delay: 180 },
    { kind: "out", text: t.portal.lines.projects, speed: 12, delay: 100 },
    { kind: "cmd", text: "launch --target hero --open", speed: 18, delay: 180 },
    { kind: "ok", text: t.portal.lines.ready, speed: 12, delay: 120 },
  ];
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
