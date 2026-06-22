import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { getStatusClass } from "../lib/train-utils";

const STYLES = {
  "on-time": {
    bg: "bg-[#e4f8ee] border-[rgba(31,157,99,0.14)] text-[#067647]",
    dot: "bg-[#1f9d63]",
    Icon: CheckCircle,
  },
  delay: {
    bg: "bg-[#fffaeb] border-[rgba(215,164,58,0.18)] text-[#b54708]",
    dot: "bg-[#d7a43a]",
    Icon: AlertTriangle,
  },
  dibatalkan: {
    bg: "bg-[#fef3f2] border-[rgba(215,76,60,0.14)] text-[#b42318]",
    dot: "bg-[#d74c3c]",
    Icon: XCircle,
  },
  unknown: {
    bg: "bg-[#f2f4f7] border-[rgba(15,39,67,0.10)] text-[#475467]",
    dot: "bg-[#98a2b3]",
    Icon: HelpCircle,
  },
};

export default function StatusBadge({ status }) {
  const key = getStatusClass(status);
  const style = STYLES[key] || STYLES.unknown;
  const Icon = style.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg}`}>
      <Icon size={14} />
      {status || "-"}
    </span>
  );
}
