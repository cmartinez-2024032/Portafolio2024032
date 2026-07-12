import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useDarkMode } from "../hooks/useDarkMode";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { motion } from "framer-motion";
import { navSections } from "../data/siteConfig";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useDarkMode();
  const { scaleX } = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`main-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <div className="nav-title">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>
            Cristopher Martínez
          </a>
          <span>Full-Stack Developer</span>
        </div>
        <div className="nav-links">
          {navSections.map((s) => (
            <button key={s.id} onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            {darkMode ? <FiSun size={12} /> : <FiMoon size={12} />}
          </button>
        </div>
      </div>
      <div className="nav-scroller">
        <motion.div className="nav-scroller-fill" style={{ scaleX }} />
      </div>
    </nav>
  );
}
