import { Train } from "lucide-react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Train size={28} />
      </div>
      <h2 className="empty-title">{title}</h2>
      {description ? <p className="empty-copy">{description}</p> : null}
      {action ? <div className="empty-actions">{action}</div> : null}
    </div>
  );
}
