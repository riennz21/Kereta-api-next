import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  TrendingUp,
  Calendar,
  ArrowRight,
  Train,
  Plus,
  ListOrdered,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

import DbError, { getDbErrorMessage } from "../../components/ui/DbError";
import MetricGrid from "../../components/ui/MetricGrid";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import { getAllTrains, getPaginatedPurchases, getPurchaseSummary, getPurchaseSummaryByDate, getPurchaseRevenueByStatus } from "../../lib/db";
import { requireAdminPage } from "../../lib/page-auth";
import { computeStats, formatCurrency } from "../../lib/train-utils";

const STATUS_CONFIG = {
  paid: { label: "Lunas", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle },
  pending: { label: "Menunggu Pembayaran", badge: "bg-amber-50 text-amber-700 border border-amber-200", icon: ClockIcon },
  cancelled: { label: "Dibatalkan", badge: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
};

function MiniBarChart({ data, height = 140 }) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const maxVal = Math.max(...sorted.map((d) => d.pendapatan), 1);
  const barWidth = Math.max(16, Math.min(40, 300 / sorted.length));
  const isLong = sorted.length > 14;

  return (
    <div className="chart-bars" style={{
      overflowX: isLong ? "auto" : "visible",
      paddingBottom: 6,
      gap: 2,
    }}>
      {sorted.map((day, i) => {
        const h = Math.max(3, (day.pendapatan / maxVal) * height);
        return (
          <div key={day.tanggal} className="chart-bar-item" style={{ minWidth: barWidth, maxWidth: barWidth }}>
            <div className="chart-bar-tooltip">
              <strong>{formatCurrency(day.pendapatan)}</strong>
              <br />
              <span>{day.transaksi} transaksi</span>
            </div>
            <div
              className="chart-bar"
              style={{ height: h, background: "linear-gradient(180deg, #4f46e5 0%, #818cf8 100%)", borderRadius: "4px 4px 0 0" }}
              title={`${day.tanggal}: ${formatCurrency(day.pendapatan)}`}
            />
            <span className="chart-bar-label" style={{ fontSize: isLong ? 7 : 9, marginTop: 2 }}>
              {new Date(day.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
                weekday: isLong ? undefined : "short",
                day: "numeric",
                month: isLong ? undefined : "short",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ paid, pending, cancelled }) {
  const total = paid + pending + cancelled;
  if (total === 0) return null;

  const segments = [
    { value: paid, color: "#10b981", label: "Lunas" },
    { value: pending, color: "#f59e0b", label: "Menunggu" },
    { value: cancelled, color: "#ef4444", label: "Dibatalkan" },
  ].filter((s) => s.value > 0);

  const circumference = 2 * Math.PI * 40; // radius 40

  // Pre-compute offsets to avoid mutation inside .map()
  const segmentsWithOffset = segments.reduce((acc, seg) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].startOffset + acc[acc.length - 1].length : 0;
    const length = (seg.value / total) * circumference;
    acc.push({ ...seg, length, startOffset: prevEnd });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          {segmentsWithOffset.map((seg) => (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-seg.startOffset}
              transform="rotate(-90, 50, 50)"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          ))}
          <circle cx="50" cy="50" r="28" fill="white" />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="800" fill="#0f172a">
            {total}
          </text>
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-slate-600">{seg.label}</span>
            <span className="text-slate-900">{seg.value}</span>
            <span className="text-slate-400">({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage({
  summary,
  dailyBreakdown,
  revenueByStatus,
  recentPurchases,
  trainStats,
  trains,
  dbError,
}) {
  const revenueItems = [
    {
      label: "Total Pendapatan",
      value: formatCurrency(summary.total_pendapatan || 0),
      helper: "30 hari terakhir",
      tone: "brand",
    },
    {
      label: "Total Transaksi",
      value: summary.total_transaksi || 0,
      helper: "30 hari terakhir",
      tone: "success",
    },
    {
      label: "Tiket Terjual",
      value: summary.total_tiket_terjual || 0,
      helper: "30 hari terakhir",
      tone: "navy",
    },
    {
      label: "Rata-rata per Transaksi",
      value: formatCurrency(
        (summary.total_transaksi || 0)
          ? Math.round((summary.total_pendapatan || 0) / (summary.total_transaksi || 1))
          : 0,
      ),
      helper: "Nilai transaksi rata-rata",
      tone: "danger",
    },
  ];

  const hasRevenueData = (summary.total_pendapatan || 0) > 0;
  const hasChartData = dailyBreakdown && dailyBreakdown.length > 0;
  const hasTrains = trains && trains.length > 0;

  // Compute class counts without showing origin/destination
  const classCounts = hasTrains
    ? trains.reduce((acc, t) => {
        const key = t.kelas?.trim();
        if (key) acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    : {};

  const statusDotMap = {
    "On Time": "bg-emerald-500",
    "Delay": "bg-amber-500",
    "Dibatalkan": "bg-red-500",
  };

  return (
    <AdminLayout
      title="Dashboard Admin"
      description="Pantau data kereta, pendapatan, transaksi, dan kondisi operasional dalam satu ringkasan interaktif."
      activePage="dashboard"
      topbarAction={
        <Link href="/admin/tambah" className="btn btn-primary">
          + Tambah Kereta
        </Link>
      }
    >
      {/* Revenue Overview Section — only when there are transactions */}
      {hasRevenueData && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold font-display text-slate-900">Ringkasan Pendapatan</h2>
            <span className="text-[11px] text-slate-400 font-semibold">— 30 hari terakhir</span>
            <Link href="/admin/laporan-keuangan?period=month" className="ml-auto text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors">
              Lihat Detail
            </Link>
          </div>
          <MetricGrid items={revenueItems} className="admin-stats-grid" />

          {/* Chart + Donut Row */}
          {hasChartData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold font-display text-slate-900">Grafik Pendapatan Harian</h3>
                    <p className="text-[11px] text-slate-500">Pendapatan per hari dalam 30 hari terakhir</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <Calendar size={12} /> Harian
                  </div>
                </div>
                {dailyBreakdown.length > 0 ? (
                  <MiniBarChart data={dailyBreakdown} height={130} />
                ) : (
                  <div className="flex items-center justify-center h-[140px] text-sm text-slate-400 font-semibold">
                    Belum ada data pendapatan
                  </div>
                )}
              </div>

              {/* Status Donut + Revenue Cards */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold font-display text-slate-900 mb-3">Status Transaksi</h3>
                {revenueByStatus.paid?.count + revenueByStatus.pending?.count + revenueByStatus.cancelled?.count > 0 ? (
                  <>
                    <DonutChart
                      paid={revenueByStatus.paid?.count || 0}
                      pending={revenueByStatus.pending?.count || 0}
                      cancelled={revenueByStatus.cancelled?.count || 0}
                    />
                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-100">
                      {[
                        { key: "paid", label: "Pendapatan Lunas", revenue: revenueByStatus.paid?.revenue || 0, color: "text-emerald-600" },
                        { key: "pending", label: "Pendapatan Menunggu", revenue: revenueByStatus.pending?.revenue || 0, color: "text-amber-600" },
                        { key: "cancelled", label: "Pendapatan Batal", revenue: revenueByStatus.cancelled?.revenue || 0, color: "text-red-500" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
                          <span className={`text-xs font-bold ${item.color}`}>{formatCurrency(item.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[180px] text-sm text-slate-400 font-semibold">
                    Belum ada transaksi
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {recentPurchases && recentPurchases.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold font-display text-slate-900">Transaksi Terbaru</h3>
                  <p className="text-[11px] text-slate-500">{recentPurchases.length} transaksi terakhir</p>
                </div>
                <Link href="/admin/laporan-keuangan" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors flex items-center gap-1">
                  Semua Transaksi <ArrowRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentPurchases.map((p) => {
                  const st = p.status_pembayaran || "paid";
                  const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.paid;
                  const Icon = cfg.icon;
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        st === "paid" ? "bg-emerald-50 text-emerald-600" : st === "pending" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                      }`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{p.nama_pembeli}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{p.nama_kereta} — {p.asal} → {p.tujuan}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-slate-900">{formatCurrency(p.total_harga)}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.tanggal_pembelian).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/admin/laporan-keuangan" className="block text-center text-[11px] font-semibold text-indigo-600 py-2.5 hover:bg-slate-50 transition-colors border-t border-slate-100">
                Lihat Semua Transaksi
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Train Overview Section — shown when there are trains, but no transaction data yet */}
      {!hasRevenueData && hasTrains && (
        <div className="space-y-6">
          {/* Heading */}
          <div className="flex items-center gap-2 mb-1">
            <Train size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold font-display text-slate-900">Ringkasan Armada Kereta</h2>
            <span className="text-[11px] text-slate-400 font-semibold">— Seluruh data kereta</span>
          </div>

          {/* Stats Grid */}
          <MetricGrid
            items={[
              { label: "Total Kereta", value: trainStats.total, helper: "Seluruh armada", tone: "brand" },
              { label: "On Time", value: trainStats.on_time, helper: "Berjalan sesuai jadwal", tone: "success" },
              { label: "Delay", value: trainStats.delay, helper: "Mengalami keterlambatan", tone: "danger" },
              { label: "Dibatalkan", value: trainStats.dibatalkan, helper: "Perjalanan dibatalkan", tone: "warning" },
            ]}
            className="admin-stats-grid"
          />

          {/* Class distribution + Quick actions row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Class Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold font-display text-slate-900 mb-3">Distribusi Kelas</h3>
              {Object.keys(classCounts).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(classCounts).map(([kelas, count]) => {
                    const pct = Math.round((count / trainStats.total) * 100);
                    const barColor =
                      kelas === "Eksekutif"
                        ? "bg-indigo-500"
                        : kelas === "Bisnis"
                          ? "bg-amber-500"
                          : "bg-emerald-500";
                    return (
                      <div key={kelas}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">
                            <TrainClassBadge trainClass={kelas} />
                          </span>
                          <span className="font-bold text-slate-900">
                            {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-400 font-semibold">Belum ada data kelas</div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold font-display text-slate-900 mb-3">Aksi Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/admin/tambah"
                  className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Plus size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Tambah Kereta</div>
                    <div className="text-[11px] text-slate-500">Masukkan data kereta baru</div>
                  </div>
                </Link>
                <Link
                  href="/admin/jadwal"
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Atur Jadwal</div>
                    <div className="text-[11px] text-slate-500">Kelola jadwal keberangkatan</div>
                  </div>
                </Link>
                <Link
                  href="/admin/status"
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Update Status</div>
                    <div className="text-[11px] text-slate-500">Perbarui status perjalanan</div>
                  </div>
                </Link>
                <Link
                  href="/admin/kereta"
                  className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors border border-sky-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                    <ListOrdered size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Data Kereta</div>
                    <div className="text-[11px] text-slate-500">Lihat & kelola semua kereta</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Train Status List — no origin/destination shown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900">Status Perjalanan</h3>
                <p className="text-[11px] text-slate-500">Ringkasan status seluruh kereta</p>
              </div>
              <Link href="/admin/status" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors flex items-center gap-1">
                Kelola Status <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {trains.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition-colors">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotMap[t.status] || "bg-slate-300"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{t.nama}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      {t.tanggal} • {t.jam}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <TrainClassBadge trainClass={t.kelas} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/kereta" className="block text-center text-[11px] font-semibold text-indigo-600 py-2.5 hover:bg-slate-50 transition-colors border-t border-slate-100">
              Lihat Semua Data Kereta
            </Link>
          </div>
        </div>
      )}

      {/* Empty welcome state — no trains and no revenue data */}
      {!hasRevenueData && !hasTrains && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Train size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Selamat Datang di Panel Admin</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            Kelola seluruh data kereta, jadwal, status perjalanan, dan pantau transaksi dari satu dashboard.
          </p>
          <Link href="/admin/tambah" className="btn btn-primary">
            + Tambah Kereta Pertama
          </Link>
          <div className="flex items-center gap-6 mt-8 text-xs text-slate-400 font-semibold">
            <span>Kelola jadwal</span>
            <span>•</span>
            <span>Update status</span>
            <span>•</span>
            <span>Pantau transaksi</span>
          </div>
        </div>
      )}

      <DbError message={dbError} />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const redirect = requireAdminPage(context);
  if (redirect) {
    return redirect;
  }

  try {
    const [summary, dailyBreakdown, revenueByStatus, allTrains] = await Promise.all([
      getPurchaseSummary("month"),
      getPurchaseSummaryByDate("month"),
      getPurchaseRevenueByStatus("month"),
      getAllTrains(),
    ]);

    const trainStats = computeStats(allTrains);
    const trains = allTrains.slice(0, 10);

    // Fetch 5 most recent purchases
    const recentResult = await getPaginatedPurchases({ period: "month" }, { page: 1, perPage: 5 });
    const recentPurchases = recentResult.rows || [];

    return {
      props: {
        summary,
        dailyBreakdown,
        revenueByStatus,
        recentPurchases,
        trainStats,
        trains,
        dbError: null,
      },
    };
  } catch (err) {
    return {
      props: {
        summary: { total_transaksi: 0, total_pendapatan: 0, total_tiket_terjual: 0 },
        dailyBreakdown: [],
        revenueByStatus: { paid: { count: 0, revenue: 0 }, pending: { count: 0, revenue: 0 }, cancelled: { count: 0, revenue: 0 } },
        recentPurchases: [],
        trainStats: { total: 0, on_time: 0, delay: 0, dibatalkan: 0 },
        trains: [],
        dbError: getDbErrorMessage(err),
      },
    };
  }
}
