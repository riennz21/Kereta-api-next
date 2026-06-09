import Link from "next/link";
import Pagination from "../components/public/Pagination";
import PublicLayout from "../components/public/PublicLayout";
import BookingForm from "../components/public/BookingForm";
import PopularRoutes from "../components/public/PopularRoutes";
import RecommendedTrain from "../components/public/RecommendedTrain";
import StatusBadge from "../components/StatusBadge";
import TrainClassBadge from "../components/TrainClassBadge";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { getDashboardSummary } from "../lib/db";
import { buildQueryString } from "../lib/query-string";
import {
  formatCurrency,
  getFiltersFromQuery,
  getImageUrl,
  getPublicPagination,
  hasActiveFilters,
} from "../lib/train-utils";

const USER_NAME = "Sena";

export default function DashboardPage({ filters, summary }) {
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

  return (
    <PublicLayout title="Beranda">
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
                  summary.total
                    ? `Menampilkan ${summary.startIndex} - ${summary.endIndex} dari ${summary.total} tiket.`
                    : "Belum ada tiket yang cocok dengan pencarian Anda."
                }
                meta={[`Halaman ${summary.page} dari ${summary.totalPages}`]}
              />

              {summary.trains.length ? (
                <>
                  <div className="ticket-list">
                    {summary.trains.map((train, index) => (
                      <article key={train.id} className="ticket-card">
                        <div className="ticket-index">#{summary.startIndex + index}</div>
                        {train.gambar ? (
                          <img className="ticket-thumb" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} />
                        ) : (
                          <div className="ticket-thumb preview-empty">Tidak ada gambar</div>
                        )}
                        <div className="ticket-main">
                          <h3>{train.nama}</h3>
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
                          <div className="inline-actions">
                            <TrainClassBadge trainClass={train.kelas} />
                            <StatusBadge status={train.status} />
                          </div>
                        </div>
                        <div className="ticket-side">
                          <div className="ticket-price">{formatCurrency(train.harga)}</div>
                          <Link
                            href={`/checkout/${train.id}`}
                            className={`btn ${train.status === "On Time" ? "btn-primary btn-cta" : "btn-muted"}`}
                          >
                            {train.status === "On Time" ? "Pesan Sekarang" : "Lihat Detail"}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  <Pagination
                    page={summary.page}
                    totalPages={summary.totalPages}
                    buildHref={(page) => `/?${buildQueryString(queryValues, { page })}`}
                  />
                </>
              ) : (
                <EmptyState
                  title="Tiket tidak ditemukan"
                  description="Coba ubah stasiun, tanggal, atau filter pencarian untuk melihat perjalanan yang tersedia."
                  action={
                    hasActiveFilters(filters) ? (
                      <Link href="/" className="btn btn-primary">
                        Reset Pencarian
                      </Link>
                    ) : null
                  }
                />
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

  return {
    props: {
      filters,
      summary,
    },
  };
}
