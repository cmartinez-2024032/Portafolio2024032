import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiGithub, FiExternalLink, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ProjectDetail({ project, projects, onClose }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [project]);

  if (!project) return null;

  const shots = project.screenshots || [];
  const prevShot = () => setCurrent((i) => (i - 1 + shots.length) % shots.length);
  const nextShot = () => setCurrent((i) => (i + 1) % shots.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="project-detail-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: [0.68, -0.55, 0.265, 1.55] }}
        className="project-detail"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          <FiX size={16} />
        </button>
        <span className="detail-number">
          {String(projects.indexOf(project) + 1).padStart(2, "0")}
        </span>
        <h2>{project.title}</h2>

        {shots.length > 0 && (
          <div className="detail-gallery">
            <AnimatePresence mode="wait">
              <motion.img
                key={shots[current]}
                src={shots[current]}
                alt={`Captura ${current + 1} de ${project.title}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
            {shots.length > 1 && (
              <>
                <button
                  className="gallery-nav-btn gallery-nav-prev"
                  onClick={prevShot}
                  aria-label="Captura anterior"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  className="gallery-nav-btn gallery-nav-next"
                  onClick={nextShot}
                  aria-label="Siguiente captura"
                >
                  <FiChevronRight size={16} />
                </button>
                <div className="gallery-dots">
                  {shots.map((s, i) => (
                    <button
                      key={s}
                      className={`gallery-dot ${i === current ? "gallery-dot-active" : ""}`}
                      onClick={() => setCurrent(i)}
                      aria-label={`Ver captura ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <p>{project.description}</p>

        {project.tech && project.tech.length > 0 && (
          <div className="detail-tech">
            {project.tech.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}

        {project.features && project.features.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <p className="detail-number" style={{ marginBottom: "0.5rem" }}>Aprendizajes</p>
            <ul style={{ color: "var(--color-dim)", fontSize: "0.85rem", lineHeight: 1.8 }}>
              {project.features.map((f, i) => (
                <li key={i} style={{ paddingLeft: "1rem", position: "relative" }}>
                  <span style={{
                    position: "absolute",
                    left: 0,
                    color: "var(--color-accent)",
                    fontFamily: "var(--font-heading)",
                  }}>*</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="detail-links">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer">
              <FiGithub size={12} style={{ marginRight: "0.35rem" }} />
              Código
            </a>
          )}
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer">
              <FiExternalLink size={12} style={{ marginRight: "0.35rem" }} />
              Demo
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
