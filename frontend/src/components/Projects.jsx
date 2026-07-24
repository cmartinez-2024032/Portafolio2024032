import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { projectCategories } from "../data/siteConfig";
import ProjectCell from "./projects/ProjectCell";
import ProjectDetail from "./projects/ProjectDetail";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";

export default function Projects({ projects }) {
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState(null);
  const { t } = useLanguage();

  if (!projects || projects.length === 0) return null;

  const filtered = filter === "todos"
    ? projects
    : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="section-wrap-wide projects-section">
      <div className="section-wrap projects-header">
        <ScrollReveal>
          <p className="section-comment">{t.projects.comment}</p>
          <h2 className="section-title">
            {t.projects.title}
            <span className="text-accent">.</span>
          </h2>
          <p className="section-title-serif">{t.projects.serif}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="projects-filters">
          {projectCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`pill ${filter === cat ? "pill-active" : ""}`}
            >
              {cat === "todos" ? t.projects.all : cat}
            </button>
          ))}
        </ScrollReveal>
      </div>

      {filtered.length > 0 ? (
        <div className="projects-grid projects-grid-cinema">
          {filtered.map((project, i) => (
            <ProjectCell
              key={project.id}
              project={project}
              index={i}
              onClick={() => setSelected(project)}
            />
          ))}
        </div>
      ) : (
        <div className="section-wrap text-center">
          <p className="text-dim-more text-sm" style={{ letterSpacing: "0.15em" }}>
            No hay proyectos en esta categoría
          </p>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ProjectDetail
            project={selected}
            projects={filtered}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
