import Link from "next/link";
import { CheckCircle, XCircle, Clock as ClockIcon, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

import DbError, { getDbErrorMessage } from "../../components/ui/DbError";
import MetricGrid from "../../components/ui/MetricGrid";
import { getPaginatedPurchases, getPurchaseSummary, getPurchaseSummaryByDate, getPurchaseRevenueByStatus } from "../../lib/db";
import { requireAdminPage } from "../../lib/page-auth";
import { formatCurrency } from "../../lib/train-utils";

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
      {/* Revenue Overview Section */}
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
    const summary = await getPurchaseSummary("month");
    const dailyBreakdown = await getPurchaseSummaryByDate("month");
    const revenueByStatus = await getPurchaseRevenueByStatus("month");

    // Fetch 5 most recent purchases
    const recentResult = await getPaginatedPurchases({ period: "month" }, { page: 1, perPage: 5 });
    const recentPurchases = recentResult.rows || [];

    return {
      props: {
        summary,
        dailyBreakdown,
        revenueByStatus,
        recentPurchases,
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
        dbError: getDbErrorMessage(err),
      },
    };
  }
}
