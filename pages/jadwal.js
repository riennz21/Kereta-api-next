import PublicLayout from "../components/public/PublicLayout";
import EmptyState from "../components/ui/EmptyState";
import MetricGrid from "../components/ui/MetricGrid";
import PageHeader from "../components/ui/PageHeader";
import { getScheduleRows } from "../lib/db";

export default function JadwalPage({ data }) {
  const uniqueTrains = new Set(data.map((row) => row.nama)).size;
  const nearestDeparture = data[0] ? `${data[0].tanggal} ${data[0].jam}` : "-";
  const metricItems = [
    { label: "Total Jadwal", value: data.length, helper: "Semua keberangkatan tercatat", tone: "brand" },
    { label: "Kereta Aktif", value: uniqueTrains, helper: "Unit yang muncul di jadwal" },
    { label: "Keberangkatan Terdekat", value: nearestDeparture, helper: "Jadwal paling awal di daftar", tone: "navy" },
  ];

  return (
    <PublicLayout title="Jadwal Kereta">
      <PageHeader
        eyebrow="Jadwal perjalanan"
        title="Jadwal Kereta Api"
        description="Pantau tanggal dan jam keberangkatan yang sudah dijadwalkan untuk seluruh kereta aktif."
        meta={["Urutan jadwal paling awal lebih dulu", "Cocok untuk cek cepat sebelum checkout"]}
      />

      <MetricGrid items={metricItems} className="stack-md" />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Daftar Keberangkatan</h2>
              <p>Gunakan tabel ini untuk memvalidasi ketersediaan jadwal perjalanan.</p>
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
          title="Belum ada jadwal yang tercatat"
          description="Data jadwal akan muncul di sini setelah ada kereta yang memiliki tanggal dan jam keberangkatan."
        />
      )}
    </PublicLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      data: await getScheduleRows(),
    },
  };
}
