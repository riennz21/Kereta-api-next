import { useState } from "react";
import {
  Train,
  ArrowLeftRight,
  Calendar,
  GraduationCap,
  Wallet,
  Search,
  Clock,
  ArrowRight,
} from "lucide-react";

const SCHEDULE_DATA = [
  {
    id: 1,
    name: "Airlangga",
    from: "BWI",
    to: "JR",
    departure: "12:00",
    arrival: "14:15",
    duration: "2j 15m",
    classes: "Ekonomi / Bisnis",
    price: 50000,
    status: "On Time",
  },
  {
    id: 2,
    name: "Argo Bromo Anggrek",
    from: "GMR",
    to: "SBY",
    departure: "08:30",
    arrival: "14:45",
    duration: "6j 15m",
    classes: "Eksekutif / Bisnis",
    price: 350000,
    status: "On Time",
  },
  {
    id: 3,
    name: "Logawa",
    from: "PWT",
    to: "YK",
    departure: "06:45",
    arrival: "11:30",
    duration: "4j 45m",
    classes: "Ekonomi",
    price: 45000,
    status: "Delay",
  },
  {
    id: 4,
    name: "Mutiara Selatan",
    from: "BDG",
    to: "ML",
    departure: "15:20",
    arrival: "22:10",
    duration: "6j 50m",
    classes: "Bisnis / Eksekutif",
    price: 220000,
    status: "On Time",
  },
  {
    id: 5,
    name: "Taksaka",
    from: "GMR",
    to: "YK",
    departure: "19:30",
    arrival: "23:45",
    duration: "4j 15m",
    classes: "Eksekutif",
    price: 180000,
    status: "On Time",
  },
  {
    id: 6,
    name: "Bima",
    from: "SLO",
    to: "SBY",
    departure: "09:15",
    arrival: "13:40",
    duration: "4j 25m",
    classes: "Bisnis / Eksekutif",
    price: 160000,
    status: "On Time",
  },
];

export default function SearchPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Filter Console */}
      <div className="bg-[#0f2743] rounded-3xl p-5 md:p-6 shadow-[0_22px_45px_rgba(15,39,67,0.15)] border border-[rgba(255,255,255,0.06)] relative overflow-hidden">
        {/* Decorative glow */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(243,112,33,0.4) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10">
          {/* Stats row */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/90 text-sm font-bold tracking-wide">
              Cari Jadwal Kereta
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-white/60">
                Total Schedule: <strong className="text-white/90">6</strong>
              </span>
              <span className="text-white/30">|</span>
              <span className="text-white/60">
                Active Trains: <strong className="text-white/90">6</strong>
              </span>
            </div>
          </div>

          {/* Input Row 1: From ↔ To */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <Train size={16} />
              </div>
              <input
                type="text"
                placeholder="Dari Stasiun Asal"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:border-[#f37021]/60 focus:bg-white/15 transition-all"
              />
            </div>

            <button className="w-11 h-11 rounded-xl bg-[#f37021]/20 border border-[#f37021]/30 flex items-center justify-center text-[#f37021] hover:bg-[#f37021]/30 hover:rotate-180 transition-all duration-300 flex-shrink-0">
              <ArrowLeftRight size={18} />
            </button>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <Train size={16} />
              </div>
              <input
                type="text"
                placeholder="Ke Stasiun Tujuan"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:border-[#f37021]/60 focus:bg-white/15 transition-all"
              />
            </div>
          </div>

          {/* Input Row 2: Date + Filters + Search */}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <Calendar size={16} />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium focus:outline-none focus:border-[#f37021]/60 focus:bg-white/15 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <GraduationCap size={16} />
              </div>
              <select className="w-full h-11 pl-9 pr-8 rounded-xl bg-white/10 border border-white/10 text-white/80 text-sm font-medium focus:outline-none focus:border-[#f37021]/60 focus:bg-white/15 transition-all appearance-none cursor-pointer">
                <option value="" className="text-gray-800">
                  Filter Kelas
                </option>
                <option value="all" className="text-gray-800">
                  Semua Kelas
                </option>
                <option value="Ekonomi" className="text-gray-800">
                  Ekonomi
                </option>
                <option value="Bisnis" className="text-gray-800">
                  Bisnis
                </option>
                <option value="Eksekutif" className="text-gray-800">
                  Eksekutif
                </option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <Wallet size={16} />
              </div>
              <select className="w-full h-11 pl-9 pr-8 rounded-xl bg-white/10 border border-white/10 text-white/80 text-sm font-medium focus:outline-none focus:border-[#f37021]/60 focus:bg-white/15 transition-all appearance-none cursor-pointer">
                <option value="" className="text-gray-800">
                  Filter Harga
                </option>
                <option value="asc" className="text-gray-800">
                  Termurah
                </option>
                <option value="desc" className="text-gray-800">
                  Termahal
                </option>
                <option value="<100000" className="text-gray-800">
                  &lt; Rp 100.000
                </option>
                <option value="100000-250000" className="text-gray-800">
                  Rp 100rb - 250rb
                </option>
                <option value=">250000" className="text-gray-800">
                  &gt; Rp 250.000
                </option>
              </select>
            </div>

            <button className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-sm font-bold shadow-[0_10px_18px_rgba(243,112,33,0.35)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
              <Search size={16} />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Result Cards */}
      <div className="grid grid-cols-1 gap-3">
        {SCHEDULE_DATA.map((schedule) => {
          const isDelay = schedule.status === "Delay";
          return (
            <div
              key={schedule.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-[rgba(186,151,113,0.12)] shadow-[0_8px_16px_rgba(15,39,67,0.06)] hover:shadow-[0_12px_24px_rgba(15,39,67,0.10)] transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Timeline */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold font-display text-[#101828]">
                    {schedule.departure}
                  </div>
                  <div className="text-xs font-semibold text-[#667085]">
                    {schedule.from}
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#f37021]" />
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-[#f37021] via-[#f37021]/60 to-[#f37021]" />
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider whitespace-nowrap">
                    <Clock size={12} />
                    {schedule.duration}
                  </div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-[#0f2743]/40 via-[#0f2743]/20 to-[#0f2743]/40" />
                  <div className="w-2 h-2 rounded-full bg-[#0f2743]" />
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold font-display text-[#101828]">
                    {schedule.arrival}
                  </div>
                  <div className="text-xs font-semibold text-[#667085]">
                    {schedule.to}
                  </div>
                </div>
              </div>

              {/* Train Info & Actions */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[rgba(243,112,33,0.12)] to-[rgba(15,39,67,0.08)] flex items-center justify-center text-navy flex-shrink-0">
                      <Train size={14} />
                    </div>
                    <div className="font-bold text-sm text-[#101828] truncate">
                      {schedule.name}
                    </div>
                    {isDelay && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeeec] text-red border border-[rgba(215,76,60,0.14)]">
                        Delay
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#667085] font-semibold mt-0.5">
                    {schedule.classes}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold font-display text-[#c6520f]">
                    Rp {schedule.price.toLocaleString("id-ID")}
                  </div>
                </div>

                <button className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-xs font-bold shadow-[0_10px_18px_rgba(243,112,33,0.25)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap">
                  PILIH KERETA & PESAN
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
