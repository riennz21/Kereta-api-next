export default function PageHeader({ eyebrow, title, description, actions, meta, compact = false }) {
  return (
    <section className={`page-header ${compact ? "compact" : ""}`}>
      <div className="page-header-copy">
        {eyebrow ? <span className="page-kicker">{eyebrow}</span> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
        {meta?.length ? (
          <div className="page-meta">
            {meta.map((item) => (
              <span key={item} className="page-meta-pill">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {actions ? <div className="page-actions">{actions}</div> : null}
    </section>
  );
}
