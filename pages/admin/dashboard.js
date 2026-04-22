import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminTrainFilters from "../../components/admin/AdminTrainFilters";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import EmptyState from "../../components/ui/EmptyState";
import MetricGrid from "../../components/ui/MetricGrid";
import { getAllTrains } from "../../lib/db";
import { requireAdminPage } from "../../lib/page-auth";
import {
  computeClassCounts,
  computeStats,
  formatCurrency,
  getFiltersFromQuery,
  getImageUrl,
  hasActiveFilters,
} from "../../lib/train-utils";

export default function AdminDashboardPage({ data, filters, stats, classCounts }) {
  const statItems = [
    { label: "Total Kereta", value: stats.total, helper: "Data pada tampilan dashboard", tone: "brand" },
    { label: "On Time", value: stats.on_time, helper: "Perjalanan tepat waktu", tone: "success" },
    { label: "Delay", value: stats.delay, helper: "Perlu tindak lanjut", tone: "danger" },
    { label: "Dibatalkan", value: stats.dibatalkan, helper: "Status pembatalan aktif", tone: "navy" },
  ];
  const classItems = Object.entries(classCounts).map(([className, count]) => ({
    label: className,
    value: count,
    helper: "Jumlah kereta per kelas",
  }));

  return (
    <AdminLayout
      title="Dashboard Admin"
      description="Pantau data kereta, kelas layanan, serta kondisi operasional dalam satu ringkasan yang mudah dibaca."
      activePage="dashboard"
      topbarAction={
        <Link href="/admin/tambah" className="btn btn-primary">
          + Tambah Kereta
        </Link>
      }
    >
      <AdminTrainFilters
        action="/admin/dashboard"
        filters={filters}
        showReset={hasActiveFilters(filters)}
        resetHref="/admin/dashboard"
      />

      <MetricGrid items={statItems} className="admin-stats-grid" />
      {classItems.length ? <MetricGrid items={classItems} className="admin-stats-grid" /> : null}

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Snapshot Operasional</h2>
              <p>Gunakan daftar ini untuk memeriksa data kereta terbaru sebelum masuk ke pengelolaan detail.</p>
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
                      <img src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} className="table-image" />
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
          title="Belum ada data operasional"
          description="Mulai tambahkan kereta baru agar dashboard dapat menampilkan statistik dan tabel operasional."
          action={
            <Link href="/admin/tambah" className="btn btn-primary">
              Tambah Kereta
            </Link>
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

  const filters = getFiltersFromQuery(context.query);
  const data = await getAllTrains(filters);

  return {
    props: {
      data,
      filters,
      stats: computeStats(data),
      classCounts: computeClassCounts(data),
    },
  };
}
