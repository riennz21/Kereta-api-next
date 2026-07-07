import AdminLayout from "../../components/admin/AdminLayout";
import MetricGrid from "../../components/ui/MetricGrid";
import DbError, { getDbErrorMessage } from "../../components/ui/DbError";
import { getReportSummary } from "../../lib/db";
import { requireAdminPage } from "../../lib/page-auth";

export default function AdminLaporanPage({ summary, dbError }) {
  const total = summary.total || 0;
  const onTimeRate = total ? Math.round((summary.on_time / total) * 100) : 0;
  const disruptionRate = total ? Math.round(((summary.delay + summary.dibatalkan) / total) * 100) : 0;
  const metricItems = [
    { label: "Total Kereta", value: summary.total, helper: "Semua data laporan", tone: "brand" },
    { label: "On Time", value: summary.on_time, helper: `${onTimeRate}% dari total`, tone: "success" },
    { label: "Delay", value: summary.delay, helper: "Status perlu perhatian", tone: "danger" },
    { label: "Dibatalkan", value: summary.dibatalkan, helper: `${disruptionRate}% tingkat gangguan`, tone: "navy" },
  ];

  return (
    <AdminLayout
      title="Laporan"
      description="Ringkasan performa operasional untuk membantu melihat kualitas layanan dan potensi gangguan perjalanan."
      activePage="laporan"
    >
      <DbError message={dbError} />

      <MetricGrid items={metricItems} className="admin-stats-grid" />

      <div className="report-grid">
        <article className="report-card">
          <span className="page-kicker">Kinerja layanan</span>
          <h3>On-time rate mencapai {onTimeRate}%</h3>
          <p>Persentase ini membantu melihat seberapa stabil operasional perjalanan berdasarkan seluruh data kereta aktif.</p>
        </article>

        <article className="report-card">
          <span className="page-kicker">Gangguan perjalanan</span>
          <h3>{summary.delay + summary.dibatalkan} kereta memerlukan perhatian</h3>
          <p>Gabungan delay dan pembatalan menjadi indikator utama untuk tindak lanjut operasional dan komunikasi ke pengguna.</p>
        </article>
      </div>
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
        summary: await getReportSummary(),
        dbError: null,
      },
    };
  } catch (err) {
    return {
      props: {
        summary: { total: 0, on_time: 0, delay: 0, dibatalkan: 0 },
        dbError: getDbErrorMessage(err),
      },
    };
  }
}
