import { useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { skillCategories } from "../data/siteConfig";

function SkillBar({ skill, index }) {
  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.35rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            width: "6px",
            height: "6px",
            backgroundColor: skill.color,
            display: "block",
          }} />
          <span style={{ fontSize: "0.85rem", color: "var(--color-dim)" }}>
            {skill.name}
          </span>
        </div>
        <span style={{ fontSize: "0.7rem", color: "var(--color-dim-more)" }}>
          {skill.level}%
        </span>
      </div>
      <div className="skill-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.level}%` }}
          transition={{ duration: 1, delay: index * 0.08, ease: "easeOut" }}
          className="skill-fill"
          style={{ backgroundColor: skill.color }}
        />
      </div>
    </div>
  );
}

export default function Skills({ skills }) {
  const [active, setActive] = useState("Frontend");

  if (!skills || skills.length === 0) return null;

  const filtered = skills.filter((s) => s.category === active);

  return (
    <div className="section-wrap">
      <ScrollReveal>
        <p className="section-comment">habilidades</p>
        <h2 className="section-title">Stack</h2>
        <p className="section-title-serif">Tecnologías con las que trabajo</p>
      </ScrollReveal>

      <div className="flex justify-center gap-2 mb-8 flex-wrap reveal">
        {skillCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`pill ${active === cat ? "pill-active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ScrollReveal>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              border: "1px solid var(--color-edge)",
              padding: "2rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {filtered.map((skill, i) => (
                <SkillBar key={skill.name} skill={skill} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </ScrollReveal>
    </div>
  );
}
