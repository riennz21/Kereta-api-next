import { useState, useMemo } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock as ClockIcon, Filter } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import MetricGrid from "../../components/ui/MetricGrid";
import Pagination from "../../components/public/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import DbError, { getDbErrorMessage } from "../../components/ui/DbError";
import { requireAdminPage } from "../../lib/page-auth";
import { formatCurrency } from "../../lib/train-utils";
import {
  getPaginatedPurchases,
  getPurchaseRevenueByStatus,
  getPurchaseSummary,
  getPurchaseSummaryByDate,
} from "../../lib/db";

const PERIOD_LABELS = {
  today: "Hari Ini",
  week: "7 Hari Terakhir",
  month: "30 Hari Terakhir",
  all: "Semua Waktu",
};

const STATUS_CONFIG = {
  paid: { label: "Lunas", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle },
  pending: { label: "Menunggu Pembayaran", badge: "bg-amber-50 text-amber-700 border border-amber-200", icon: ClockIcon },
  cancelled: { label: "Dibatalkan", badge: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
};

const PER_PAGE = 15;

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

function buildHrefFn(period, startDate, endDate, isCustomRange, status) {
  return (targetPage) => {
    const params = new URLSearchParams();
    if (isCustomRange) {
      params.set("period", "custom");
      params.set("start_date", startDate);
      params.set("end_date", endDate);
    } else if (period && period !== "all") {
      params.set("period", period);
    } else {
      params.set("period", "all");
    }
    if (status && status !== "all") params.set("status", status);
    params.set("page", String(targetPage));
    return `/admin/laporan-keuangan?${params.toString()}`;
  };
}

export default function AdminLaporanKeuanganPage({
  period,
  startDate,
  endDate,
  data,
  summary,
  dailyBreakdown,
  page,
  totalPages,
  total,
  statusCounts,
  revenueByStatus,
  activeStatus,
  dbError,
}) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [dateFrom, setDateFrom] = useState(startDate || "");
  const [dateTo, setDateTo] = useState(endDate || "");
  const [dateError, setDateError] = useState("");

  const isCustomRange = period === "custom";
  const status = activeStatus || "all";

  const periodTabs = [
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "7 Hari" },
    { key: "month", label: "30 Hari" },
    { key: "all", label: "Semua" },
  ];

  const statusTabs = [
    { key: "all", label: "Semua Status" },
    { key: "paid", label: "Lunas" },
    { key: "pending", label: "Menunggu Pembayaran" },
    { key: "cancelled", label: "Dibatalkan" },
  ];

  const metricItems = [
    {
      label: "Total Pendapatan",
      value: formatCurrency(summary.total_pendapatan || 0),
      helper: isCustomRange
        ? `${formatDate(startDate)} – ${formatDate(endDate)}`
        : PERIOD_LABELS[period] || "Semua waktu",
      tone: "brand",
    },
    {
      label: "Total Transaksi",
      value: summary.total_transaksi || 0,
      helper: "Pemesanan tiket",
      tone: "success",
    },
    {
      label: "Tiket Terjual",
      value: summary.total_tiket_terjual || 0,
      helper: "Total tiket",
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

  const statusRevenueCards = [
    {
      label: "Pendapatan Lunas",
      value: formatCurrency(revenueByStatus?.paid?.revenue || 0),
      helper: `${revenueByStatus?.paid?.count || 0} transaksi — Pembayaran selesai`,
      tone: "success",
    },
    {
      label: "Pendapatan Menunggu",
      value: formatCurrency(revenueByStatus?.pending?.revenue || 0),
      helper: `${revenueByStatus?.pending?.count || 0} transaksi — Belum dibayar`,
      tone: "warning",
    },
    {
      label: "Pendapatan Dibatalkan",
      value: formatCurrency(revenueByStatus?.cancelled?.revenue || 0),
      helper: `${revenueByStatus?.cancelled?.count || 0} transaksi — Transaksi batal`,
      tone: "danger",
    },
  ];

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    if (!dateFrom || !dateTo) {
      setDateError("Harap isi kedua tanggal.");
      return;
    }
    if (dateFrom > dateTo) {
      setDateError("Tanggal 'Dari' tidak boleh setelah 'Sampai'.");
      return;
    }
    setDateError("");
    let url = `/admin/laporan-keuangan?period=custom&start_date=${encodeURIComponent(dateFrom)}&end_date=${encodeURIComponent(dateTo)}`;
    if (status !== "all") url += `&status=${encodeURIComponent(status)}`;
    window.location.href = url;
  };

  const buildPeriodUrl = (tabKey) => {
    const params = new URLSearchParams();
    params.set("period", tabKey);
    if (status !== "all") params.set("status", status);
    return `/admin/laporan-keuangan?${params.toString()}`;
  };

  const buildStatusUrl = (statusKey) => {
    const params = new URLSearchParams();
    if (isCustomRange) {
      params.set("period", "custom");
      params.set("start_date", startDate);
      params.set("end_date", endDate);
    } else if (period && period !== "all") {
      params.set("period", period);
    }
    if (statusKey !== "all") params.set("status", statusKey);
    return `/admin/laporan-keuangan?${params.toString()}`;
  };

  const buildPageHref = useMemo(
    () => buildHrefFn(period, startDate, endDate, isCustomRange, status),
    [period, startDate, endDate, isCustomRange, status],
  );

  // Status breakdown chips
  const statusBreakdown = [
    { key: "paid", count: statusCounts?.paid ?? 0, label: "Lunas", color: "bg-emerald-500" },
    { key: "pending", count: statusCounts?.pending ?? 0, label: "Menunggu Pembayaran", color: "bg-amber-500" },
    { key: "cancelled", count: statusCounts?.cancelled ?? 0, label: "Dibatalkan", color: "bg-red-500" },
  ];
  const totalStatusCount = statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <AdminLayout
      title="Laporan Keuangan"
      description="Pantau pendapatan, jumlah transaksi, dan tiket terjual berdasarkan periode dan status pembayaran."
      activePage="laporan-keuangan"
    >
      <DbError message={dbError} />

      <MetricGrid items={metricItems} className="admin-stats-grid" />

      {/* Revenue per Status Card */}
      <MetricGrid items={statusRevenueCards} className="admin-stats-grid" />

      {/* Status Breakdown Mini Cards */}
      {totalStatusCount > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-5">
          {statusBreakdown.map((s) => (
            <Link
              key={s.key}
              href={buildStatusUrl(s.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                status === s.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span>{s.label}</span>
              <span className={status === s.key ? "text-white/70" : "text-slate-400"}>({s.count})</span>
            </Link>
          ))}
          {status !== "all" && (
            <Link
              href={buildStatusUrl("all")}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              Reset filter status
            </Link>
          )}
        </div>
      )}

      {/* Period Tabs + Date Range Picker + Status Filter */}
      <div className="filters-card admin-filters-card">
        <div className="filters-shell">
          <div className="filter-actions">
            {/* Period filter */}
            <div className="period-tabs">
              {periodTabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={buildPeriodUrl(tab.key)}
                  className={`period-tab ${!isCustomRange && period === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <span className="filter-divider">atau</span>

            <form className="date-range-form" onSubmit={handleCustomDateSubmit}>
              <div className="date-range-field">
                <label htmlFor="start_date">Dari</label>
                <input
                  id="start_date"
                  type="date"
                  className="input-control date-input"
                  value={dateFrom}
                  max={todayStr}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setDateError("");
                  }}
                  required
                />
              </div>
              <span className="date-range-sep">—</span>
              <div className="date-range-field">
                <label htmlFor="end_date">Sampai</label>
                <input
                  id="end_date"
                  type="date"
                  className="input-control date-input"
                  value={dateTo}
                  max={todayStr}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setDateError("");
                  }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ minHeight: 42, alignSelf: "flex-end" }}>
                Terapkan
              </button>
            </form>
          </div>

          {dateError && (
            <div className="alert alert-error" style={{ minHeight: 40, padding: "0 14px", fontSize: "0.85rem" }}>
              <span>{dateError}</span>
            </div>
          )}

          {/* Active custom range chip */}
          {isCustomRange && startDate && endDate && (() => {
            const resetParams = new URLSearchParams({ period: "all" });
            if (status !== "all") resetParams.set("status", status);
            return (
              <div className="active-filter-chip">
                <span>Rentang kustom: <strong>{formatDate(startDate)}</strong> — <strong>{formatDate(endDate)}</strong></span>
                <Link href={`/admin/laporan-keuangan?${resetParams.toString()}`} className="btn btn-muted" style={{ minHeight: 32, padding: "0 12px", fontSize: "0.82rem" }}>
                  Reset
                </Link>
              </div>
            );
          })()}

          {/* Status filter bar */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <Filter size={14} className="text-slate-400 flex-shrink-0" />
            {statusTabs.map((tab) => {
              const isActive = status === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={buildStatusUrl(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {tab.key !== "all" && STATUS_CONFIG[tab.key] && (() => {
                    const Icon = STATUS_CONFIG[tab.key].icon;
                    return <Icon size={11} className="inline mr-1" />;
                  })()}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Breakdown Chart */}
      {dailyBreakdown.length > 0 && (() => {
        // Sort chronologically (oldest first) for the chart display
        const sorted = [...dailyBreakdown].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
        const maxPendapatan = Math.max(...sorted.map((d) => d.pendapatan), 1);
        const dayCount = sorted.length;
        // Wider range = more compressed bars; clamp bar width between 32px and 60px
        const barWidth = Math.max(32, Math.min(60, 480 / dayCount));
        const isLongRange = dayCount > 31;

        return (
          <div className="table-card">
            <div className="table-toolbar">
              <div className="table-toolbar-copy">
                <h2>Ringkasan Harian</h2>
                <p>
                  {isCustomRange
                    ? `Pendapatan per hari dari ${formatDate(startDate)} hingga ${formatDate(endDate)}.`
                    : `Pendapatan dan transaksi per hari untuk periode ${PERIOD_LABELS[period] || "ini"}.`}
                  {status !== "all" && ` — Filter: ${STATUS_CONFIG[status]?.label || status}`}
                  {isLongRange && ` — ${dayCount} hari`}
                </p>
              </div>
            </div>

            <div className="chart-bars" style={{
              overflowX: isLongRange ? "auto" : "visible",
              paddingBottom: isLongRange ? 8 : 0,
            }}>
              {sorted.map((day) => {
                const barHeight = Math.max(4, (day.pendapatan / maxPendapatan) * 120);
                return (
                  <div key={day.tanggal} className="chart-bar-item" style={{ minWidth: barWidth, maxWidth: barWidth }}>
                    <div className="chart-bar-tooltip">
                      <strong>{formatCurrency(day.pendapatan)}</strong>
                      <br />
                      <span>{day.transaksi} transaksi</span>
                    </div>
                    <div
                      className="chart-bar"
                      style={{ height: barHeight }}
                      title={`${day.tanggal}: ${formatCurrency(day.pendapatan)}`}
                    />
                    <span className="chart-bar-label" style={{ fontSize: isLongRange ? 8 : 10 }}>
                      {new Date(day.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Transactions Table */}
      {data.length > 0 ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Daftar Transaksi</h2>
              <p>
                {total > 0
                  ? `Menampilkan ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} dari ${total} transaksi`
                  : `${data.length} transaksi ditemukan`}
                {isCustomRange
                  ? ` (${formatDate(startDate)} – ${formatDate(endDate)})`
                  : ` (${PERIOD_LABELS[period] || "semua waktu"})`}
                {status !== "all" && ` — ${STATUS_CONFIG[status]?.label || status}`}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Pembeli</th>
                  <th>Kereta</th>
                  <th>Rute</th>
                  <th>Kelas</th>
                  <th>Tiket</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => {
                  const st = p.status_pembayaran || "paid";
                  const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.paid;
                  const Icon = cfg.icon;
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="table-title">#{p.id}</span>
                      </td>
                      <td>
                        <span className="table-subtitle">
                          {new Date(
                            p.tanggal_pembelian + (p.tanggal_pembelian.includes("T") ? "" : "T00:00:00"),
                          ).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td>
                        <span className="table-title">{p.nama_pembeli}</span>
                        {p.email_pembeli && <span className="table-subtitle">{p.email_pembeli}</span>}
                      </td>
                      <td>{p.nama_kereta}</td>
                      <td>
                        {p.asal} &rarr; {p.tujuan}
                      </td>
                      <td>
                        <span className="badge-status kelas-badge">{p.kelas}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>{p.jumlah_tiket}</td>
                      <td>
                        <strong>{formatCurrency(p.total_harga)}</strong>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                          <Icon size={10} /> {cfg.label}
                        </span>
                      </td>
                      <td>
                        <span className="payment-badge">{p.metode_pembayaran?.replace(/_/g, " ") || "-"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
        </div>
      ) : (
        <EmptyState
          title="Belum ada transaksi"
          description={
            status !== "all"
              ? `Belum ditemukan transaksi dengan status "${STATUS_CONFIG[status]?.label || status}" untuk periode ini.`
              : isCustomRange
                ? `Belum ditemukan transaksi dari ${formatDate(startDate)} hingga ${formatDate(endDate)}.`
                : `Belum ditemukan transaksi untuk periode ${PERIOD_LABELS[period] || "ini"}.`
          }
          action={
            period !== "all" || status !== "all" ? (
              <Link
                href={(() => {
                  if (status !== "all") return buildStatusUrl("all");
                  return "/admin/laporan-keuangan?period=all";
                })()}
                className="btn btn-outline"
              >
                Reset Filter
              </Link>
            ) : null
          }
        />
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const redirect = requireAdminPage(context);
  if (redirect) {
    return redirect;
  }

  try {
    const period = context.query.period || "all";
    const startDate = context.query.start_date || "";
    const endDate = context.query.end_date || "";
    const activeStatus = context.query.status || "";
    const requestedPage = Math.max(1, Number(context.query.page) || 1);

    const isCustomRange = !["today", "week", "month", "all"].includes(period) && startDate && endDate;
    const actualPeriod = isCustomRange ? "custom" : period;

    const filterParams = isCustomRange
      ? { startDate, endDate, ...(activeStatus ? { status: activeStatus } : {}) }
      : { period, ...(activeStatus ? { status: activeStatus } : {}) };

    const paginated = await getPaginatedPurchases(filterParams, { page: requestedPage, perPage: PER_PAGE });
    const summary = await getPurchaseSummary(
      isCustomRange ? "custom" : period,
      isCustomRange ? startDate : "",
      isCustomRange ? endDate : "",
    );

    const revenueByStatus = await getPurchaseRevenueByStatus(
      isCustomRange ? "custom" : period,
      isCustomRange ? startDate : "",
      isCustomRange ? endDate : "",
    );

    // Derive status counts from revenue data to avoid a separate DB query
    const statusCounts = {
      paid: revenueByStatus.paid?.count || 0,
      pending: revenueByStatus.pending?.count || 0,
      cancelled: revenueByStatus.cancelled?.count || 0,
    };

    const dailyBreakdown = isCustomRange
      ? await getPurchaseSummaryByDate("custom", startDate, endDate)
      : period !== "all"
        ? await getPurchaseSummaryByDate(period)
        : [];

    return {
      props: {
        period: actualPeriod,
        startDate,
        endDate,
        data: paginated.rows,
        summary,
        statusCounts,
        revenueByStatus,
        dailyBreakdown,
        page: paginated.page,
        totalPages: paginated.totalPages,
        total: paginated.total,
        activeStatus: activeStatus || null,
        dbError: null,
      },
    };
  } catch (err) {
    return {
      props: {
        period: "all",
        startDate: "",
        endDate: "",
        data: [],
        summary: { total_transaksi: 0, total_pendapatan: 0, total_tiket_terjual: 0 },
        statusCounts: { paid: 0, pending: 0, cancelled: 0 },
        revenueByStatus: { paid: { count: 0, revenue: 0 }, pending: { count: 0, revenue: 0 }, cancelled: { count: 0, revenue: 0 } },
        dailyBreakdown: [],
        page: 1,
        totalPages: 1,
        total: 0,
        activeStatus: null,
        dbError: getDbErrorMessage(err),
      },
    };
  }
}
