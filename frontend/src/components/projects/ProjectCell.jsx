import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiCode, FiArrowUpRight } from "react-icons/fi";
import { resolveTechIcon } from "../../data/techIcons";

const EASE = [0.16, 1, 0.3, 1];
const CYCLE_MS = 2600;

function TechIcons({ tech = [], limit = 4 }) {
  const items = tech.slice(0, limit);
  return (
    <ul className="project-tech-icons" aria-label="Tecnologías">
      {items.map((name, i) => {
        const resolved = resolveTechIcon(name);
        if (!resolved) {
          return (
            <li key={name} className="project-tech-chip" title={name}>
              {name}
            </li>
          );
        }
        const { Icon, color } = resolved;
        return (
          <motion.li
            key={name}
            className="project-tech-icon"
            title={name}
            style={{ "--tech-color": color }}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: EASE }}
          >
            <Icon aria-hidden="true" />
          </motion.li>
        );
      })}
    </ul>
  );
}

export default function ProjectCell({ project, index, onClick }) {
  const featured = index === 0;
  const shots = project.screenshots || [];
  const [shot, setShot] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 160, damping: 18 });

  useEffect(() => {
    if (shots.length < 2 || paused) return undefined;
    const id = window.setInterval(() => {
      setShot((i) => (i + 1) % shots.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [shots.length, paused]);

  function onMove(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
    setPaused(false);
    setHovered(false);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 70, rotateX: 8, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.8, ease: EASE }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      data-robot-project
      data-robot-index={index}
      data-robot-label={project.title}
      className={`project-cell project-cell-stage ${featured ? "project-cell-featured" : ""} ${hovered ? "is-hovered" : ""}`}
      onClick={onClick}
      onMouseEnter={() => { setPaused(true); setHovered(true); }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <div className="project-cell-aura" aria-hidden="true" />

      <div className="project-stage">
        <div className="project-stage-chrome" aria-hidden="true">
          <span /><span /><span />
          <div className="project-stage-url">preview · {String(index + 1).padStart(2, "0")}</div>
        </div>

        <div className="project-stage-screen">
          {shots.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={shots[shot]}
                className="project-stage-shot"
                role="img"
                aria-label={`Captura de ${project.title}`}
                style={{ backgroundImage: `url(${shots[shot]})` }}
                initial={{ opacity: 0, scale: 1.1, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.05, x: -20 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
            </AnimatePresence>
          ) : (
            <div className="project-cell-fallback">
              <FiCode />
            </div>
          )}

          {shots.length > 1 && (
            <div className="project-stage-deck" aria-hidden="true">
              {shots.slice(0, 3).map((src, i) => (
                <motion.div
                  key={src}
                  className={`project-deck-card ${i === shot % 3 ? "is-front" : ""}`}
                  style={{ "--deck-i": i, backgroundImage: `url(${src})` }}
                  animate={hovered ? { y: i * -10, x: i * 12, rotate: (i - 1) * 6 } : { y: i * -6, x: i * 8, rotate: (i - 1) * 3 }}
                  transition={{ duration: 0.45, ease: EASE }}
                />
              ))}
            </div>
          )}

          <div className="project-stage-shine" aria-hidden="true" />
          {shots.length > 1 && !paused && (
            <motion.div
              key={`bar-${shot}`}
              className="project-stage-progress"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
            />
          )}
        </div>

        {shots.length > 1 && (
          <div className="project-stage-dots" aria-hidden="true">
            {shots.map((src, i) => (
              <span key={src} className={i === shot ? "is-on" : ""} />
            ))}
          </div>
        )}
      </div>

      <div className="project-cell-info project-cell-info-stage">
        <div className="project-cell-top">
          <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
          <div className="project-cell-top-right">
            {shots.length > 1 && (
              <span className="project-shots-badge">{shots.length} fotos</span>
            )}
            <motion.span
              className="project-cell-open"
              aria-hidden="true"
              animate={hovered ? { rotate: 45, scale: 1.08 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <FiArrowUpRight size={16} />
            </motion.span>
          </div>
        </div>
        <h3>{project.title}</h3>
        {project.shortDesc && <p className="project-short">{project.shortDesc}</p>}
        <TechIcons tech={project.tech} limit={featured ? 5 : 4} />
      </div>
    </motion.article>
  );
}
