import { FiGitCommit, FiGitPullRequest, FiUploadCloud } from "react-icons/fi";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import "./workflow-bento.css";

const FEED_ICONS = [FiGitCommit, FiGitPullRequest, FiUploadCloud];

const CODE_LINES = [
  [["k", "router"], ["p", ".post("], ["s", '"/auth/login"'], ["p", ", validate(loginSchema),"]],
  [["k", "  async"], ["p", " (req, res) => {"]],
  [["k", "    const"], ["p", " user = "], ["k", "await"], ["p", " Users.verify(req.body);"]],
  [["k", "    const"], ["p", " token = signJwt({ id: user.id });"]],
  [["p", "    res.status("], ["n", "200"], ["p", ").json({ ok: "], ["n", "true"], ["p", ", token });"]],
  [["p", "  });"]],
];

export default function WorkflowBento() {
  const { t } = useLanguage();
  const w = t.workflow;

  return (
    <section id="workflow" className="section-wrap workflow-section">
      <ScrollReveal>
        <p className="section-comment">{w.comment}</p>
        <h2 className="section-title">
          {w.title}
          <span className="text-accent">.</span>
        </h2>
        <p className="section-title-serif">{w.serif}</p>
      </ScrollReveal>

      <div className="wf-bento">
        <ScrollReveal className="wf-tile wf-tile-wide" delay={0.04}>
          <div className="wf-copy">
            <h3>{w.feedTitle}</h3>
            <p>{w.feedBody}</p>
          </div>
          <ul className="wf-feed">
            {w.feed.map((item, i) => {
              const Icon = FEED_ICONS[i] || FiGitCommit;
              return (
                <li key={item.label} style={{ "--i": i }}>
                  <span className="wf-feed-icon">
                    <Icon size={15} />
                  </span>
                  <span className="wf-feed-text">
                    <strong>{item.label}</strong>
                    <small>
                      {item.source} · {item.time}
                    </small>
                  </span>
                  <span className="wf-feed-ok" aria-hidden="true" />
                </li>
              );
            })}
          </ul>
        </ScrollReveal>

        <ScrollReveal className="wf-tile" delay={0.1}>
          <div className="wf-copy">
            <h3>{w.teamTitle}</h3>
            <p>{w.teamBody}</p>
          </div>
          <div className="wf-chat">
            {w.chat.map((msg, i) => (
              <div key={msg.text} className={`wf-bubble ${i % 2 ? "is-me" : ""}`}>
                <span>{msg.text}</span>
                <small>{msg.who}</small>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="wf-tile" delay={0.06}>
          <div className="wf-copy">
            <h3>{w.apiTitle}</h3>
            <p>{w.apiBody}</p>
          </div>
          <div className="wf-code" aria-hidden="true">
            <div className="wf-code-bar">
              <i />
              <i />
              <i />
              <span>auth.routes.js</span>
            </div>
            <pre>
              {CODE_LINES.map((line, i) => (
                <code key={i}>
                  {line.map(([kind, text], j) => (
                    <span key={j} className={`tk-${kind}`}>
                      {text}
                    </span>
                  ))}
                </code>
              ))}
            </pre>
          </div>
        </ScrollReveal>

        <ScrollReveal className="wf-tile wf-tile-wide" delay={0.12}>
          <div className="wf-copy">
            <h3>{w.qualityTitle}</h3>
            <p>{w.qualityBody}</p>
          </div>
          <div className="wf-pills">
            {w.qualityRows.map((row, r) => (
              <div key={r} className={`wf-pill-row ${r % 2 ? "is-reverse" : ""}`}>
                <div className="wf-pill-track">
                  {[...row, ...row].map((label, i) => (
                    <span key={i} className="wf-pill" aria-hidden={i >= row.length}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
