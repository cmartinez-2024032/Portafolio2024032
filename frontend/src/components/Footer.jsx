import { FiGithub, FiLinkedin, FiMail, FiDownload } from "react-icons/fi";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer({ data }) {
  const { t, locale } = useLanguage();
  if (!data) return null;

  const phrase = locale === "en" ? t.personalFallback.phrase : data.phrase;

  return (
    <footer className="site-footer site-footer-cinema">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="nav-monogram">CM</span>
          <p className="footer-phrase">{phrase}</p>
          <p>
            &copy; {new Date().getFullYear()} Cristopher Martínez. {t.footer.rights}
          </p>
        </div>
        <div className="footer-links">
          {data.github && (
            <a href={data.github} target="_blank" rel="noopener noreferrer">
              <FiGithub size={13} />
              GitHub
            </a>
          )}
          {data.linkedin && (
            <a href={data.linkedin} target="_blank" rel="noopener noreferrer">
              <FiLinkedin size={13} />
              LinkedIn
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
