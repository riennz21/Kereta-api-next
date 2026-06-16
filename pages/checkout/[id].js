import { useState } from "react";
import Link from "next/link";
import {
  Train,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Phone,
  Mail,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import PublicLayout from "../../components/public/PublicLayout";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import Notification from "../../components/ui/Notification";
import LoadingState from "../../components/ui/LoadingState";
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

  // Notification state
  const [notification, setNotification] = useState({ show: false, type: "success", title: "", description: "" });

  const totalHarga = (train.harga || 0) * qty;
  const isCancelled = train.status === "Dibatalkan";
  const maxSeats = train.kapasitas || 40;
  const availableSeats = train.kursi_tersedia ?? maxSeats;
  const isSoldOut = availableSeats <= 0;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!form.nama_pembeli.trim()) {
      setError("Nama pembeli wajib diisi.");
      return false;
    }
    if (form.nama_pembeli.trim().length < 3) {
      setError("Nama pembeli minimal 3 karakter.");
      return false;
    }
    if (form.email_pembeli && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_pembeli)) {
      setError("Format email tidak valid.");
      return false;
    }
    if (form.no_telepon && !/^0\d{8,13}$/.test(form.no_telepon.replace(/[\s-]/g, ""))) {
      setError("Format nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx.");
      return false;
    }
    if (qty > availableSeats) {
      setError(`Kursi tersedia hanya ${availableSeats}. Jumlah tiket melebihi kapasitas.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    if (isCancelled) {
      setError("Maaf, kereta ini telah dibatalkan dan tidak dapat dipesan.");
      setLoading(false);
      return;
    }

    if (isSoldOut) {
      setError("Maaf, kursi untuk kereta ini sudah habis.");
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
      setNotification({
        show: true,
        type: "success",
        title: "Pembayaran Berhasil!",
        description: `Tiket ${train.nama} (${train.asal} → ${train.tujuan}) berhasil dipesan.`,
      });
    } catch (err) {
      setError(err.message);
      setNotification({
        show: true,
        type: "error",
        title: "Pembayaran Gagal",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCancelled) {
    return (
      <PublicLayout title="Tidak Tersedia">
        <div className="max-w-[640px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#667085] hover:text-[#c6520f] mb-5 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
          <div className="bg-white/90 rounded-3xl p-8 border border-[rgba(186,151,113,0.12)] shadow-lg text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#fef3f2] flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-[#d74c3c]" />
            </div>
            <h2 className="text-xl font-bold font-display text-[#101828] mb-2">Kereta Tidak Tersedia</h2>
            <p className="text-[#667085] mb-6 max-w-[400px] mx-auto">
              Kereta <strong>{train.nama}</strong> ({train.asal} → {train.tujuan}) saat ini berstatus{' '}
              <strong>Dibatalkan</strong> dan tidak dapat dipesan.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/" className="btn btn-primary">
                Cari Tiket Lain
              </Link>
              <Link href="/status" className="btn btn-outline">
                Cek Status Kereta
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (success) {
    return (
      <PublicLayout title="Pembayaran Berhasil">
        <div className="max-w-[640px] mx-auto">
          <div className="bg-gradient-to-br from-[#e4f8ee] to-[#f2fcf7] rounded-3xl border border-[rgba(31,157,99,0.16)] shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#1f9d63] to-[#34d399]" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle size={36} className="text-[#1f9d63]" />
              </div>
              <h2 className="text-2xl font-bold font-display text-[#101828] mb-2">Pembayaran Berhasil!</h2>
              <p className="text-[#667085] mb-6 max-w-[420px] mx-auto">
                Tiket <strong>{train.nama}</strong> ({train.asal} &rarr; {train.tujuan}) telah dipesan atas nama{' '}
                <strong>{form.nama_pembeli}</strong>. Silakan simpan kode booking Anda.
              </p>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 text-left border border-[rgba(186,151,113,0.12)]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(15,39,67,0.06)]">
                    <span className="text-sm text-[#667085] font-medium">Kode Pesanan</span>
                    <span className="font-bold text-[#101828] font-mono">
                      #TKT-{train.id}-{Date.now().toString(36).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(15,39,67,0.06)]">
                    <span className="text-sm text-[#667085] font-medium">Total Dibayar</span>
                    <span className="font-bold text-lg text-[#1f9d63]">{formatCurrency(totalHarga)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[rgba(15,39,67,0.06)]">
                    <span className="text-sm text-[#667085] font-medium">Metode Pembayaran</span>
                    <span className="font-bold text-[#101828] text-sm">
                      {METODE_PEMBAYARAN.find((m) => m.value === form.metode_pembayaran)?.label || form.metode_pembayaran}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#667085] font-medium">Jumlah Tiket</span>
                    <span className="font-bold text-[#101828]">{qty} tiket</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/" className="btn btn-primary">
                  Kembali ke Beranda
                </Link>
                <Link href="/cek-pesanan" className="btn btn-outline">
                  Lihat E-Tiket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout title="Checkout">
      <Notification
        type={notification.type}
        title={notification.title}
        description={notification.description}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <div className="max-w-[1100px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#667085] hover:text-[#c6520f] mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Pencarian
        </Link>

        <PageHeader
          eyebrow="Konfirmasi & Bayar"
          title="Checkout Tiket"
          description="Lengkapi data diri dan pilih metode pembayaran untuk memesan tiket kereta."
          meta={[`${train.asal} - ${train.tujuan}`, `${train.tanggal} ${train.jam}`]}
        />

        <form onSubmit={handleSubmit}>
          <div className="detail-grid">
            {/* Left: Train Detail */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-[rgba(186,151,113,0.12)] shadow-lg">
              <div className="flex flex-col gap-5">
                {train.gambar ? (
                  <img className="w-full h-48 rounded-2xl object-cover" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} />
                ) : (
                  <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-[rgba(15,39,67,0.08)] to-[rgba(243,112,33,0.08)] flex items-center justify-center text-[#98a2b3]">
                    <Train size={48} />
                  </div>
                )}

                <div>
                  <span className="page-kicker">Pilihan Anda</span>
                  <h2 className="text-xl font-bold font-display text-[#101828]">{train.nama}</h2>
                  <p className="text-[#667085] text-sm mt-2 line-clamp-3">
                    {train.deskripsi || "Lengkapi data diri di samping untuk melanjutkan pemesanan."}
                  </p>
                </div>

                <div className="inline-actions">
                  <TrainClassBadge trainClass={train.kelas} />
                  <StatusBadge status={train.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-[rgba(15,39,67,0.04)] rounded-2xl p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">Rute</div>
                    <div className="font-bold text-[#101828]">{train.asal} - {train.tujuan}</div>
                  </div>
                  <div className="bg-[rgba(15,39,67,0.04)] rounded-2xl p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">Jadwal</div>
                    <div className="font-bold text-[#101828]">{train.tanggal} {train.jam}</div>
                  </div>
                  <div className="bg-[rgba(15,39,67,0.04)] rounded-2xl p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">Kelas</div>
                    <div className="font-bold text-[#101828]">{train.kelas}</div>
                  </div>
                  <div className="bg-[rgba(15,39,67,0.04)] rounded-2xl p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">Status</div>
                    <StatusBadge status={train.status} />
                  </div>
                </div>

                {/* Seat Availability */}
                {availableSeats !== undefined && (
                  <div className={`rounded-2xl p-4 border ${
                    isSoldOut 
                      ? "bg-[#fef3f2] border-[rgba(215,76,60,0.14)]" 
                      : availableSeats <= 10 
                        ? "bg-[#fffaeb] border-[rgba(215,164,58,0.18)]"
                        : "bg-[#e4f8ee] border-[rgba(31,157,99,0.14)]"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#667085]">
                        Kursi Tersedia
                      </span>
                      <span className={`font-bold font-display text-lg ${
                        isSoldOut ? "text-[#d74c3c]" : availableSeats <= 10 ? "text-[#d7a43a]" : "text-[#1f9d63]"
                      }`}>
                        {isSoldOut ? "HABIS" : `${availableSeats} / ${maxSeats}`}
                      </span>
                    </div>
                    {availableSeats > 0 && availableSeats <= 10 && (
                      <p className="text-xs text-[#b54708] mt-1">⚠️ Kursi tersisa sedikit, segera pesan!</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-[rgba(186,151,113,0.12)] shadow-lg">
              <div className="flex flex-col gap-5">
                <div>
                  <span className="page-kicker">Data Pembeli</span>
                  <h2 className="text-lg font-bold font-display text-[#101828]">Formulir Pemesanan</h2>
                  <p className="text-[#667085] text-sm mt-1">Isi data diri dengan benar untuk menerima tiket elektronik.</p>
                </div>

                {/* Nama */}
                <div className="form-group">
                  <label htmlFor="nama_pembeli" className="text-xs font-bold text-[#475467]">
                    Nama Lengkap <span className="text-[#d74c3c]">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                    <input
                      id="nama_pembeli"
                      name="nama_pembeli"
                      type="text"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all"
                      placeholder="Masukkan nama sesuai KTP"
                      value={form.nama_pembeli}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email_pembeli" className="text-xs font-bold text-[#475467]">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                    <input
                      id="email_pembeli"
                      name="email_pembeli"
                      type="email"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all"
                      placeholder="contoh@email.com"
                      value={form.email_pembeli}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="no_telepon" className="text-xs font-bold text-[#475467]">No. Telepon</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                    <input
                      id="no_telepon"
                      name="no_telepon"
                      type="tel"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all"
                      placeholder="081234567890"
                      value={form.no_telepon}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label className="text-xs font-bold text-[#475467]">Metode Pembayaran</label>
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
                          className="sr-only"
                        />
                        <span className="payment-icon">{metode.icon}</span>
                        <span className="payment-label">{metode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="form-group">
                  <label className="text-xs font-bold text-[#475467]">Jumlah Tiket</label>
                  <div className="qty-selector">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-[rgba(15,39,67,0.08)] bg-white/90 flex items-center justify-center text-[#101828] font-bold hover:bg-[#fff0e2] hover:border-[#f37021] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-[rgba(15,39,67,0.08)] bg-white/90 flex items-center justify-center text-[#101828] font-bold hover:bg-[#fff0e2] hover:border-[#f37021] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setQty(Math.min(availableSeats, qty + 1))}
                      disabled={qty >= availableSeats}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-xl bg-[#ffeeec] border border-[rgba(215,76,60,0.16)] text-[#b42318] text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                  </div>
                )}

                {/* Price Summary */}
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
                    <span className="price-total" style={{ fontSize: "1.5rem" }}>{formatCurrency(totalHarga)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full h-13 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-sm font-bold shadow-[0_14px_22px_rgba(243,112,33,0.22)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 min-h-[52px]"
                  disabled={loading || isSoldOut}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      Bayar {formatCurrency(totalHarga)}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-[#98a2b3] text-xs text-center">
                  <ShieldCheck size={14} className="inline mr-1" />
                  Dengan mengklik bayar, Anda menyetujui syarat dan ketentuan yang berlaku.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
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
