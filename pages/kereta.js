import Link from "next/link";
import PublicLayout from "../components/public/PublicLayout";
import StatusBadge from "../components/StatusBadge";
import TrainClassBadge from "../components/TrainClassBadge";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { getAllTrains } from "../lib/db";
import {
  formatCurrency,
  getFiltersFromQuery,
} from "../lib/train-utils";

export default function DataKeretaPage({ data, filters }) {

  return (
    <PublicLayout title="Data Kereta">
      <PageHeader
        eyebrow="Direktori kereta"
        title="Seluruh Data Kereta"
        description="Lihat semua data kereta dalam tampilan tabel untuk pengecekan cepat."
        meta={["Tampilan lengkap data aktif"]}
        actions={
          <Link href="/" className="btn btn-primary">
            Cari Tiket
          </Link>
        }
      />

      {data.length ? (
        <div className="table-card">
          <div className="table-toolbar">
            <div className="table-toolbar-copy">
              <h2>Manifest Kereta ({data.length})</h2>
              <p>Scan nama, rute, kelas, harga, dan status perjalanan.</p>
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
                      Pesan
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
          description="Belum ada hasil yang sesuai."
          action={
            <Link href="/kereta" className="btn btn-outline">
              Reset Filter
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
