import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import DbError, { getDbErrorMessage } from "../../components/ui/DbError";
import MetricGrid from "../../components/ui/MetricGrid";
import { getStatusRows } from "../../lib/db";
import { requireAdminPage } from "../../lib/page-auth";

export default function AdminStatusPage({ data, dbError }) {
  const onTime = data.filter((row) => row.status === "On Time").length;
  const delay = data.filter((row) => row.status === "Delay").length;
  const cancelled = data.filter((row) => row.status === "Dibatalkan").length;
  const metricItems = [
    { label: "Total Status", value: data.length, helper: "Kereta dengan status aktif", tone: "brand" },
    { label: "On Time", value: onTime, helper: "Perjalanan stabil", tone: "success" },
    { label: "Delay / Batal", value: `${delay} / ${cancelled}`, helper: "Butuh komunikasi ke pengguna", tone: "danger" },
  ];

  return (
    <AdminLayout
      title="Status Perjalanan"
      description="Monitor status operasional untuk mengetahui kondisi kereta yang berjalan normal, terlambat, atau dibatalkan."
      activePage="status"
    >
      <DbError message={dbError} />

      <MetricGrid items={metricItems} className="admin-stats-grid" />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Status Operasional</h2>
              <p>Pastikan status perjalanan selalu sinkron dengan data yang dilihat pengguna di halaman publik.</p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Kereta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={`${row.nama}-${index}`}>
                  <td>{row.nama}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Belum ada status perjalanan"
          description="Status kereta akan muncul setelah data perjalanan diinput atau diperbarui dari panel admin."
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

  try {
    return {
      props: {
        data: await getStatusRows(),
        dbError: null,
      },
    };
  } catch (err) {
    return {
      props: {
        data: [],
        dbError: getDbErrorMessage(err),
      },
    };
  }
}
