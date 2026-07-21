import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Timeline from "./components/Timeline";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Marquee from "./components/Marquee";
import CustomCursor from "./components/CustomCursor";
import CursorAura from "./components/CursorAura";
import Robot from "./components/robot/Robot";
import ScrollReveal from "./components/ScrollReveal";
import Starfield from "./components/background/Starfield";
import PortalIntro, { hasSeenPortal } from "./components/intro/PortalIntro";
import { usePortfolioData } from "./hooks/useDataFetching";
import { achievements } from "./data/siteConfig";

export default function App() {
  const { data, loading, error } = usePortfolioData();
  const [introDone, setIntroDone] = useState(() => hasSeenPortal());

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-orb" />
        <p className="boot-label">Cargando portfolio</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--color-base)" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "400px" }}>
          <p style={{ color: "var(--color-accent)", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>
            Error de conexión
          </p>
          <p style={{ color: "var(--color-dim)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            {error || "No se pudieron cargar los datos. Asegúrate de que el backend esté corriendo en el puerto 4000."}
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
          onComplete={() => setIntroDone(true)}
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

          <section id="timeline">
            <Timeline />
          </section>

          <section id="achievements" className="forge-achievements">
            <div className="section-wrap" style={{ paddingBottom: "2.5rem" }}>
              <ScrollReveal>
                <p className="section-comment">reconocimientos</p>
                <h2 className="section-title">
                  Logros
                  <span className="text-accent">.</span>
                </h2>
              </ScrollReveal>
            </div>
            <Marquee items={achievements} />
          </section>

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
