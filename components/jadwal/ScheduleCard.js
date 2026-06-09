import { useRouter } from "next/router";
import { Train, Clock, ArrowRight } from "lucide-react";

export default function ScheduleCard({ schedule }) {
  const router = useRouter();

  const handlePilih = () => {
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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-[rgba(186,151,113,0.12)] shadow-[0_8px_16px_rgba(15,39,67,0.06)] hover:shadow-[0_12px_24px_rgba(15,39,67,0.10)] transition-all duration-200 hover:-translate-y-0.5">
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
            <div className="w-2.5 h-2.5 rounded-full bg-[#f37021] shadow-[0_0_0_3px_rgba(243,112,33,0.2)] flex-shrink-0" />
            <div className="flex-1 h-0 border-t-2 border-dashed border-[#d0d5dd]" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-[rgba(15,39,67,0.06)]">
              <Clock size={11} />
              {schedule.duration}
            </div>
            <div className="flex-1 h-0 border-t-2 border-dashed border-[#d0d5dd]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0f2743] shadow-[0_0_0_3px_rgba(15,39,67,0.15)] flex-shrink-0" />
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
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-[rgba(15,39,67,0.06)]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[rgba(243,112,33,0.12)] to-[rgba(15,39,67,0.08)] flex items-center justify-center text-navy flex-shrink-0">
              <Train size={16} />
            </div>
            <div>
              <div className="font-bold text-sm text-[#101828]">{schedule.name}</div>
              <div className="text-xs text-[#667085] font-semibold">{schedule.className}</div>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold font-display text-[#c6520f]">
            Rp {Number(schedule.price).toLocaleString("id-ID")}
          </div>
        </div>

        <button
          onClick={handlePilih}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-xs font-bold shadow-[0_10px_18px_rgba(243,112,33,0.25)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap"
        >
          PILIH KERETA & PESAN
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
