import { FiCode } from "react-icons/fi";
import "./projects-carousel-3d.css";

/**
 * Carrusel 3D tipo Uiverse: fotos de proyectos girando.
 * Click / tap abre el detalle.
 */
export default function ProjectsCarousel3D({ projects = [], onSelect }) {
  const count = projects.length;
  if (!count) return null;

  const duration = Math.max(16, count * 3.2);
  const cardW = count <= 4 ? 110 : count <= 6 ? 96 : 84;
  const cardH = Math.round(cardW * 1.4);
  const radius = Math.max(150, Math.round((count * cardW) / (2 * Math.PI) * 1.35));

  return (
    <div className="projects-orbit">
      <p className="projects-orbit-hint">Toca una foto para ver el detalle</p>

      <div
        className="card-3d"
        style={{
          "--n": count,
          "--z": `${radius}px`,
          "--dur": `${duration}s`,
          "--cw": `${cardW}px`,
          "--ch": `${cardH}px`,
        }}
        aria-label="Carrusel de proyectos"
      >
        {projects.map((project, i) => {
          const cover = project.screenshots?.[0];
          return (
            <button
              key={project.id}
              type="button"
              className="card-3d-face"
              style={{
                "--i": i,
                animationDelay: `${(-(i * duration) / count).toFixed(3)}s`,
                ...(cover ? { backgroundImage: `url(${cover})` } : {}),
              }}
              onClick={() => onSelect?.(project)}
              aria-label={`Abrir ${project.title}`}
              data-robot-project
              data-robot-index={i}
              data-robot-label={project.title}
            >
              {!cover && (
                <span className="card-3d-fallback" aria-hidden="true">
                  <FiCode />
                </span>
              )}
              <span className="card-3d-label">
                <span className="card-3d-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="card-3d-title">{project.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
