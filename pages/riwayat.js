import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Train, MapPin, Clock, Calendar, Search, CheckCircle, XCircle,
  AlertTriangle, ArrowRight, FileText, Filter, Loader2, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency } from "../lib/train-utils";

const STATUS_CONFIG = {
  paid: { label: "Lunas", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle },
  pending: { label: "Menunggu", badge: "bg-blue-50 text-blue-700 border border-blue-200", icon: Clock },
  cancelled: { label: "Dibatalkan", badge: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
};

const ITEMS_PER_PAGE = 10;

export default function RiwayatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchPurchases = useCallback(async (currentPage, search, status) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        perPage: String(ITEMS_PER_PAGE),
      });
      if (search) params.set("search", search);
      if (status && status !== "all") params.set("status", status);

      const res = await fetch(`/api/purchases?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();

      setPurchases(data.purchases || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 0);
    } catch {
      setError("Gagal memuat riwayat pesanan.");
      setPurchases([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases(page, debouncedSearch, statusFilter);
  }, [page, debouncedSearch, statusFilter, fetchPurchases]);

  // Stats are fetched from the summary endpoint (unfiltered, for dashboard display)
  const [stats, setStats] = useState({ total: 0, completed: 0, upcoming: 0, cancelled: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/purchases/summary?period=all");
        if (!res.ok) return;
        const data = await res.json();
        setStats({
          total: data.total_transaksi || 0,
          completed: data.total_transaksi || 0,
          upcoming: 0,
          cancelled: 0,
        });
      } catch {
        // Ignore
      }
    };
    fetchStats();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startIndex = total > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endIndex = Math.min(startIndex + purchases.length - 1, total);

  return (
    <PublicLayout title="Riwayat Pesanan">
      <section className="modern-hero">
        <div className="modern-hero-content">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/80 px-3 py-1 text-[11px] font-bold backdrop-blur">
              <Sparkles size={12} /> Riwayat Pemesanan
            </span>
          </div>
          <h1>Riwayat Pesanan</h1>
          <p>Lihat semua pemesanan tiket yang pernah Anda lakukan.</p>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Pesanan", value: total, color: "text-indigo-600" },
          { label: "Lunas", value: stats.completed, color: "text-emerald-600" },
          { label: "Menunggu", value: stats.upcoming, color: "text-blue-600" },
          { label: "Dibatalkan", value: stats.cancelled, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[380px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari kode booking, nama kereta..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {["all", "paid", "pending", "cancelled"].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === status ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
              }`}>
              {status === "all" ? "Semua" : STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat riwayat pesanan...</p>
        </div>
      )}

      {error && (
        <EmptyState title="Gagal Memuat Data"
          description={error}
          action={<button onClick={() => fetchPurchases(page, debouncedSearch, statusFilter)} className="btn btn-primary">Coba Lagi</button>} />
      )}

      {!loading && !error && total === 0 && (
        <EmptyState title="Belum Ada Riwayat Pesanan"
          description={
            debouncedSearch || statusFilter !== "all"
              ? "Tidak ada pesanan yang cocok dengan filter atau pencarian Anda."
              : "Anda belum pernah melakukan pemesanan tiket. Pesan tiket sekarang untuk melihat riwayat Anda."
          }
          action={
            debouncedSearch || statusFilter !== "all"
              ? <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPage(1); }} className="btn btn-primary">Reset Filter</button>
              : <Link href="/" className="btn btn-primary">Pesan Tiket</Link>
          } />
      )}

      {!loading && !error && purchases.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {purchases.map((item) => {
              const paymentStatus = item.status_pembayaran || "paid";
              const cfg = STATUS_CONFIG[paymentStatus] || STATUS_CONFIG.paid;
              const Icon = cfg.icon;
              const bookingCode = item.kode_booking || `KAI-${String(item.id).padStart(5, "0")}`;
              const totalPrice = Number(item.total_harga) || 0;
              const passengers = Number(item.jumlah_tiket) || 1;
              const formattedDate = item.tanggal_keberangkatan || item.tanggal_pembelian?.split(" ")[0] || "-";

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-500">{bookingCode}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                          <Icon size={10} /> {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Train size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{item.nama_kereta}</div>
                          <div className="text-[11px] text-slate-500 font-semibold">{item.kelas || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} className="text-indigo-500" />
                        <span className="font-semibold">{item.asal || "-"}</span>
                        <ArrowRight size={10} className="text-slate-300" />
                        <span className="font-semibold">{item.tujuan || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formattedDate}</span>
                        <span>{passengers} penumpang</span>
                        <span className="capitalize">{item.metode_pembayaran || "-"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-lg font-bold font-display text-indigo-600">{formatCurrency(totalPrice)}</div>
                      <Link href={`/cek-pesanan?bookingCode=${bookingCode}&purchaseId=${item.id}`}
                        className="h-8 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[10px] font-bold hover:from-indigo-700 hover:to-indigo-600 transition-all flex items-center gap-1">
                        Lihat E-Tiket <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-1">
              <div className="text-xs text-slate-400">
                Menampilkan {startIndex}–{endIndex} dari {total} pesanan
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white/90 flex items-center justify-center text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[36px] h-9 rounded-xl text-xs font-bold transition-all ${
                        pageNum === page
                          ? "bg-slate-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white/90 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white/90 flex items-center justify-center text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {totalPages <= 1 && total > 0 && (
            <div className="text-center mt-6">
              <p className="text-xs text-slate-400">Menampilkan {startIndex}–{endIndex} dari {total} pesanan</p>
            </div>
          )}
        </>
      )}
    </PublicLayout>
  );
}
