import { useState, useEffect } from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { motion } from "framer-motion";
import { FiDownload, FiGlobe } from "react-icons/fi";
import { useLanguage } from "../i18n/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scaleX } = useScrollProgress();
  const { t, locale, setLocale } = useLanguage();

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
              <span className="nav-logo-role">{t.nav.role}</span>
            </span>
          </a>
        </div>
        <div className="nav-links">
          {t.nav.sections.map((s) => (
            <button key={s.id} onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}

          <div className="nav-lang-toggle" role="group" aria-label={t.nav.langAria}>
            <FiGlobe className="nav-lang-globe" aria-hidden="true" />
            <button
              type="button"
              className={locale === "es" ? "is-active" : ""}
              aria-pressed={locale === "es"}
              onClick={() => setLocale("es")}
            >
              ES
            </button>
            <button
              type="button"
              className={locale === "en" ? "is-active" : ""}
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
              data-cursor={locale === "es" ? "EN" : ""}
            >
              EN
            </button>
          </div>

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
