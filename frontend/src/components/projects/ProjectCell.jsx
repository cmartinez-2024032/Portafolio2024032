import { motion } from "framer-motion";
import { FiCode } from "react-icons/fi";

export default function ProjectCell({ project, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      className="project-cell"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <div className="project-cell-img">
        <div className="project-cell-overlay" />
        {project.screenshots && project.screenshots.length > 0 ? (
          <img src={project.screenshots[0]} alt={`Captura de ${project.title}`} loading="lazy" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-surf)",
              color: "var(--color-dim-more)",
              fontSize: "3rem",
            }}
          >
            <FiCode />
          </div>
        )}
      </div>
      <div className="project-cell-info">
        <span className="project-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3>{project.title}</h3>
        <p className="project-tech">
          {project.tech?.slice(0, 3).join(" · ") || ""}
        </p>
      </div>
    </motion.div>
  );
}
