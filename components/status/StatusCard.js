import { Train, MapPin, Clock, ArrowRight } from "lucide-react";

function getStatusConfig(status) {
  switch (status) {
    case "On Time":
      return {
        badge: "bg-[#e4f8ee] text-[#067647] border border-[rgba(31,157,99,0.18)]",
        dot: "bg-[#1f9d63]",
        glow: "shadow-[0_0_0_4px_rgba(31,157,99,0.12)]",
        label: "Tepat Waktu",
        iconBg: "bg-[rgba(31,157,99,0.10)]",
      };
    case "Delay":
      return {
        badge: "bg-[#fffaeb] text-[#b54708] border border-[rgba(215,164,58,0.20)]",
        dot: "bg-[#d7a43a]",
        glow: "shadow-[0_0_0_4px_rgba(215,164,58,0.12)]",
        label: "Terlambat",
        iconBg: "bg-[rgba(215,164,58,0.10)]",
      };
    case "Dibatalkan":
      return {
        badge: "bg-[#fef3f2] text-[#b42318] border border-[rgba(215,76,60,0.16)]",
        dot: "bg-[#d74c3c]",
        glow: "shadow-[0_0_0_4px_rgba(215,76,60,0.10)]",
        label: "Dibatalkan",
        iconBg: "bg-[rgba(215,76,60,0.10)]",
      };
    default:
      return {
        badge: "bg-[#f2f4f7] text-[#475467] border border-[rgba(15,39,67,0.10)]",
        dot: "bg-[#98a2b3]",
        glow: "",
        label: "Unknown",
        iconBg: "bg-[rgba(15,39,67,0.06)]",
      };
  }
}

export default function StatusCard({ train }) {
  const cfg = getStatusConfig(train.status);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-[rgba(186,151,113,0.12)] shadow-[0_8px_16px_rgba(15,39,67,0.06)] hover:shadow-[0_12px_24px_rgba(15,39,67,0.10)] transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-start gap-4">
        {/* Train Icon */}
        <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
          <Train size={26} className="text-[#0f2743]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <h3 className="text-base font-bold text-[#101828] truncate">
              {train.nama}
            </h3>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.glow}`} />
              {cfg.label}
            </span>
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
            {train.asal && train.tujuan && (
              <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                <MapPin size={12} className="text-[#f37021]" />
                <span className="font-semibold">{train.asal}</span>
                <ArrowRight size={10} className="text-[#98a2b3]" />
                <span className="font-semibold">{train.tujuan}</span>
              </div>
            )}
            {train.jam && (
              <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                <Clock size={12} className="text-[#0f2743]" />
                <span className="font-semibold">{train.jam}</span>
              </div>
            )}
            {train.kelas && (
              <span className="text-[11px] font-bold text-[#475467] bg-[rgba(15,39,67,0.05)] px-2 py-0.5 rounded-md">
                {train.kelas}
              </span>
            )}
          </div>

          {/* Bottom row with extra metadata */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(15,39,67,0.04)]">
            {train.tanggal && (
              <span className="text-[11px] text-[#98a2b3] font-medium">
                {train.tanggal}
              </span>
            )}
            <button className="text-[11px] font-bold text-[#c6520f] hover:text-[#f37021] transition-colors flex items-center gap-1">
              Lihat Detail
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
