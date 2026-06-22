import { useRouter } from "next/router";
import { Train, Clock, ArrowRight, AlertTriangle, Users, MapPin } from "lucide-react";

export default function ScheduleCard({ schedule }) {
  const router = useRouter();

  // Map DB field names to component props (support both API and hardcoded data)
  const s = {
    id: schedule.id,
    name: schedule.name ?? schedule.nama,
    from: schedule.from ?? schedule.asal,
    fromFull: schedule.fromFull ?? schedule.asal,
    to: schedule.to ?? schedule.tujuan,
    toFull: schedule.toFull ?? schedule.tujuan,
    departure: schedule.departure ?? schedule.jam,
    arrival: schedule.arrival ?? schedule.jam,
    duration: schedule.duration ?? "-",
    className: schedule.className ?? schedule.kelas,
    price: schedule.price ?? schedule.harga,
    status: schedule.status,
    seatsAvailable: schedule.seatsAvailable ?? schedule.kursi_tersedia,
    date: schedule.date ?? schedule.tanggal,
  };

  const isCancelled = s.status === "Dibatalkan";
  const isDelay = s.status === "Delay";
  const isAlmostFull = s.seatsAvailable !== undefined && s.seatsAvailable !== null && s.seatsAvailable <= 5 && s.seatsAvailable > 0;
  const hasArrivalTime = s.arrival && s.arrival !== s.departure;

  const handlePilih = () => {
    if (isCancelled) return;
    const params = new URLSearchParams({
      id: s.id,
      name: s.name,
      from: s.from,
      fromFull: s.fromFull,
      to: s.to,
      toFull: s.toFull,
      departure: s.departure,
      arrival: s.arrival,
      duration: s.duration,
      className: s.className,
      price: s.price,
    });
    router.push(`/pemesanan?${params.toString()}`);
  };

  return (
    <div className={`modern-result-card ${isCancelled ? "opacity-75" : ""}`}>
      {/* Timeline Row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center min-w-[60px]">
          <div className="text-xl font-bold font-display text-[#101828] leading-tight">
            {s.departure}
          </div>
          <div className="text-xs font-semibold text-[#667085]">{s.from}</div>
          <div className="text-[10px] text-[#98a2b3] font-medium">{s.fromFull}</div>
        </div>

        {/* Timeline Visual */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center w-full gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_0_3px_rgba(79,70,229,0.2)] flex-shrink-0 ${
              isCancelled ? "bg-[#98a2b3]" : isDelay ? "bg-[#d7a43a]" : "bg-[#4f46e5]"
            }`} />
            <div className="flex-1 h-0 border-t-2 border-dashed border-[#d0d5dd]" />
            {hasArrivalTime && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-[rgba(79,70,229,0.06)]">
                <Clock size={11} />
                {s.duration}
              </div>
            )}
            <div className={`flex-1 h-0 border-t-2 border-dashed border-[#d0d5dd]`} />
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_0_3px_rgba(15,39,67,0.15)] flex-shrink-0 ${
              isCancelled ? "bg-[#98a2b3]" : "bg-[#4f46e5]"
            }`} />
          </div>
          {!hasArrivalTime && (
            <div className="text-[9px] text-[#98a2b3] font-medium mt-0.5">Keberangkatan</div>
          )}
        </div>

        <div className="text-center min-w-[60px]">
          {hasArrivalTime ? (
            <>
              <div className="text-xl font-bold font-display text-[#101828] leading-tight">
                {s.arrival}
              </div>
              <div className="text-xs font-semibold text-[#667085]">{s.to}</div>
              <div className="text-[10px] text-[#98a2b3] font-medium">{s.toFull}</div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold font-display text-[#101828] leading-tight opacity-30">
                --:--
              </div>
              <div className="text-xs font-semibold text-[#667085]">{s.to}</div>
              <div className="text-[10px] text-[#98a2b3] font-medium">{s.toFull}</div>
            </>
          )}
        </div>
      </div>

      {/* Train Info & Actions */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-[rgba(79,70,229,0.06)] flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
              isCancelled 
                ? "from-[rgba(102,112,133,0.12)] to-[rgba(102,112,133,0.08)] text-[#98a2b3]"
                : "from-[rgba(79,70,229,0.12)] to-[rgba(99,102,241,0.08)] text-[#4f46e5]"
            }`}>
              <Train size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className={`font-bold text-sm ${isCancelled ? "text-[#98a2b3]" : "text-[#101828]"}`}>{s.name}</div>
                {isCancelled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef3f2] text-[#b42318] text-[10px] font-bold">
                    <AlertTriangle size={10} /> DIBATALKAN
                  </span>
                )}
                {isDelay && !isCancelled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] text-[10px] font-bold">
                    <AlertTriangle size={10} /> DELAY
                  </span>
                )}
              </div>
              <div className="text-xs text-[#667085] font-semibold">{s.className}</div>
            </div>
          </div>
        </div>

        {/* Seat Availability */}
        {s.seatsAvailable !== undefined && s.seatsAvailable !== null && !isCancelled && (
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${
            isAlmostFull ? "text-[#d74c3c]" : "text-[#1f9d63]"
          }`}>
            <Users size={13} />
            {isAlmostFull ? `Sisa ${s.seatsAvailable}` : `${s.seatsAvailable} kursi`}
          </div>
        )}

        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-bold font-display ${isCancelled ? "text-[#98a2b3]" : "text-[#4f46e5]"}`}>
            Rp {Number(s.price).toLocaleString("id-ID")}
          </div>
        </div>

        {isCancelled ? (
          <span className="h-11 px-5 rounded-xl bg-[#f4f5f7] text-[#98a2b3] text-xs font-bold border border-[rgba(102,112,133,0.14)] cursor-not-allowed inline-flex items-center gap-1.5 whitespace-nowrap">
            <AlertTriangle size={14} /> Tidak Tersedia
          </span>
        ) : (
          <button
            onClick={handlePilih}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white text-xs font-bold shadow-[0_10px_18px_rgba(79,70,229,0.25)] hover:from-[#4338ca] hover:to-[#4f46e5] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap"
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
