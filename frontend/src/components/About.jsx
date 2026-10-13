import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import Counter from "./Counter";
import ScrollWords from "./fx/ScrollWords";
import SectionHeading from "./fx/SectionHeading";
import { useTilt } from "../hooks/useTilt";
import { FiMapPin, FiMail, FiGithub, FiLinkedin, FiBook } from "react-icons/fi";
import { useLanguage } from "../i18n/LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

function MetaRow({ icon, label, value, href, index }) {
  const inner = (
    <motion.div
      className="forge-meta-row"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
      whileHover={{ x: 6, borderColor: "var(--color-accent)" }}
    >
      <span className="forge-meta-icon">{icon}</span>
      <div>
        <span className="forge-meta-label">{label}</span>
        <span className="forge-meta-value">{value}</span>
      </div>
    </motion.div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="forge-meta-link">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function About({ data }) {
  const tilt = useTilt(6);
  const { t, locale } = useLanguage();

  if (!data) return null;

  const bio = locale === "en" ? t.personalFallback.bio : data.bio;
  const goals = locale === "en" ? t.personalFallback.goals : data.goals;

  return (
    <div className="section-wrap forge-about">
      <ScrollReveal className="forge-bento-kicker">
        <SectionHeading title={t.about.title} phrase={t.about.serif} />
      </ScrollReveal>

      <motion.div
        ref={tilt.ref}
        className="forge-bento-bio forge-panel"
        data-robot-observe
        style={tilt.style}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span className="forge-panel-tag">{data.title}</span>
        <ScrollWords text={bio} className="forge-about-bio" />
        <p className="forge-about-goals">&ldquo;{goals}&rdquo;</p>
      </motion.div>

      <div className="forge-bento-stats">
        <div className="forge-strip-item">
          <span><Counter value={data.yearsCoding} /></span>
          <small>{locale === "en" ? "Years coding" : "Años programando"}</small>
        </div>
        <div className="forge-strip-item">
          <span><Counter value={data.age} /></span>
          <small>{t.about.age}</small>
        </div>
      </div>

      <div className="forge-bento-meta">
        <MetaRow icon={<FiMapPin />} label={t.about.location} value={data.location} index={0} />
        <MetaRow icon={<FiBook />} label={t.about.education} value={data.education} index={1} />
        <MetaRow icon={<FiGithub />} label="GitHub" value="@cmartinez-2024032" href={data.github} index={2} />
        {data.linkedin && (
          <MetaRow icon={<FiLinkedin />} label="LinkedIn" value="/in/daniel-martínez" href={data.linkedin} index={3} />
        )}
        <MetaRow
          icon={<FiMail />}
          label={t.about.email}
          value={data.email}
          href={`mailto:${data.email}`}
          index={data.linkedin ? 4 : 3}
        />
      </div>
    </div>
  );
}
