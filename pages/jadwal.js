import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Search, MapPin, Users, Calendar, Train, Clock, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import ScheduleCard from "../components/jadwal/ScheduleCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

const SCHEDULE_DATA = [
  { id: 1, name: "Argo Bromo Anggrek", from: "GMR", fromFull: "Gambir", to: "SBY", toFull: "Surabaya Pasar Turi", departure: "08:30", arrival: "14:45", duration: "6j 15m", className: "Eksekutif", price: 350000, status: "On Time", seatsAvailable: 12 },
  { id: 2, name: "Bima", from: "GMR", fromFull: "Gambir", to: "SLO", toFull: "Solo Balapan", departure: "09:15", arrival: "13:40", duration: "4j 25m", className: "Bisnis / Eksekutif", price: 160000, status: "On Time", seatsAvailable: 24 },
  { id: 3, name: "Taksaka", from: "GMR", fromFull: "Gambir", to: "YK", toFull: "Yogyakarta", departure: "19:30", arrival: "23:45", duration: "4j 15m", className: "Eksekutif", price: 180000, status: "Delay", seatsAvailable: 8 },
  { id: 4, name: "Logawa", from: "PWT", fromFull: "Purwokerto", to: "YK", toFull: "Yogyakarta", departure: "06:45", arrival: "11:30", duration: "4j 45m", className: "Ekonomi", price: 45000, status: "On Time", seatsAvailable: 36 },
  { id: 5, name: "Mutiara Selatan", from: "BDG", fromFull: "Bandung", to: "ML", toFull: "Malang", departure: "15:20", arrival: "22:10", duration: "6j 50m", className: "Bisnis / Eksekutif", price: 220000, status: "On Time", seatsAvailable: 5 },
  { id: 6, name: "Airlangga", from: "BWI", fromFull: "Banyuwangi", to: "JR", toFull: "Jember", departure: "12:00", arrival: "14:15", duration: "2j 15m", className: "Ekonomi / Bisnis", price: 50000, status: "Dibatalkan", seatsAvailable: 0 },
  { id: 7, name: "Sembrani", from: "GMR", fromFull: "Gambir", to: "SBY", toFull: "Surabaya Pasar Turi", departure: "20:00", arrival: "06:30", duration: "10j 30m", className: "Eksekutif", price: 420000, status: "On Time", seatsAvailable: 18 },
  { id: 8, name: "Gajayana", from: "GMR", fromFull: "Gambir", to: "ML", toFull: "Malang", departure: "10:00", arrival: "19:15", duration: "9j 15m", className: "Bisnis / Eksekutif", price: 300000, status: "Delay", seatsAvailable: 3 },
];

export default function JadwalPage() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Filter schedules berdasarkan input pencarian
  const filteredSchedule = SCHEDULE_DATA.filter((schedule) => {
    const matchFrom = !searchFrom || 
      schedule.fromFull.toLowerCase().includes(searchFrom.toLowerCase()) ||
      schedule.from.toLowerCase().includes(searchFrom.toLowerCase());
    const matchTo = !searchTo || 
      schedule.toFull.toLowerCase().includes(searchTo.toLowerCase()) ||
      schedule.to.toLowerCase().includes(searchTo.toLowerCase());
    const matchClass = !filterClass || filterClass === "all" || 
      schedule.className.toLowerCase().includes(filterClass.toLowerCase());
    return matchFrom && matchTo && matchClass;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!searchFrom.trim()) {
      setValidationError("Silakan pilih stasiun asal.");
      return;
    }
    if (!searchTo.trim()) {
      setValidationError("Silakan pilih stasiun tujuan.");
      return;
    }
    if (searchFrom.trim().toLowerCase() === searchTo.trim().toLowerCase()) {
      setValidationError("Stasiun asal dan tujuan tidak boleh sama.");
      return;
    }

    setLoading(true);
    // Simulasi loading
    setTimeout(() => {
      setLoading(false);
      setShowSearch(false);
    }, 600);
  };

  return (
    <PublicLayout title="Jadwal Kereta">
      <div className="max-w-[1000px] mx-auto">
        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2743] to-[#173b64] p-6 md:p-8 mb-6 shadow-lg border border-[rgba(255,255,255,0.06)]">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(243,112,33,0.6) 0%, transparent 70%)" }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-bold">
                <Calendar size={12} />
                Jadwal & Harga Tiket
              </span>
            </div>
            <h1 className="text-white font-bold font-display text-2xl md:text-3xl mb-2">Jadwal Kereta</h1>
            <p className="text-white/60 text-sm max-w-[520px]">
              Cari dan bandingkan jadwal kereta dari berbagai rute. Pilih perjalanan yang sesuai dengan kebutuhan Anda.
            </p>
          </div>
        </div>

        {/* ── Search Form ── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 md:p-6 border border-[rgba(186,151,113,0.12)] shadow-md mb-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 mb-3">
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                <input
                  type="text"
                  placeholder="Stasiun asal"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => { setSearchFrom(searchTo); setSearchTo(searchFrom); }}
                className="w-11 h-11 rounded-xl bg-[#fff0e2] border border-[rgba(243,112,33,0.20)] flex items-center justify-center text-[#f37021] hover:bg-[#f37021] hover:text-white transition-all duration-200 flex-shrink-0 self-end mb-0.5"
              >
                <ArrowLeftRight size={18} />
              </button>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                <input
                  type="text"
                  placeholder="Stasiun tujuan"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  min={today}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all appearance-none cursor-pointer"
                >
                  <option value="">Semua Kelas</option>
                  <option value="Ekonomi">Ekonomi</option>
                  <option value="Bisnis">Bisnis</option>
                  <option value="Eksekutif">Eksekutif</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-sm font-bold shadow-[0_10px_18px_rgba(243,112,33,0.22)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Mencari...</>
                ) : (
                  <><Search size={16} /> Cari Jadwal</>
                )}
              </button>
            </div>
          </form>

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-[#ffeeec] border border-[rgba(215,76,60,0.16)] text-[#b42318] text-sm font-semibold">
              <AlertTriangle size={16} />
              {validationError}
            </div>
          )}
        </div>

        {/* ── Results Info ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold font-display text-[#101828]">
            {filteredSchedule.length} Jadwal Ditemukan
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#667085]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1f9d63]" />
              Tepat Waktu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d7a43a]" />
              Terlambat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#98a2b3]" />
              Dibatalkan
            </span>
          </div>
        </div>

        {/* ── Loading State ── */}
        {loading && <LoadingState title="Mencari jadwal..." description="Memuat data perjalanan yang tersedia." />}

        {/* ── Empty State ── */}
        {!loading && filteredSchedule.length === 0 && (
          <EmptyState
            title="Jadwal Tidak Ditemukan"
            description={
              searchFrom || searchTo || filterClass
                ? `Tidak ada jadwal kereta yang cocok dengan rute atau filter yang Anda pilih. Coba ubah stasiun atau kelas.`
                : "Tidak ada jadwal kereta yang tersedia saat ini."
            }
            action={
              <button
                onClick={() => { setSearchFrom(""); setSearchTo(""); setSearchDate(""); setFilterClass(""); }}
                className="btn btn-primary"
              >
                Reset Pencarian
              </button>
            }
          />
        )}

        {/* ── Schedule Cards ── */}
        {!loading && filteredSchedule.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredSchedule.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
