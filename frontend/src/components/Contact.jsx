import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail, FiMapPin, FiArrowUpRight, FiDownload } from "react-icons/fi";
import ScrollReveal from "./ScrollReveal";
import { useTilt } from "../hooks/useTilt";

const EASE = [0.16, 1, 0.3, 1];

function ContactCard({ card, index }) {
  const Icon = card.icon;
  const tilt = useTilt(10);

  return (
    <ScrollReveal delay={index * 0.08}>
      <motion.a
        ref={tilt.ref}
        href={card.href}
        target={card.external ? "_blank" : undefined}
        rel={card.external ? "noopener noreferrer" : undefined}
        className="contact-card contact-card-cinema"
        style={tilt.style}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        whileHover={{ y: -10, scale: 1.03 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Icon size={24} className="icon" />
        <h4>{card.title}</h4>
        <p>{card.desc}</p>
        <span className="contact-card-arrow" aria-hidden="true">
          <FiArrowUpRight size={14} />
        </span>
      </motion.a>
    </ScrollReveal>
  );
}

export default function Contact({ data }) {
  if (!data) return null;

  const cards = [
    { href: data.linkedin, icon: FiLinkedin, title: "LinkedIn", desc: "/in/cmartinez", external: true },
    { href: data.github, icon: FiGithub, title: "GitHub", desc: "@cmartinez-2024032", external: true },
    { href: `mailto:${data.email}`, icon: FiMail, title: "Email", desc: data.email, external: false },
  ];

  return (
    <div className="section-wrap contact-section">
      <div className="contact-cinema" data-robot-contact>
        <div className="contact-cinema-glow" aria-hidden="true" />

        <ScrollReveal>
          <p className="section-comment">contacto</p>
          <h2 className="section-title">
            Conectemos
            <span className="text-accent">.</span>
          </h2>
          <p className="section-title-serif">Hablemos sobre tu próximo proyecto</p>
        </ScrollReveal>

        <div className="contact-grid contact-grid-cinema">
          {cards.map((card, i) => (
            <ContactCard key={card.title} card={card} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.15}>
          <div className="contact-cta-band">
            <a href="/cv/Cristopher-Martinez-CV.pdf" download className="btn-forge btn-forge-cv">
              Descargar CV <FiDownload size={13} />
            </a>
            <div className="contact-meta">
              <span>
                <FiMapPin size={12} /> {data.location}
              </span>
              <span className={`contact-availability ${data.available ? "is-on" : ""}`}>
                <span className="forge-status-dot" />
                {data.available ? "Disponible para oportunidades" : "Actualmente ocupado"}
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
