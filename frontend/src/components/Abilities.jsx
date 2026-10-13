import { motion } from "framer-motion";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiSmile,
  FiShield,
  FiZap,
  FiMessageCircle,
  FiTarget,
  FiBookOpen,
} from "react-icons/fi";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./fx/SectionHeading";
import { useLanguage } from "../i18n/LanguageContext";

const EASE = [0.16, 1, 0.3, 1];

const ICONS = {
  users: FiUsers,
  check: FiCheckCircle,
  clock: FiClock,
  smile: FiSmile,
  shield: FiShield,
  zap: FiZap,
  message: FiMessageCircle,
  target: FiTarget,
  book: FiBookOpen,
};

export default function Abilities() {
  const { t } = useLanguage();
  const softSkills = t.softSkills;

  return (
    <section id="abilities" className="section-wrap abilities-section">
      <ScrollReveal>
        <SectionHeading title={t.abilities.title} phrase={t.abilities.serif} />
      </ScrollReveal>

      <div className="abilities-grid">
        {softSkills.map((skill, i) => {
          const Icon = ICONS[skill.icon] || FiZap;
          return (
            <motion.article
              key={skill.name}
              className={`ability-card ${i === 0 ? "ability-card-lead" : ""}`}
              initial={{ opacity: 0, y: 40, rotateX: 12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07, duration: 0.65, ease: EASE }}
              whileHover={{
                y: -10,
                scale: 1.03,
                transition: { duration: 0.35, ease: EASE },
              }}
            >
              <motion.span
                className="ability-orb"
                aria-hidden="true"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon size={22} />
              </motion.span>
              <h3>{skill.name}</h3>
              <p>{skill.blurb}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
