import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { projectCategories } from "../data/siteConfig";
import ProjectCell from "./projects/ProjectCell";
import ProjectDetail from "./projects/ProjectDetail";

export default function Projects({ projects }) {
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState(null);

  if (!projects || projects.length === 0) return null;

  const filtered = filter === "todos"
    ? projects
    : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="section-wrap-wide">
      <div className="section-wrap" style={{ paddingBottom: "3rem", paddingTop: "0" }}>
        <p className="section-comment reveal">selección de trabajos</p>
        <h2 className="section-title reveal">Proyectos</h2>

        <div className="flex gap-2 mb-8 flex-wrap reveal">
          {projectCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`pill ${filter === cat ? "pill-active" : ""}`}
            >
              {cat === "todos" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="projects-grid">
          {filtered.map((project, i) => (
            <ProjectCell key={project.id} project={project} index={i} onClick={() => setSelected(project)} />
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
          <ProjectDetail project={selected} projects={filtered} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
