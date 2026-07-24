import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { FiBook, FiAward, FiBriefcase } from "react-icons/fi";
import { timelineItems } from "../data/siteConfig";
import { useLanguage } from "../i18n/LanguageContext";

const typeConfig = {
  education: { color: "var(--color-accent)", label: "edu" },
  certification: { color: "var(--color-dim)", label: "cert" },
  work: { color: "var(--color-accent)", label: "work" },
};

const typeIcons = {
  education: FiBook,
  certification: FiAward,
  work: FiBriefcase,
};

const EASE = [0.16, 1, 0.3, 1];

function TimelineItem({ item, index }) {
  const cfg = typeConfig[item.type] || typeConfig.work;
  const Icon = typeIcons[item.type] || FiBriefcase;
  const side = index % 2 === 0 ? "left" : "right";

  return (
    <ScrollReveal variant={side} delay={index * 0.12} className={`timeline-row timeline-row-${side}`}>
      <motion.div
        className="timeline-item"
        whileHover={{ x: side === "left" ? 10 : -10 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div className="forge-panel timeline-card" style={{ marginBottom: 0 }}>
          <span className="timeline-year" style={{ color: cfg.color }}>
            {item.year}
          </span>
          <h3 className="timeline-title">{item.title}</h3>
          <p className="timeline-subtitle">{item.subtitle}</p>
          <p className="timeline-desc">{item.description}</p>
        </div>
        <div className="timeline-node">
          <Icon size={14} style={{ color: cfg.color }} />
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function Timeline() {
  const { t } = useLanguage();

  return (
    <div className="section-wrap timeline-section">
      <ScrollReveal>
        <p className="section-comment">{t.timeline.comment}</p>
        <h2 className="section-title">
          {t.timeline.title}
          <span className="text-accent">.</span>
        </h2>
        <p className="section-title-serif">{t.timeline.serif}</p>
      </ScrollReveal>

      <div className="timeline-track timeline-track-zigzag">
        <div className="timeline-line" aria-hidden="true" />
        <div className="timeline-list">
          {timelineItems.map((item, i) => (
            <TimelineItem key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
