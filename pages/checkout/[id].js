import { useState } from "react";
import Link from "next/link";
import PublicLayout from "../../components/public/PublicLayout";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import PageHeader from "../../components/ui/PageHeader";
import { getTrainById } from "../../lib/db";
import { formatCurrency, getImageUrl } from "../../lib/train-utils";

const METODE_PEMBAYARAN = [
  { value: "transfer_bca", label: "Transfer BCA", icon: "🏦" },
  { value: "transfer_mandiri", label: "Transfer Mandiri", icon: "🏛️" },
  { value: "gopay", label: "GoPay", icon: "💚" },
  { value: "ovo", label: "OVO", icon: "🟣" },
  { value: "dana", label: "DANA", icon: "🔵" },
  { value: "alfamart", label: "Alfamart / Indomaret", icon: "🏪" },
];

export default function CheckoutPage({ train }) {
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    nama_pembeli: "",
    email_pembeli: "",
    no_telepon: "",
    metode_pembayaran: "transfer_bca",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const totalHarga = (train.harga || 0) * qty;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.nama_pembeli.trim()) {
      setError("Nama pembeli wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kereta_id: train.id,
          nama_kereta: train.nama,
          asal: train.asal,
          tujuan: train.tujuan,
          kelas: train.kelas,
          harga_satuan: train.harga,
          jumlah_tiket: qty,
          nama_pembeli: form.nama_pembeli.trim(),
          email_pembeli: form.email_pembeli.trim(),
          no_telepon: form.no_telepon.trim(),
          metode_pembayaran: form.metode_pembayaran,
          tanggal_keberangkatan: train.tanggal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pembayaran.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicLayout title="Pembayaran Berhasil">
        <div className="hero-primary" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Pembayaran Berhasil!</h2>
            <p className="muted" style={{ marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
              Tiket <strong>{train.nama}</strong> ({train.asal} &rarr; {train.tujuan}) telah dipesan atas nama{" "}
              <strong>{form.nama_pembeli}</strong>.
            </p>

            <div
              style={{
                background: "rgba(15,39,67,0.04)",
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <div className="stack-sm">
                <div className="summary-item">
                  <strong>Kode Pesanan</strong>
                  <br />
                  <span style={{ fontFamily: "monospace", fontSize: "1.1rem" }}>
                    #TKT-{train.id}-{Date.now().toString(36).toUpperCase()}
                  </span>
                </div>
                <div className="summary-item">
                  <strong>Total Dibayar</strong>
                  <br />
                  <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--green)" }}>
                    {formatCurrency(totalHarga)}
                  </span>
                </div>
                <div className="summary-item">
                  <strong>Metode Pembayaran</strong>
                  <br />
                  {METODE_PEMBAYARAN.find((m) => m.value === form.metode_pembayaran)?.label ||
                    form.metode_pembayaran}
                </div>
                <div className="summary-item">
                  <strong>Jumlah Tiket</strong>
                  <br />
                  {qty} tiket
                </div>
              </div>
            </div>

            <div className="inline-actions" style={{ justifyContent: "center" }}>
              <Link href="/" className="btn btn-primary">
                Kembali ke Beranda
              </Link>
              <Link href="/jadwal" className="btn btn-outline">
                Cek Jadwal Lain
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout title="Checkout">
      <PageHeader
        eyebrow="Konfirmasi & Bayar"
        title="Checkout Tiket"
        description="Lengkapi data diri dan pilih metode pembayaran untuk memesan tiket kereta."
        meta={[`${train.asal} - ${train.tujuan}`, `${train.tanggal} ${train.jam}`]}
      />

      <form onSubmit={handleSubmit}>
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
                    {train.deskripsi ||
                      "Lengkapi data diri di samping untuk melanjutkan pemesanan."}
                  </p>
                </div>

                <div className="inline-actions">
                  <TrainClassBadge trainClass={train.kelas} />
                  <StatusBadge status={train.status} />
                </div>

                <span className="ticket-route">
                  {train.asal} - {train.tujuan}
                </span>

                <div className="detail-summary">
                  <div className="summary-item">
                    <strong>Nama Kereta</strong>
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
                    <StatusBadge status={train.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="detail-card">
            <div className="stack-md">
              <div className="stack-sm">
                <span className="page-kicker">Data Pembeli</span>
                <h2>Formulir Pemesanan</h2>
                <p className="muted">
                  Isi data diri dengan benar untuk menerima tiket elektronik.
                </p>
              </div>

              <div className="stack-sm">
                <div className="form-group">
                  <label htmlFor="nama_pembeli">
                    Nama Lengkap <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    id="nama_pembeli"
                    name="nama_pembeli"
                    type="text"
                    className="input-control"
                    placeholder="Masukkan nama sesuai KTP"
                    value={form.nama_pembeli}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email_pembeli">Email</label>
                  <input
                    id="email_pembeli"
                    name="email_pembeli"
                    type="email"
                    className="input-control"
                    placeholder="contoh@email.com"
                    value={form.email_pembeli}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="no_telepon">No. Telepon</label>
                  <input
                    id="no_telepon"
                    name="no_telepon"
                    type="tel"
                    className="input-control"
                    placeholder="081234567890"
                    value={form.no_telepon}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="metode_pembayaran">Metode Pembayaran</label>
                  <div className="payment-method-grid">
                    {METODE_PEMBAYARAN.map((metode) => (
                      <label
                        key={metode.value}
                        className={`payment-method-option ${form.metode_pembayaran === metode.value ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="metode_pembayaran"
                          value={metode.value}
                          checked={form.metode_pembayaran === metode.value}
                          onChange={handleChange}
                          style={{ display: "none" }}
                        />
                        <span className="payment-icon">{metode.icon}</span>
                        <span className="payment-label">{metode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Jumlah Tiket</label>
                  <div className="qty-selector">
                    <button
                      type="button"
                      className="btn btn-muted"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      style={{ minHeight: 42, padding: "0 14px" }}
                    >
                      &minus;
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button
                      type="button"
                      className="btn btn-muted"
                      onClick={() => setQty(Math.min(10, qty + 1))}
                      disabled={qty >= 10}
                      style={{ minHeight: 42, padding: "0 14px" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              <div className="price-summary-card">
                <div className="price-summary-row">
                  <span>Harga satuan</span>
                  <span>{formatCurrency(train.harga || 0)}</span>
                </div>
                <div className="price-summary-row">
                  <span>Jumlah tiket</span>
                  <span>&times; {qty}</span>
                </div>
                <div className="price-summary-divider" />
                <div className="price-summary-row total">
                  <span>Total</span>
                  <span className="price-total">{formatCurrency(totalHarga)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", minHeight: 52 }}
              >
                {loading ? "Memproses..." : `Bayar ${formatCurrency(totalHarga)}`}
              </button>

              <p className="muted" style={{ fontSize: "0.82rem", textAlign: "center" }}>
                Dengan mengklik bayar, Anda menyetujui syarat dan ketentuan yang berlaku.
              </p>
            </div>
          </aside>
        </section>
      </form>
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
