import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTrainFilters from "../../components/admin/AdminTrainFilters";
import Pagination from "../../components/public/Pagination";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import EmptyState from "../../components/ui/EmptyState";
import MetricGrid from "../../components/ui/MetricGrid";
import { getAdminKeretaSummary } from "../../lib/db";
import { requireAdminPage } from "../../lib/page-auth";
import { buildQueryString } from "../../lib/query-string";
import {
  formatCurrency,
  getAdminPagination,
  getFiltersFromQuery,
  getImageUrl,
  hasActiveFilters,
} from "../../lib/train-utils";

export default function AdminKeretaPage({ data, filters, summary, error }) {
  const queryValues = {
    search: filters.search,
    kelas: filters.kelas,
    status: filters.status,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
  };
  const metricItems = [
    { label: "Total Data", value: summary.total, helper: "Seluruh data kereta aktif", tone: "brand" },
    { label: "Halaman Aktif", value: summary.page, helper: `Dari ${summary.totalPages} halaman` },
    { label: "On Time", value: summary.stats.on_time, helper: "Data di halaman ini", tone: "success" },
    { label: "Delay", value: summary.stats.delay, helper: "Perjalanan yang perlu dicek", tone: "danger" },
  ];

  return (
    <AdminLayout
      title="Data Kereta"
      description="Kelola seluruh katalog kereta, harga, jadwal, kelas, dan status perjalanan dari satu tabel manajemen."
      activePage="kereta"
      topbarAction={
        <Link href="/admin/tambah" className="btn btn-primary">
          + Tambah Kereta
        </Link>
      }
    >
      {error ? <div className="alert alert-error">{error}</div> : null}

      <MetricGrid items={metricItems} className="admin-stats-grid" />

      <AdminTrainFilters
        action="/admin/kereta"
        filters={filters}
        showReset={hasActiveFilters(filters)}
        resetHref="/admin/kereta"
      />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Manajemen Kereta</h2>
              <p>
                {summary.total > 0
                  ? `Menampilkan ${summary.startIndex}-${summary.endIndex} dari ${summary.total} data untuk tindakan cepat dan akurat.`
                  : "Tidak ada data kereta yang tersedia."}
              </p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Kereta</th>
                <th>Rute</th>
                <th>Kelas</th>
                <th>Jadwal</th>
                <th>Status</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((train) => (
                <tr key={train.id}>
                  <td>
                    {train.gambar ? (
                      <img loading="lazy" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} className="table-image" />
                    ) : (
                      <div className="table-image preview-empty">-</div>
                    )}
                  </td>
                  <td>
                    <span className="table-title">{train.nama}</span>
                    <span className="table-subtitle">{train.deskripsi || "Deskripsi belum tersedia."}</span>
                  </td>
                  <td>
                    {train.asal} - {train.tujuan}
                  </td>
                  <td>
                    <TrainClassBadge trainClass={train.kelas} />
                  </td>
                  <td>
                    {train.tanggal}
                    <br />
                    {train.jam}
                  </td>
                  <td>
                    <StatusBadge status={train.status} />
                  </td>
                  <td>{formatCurrency(train.harga)}</td>
                  <td>
                    <div className="inline-actions">
                      <Link href={`/admin/edit/${train.id}`} className="btn btn-edit">
                        Edit
                      </Link>
                      <form
                        action={`/api/trains/${train.id}/delete`}
                        method="post"
                        className="compact-form"
                        onSubmit={(event) => {
                          if (!window.confirm("Hapus data?")) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <button type="submit" className="btn btn-delete">
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Belum ada kereta untuk dikelola"
          description="Tambahkan data kereta baru agar halaman ini menampilkan tabel dan pagination pengelolaan."
          action={
            <Link href="/admin/tambah" className="btn btn-primary">
              Tambah Kereta
            </Link>
          }
        />
      )}

      <Pagination
        page={summary.page}
        totalPages={summary.totalPages}
        buildHref={(page) => `/admin/kereta?${buildQueryString(queryValues, { page })}`}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const redirect = requireAdminPage(context);
  if (redirect) {
    return redirect;
  }

  const filters = getFiltersFromQuery(context.query);
  const pagination = getAdminPagination(context.query);
  const summary = await getAdminKeretaSummary(filters, pagination);

  return {
    props: {
      data: summary.data,
      filters,
      summary,
      error: context.query.error || "",
    },
  };
}
