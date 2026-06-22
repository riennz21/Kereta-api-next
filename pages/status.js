import { useState } from "react";
import Link from "next/link";
import { Search, Clock, AlertTriangle, CheckCircle, XCircle, ListChecks, Sparkles } from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import StatusCard from "../components/status/StatusCard";
import EmptyState from "../components/ui/EmptyState";
import { getAllTrains, getReportSummary } from "../lib/db";

export default function StatusPage({ data, stats }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((train) =>
    train.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.asal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.tujuan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statItems = [
    { key: "total", label: "Total Kereta", value: stats.total, icon: ListChecks, helper: "Semua kereta terdaftar", color: "text-indigo-600" },
    { key: "on_time", label: "Tepat Waktu", value: stats.on_time, icon: CheckCircle, helper: "Perjalanan sesuai jadwal", color: "text-emerald-600" },
    { key: "delay", label: "Terlambat", value: stats.delay, icon: AlertTriangle, helper: "Perlu perhatian ekstra", color: "text-amber-600" },
    { key: "dibatalkan", label: "Dibatalkan", value: stats.dibatalkan, icon: XCircle, helper: "Pembatalan perjalanan", color: "text-red-500" },
  ];

  return (
    <PublicLayout title="Status Kereta">
      {/* Hero */}
      <section className="modern-hero">
        <div className="modern-hero-content">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/80 px-3 py-1 text-[11px] font-bold backdrop-blur">
              <Sparkles size={12} />
              Live Monitoring
            </span>
          </div>
          <h1>Status Operasional Kereta</h1>
          <p>Pantau kondisi perjalanan terkini. Lihat jadwal tepat waktu, keterlambatan, atau pembatalan.</p>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {item.label}
                </span>
                <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center ${item.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className={`text-2xl font-bold font-display ${item.color}`}>
                {item.value}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {item.helper}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[380px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kereta, stasiun asal, atau tujuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold">{filteredData.length}</span>
          <span>dari</span>
          <span className="font-semibold">{data.length}</span>
          <span>kereta</span>
        </div>
      </div>

      {/* Train Status Cards */}
      {filteredData.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredData.map((train, index) => (
            <StatusCard key={train.id || `${train.nama}-${index}`} train={train} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? "Kereta tidak ditemukan" : "Belum ada data kereta"}
          description={
            searchQuery
              ? `Tidak ada kereta dengan nama "${searchQuery}" yang ditemukan.`
              : "Data kereta akan tampil di sini setelah ditambahkan melalui panel admin."
          }
          action={
            searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="btn btn-primary"
              >
                Reset Pencarian
              </button>
            ) : (
              <Link href="/" className="btn btn-primary">
                Cari Tiket
              </Link>
            )
          }
        />
      )}
    </PublicLayout>
  );
}

export async function getServerSideProps() {
  const [data, stats] = await Promise.all([getAllTrains(), getReportSummary()]);
  return {
    props: { data, stats },
  };
}
