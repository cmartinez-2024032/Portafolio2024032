import { useState, useEffect, useCallback } from "react";
import { FiArrowDown } from "react-icons/fi";

const TITLE = "Full-Stack Developer";
const TYPING_SPEED = 50;

export default function Hero({ data }) {
  const [displayed, setDisplayed] = useState("");
  const [typingDone, setTypingDone] = useState(false);

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
    const timer = setTimeout(startTyping, 1200);
    return () => clearTimeout(timer);
  }, [startTyping]);

  const name = data?.name || "Cristopher Martínez";
  const photo = data?.photo || null;
  const nameInitial = name?.charAt(0) || "C";

  return (
    <section id="hero" className="page-header">
      <div className="main-bg">
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "radial-gradient(ellipse at 30% 50%, rgba(243,219,199,0.06) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="hero-content">
        <div className="hero-photo">
          {photo ? (
            <img src={photo} alt={name} />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              fontFamily: "var(--font-heading)",
              color: "var(--color-accent)",
              background: "var(--color-card)",
            }}>
              {nameInitial}
            </div>
          )}
        </div>

        <h1>{name}</h1>

        <p className="hero-sub">
          {displayed}
          {!typingDone && <span className="typewriter-cursor" />}
        </p>

        {typingDone && (
          <div className="hero-cta">
            <button
              onClick={() => document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" })}
              className="btn btn-primary"
            >
              Conóceme <FiArrowDown size={12} />
            </button>
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="btn"
            >
              Ver Proyectos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
