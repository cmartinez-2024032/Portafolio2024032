import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
// code-portal.css still carries light-theme rules for the rest of the site.
import "./code-portal.css";
import "./code-to-page.css";

const STORAGE_KEY = "forge-portal-seen";
const CHAR_MS = 10;
const LINE_PAUSE_MS = 90;
const BLANK_PAUSE_MS = 60;
const COMPILE_MS = 1300;
const EXPAND_MS = 1150;
const FADE_MS = 500;
const INSPECT_MS = 1200;

const TAGS = { photo: "img", eyebrow: "Badge", name: "h1", role: "h2", phrase: "p", cta: "Button" };
const KEYWORDS = new Set(["import", "from", "export", "default", "function", "return"]);
const TOKEN = /("[^"]*"?|<\/?[A-Za-z][\w.]*|\/?>|\b[A-Za-z]+\b)/;

/**
 * Intro: the hero's source is typed (with autocomplete and a corrected typo) while a live preview
 * renders each element — a connector links every finished line to what it produced — then the build
 * passes and the preview grows into the real page.
 */
export default function CodeToPageIntro({ personal, onComplete, returning = false }) {
  const { t, locale } = useLanguage();
  const name = personal?.name || "Cristopher Martínez";
  const photo = personal?.photo || null;
  const phrase = locale === "en" ? t.personalFallback.phrase : personal?.phrase || t.hero.phraseFallback;
  const speed = returning ? 0.45 : 1;
  const [isTouch] = useState(() => window.matchMedia("(hover: none)").matches);

  const lines = useMemo(
    () =>
      buildLines({
        greeting: greetingFor(new Date().getHours(), t.portal.greet),
        thanks: t.portal.thanks,
        first: name.split(" ")[0],
        eyebrow: t.hero.eyebrow,
        name,
        role: t.hero.title,
        phrase,
        cta: t.hero.ctaProjects,
      }),
    [name, phrase, t.portal.greet, t.portal.thanks, t.hero.eyebrow, t.hero.title, t.hero.ctaProjects],
  );
  const timeline = useMemo(() => buildTimeline(lines, speed), [lines, speed]);

  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState("type");
  const [link, setLink] = useState(null);
  const [inspect, setInspect] = useState(null);
  const boostRef = useRef(0);
  const phaseRef = useRef(phase);
  const onCompleteRef = useRef(onComplete);
  const windowRef = useRef(null);
  const codeRef = useRef(null);

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
      if (e.target?.closest?.("button")) return;
      e.preventDefault();
      advance();
    };
    const onPointer = (e) => {
      if (e.target?.closest?.("button")) return;
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

  // The window floats in 3D and leans toward the mouse; the glare follows it
  useEffect(() => {
    const win = windowRef.current;
    if (!win || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    let raf = 0;
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        win.style.setProperty("--rx", `${(-ny * 9).toFixed(2)}deg`);
        win.style.setProperty("--ry", `${(nx * 12).toFixed(2)}deg`);
        win.style.setProperty("--gx", `${((nx + 0.5) * 100).toFixed(1)}%`);
        win.style.setProperty("--gy", `${((ny + 0.5) * 100).toFixed(1)}%`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const shown = [];
  const revealOrder = [];
  for (let i = 0; i < lines.length; i++) {
    const lt = timeline.lines[i];
    if (elapsed < lt.start) break;
    shown.push({ i, step: stepAt(lt.steps, elapsed) });
    if (elapsed >= lt.end && lines[i].reveal) revealOrder.push(lines[i].reveal);
  }
  const revealed = new Set(revealOrder);
  const lastReveal = revealOrder[revealOrder.length - 1];
  const currentLine = shown.length ? shown[shown.length - 1].i : 0;
  const typing = phase === "type";
  const built = phase === "expand" || phase === "fade";
  const live = phase === "type" || phase === "compile";

  // Keep the line being typed in view when the editor is short (phones)
  useLayoutEffect(() => {
    const el = codeRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  // Connector + inspector for the element that was just rendered
  useLayoutEffect(() => {
    if (!lastReveal) return undefined;
    const root = windowRef.current;
    const lineEl = root?.querySelector(`[data-line="${lines.findIndex((l) => l.reveal === lastReveal)}"]`);
    const el = root?.querySelector(`[data-el="${lastReveal}"]`);
    if (!root || !lineEl || !el) return undefined;
    // Layout coordinates inside the window, so the 3D tilt and the reveal transform don't skew them
    const a = localBox(lineEl, root);
    const b = localBox(el, root);
    const code = localBox(codeRef.current, root);
    let d;
    let end;
    if (b.top >= code.bottom - 1) {
      // Stacked layout: run like a circuit trace down the left edge, clear of the content
      const x = a.left + 5;
      const y1 = a.top + a.height / 2;
      const y2 = b.top + b.height / 2;
      const x2 = b.left - 8;
      d = `M${x + 16},${y1} H${x + 6} Q${x},${y1} ${x},${y1 + 6} V${y2 - 6} Q${x},${y2} ${x + 6},${y2} H${x2}`;
      end = [x2, y2];
    } else {
      const x1 = code.right - 8;
      const y1 = a.top + a.height / 2;
      const x2 = b.left - 8;
      const y2 = b.top + b.height / 2;
      const dx = (x2 - x1) / 2;
      d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
      end = [x2, y2];
    }
    setLink({ id: lastReveal, d, end });
    setInspect({ key: lastReveal, label: `${TAGS[lastReveal]} · ${Math.round(b.width)}×${Math.round(b.height)}` });
    const id = window.setTimeout(() => setInspect(null), INSPECT_MS);
    return () => window.clearTimeout(id);
  }, [lastReveal, lines]);

  const terminal = [{ k: "cmd", text: "npm run dev" }];
  if (elapsed > 450 * speed) terminal.push({ k: "ok", text: "VITE v6.4.3  ready in 412 ms" });
  if (elapsed > 650 * speed) terminal.push({ k: "dim", text: "➜  Local:   http://localhost:5173/" });
  revealOrder.forEach((key) =>
    terminal.push({ k: "hmr", text: `[vite] hmr update /src/Hero.jsx  <${TAGS[key]}>` }),
  );
  if (!typing) terminal.push({ k: "cmd", text: "npm run build" });
  if (built) terminal.push({ k: "ok", text: "✓ 42 modules transformed · built in 0.41s" });

  const elClass = (key) =>
    `ctp-el ${revealed.has(key) ? "is-on" : ""} ${inspect?.key === key && live ? "is-inspect" : ""}`;
  const inspectTag = (key) =>
    inspect?.key === key && live ? <span className="ctp-inspect">{inspect.label}</span> : null;

  return (
    <div
      className={`ctp ${built ? "is-expanding" : ""} ${phase === "fade" ? "is-fading" : ""} ${typing ? "" : "is-flat"}`}
      role="dialog"
      aria-label={t.portal.aria}
    >
      <div className="ctp-floor" aria-hidden="true" />

      <button type="button" className="ctp-skip" onClick={() => setPhase("fade")}>
        {t.portal.skip} <span aria-hidden="true">→</span>
      </button>

      <div className="ctp-window" ref={windowRef}>
        <div className="ctp-glare" aria-hidden="true" />
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

            <div className="ctp-code" ref={codeRef}>
              {shown.map(({ i, step }) => {
                const text = lines[i].text.slice(0, step.len) + step.extra;
                const isCurrent = i === currentLine;
                return (
                  <div key={i} data-line={i} className={`ctp-line ${isCurrent ? "is-current" : ""}`}>
                    <span className="ctp-ln">{i + 1}</span>
                    <span className="ctp-src">
                      {highlight(text)}
                      {isCurrent && <i className={`ctp-caret ${typing ? "" : "is-idle"}`} />}
                      {isCurrent && typing && step.popup && (
                        <span className="ctp-suggest" style={{ "--col": step.len }}>
                          {step.popup.map((item, n) => (
                            <span key={item} className={`ctp-suggest-item ${n === 0 ? "is-active" : ""}`}>
                              <b>{"</>"}</b>
                              {item}
                              <em>component</em>
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="ctp-term">
              <p className="ctp-term-head">TERMINAL</p>
              <div className="ctp-term-body">
                {terminal.map((row, n) => (
                  <p key={n} className={`ctp-term-line is-${row.k}`}>
                    {row.k === "cmd" && <span className="ctp-term-prompt">$</span>}
                    {row.text}
                  </p>
                ))}
              </div>
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
              <div data-el="photo" className={`${elClass("photo")} ctp-photo`}>
                <span className="ctp-photo-frame">
                  {photo ? <img src={photo} alt="" /> : <span>{name.charAt(0)}</span>}
                </span>
                {inspectTag("photo")}
              </div>
              <p data-el="eyebrow" className={`${elClass("eyebrow")} ctp-eyebrow`}>
                <i />
                {t.hero.eyebrow}
                {inspectTag("eyebrow")}
              </p>
              <h2 data-el="name" className={`${elClass("name")} ctp-name`}>
                {name}
                {inspectTag("name")}
              </h2>
              <p data-el="role" className={`${elClass("role")} ctp-role`}>
                {t.hero.title}
                {inspectTag("role")}
              </p>
              <p data-el="phrase" className={`${elClass("phrase")} ctp-phrase`}>
                {phrase}
                {inspectTag("phrase")}
              </p>
              <div data-el="cta" className={`${elClass("cta")} ctp-cta`}>
                <span className="ctp-btn is-primary">{t.hero.ctaProjects}</span>
                <span className="ctp-btn">{t.hero.ctaCv}</span>
                {inspectTag("cta")}
              </div>
            </div>
          </section>
        </div>

        {link && live && (
          <svg className="ctp-link" aria-hidden="true">
            <path key={`p-${link.id}`} className="ctp-link-path" d={link.d} pathLength="1" />
            <circle key={`c-${link.id}`} className="ctp-link-dot" cx={link.end[0]} cy={link.end[1]} r="3.5" />
          </svg>
        )}
      </div>

      <p className="ctp-hint">{isTouch ? t.portal.hintTouch : t.portal.hintKeys}</p>
    </div>
  );
}

function localBox(el, root) {
  let left = 0;
  let top = 0;
  for (let n = el; n && n !== root; n = n.offsetParent) {
    left += n.offsetLeft;
    top += n.offsetTop;
    if (n.offsetParent && n.offsetParent !== root) {
      left += n.offsetParent.clientLeft;
      top += n.offsetParent.clientTop;
    }
  }
  for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
    left -= p.scrollLeft;
    top -= p.scrollTop;
  }
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  return { left, top, width, height, right: left + width, bottom: top + height };
}

function greetingFor(hour, greet) {
  if (hour < 12) return greet.morning;
  if (hour < 19) return greet.afternoon;
  return greet.evening;
}

function buildLines({ greeting, thanks, first, eyebrow, name, role, phrase, cta }) {
  const pad = "      ";
  const h1 = `${pad}<h1>`;
  const slip = Math.min(5, Math.max(1, name.length - 2));
  const wrongChar = name[slip + 1] && name[slip + 1] !== name[slip] ? name[slip + 1] : "x";
  return [
    { text: `// ${greeting} — ${thanks}` },
    { text: 'import { motion } from "framer-motion";' },
    { text: "" },
    { text: "export default function Hero() {" },
    { text: "  return (" },
    { text: '    <motion.section className="hero">' },
    { text: `${pad}<img src="/img/me.jpg" alt="${first}" />`, reveal: "photo" },
    {
      text: `${pad}<Badge>${eyebrow}</Badge>`,
      reveal: "eyebrow",
      suggest: { from: `${pad}<Bad`.length, to: `${pad}<Badge`.length, items: ["Badge", "BadgeGroup", "BadgeDot"] },
    },
    { text: `${h1}${name}</h1>`, reveal: "name", typo: { at: h1.length + slip, wrong: wrongChar } },
    { text: `${pad}<h2>${role}</h2>`, reveal: "role" },
    { text: `${pad}<p>${phrase}</p>`, reveal: "phrase" },
    {
      text: `${pad}<Button>${cta}</Button>`,
      reveal: "cta",
      suggest: { from: `${pad}<But`.length, to: `${pad}<Button`.length, items: ["Button", "ButtonGroup", "ButtonLink"] },
    },
    { text: "    </motion.section>" },
    { text: "  );" },
    { text: "}" },
  ];
}

/** Keystroke timeline: variable per-key delay, auto-indent, one typo + backspace, autocomplete accepts. */
function buildTimeline(lines, speed) {
  let t = 250 * speed;
  const out = lines.map((line) => {
    const steps = [];
    const mark = (len, extra = "", popup = null) => steps.push({ t, len, extra, popup });
    let len = line.text.length - line.text.trimStart().length;
    let typoDone = false;
    mark(len);
    while (len < line.text.length) {
      if (line.typo && !typoDone && len === line.typo.at) {
        typoDone = true;
        t += 80 * speed;
        mark(len, line.typo.wrong);
        t += 340 * speed;
        mark(len);
        continue;
      }
      if (line.suggest && len === line.suggest.from) {
        t += 90 * speed;
        mark(len, "", line.suggest.items);
        t += 520 * speed;
        len = line.suggest.to;
        mark(len);
        continue;
      }
      const ch = line.text[len];
      len += 1;
      t += (CHAR_MS + (ch.charCodeAt(0) % 4) * 3 + (ch === " " ? 8 : 0)) * speed;
      mark(len);
    }
    const start = steps[0].t;
    const end = t;
    t += (line.text.trim() ? LINE_PAUSE_MS : BLANK_PAUSE_MS) * speed;
    return { start, end, steps };
  });
  return { lines: out, total: t };
}

function stepAt(steps, elapsed) {
  let current = steps[0];
  for (const step of steps) {
    if (step.t > elapsed) break;
    current = step;
  }
  return current;
}

function highlight(text) {
  if (text.trimStart().startsWith("//")) return <span className="ctp-com">{text}</span>;
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
