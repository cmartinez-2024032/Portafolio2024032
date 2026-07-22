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
import { softSkills } from "../data/siteConfig";

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
  return (
    <section id="abilities" className="section-wrap abilities-section">
      <ScrollReveal>
        <p className="section-comment">perfil humano</p>
        <h2 className="section-title">
          Habilidades
          <span className="text-accent">.</span>
        </h2>
        <p className="section-title-serif">Cómo trabajo y cómo soy en equipo</p>
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
              <span className="ability-index">{String(i + 1).padStart(2, "0")}</span>
              <h3>{skill.name}</h3>
              <p>{skill.blurb}</p>
              <div className="ability-bar" aria-hidden="true">
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.9, ease: EASE }}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
