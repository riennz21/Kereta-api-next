import Link from "next/link";
import PublicLayout from "../../components/public/PublicLayout";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import PageHeader from "../../components/ui/PageHeader";
import { getTrainById } from "../../lib/db";
import { formatCurrency, getImageUrl } from "../../lib/train-utils";

export default function CheckoutPage({ train }) {
  return (
    <PublicLayout title="Checkout">
      <PageHeader
        eyebrow="Konfirmasi tiket"
        title="Checkout Tiket"
        description="Ringkas detail perjalanan yang dipilih sebelum kembali menjelajahi jadwal atau data kereta lainnya."
        meta={[`${train.asal} - ${train.tujuan}`, `${train.tanggal} ${train.jam}`]}
      />

      <section className="detail-grid">
        <div className="detail-card">
          <div className="detail-visual">
            {train.gambar ? (
              <img className="ticket-image" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} />
            ) : (
              <div className="ticket-image preview-empty">Tidak ada gambar</div>
            )}

            <div className="stack-md">
              <div className="stack-sm">
                <span className="page-kicker">Pilihan Anda</span>
                <h2>{train.nama}</h2>
                <p className="muted">
                  {train.deskripsi || "Deskripsi belum tersedia. Gunakan informasi rute, jadwal, dan status di samping untuk melanjutkan pengecekan."}
                </p>
              </div>

              <div className="inline-actions">
                <TrainClassBadge trainClass={train.kelas} />
                <StatusBadge status={train.status} />
              </div>

              <span className="ticket-route">
                {train.asal} - {train.tujuan}
              </span>
            </div>
          </div>
        </div>

        <aside className="detail-card">
          <div className="stack-md">
            <div className="stack-sm">
              <span className="page-kicker">Ringkasan Pembelian</span>
              <h2>Total {formatCurrency(train.harga)}</h2>
              <p className="muted">Seluruh halaman checkout ini masih bersifat demonstrasi dan tidak memproses pembayaran nyata.</p>
            </div>

            <div className="detail-summary">
              <div className="summary-item">
                <strong>Nama</strong>
                <br />
                {train.nama}
              </div>
              <div className="summary-item">
                <strong>Rute</strong>
                <br />
                {train.asal} - {train.tujuan}
              </div>
              <div className="summary-item">
                <strong>Kelas</strong>
                <br />
                {train.kelas}
              </div>
              <div className="summary-item">
                <strong>Jadwal</strong>
                <br />
                {train.tanggal} {train.jam}
              </div>
              <div className="summary-item">
                <strong>Status</strong>
                <br />
                {train.status}
              </div>
            </div>

            <div className="notice">Hanya Uji Coba.</div>

            <div className="detail-actions">
              <Link href="/" className="btn btn-primary">
                Kembali ke Daftar Tiket
              </Link>
              <Link href="/jadwal" className="btn btn-outline">
                Cek Jadwal Lain
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}

export async function getServerSideProps(context) {
  const train = await getTrainById(Number(context.params.id));
  if (!train) {
    return { notFound: true };
  }

  return {
    props: {
      train,
    },
  };
}
