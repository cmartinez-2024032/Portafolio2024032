import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import "./glass-fan-cards.css";

/**
 * Uiverse-style fanned glass cards — elegant social / contact links.
 */
export default function GlassFanCards({ items = [] }) {
  if (!items.length) return null;

  const rotations = [-15, 5, 25];

  return (
    <div className="glass-fan" aria-label="Enlaces de contacto">
      <div className="glass-fan-container">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <a
              key={item.title}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="glass-fan-card"
              data-text={item.title}
              style={{ "--r": rotations[i] ?? (i - 1) * 15 }}
              aria-label={item.title}
            >
              <span className="glass-fan-icon" aria-hidden="true">
                {Icon ? <Icon /> : null}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function buildContactFanItems(data) {
  if (!data) return [];
  return [
    data.github && {
      href: data.github,
      icon: FiGithub,
      title: "GitHub",
      external: true,
    },
    data.linkedin && {
      href: data.linkedin,
      icon: FiLinkedin,
      title: "LinkedIn",
      external: true,
    },
    data.email && {
      href: `mailto:${data.email}`,
      icon: FiMail,
      title: "Email",
      external: false,
    },
  ].filter(Boolean);
}
