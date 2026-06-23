import { useState } from "react";
import Link from "next/link";
import {
  Train, MapPin, Calendar, Users, CheckCircle, XCircle,
  AlertTriangle, ArrowRight, ArrowLeft, CreditCard, Phone, Mail,
  Minus, Plus, ShieldCheck, Sparkles
} from "lucide-react";
import PublicLayout from "../../components/public/PublicLayout";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import Notification from "../../components/ui/Notification";
import { getTrainById } from "../../lib/db";
import { formatCurrency, getImageUrl } from "../../lib/train-utils";

const METODE_PEMBAYARAN = [
  { value: "transfer_bca", label: "Transfer BCA", icon: "🏦" },
  { value: "transfer_mandiri", label: "Transfer Mandiri", icon: "🏛️" },
  { value: "gopay", label: "GoPay", icon: "💚" },
  { value: "ovo", label: "OVO", icon: "🟣" },
  { value: "dana", label: "DANA", icon: "🔵" },
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
  const [notification, setNotification] = useState({ show: false, type: "success", title: "", description: "" });

  const totalHarga = (train.harga || 0) * qty;
  const isCancelled = train.status === "Dibatalkan";
  const maxSeats = train.kapasitas || 40;
  const availableSeats = train.kursi_tersedia ?? maxSeats;
  const isSoldOut = availableSeats <= 0;

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
    if (isCancelled || isSoldOut) {
      setError(isCancelled ? "Kereta ini telah dibatalkan." : "Kursi sudah habis.");
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
      if (!res.ok) throw new Error(data.error || "Gagal memproses pembayaran.");

      setSuccess(true);
      setNotification({
        show: true, type: "success",
        title: "Pembayaran Berhasil!",
        description: `Tiket ${train.nama} (${train.asal} → ${train.tujuan}) berhasil dipesan.`,
      });
    } catch (err) {
      setError(err.message);
      setNotification({ show: true, type: "error", title: "Pembayaran Gagal", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (isCancelled) {
    return (
      <PublicLayout title="Tidak Tersedia">
        <div className="max-w-[640px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-5 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Kereta Tidak Tersedia</h2>
            <p className="text-slate-500 mb-6 max-w-[400px] mx-auto">
              Kereta <strong>{train.nama}</strong> saat ini berstatus <strong>Dibatalkan</strong>.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/" className="btn btn-primary">Cari Tiket Lain</Link>
              <Link href="/status" className="btn btn-outline">Cek Status Kereta</Link>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Pembayaran Berhasil!</h2>
              <p className="text-slate-500 mb-6 max-w-[420px] mx-auto">
                Tiket <strong>{train.nama}</strong> ({train.asal} &rarr; {train.tujuan}) telah dipesan.
              </p>
              <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-left border border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-sm text-slate-500 font-medium">Total Dibayar</span>
                    <span className="font-bold text-lg text-emerald-600">{formatCurrency(totalHarga)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-sm text-slate-500 font-medium">Metode Pembayaran</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {METODE_PEMBAYARAN.find((m) => m.value === form.metode_pembayaran)?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-medium">Jumlah Tiket</span>
                    <span className="font-bold text-slate-900">{qty} tiket</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/" className="btn btn-primary">Kembali ke Beranda</Link>
                <Link href="/cek-pesanan" className="btn btn-outline">Lihat E-Tiket</Link>
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
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-5 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Pencarian
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="page-kicker">Konfirmasi & Bayar</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 mb-1">Checkout Tiket</h1>
        <p className="text-slate-500 text-sm mb-6">Lengkapi data diri dan pilih metode pembayaran.</p>

        <form onSubmit={handleSubmit}>
          <div className="detail-grid">
            {/* Left: Train Detail */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col gap-5">
                {train.gambar ? (
                  <img loading="lazy" className="w-full h-48 rounded-2xl object-cover" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} />
                ) : (
                  <div className="w-full h-48 rounded-2xl bg-indigo-50 flex items-center justify-center text-slate-400">
                    <Train size={48} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">{train.nama}</h2>
                  <p className="text-slate-500 text-sm mt-2">{train.deskripsi || "Lengkapi data diri di samping untuk melanjutkan pemesanan."}</p>
                </div>
                <div className="inline-actions">
                  <TrainClassBadge trainClass={train.kelas} />
                  <StatusBadge status={train.status} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Rute</div>
                    <div className="font-bold text-slate-900">{train.asal} - {train.tujuan}</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Jadwal</div>
                    <div className="font-bold text-slate-900">{train.tanggal} {train.jam}</div>
                  </div>
                </div>
                {availableSeats !== undefined && (
                  <div className={`rounded-2xl p-4 border ${
                    isSoldOut ? "bg-red-50 border-red-200" 
                    : availableSeats <= 10 ? "bg-amber-50 border-amber-200"
                    : "bg-emerald-50 border-emerald-200"
                  }`}>
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Kursi Tersedia</span>
                    <span className={`font-bold font-display text-lg ml-2 ${
                      isSoldOut ? "text-red-600" : availableSeats <= 10 ? "text-amber-600" : "text-emerald-600"
                    }`}>{isSoldOut ? "HABIS" : `${availableSeats} / ${maxSeats}`}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col gap-5">
                <h2 className="text-lg font-bold font-display text-slate-900">Formulir Pemesanan</h2>

                <div>
                  <label htmlFor="nama-pembeli" className="text-xs font-bold text-slate-600 mb-1.5 block">Nama Lengkap <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="nama-pembeli" name="nama_pembeli" type="text"
                      className="w-full h-[46px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                      placeholder="Masukkan nama sesuai KTP" value={form.nama_pembeli} onChange={handleChange} required />
                  </div>
                </div>

                <div>
                  <label htmlFor="email-pembeli" className="text-xs font-bold text-slate-600 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="email-pembeli" name="email_pembeli" type="email"
                      className="w-full h-[46px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                      placeholder="contoh@email.com" value={form.email_pembeli} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label htmlFor="telepon-pembeli" className="text-xs font-bold text-slate-600 mb-1.5 block">No. Telepon</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="telepon-pembeli" name="no_telepon" type="tel"
                      className="w-full h-[46px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                      placeholder="081234567890" value={form.no_telepon} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label htmlFor="metode-pembayaran" className="text-xs font-bold text-slate-600 mb-1.5 block">Metode Pembayaran</label>
                  <div className="grid grid-cols-1 gap-2">
                    {METODE_PEMBAYARAN.map((metode) => (
                      <label key={metode.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          form.metode_pembayaran === metode.value
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200 bg-white hover:border-indigo-200"
                        }`}>
                        <input type="radio" name="metode_pembayaran" value={metode.value}
                          checked={form.metode_pembayaran === metode.value} onChange={handleChange} className="sr-only" />
                        <span className="text-xl">{metode.icon}</span>
                        <span className="text-sm font-semibold text-slate-900">{metode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="jumlah-tiket" className="text-xs font-bold text-slate-600 mb-1.5 block">Jumlah Tiket</label>
                  <input type="hidden" id="jumlah-tiket" />
                  <div className="flex items-center gap-3">
                    <button type="button"
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-30"
                      onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold font-display text-lg text-slate-900">{qty}</span>
                    <button type="button"
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-30"
                      onClick={() => setQty(Math.min(availableSeats, qty + 1))} disabled={qty >= availableSeats}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Harga satuan</span>
                      <span className="font-semibold">{formatCurrency(train.harga || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Jumlah tiket</span>
                      <span className="font-semibold">&times; {qty}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="price-total text-slate-900 font-bold font-display">{formatCurrency(totalHarga)}</span>
                    </div>
                  </div>
                </div>

                <button type="submit"
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-bold shadow-[0_14px_22px_rgba(79,70,229,0.22)] hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading || isSoldOut}>
                  {loading ? (
                    <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Memproses...</>
                  ) : (
                    <><ShieldCheck size={18} /> Bayar {formatCurrency(totalHarga)} <ArrowRight size={18} /></>
                  )}
                </button>
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
  if (!train) return { notFound: true };
  return { props: { train } };
}
