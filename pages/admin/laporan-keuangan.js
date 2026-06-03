import { useState, useMemo } from "react";
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import MetricGrid from "../../components/ui/MetricGrid";
import Pagination from "../../components/public/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import { requireAdminPage } from "../../lib/page-auth";
import { formatCurrency } from "../../lib/train-utils";
import { getPaginatedPurchases, getPurchaseSummary, getPurchaseSummaryByDate } from "../../lib/db";

const PERIOD_LABELS = {
  today: "Hari Ini",
  week: "7 Hari Terakhir",
  month: "30 Hari Terakhir",
  all: "Semua Waktu",
};

const PER_PAGE = 15;

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function AdminLaporanKeuanganPage({ period, startDate, endDate, data, summary, dailyBreakdown, page, totalPages, total }) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [dateFrom, setDateFrom] = useState(startDate || "");
  const [dateTo, setDateTo] = useState(endDate || "");
  const [dateError, setDateError] = useState("");

  const isCustomRange = period === "custom";

  const periodTabs = [
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "7 Hari" },
    { key: "month", label: "30 Hari" },
    { key: "all", label: "Semua" },
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
    setDateError("");    window.location.href = `/admin/laporan-keuangan?period=custom&start_date=${encodeURIComponent(dateFrom)}&end_date=${encodeURIComponent(dateTo)}`;
  };

  const buildPageHref = useMemo(() => {
    // Return a function that builds a fresh URL from base params each time
    const baseParams = { period: isCustomRange ? "custom" : (period !== "all" ? period : null) };
    if (isCustomRange) {
      baseParams.start_date = startDate;
      baseParams.end_date = endDate;
    }

    return (targetPage) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(baseParams)) {
        if (value != null) params.set(key, value);
      }
      params.set("page", String(targetPage));
      return `/admin/laporan-keuangan?${params.toString()}`;
    };
  }, [period, startDate, endDate, isCustomRange]);

  return (
    <AdminLayout
      title="Laporan Keuangan"
      description="Pantau pendapatan, jumlah transaksi, dan tiket terjual berdasarkan periode harian, mingguan, bulanan, atau rentang tanggal kustom."
      activePage="laporan-keuangan"
    >
      <MetricGrid items={metricItems} className="admin-stats-grid" />

      {/* Period Tabs + Date Range Picker */}
      <div className="filters-card admin-filters-card">
        <div className="filters-shell">
          <div className="filter-actions">
            <div className="period-tabs">
              {periodTabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={`/admin/laporan-keuangan?period=${tab.key}`}
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

          {dateError && (
            <div className="alert alert-error" style={{ minHeight: 40, padding: "0 14px", fontSize: "0.85rem" }}>
              <span>{dateError}</span>
            </div>
          )}
          </div>

          {isCustomRange && startDate && endDate && (
            <div className="active-filter-chip">
              <span>Rentang kustom: <strong>{formatDate(startDate)}</strong> — <strong>{formatDate(endDate)}</strong></span>
              <Link href="/admin/laporan-keuangan?period=all" className="btn btn-muted" style={{ minHeight: 32, padding: "0 12px", fontSize: "0.82rem" }}>
                Reset
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Daily Breakdown Chart */}
      {dailyBreakdown.length > 0 && (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Ringkasan Harian</h2>
              <p>
                {isCustomRange
                  ? `Pendapatan per hari dari ${formatDate(startDate)} hingga ${formatDate(endDate)}.`
                  : `Pendapatan dan transaksi per hari untuk periode ${PERIOD_LABELS[period] || "ini"}.`}
              </p>
            </div>
          </div>

          <div className="chart-bars">
            {dailyBreakdown.map((day) => {
              const maxPendapatan = Math.max(...dailyBreakdown.map((d) => d.pendapatan), 1);
              const barHeight = Math.max(4, (day.pendapatan / maxPendapatan) * 120);
              return (
                <div key={day.tanggal} className="chart-bar-item">
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
                  <span className="chart-bar-label">
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
      )}

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
                  <th>Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
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
                      <span className="payment-badge">{p.metode_pembayaran?.replace(/_/g, " ") || "-"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
        </div>
      ) : (
        <EmptyState
          title="Belum ada transaksi"
          description={
            isCustomRange
              ? `Belum ditemukan transaksi dari ${formatDate(startDate)} hingga ${formatDate(endDate)}.`
              : `Belum ditemukan transaksi untuk periode ${PERIOD_LABELS[period] || "ini"}.`
          }
          action={
            period !== "all" ? (
              <Link href="/admin/laporan-keuangan?period=all" className="btn btn-outline">
                Lihat Semua Transaksi
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

  const period = context.query.period || "all";
  const startDate = context.query.start_date || "";
  const endDate = context.query.end_date || "";
  const requestedPage = Math.max(1, Number(context.query.page) || 1);

  const isCustomRange = !["today", "week", "month", "all"].includes(period) && startDate && endDate;
  const actualPeriod = isCustomRange ? "custom" : period;

  const paginated = await getPaginatedPurchases(
    isCustomRange ? { startDate, endDate } : { period },
    { page: requestedPage, perPage: PER_PAGE },
  );
  const summary = await getPurchaseSummary(
    isCustomRange ? "custom" : period,
    isCustomRange ? startDate : "",
    isCustomRange ? endDate : "",
  );
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
      dailyBreakdown,
      page: paginated.page,
      totalPages: paginated.totalPages,
      total: paginated.total,
    },
  };
}
