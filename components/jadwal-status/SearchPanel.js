import { useState, useEffect, useCallback } from "react";
import {
  Train,
  ArrowLeftRight,
  Calendar,
  GraduationCap,
  Wallet,
  Search,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function SearchPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [kelasFilter, setKelasFilter] = useState("");
  const [hargaFilter, setHargaFilter] = useState("");
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrains = useCallback(async (asal, tujuan, tanggal, kelas) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (asal) params.set("asal", asal);
      if (tujuan) params.set("tujuan", tujuan);
      if (tanggal) params.set("tanggal", tanggal);
      if (kelas) params.set("kelas", kelas);
      params.set("perPage", "50");

      const res = await fetch(`/api/trains?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();

      let rows = data.rows || [];

      // Client-side price filter
      if (hargaFilter) {
        rows = rows.filter((t) => {
          const price = Number(t.harga) || 0;
          if (hargaFilter === "asc") return true; // will be sorted
          if (hargaFilter === "desc") return true; // will be sorted
          if (hargaFilter === "<100000") return price < 100000;
          if (hargaFilter === "100000-250000") return price >= 100000 && price <= 250000;
          if (hargaFilter === ">250000") return price > 250000;
          return true;
        });

        // Sort by price
        if (hargaFilter === "asc") rows.sort((a, b) => (Number(a.harga) || 0) - (Number(b.harga) || 0));
        if (hargaFilter === "desc") rows.sort((a, b) => (Number(b.harga) || 0) - (Number(a.harga) || 0));
      }

      setTrains(rows);
    } catch {
      setTrains([]);
    } finally {
      setLoading(false);
    }
  }, [hargaFilter]);

  // Load initial data
  useEffect(() => {
    fetchTrains("", "", "", "");
  }, [fetchTrains]);

  const handleSearch = () => {
    fetchTrains(from, to, date, kelasFilter);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "On Time":
        return "bg-[#e4f8ee] text-[#067647] border border-[rgba(31,157,99,0.14)]";
      case "Delay":
        return "bg-[#ffeeec] text-[#b42318] border border-[rgba(215,76,60,0.14)]";
      case "Dibatalkan":
        return "bg-[#f4f5f7] text-[#475467] border border-[rgba(102,112,133,0.14)]";
      default:
        return "bg-[rgba(15,39,67,0.08)] text-navy border border-[rgba(15,39,67,0.12)]";
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Filter Console */}
      <div className="bg-[#0f172a] rounded-3xl p-5 md:p-6 shadow-[0_22px_45px_rgba(15,23,42,0.15)] border border-[rgba(255,255,255,0.06)] relative overflow-hidden">
        {/* Decorative glow */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(79,70,229,0.4) 0%, transparent 70%)",
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
                Total Schedule: <strong className="text-white/90">{trains.length}</strong>
              </span>
              <span className="text-white/30">|</span>
              <span className="text-white/60">
                Active Trains: <strong className="text-white/90">{trains.filter((t) => t.status === "On Time").length}</strong>
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
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:border-[#4f46e5]/60 focus:bg-white/15 transition-all"
              />
            </div>

            <button onClick={handleSwap} className="w-11 h-11 rounded-xl bg-[#4f46e5]/20 border border-[#4f46e5]/30 flex items-center justify-center text-[#4f46e5] hover:bg-[#4f46e5]/30 hover:rotate-180 transition-all duration-300 flex-shrink-0">
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
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:border-[#4f46e5]/60 focus:bg-white/15 transition-all"
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
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium focus:outline-none focus:border-[#4f46e5]/60 focus:bg-white/15 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <GraduationCap size={16} />
              </div>
              <select value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)}
                className="w-full h-11 pl-9 pr-8 rounded-xl bg-white/10 border border-white/10 text-white/80 text-sm font-medium focus:outline-none focus:border-[#4f46e5]/60 focus:bg-white/15 transition-all appearance-none cursor-pointer">
                <option value="" className="text-gray-800">Semua Kelas</option>
                <option value="Ekonomi" className="text-gray-800">Ekonomi</option>
                <option value="Bisnis" className="text-gray-800">Bisnis</option>
                <option value="Eksekutif" className="text-gray-800">Eksekutif</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <Wallet size={16} />
              </div>
              <select value={hargaFilter} onChange={(e) => setHargaFilter(e.target.value)}
                className="w-full h-11 pl-9 pr-8 rounded-xl bg-white/10 border border-white/10 text-white/80 text-sm font-medium focus:outline-none focus:border-[#4f46e5]/60 focus:bg-white/15 transition-all appearance-none cursor-pointer">
                <option value="" className="text-gray-800">Filter Harga</option>
                <option value="asc" className="text-gray-800">Termurah</option>
                <option value="desc" className="text-gray-800">Termahal</option>
                <option value="<100000" className="text-gray-800">&lt; Rp 100.000</option>
                <option value="100000-250000" className="text-gray-800">Rp 100rb - 250rb</option>
                <option value=">250000" className="text-gray-800">&gt; Rp 250.000</option>
              </select>
            </div>

            <button onClick={handleSearch} disabled={loading}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white text-sm font-bold shadow-[0_10px_18px_rgba(79,70,229,0.35)] hover:from-[#4338ca] hover:to-[#4f46e5] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center border border-[rgba(186,151,113,0.12)]">
          <Loader2 size={28} className="animate-spin text-[#4f46e5] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#667085]">Memuat jadwal...</p>
        </div>
      )}

      {/* Schedule Result Cards */}
      {!loading && trains.length === 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center border border-[rgba(186,151,113,0.12)]">
          <Train size={32} className="text-[#98a2b3] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#667085]">Tidak ada jadwal yang tersedia.</p>
        </div>
      )}

      {!loading && trains.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {trains.map((train) => {
            const isDelay = train.status === "Delay";
            const isCancelled = train.status === "Dibatalkan";
            return (
              <div
                key={train.id}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-[rgba(186,151,113,0.12)] shadow-[0_8px_16px_rgba(15,39,67,0.06)] hover:shadow-[0_12px_24px_rgba(15,39,67,0.10)] transition-all duration-200 hover:-translate-y-0.5 ${isCancelled ? "opacity-75" : ""}`}
              >
                {/* Timeline */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold font-display text-[#101828]">
                      {train.jam || "-"}
                    </div>
                    <div className="text-xs font-semibold text-[#667085]">
                      {train.asal}
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isCancelled ? "bg-[#98a2b3]" : isDelay ? "bg-[#d7a43a]" : "bg-[#4f46e5]"}`} />
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-[#4f46e5] via-[#4f46e5]/60 to-[#4f46e5]" />
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider whitespace-nowrap">
                      <Clock size={12} />
                      {train.tanggal || "-"}
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-[#4f46e5]/40 via-[#4f46e5]/20 to-[#4f46e5]/40" />
                    <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold font-display text-[#101828] opacity-30">
                      --:--
                    </div>
                    <div className="text-xs font-semibold text-[#667085]">
                      {train.tujuan}
                    </div>
                  </div>
                </div>

                {/* Train Info & Actions */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[rgba(79,70,229,0.12)] to-[rgba(99,102,241,0.08)] flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <Train size={14} />
                      </div>
                      <div className="font-bold text-sm text-[#101828] truncate">
                        {train.nama}
                      </div>
                      {isDelay && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffeeec] text-red border border-[rgba(215,76,60,0.14)]">
                          Delay
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f4f5f7] text-[#475467] border border-[rgba(102,112,133,0.14)]">
                          Batal
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#667085] font-semibold mt-0.5">
                      {train.kelas || "-"}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold font-display ${isCancelled ? "text-[#98a2b3]" : "text-[#4f46e5]"}`}>
                      Rp {Number(train.harga).toLocaleString("id-ID") || "-"}
                    </div>
                  </div>

                  <button disabled={isCancelled}
                    className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                      isCancelled
                        ? "bg-[#f4f5f7] text-[#98a2b3] cursor-not-allowed"
                        : "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-[0_10px_18px_rgba(79,70,229,0.25)] hover:from-[#4338ca] hover:to-[#4f46e5] hover:-translate-y-0.5"
                    }`}>
                    PILIH & PESAN
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
