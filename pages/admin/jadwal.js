import AdminLayout from "../../components/admin/AdminLayout";
import EmptyState from "../../components/ui/EmptyState";
import MetricGrid from "../../components/ui/MetricGrid";
import { getScheduleRows } from "../../lib/db";
import { requireAdminPage } from "../../lib/page-auth";

export default function AdminJadwalPage({ data }) {
  const uniqueTrains = new Set(data.map((row) => row.nama)).size;
  const metricItems = [
    { label: "Total Jadwal", value: data.length, helper: "Baris jadwal aktif", tone: "brand" },
    { label: "Kereta Tercatat", value: uniqueTrains, helper: "Nama kereta unik" },
  ];

  return (
    <AdminLayout
      title="Jadwal Kereta"
      description="Periksa daftar keberangkatan untuk memastikan tanggal dan jam perjalanan dengan benar."
      activePage="jadwal"
    >
      <MetricGrid items={metricItems} className="admin-stats-grid" />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Daftar Jadwal Admin</h2>
              <p>Gunakan tabel ini untuk validasi cepat terhadap jadwal perjalanan yang sedang aktif.</p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Kereta</th>
                <th>Tanggal</th>
                <th>Jam</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={`${row.nama}-${index}`}>
                  <td>{row.nama}</td>
                  <td>{row.tanggal}</td>
                  <td>{row.jam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Belum ada jadwal aktif"
          description="Jadwal kereta akan tampil di sini setelah data kereta memiliki tanggal dan jam perjalanan."
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

  return {
    props: {
      data: await getScheduleRows(),
    },
  };
}
