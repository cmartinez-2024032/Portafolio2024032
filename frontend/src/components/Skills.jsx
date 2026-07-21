import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { useTilt } from "../hooks/useTilt";
import { skillCategories } from "../data/siteConfig";

const EASE = [0.16, 1, 0.3, 1];

function SkillCard({ skill, index, active, onHover }) {
  const tilt = useTilt(8);

  return (
    <motion.button
      ref={tilt.ref}
      type="button"
      data-robot-skill
      data-robot-index={index}
      data-robot-label={skill.name}
      className={`forge-skill-card ${active ? "is-active" : ""}`}
      style={{ "--skill-color": skill.color, ...tilt.style }}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: EASE }}
      whileHover={{ scale: 1.03 }}
      onMouseEnter={onHover}
      onFocus={onHover}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={(e) => {
        tilt.onMouseLeave(e);
      }}
    >
      <div className="forge-skill-top">
        <span className="forge-skill-dot" />
        <span className="forge-skill-pct">{skill.level}%</span>
      </div>
      <h3>{skill.name}</h3>
      <div className="forge-skill-track">
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15 + index * 0.05, ease: "easeOut" }}
          className="forge-skill-fill"
        />
      </div>
    </motion.button>
  );
}

export default function Skills({ skills }) {
  const [active, setActive] = useState("Frontend");
  const [focused, setFocused] = useState(null);

  if (!skills || skills.length === 0) return null;

  const filtered = skills.filter((s) => s.category === active);

  return (
    <div className="section-wrap forge-skills">
      <ScrollReveal>
        <p className="section-comment">habilidades</p>
        <h2 className="section-title">
          Stack
          <span className="text-accent">.</span>
        </h2>
        <p className="section-title-serif">Tecnologías con las que trabajo</p>
      </ScrollReveal>

      <ScrollReveal className="skills-pills">
        {skillCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActive(cat);
              setFocused(null);
            }}
            className={`pill ${active === cat ? "pill-active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </ScrollReveal>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="forge-skill-grid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
        >
          {filtered.map((skill, i) => (
            <SkillCard
              key={skill.name}
              skill={skill}
              index={i}
              active={focused === skill.name}
              onHover={() => setFocused(skill.name)}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
