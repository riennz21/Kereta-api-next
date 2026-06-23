import { useState, useEffect } from "react";
import Link from "next/link";
import { Train, MapPin, Calendar, AlertTriangle, Search, Clock, Sparkles, ArrowRightLeft, Shield, Leaf, TrendingUp } from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import RecommendedTrain from "../components/public/RecommendedTrain";
import StatusBadge from "../components/StatusBadge";
import TrainClassBadge from "../components/TrainClassBadge";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import Notification from "../components/ui/Notification";
import { getDashboardSummary, getAllTrains } from "../lib/db";
import { buildQueryString } from "../lib/query-string";
import {
  formatCurrency,
  getFiltersFromQuery,
  getImageUrl,
  getPublicPagination,
  hasActiveFilters,
} from "../lib/train-utils";
import { STATIONS } from "../lib/constants";

const USER_NAME = "riee";

const POPULAR_ROUTES = [
  { asal: "Surabaya", tujuan: "Malang", label: "Surabaya → Malang" },
  { asal: "Surabaya", tujuan: "Banyuwangi", label: "Surabaya → Banyuwangi" },
  { asal: "Malang", tujuan: "Surabaya", label: "Malang → Surabaya" },
  { asal: "Banyuwangi", tujuan: "Jember", label: "Banyuwangi → Jember" },
  { asal: "Jember", tujuan: "Surabaya", label: "Jember → Surabaya" },
  { asal: "Bandung", tujuan: "Jakarta", label: "Bandung → Jakarta" },
];

const CLASS_MAP = { economy: "Ekonomi", first: "Eksekutif" };

