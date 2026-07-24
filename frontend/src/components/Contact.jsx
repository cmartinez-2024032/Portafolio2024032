import { useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail, FiMapPin, FiArrowUpRight, FiDownload, FiSend } from "react-icons/fi";
import ScrollReveal from "./ScrollReveal";
import { useTilt } from "../hooks/useTilt";
import { useLanguage } from "../i18n/LanguageContext";

const EASE = [0.16, 1, 0.3, 1];
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

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

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function Contact({ data }) {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  if (!data) return null;

  const cards = [
    {
      href: data.github,
      icon: FiGithub,
      title: "GitHub",
      desc: locale === "en" ? "Code & repositories" : "Código y repositorios",
      external: true,
    },
    {
      href: data.linkedin,
      icon: FiLinkedin,
      title: "LinkedIn",
      desc: locale === "en" ? "Professional profile" : "Perfil profesional",
      external: true,
    },
    {
      href: `mailto:${data.email}`,
      icon: FiMail,
      title: "Email",
      desc: data.email,
      external: false,
    },
  ].filter((c) => c.href);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));

      if (payload.needsActivation) {
        setStatus("error");
        setFeedback(
          payload.message ||
            "Revisa dannym2407@gmail.com (y Spam): FormSubmit envió un link de verificación. Actívalo y vuelve a enviar.",
        );
        return;
      }

      // SMTP aún no configurado → abrir cliente de correo con el mensaje listo
      if (payload.needsSmtp && payload.mailto) {
        window.location.href = payload.mailto;
        setStatus("error");
        setFeedback(
          "Aún falta configurar el envío automático. Se abrió tu correo como respaldo.",
        );
        return;
      }

      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error || payload.message || t.contact.error);
      }

      setStatus("success");
      setFeedback(payload.message || t.contact.success);
      setForm(initialForm);
      window.dispatchEvent(new CustomEvent("forge:contact-success"));
    } catch (err) {
      setStatus("error");
      setFeedback(err.message || t.contact.error);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="section-wrap contact-section">
      <div className="contact-cinema" data-robot-contact>
        <div className="contact-cinema-glow" aria-hidden="true" />

        <ScrollReveal>
          <p className="section-comment">{t.contact.comment}</p>
          <h2 className="section-title">
            {t.contact.title}
            <span className="text-accent">.</span>
          </h2>
          <p className="section-title-serif">{t.contact.serif}</p>
        </ScrollReveal>

        <div className="contact-grid contact-grid-cinema">
          {cards.map((card, i) => (
            <ContactCard key={card.title} card={card} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.12}>
          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <div className="contact-form-header">
              <h3>{t.contact.send}</h3>
              <p>{t.contact.serif}</p>
            </div>

            <div className="contact-form-grid">
              <label className="contact-field">
                <span>{t.contact.name}</span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={onChange}
                  placeholder={t.contact.name}
                />
              </label>

              <label className="contact-field">
                <span>{t.contact.email}</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={180}
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@email.com"
                />
              </label>

              <label className="contact-field contact-field-full">
                <span>{t.contact.subject}</span>
                <input
                  name="subject"
                  type="text"
                  required
                  maxLength={200}
                  value={form.subject}
                  onChange={onChange}
                  placeholder={t.contact.subject}
                />
              </label>

              <label className="contact-field contact-field-full">
                <span>{t.contact.message}</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  maxLength={4000}
                  value={form.message}
                  onChange={onChange}
                  placeholder={t.contact.message}
                />
              </label>
            </div>

            <div className="contact-form-actions">
              <button
                type="submit"
                className="btn-forge"
                disabled={status === "loading"}
              >
                {status === "loading" ? t.contact.sending : t.contact.send}
                <FiSend size={14} />
              </button>
              {feedback && (
                <p
                  className={`contact-form-feedback ${status === "success" ? "is-ok" : "is-err"}`}
                  role="status"
                >
                  {feedback}
                </p>
              )}
            </div>
          </form>
        </ScrollReveal>

        <ScrollReveal delay={0.18}>
          <div className="contact-cta-band">
            <a href="/cv/Cristopher-Martinez-CV.pdf" download className="btn-forge btn-forge-cv">
              {t.hero.ctaCv} <FiDownload size={13} />
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
