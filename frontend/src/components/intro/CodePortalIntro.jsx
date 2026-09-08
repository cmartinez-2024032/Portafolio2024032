import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import "./code-portal.css";

const STORAGE_KEY = "forge-portal-seen";

const MODULES = [
  { id: "react", label: "React" },
  { id: "node", label: "Node" },
  { id: "dotnet", label: ".NET" },
  { id: "sql", label: "SQL" },
  { id: "three", label: "Three" },
  { id: "api", label: "API" },
];

/**
 * Next-level code portal: boot splash → live terminal → module HUD → compile wipe.
 */
export default function CodePortalIntro({
  name = "Cristopher Martínez",
  onComplete,
  returning = false,
}) {
  const { t, locale } = useLanguage();
  const completingRef = useRef(false);
  const bodyRef = useRef(null);
  const canvasRef = useRef(null);
  const lineIndexRef = useRef(0);
  const phaseRef = useRef("splash");

  const [bootIn, setBootIn] = useState(false);
  const [lines, setLines] = useState([]);
  const [typed, setTyped] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(returning ? 55 : 0);
  const [phase, setPhase] = useState(returning ? "boot" : "splash"); // splash | boot | compile | wipe
  const [exiting, setExiting] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [activeModules, setActiveModules] = useState(() => new Set());
  const [stats, setStats] = useState({ cpu: 12, mem: 28, net: 4, fps: 60 });
  const [uptime, setUptime] = useState(0);
  const [flashLine, setFlashLine] = useState(-1);

  const script = useMemo(() => buildScript(name, t, locale, returning), [name, t, locale, returning]);

  useEffect(() => {
    lineIndexRef.current = lineIndex;
  }, [lineIndex]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const finish = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;
    setPhase("wipe");
    setExiting(true);
    setProgress(100);
    setGlitch(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => onComplete?.(), 1300);
  }, [onComplete]);

  const skipAll = useCallback(() => {
    if (completingRef.current) return;
    setBootIn(true);
    setPhase("compile");
    setLines(script);
    setTyped("");
    setLineIndex(script.length);
    setProgress(100);
    setActiveModules(new Set(MODULES.map((m) => m.id)));
    window.setTimeout(finish, 420);
  }, [script, finish]);

  // Splash → boot
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const timer = window.setTimeout(finish, 400);
      return () => window.clearTimeout(timer);
    }

    document.body.style.overflow = "hidden";
    const bootTimer = window.setTimeout(() => setBootIn(true), 40);

    let splashTimer;
    if (phase === "splash") {
      splashTimer = window.setTimeout(() => setPhase("boot"), returning ? 400 : 1400);
    }

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skipAll();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const p = phaseRef.current;
        const idx = lineIndexRef.current;
        if (p === "wipe") return;
        if (p === "splash") {
          setPhase("boot");
          return;
        }
        if (idx < script.length) {
          const current = script[idx];
          setLines((prev) => [...prev, current]);
          setTyped("");
          setLineIndex(idx + 1);
          setProgress((prev) => Math.min(96, prev + 100 / (script.length + 2)));
          if (current.module) {
            setActiveModules((prev) => new Set([...prev, current.module]));
          }
          setFlashLine(idx);
        } else if (p !== "compile") {
          setPhase("compile");
        } else {
          finish();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(bootTimer);
      window.clearTimeout(splashTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [finish, skipAll, script, returning, phase]);

  // Typing engine
  useEffect(() => {
    if (phase !== "boot") return;
    if (lineIndex >= script.length) {
      setPhase("compile");
      return;
    }

    const entry = script[lineIndex];
    const speed = returning ? 7 : entry.speed ?? 20;
    let i = 0;
    let raf = 0;
    let last = performance.now();
    const delay = entry.delay ?? (returning ? 60 : 160);

    const startTimer = window.setTimeout(() => {
      const tick = (now) => {
        if (now - last >= speed) {
          last = now;
          i += entry.burst ? Math.min(3, entry.text.length - i) : 1;
          setTyped(entry.text.slice(0, i));
          if (i >= entry.text.length) {
            setLines((prev) => [...prev, entry]);
            setTyped("");
            setLineIndex((idx) => idx + 1);
            setProgress((p) => Math.min(92, p + 100 / (script.length + 1)));
            setFlashLine(lineIndex);
            if (entry.module) {
              setActiveModules((prev) => new Set([...prev, entry.module]));
            }
            if (entry.glitch) {
              setGlitch(true);
              window.setTimeout(() => setGlitch(false), 280);
            }
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

  // Compile drama
  useEffect(() => {
    if (phase !== "compile") return;
    setGlitch(true);
    setProgress(94);
    setActiveModules(new Set(MODULES.map((m) => m.id)));
    const a = window.setTimeout(() => setProgress(98), 280);
    const b = window.setTimeout(() => {
      setProgress(100);
      setGlitch(false);
    }, 620);
    const c = window.setTimeout(finish, returning ? 700 : 1200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, [phase, finish, returning]);

  // Live fake telemetry
  useEffect(() => {
    if (phase === "wipe") return;
    const id = window.setInterval(() => {
      setUptime((u) => u + 1);
      setStats((s) => ({
        cpu: clamp(s.cpu + (Math.random() * 14 - 5) + (phase === "compile" ? 8 : 0), 8, 96),
        mem: clamp(s.mem + (Math.random() * 8 - 3) + progress * 0.08, 18, 88),
        net: clamp(s.net + (Math.random() * 10 - 3), 2, 64),
        fps: 58 + Math.floor(Math.random() * 5),
      }));
    }, 220);
    return () => window.clearInterval(id);
  }, [phase, progress]);

  // Matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    let w = 0;
    let h = 0;
    let cols = [];
    let raf = 0;
    let disposed = false;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fontSize = isMobile ? 13 : 15;
      const colCount = Math.ceil(w / fontSize);
      cols = Array.from({ length: colCount }, () => Math.random() * -40);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    };

    const glyphs = "01<>[]{};:/\\|=+*#$@forgeCM";
    const draw = () => {
      if (disposed) return;
      raf = requestAnimationFrame(draw);
      ctx.fillStyle = "rgba(7, 8, 11, 0.12)";
      ctx.fillRect(0, 0, w, h);
      const fontSize = isMobile ? 13 : 15;
      for (let i = 0; i < cols.length; i++) {
        const ch = glyphs[(Math.random() * glyphs.length) | 0];
        const x = i * fontSize;
        const y = cols[i] * fontSize;
        ctx.fillStyle = i % 7 === 0 ? "rgba(158,197,255,0.55)" : "rgba(106,168,255,0.22)";
        ctx.fillText(ch, x, y);
        if (y > h && Math.random() > 0.975) cols[i] = 0;
        else cols[i] += 0.35 + Math.random() * 0.45;
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, typed, phase]);

  useEffect(() => {
    if (flashLine < 0) return;
    const t = window.setTimeout(() => setFlashLine(-1), 420);
    return () => window.clearTimeout(t);
  }, [flashLine]);

  const pct = Math.round(progress);
  const current = lineIndex < script.length ? script[lineIndex] : null;
  const badge =
    phase === "splash" ? "INIT" : phase === "compile" ? "BUILD" : phase === "wipe" ? "LAUNCH" : "BOOT";

  return (
    <div
      className={[
        "code-portal",
        bootIn ? "is-booted" : "",
        exiting ? "is-exiting" : "",
        returning ? "is-returning" : "",
        glitch ? "is-glitch" : "",
        phase === "compile" ? "is-compiling" : "",
        phase === "splash" ? "is-splash" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={t.portal.aria}
    >
      <canvas ref={canvasRef} className="code-portal-rain" aria-hidden="true" />
      <div className="code-portal-grid" aria-hidden="true" />
      <div className="code-portal-aurora" aria-hidden="true" />
      <div className="code-portal-scan" aria-hidden="true" />
      <div className="code-portal-vignette" aria-hidden="true" />
      <div className="code-portal-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="code-portal-wipe" aria-hidden="true" />
      <div className="code-portal-flash" aria-hidden="true" />

      {/* Splash monogram */}
      <div className={`code-splash ${phase === "splash" ? "is-on" : "is-off"}`} aria-hidden={phase !== "splash"}>
        <div className="code-splash-mark">CM</div>
        <p className="code-splash-sub">{t.portal.splash}</p>
        <div className="code-splash-bar">
          <span />
        </div>
      </div>

      <div className="code-portal-layout">
        {/* Left HUD */}
        <aside className="code-hud code-hud--left" aria-hidden="true">
          <p className="code-hud-label">{t.portal.sys}</p>
          <HudMeter label="CPU" value={stats.cpu} />
          <HudMeter label="MEM" value={stats.mem} />
          <HudMeter label="NET" value={stats.net} tone="soft" />
          <div className="code-hud-row">
            <span>FPS</span>
            <strong>{stats.fps}</strong>
          </div>
          <div className="code-hud-row">
            <span>UP</span>
            <strong>00:{String(uptime).padStart(2, "0")}</strong>
          </div>
          <div className="code-hud-pulse" />
        </aside>

        {/* Center stage */}
        <div className="code-portal-stage">
          <p className="code-portal-eyebrow">
            <span className="code-portal-dot" />
            {returning ? t.portal.eyebrowReturn : t.portal.eyebrow}
          </p>

          <h2 className="code-portal-title" data-text={name}>
            {name}
          </h2>

          <div className="code-portal-window">
            <div className="code-portal-titlebar">
              <div className="code-portal-traffic" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p className="code-portal-path">forge@portfolio — zsh</p>
              <span className={`code-portal-badge is-${badge.toLowerCase()}`}>{badge}</span>
            </div>

            <div className="code-portal-body" ref={bodyRef} role="log" aria-live="polite">
              {lines.map((line, idx) => (
                <TerminalLine
                  key={`${idx}-${line.text.slice(0, 16)}`}
                  line={line}
                  flash={flashLine === idx}
                />
              ))}
              {current && (typed || current.kind === "cmd") && (
                <TerminalLine line={{ ...current, text: typed || "" }} caret />
              )}
              {phase === "compile" && (
                <p className="code-line code-line--ok code-line--burst">
                  <span className="code-prefix">✔</span>
                  <span>{t.portal.compileOk}</span>
                </p>
              )}
            </div>

            <div className="code-portal-footer">
              <div
                className="code-portal-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
              >
                <span className="code-portal-fill" style={{ transform: `scaleX(${progress / 100})` }} />
                <span className="code-portal-fill-glow" style={{ left: `${progress}%` }} />
              </div>
              <div className="code-portal-meta">
                <span className="code-portal-status">
                  <span className="code-portal-status-dot" />
                  {phase === "compile" || phase === "wipe" ? t.portal.launching : t.portal.compiling}
                </span>
                <span className="code-portal-pct">{pct}%</span>
              </div>
            </div>
          </div>

          <div className="code-modules" aria-hidden="true">
            {MODULES.map((mod) => (
              <span
                key={mod.id}
                className={`code-module ${activeModules.has(mod.id) ? "is-on" : ""}`}
              >
                {mod.label}
              </span>
            ))}
          </div>

          <p className="code-portal-hint">{t.portal.hint}</p>

          {!returning && (
            <button type="button" className="code-portal-skip" onClick={skipAll}>
              {t.portal.skip}
            </button>
          )}
        </div>

        {/* Right HUD */}
        <aside className="code-hud code-hud--right" aria-hidden="true">
          <p className="code-hud-label">{t.portal.pipeline}</p>
          {(t.portal.pipelineSteps || []).map((step, i) => {
            const unlocked = progress > (i + 1) * (100 / 7) || phase === "compile" || phase === "wipe";
            return (
              <div key={step} className={`code-pipe ${unlocked ? "is-on" : ""}`}>
                <span className="code-pipe-mark">{unlocked ? "●" : "○"}</span>
                <span>{step}</span>
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

function HudMeter({ label, value, tone }) {
  return (
    <div className={`code-meter ${tone === "soft" ? "is-soft" : ""}`}>
      <div className="code-meter-top">
        <span>{label}</span>
        <strong>{Math.round(value)}%</strong>
      </div>
      <div className="code-meter-track">
        <span style={{ transform: `scaleX(${Math.min(1, value / 100)})` }} />
      </div>
    </div>
  );
}

function TerminalLine({ line, caret = false, flash = false }) {
  const kind = line.kind || "cmd";
  return (
    <p className={`code-line code-line--${kind} ${flash ? "is-flash" : ""} ${caret ? "is-typing" : ""}`}>
      {kind === "cmd" && <span className="code-prompt">{line.prompt || "$"}</span>}
      {kind === "out" && <span className="code-prefix">→</span>}
      {kind === "ok" && <span className="code-prefix">✔</span>}
      {kind === "warn" && <span className="code-prefix">!</span>}
      {kind === "info" && <span className="code-prefix">#</span>}
      {kind === "dim" && <span className="code-prefix">·</span>}
      <span className="code-text">
        {highlight(line.text, kind)}
        {caret && <span className="code-caret" aria-hidden="true" />}
      </span>
    </p>
  );
}

function highlight(text, kind) {
  if (kind !== "cmd") return text;
  // Soft syntax coloring for flags / strings
  const parts = text.split(/("[^"]*"|--?[\w-]+)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('"')) return <span key={i} className="tok-str">{part}</span>;
    if (part.startsWith("-")) return <span key={i} className="tok-flag">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function buildScript(name, t, _locale, returning) {
  const n = name || "Cristopher Martínez";
  const L = t.portal.lines;

  if (returning) {
    return [
      { kind: "info", text: L.restore, speed: 8, delay: 40 },
      { kind: "cmd", text: "forge resume --session portfolio", speed: 8, delay: 30 },
      { kind: "out", text: L.restoreOk, speed: 7, delay: 30 },
      { kind: "cmd", text: "hydrate modules --hot", speed: 8, delay: 30, module: "react" },
      { kind: "ok", text: L.ready, speed: 7, delay: 30 },
      { kind: "cmd", text: "launch --target hero", speed: 8, delay: 30 },
    ];
  }

  return [
    { kind: "info", text: L.banner, speed: 12, delay: 120 },
    { kind: "dim", text: L.kernel, speed: 10, delay: 80, burst: true },
    { kind: "cmd", text: "forge init portfolio --secure", speed: 20, delay: 200 },
    { kind: "out", text: L.init, speed: 11, delay: 90 },
    { kind: "cmd", text: `load identity --user "${n}"`, speed: 16, delay: 160 },
    { kind: "ok", text: L.identity, speed: 10, delay: 80 },
    { kind: "cmd", text: "mount ./stack --watch", speed: 16, delay: 140, module: "react" },
    { kind: "out", text: L.mount, speed: 10, delay: 70 },
    { kind: "cmd", text: "import skills --from stack.json", speed: 15, delay: 140, module: "node" },
    { kind: "out", text: L.skills, speed: 10, delay: 70, module: "dotnet" },
    { kind: "cmd", text: "link database --engine sql", speed: 15, delay: 130, module: "sql" },
    { kind: "ok", text: L.db, speed: 10, delay: 70 },
    { kind: "cmd", text: "compile projects --release --optimize", speed: 14, delay: 140, module: "api", glitch: true },
    { kind: "out", text: L.projects, speed: 10, delay: 70 },
    { kind: "warn", text: L.warn, speed: 11, delay: 80 },
    { kind: "cmd", text: "inject motion --lib three", speed: 14, delay: 120, module: "three" },
    { kind: "ok", text: L.motion, speed: 10, delay: 70 },
    { kind: "cmd", text: "audit security --quiet", speed: 14, delay: 120 },
    { kind: "ok", text: L.audit, speed: 10, delay: 70 },
    { kind: "cmd", text: "launch --target hero --open", speed: 14, delay: 140, glitch: true },
    { kind: "ok", text: L.ready, speed: 10, delay: 90 },
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
