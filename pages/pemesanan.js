import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Train, MapPin, Clock, Calendar, User, CreditCard, Phone,
  ArmchairIcon as Chair, ShieldCheck, ArrowRight, ArrowLeft,
  AlertTriangle, Loader2
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import Notification from "../components/ui/Notification";

const SEAT_OPTIONS = [
  { value: "12A", label: "12A - Jendela (Kiri)" },
  { value: "12B", label: "12B - Tengah" },
  { value: "12C", label: "12C - Lorong (Kiri)" },
  { value: "12D", label: "12D - Lorong (Kanan)" },
  { value: "12E", label: "12E - Tengah" },
  { value: "12F", label: "12F - Jendela (Kanan)" },
];

const BOOKED_SEATS = ["12A", "12D"];

export default function PemesananPage() {
  const router = useRouter();
  const query = router.query;

  const trainData = {
    id: query.id || "1",
    name: query.name || "Argo Bromo Anggrek",
    from: query.from || "GMR",
    fromFull: query.fromFull || "Gambir",
    to: query.to || "SBY",
    toFull: query.toFull || "Surabaya Pasar Turi",
    departure: query.departure || "08:30",
    arrival: query.arrival || "14:45",
    duration: query.duration || "6j 15m",
    className: query.className || "Eksekutif",
    price: Number(query.price) || 350000,
    status: query.status || "On Time",
  };

  const [form, setForm] = useState({ namaLengkap: "", nik: "", noHandphone: "", email: "", kursi: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCancelled = trainData.status === "Dibatalkan";

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.namaLengkap.trim()) errors.namaLengkap = "Nama lengkap wajib diisi.";
    if (!form.nik.trim() || !/^\d{16}$/.test(form.nik.trim())) errors.nik = "NIK harus 16 digit angka.";
    if (!form.noHandphone.trim() || !/^0\d{8,13}$/.test(form.noHandphone.trim())) errors.noHandphone = "Format nomor handphone tidak valid.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Format email tidak valid.";
    if (!form.kursi) errors.kursi = "Silakan pilih kursi.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    if (isCancelled) { setError("Maaf, kereta ini telah dibatalkan."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kereta_id: Number(trainData.id),
          nama_kereta: trainData.name,
          asal: trainData.from,
          tujuan: trainData.to,
          kelas: trainData.className,
          harga_satuan: Number(trainData.price),
          jumlah_tiket: 1,
          total_harga: Number(trainData.price),
          nama_pembeli: form.namaLengkap.trim(),
          email_pembeli: form.email.trim(),
          no_telepon: form.noHandphone.trim(),
          metode_pembayaran: "transfer",
          tanggal_keberangkatan: "",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal memproses pemesanan");
      }

      const result = await res.json();
      const purchase = result.data;
      const bookingCode = purchase.kode_booking;

      if (!bookingCode) {
        throw new Error("Kode booking tidak dihasilkan.");
      }

      const params = new URLSearchParams({
        bookingCode,
        purchaseId: purchase.id,
        name: form.namaLengkap.trim(),
        nik: form.nik.trim(),
        phone: form.noHandphone.trim(),
        seat: form.kursi,
        trainName: trainData.name,
        from: trainData.from,
        to: trainData.to,
        fromFull: trainData.fromFull,
        toFull: trainData.toFull,
        departure: trainData.departure,
        arrival: trainData.arrival,
        duration: trainData.duration,
        className: trainData.className,
        price: trainData.price,
      });

      router.push(`/cek-pesanan?${params.toString()}`);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout title="Pemesanan Tiket">
      <div className="max-w-[1100px] mx-auto">
        <Link href="/jadwal"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-5 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Jadwal
        </Link>

        {isCancelled ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Kereta Tidak Tersedia</h2>
            <p className="text-slate-500 mb-6">Kereta <strong>{trainData.name}</strong> berstatus <strong>Dibatalkan</strong>.</p>
            <Link href="/jadwal" className="btn btn-primary">Cari Jadwal Lain</Link>
          </div>
        ) : (
          <div className="detail-grid">
            {/* LEFT: Passenger Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900">Data Penumpang</h2>
                  <p className="text-xs text-slate-500">Isi data diri sesuai dengan identitas resmi</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Masukkan nama sesuai KTP" value={form.namaLengkap}
                      onChange={handleChange("namaLengkap")}
                      className={`w-full h-[46px] pl-10 pr-4 rounded-xl border ${formErrors.namaLengkap ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50"} text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all`} />
                  </div>
                  {formErrors.namaLengkap && <p className="text-xs text-red-500 font-semibold mt-1"><AlertTriangle size={10} className="inline" /> {formErrors.namaLengkap}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">NIK <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="16 digit NIK" maxLength={16} value={form.nik}
                      onChange={handleChange("nik")}
                      className={`w-full h-[46px] pl-10 pr-4 rounded-xl border ${formErrors.nik ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50"} text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all`} />
                  </div>
                  {formErrors.nik && <p className="text-xs text-red-500 font-semibold mt-1"><AlertTriangle size={10} className="inline" /> {formErrors.nik}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">No. Handphone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" placeholder="08XXXXXXXXXX" value={form.noHandphone}
                      onChange={handleChange("noHandphone")}
                      className={`w-full h-[46px] pl-10 pr-4 rounded-xl border ${formErrors.noHandphone ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50"} text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all`} />
                  </div>
                  {formErrors.noHandphone && <p className="text-xs text-red-500 font-semibold mt-1"><AlertTriangle size={10} className="inline" /> {formErrors.noHandphone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Email (opsional)</label>
                  <input type="email" placeholder="contoh@email.com" value={form.email}
                    onChange={handleChange("email")}
                    className={`w-full h-[46px] px-4 rounded-xl border ${formErrors.email ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50"} text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all`} />
                  {formErrors.email && <p className="text-xs text-red-500 font-semibold mt-1"><AlertTriangle size={10} className="inline" /> {formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Pilihan Kursi <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Chair size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                    <select value={form.kursi} onChange={handleChange("kursi")}
                      className={`w-full h-[46px] pl-10 pr-4 rounded-xl border ${formErrors.kursi ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50"} text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all appearance-none cursor-pointer`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364758b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        paddingRight: 40,
                      }}>
                      <option value="">Pilih nomor kursi</option>
                      {SEAT_OPTIONS.map((seat) => {
                        const isBooked = BOOKED_SEATS.includes(seat.value);
                        return <option key={seat.value} value={seat.value} disabled={isBooked}>{seat.label} {isBooked ? "(Sudah dipesan)" : ""}</option>;
                      })}
                    </select>
                  </div>
                  {formErrors.kursi && <p className="text-xs text-red-500 font-semibold mt-1"><AlertTriangle size={10} className="inline" /> {formErrors.kursi}</p>}
                </div>

                {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2"><AlertTriangle size={16} /> {error}</div>}

                <button type="submit" disabled={loading}
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-bold shadow-[0_14px_22px_rgba(79,70,229,0.22)] hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                    : <>LANJUT KE PEMBAYARAN <ArrowRight size={18} /></>}
                </button>
              </form>
            </div>

            {/* RIGHT: Summary */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-7 border border-white/10 shadow-lg sticky top-24 relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(79,70,229,0.5) 0%, transparent 70%)" }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-indigo-400" />
                    </div>
                    <h3 className="text-white font-bold text-base">Ringkasan Perjalanan</h3>
                  </div>
                  <div className="h-px bg-white/10 mb-5" />
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Train size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-base">{trainData.name}</div>
                      <div className="text-white/60 text-xs font-semibold">{trainData.className}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 text-center">
                      <div className="text-white font-bold font-display text-xl">{trainData.departure}</div>
                      <div className="text-white/60 text-xs font-semibold">{trainData.from}</div>
                      <div className="text-white/40 text-[10px]">{trainData.fromFull}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-400 to-white/30" />
                      <div className="text-white/50 text-[10px] font-bold">{trainData.duration}</div>
                      <div className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-white/60" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-white font-bold font-display text-xl">{trainData.arrival}</div>
                      <div className="text-white/60 text-xs font-semibold">{trainData.to}</div>
                      <div className="text-white/40 text-[10px]">{trainData.toFull}</div>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 mb-4" />
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-white/70 text-sm font-semibold">Total Tiket</span>
                    <span className="text-white font-bold font-display text-2xl">Rp {trainData.price.toLocaleString("id-ID")}</span>
                  </div>
                  <p className="text-white/40 text-[11px] leading-relaxed">
                    <span className="text-white/60">✱</span> Harga sudah termasuk pajak dan biaya layanan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
