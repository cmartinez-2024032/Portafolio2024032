import ScrollReveal from "./ScrollReveal";
import { FiBook, FiAward, FiBriefcase } from "react-icons/fi";
import { timelineItems } from "../data/siteConfig";

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

function TimelineItem({ item }) {
  const cfg = typeConfig[item.type] || typeConfig.work;
  const Icon = typeIcons[item.type] || FiBriefcase;

  return (
    <ScrollReveal>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        <div style={{
          position: "relative",
          zIndex: 2,
          flexShrink: 0,
          width: "3rem",
          height: "3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--color-edge)",
          background: "var(--color-base)",
        }}>
          <Icon size={14} style={{ color: cfg.color }} />
        </div>
        <div style={{
          flex: 1,
          border: "1px solid var(--color-edge)",
          padding: "1.25rem",
        }}>
          <span style={{
            fontSize: "0.65rem",
            fontWeight: 600,
            color: cfg.color,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>
            {item.year}
          </span>
          <h3 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.9rem",
            color: "var(--color-fg)",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            marginTop: "0.25rem",
          }}>
            {item.title}
          </h3>
          <p style={{
            fontSize: "0.75rem",
            color: "var(--color-dim)",
            marginTop: "0.15rem",
          }}>
            {item.subtitle}
          </p>
          <p style={{
            fontSize: "0.8rem",
            color: "var(--color-dim-more)",
            marginTop: "0.5rem",
            lineHeight: 1.6,
          }}>
            {item.description}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function Timeline() {
  return (
    <div className="section-wrap">
      <ScrollReveal>
        <p className="section-comment">trayectoria</p>
        <h2 className="section-title">Recorrido</h2>
        <p className="section-title-serif">Educación, certificaciones y experiencia</p>
      </ScrollReveal>

      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
        <div style={{
          position: "absolute",
          left: "1.5rem",
          top: 0,
          bottom: 0,
          width: "1px",
          background: "var(--color-edge)",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {timelineItems.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
