import { Loader2 } from "lucide-react";

export default function LoadingState({ 
  title = "Memuat data...", 
  description = "Harap tunggu sebentar.",
  fullPage = false 
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? "min-h-[60vh]" : "py-16"}`}>
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(243,112,33,0.12)] to-[rgba(15,39,67,0.08)] flex items-center justify-center">
          <Loader2 size={28} className="text-[#f37021] animate-spin" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-transparent border-t-[#f37021] border-r-[#f37021]/30 animate-spin" style={{ animationDuration: "1.5s" }} />
      </div>
      <div className="text-center">
        <h3 className="text-base font-bold text-[#101828]">{title}</h3>
        {description && (
          <p className="text-sm text-[#667085] mt-1 max-w-[28ch]">{description}</p>
        )}
      </div>
    </div>
  );
}
