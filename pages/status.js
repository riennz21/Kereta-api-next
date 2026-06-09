import { useState } from "react";
import Link from "next/link";
import { Search, Clock, AlertTriangle, CheckCircle, XCircle, ListChecks } from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import StatusCard from "../components/status/StatusCard";
import EmptyState from "../components/ui/EmptyState";
import { getAllTrains, getReportSummary } from "../lib/db";

const STAT_ICONS = {
  total: ListChecks,
  on_time: CheckCircle,
  delay: AlertTriangle,
  dibatalkan: XCircle,
};

const STAT_CONFIG = {
  total: {
    label: "Total Kereta",
    helper: "Semua kereta terdaftar",
    gradient: "from-[rgba(243,112,33,0.12)] to-[rgba(255,145,72,0.06)]",
    border: "border-[rgba(243,112,33,0.18)]",
    icon: "text-[#f37021] bg-[rgba(243,112,33,0.10)]",
    valueClass: "text-[#c6520f]",
  },
  on_time: {
    label: "Tepat Waktu",
    helper: "Perjalanan sesuai jadwal",
    gradient: "from-[rgba(31,157,99,0.12)] to-[rgba(31,157,99,0.04)]",
    border: "border-[rgba(31,157,99,0.18)]",
    icon: "text-[#1f9d63] bg-[rgba(31,157,99,0.10)]",
    valueClass: "text-[#067647]",
  },
  delay: {
    label: "Terlambat",
    helper: "Perlu perhatian ekstra",
    gradient: "from-[rgba(215,164,58,0.12)] to-[rgba(215,164,58,0.04)]",
    border: "border-[rgba(215,164,58,0.18)]",
    icon: "text-[#d7a43a] bg-[rgba(215,164,58,0.10)]",
    valueClass: "text-[#b54708]",
  },
  dibatalkan: {
    label: "Dibatalkan",
    helper: "Pembatalan perjalanan",
    gradient: "from-[rgba(215,76,60,0.12)] to-[rgba(215,76,60,0.04)]",
    border: "border-[rgba(215,76,60,0.18)]",
    icon: "text-[#d74c3c] bg-[rgba(215,76,60,0.10)]",
    valueClass: "text-[#b42318]",
  },
};

export default function StatusPage({ data, stats }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((train) =>
    train.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.asal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.tujuan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statItems = [
    { key: "total", value: stats.total },
    { key: "on_time", value: stats.on_time },
    { key: "delay", value: stats.delay },
    { key: "dibatalkan", value: stats.dibatalkan },
  ];

  return (
    <PublicLayout title="Status Kereta">
      <div className="max-w-[1100px] mx-auto">
        {/* ── Hero Section ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2743] to-[#173b64] p-6 md:p-8 mb-6 shadow-[0_22px_45px_rgba(15,39,67,0.18)] border border-[rgba(255,255,255,0.06)]">
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(243,112,33,0.6) 0%, transparent 70%)" }}
          />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-bold">
                <Clock size={12} />
                Live Monitoring
              </span>
            </div>
            <h1 className="text-white font-bold font-display text-2xl md:text-3xl mb-2">
              Status Operasional Kereta
            </h1>
            <p className="text-white/60 text-sm max-w-[520px] mb-0">
              Pantau kondisi perjalanan terkini secara real-time. Lihat jadwal tepat waktu, keterlambatan, atau pembatalan.
            </p>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {statItems.map((item) => {
            const config = STAT_CONFIG[item.key];
            const Icon = STAT_ICONS[item.key];
            return (
              <div
                key={item.key}
                className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-4 border ${config.border} shadow-[0_4px_12px_rgba(15,39,67,0.04)] hover:shadow-[0_8px_20px_rgba(15,39,67,0.08)] transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085]">
                    {config.label}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${config.icon} flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                </div>
                <div className={`text-2xl font-bold font-display ${config.valueClass}`}>
                  {item.value}
                </div>
                <div className="text-[11px] text-[#98a2b3] font-medium mt-1">
                  {config.helper}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[380px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
            <input
              type="text"
              placeholder="Cari kereta, stasiun asal, atau tujuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.10)] bg-white/90 text-sm font-medium text-[#101828] placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/50 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.10)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <span className="font-semibold">{filteredData.length}</span>
            <span>dari</span>
            <span className="font-semibold">{data.length}</span>
            <span>kereta</span>
          </div>
        </div>

        {/* ── Train Status Cards Grid ── */}
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
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-xs font-bold shadow-[0_10px_18px_rgba(243,112,33,0.22)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all"
                >
                  Reset Pencarian
                </button>
              ) : (
                <Link href="/" className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-xs font-bold shadow-[0_10px_18px_rgba(243,112,33,0.22)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all inline-flex items-center">
                  Cari Tiket
                </Link>
              )
            }
          />
        )}
      </div>
    </PublicLayout>
  );
}

export async function getServerSideProps() {
  const [data, stats] = await Promise.all([getAllTrains(), getReportSummary()]);
  return {
    props: {
      data,
      stats,
    },
  };
}
