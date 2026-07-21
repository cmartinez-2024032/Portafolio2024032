import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FiArrowDown,
  FiDownload,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiArrowUpRight,
} from "react-icons/fi";
import { useMagnetic } from "../hooks/useMagnetic";

const TITLE = "Full-Stack Developer";
const TYPING_SPEED = 42;
const EASE = [0.16, 1, 0.3, 1];
const KEYWORDS = ["CÓDIGO", "REACT", "NODE.JS", "C# .NET", "DISEÑO", "BACKEND"];

export default function Hero({ data }) {
  const [displayed, setDisplayed] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const nameY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const magPrimary = useMagnetic(14);
  const magCv = useMagnetic(14);
  const magGhost = useMagnetic(14);

  const startTyping = useCallback(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      i++;
      setDisplayed(TITLE.slice(0, i));
      if (i >= TITLE.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, TYPING_SPEED);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(startTyping, 500);
    return () => clearTimeout(timer);
  }, [startTyping]);

  const name = data?.name || "Cristopher Martínez";
  const parts = name.split(" ");
  const firstName = parts[0] || name;
  const lastName = parts.slice(1).join(" ");
  const photo = data?.photo || null;
  const phrase = data?.phrase || "Código que transforma ideas en soluciones.";

  return (
    <section id="hero" className="forge-hero" ref={sectionRef}>
      <motion.div
        className="forge-hero-media"
        style={{ y: photoY }}
        aria-hidden={!photo}
        data-robot-portrait
      >
        {photo ? (
          <img src={photo} alt="" className="forge-hero-img" />
        ) : (
          <div className="forge-hero-img-fallback">{name.charAt(0)}</div>
        )}
        <div className="forge-hero-media-shade" />
        <div className="forge-hero-media-scan" />
        <div className="forge-hero-media-frame" />
      </motion.div>

      <motion.div className="forge-hero-copy" style={{ y: nameY, opacity: fade }}>
        <div className="forge-hero-keywords" aria-hidden="true">
          <div className="forge-hero-keywords-track">
            {[...KEYWORDS, ...KEYWORDS].map((k, i) => (
              <span key={i}>{k}</span>
            ))}
          </div>
        </div>

        <motion.p
          className="forge-eyebrow"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="forge-eyebrow-dot" />
          Disponible · Guatemala
        </motion.p>

        <h1 className="forge-name">
          <span className="forge-name-mask">
            <motion.span
              className="forge-name-line"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.1, ease: EASE }}
            >
              {firstName}
            </motion.span>
          </span>
          {lastName && (
            <>
              {" "}
              <span className="forge-name-mask">
                <motion.span
                  className="forge-name-line forge-name-accent"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.22, ease: EASE }}
                >
                  {lastName}
                </motion.span>
              </span>
            </>
          )}
        </h1>

        <motion.p
          className="forge-role hero-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {displayed}
          {!typingDone && <span className="typewriter-cursor" />}
        </motion.p>

        <motion.p
          className="forge-phrase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: typingDone ? 1 : 0, y: typingDone ? 0 : 16 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          {phrase}
        </motion.p>

        {typingDone && (
          <motion.div
            className="forge-cta"
            data-robot-avoid
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <motion.a
              ref={magPrimary.ref}
              href="#projects"
              className="btn-forge btn-forge-primary"
              style={magPrimary.style}
              onMouseMove={magPrimary.onMouseMove}
              onMouseLeave={magPrimary.onMouseLeave}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ver proyectos <FiArrowUpRight size={16} />
            </motion.a>
            <motion.a
              ref={magCv.ref}
              href="/cv/Cristopher-Martinez-CV.pdf"
              download
              className="btn-forge btn-forge-cv"
              style={magCv.style}
              onMouseMove={magCv.onMouseMove}
              onMouseLeave={magCv.onMouseLeave}
            >
              Descargar CV <FiDownload size={15} />
            </motion.a>
            <motion.button
              ref={magGhost.ref}
              type="button"
              className="btn-forge btn-forge-ghost"
              style={magGhost.style}
              onMouseMove={magGhost.onMouseMove}
              onMouseLeave={magGhost.onMouseLeave}
              onClick={() => document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" })}
            >
              Conóceme <FiArrowDown size={14} />
            </motion.button>
          </motion.div>
        )}

        {typingDone && (
          <motion.div
            className="forge-socials"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            {data?.github && (
              <a href={data.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub size={18} />
              </a>
            )}
            {data?.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FiLinkedin size={18} />
              </a>
            )}
            {data?.email && (
              <a href={`mailto:${data.email}`} aria-label="Email">
                <FiMail size={18} />
              </a>
            )}
          </motion.div>
        )}
      </motion.div>

      <div className="forge-scroll" aria-hidden="true">
        <span>Scroll</span>
        <span className="forge-scroll-line" />
      </div>
    </section>
  );
}
