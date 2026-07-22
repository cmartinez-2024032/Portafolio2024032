import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import Marquee from "./Marquee";
import { achievements, featuredAchievement } from "../data/siteConfig";

const EASE = [0.16, 1, 0.3, 1];

export default function Achievements() {
  const item = featuredAchievement;
  if (!item) return null;

  return (
    <section id="achievements" className="forge-achievements">
      <div className="section-wrap achievements-wrap">
        <ScrollReveal>
          <p className="section-comment">reconocimientos</p>
          <h2 className="section-title">
            Logros
            <span className="text-accent">.</span>
          </h2>
          <p className="section-title-serif">Hackathons, formación y trabajo en equipo</p>
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

          <div className="aditus-photos">
            {item.photos?.map((photo, i) => (
              <motion.figure
                key={photo.src}
                className="aditus-photo"
                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.12 + i * 0.12, duration: 0.7, ease: EASE }}
                whileHover={{ y: -8, transition: { duration: 0.35 } }}
              >
                <div className="aditus-photo-frame">
                  <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
                  <div className="aditus-photo-shine" aria-hidden="true" />
                </div>
                <figcaption>{photo.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </motion.article>
      </div>

      {achievements?.length > 0 && <Marquee items={achievements} />}
    </section>
  );
}
