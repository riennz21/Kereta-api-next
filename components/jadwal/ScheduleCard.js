import { useRouter } from "next/router";
import { Train, Clock, ArrowRight, AlertTriangle, Users } from "lucide-react";

export default function ScheduleCard({ schedule }) {
  const router = useRouter();
  const isCancelled = schedule.status === "Dibatalkan";
  const isDelay = schedule.status === "Delay";
  const isAlmostFull = schedule.seatsAvailable !== undefined && schedule.seatsAvailable <= 5 && schedule.seatsAvailable > 0;

  const handlePilih = () => {
    if (isCancelled) return;
    const params = new URLSearchParams({
      id: schedule.id,
      name: schedule.name,
      from: schedule.from,
      fromFull: schedule.fromFull || schedule.from,
      to: schedule.to,
      toFull: schedule.toFull || schedule.to,
      departure: schedule.departure,
      arrival: schedule.arrival,
      duration: schedule.duration,
      className: schedule.className,
      price: schedule.price,
    });
    router.push(`/pemesanan?${params.toString()}`);
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-5 border shadow-sm transition-all duration-200 ${
      isCancelled 
        ? "border-[rgba(215,76,60,0.12)] opacity-75" 
        : "border-[rgba(186,151,113,0.12)] hover:shadow-md hover:-translate-y-0.5"
    }`}>
      {/* Timeline Row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Departure */}
        <div className="text-center min-w-[60px]">
          <div className="text-xl font-bold font-display text-[#101828] leading-tight">
            {schedule.departure}
          </div>
          <div className="text-xs font-semibold text-[#667085]">{schedule.from}</div>
          <div className="text-[10px] text-[#98a2b3] font-medium">{schedule.fromFull}</div>
        </div>

        {/* Timeline */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center w-full gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_0_3px_rgba(243,112,33,0.2)] flex-shrink-0 ${
              isCancelled ? "bg-[#98a2b3]" : isDelay ? "bg-[#d7a43a]" : "bg-[#f37021]"
            }`} />
            <div className="flex-1 h-0 border-t-2 border-dashed border-[#d0d5dd]" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-[rgba(15,39,67,0.06)]">
              <Clock size={11} />
              {schedule.duration}
            </div>
            <div className="flex-1 h-0 border-t-2 border-dashed border-[#d0d5dd]" />
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_0_3px_rgba(15,39,67,0.15)] flex-shrink-0 ${
              isCancelled ? "bg-[#98a2b3]" : "bg-[#0f2743]"
            }`} />
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center min-w-[60px]">
          <div className="text-xl font-bold font-display text-[#101828] leading-tight">
            {schedule.arrival}
          </div>
          <div className="text-xs font-semibold text-[#667085]">{schedule.to}</div>
          <div className="text-[10px] text-[#98a2b3] font-medium">{schedule.toFull}</div>
        </div>
      </div>

      {/* Train Info & Actions */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-[rgba(15,39,67,0.06)] flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
              isCancelled 
                ? "from-[rgba(102,112,133,0.12)] to-[rgba(102,112,133,0.08)] text-[#98a2b3]"
                : "from-[rgba(243,112,33,0.12)] to-[rgba(15,39,67,0.08)] text-navy"
            }`}>
              <Train size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className={`font-bold text-sm ${isCancelled ? "text-[#98a2b3]" : "text-[#101828]"}`}>{schedule.name}</div>
                {isCancelled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef3f2] text-[#b42318] text-[10px] font-bold">
                    <AlertTriangle size={10} />
                    DIBATALKAN
                  </span>
                )}
                {isDelay && !isCancelled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] text-[10px] font-bold">
                    <AlertTriangle size={10} />
                    DELAY
                  </span>
                )}
              </div>
              <div className="text-xs text-[#667085] font-semibold">{schedule.className}</div>
            </div>
          </div>
        </div>

        {/* Seat Availability */}
        {schedule.seatsAvailable !== undefined && !isCancelled && (
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${
            isAlmostFull ? "text-[#d74c3c]" : "text-[#1f9d63]"
          }`}>
            <Users size={13} />
            {isAlmostFull ? `Sisa ${schedule.seatsAvailable}` : `${schedule.seatsAvailable} kursi`}
          </div>
        )}

        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-bold font-display ${isCancelled ? "text-[#98a2b3]" : "text-[#c6520f]"}`}>
            Rp {Number(schedule.price).toLocaleString("id-ID")}
          </div>
        </div>

        {isCancelled ? (
          <span className="h-11 px-5 rounded-xl bg-[#f4f5f7] text-[#98a2b3] text-xs font-bold border border-[rgba(102,112,133,0.14)] cursor-not-allowed inline-flex items-center gap-1.5 whitespace-nowrap">
            <AlertTriangle size={14} />
            Tidak Tersedia
          </span>
        ) : (
          <button
            onClick={handlePilih}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-xs font-bold shadow-[0_10px_18px_rgba(243,112,33,0.25)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap"
          >
            PILIH & PESAN
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      {/* Low Stock Warning */}
      {isAlmostFull && (
        <div className="mt-3 pt-3 border-t border-[rgba(215,76,60,0.08)]">
          <p className="text-[11px] text-[#d74c3c] font-semibold flex items-center gap-1">
            <AlertTriangle size={12} />
            Kursi tersisa sedikit! Segera pesan sebelum habis.
          </p>
        </div>
      )}
    </div>
  );
}
