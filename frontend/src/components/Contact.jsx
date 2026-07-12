import { FiGithub, FiLinkedin, FiMail, FiMapPin } from "react-icons/fi";
import ScrollReveal from "./ScrollReveal";

export default function Contact({ data }) {
  if (!data) return null;

  return (
    <section id="contact" className="section-wrap">
      <ScrollReveal>
        <p className="section-comment">contacto</p>
        <h2 className="section-title">Conectemos</h2>
        <p className="section-title-serif">Hablemos sobre tu próximo proyecto</p>
      </ScrollReveal>

      <div className="contact-grid">
        <ScrollReveal>
          <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="contact-card">
            <FiLinkedin size={22} className="icon" />
            <h4>LinkedIn</h4>
            <p>/in/cmartinez</p>
          </a>
        </ScrollReveal>

        <ScrollReveal>
          <a href={data.github} target="_blank" rel="noopener noreferrer" className="contact-card">
            <FiGithub size={22} className="icon" />
            <h4>GitHub</h4>
            <p>@cmartinez-2024032</p>
          </a>
        </ScrollReveal>

        <ScrollReveal>
          <a href={`mailto:${data.email}`} className="contact-card">
            <FiMail size={22} className="icon" />
            <h4>Email</h4>
            <p>{data.email}</p>
          </a>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <div style={{
          marginTop: "2rem",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--color-dim)",
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <FiMapPin size={12} /> {data.location}
          </span>
          <span>{data.available ? "Disponible para oportunidades" : "Actualmente ocupado"}</span>
        </div>
      </ScrollReveal>
    </section>
  );
}
