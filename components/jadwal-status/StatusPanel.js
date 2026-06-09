import { Train, Clock, AlertTriangle, ListChecks, ArrowRight } from "lucide-react";

const TRAIN_STATUSES = [
  { id: 1, name: "Airlangga", status: "On Time" },
  { id: 2, name: "Argo Bromo Anggrek", status: "Dibatalkan" },
  { id: 3, name: "Logawa", status: "On Time" },
  { id: 4, name: "Mutiara Selatan", status: "Delay" },
  { id: 5, name: "Taksaka", status: "On Time" },
  { id: 6, name: "Bima", status: "On Time" },
];

const statCards = [
  {
    label: "On Time",
    value: "3",
    sub: "Perjalanan tepat waktu",
    bg: "bg-gradient-to-br from-[#e4f8ee] to-[#f2fcf7]",
    text: "text-green",
    icon: Clock,
  },
  {
    label: "Delay / Batal",
    value: "1/3",
    sub: "Perlu perhatian penumpang",
    bg: "bg-gradient-to-br from-[#ffeeec] to-[#fff7f6]",
    text: "text-red",
    icon: AlertTriangle,
  },
  {
    label: "Total Kereta",
    value: "7",
    sub: "Semua kereta terdaftar",
    bg: "bg-gradient-to-br from-navy to-[#173b64]",
    text: "text-white",
    icon: ListChecks,
  },
];

function getStatusStyle(status) {
  switch (status) {
    case "On Time":
      return {
        badge: "bg-[#e4f8ee] text-green border border-[rgba(31,157,99,0.14)]",
        dot: "bg-green",
      };
    case "Delay":
      return {
        badge: "bg-[#ffeeec] text-red border border-[rgba(215,76,60,0.14)]",
        dot: "bg-red",
      };
    case "Dibatalkan":
      return {
        badge: "bg-[#f4f5f7] text-[#475467] border border-[rgba(102,112,133,0.14)]",
        dot: "bg-[#98a2b3]",
      };
    default:
      return {
        badge: "bg-[rgba(15,39,67,0.08)] text-navy border border-[rgba(15,39,67,0.12)]",
        dot: "bg-navy",
      };
  }
}

export default function StatusPanel() {
  return (
    <div className="flex flex-col gap-5">
      {/* Mini Stats Cards */}
      <div className="grid grid-cols-1 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isNavy = stat.label === "Total Kereta";
          return (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_16px_rgba(15,39,67,0.06)] border border-[rgba(186,151,113,0.12)]`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isNavy ? "bg-white/15 text-white" : "bg-white/80 text-navy"
                }`}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xl font-bold font-display ${isNavy ? "text-white" : "text-[#101828]"}`}>
                  {stat.value}
                </div>
                <div className={`text-xs font-semibold ${isNavy ? "text-white/70" : "text-[#667085]"}`}>
                  {stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Train Cards */}
      <div className="grid grid-cols-2 gap-3">
        {TRAIN_STATUSES.map((train) => {
          const style = getStatusStyle(train.status);
          return (
            <div
              key={train.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-3 border border-[rgba(186,151,113,0.12)] shadow-[0_8px_16px_rgba(15,39,67,0.06)] hover:shadow-[0_12px_24px_rgba(15,39,67,0.10)] transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Train Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(243,112,33,0.12)] to-[rgba(15,39,67,0.08)] flex items-center justify-center text-navy">
                <Train size={28} />
              </div>

              {/* Train Name */}
              <div className="text-center min-w-0 w-full">
                <div className="text-sm font-bold text-[#101828] truncate">
                  {train.name}
                </div>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${style.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {train.status}
              </span>

              {/* Action Button */}
              <button className="w-full mt-1 py-2.5 px-3 rounded-xl bg-navy text-white text-xs font-bold hover:bg-[#173b64] transition-all duration-200 flex items-center justify-center gap-1.5">
                Lihat Detail Timeline
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
