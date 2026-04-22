import { getStatusClass } from "../lib/train-utils";

export default function StatusBadge({ status }) {
  return <span className={`badge badge-status ${getStatusClass(status)}`}>{status || "-"}</span>;
}
