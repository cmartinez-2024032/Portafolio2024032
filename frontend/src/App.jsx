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
import ScrollReveal from "./components/ScrollReveal";
import { useDarkMode } from "./hooks/useDarkMode";
import { usePortfolioData } from "./hooks/useDataFetching";
import { achievements } from "./data/siteConfig";

export default function App() {
  const [darkMode] = useDarkMode();
  const { data, loading, error } = usePortfolioData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--color-base)" }}>
        <div style={{
          width: "2rem",
          height: "2rem",
          border: "2px solid var(--color-edge)",
          borderTopColor: "var(--color-accent)",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }} />
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

  const theme = darkMode ? "dark" : "light";

  return (
    <div className={`${theme}`} style={{ minHeight: "100vh", background: "var(--color-base)", color: "var(--color-fg)" }}>
      <CustomCursor />
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

        <section id="achievements" style={{ padding: "6rem 0", overflow: "hidden" }}>
          <div className="section-wrap" style={{ paddingBottom: "3rem" }}>
            <p className="section-comment reveal">reconocimientos</p>
            <h2 className="section-title reveal">Logros</h2>
            <p className="section-title-serif reveal">Certificaciones y habilidades adquiridas</p>
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
  );
}
