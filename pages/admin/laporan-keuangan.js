import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Filter,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import MetricGrid from "../../components/ui/MetricGrid";
import Pagination from "../../components/public/Pagination";
import DbError from "../../components/ui/DbError";
import KeuanganChart from "../../components/admin/KeuanganChart";
import KeuanganTable from "../../components/admin/KeuanganTable";
import { requireAdminPage } from "../../lib/page-auth";
import { formatCurrency } from "../../lib/train-utils";

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

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

function buildApiUrl(path, params) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, value);
  }
  const qs = searchParams.toString();
  return qs ? `/api${path}?${qs}` : `/api${path}`;
}

export default function AdminLaporanKeuanganPage({
  dbError: ssrDbError,
  initialPeriod = "month",
  initialStartDate = "",
  initialEndDate = "",
  initialStatus = "all",
  initialSearch = "",
  initialPage = 1,
}) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [period, setPeriod] = useState(initialPeriod);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [dateFrom, setDateFrom] = useState(initialStartDate);
  const [dateTo, setDateTo] = useState(initialEndDate);
  const [dateError, setDateError] = useState("");

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ total_pendapatan: 0, total_transaksi: 0, total_tiket_terjual: 0 });
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [revenueByStatus, setRevenueByStatus] = useState({
    paid: { count: 0, revenue: 0 },
    pending: { count: 0, revenue: 0 },
    cancelled: { count: 0, revenue: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchTimerRef = useRef(null);

  const isCustomRange = period === "custom";

  useEffect(() => {
    const params = new URLSearchParams();
    if (isCustomRange) {
      params.set("period", "custom");
      params.set("start_date", startDate);
      params.set("end_date", endDate);
    } else if (period && period !== "month") {
      params.set("period", period);
    }
    if (status && status !== "all") params.set("status", status);
    if (searchQuery) params.set("search", searchQuery);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : "/admin/laporan-keuangan");
  }, [period, startDate, endDate, status, page, searchQuery, isCustomRange]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const actualPeriod = isCustomRange ? "custom" : period;
      const statusFilter = status !== "all" ? status : "";

      const [purchasesRes, summaryRes, revenueRes] = await Promise.all([
        fetch(buildApiUrl("/purchases", {
          page,
          perPage: PER_PAGE,
          period: actualPeriod,
          start_date: startDate,
          end_date: endDate,
          status: statusFilter,
          search: debouncedSearch || undefined,
        })),
        fetch(buildApiUrl("/purchases/summary", {
          period: actualPeriod,
          start_date: startDate,
          end_date: endDate,
          status: statusFilter || undefined,
        })),
        fetch(buildApiUrl("/purchases/revenue-by-status", {
          period: actualPeriod,
          start_date: startDate,
          end_date: endDate,
        })),
      ]);

      if (!purchasesRes.ok) throw new Error("Gagal memuat data transaksi");
      if (!summaryRes.ok) throw new Error("Gagal memuat ringkasan");
      if (!revenueRes.ok) throw new Error("Gagal memuat data pendapatan");

      const purchasesData = await purchasesRes.json();
      const summaryData = await summaryRes.json();
      const revenueData = await revenueRes.json();

      setData(purchasesData.purchases || []);
      setTotal(purchasesData.total || 0);
      setTotalPages(purchasesData.totalPages || 1);
      setSummary(summaryData || { total_pendapatan: 0, total_transaksi: 0, total_tiket_terjual: 0 });
      setDailyBreakdown(summaryData.dailyBreakdown || []);
      setRevenueByStatus(revenueData || {
        paid: { count: 0, revenue: 0 },
        pending: { count: 0, revenue: 0 },
        cancelled: { count: 0, revenue: 0 },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate, status, page, debouncedSearch, isCustomRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
    setStartDate("");
    setEndDate("");
    setPage(1);
  }, []);

  const handleCustomDateSubmit = useCallback((e) => {
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
    setPeriod("custom");
    setStartDate(dateFrom);
    setEndDate(dateTo);
    setPage(1);
  }, [dateFrom, dateTo]);

  const handleStatusChange = useCallback((newStatus) => {
    setStatus(newStatus);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const statusCounts = useMemo(() => ({
    paid: revenueByStatus.paid?.count || 0,
    pending: revenueByStatus.pending?.count || 0,
    cancelled: revenueByStatus.cancelled?.count || 0,
  }), [revenueByStatus]);

  const metricItems = useMemo(() => [
    {
      label: "Total Pendapatan",
      value: loading ? "..." : formatCurrency(summary.total_pendapatan || 0),
      helper: isCustomRange
        ? `${formatDate(startDate)} – ${formatDate(endDate)}`
        : PERIOD_LABELS[period] || "Semua waktu",
      tone: "brand",
    },
    {
      label: "Total Transaksi",
      value: loading ? "..." : summary.total_transaksi || 0,
      helper: "Pemesanan tiket",
      tone: "success",
    },
    {
      label: "Tiket Terjual",
      value: loading ? "..." : summary.total_tiket_terjual || 0,
      helper: "Total tiket",
      tone: "navy",
    },
    {
      label: "Rata-rata per Transaksi",
      value: loading
        ? "..."
        : formatCurrency(
            (summary.total_transaksi || 0)
              ? Math.round((summary.total_pendapatan || 0) / (summary.total_transaksi || 1))
              : 0,
          ),
      helper: "Nilai transaksi rata-rata",
      tone: "danger",
    },
  ], [loading, summary, isCustomRange, startDate, endDate, period]);

  const statusRevenueItems = useMemo(() => [
    {
      label: "Pendapatan Lunas",
      value: loading ? "..." : formatCurrency(revenueByStatus?.paid?.revenue || 0),
      helper: `${revenueByStatus?.paid?.count || 0} transaksi — Pembayaran selesai`,
      tone: "success",
    },
    {
      label: "Pendapatan Menunggu",
      value: loading ? "..." : formatCurrency(revenueByStatus?.pending?.revenue || 0),
      helper: `${revenueByStatus?.pending?.count || 0} transaksi — Belum dibayar`,
      tone: "warning",
    },
    {
      label: "Pendapatan Dibatalkan",
      value: loading ? "..." : formatCurrency(revenueByStatus?.cancelled?.revenue || 0),
      helper: `${revenueByStatus?.cancelled?.count || 0} transaksi — Transaksi batal`,
      tone: "danger",
    },
  ], [loading, revenueByStatus]);

  const statusBreakdown = useMemo(() => [
    { key: "paid", count: statusCounts?.paid ?? 0, label: "Lunas", color: "bg-emerald-500" },
    { key: "pending", count: statusCounts?.pending ?? 0, label: "Menunggu Pembayaran", color: "bg-amber-500" },
    { key: "cancelled", count: statusCounts?.cancelled ?? 0, label: "Dibatalkan", color: "bg-red-500" },
  ], [statusCounts]);

  const totalStatusCount = useMemo(() =>
    statusBreakdown.reduce((sum, s) => sum + s.count, 0),
  [statusBreakdown]);

  const buildPageHref = useMemo(
    () => (targetPage) => {
      const params = new URLSearchParams();
      if (isCustomRange) {
        params.set("period", "custom");
        params.set("start_date", startDate);
        params.set("end_date", endDate);
      } else if (period && period !== "all") {
        params.set("period", period);
      }
      if (status !== "all") params.set("status", status);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", String(targetPage));
      return `/admin/laporan-keuangan?${params.toString()}`;
    },
    [period, startDate, endDate, isCustomRange, status, searchQuery],
  );

  const paginationElement = useMemo(() =>
    totalPages > 1 ? (
      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    ) : null,
  [page, totalPages, buildPageHref]);

  return (
    <AdminLayout
      title="Laporan Keuangan"
      description="Pantau pendapatan, jumlah transaksi, dan tiket terjual berdasarkan periode dan status pembayaran."
      activePage="laporan-keuangan"
    >
      {error && <DbError message={error} />}
      {ssrDbError && <DbError message={ssrDbError} />}

      {loading && data.length === 0 && (
        <div className="metrics-grid admin-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <article key={i} className="stat-card">
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </article>
          ))}
        </div>
      )}

      {(summary.total_pendapatan > 0 || !loading) && (
        <>
          <MetricGrid items={metricItems} className="admin-stats-grid" />
          <MetricGrid items={statusRevenueItems} className="admin-stats-grid" />
        </>
      )}

      {totalStatusCount > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-5">
          {statusBreakdown.map((s) => (
            <button
              key={s.key}
              onClick={() => handleStatusChange(s.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                status === s.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span>{s.label}</span>
              <span className={status === s.key ? "text-white/70" : "text-slate-400"}>({s.count})</span>
            </button>
          ))}
          {status !== "all" && (
            <button
              onClick={() => handleStatusChange("all")}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2 cursor-pointer"
            >
              Reset filter status
            </button>
          )}
        </div>
      )}

      <div className="filters-card admin-filters-card">
        <div className="filters-shell">
          <div className="filter-actions">
            <div className="period-tabs">
              {periodTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handlePeriodChange(tab.key)}
                  className={`period-tab cursor-pointer ${!isCustomRange && period === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                </button>
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

          {isCustomRange && startDate && endDate && (
            <div className="active-filter-chip">
              <span>Rentang kustom: <strong>{formatDate(startDate)}</strong> — <strong>{formatDate(endDate)}</strong></span>
              <button
                onClick={() => handlePeriodChange("all")}
                className="btn btn-muted"
                style={{ minHeight: 32, padding: "0 12px", fontSize: "0.82rem" }}
              >
                Reset
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <Filter size={14} className="text-slate-400 flex-shrink-0" />
            {statusTabs.map((tab) => {
              const isActive = status === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleStatusChange(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <KeuanganChart data={dailyBreakdown} />

      <KeuanganTable
        data={data}
        total={total}
        page={page}
        perPage={PER_PAGE}
        status={status}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        pagination={paginationElement}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const redirect = requireAdminPage(context);
  if (redirect) return redirect;

  return {
    props: {
      dbError: null,
      initialPeriod: context.query.period || "month",
      initialStartDate: context.query.start_date || "",
      initialEndDate: context.query.end_date || "",
      initialStatus: context.query.status || "all",
      initialSearch: context.query.search || "",
      initialPage: Math.max(1, Number(context.query.page) || 1),
    },
  };
}
