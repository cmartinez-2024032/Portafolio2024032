import { useState, useEffect } from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiGlobe, FiMenu, FiX } from "react-icons/fi";
import { useLanguage } from "../i18n/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scaleX } = useScrollProgress();
  const { t, locale, setLocale } = useLanguage();

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);

      // Keep bar visible while the mobile menu is open.
      if (menuOpen) {
        setHidden(false);
        lastY = y;
        return;
      }

      if (y < 64) {
        setHidden(false);
      } else if (y > lastY + 6) {
        setHidden(true);
      } else if (y < lastY - 6) {
        setHidden(false);
      }
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    // Wait a tick so the menu closes before scrolling.
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  const langToggle = (
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
  );

  return (
    <nav
      className={`main-nav ${scrolled || menuOpen ? "scrolled" : ""} ${hidden && !menuOpen ? "is-hidden" : ""} ${menuOpen ? "is-menu-open" : ""}`}
    >
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

        {/* Desktop / wide screens */}
        <div className="nav-links nav-links-desktop">
          {t.nav.sections.map((s) => (
            <button key={s.id} type="button" onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
          {langToggle}
          <a href="/cv/Cristopher-Martinez-CV.pdf" download className="nav-cv-btn">
            <FiDownload size={12} /> CV
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="nav-burger"
          aria-expanded={menuOpen}
          aria-controls="nav-mobile-panel"
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              className="nav-mobile-backdrop"
              aria-label={t.nav.closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              id="nav-mobile-panel"
              className="nav-mobile-panel"
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.openMenu}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="nav-mobile-links">
                {t.nav.sections.map((s, i) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    onClick={() => scrollTo(s.id)}
                  >
                    <span className="nav-mobile-index">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </motion.button>
                ))}
              </div>

              <div className="nav-mobile-footer">
                {langToggle}
                <a href="/cv/Cristopher-Martinez-CV.pdf" download className="nav-cv-btn">
                  <FiDownload size={14} /> CV
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="nav-scroller">
        <motion.div className="nav-scroller-fill" style={{ scaleX }} />
      </div>
    </nav>
  );
}
