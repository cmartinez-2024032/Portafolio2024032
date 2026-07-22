import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiGithub, FiExternalLink, FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import { resolveTechIcon } from "../../data/techIcons";

const EASE = [0.16, 1, 0.3, 1];
const AUTOPLAY_MS = 4000;

export default function ProjectDetail({ project, projects, onClose }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setCurrent(0);
    setDirection(0);
    setPlaying(true);
  }, [project]);

  const shots = project?.screenshots || [];

  useEffect(() => {
    if (!project) return undefined;
    const shotsLen = shots.length;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (shotsLen < 2) return;
      if (e.key === "ArrowLeft") {
        setPlaying(false);
        setDirection(-1);
        setCurrent((i) => (i - 1 + shotsLen) % shotsLen);
      }
      if (e.key === "ArrowRight") {
        setPlaying(false);
        setDirection(1);
        setCurrent((i) => (i + 1) % shotsLen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose, shots.length]);

  useEffect(() => {
    if (!playing || shots.length < 2) return undefined;
    const id = window.setInterval(() => {
      setDirection(1);
      setCurrent((i) => (i + 1) % shots.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [playing, shots.length, current]);

  if (!project) return null;

  function go(delta) {
    if (shots.length < 2) return;
    setPlaying(false);
    setDirection(delta);
    setCurrent((i) => (i + delta + shots.length) % shots.length);
  }

  const variants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir >= 0 ? "12%" : "-12%",
      scale: 1.08,
    }),
    center: { opacity: 1, x: "0%", scale: 1 },
    exit: (dir) => ({
      opacity: 0,
      x: dir >= 0 ? "-10%" : "10%",
      scale: 1.04,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="project-detail-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="project-detail project-detail-cinema glow-gold"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          <FiX size={16} />
        </button>

        <div className="project-detail-layout">
          {shots.length > 0 && (
            <div className="detail-gallery-wrap">
              <div className="detail-gallery detail-gallery-cinema">
                <div className="detail-gallery-chrome" aria-hidden="true">
                  <span /><span /><span />
                </div>
                <div className="detail-gallery-viewport">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={shots[current]}
                      className="detail-gallery-shot"
                      role="img"
                      aria-label={`Captura ${current + 1} de ${project.title}`}
                      style={{ backgroundImage: `url(${shots[current]})` }}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.55, ease: EASE }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.12}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -60) go(1);
                        else if (info.offset.x > 60) go(-1);
                      }}
                    />
                  </AnimatePresence>
                </div>

                {shots.length > 1 && (
                  <>
                    <button className="gallery-nav-btn gallery-nav-prev" onClick={() => go(-1)} aria-label="Captura anterior">
                      <FiChevronLeft size={16} />
                    </button>
                    <button className="gallery-nav-btn gallery-nav-next" onClick={() => go(1)} aria-label="Siguiente captura">
                      <FiChevronRight size={16} />
                    </button>
                    <div className="gallery-hud">
                      <span className="gallery-counter">
                        {String(current + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        className="gallery-play-btn"
                        onClick={() => setPlaying((p) => !p)}
                        aria-label={playing ? "Pausar carrusel" : "Reproducir carrusel"}
                      >
                        {playing ? <FiPause size={13} /> : <FiPlay size={13} />}
                      </button>
                    </div>
                    {playing && (
                      <motion.div
                        key={`progress-${current}`}
                        className="gallery-progress"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </>
                )}
              </div>

              {shots.length > 1 && (
                <div className="gallery-filmstrip" role="tablist" aria-label="Miniaturas">
                  {shots.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      role="tab"
                      aria-selected={i === current}
                      className={`gallery-thumb ${i === current ? "is-active" : ""}`}
                      onClick={() => {
                        setPlaying(false);
                        setDirection(i > current ? 1 : -1);
                        setCurrent(i);
                      }}
                    >
                      <span style={{ backgroundImage: `url(${src})` }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="project-detail-copy">
            <span className="detail-number">
              {String(projects.indexOf(project) + 1).padStart(2, "0")}
            </span>
            <h2>{project.title}</h2>
            <p>{project.description}</p>

            {project.tech && project.tech.length > 0 && (
              <div className="detail-tech detail-tech-icons">
                {project.tech.map((t) => {
                  const resolved = resolveTechIcon(t);
                  const Icon = resolved?.Icon;
                  return (
                    <span key={t} className="detail-tech-pill">
                      {Icon && <Icon style={{ color: resolved.color }} aria-hidden="true" />}
                      {t}
                    </span>
                  );
                })}
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
