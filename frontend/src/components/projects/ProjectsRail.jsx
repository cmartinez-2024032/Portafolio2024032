import { useRef } from "react";
import { FiArrowUpRight, FiCode } from "react-icons/fi";
import { gsap, useGSAP, MOTION_OK } from "../../lib/gsap";
import { resolveTechIcon } from "../../data/techIcons";
import "./projects-rail.css";

const TECH_LIMIT = 4;
const MAX_TURN = 16;
const MIN_SCALE = 0.9;

function TechList({ tech = [] }) {
  const shown = tech.slice(0, TECH_LIMIT);
  const rest = tech.length - shown.length;
  return (
    <ul className="rail-tech">
      {shown.map((name) => {
        const resolved = resolveTechIcon(name);
        const Icon = resolved?.Icon;
        return (
          <li key={name}>
            {Icon && <Icon style={{ color: resolved.color }} aria-hidden="true" />}
            {name}
          </li>
        );
      })}
      {rest > 0 && <li className="rail-tech-more">+{rest}</li>}
    </ul>
  );
}

/**
 * Projects laid out on a horizontal rail. With motion allowed, the rail is pinned
 * and vertical scrolling drives it sideways; otherwise it is a native swipe row.
 */
export default function ProjectsRail({ projects = [], onSelect, openLabel }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const root = rootRef.current;
        const track = trackRef.current;
        const items = gsap.utils.toArray(".rail-card", track);
        const bodies = items.map((el) => el.querySelector(".rail-card-body"));
        const pose = bodies.map((el) => gsap.quickSetter(el, "css"));
        const setBar = gsap.quickSetter(barRef.current, "scaleX");

        root.classList.add("is-driven");

        let centers = [];
        let mid = 0;
        let active = -1;
        const distance = () => Math.max(0, track.scrollWidth - root.clientWidth);
        const measure = () => {
          mid = root.clientWidth / 2;
          centers = items.map((el) => track.offsetLeft + el.offsetLeft + el.offsetWidth / 2);
        };

        // Cards curve toward the viewer like a wraparound screen and settle flat at the center.
        const shape = (x) => {
          let nearest = 0;
          centers.forEach((c, i) => {
            const d = gsap.utils.clamp(-1, 1, (c + x - mid) / mid);
            pose[i]({ rotationY: d * -MAX_TURN, scale: 1 - Math.abs(d) * (1 - MIN_SCALE) });
            if (Math.abs(c + x - mid) < Math.abs(centers[nearest] + x - mid)) nearest = i;
          });
          if (nearest !== active && countRef.current) {
            active = nearest;
            countRef.current.textContent = String(nearest + 1);
          }
        };

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          onUpdate() {
            setBar(this.progress());
            shape(gsap.getProperty(track, "x"));
          },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measure();
              shape(gsap.getProperty(track, "x"));
            },
          },
        });

        return () => root.classList.remove("is-driven");
      });
    },
    { scope: rootRef, dependencies: [projects] }
  );

  if (!projects.length) return null;

  return (
    <div className="rail" ref={rootRef}>
      <div className="rail-track" ref={trackRef}>
        {projects.map((project, i) => {
          const cover = project.screenshots?.[0];
          return (
            <article
              key={project.id}
              className="rail-card"
              data-robot-project
              data-robot-index={i}
              data-robot-label={project.title}
            >
              <div className="rail-card-body">
                <div className="rail-shot">
                  {cover ? (
                    <img src={cover} alt="" loading="lazy" decoding="async" draggable="false" />
                  ) : (
                    <FiCode aria-hidden="true" />
                  )}
                </div>
                <div className="rail-info">
                  <div className="rail-tags">
                    {project.year && <span className="rail-year">{project.year}</span>}
                    {project.category && <span className="rail-cat">{project.category}</span>}
                  </div>
                  <h3 className="rail-title">{project.title}</h3>
                  {project.shortDesc && <p className="rail-desc">{project.shortDesc}</p>}
                  <div className="rail-foot">
                    <TechList tech={project.tech} />
                    <button
                      type="button"
                      className="rail-open"
                      onClick={() => onSelect?.(project)}
                      aria-label={`${openLabel}: ${project.title}`}
                    >
                      <FiArrowUpRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rail-meter" aria-hidden="true">
        <span className="rail-count">
          <b ref={countRef}>1</b> / {projects.length}
        </span>
        <span className="rail-bar">
          <i ref={barRef} />
        </span>
      </div>
    </div>
  );
}
