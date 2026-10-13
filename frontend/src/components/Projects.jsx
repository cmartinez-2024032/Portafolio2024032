import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { projectCategories } from "../data/siteConfig";
import ProjectDetail from "./projects/ProjectDetail";
import ProjectsRail from "./projects/ProjectsRail";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./fx/SectionHeading";
import { useLanguage } from "../i18n/LanguageContext";

export default function Projects({ projects }) {
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState(null);
  const { t } = useLanguage();

  if (!projects || projects.length === 0) return null;

  const filtered =
    filter === "todos" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="section-wrap-wide projects-section">
      <div className="section-wrap projects-header">
        <ScrollReveal>
          <SectionHeading title={t.projects.title} phrase={t.projects.serif} />
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
        <ProjectsRail
          key={filter}
          projects={filtered}
          onSelect={setSelected}
          openLabel={t.projects.open}
        />
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
