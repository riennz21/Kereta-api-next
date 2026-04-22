import Link from "next/link";
import Pagination from "../components/public/Pagination";
import PublicLayout from "../components/public/PublicLayout";
import TrainFilters from "../components/public/TrainFilters";
import StatusBadge from "../components/StatusBadge";
import TrainClassBadge from "../components/TrainClassBadge";
import EmptyState from "../components/ui/EmptyState";
import MetricGrid from "../components/ui/MetricGrid";
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
    search: filters.search,
    kelas: filters.kelas,
    status: filters.status,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
  };
  const featuredTrain = summary.trains[0] || null;
  const dashboardMetrics = [
    { label: "Total Kereta", value: summary.total, helper: "Pilihan aktif saat ini", tone: "brand" },
    { label: "On Time", value: summary.ontime, helper: "Perjalanan tepat waktu", tone: "success" },
    { label: "Delay", value: summary.delay, helper: "Perlu perhatian ekstra", tone: "danger" },
    { label: "Dibatalkan", value: summary.dibatalkan, helper: "Status pembatalan", tone: "navy" },
  ];

  return (
    <PublicLayout title="Dashboard">
      <section className="hero">
        <div className="hero-panel hero-primary">
          <span className="page-kicker">Platform perjalanan kereta</span>
          <h1 className="page-title">Pesan tiket kereta yang lebih cepat, rapi, dan nyaman.</h1>
          <p className="hero-description">
            Jelajahi pilihan tiket dari berbagai rute favorit, lihat detail jadwal, dan pilih kelas
            perjalanan yang sesuai. Semua informasi tersedia dalam satu dashboard yang mudah dipindai,
            tanpa proses transaksi nyata.
          </p>
          <div className="hero-pills">
            <span>Rute populer</span>
            <span>Filter harga dan status</span>
            <span>Ringkasan operasional harian</span>
          </div>
          <div className="hero-actions">
            <a href="#tickets" className="btn btn-primary">
              Jelajahi Tiket
            </a>
            <Link href="/jadwal" className="btn btn-outline">
              Cek Jadwal
            </Link>
            <Link href="/kereta" className="btn btn-muted">
              Lihat Data Lengkap
            </Link>
          </div>
        </div>

        <aside className="hero-card">
          <div className="hero-card-header">
            <h3>Ringkasan Hari Ini</h3>
            <p className="muted">Pantau performa kereta sebelum memilih jadwal perjalanan.</p>
          </div>

          <MetricGrid items={dashboardMetrics} />

          {featuredTrain ? (
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
                  <span className="page-kicker">Pilihan Terbaru</span>
                  <h4>{featuredTrain.nama}</h4>
                  <p>{featuredTrain.deskripsi || "Kereta pilihan dengan rute yang siap Anda cek lebih lanjut."}</p>
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
          ) : null}
        </aside>
      </section>

      <TrainFilters action="/" filters={filters} showReset={hasActiveFilters(filters)} resetHref="/" />

      <section id="tickets" className="stack-md">
        <PageHeader
          compact
          eyebrow="Pilihan perjalanan"
          title="Daftar Tiket Tersedia"
          description={
            summary.total
              ? `Menampilkan ${summary.startIndex} - ${summary.endIndex} dari ${summary.total} tiket dengan filter yang sedang aktif.`
              : "Belum ada tiket yang cocok dengan filter saat ini."
          }
          meta={[`Halaman ${summary.page} dari ${summary.totalPages}`, `${summary.ontime} kereta on time`]}
          actions={
            <Link href="/kereta" className="btn btn-outline">
              Buka Tabel Data
            </Link>
          }
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
                      <span>Rute: {train.asal} - {train.tujuan}</span>
                      <span>
                        Jadwal: {train.tanggal} {train.jam}
                      </span>
                      <span>Kelas: {train.kelas}</span>
                      <span>Status: {train.status}</span>
                    </div>
                  </div>
                  <div className="ticket-side">
                    <StatusBadge status={train.status} />
                    <div className="ticket-price">{formatCurrency(train.harga)}</div>
                    <Link href={`/checkout/${train.id}`} className="btn btn-primary">
                      Checkout
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
            title="Belum ada tiket yang cocok"
            description="Coba ubah filter pencarian atau reset kembali untuk melihat semua perjalanan yang tersedia."
            action={
              hasActiveFilters(filters) ? (
                <Link href="/" className="btn btn-primary">
                  Reset Filter
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
