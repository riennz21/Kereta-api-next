import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeftRight, Search, MapPin, Calendar, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import ScheduleCard from "../components/jadwal/ScheduleCard";
import EmptyState from "../components/ui/EmptyState";

export default function JadwalPage() {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState([]);
  const [total, setTotal] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const fetchTrains = useCallback(async (from, to, date, kelas) => {
    setLoading(true);
    setValidationError("");

    try {
      const params = new URLSearchParams();
      if (from) params.set("asal", from);
      if (to) params.set("tujuan", to);
      if (date) params.set("tanggal", date);
      if (kelas) params.set("kelas", kelas);
      params.set("perPage", "50");

      const res = await fetch(`/api/trains?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();

      setTrains(data.rows || []);
      setTotal(data.total || 0);
    } catch {
      setTrains([]);
      setTotal(0);
      setValidationError("Gagal memuat data dari server. Coba lagi.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchTrains("", "", "", "");
  }, [fetchTrains]);

  const handleSearch = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!searchFrom.trim()) {
      setValidationError("Silakan isi stasiun asal.");
      return;
    }
    if (!searchTo.trim()) {
      setValidationError("Silakan isi stasiun tujuan.");
      return;
    }
    if (searchFrom.trim().toLowerCase() === searchTo.trim().toLowerCase()) {
      setValidationError("Stasiun asal dan tujuan tidak boleh sama.");
      return;
    }

    fetchTrains(searchFrom.trim(), searchTo.trim(), searchDate, filterClass);
  };

  return (
    <PublicLayout title="Jadwal Kereta">
      {/* Hero Header */}
      <section className="modern-hero">
        <div className="modern-hero-content">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/80 px-3 py-1 text-[11px] font-bold backdrop-blur">
              <Sparkles size={12} />
              Jadwal & Harga Tiket
            </span>
          </div>
          <h1>Cari Jadwal Kereta</h1>
          <p>Cari dan bandingkan jadwal kereta dari berbagai rute. Pilih perjalanan yang sesuai dengan kebutuhan Anda.</p>
        </div>
      </section>

      {/* Search Form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 mb-3">
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Stasiun asal"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="w-full h-[46px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => { setSearchFrom(searchTo); setSearchTo(searchFrom); }}
              className="swap-btn"
              style={{ marginBottom: 0, width: 44, height: 44 }}
            >
              <ArrowLeftRight size={18} />
            </button>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Stasiun tujuan"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="w-full h-[46px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                min={today}
                className="w-full h-[46px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364758b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: 40,
                }}
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
              className="h-[46px] px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-bold shadow-[0_10px_18px_rgba(79,70,229,0.22)] hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Mencari...</>
              ) : (
                <><Search size={16} /> Cari Jadwal</>
              )}
            </button>
          </div>
        </form>

        {validationError && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            <AlertTriangle size={16} />
            {validationError}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold font-display text-slate-900">
          {loading ? "Memuat data..." : `${total} Jadwal Ditemukan`}
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tepat Waktu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Terlambat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Dibatalkan
          </span>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat jadwal kereta...</p>
        </div>
      )}

      {!loading && initialLoad && trains.length === 0 && (
        <EmptyState
          title="Memuat Data..."
          description="Silakan tunggu sebentar atau coba refresh halaman."
        />
      )}

      {!loading && !initialLoad && trains.length === 0 && (
        <EmptyState
          title="Jadwal Tidak Ditemukan"
          description={
            searchFrom || searchTo || filterClass
              ? `Tidak ada jadwal kereta yang cocok dengan rute atau filter yang Anda pilih.`
              : "Tidak ada jadwal kereta yang tersedia saat ini."
          }
          action={
            <button
              onClick={() => { setSearchFrom(""); setSearchTo(""); setSearchDate(""); setFilterClass(""); fetchTrains("", "", "", ""); }}
              className="btn btn-primary"
            >
              Reset Pencarian
            </button>
          }
        />
      )}

      {!loading && trains.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {trains.map((train) => (
            <ScheduleCard key={train.id} schedule={train} />
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
