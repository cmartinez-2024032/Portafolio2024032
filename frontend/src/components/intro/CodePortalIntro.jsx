import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import "./code-portal.css";

const STORAGE_KEY = "forge-portal-seen";

const MODULES = [
  { id: "react", label: "React", hue: 190 },
  { id: "node", label: "Node", hue: 145 },
  { id: "dotnet", label: ".NET", hue: 265 },
  { id: "sql", label: "SQL", hue: 210 },
  { id: "three", label: "Three", hue: 200 },
  { id: "api", label: "API", hue: 175 },
];

/**
 * Cinematic code portal — splash → CRT power → terminal → sync → launch.
 */
export default function CodePortalIntro({
  name = "Cristopher Martínez",
  onComplete,
  returning = false,
}) {
  const { t, locale } = useLanguage();
  const completingRef = useRef(false);
  const bodyRef = useRef(null);
  const rainRef = useRef(null);
  const fxRef = useRef(null);
  const stageRef = useRef(null);
  const lineIndexRef = useRef(0);
  const phaseRef = useRef(returning ? "boot" : "splash");
  const burstsRef = useRef([]);

  const [bootIn, setBootIn] = useState(false);
  const [lines, setLines] = useState([]);
  const [typed, setTyped] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(returning ? 48 : 0);
  const [phase, setPhase] = useState(returning ? "boot" : "splash");
  // splash | power | boot | sync | compile | launch | wipe
  const [exiting, setExiting] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [activeModules, setActiveModules] = useState(() => new Set());
  const [stats, setStats] = useState({ cpu: 8, mem: 22, net: 3, fps: 60 });
  const [uptime, setUptime] = useState(0);
  const [flashLine, setFlashLine] = useState(-1);
  const [countdown, setCountdown] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [wave, setWave] = useState(() => Array.from({ length: 16 }, () => 0.2));

  const [toasts, setToasts] = useState([]);
  const [scanKick, setScanKick] = useState(0);
  const toastId = useRef(0);

  const script = useMemo(() => buildScript(name, t, locale, returning), [name, t, locale, returning]);
  const circumference = 2 * Math.PI * 54;
  const slow = returning ? 0.55 : 1;

  useEffect(() => {
    lineIndexRef.current = lineIndex;
  }, [lineIndex]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const pushToast = useCallback((label) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-3), { id, label }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 2200 * (returning ? 0.7 : 1));
  }, [returning]);

  const spawnBurst = useCallback((x = 0.5, y = 0.45, color = "#6aa8ff") => {
    burstsRef.current.push({
      x,
      y,
      color,
      life: 1,
      seeds: Array.from({ length: 26 }, () => ({
        a: Math.random() * Math.PI * 2,
        s: 50 + Math.random() * 150,
        r: 1.2 + Math.random() * 3,
      })),
    });
  }, []);

  const unlockModule = useCallback(
    (moduleId) => {
      if (!moduleId) return;
      setActiveModules((prev) => new Set([...prev, moduleId]));
      const mod = MODULES.find((m) => m.id === moduleId);
      spawnBurst(0.52, 0.58, `hsl(${mod?.hue ?? 200} 90% 65%)`);
      pushToast(`${mod?.label ?? moduleId} online`);
      setScanKick((k) => k + 1);
    },
    [spawnBurst, pushToast],
  );

  const finish = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;
    setPhase("wipe");
    setExiting(true);
    setProgress(100);
    setGlitch(true);
    spawnBurst(0.5, 0.5, "#9ec5ff");
    spawnBurst(0.35, 0.4, "#6aa8ff");
    spawnBurst(0.65, 0.55, "#9af0c7");
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    window.setTimeout(() => onComplete?.(), 2100);
  }, [onComplete, spawnBurst]);

  // Boot + keyboard (Enter acelera; no skip)
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const timer = window.setTimeout(finish, 500);
      return () => window.clearTimeout(timer);
    }

    document.body.style.overflow = "hidden";
    const bootTimer = window.setTimeout(() => setBootIn(true), 30);

    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const p = phaseRef.current;
        const idx = lineIndexRef.current;
        if (p === "wipe" || p === "launch") return;
        if (p === "splash" || p === "power") {
          setPhase("boot");
          return;
        }
        if (idx < script.length) {
          const current = script[idx];
          setLines((prev) => [...prev, current]);
          setTyped("");
          setLineIndex(idx + 1);
          setProgress((prev) => Math.min(94, prev + 100 / (script.length + 2)));
          unlockModule(current.module);
          setFlashLine(idx);
        } else if (p === "boot") {
          setPhase("sync");
        } else if (p === "sync") {
          setPhase("compile");
        } else if (p === "compile") {
          setPhase("launch");
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(bootTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [finish, script, unlockModule]);

  // Phase machine timers
  useEffect(() => {
    if (phase === "splash") {
      const t = window.setTimeout(() => setPhase("power"), 1600 * slow);
      return () => window.clearTimeout(t);
    }
    if (phase === "power") {
      const t = window.setTimeout(() => setPhase("boot"), 1100 * slow);
      return () => window.clearTimeout(t);
    }
    if (phase === "sync") {
      setGlitch(true);
      setActiveModules(new Set(MODULES.map((m) => m.id)));
      spawnBurst(0.5, 0.5, "#6aa8ff");
      pushToast(t.portal.syncToast);
      const a = window.setTimeout(() => setGlitch(false), 480 * slow);
      const b = window.setTimeout(() => setPhase("compile"), 1400 * slow);
      return () => {
        window.clearTimeout(a);
        window.clearTimeout(b);
      };
    }
    if (phase === "compile") {
      setGlitch(true);
      setProgress(96);
      pushToast(t.portal.buildToast);
      const a = window.setTimeout(() => setProgress(100), 550 * slow);
      const b = window.setTimeout(() => {
        setGlitch(false);
        setPhase("launch");
      }, 1400 * slow);
      return () => {
        window.clearTimeout(a);
        window.clearTimeout(b);
      };
    }
    if (phase === "launch") {
      setCountdown(3);
      let n = 3;
      const id = window.setInterval(() => {
        n -= 1;
        setCountdown(n);
        spawnBurst(0.5, 0.42, n <= 0 ? "#9af0c7" : "#9ec5ff");
        if (n <= 0) {
          window.clearInterval(id);
          window.setTimeout(finish, 520 * slow);
        }
      }, 620 * slow);
      return () => window.clearInterval(id);
    }
    return undefined;
  }, [phase, slow, finish, spawnBurst, pushToast, t.portal.syncToast, t.portal.buildToast]);

  // Typing (snappy)
  useEffect(() => {
    if (phase !== "boot") return;
    if (lineIndex >= script.length) {
      setPhase("sync");
      return;
    }

    const entry = script[lineIndex];
    const speed = returning ? 6 : entry.speed ?? 12;
    let i = 0;
    let raf = 0;
    let last = performance.now();
    const delay = returning ? 40 : entry.delay ?? 90;

    const startTimer = window.setTimeout(() => {
      const tick = (now) => {
        if (now - last >= speed) {
          last = now;
          const step = entry.burst ? Math.min(5, entry.text.length - i) : entry.kind === "cmd" ? 2 : 1;
          i = Math.min(entry.text.length, i + step);
          setTyped(entry.text.slice(0, i));
          if (i >= entry.text.length) {
            setLines((prev) => [...prev, entry]);
            setTyped("");
            setLineIndex((idx) => idx + 1);
            setProgress((p) => Math.min(90, p + 100 / (script.length + 1)));
            setFlashLine(lineIndex);
            unlockModule(entry.module);
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
  }, [lineIndex, script, phase, returning, unlockModule]);

  // Telemetry + waveform
  useEffect(() => {
    if (phase === "wipe") return;
    const id = window.setInterval(() => {
      setUptime((u) => u + 1);
      const heat = phase === "compile" || phase === "launch" || phase === "sync" ? 18 : 0;
      setStats((s) => ({
        cpu: clamp(s.cpu + (Math.random() * 16 - 6) + heat, 6, 98),
        mem: clamp(s.mem + (Math.random() * 9 - 3) + progress * 0.07, 16, 92),
        net: clamp(s.net + (Math.random() * 12 - 4), 2, 72),
        fps: 57 + Math.floor(Math.random() * 6),
      }));
      setWave(Array.from({ length: 16 }, () => 0.15 + Math.random() * (0.35 + heat * 0.02)));
    }, 160);
    return () => window.clearInterval(id);
  }, [phase, progress]);

  // Parallax tilt
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x: y * -6, y: x * 8 });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Matrix rain
  useEffect(() => {
    const canvas = rainRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    let w = 0;
    let h = 0;
    let cols = [];
    let raf = 0;
    let disposed = false;
    let fontSize = 14;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = isMobile ? 12 : 15;
      cols = Array.from({ length: Math.ceil(w / fontSize) }, () => Math.random() * -50);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    };

    const glyphs = "01<>[]{};:/\\|=+*#$@CMFORGEΞΔλ";
    const draw = () => {
      if (disposed) return;
      raf = requestAnimationFrame(draw);
      const intens = phaseRef.current === "compile" || phaseRef.current === "launch" ? 0.08 : 0.13;
      ctx.fillStyle = `rgba(7, 8, 11, ${intens})`;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols.length; i++) {
        const ch = glyphs[(Math.random() * glyphs.length) | 0];
        const x = i * fontSize;
        const y = cols[i] * fontSize;
        ctx.fillStyle = i % 5 === 0 ? "rgba(158,197,255,0.65)" : "rgba(106,168,255,0.2)";
        ctx.fillText(ch, x, y);
        if (y > h && Math.random() > 0.972) cols[i] = 0;
        else cols[i] += 0.18 + Math.random() * 0.28;
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

  // Particle FX canvas
  useEffect(() => {
    const canvas = fxRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    let raf = 0;
    let disposed = false;
    let orbs = Array.from({ length: 10 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 20 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.00035,
      a: 0.08 + Math.random() * 0.12,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (disposed) return;
      raf = requestAnimationFrame(draw);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const o of orbs) {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -0.1 || o.x > 1.1) o.vx *= -1;
        if (o.y < -0.1 || o.y > 1.1) o.vy *= -1;
        const g = ctx.createRadialGradient(o.x * w, o.y * h, 0, o.x * w, o.y * h, o.r);
        g.addColorStop(0, `rgba(106,168,255,${o.a})`);
        g.addColorStop(1, "rgba(106,168,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x * w, o.y * h, o.r, 0, Math.PI * 2);
        ctx.fill();
      }

      burstsRef.current = burstsRef.current.filter((b) => b.life > 0);
      for (const b of burstsRef.current) {
        b.life -= 0.018;
        for (const s of b.seeds) {
          const px = b.x * w + Math.cos(s.a) * s.s * (1 - b.life);
          const py = b.y * h + Math.sin(s.a) * s.s * (1 - b.life);
          ctx.globalAlpha = Math.max(0, b.life);
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(px, py, s.r * b.life, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
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
    const t = window.setTimeout(() => setFlashLine(-1), 380);
    return () => window.clearTimeout(t);
  }, [flashLine]);

  const pct = Math.round(progress);
  const current = lineIndex < script.length ? script[lineIndex] : null;
  const badge = {
    splash: "INIT",
    power: "PWR",
    boot: "BOOT",
    sync: "SYNC",
    compile: "BUILD",
    launch: "GO",
    wipe: "LIVE",
  }[phase];

  const showMain = phase !== "splash" && phase !== "power";
  const ringOffset = circumference * (1 - progress / 100);

  return (
    <div
      className={[
        "code-portal",
        bootIn ? "is-booted" : "",
        exiting ? "is-exiting" : "",
        returning ? "is-returning" : "",
        glitch ? "is-glitch" : "",
        `phase-${phase}`,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={t.portal.aria}
    >
      <div className="code-letterbox code-letterbox--top" aria-hidden="true" />
      <div className="code-letterbox code-letterbox--bottom" aria-hidden="true" />
      <div className="code-bloom" aria-hidden="true" />
      <canvas ref={rainRef} className="code-portal-rain" aria-hidden="true" />
      <canvas ref={fxRef} className="code-portal-fx" aria-hidden="true" />
      <div className="code-portal-grid" aria-hidden="true" />
      <div className="code-portal-aurora" aria-hidden="true" />
      <div className="code-portal-scan" aria-hidden="true" />
      <div className="code-portal-beam" aria-hidden="true" />
      <div className="code-portal-vignette" aria-hidden="true" />
      <div className="code-portal-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="code-portal-hex" aria-hidden="true" />
      <div className="code-portal-noise" aria-hidden="true" />
      <div className="code-floaters" aria-hidden="true">
        <span style={{ "--d": "0s" }}>const forge = true;</span>
        <span style={{ "--d": "1.2s" }}>await loadIdentity()</span>
        <span style={{ "--d": "2.4s" }}>export default Hero</span>
        <span style={{ "--d": "0.6s" }}>{"{ status: \"ok\" }"}</span>
        <span style={{ "--d": "1.8s" }}>npm run build</span>
        <span style={{ "--d": "3s" }}>TLS handshake ✓</span>
      </div>
      <div className="code-ticker" aria-hidden="true">
        <div className="code-ticker-track">
          <span>FORGE RUNTIME</span>
          <span>SECURE BOOT</span>
          <span>CM · PORTFOLIO</span>
          <span>FULL-STACK</span>
          <span>REACT · NODE · .NET</span>
          <span>ZERO ERRORS</span>
          <span>FORGE RUNTIME</span>
          <span>SECURE BOOT</span>
          <span>CM · PORTFOLIO</span>
          <span>FULL-STACK</span>
          <span>REACT · NODE · .NET</span>
          <span>ZERO ERRORS</span>
        </div>
      </div>
      <div className="code-toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="code-toast">
            <i />
            {toast.label}
          </div>
        ))}
      </div>
      <div className="code-portal-wipe" aria-hidden="true" />
      <div className="code-portal-flash" aria-hidden="true" />
      <div className="code-portal-shards" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>

      {/* CRT power-on */}
      <div className={`code-crt ${phase === "power" ? "is-on" : "is-off"}`} aria-hidden="true">
        <div className="code-crt-line" />
      </div>

      {/* Splash */}
      <div className={`code-splash ${phase === "splash" ? "is-on" : "is-off"}`}>
        <div className="code-splash-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="code-splash-core" aria-hidden="true" />
        <div className="code-splash-mark" data-text="CM">
          CM
        </div>
        <p className="code-splash-sub">{t.portal.splash}</p>
        <p className="code-splash-name">{name}</p>
        <div className="code-splash-bar">
          <span />
        </div>
      </div>

      {/* Launch countdown */}
      {countdown != null && countdown > 0 && (
        <div className="code-countdown" aria-hidden="true">
          <div className="code-countdown-ring" />
          <span key={countdown}>{countdown}</span>
        </div>
      )}
      {phase === "launch" && countdown === 0 && (
        <div className="code-online" aria-hidden="true">
          <p>{t.portal.online}</p>
          <strong>{name}</strong>
        </div>
      )}

      <div
        className={`code-portal-layout ${showMain ? "is-visible" : ""}`}
        ref={stageRef}
        style={{
          transform: showMain
            ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : undefined,
        }}
      >
        <aside className="code-hud code-hud--left" aria-hidden="true">
          <p className="code-hud-label">{t.portal.sys}</p>
          <div className="code-radar">
            <i />
            <i />
            <b />
          </div>
          <HudMeter label="CPU" value={stats.cpu} />
          <HudMeter label="MEM" value={stats.mem} />
          <HudMeter label="NET" value={stats.net} tone="soft" />
          <div className="code-wave" aria-hidden="true">
            {wave.map((v, i) => (
              <span key={i} style={{ transform: `scaleY(${v})` }} />
            ))}
          </div>
          <div className="code-hud-row">
            <span>FPS</span>
            <strong>{stats.fps}</strong>
          </div>
          <div className="code-hud-row">
            <span>UP</span>
            <strong>00:{String(uptime % 60).padStart(2, "0")}</strong>
          </div>
        </aside>

        <div className="code-portal-stage">
          <div className="code-id-card" aria-hidden="true">
            <span className="code-id-avatar">CM</span>
            <div>
              <strong>{name}</strong>
              <em>{t.portal.tagline}</em>
            </div>
            <b>{pct}%</b>
          </div>

          <p className="code-portal-eyebrow">
            <span className="code-portal-dot" />
            {returning ? t.portal.eyebrowReturn : t.portal.eyebrow}
          </p>

          <h2 className="code-portal-title" data-text={name}>
            {name}
          </h2>
          <p className="code-portal-tag">{t.portal.tagline}</p>

          <div className="code-energy" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>

          <div className="code-portal-frame">
            <span className="code-corner c-tl" />
            <span className="code-corner c-tr" />
            <span className="code-corner c-bl" />
            <span className="code-corner c-br" />
            <div className="code-watermark" aria-hidden="true">
              {pct}
            </div>

            <svg className="code-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="54" className="code-ring-bg" />
              <circle
                cx="60"
                cy="60"
                r="54"
                className="code-ring-fg"
                style={{ strokeDasharray: `${circumference}`, strokeDashoffset: `${ringOffset}` }}
              />
            </svg>

            <div className="code-portal-window">
              <div className="code-portal-titlebar">
                <div className="code-portal-traffic" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p className="code-portal-path">forge@portfolio — zsh</p>
                <span className={`code-portal-badge is-${String(badge).toLowerCase()}`}>{badge}</span>
              </div>

              <div className="code-tabs" aria-hidden="true">
                <span className="is-active">boot.log</span>
                <span>stack.json</span>
                <span>hero.jsx</span>
              </div>

              <div className="code-portal-body" ref={bodyRef} role="log" aria-live="polite">
                <div key={scanKick} className="code-scanbar" aria-hidden="true" />
                {lines.map((line, idx) => (
                  <TerminalLine
                    key={`${idx}-${line.text.slice(0, 18)}`}
                    line={line}
                    flash={flashLine === idx}
                    stamp={`0:${String(Math.min(59, idx + 1)).padStart(2, "0")}`}
                  />
                ))}
                {current && phase === "boot" && (
                  <TerminalLine
                    line={{ ...current, text: typed || "" }}
                    caret
                    stamp={`0:${String(Math.min(59, lineIndex + 1)).padStart(2, "0")}`}
                  />
                )}
                {phase === "sync" && (
                  <p className="code-line code-line--info code-line--burst">
                    <span className="code-prefix">
                      <span className="code-spinner" />
                    </span>
                    <span>{t.portal.syncing} hologram mesh…</span>
                  </p>
                )}
                {(phase === "compile" || phase === "launch") && (
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
                    {statusLabel(phase, t)}
                  </span>
                  <span className="code-portal-pct">{pct}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="code-modules-wrap" aria-hidden="true">
            <svg className="code-constellation" viewBox="0 0 360 40" preserveAspectRatio="none">
              <polyline
                points="20,20 70,20 120,20 170,20 220,20 270,20 320,20"
                className={activeModules.size >= 3 ? "is-lit" : ""}
              />
            </svg>
            <div className="code-modules">
              {MODULES.map((mod, i) => (
                <span
                  key={mod.id}
                  className={`code-module ${activeModules.has(mod.id) ? "is-on" : ""}`}
                  style={{ "--mod-hue": mod.hue, "--mi": i }}
                >
                  <i />
                  {mod.label}
                </span>
              ))}
            </div>
          </div>

          <div className="code-phase-rail" aria-hidden="true">
            {[
              { label: "INIT", phases: ["splash", "power"] },
              { label: "BOOT", phases: ["boot"] },
              { label: "SYNC", phases: ["sync"] },
              { label: "BUILD", phases: ["compile"] },
              { label: "GO", phases: ["launch", "wipe"] },
            ].map((step, i, arr) => {
              const order = ["splash", "power", "boot", "sync", "compile", "launch", "wipe"];
              const active = step.phases.includes(phase);
              const phaseIdx = order.indexOf(phase);
              const stepIdx = order.indexOf(step.phases[0]);
              const done = phaseIdx > stepIdx + (step.phases.length - 1);
              return (
                <div key={step.label} className={`code-phase-step ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}>
                  <b />
                  <span>{step.label}</span>
                  {i < arr.length - 1 && <em />}
                </div>
              );
            })}
          </div>

          <p className="code-portal-hint">{t.portal.hint}</p>
        </div>

        <aside className="code-hud code-hud--right" aria-hidden="true">
          <p className="code-hud-label">{t.portal.pipeline}</p>
          {(t.portal.pipelineSteps || []).map((step, i) => {
            const unlocked = progress > (i + 1) * (100 / 8) || ["sync", "compile", "launch", "wipe"].includes(phase);
            return (
              <div key={step} className={`code-pipe ${unlocked ? "is-on" : ""}`}>
                <span className="code-pipe-mark">{unlocked ? "●" : "○"}</span>
                <span>{step}</span>
              </div>
            );
          })}
          <div className="code-hud-chip">{t.portal.secure}</div>
        </aside>
      </div>
    </div>
  );
}

function statusLabel(phase, t) {
  if (phase === "launch" || phase === "wipe") return t.portal.launching;
  if (phase === "sync") return t.portal.syncing;
  if (phase === "compile") return t.portal.compiling;
  return t.portal.compiling;
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

function TerminalLine({ line, caret = false, flash = false, stamp }) {
  const kind = line.kind || "cmd";
  const text = line.text || "";
  const head = caret && text.length > 0 ? text.slice(0, -1) : text;
  const tail = caret && text.length > 0 ? text.slice(-1) : "";

  return (
    <p className={`code-line code-line--${kind} ${flash ? "is-flash" : ""} ${caret ? "is-typing" : ""}`}>
      {stamp != null && <span className="code-stamp">{stamp}</span>}
      {kind === "cmd" && <span className="code-prompt">{line.prompt || "$"}</span>}
      {kind === "out" && <span className="code-prefix">→</span>}
      {kind === "ok" && <span className="code-prefix">✔</span>}
      {kind === "warn" && <span className="code-prefix">!</span>}
      {kind === "info" && <span className="code-prefix">#</span>}
      {kind === "dim" && <span className="code-prefix">·</span>}
      <span className="code-text">
        {caret ? (
          <>
            {kind === "cmd" ? highlight(head, kind) : head}
            {tail && <span className="tok-hot">{tail}</span>}
          </>
        ) : (
          highlight(text, kind)
        )}
        {caret && <span className="code-caret" aria-hidden="true" />}
      </span>
    </p>
  );
}

function highlight(text, kind) {
  if (kind !== "cmd") return text;
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
      { kind: "info", text: L.restore, speed: 7, delay: 35 },
      { kind: "cmd", text: "forge resume --session portfolio", speed: 7, delay: 30 },
      { kind: "out", text: L.restoreOk, speed: 6, delay: 30 },
      { kind: "cmd", text: "hydrate modules --hot", speed: 7, delay: 30, module: "react" },
      { kind: "ok", text: L.ready, speed: 6, delay: 30 },
      { kind: "cmd", text: "launch --target hero", speed: 7, delay: 30 },
    ];
  }

  return [
    { kind: "info", text: L.banner, speed: 10, delay: 120 },
    { kind: "dim", text: L.kernel, speed: 6, delay: 70, burst: true },
    { kind: "cmd", text: "forge init portfolio --secure", speed: 11, delay: 140 },
    { kind: "out", text: L.init, speed: 8, delay: 70 },
    { kind: "cmd", text: `load identity --user "${n}"`, speed: 10, delay: 120 },
    { kind: "ok", text: L.identity, speed: 8, delay: 60 },
    { kind: "cmd", text: "mount ./stack --watch", speed: 10, delay: 110, module: "react" },
    { kind: "out", text: L.mount, speed: 8, delay: 55 },
    { kind: "cmd", text: "import skills --from stack.json", speed: 10, delay: 110, module: "node" },
    { kind: "out", text: L.skills, speed: 8, delay: 55, module: "dotnet" },
    { kind: "cmd", text: "link database --engine sql", speed: 10, delay: 100, module: "sql" },
    { kind: "ok", text: L.db, speed: 8, delay: 55 },
    { kind: "cmd", text: "compile projects --release --optimize", speed: 9, delay: 120, module: "api", glitch: true },
    { kind: "out", text: L.projects, speed: 8, delay: 60 },
    { kind: "warn", text: L.warn, speed: 9, delay: 70 },
    { kind: "cmd", text: "inject motion --lib three", speed: 9, delay: 100, module: "three" },
    { kind: "ok", text: L.motion, speed: 8, delay: 55 },
    { kind: "cmd", text: "audit security --quiet", speed: 9, delay: 100 },
    { kind: "ok", text: L.audit, speed: 8, delay: 55 },
    { kind: "cmd", text: "sync hologram --quality ultra", speed: 9, delay: 110, glitch: true },
    { kind: "ok", text: L.hologram, speed: 8, delay: 60 },
    { kind: "cmd", text: "launch --target hero --open", speed: 10, delay: 130 },
    { kind: "ok", text: L.ready, speed: 8, delay: 80 },
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
