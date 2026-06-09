import { useState } from "react";
import { ArrowLeftRight, Search, MapPin, Users, Calendar } from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import ScheduleCard from "../components/jadwal/ScheduleCard";
import EmptyState from "../components/ui/EmptyState";

const SCHEDULE_DATA = [
  { id: 1, name: "Argo Bromo Anggrek", from: "GMR", fromFull: "Gambir", to: "SBY", toFull: "Surabaya Pasar Turi", departure: "08:30", arrival: "14:45", duration: "6j 15m", className: "Eksekutif", price: 350000 },
  { id: 2, name: "Bima", from: "GMR", fromFull: "Gambir", to: "SLO", toFull: "Solo Balapan", departure: "09:15", arrival: "13:40", duration: "4j 25m", className: "Bisnis / Eksekutif", price: 160000 },
  { id: 3, name: "Taksaka", from: "GMR", fromFull: "Gambir", to: "YK", toFull: "Yogyakarta", departure: "19:30", arrival: "23:45", duration: "4j 15m", className: "Eksekutif", price: 180000 },
  { id: 4, name: "Logawa", from: "PWT", fromFull: "Purwokerto", to: "YK", toFull: "Yogyakarta", departure: "06:45", arrival: "11:30", duration: "4j 45m", className: "Ekonomi", price: 45000 },
  { id: 5, name: "Mutiara Selatan", from: "BDG", fromFull: "Bandung", to: "ML", toFull: "Malang", departure: "15:20", arrival: "22:10", duration: "6j 50m", className: "Bisnis / Eksekutif", price: 220000 },
  { id: 6, name: "Airlangga", from: "BWI", fromFull: "Banyuwangi", to: "JR", toFull: "Jember", departure: "12:00", arrival: "14:15", duration: "2j 15m", className: "Ekonomi / Bisnis", price: 50000 },
  { id: 7, name: "Sembrani", from: "GMR", fromFull: "Gambir", to: "SBY", toFull: "Surabaya Pasar Turi", departure: "20:00", arrival: "06:30", duration: "10j 30m", className: "Eksekutif", price: 420000 },
  { id: 8, name: "Gajayana", from: "GMR", fromFull: "Gambir", to: "ML", toFull: "Malang", departure: "10:00", arrival: "19:15", duration: "9j 15m", className: "Bisnis / Eksekutif", price: 300000 },
];

export default function JadwalPage() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <PublicLayout title="Jadwal Kereta">
      <div className="max-w-[1000px] mx-auto">
        {/* ── Top Bar Route Info ── */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 mb-6 border border-[rgba(186,151,113,0.12)] shadow-[0_8px_16px_rgba(15,39,67,0.06)] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold text-[#101828]">
              <MapPin size={16} className="text-[#f37021]" />
              <span>Banyuwangi Kota</span>
            </div>
            <ArrowLeftRight size={16} className="text-[#667085] flex-shrink-0" />
            <div className="flex items-center gap-2 text-sm font-bold text-[#101828]">
              <MapPin size={16} className="text-[#0f2743]" />
              <span>Jember</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[rgba(15,39,67,0.08)]">
              <Calendar size={14} className="text-[#667085]" />
              <span className="text-xs font-semibold text-[#667085]">Selasa, 9 Juni 2026</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[rgba(15,39,67,0.08)]">
              <Users size={14} className="text-[#667085]" />
              <span className="text-xs font-semibold text-[#667085]">1 Penumpang</span>
            </div>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="h-9 px-4 rounded-xl border border-[rgba(243,112,33,0.28)] bg-[#fff0e2]/70 text-[#c6520f] text-xs font-bold hover:bg-[#ffdcc0] transition-all flex items-center gap-2"
          >
            <Search size={14} />
            Ubah Pencarian
          </button>
        </div>

        {/* ── Search Panel (Expandable) ── */}
        {showSearch && (
          <div className="bg-[#0f2743] rounded-2xl p-5 mb-6 border border-[rgba(255,255,255,0.06)] shadow-[0_22px_45px_rgba(15,39,67,0.15)] relative overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(243,112,33,0.4) 0%, transparent 70%)" }}
            />
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">Dari</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                  <input type="text" defaultValue="Banyuwangi" className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium placeholder-white/40 focus:outline-none focus:border-[#f37021]/60 focus:bg-white/15 transition-all" />
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-[#f37021]/20 border border-[#f37021]/30 flex items-center justify-center text-[#f37021] hover:bg-[#f37021]/30 transition-all flex-shrink-0">
                <ArrowLeftRight size={16} />
              </button>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">Ke</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                  <input type="text" defaultValue="Jember" className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium placeholder-white/40 focus:outline-none focus:border-[#f37021]/60 focus:bg-white/15 transition-all" />
                </div>
              </div>
              <button className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-sm font-bold shadow-[0_10px_18px_rgba(243,112,33,0.35)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
                <Search size={16} />
                Cari
              </button>
            </div>
          </div>
        )}

        {/* ── Results Count ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#101828] font-display">
            {SCHEDULE_DATA.length} Jadwal Ditemukan
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1f9d63]" />
              Tersedia
            </span>
          </div>
        </div>

        {/* ── Schedule Cards Grid ── */}
        {SCHEDULE_DATA.length ? (
          <div className="grid grid-cols-1 gap-4">
            {SCHEDULE_DATA.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Jadwal tidak ditemukan"
            description="Tidak ada jadwal kereta yang sesuai dengan pencarian Anda. Coba ubah rute atau tanggal."
          />
        )}
      </div>
    </PublicLayout>
  );
}
