import { useState, useEffect } from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";
import { navSections } from "../data/siteConfig";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scaleX } = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
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
          <a
            href="#hero"
            className="nav-logo"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("hero");
            }}
          >
            <span className="nav-monogram">CM</span>
            <span className="nav-logo-text">
              <span className="nav-logo-name">Cristopher Martínez</span>
              <span className="nav-logo-role">Full-Stack Developer</span>
            </span>
          </a>
        </div>
        <div className="nav-links">
          {navSections.map((s) => (
            <button key={s.id} onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
          <a href="/cv/Cristopher-Martinez-CV.pdf" download className="nav-cv-btn">
            <FiDownload size={12} /> CV
          </a>
        </div>
      </div>
      <div className="nav-scroller">
        <motion.div className="nav-scroller-fill" style={{ scaleX }} />
      </div>
    </nav>
  );
}
