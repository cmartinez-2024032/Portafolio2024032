import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import Marquee from "./Marquee";
import { useLanguage } from "../i18n/LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

export default function Achievements() {
  const { t } = useLanguage();
  const item = t.featuredAchievement;
  const [activePhoto, setActivePhoto] = useState(0);
  if (!item) return null;

  return (
    <section id="achievements" className="forge-achievements">
      <div className="section-wrap achievements-wrap">
        <ScrollReveal>
          <p className="section-comment">{t.achievements.comment}</p>
          <h2 className="section-title">
            {t.achievements.title}
            <span className="text-accent">.</span>
          </h2>
          <p className="section-title-serif">{t.achievements.serif}</p>
        </ScrollReveal>

        <motion.article
          className="aditus-card"
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="aditus-card-glow" aria-hidden="true" />

          <div className="aditus-badge-row">
            <span className="aditus-badge">
              <span className="aditus-badge-pulse" />
              {item.badge || "1er lugar · Hackathon x Tec"}
            </span>
            <span className="aditus-year">{item.year}</span>
          </div>

          <motion.h3
            className="aditus-title"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          >
            {item.name}
            <span className="text-accent">.</span>
          </motion.h3>

          <p className="aditus-tagline">{item.tagline}</p>
          <p className="aditus-desc">{item.description}</p>

          {item.highlights?.length > 0 && (
            <ul className="aditus-highlights">
              {item.highlights.map((h, i) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.45, ease: EASE }}
                >
                  {h}
                </motion.li>
              ))}
            </ul>
          )}

          {item.photos?.length > 0 && (
            <div className="aditus-cinema">
              <div className="aditus-cinema-stage">
                <AnimatePresence mode="wait">
                  <motion.figure
                    key={item.photos[activePhoto].src}
                    className="aditus-cinema-frame"
                    initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    <motion.img
                      src={item.photos[activePhoto].src}
                      alt={item.photos[activePhoto].alt}
                      loading="lazy"
                      decoding="async"
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 4.5, ease: "linear" }}
                    />
                    <div className="aditus-cinema-veil" aria-hidden="true" />
                    <figcaption>{item.photos[activePhoto].caption}</figcaption>
                  </motion.figure>
                </AnimatePresence>
              </div>

              <div className="aditus-cinema-thumbs" role="tablist">
                {item.photos.map((photo, i) => (
                  <button
                    key={photo.src}
                    type="button"
                    role="tab"
                    aria-selected={activePhoto === i}
                    className={`aditus-cinema-thumb ${activePhoto === i ? "is-active" : ""}`}
                    onClick={() => setActivePhoto(i)}
                  >
                    <img src={photo.src} alt="" loading="lazy" />
                    <span>{photo.caption}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.article>
      </div>

      {t.achievementsMarquee?.length > 0 && <Marquee items={t.achievementsMarquee} />}
    </section>
  );
}