export default function DashboardPage({ filters, summary, allTrains }) {
  const today = new Date().toISOString().split("T")[0];
  const [fromId, setFromId] = useState(filters.asal || "");
  const [toId, setToId] = useState(filters.tujuan || "");
  const [date, setDate] = useState(filters.tanggal || today);
  const [travelClass, setTravelClass] = useState(filters.kelas === "Eksekutif" ? "first" : "economy");

  const swapStations = () => {
    const a = fromId;
    setFromId(toId);
    setToId(a);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!fromId || !toId) return;
    const params = new URLSearchParams();
    if (fromId) params.set("asal", fromId);
    if (toId) params.set("tujuan", toId);
    if (date) params.set("tanggal", date);
    params.set("kelas", CLASS_MAP[travelClass]);
    window.location.href = `/?${params.toString()}#tickets`;
  };

  const queryValues = {
    asal: filters.asal,
    tujuan: filters.tujuan,
    tanggal: filters.tanggal,
    kelas: filters.kelas,
    search: filters.search,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
  };
  const featuredTrain = summary.trains[0] || null;

  const [searchValidation, setSearchValidation] = useState({ show: false, message: "" });
  const [notification, setNotification] = useState({ show: false, type: "success", title: "", description: "" });
  const [clientLoading, setClientLoading] = useState(false);
  const [clientData, setClientData] = useState(summary);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.validationError) {
        setSearchValidation({ show: true, message: e.detail.validationError });
        setTimeout(() => setSearchValidation({ show: false, message: "" }), 4000);
      }
    };
    window.addEventListener("booking-search", handler);
    return () => window.removeEventListener("booking-search", handler);
  }, []);

  useEffect(() => {
    const hasFilters = filters.asal || filters.tujuan || filters.tanggal || filters.kelas;
    if (hasFilters && typeof window !== "undefined") {
      setClientLoading(true);
      const fetchFiltered = async () => {
        try {
          const res = await fetch(`/api/trains?${buildQueryString(queryValues)}`);
          const data = await res.json();
          setClientData({
            ...summary,
            trains: data.rows || [],
            total: data.total || 0,
          });
        } catch {
          setClientData(summary);
        } finally {
          setClientLoading(false);
        }
      };
      fetchFiltered();
    }
  }, [filters.asal, filters.tujuan, filters.tanggal, filters.kelas]);

  const displayData = clientData;
  const trains = displayData.trains || [];
  const total = displayData.total || 0;

  const isCancelled = (status) => status === "Dibatalkan";

  const stats = [
    { icon: Train, label: "Total Kereta", value: displayData.stats?.total || 0, color: "text-indigo-600" },
    { icon: Clock, label: "Tepat Waktu", value: displayData.stats?.on_time || 0, color: "text-emerald-600" },
    { icon: AlertTriangle, label: "Delay", value: displayData.stats?.delay || 0, color: "text-amber-600" },
  ];

  return (
    <PublicLayout title="Beranda">
      <Notification
        type={notification.type}
        title={notification.title}
        description={notification.description}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {searchValidation.show && (
        <div role="alert" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[480px] w-[calc(100%-24px)] animate-slide-in">
          <div className="bg-gradient-to-r from-red-50 to-red-50/80 rounded-2xl p-4 border border-red-200 shadow-lg flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-red-800">Validasi Gagal</div>
              <div className="text-xs text-red-600 mt-0.5">{searchValidation.message}</div>
            </div>
            <button
              onClick={() => setSearchValidation({ show: false, message: "" })}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors"
            >
              <span className="text-current opacity-50 text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* HERO - full viewport width */}
      <div
        className="overflow-hidden -mt-5 sm:-mt-6"
        style={{
          width: '100vw',
          marginLeft: 'calc(-1 * (100vw - 100%) / 2)',
        }}
      >
        <section className="relative bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="rails" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M0 30 H60" stroke="white" strokeWidth="0.5" opacity="0.3" />
                  <path d="M0 0 V60 M20 0 V60 M40 0 V60 M60 0 V60" stroke="white" strokeWidth="0.3" opacity="0.2" />
                </pattern>
              </defs>
              <rect width="1200" height="600" fill="url(#rails)" />
            </svg>
          </div>
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 sm:pt-24 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3 w-3" /> Platform pemesanan tiket
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Halo, {USER_NAME}!<br />
                <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  Mau pergi ke mana hari ini?
                </span>
              </h1>
              <p className="mt-5 text-lg text-blue-100 sm:text-xl">
                Pesan tiket kereta dengan mudah. Pilih rute favorit, atur jadwal, dan nikmati perjalanan Anda.
              </p>
            </div>

            {/* SEARCH FORM */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-4 text-slate-900 shadow-2xl shadow-blue-950/40 sm:p-6"
            >
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                <div className="ml-auto flex gap-1 rounded-full bg-slate-100 p-1">
                  {(["economy", "first"]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTravelClass(c)}
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                        travelClass === c
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      {c === "economy" ? "Ekonomi" : "Eksekutif"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 items-end gap-3 md:grid-cols-12">
                <div className="md:col-span-4">
                  <label htmlFor="from-station" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dari
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="from-station"
                      value={fromId}
                      onChange={(e) => setFromId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pr-3 pl-10 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                    >
                      <option value="">Pilih stasiun asal</option>
                      {STATIONS.filter((s) => s !== toId).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-center md:col-span-1">
                  <button
                    type="button"
                    onClick={swapStations}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    aria-label="Tukar stasiun"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </button>
                </div>

                <div className="md:col-span-4">
                  <label htmlFor="to-station" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tujuan
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="to-station"
                      value={toId}
                      onChange={(e) => setToId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pr-3 pl-10 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                    >
                      <option value="">Pilih stasiun tujuan</option>
                      {STATIONS.filter((s) => s !== fromId).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label htmlFor="travel-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tanggal
                  </label>
                  <div className="relative">
                    <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="travel-date"
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pr-3 pl-10 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-200 transition hover:from-amber-500 hover:to-amber-600 active:scale-[0.98]"
                  >
                    <Search className="h-4 w-4" />
                    Cari
                  </button>
                </div>
              </div>
            </form>

            {/* TRUST BAR */}
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Shield, label: "Pembatalan Bebas", sub: "hingga 24 jam sebelumnya" },
                { icon: Clock, label: "E-Tiket Instan", sub: "langsung ke ponsel Anda" },
                { icon: Leaf, label: "Ramah Lingkungan", sub: "bepergian lebih hijau" },
                { icon: TrendingUp, label: "Harga Terbaik", sub: "dijamin" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/20">
                      <Icon className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-blue-200">{item.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Stats Row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <div>
                  <div className={`text-xl font-bold font-display ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Booking Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16" id="booking-card">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {/* Popular Routes */}
            <div className="mb-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rute Populer</h2>
                  <p className="mt-1 text-sm text-slate-600">Pilih rute favorit untuk pencarian cepat.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {POPULAR_ROUTES.map((route) => (
                  <button
                    key={route.label}
                    onClick={() => {
                      setFromId(route.asal);
                      setToId(route.tujuan);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-transparent opacity-60 blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                          {route.asal[0]}
                        </div>
                        <div className="h-px flex-1 bg-dotted border-t-2 border-dashed border-slate-200" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700">
                          {route.tujuan[0]}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{route.label}</span>
                        <span className="text-sm font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">
                          &rarr;
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Results */}
            <section id="tickets">
              {hasActiveFilters(filters) ? (
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {filters.asal} {filters.tujuan ? `→ ${filters.tujuan}` : ""}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    {filters.tanggal ? `${filters.tanggal}` : ""}
                    {filters.kelas ? ` · ${filters.kelas}` : ""}
                    {total ? ` · ${total} tiket tersedia` : ""}
                  </p>
                </div>
              ) : (
                <PageHeader
                  compact
                  eyebrow="Daftar perjalanan"
                  title="Tiket Kereta Tersedia"
                  description={
                    total
                      ? `Menampilkan ${displayData.startIndex || 1} - ${displayData.endIndex || total} dari ${total} tiket.`
                      : "Gunakan form pencarian untuk mencari tiket kereta."
                  }
                  meta={total ? [`Halaman ${displayData.page || 1} dari ${displayData.totalPages || 1}`] : []}
                />
              )}

              {clientLoading && (
                <LoadingState title="Mencari tiket..." description="Sedang memuat data perjalanan yang tersedia." />
              )}

              {!clientLoading && !trains.length && !hasActiveFilters(filters) && (
                <EmptyState
                  title="Belum Ada Tiket Tersedia"
                  description="Gunakan form pencarian di atas untuk mencari tiket kereta yang tersedia. Pilih stasiun asal, tujuan, dan tanggal keberangkatan."
                  action={
                    <Link href="/jadwal" className="btn btn-primary">
                      Lihat Jadwal Lengkap
                    </Link>
                  }
                />
              )}

              {!clientLoading && !trains.length && hasActiveFilters(filters) && (
                <EmptyState
                  title="Tiket Tidak Ditemukan"
                  description="Tidak ada tiket yang cocok dengan filter pencarian Anda. Coba ubah stasiun, tanggal, atau hapus filter untuk melihat lebih banyak pilihan."
                  action={
                    <Link href="/" className="btn btn-primary">
                      Reset Pencarian
                    </Link>
                  }
                />
              )}

              {!clientLoading && trains.length > 0 && (
                <>
                  <div className="space-y-4">
                    {trains.map((train, index) => (
                      <article
                        key={train.id}
                        className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 ${
                          isCancelled(train.status) ? "opacity-75" : ""
                        }`}
                      >
                        <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                {train.nama}
                              </span>
                              <TrainClassBadge trainClass={train.kelas} />
                              <StatusBadge status={train.status} />
                              {isCancelled(train.status) && (
                                <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                                  <AlertTriangle size={10} className="inline mr-0.5" />
                                  DIBATALKAN
                                </span>
                              )}
                            </div>

                            <div className="mt-4 flex items-center gap-4">
                              <div>
                                <div className="text-2xl font-bold text-slate-900">{train.jam || "--:--"}</div>
                                <div className="text-xs font-medium text-slate-500">{train.asal}</div>
                              </div>
                              <div className="flex flex-1 items-center gap-2">
                                <div className="h-2 w-2 rounded-full border-2 border-indigo-400 bg-white" />
                                <div className="relative h-px flex-1 bg-gradient-to-r from-indigo-300 to-indigo-400">
                                  <Clock className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-white text-indigo-500" />
                                </div>
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900">{train.jam || "--:--"}</div>
                                <div className="text-xs font-medium text-slate-500">{train.tujuan}</div>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {train.tanggal}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500 line-clamp-1">
                                {train.deskripsi || "Tiket kereta tersedia"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 md:border-l md:border-slate-100 md:pl-6">
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Harga mulai</div>
                              <div className="text-2xl font-bold text-slate-900">{formatCurrency(train.harga)}</div>
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

                  {/* Pagination */}
                  {displayData.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      {displayData.page > 1 && (
                        <Link
                          href={`/?${buildQueryString(queryValues, { page: displayData.page - 1 })}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          Sebelumnya
                        </Link>
                      )}
                      {Array.from({ length: displayData.totalPages }, (_, i) => i + 1).map((p) => (
                        <Link
                          key={p}
                          href={`/?${buildQueryString(queryValues, { page: p })}`}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                            p === displayData.page
                              ? "bg-indigo-600 text-white shadow-md"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                          }`}
                        >
                          {p}
                        </Link>
                      ))}
                      {displayData.page < displayData.totalPages && (
                        <Link
                          href={`/?${buildQueryString(queryValues, { page: displayData.page + 1 })}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          Berikutnya
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Right Sidebar - Recommendation */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <RecommendedTrain train={featuredTrain} />
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

export async function getServerSideProps(context) {
  const filters = getFiltersFromQuery(context.query);
  const pagination = getPublicPagination(context.query);
  const summary = await getDashboardSummary(filters, pagination);
  const allTrains = await getAllTrains();

  return {
    props: {
      filters,
      summary,
      allTrains,
    },
  };
}
