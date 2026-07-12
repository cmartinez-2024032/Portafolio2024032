import ScrollReveal from "./ScrollReveal";
import { FiMapPin, FiMail, FiGithub, FiLinkedin, FiCalendar, FiBook } from "react-icons/fi";

function InfoRow({ icon, label, value, href }) {
  const content = (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.75rem 1rem",
      border: "1px solid var(--color-edge)",
      fontSize: "0.8rem",
    }}>
      <span style={{ color: "var(--color-accent)", fontSize: "0.9rem", flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ color: "var(--color-dim-more)", fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", minWidth: "4rem" }}>
        {label}
      </span>
      <span style={{ color: "var(--color-dim)", marginLeft: "auto", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{content}</a>;
  }
  return content;
}

export default function About({ data }) {
  if (!data) return null;

  return (
    <div className="section-wrap">
      <ScrollReveal>
        <p className="section-comment">introducción</p>
        <h2 className="section-title">Sobre Mí</h2>
        <p className="section-title-serif">Desarrollador Full-Stack</p>
      </ScrollReveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <ScrollReveal>
          <div style={{ border: "1px solid var(--color-edge)", padding: "2rem" }}>
            <div style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              border: "1px solid var(--color-edge)",
              marginBottom: "1rem",
            }}>
              <span style={{
                fontSize: "0.6rem",
                fontWeight: 600,
                color: "var(--color-accent)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}>
                {data.title}
              </span>
            </div>
            <p style={{ color: "var(--color-dim)", lineHeight: 1.7, fontSize: "0.9rem" }}>
              {data.bio}
            </p>
            <p style={{
              color: "var(--color-dim)",
              lineHeight: 1.7,
              fontSize: "0.85rem",
              fontStyle: "italic",
              marginTop: "1rem",
              borderTop: "1px solid var(--color-edge)",
              paddingTop: "1rem",
            }}>
              &ldquo;{data.goals}&rdquo;
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <InfoRow icon={<FiMapPin />} label="Ubicación" value={data.location} />
            <InfoRow icon={<FiCalendar />} label="Edad" value={data.age} />
            <InfoRow icon={<FiBook />} label="Formación" value={data.education} />
            <InfoRow icon={<FiGithub />} label="GitHub" value="@cmartinez-2024032" href={data.github} />
            <InfoRow icon={<FiLinkedin />} label="LinkedIn" value="/in/cmartinez" href={data.linkedin} />
            <InfoRow icon={<FiMail />} label="Email" value={data.email} href={`mailto:${data.email}`} />
            <div style={{
              padding: "1rem",
              border: "1px solid var(--color-edge)",
              textAlign: "center",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              color: "var(--color-accent)",
              textTransform: "uppercase",
              fontWeight: 600,
              marginTop: "0.5rem",
            }}>
              {data.available ? "✓ Disponible para oportunidades" : "Ocupado"}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
