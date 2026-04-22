import Link from "next/link";
import PublicLayout from "../components/public/PublicLayout";
import TrainFilters from "../components/public/TrainFilters";
import StatusBadge from "../components/StatusBadge";
import TrainClassBadge from "../components/TrainClassBadge";
import EmptyState from "../components/ui/EmptyState";
import MetricGrid from "../components/ui/MetricGrid";
import PageHeader from "../components/ui/PageHeader";
import { getAllTrains } from "../lib/db";
import {
  formatCurrency,
  getFiltersFromQuery,
  hasActiveFilters,
} from "../lib/train-utils";

export default function DataKeretaPage({ data, filters }) {
  const classCount = new Set(data.map((row) => row.kelas).filter(Boolean)).size;
  const onTimeCount = data.filter((row) => row.status === "On Time").length;
  const metricItems = [
    { label: "Data Ditampilkan", value: data.length, helper: "Baris hasil pencarian", tone: "brand" },
    { label: "Kelas Aktif", value: classCount, helper: "Jenis layanan tersedia" },
    { label: "On Time", value: onTimeCount, helper: "Kereta dengan status tepat waktu", tone: "success" },
  ];

  return (
    <PublicLayout title="Data Kereta">
      <PageHeader
        eyebrow="Direktori kereta"
        title="Data Kereta Api"
        description="Lihat seluruh data kereta dalam format tabel yang mudah dipindai untuk kebutuhan pengecekan cepat."
        meta={["Tampilan lengkap data aktif", "Siap dipakai untuk pencarian lanjutan"]}
        actions={
          <Link href="/jadwal" className="btn btn-outline">
            Lihat Jadwal
          </Link>
        }
      />

      <MetricGrid items={metricItems} className="stack-md" />
      <TrainFilters action="/kereta" filters={filters} showReset={hasActiveFilters(filters)} resetHref="/kereta" />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Manifest Kereta</h2>
              <p>Scan nama, rute, kelas, harga, dan status perjalanan dalam satu tampilan.</p>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Asal</th>
                <th>Tujuan</th>
                <th>Kelas</th>
                <th>Harga</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <span className="table-title">{row.nama}</span>
                    <span className="table-subtitle">{row.deskripsi || "Deskripsi belum tersedia."}</span>
                  </td>
                  <td>{row.asal}</td>
                  <td>{row.tujuan}</td>
                  <td>
                    <TrainClassBadge trainClass={row.kelas} />
                  </td>
                  <td>{formatCurrency(row.harga)}</td>
                  <td>{row.tanggal}</td>
                  <td>{row.jam}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    <Link href={`/checkout/${row.id}`} className="btn btn-primary">
                      Checkout
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Data kereta belum tersedia"
          description="Belum ada hasil yang sesuai. Coba ubah filter atau kembali ke dashboard utama."
          action={
            <Link href="/" className="btn btn-primary">
              Kembali ke Dashboard
            </Link>
          }
        />
      )}
    </PublicLayout>
  );
}

export async function getServerSideProps(context) {
  const filters = getFiltersFromQuery(context.query);
  const data = await getAllTrains(filters);

  return {
    props: {
      data,
      filters,
    },
  };
}
