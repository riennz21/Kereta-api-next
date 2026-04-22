export default function MetricGrid({ items, className = "" }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className={`metrics-grid ${className}`.trim()}>
      {items.map((item) => (
        <article key={item.label} className={`stat-card ${item.tone ? `tone-${item.tone}` : ""}`.trim()}>
          <span className="stat-label">{item.label}</span>
          <strong className="stat-number">{item.value}</strong>
          {item.helper ? <p className="stat-helper">{item.helper}</p> : null}
        </article>
      ))}
    </div>
  );
}
