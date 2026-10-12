import "./design-fx.css";

function Row({ chars, className }) {
  return (
    <span className={className} aria-hidden="true">
      {chars.map((c, i) => (
        <span key={i} style={{ "--i": i }}>
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </span>
  );
}

/** Characters roll up one by one when the parent `.roll-host` is hovered. */
export default function RollText({ text }) {
  const chars = [...text];
  return (
    <span className="roll-text">
      <span className="sr-only">{text}</span>
      <Row chars={chars} className="roll-text-row" />
      <Row chars={chars} className="roll-text-row roll-text-alt" />
    </span>
  );
}
