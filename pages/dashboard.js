import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Train, MapPin, Clock, Calendar, Search, AlertTriangle,
  CheckCircle, XCircle, ListChecks, Sparkles, ArrowRight,
  Wallet, TrendingUp
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import StatusBadge from "../components/StatusBadge";
import TrainClassBadge from "../components/TrainClassBadge";
import EmptyState from "../components/ui/EmptyState";
import { getAllTrains } from "../lib/db";
import { formatCurrency, getImageUrl } from "../lib/train-utils";

export default function DashboardPage({ data }) {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    const total = data.length;
    const onTime = data.filter((t) => t.status === "On Time").length;
    const delay = data.filter((t) => t.status === "Delay").length;
    const cancelled = data.filter((t) => t.status === "Dibatalkan").length;
    return { total, onTime, delay, cancelled };
  }, [data]);

  const classCounts = useMemo(() => {
    return data.reduce((acc, t) => {
      const cls = t.kelas || "Tanpa Kelas";
      acc[cls] = (acc[cls] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (t) =>
        t.nama?.toLowerCase().includes(q) ||
        t.asal?.toLowerCase().includes(q) ||
        t.tujuan?.toLowerCase().includes(q) ||
        t.kelas?.toLowerCase().includes(q) ||
        t.status?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const isCancelled = (status) => status === "Dibatalkan";

  const statCards = [
    { icon: Train, label: "Total Kereta", value: stats.total, color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: CheckCircle, label: "Tepat Waktu", value: stats.onTime, color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: AlertTriangle, label: "Terlambat", value: stats.delay, color: "text-amber-600", bg: "bg-amber-50" },
    { icon: XCircle, label: "Dibatalkan", value: stats.cancelled, color: "text-red-500", bg: "bg-red-50" },
  ];

  const classEntries = Object.entries(classCounts);

  return (
    <PublicLayout title="Dashboard Kereta">
      {/* Hero */}
      <section className="modern-hero">
        <div className="modern-hero-content">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/80 px-3 py-1 text-[11px] font-bold backdrop-blur">
              <Sparkles size={12} />
              Dashboard Kereta
            </span>
          </div>
          <h1>Ringkasan Seluruh Kereta</h1>
          <p>
            Pantau semua kereta dalam satu tampilan. Lihat status, kelas, jadwal, dan harga tanpa perlu memilih stasiun.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {item.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className={`text-2xl font-bold font-display ${item.color}`}>
                {item.value}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {item.label === "Total Kereta"
                  ? "Semua kereta terdaftar"
                  : item.label === "Tepat Waktu"
                  ? "Perjalanan sesuai jadwal"
                  : item.label === "Terlambat"
                  ? "Perlu perhatian ekstra"
                  : "Pembatalan perjalanan"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Breakdown */}
      {classEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold font-display text-slate-900">Kelas Kereta</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {classEntries.map(([className, count]) => (
              <div
                key={className}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <TrainClassBadge trainClass={className} />
                <span className="text-lg font-bold font-display text-slate-900">{count}</span>
                <span className="text-xs text-slate-500 font-medium">kereta</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kereta, stasiun, kelas, atau status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{filteredData.length}</span> dari{" "}
          <span className="font-semibold text-slate-700">{data.length}</span> kereta
        </div>
      </div>

      {/* Train Cards */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredData.map((train) => (
            <article
              key={train.id}
              className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 ${
                isCancelled(train.status) ? "opacity-75" : ""
              }`}
            >
              <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-start gap-4">
                  {/* Train Image */}
                  <div className="hidden sm:block w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden bg-slate-100">
                    {train.gambar ? (
                      <img
                        loading="lazy"
                        src={getImageUrl(train.gambar)}
                        alt={train.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Train size={24} />
                      </div>
                    )}
                  </div>

                  {/* Train Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {train.nama}
                      </span>
                      <TrainClassBadge trainClass={train.kelas} />
                      <StatusBadge status={train.status} />
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <MapPin size={14} className="text-slate-400" />
                        {train.asal}
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <MapPin size={14} className="text-slate-400" />
                        {train.tujuan}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {train.tanggal || "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {train.jam || "-"}
                      </span>
                      {train.deskripsi && (
                        <span className="text-slate-400 truncate max-w-[200px]">
                          {train.deskripsi}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 md:border-l md:border-slate-100 md:pl-6">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Harga mulai</div>
                    <div className="text-2xl font-bold font-display text-slate-900">
                      {formatCurrency(train.harga)}
                    </div>
                  </div>
                  {isCancelled(train.status) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed">
                      <AlertTriangle size={14} />
                      Tidak Tersedia
                    </span>
                  ) : (
                    <Link
                      href={`/checkout/${train.id}`}
                      className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 active:scale-[0.98]"
                    >
                      Pesan Sekarang
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? "Kereta Tidak Ditemukan" : "Belum Ada Data Kereta"}
          description={
            searchQuery
              ? `Tidak ada kereta yang cocok dengan "${searchQuery}".`
              : "Data kereta akan tampil di sini setelah ditambahkan melalui panel admin."
          }
          action={
            searchQuery ? (
              <button onClick={() => setSearchQuery("")} className="btn btn-primary">
                Reset Pencarian
              </button>
            ) : (
              <Link href="/admin" className="btn btn-primary">
                Panel Admin
              </Link>
            )
          }
        />
      )}
    </PublicLayout>
  );
}

export async function getServerSideProps() {
  const data = await getAllTrains();
  return {
    props: { data },
  };
}
