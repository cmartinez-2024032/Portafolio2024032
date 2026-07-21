export default function Marquee({ items = [], className = "" }) {
  if (!items || items.length === 0) return null;

  // Repeat enough times for a seamless infinite scroll even with few items
  const base = items.length < 4 ? [...items, ...items, ...items, ...items] : items;
  const doubled = [...base, ...base];

  return (
    <div className={`marquee-wrap ${className}`}>
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-sep" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
