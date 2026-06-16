import { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "../components/public/Pagination";
import PublicLayout from "../components/public/PublicLayout";
import BookingForm from "../components/public/BookingForm";
import PopularRoutes from "../components/public/PopularRoutes";
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
import { Train, MapPin, Calendar, Users, ArrowRight, AlertTriangle } from "lucide-react";

const USER_NAME = "riee";

export default function DashboardPage({ filters, summary, allTrains }) {
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

  // Search validation state
  const [searchValidation, setSearchValidation] = useState({ show: false, message: "" });

  // Notification state for booking
  const [notification, setNotification] = useState({ show: false, type: "success", title: "", description: "" });

  // Filter/loading states
  const [clientLoading, setClientLoading] = useState(false);
  const [clientData, setClientData] = useState(summary);

  // Listen for search events from BookingForm
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

  // Handle client-side search if filters change
  useEffect(() => {
    const hasFilters = filters.asal || filters.tujuan || filters.tanggal || filters.kelas;
    if (hasFilters && typeof window !== "undefined") {
      setClientLoading(true);
      // Simulate API call - in production this would be an actual fetch
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
          // Fall back to server data
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

  return (
    <PublicLayout title="Beranda">
      {/* Notification Toast */}
      <Notification
        type={notification.type}
        title={notification.title}
        description={notification.description}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Search Validation Alert */}
      {searchValidation.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[480px] w-[calc(100%-24px)] animate-slide-in">
          <div className="bg-gradient-to-r from-[#fef3f2] to-[#fff7f6] rounded-2xl p-4 border border-[rgba(215,76,60,0.16)] shadow-[0_12px_24px_rgba(15,39,67,0.12)] flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d74c3c]/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-[#d74c3c]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#b42318]">Validasi Gagal</div>
              <div className="text-xs text-[#b42318]/70 mt-0.5">{searchValidation.message}</div>
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

      {/* Hero Section */}
      <section className="hero-greeting">
        <div className="hero-greeting-text">
          <span className="page-kicker">Platform pemesanan tiket</span>
          <h1 className="hero-greeting-title">
            Halo, {USER_NAME}! <br />Mau pergi ke mana hari ini?
          </h1>
          <p className="hero-greeting-desc">
            Pesan tiket kereta dengan mudah. Pilih rute favorit, atur jadwal, dan nikmati perjalanan Anda.
          </p>
        </div>
      </section>

      {/* Main Booking Section */}
      <section className="booking-section" id="booking-card">
        <div className="booking-layout">
          <div className="booking-main">
            <BookingForm />

            <div className="stack-md" style={{ marginTop: 24 }}>
              <PopularRoutes />
            </div>

            {/* Ticket Results */}
            <section id="tickets" className="stack-md" style={{ marginTop: 32 }}>
              <PageHeader
                compact
                eyebrow="Daftar perjalanan"
                title="Tiket Kereta Tersedia"
                description={
                  total
                    ? `Menampilkan ${displayData.startIndex || 1} - ${displayData.endIndex || total} dari ${total} tiket.`
                    : hasActiveFilters(filters)
                      ? "Tidak ada tiket yang cocok dengan pencarian Anda."
                      : "Gunakan form pencarian untuk mencari tiket kereta."
                }
                meta={total ? [`Halaman ${displayData.page || 1} dari ${displayData.totalPages || 1}`] : []}
              />

              {/* Loading State */}
              {clientLoading && (
                <LoadingState
                  title="Mencari tiket..."
                  description="Sedang memuat data perjalanan yang tersedia."
                />
              )}

              {/* Empty State - No Results */}
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

              {/* Empty State - No Search Results */}
              {!clientLoading && !trains.length && hasActiveFilters(filters) && (
                <EmptyState
                  title="Tiket Tidak Ditemukan"
                  description={`Tidak ada tiket yang cocok dengan filter pencarian Anda. Coba ubah stasiun, tanggal, atau hapus filter untuk melihat lebih banyak pilihan.`}
                  action={
                    <Link href="/" className="btn btn-primary">
                      Reset Pencarian
                    </Link>
                  }
                />
              )}

              {/* Ticket Cards */}
              {!clientLoading && trains.length > 0 && (
                <>
                  <div className="ticket-list">
                    {trains.map((train, index) => (
                      <article key={train.id} className={`ticket-card ${isCancelled(train.status) ? "opacity-75" : ""}`}>
                        <div className="ticket-index">#{displayData.startIndex + index}</div>
                        {train.gambar ? (
                          <img className="ticket-thumb" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} />
                        ) : (
                          <div className="ticket-thumb preview-empty flex items-center justify-center text-[#98a2b3] text-sm">
                            <Train size={28} />
                          </div>
                        )}
                        <div className="ticket-main">
                          <div className="flex items-center gap-2">
                            <h3>{train.nama}</h3>
                            {isCancelled(train.status) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef3f2] text-[#b42318] text-[10px] font-bold border border-[rgba(215,76,60,0.14)]">
                                <AlertTriangle size={10} />
                                DIBATALKAN
                              </span>
                            )}
                          </div>
                          <p className="ticket-desc">{train.deskripsi || "Deskripsi belum tersedia."}</p>
                          <div className="ticket-meta">
                            <span>
                              <strong>Rute:</strong> {train.asal} - {train.tujuan}
                            </span>
                            <span>
                              <strong>Jadwal:</strong> {train.tanggal} {train.jam}
                            </span>
                            <span>
                              <strong>Kelas:</strong> {train.kelas}
                            </span>
                          </div>
                          <div className="inline-actions" style={{ marginTop: 4 }}>
                            <TrainClassBadge trainClass={train.kelas} />
                            <StatusBadge status={train.status} />
                          </div>
                        </div>
                        <div className="ticket-side">
                          <div className="ticket-price">{formatCurrency(train.harga)}</div>
                          {isCancelled(train.status) ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f4f5f7] text-[#475467] text-xs font-bold border border-[rgba(102,112,133,0.14)] cursor-not-allowed">
                              <AlertTriangle size={14} />
                              Tidak Tersedia
                            </span>
                          ) : (
                            <Link
                              href={`/checkout/${train.id}`}
                              className="btn btn-primary btn-cta"
                              style={{ fontSize: "0.9rem", minHeight: 44, padding: "0 20px" }}
                            >
                              Pesan Sekarang
                              <ArrowRight size={16} />
                            </Link>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  <Pagination
                    page={displayData.page || summary.page}
                    totalPages={displayData.totalPages || summary.totalPages}
                    buildHref={(page) => `/?${buildQueryString(queryValues, { page })}`}
                  />
                </>
              )}
            </section>
          </div>

          {/* Right Sidebar - Recommendation */}
          <aside className="booking-sidebar">
            <RecommendedTrain train={featuredTrain} />
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
