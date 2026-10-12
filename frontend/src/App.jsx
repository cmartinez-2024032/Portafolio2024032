import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Abilities from "./components/Abilities";
import Timeline from "./components/Timeline";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Achievements from "./components/Achievements";
import CustomCursor from "./components/CustomCursor";
import Robot from "./components/robot/Robot";
import Starfield from "./components/background/Starfield";
import CodeToPageIntro, { hasSeenPortal, clearPortalSeen } from "./components/intro/CodeToPageIntro";
import { usePortfolioData } from "./hooks/useDataFetching";
import { useLanguage } from "./i18n/LanguageContext";

export default function App() {
  const { data, loading, error } = usePortfolioData();
  const { t } = useLanguage();
  const [introDone, setIntroDone] = useState(() => hasSeenPortal());
  const [portalReturning, setPortalReturning] = useState(false);
  // At the top of the site, a long, deliberate scroll-up reopens the code portal.
  // Momentum from scrolling back to the top must not trigger it, so the user has
  // to rest at the top first and then keep pulling up past a threshold.
  useEffect(() => {
    if (!introDone) return;

    const TOP = 12;
    const REST_MS = 1000;
    const WHEEL_PULL = 700;
    const WHEEL_GAP_MS = 350;
    const TOUCH_PULL = 180;

    let atTopSince = window.scrollY <= TOP ? performance.now() : null;
    let pull = 0;
    let lastWheel = 0;

    const reopen = () => {
      clearPortalSeen();
      setPortalReturning(true);
      setIntroDone(false);
      window.scrollTo(0, 0);
    };

    const rested = () => atTopSince != null && performance.now() - atTopSince >= REST_MS;

    const onScroll = () => {
      if (window.scrollY > TOP) {
        atTopSince = null;
        pull = 0;
      } else if (atTopSince == null) {
        atTopSince = performance.now();
      }
    };

    const onWheel = (e) => {
      const now = performance.now();
      if (window.scrollY > TOP || e.deltaY >= 0 || !rested()) {
        pull = 0;
        lastWheel = now;
        return;
      }
      if (now - lastWheel > WHEEL_GAP_MS) pull = 0;
      lastWheel = now;
      pull += -e.deltaY;
      if (pull < WHEEL_PULL) return;
      e.preventDefault();
      pull = 0;
      reopen();
    };

    let touchY = null;
    const onTouchStart = (e) => {
      touchY = rested() ? e.touches[0]?.clientY ?? null : null;
    };
    const onTouchMove = (e) => {
      if (window.scrollY > TOP || touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      if (y - touchY > TOUCH_PULL) {
        e.preventDefault();
        touchY = null;
        reopen();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [introDone]);

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-orb" />
        <p className="boot-label">{t.boot}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--color-base)" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
          <p
            style={{
              color: "var(--color-accent)",
              fontSize: "0.65rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: "0.5rem",
            }}
          >
            {t.errorTitle}
          </p>
          <p style={{ color: "var(--color-dim)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            {error || t.errorBody}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!introDone && (
        <CodeToPageIntro
          personal={data.personal}
          returning={portalReturning}
          onComplete={() => {
            setPortalReturning(false);
            setIntroDone(true);
          }}
        />
      )}

      <div
        className="page-grain forge-root"
        style={{
          minHeight: "100vh",
          color: "var(--color-fg)",
          opacity: introDone ? 1 : 0,
          pointerEvents: introDone ? "auto" : "none",
          transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden={!introDone}
      >
        <Starfield />
        <CustomCursor />
        {introDone && <Robot />}
        <Navbar />
        <main>
          <Hero data={data.personal} />

          <section id="intro">
            <About data={data.personal} />
          </section>

          <section id="skills">
            <Skills skills={data.skills} />
          </section>

          <Abilities />

          <section id="timeline">
            <Timeline />
          </section>

          <Achievements />

          <Projects projects={data.projects} />

          <section id="contact">
            <Contact data={data.personal} />
          </section>
        </main>
        <Footer data={data.personal} />
      </div>
    </>
  );
}
