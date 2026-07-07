import { Loader2 } from "lucide-react";

export default function LoadingState({ 
  title = "Memuat data...", 
  description = "Harap tunggu sebentar.",
  fullPage = false 
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? "min-h-[60vh]" : "py-16"}`}>
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Loader2 size={28} className="text-indigo-600 animate-spin" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-transparent border-t-indigo-500 border-r-indigo-500/30 animate-spin" style={{ animationDuration: "1.5s" }} />
      </div>
      <div className="text-center">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-[28ch]">{description}</p>
        )}
      </div>
    </div>
  );
}
