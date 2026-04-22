import PublicLayout from "../components/public/PublicLayout";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import MetricGrid from "../components/ui/MetricGrid";
import PageHeader from "../components/ui/PageHeader";
import { getStatusRows } from "../lib/db";

export default function StatusPage({ data }) {
  const onTime = data.filter((row) => row.status === "On Time").length;
  const delay = data.filter((row) => row.status === "Delay").length;
  const cancelled = data.filter((row) => row.status === "Dibatalkan").length;
  const metricItems = [
    { label: "Total Status", value: data.length, helper: "Kereta dengan status aktif", tone: "brand" },
    { label: "On Time", value: onTime, helper: "Perjalanan tepat waktu", tone: "success" },
    { label: "Delay / Batal", value: `${delay} / ${cancelled}`, helper: "Perlu perhatian penumpang", tone: "danger" },
  ];

  return (
    <PublicLayout title="Status Kereta">
      <PageHeader
        eyebrow="Status operasional"
        title="Status Kereta Api"
        description="Lihat kondisi perjalanan terkini untuk mengetahui apakah kereta berjalan normal, terlambat, atau dibatalkan."
        meta={["Cocok untuk monitoring cepat", "Status diperbarui dari data aktif"]}
      />

      <MetricGrid items={metricItems} className="stack-md" />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Ringkasan Status</h2>
              <p>Gunakan status ini untuk memeriksa kesiapan perjalanan sebelum melanjutkan proses.</p>
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
          title="Belum ada status kereta"
          description="Status perjalanan akan tampil di sini setelah data kereta diisi pada panel admin."
        />
      )}
    </PublicLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      data: await getStatusRows(),
    },
  };
}
