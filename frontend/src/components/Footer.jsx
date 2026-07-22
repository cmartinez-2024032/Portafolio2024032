import { FiGithub, FiMail, FiDownload } from "react-icons/fi";

export default function Footer({ data }) {
  if (!data) return null;

  return (
    <footer className="site-footer site-footer-cinema">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="nav-monogram">CM</span>
          <p className="footer-phrase">{data.phrase}</p>
          <p>&copy; {new Date().getFullYear()} Cristopher Martínez. Todos los derechos reservados.</p>
        </div>
        <div className="footer-links">
          {data.github && (
            <a href={data.github} target="_blank" rel="noopener noreferrer">
              <FiGithub size={13} />
              GitHub
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`}>
              <FiMail size={13} />
              Email
            </a>
          )}
          <a href="/cv/Cristopher-Martinez-CV.pdf" download>
            <FiDownload size={13} />
            CV
          </a>
        </div>
      </div>
    </footer>
  );
}
