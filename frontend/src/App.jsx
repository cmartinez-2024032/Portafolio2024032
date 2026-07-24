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
import CursorAura from "./components/CursorAura";
import Robot from "./components/robot/Robot";
import Starfield from "./components/background/Starfield";
import PortalIntro, { hasSeenPortal, clearPortalSeen } from "./components/intro/PortalIntro";
import { usePortfolioData } from "./hooks/useDataFetching";
import { useLanguage } from "./i18n/LanguageContext";

export default function App() {
  const { data, loading, error } = usePortfolioData();
  const { t } = useLanguage();
  const [introDone, setIntroDone] = useState(() => hasSeenPortal());
  const [portalReturning, setPortalReturning] = useState(false);

  // At the top of the site, scroll-up reopens the galaxy tunnel.
  useEffect(() => {
    if (!introDone) return;

    const onWheel = (e) => {
      if (window.scrollY > 12) return;
      if (e.deltaY >= -18) return;
      e.preventDefault();
      clearPortalSeen();
      setPortalReturning(true);
      setIntroDone(false);
      window.scrollTo(0, 0);
    };

    let touchY = null;
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e) => {
      if (window.scrollY > 12 || touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      const delta = y - touchY;
      // Finger dragging down (content would scroll up) → return to galaxy
      if (delta > 28) {
        e.preventDefault();
        clearPortalSeen();
        setPortalReturning(true);
        setIntroDone(false);
        touchY = null;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
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
        <PortalIntro
          name={data.personal?.name}
          returning={portalReturning}
          initialProgress={portalReturning ? 0.96 : 0}
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
        <CursorAura />
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
