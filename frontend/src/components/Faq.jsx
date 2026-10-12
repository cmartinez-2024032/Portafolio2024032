import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import "./workflow-bento.css";

const EASE = [0.16, 1, 0.3, 1];

export default function Faq() {
  const { t } = useLanguage();
  const f = t.faq;
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section-wrap faq-section">
      <div className="faq-layout">
        <ScrollReveal>
          <p className="section-comment">{f.comment}</p>
          <h2 className="section-title">
            {f.title}
            <span className="text-accent">.</span>
          </h2>
          <p className="section-title-serif">{f.serif}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <ul className="faq-list">
            {f.items.map((item, i) => {
              const isOpen = open === i;
              const panelId = `faq-panel-${i}`;
              return (
                <li key={item.q} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <FiPlus className="faq-icon" size={18} aria-hidden="true" />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        className="faq-a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
