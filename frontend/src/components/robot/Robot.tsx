import { memo } from "react";
import { useRobot } from "../../hooks/useRobot";
import "./robot.css";

/**
 * Pure visual shell for the companion drone.
 * All motion / state lives in RobotController via useRobot.
 */
function Robot() {
  const robotRef = useRobot();

  return (
    <aside
      ref={robotRef}
      className="robot-companion"
      data-mode="hidden"
      data-inactive="false"
      aria-hidden="true"
    >
      <div className="robot-flight">
        <div className="robot-aura" />
        <div className="robot-orbit robot-orbit-back" />
        <div className="robot-beam" />

        <svg
          className="robot-visual"
          viewBox="0 0 128 148"
          role="presentation"
          focusable="false"
        >
          <defs>
            <linearGradient id="robot-shell-gradient" x1="16" y1="12" x2="112" y2="128">
              <stop offset="0" stopColor="#3a3432" />
              <stop offset="0.45" stopColor="#161618" />
              <stop offset="1" stopColor="#070708" />
            </linearGradient>
            <linearGradient id="robot-edge-gradient" x1="20" y1="18" x2="108" y2="120">
              <stop offset="0" stopColor="#ffb396" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#ff5a36" stopOpacity="0.35" />
              <stop offset="1" stopColor="#ff5a36" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="robot-core-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#fff7f2" />
              <stop offset="0.35" stopColor="#ffb29d" />
              <stop offset="0.75" stopColor="#ff5a36" />
              <stop offset="1" stopColor="#8f1f0c" />
            </radialGradient>
            <filter id="robot-core-glow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Thruster wash */}
          <g className="robot-thrusters">
            <ellipse className="robot-thrust robot-thrust-left" cx="42" cy="128" rx="7" ry="14" />
            <ellipse className="robot-thrust robot-thrust-right" cx="86" cy="128" rx="7" ry="14" />
          </g>

          {/* Rotor rings */}
          <g className="robot-rotors">
            <ellipse className="robot-rotor robot-rotor-left" cx="28" cy="48" rx="18" ry="5" />
            <ellipse className="robot-rotor robot-rotor-right" cx="100" cy="48" rx="18" ry="5" />
            <circle cx="28" cy="48" r="3.2" className="robot-hub" />
            <circle cx="100" cy="48" r="3.2" className="robot-hub" />
          </g>

          {/* Antenna */}
          <g className="robot-antenna">
            <path d="M64 24 L74 8" />
            <circle cx="75.5" cy="6.5" r="3.4" />
          </g>

          {/* Arms */}
          <g className="robot-arm robot-arm-left">
            <path d="M30 72 C16 78 14 94 22 102" />
            <circle cx="21" cy="105" r="4.2" />
          </g>
          <g className="robot-arm robot-arm-right">
            <path d="M98 72 C112 78 114 92 106 101" />
            <path className="robot-pointer" d="M106 101 L116 93 M106 101 L118 101" />
            <circle cx="106" cy="104" r="4.2" />
          </g>

          {/* Body */}
          <g className="robot-body">
            <path
              className="robot-shell"
              d="M34 34 C44 20 84 20 94 34 C106 48 104 92 94 112 C84 130 44 130 34 112 C22 94 22 50 34 34Z"
            />
            <path
              className="robot-shell-edge"
              d="M38 38 C48 26 80 26 90 38 C100 50 98 90 90 106 C82 120 46 120 38 106 C28 90 28 52 38 38Z"
            />

            <g className="robot-face">
              <path className="robot-visor" d="M40 48 C52 38 78 38 90 48 L88 70 C74 78 52 78 40 70Z" />
              <g className="robot-eye">
                <rect x="50" y="55" width="28" height="7.5" rx="3.75" />
                <circle cx="82" cy="58.8" r="2.4" />
              </g>
              <path className="robot-blink" d="M50 58.8 H84" />
            </g>

            <g className="robot-core" filter="url(#robot-core-glow)">
              <circle cx="64" cy="94" r="13" />
              <circle cx="64" cy="94" r="6" />
            </g>

            <path className="robot-detail" d="M46 116 H82" />
            <circle className="robot-status-light" cx="90" cy="108" r="2.4" />
          </g>
        </svg>

        <div className="robot-orbit robot-orbit-front" />
        <span className="robot-particle robot-particle-one" />
        <span className="robot-particle robot-particle-two" />
        <span className="robot-particle robot-particle-three" />
        <span className="robot-wake" />
      </div>
    </aside>
  );
}

export default memo(Robot);
