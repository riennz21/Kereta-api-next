import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const VARIANTS = {
  success: {
    bg: "bg-gradient-to-r from-[#e4f8ee] to-[#f2fcf7]",
    border: "border-[rgba(31,157,99,0.16)]",
    icon: CheckCircle,
    iconBg: "bg-[#1f9d63]/10",
    iconColor: "text-[#1f9d63]",
    titleColor: "text-[#067647]",
    descColor: "text-[#067647]/70",
  },
  error: {
    bg: "bg-gradient-to-r from-[#fef3f2] to-[#fff7f6]",
    border: "border-[rgba(215,76,60,0.16)]",
    icon: XCircle,
    iconBg: "bg-[#d74c3c]/10",
    iconColor: "text-[#d74c3c]",
    titleColor: "text-[#b42318]",
    descColor: "text-[#b42318]/70",
  },
  warning: {
    bg: "bg-gradient-to-r from-[#fffaeb] to-[#fffef5]",
    border: "border-[rgba(215,164,58,0.20)]",
    icon: AlertTriangle,
    iconBg: "bg-[#d7a43a]/10",
    iconColor: "text-[#d7a43a]",
    titleColor: "text-[#b54708]",
    descColor: "text-[#b54708]/70",
  },
};

export default function Notification({ 
  type = "success", 
  title, 
  description, 
  show = false, 
  onClose,
  autoClose = 5000 
}) {
  const [visible, setVisible] = useState(show);
  const config = VARIANTS[type] || VARIANTS.success;
  const Icon = config.icon;

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (!visible || !autoClose || !onClose) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, autoClose);
    return () => clearTimeout(timer);
  }, [visible, autoClose, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-[420px] w-full animate-slide-in">
      <div className={`${config.bg} rounded-2xl p-4 border ${config.border} shadow-[0_12px_24px_rgba(15,39,67,0.12)] flex items-start gap-3`}>
        <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className={config.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`text-sm font-bold ${config.titleColor}`}>{title}</div>
          )}
          {description && (
            <div className={`text-xs ${config.descColor} mt-0.5`}>{description}</div>
          )}
        </div>
        {onClose && (
          <button
            onClick={() => { setVisible(false); onClose?.(); }}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <X size={16} className="text-current opacity-50" />
          </button>
        )}
      </div>
    </div>
  );
}
