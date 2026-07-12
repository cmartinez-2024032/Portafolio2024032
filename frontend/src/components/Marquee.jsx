export default function Marquee({ items = [], className = "" }) {
  if (!items || items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className={`marquee-wrap ${className}`}>
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">{item}</span>
        ))}
      </div>
    </div>
  );
}
