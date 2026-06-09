import Link from "next/link";
import Pagination from "../components/public/Pagination";
import PublicLayout from "../components/public/PublicLayout";
import TrainFilters from "../components/public/TrainFilters";
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
      {/* Search form — above the fold */}
      <TrainFilters action="/" filters={filters} showReset={hasActiveFilters(filters)} resetHref="/" />

      <section className="hero">
        <div className="hero-panel hero-primary">
          <span className="page-kicker">Platform pemesanan tiket</span>
          <h1 className="page-title">Pesan tiket kereta cepat, mudah, dan nyaman.</h1>
          <p className="hero-description">
            Temukan & pesan tiket kereta dari berbagai rute favorit. Pilih stasiun asal, tujuan,
            dan tanggal keberangkatan untuk memulai perjalanan Anda.
          </p>
          <div className="hero-pills">
            <span>{summary.total} kereta tersedia</span>
            <span>Rute: {summary.stations?.join(", ")}</span>
            <span>Kelas Ekonomi, Bisnis & Eksekutif</span>
          </div>
          <div className="hero-actions">
            <a href="#tickets" className="btn btn-primary">
              Lihat Tiket Tersedia
            </a>
            <Link href="/jadwal" className="btn btn-outline">
              Cek Jadwal
            </Link>
          </div>
        </div>

        {featuredTrain ? (
          <aside className="hero-card">
            <div className="hero-card-header">
              <h3>Rekomendasi Perjalanan</h3>
              <p className="muted">Kereta pilihan yang siap menemani perjalanan Anda.</p>
            </div>

            <div className="hero-feature">
              {featuredTrain.gambar ? (
                <img
                  className="hero-feature-image"
                  src={getImageUrl(featuredTrain.gambar)}
                  alt={`Foto ${featuredTrain.nama}`}
                />
              ) : (
                <div className="hero-feature-image preview-empty">Tidak ada gambar</div>
              )}
              <div className="hero-feature-copy">
                <div className="stack-sm">
                  <span className="page-kicker">Pilihan Terbaik</span>
                  <h4>{featuredTrain.nama}</h4>
                  <p>{featuredTrain.deskripsi || "Kereta dengan rute favorit yang siap Anda pesan."}</p>
                </div>
                <div className="stack-sm">
                  <span className="ticket-route">
                    {featuredTrain.asal} - {featuredTrain.tujuan}
                  </span>
                  <div className="inline-actions">
                    <TrainClassBadge trainClass={featuredTrain.kelas} />
                    <StatusBadge status={featuredTrain.status} />
                  </div>
                  <strong>{formatCurrency(featuredTrain.harga)}</strong>
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </section>

      <section id="tickets" className="stack-md">
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
