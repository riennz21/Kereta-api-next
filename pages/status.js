import Link from "next/link";
import PublicLayout from "../components/public/PublicLayout";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import MetricGrid from "../components/ui/MetricGrid";
import PageHeader from "../components/ui/PageHeader";
import { getStatusRows, getReportSummary } from "../lib/db";

export default function StatusPage({ data, stats }) {
  const metricItems = [
    { label: "Total Kereta", value: stats.total, helper: "Semua kereta terdaftar", tone: "brand" },
    { label: "On Time", value: stats.on_time, helper: "Perjalanan tepat waktu", tone: "success" },
    { label: "Delay", value: stats.delay, helper: "Perlu perhatian ekstra", tone: "danger" },
    { label: "Dibatalkan", value: stats.dibatalkan, helper: "Pembatalan perjalanan", tone: "navy" },
  ];

  return (
    <PublicLayout title="Status Kereta">
      <PageHeader
        eyebrow="Status operasional"
        title="Status & Ringkasan Operasional"
        description="Pantau kondisi perjalanan terkini. Lihat apakah kereta berjalan normal, terlambat, atau dibatalkan."
        meta={["Ringkasan harian", "Cocok untuk monitoring perjalanan"]}
      />

      <MetricGrid items={metricItems} className="stack-md" />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Daftar Status Perjalanan</h2>
              <p>Status terkini setiap kereta yang terdaftar.</p>
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
          action={
            <Link href="/" className="btn btn-primary">
              Cari Tiket
            </Link>
          }
        />
      )}
    </PublicLayout>
  );
}

export async function getServerSideProps() {
  const [data, stats] = await Promise.all([getStatusRows(), getReportSummary()]);
  return {
    props: {
      data,
      stats,
    },
  };
}
