import { motion } from "framer-motion";
import { FiCode, FiArrowUpRight } from "react-icons/fi";
import { useTilt } from "../../hooks/useTilt";

const EASE = [0.16, 1, 0.3, 1];

export default function ProjectCell({ project, index, onClick }) {
  const featured = index === 0;
  const tilt = useTilt(5);

  return (
    <motion.article
      ref={tilt.ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -14, transition: { duration: 0.4, ease: EASE } }}
      transition={{ delay: index * 0.09, duration: 0.8, ease: EASE }}
      style={tilt.style}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      data-robot-project
      data-robot-index={index}
      data-robot-label={project.title}
      className={`project-cell ${featured ? "project-cell-featured" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <div className="project-cell-img">
        <div className="project-cell-overlay" />
        <div className="project-cell-sheen" />
        {project.screenshots && project.screenshots.length > 0 ? (
          <img
            src={project.screenshots[0]}
            alt={`Captura de ${project.title}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="project-cell-fallback">
            <FiCode />
          </div>
        )}
      </div>

      <div className="project-cell-info">
        <div className="project-cell-top">
          <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="project-cell-open" aria-hidden="true">
            <FiArrowUpRight size={16} />
          </span>
        </div>
        <h3>{project.title}</h3>
        {project.shortDesc && <p className="project-short">{project.shortDesc}</p>}
        <p className="project-tech">
          {project.tech?.slice(0, featured ? 5 : 3).join(" · ") || ""}
        </p>
      </div>
    </motion.article>
  );
}
