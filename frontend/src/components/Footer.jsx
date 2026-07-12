import { FiGithub, FiLinkedin } from "react-icons/fi";

export default function Footer({ data }) {
  if (!data) return null;

  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Cristopher Martínez. Todos los derechos reservados.</p>
      <div className="footer-links">
        <a href={data.github} target="_blank" rel="noopener noreferrer">
          <FiGithub size={12} style={{ marginRight: "0.35rem" }} />
          GitHub
        </a>
        <a href={data.linkedin} target="_blank" rel="noopener noreferrer">
          <FiLinkedin size={12} style={{ marginRight: "0.35rem" }} />
          LinkedIn
        </a>
        <a href={`mailto:${data.email}`}>Email</a>
      </div>
    </footer>
  );
}
