import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Train,
  MapPin,
  Clock,
  Calendar,
  User,
  CreditCard,
  Phone,
  ArmchairIcon as Chair,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
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

  const [form, setForm] = useState({
    namaLengkap: "",
    nik: "",
    noHandphone: "",
    email: "",
    kursi: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, type: "success", title: "", description: "" });

  const isCancelled = trainData.status === "Dibatalkan";

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.namaLengkap.trim()) {
      errors.namaLengkap = "Nama lengkap wajib diisi.";
    } else if (form.namaLengkap.trim().length < 3) {
      errors.namaLengkap = "Nama lengkap minimal 3 karakter.";
    }

    if (!form.nik.trim()) {
      errors.nik = "NIK wajib diisi.";
    } else if (!/^\d{16}$/.test(form.nik.trim())) {
      errors.nik = "NIK harus 16 digit angka.";
    }

    if (!form.noHandphone.trim()) {
      errors.noHandphone = "Nomor handphone wajib diisi.";
    } else if (!/^0\d{8,13}$/.test(form.noHandphone.trim())) {
      errors.noHandphone = "Format nomor handphone tidak valid (contoh: 081234567890).";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Format email tidak valid.";
    }

    if (!form.kursi) {
      errors.kursi = "Silakan pilih kursi.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setNotification({
        show: true,
        type: "error",
        title: "Validasi Gagal",
        description: "Harap periksa kembali data yang diisi.",
      });
      return;
    }

    if (isCancelled) {
      setError("Maaf, kereta ini telah dibatalkan dan tidak dapat dipesan.");
      return;
    }

    if (BOOKED_SEATS.includes(form.kursi)) {
      setError(`Maaf, kursi ${form.kursi} sudah dipesan. Silakan pilih kursi lain.`);
      return;
    }

    setLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const bookingCode = `KAI-${Math.random().toString(36).substring(2, 7).toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;

      setNotification({
        show: true,
        type: "success",
        title: "Pemesanan Berhasil!",
        description: `Kode booking Anda: ${bookingCode}`,
      });

      // Delay redirect so user can see the notification
      setTimeout(() => {
        const params = new URLSearchParams({
          bookingCode,
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
      }, 1500);
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setNotification({
        show: true,
        type: "error",
        title: "Pemesanan Gagal",
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout title="Pemesanan Tiket">
      <Notification
        type={notification.type}
        title={notification.title}
        description={notification.description}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        autoClose={4000}
      />

      <div className="max-w-[1100px] mx-auto">
        {/* Back Link */}
        <Link
          href="/jadwal"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#667085] hover:text-[#c6520f] mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Jadwal
        </Link>

        {isCancelled ? (
          <div className="bg-white/90 rounded-3xl p-8 border border-[rgba(186,151,113,0.12)] shadow-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#fef3f2] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-[#d74c3c]" />
            </div>
            <h2 className="text-xl font-bold font-display text-[#101828] mb-2">Kereta Tidak Tersedia</h2>
            <p className="text-[#667085] mb-6 max-w-[400px] mx-auto">
              Kereta <strong>{trainData.name}</strong> saat ini berstatus <strong>Dibatalkan</strong>.
            </p>
            <Link href="/jadwal" className="btn btn-primary">
              Cari Jadwal Lain
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── LEFT: Passenger Form ── */}
            <div className="lg:col-span-7">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-7 border border-[rgba(186,151,113,0.12)] shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[rgba(243,112,33,0.15)] to-[rgba(15,39,67,0.10)] flex items-center justify-center text-[#c6520f]">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-[#101828]">Data Penumpang</h2>
                    <p className="text-xs text-[#667085]">Isi data diri sesuai dengan identitas resmi</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-[#475467] mb-1.5">
                      Nama Lengkap <span className="text-[#d74c3c]">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                      <input
                        type="text"
                        placeholder="Masukkan nama sesuai KTP"
                        value={form.namaLengkap}
                        onChange={handleChange("namaLengkap")}
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all ${
                          formErrors.namaLengkap ? "border-[#d74c3c] focus:border-[#d74c3c]" : "border-[rgba(15,39,67,0.12)] focus:border-[#f37021]/60"
                        }`}
                      />
                    </div>
                    {formErrors.namaLengkap && (
                      <p className="text-xs text-[#d74c3c] font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {formErrors.namaLengkap}
                      </p>
                    )}
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="block text-xs font-bold text-[#475467] mb-1.5">
                      Nomor Identitas (NIK) <span className="text-[#d74c3c]">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                      <input
                        type="text"
                        placeholder="16 digit NIK"
                        maxLength={16}
                        value={form.nik}
                        onChange={handleChange("nik")}
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all ${
                          formErrors.nik ? "border-[#d74c3c] focus:border-[#d74c3c]" : "border-[rgba(15,39,67,0.12)] focus:border-[#f37021]/60"
                        }`}
                      />
                    </div>
                    {formErrors.nik && (
                      <p className="text-xs text-[#d74c3c] font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {formErrors.nik}
                      </p>
                    )}
                  </div>

                  {/* No Handphone */}
                  <div>
                    <label className="block text-xs font-bold text-[#475467] mb-1.5">
                      Nomor Handphone <span className="text-[#d74c3c]">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                      <input
                        type="tel"
                        placeholder="08XXXXXXXXXX"
                        value={form.noHandphone}
                        onChange={handleChange("noHandphone")}
                        className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all ${
                          formErrors.noHandphone ? "border-[#d74c3c] focus:border-[#d74c3c]" : "border-[rgba(15,39,67,0.12)] focus:border-[#f37021]/60"
                        }`}
                      />
                    </div>
                    {formErrors.noHandphone && (
                      <p className="text-xs text-[#d74c3c] font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {formErrors.noHandphone}
                      </p>
                    )}
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-[#475467] mb-1.5">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="contoh@email.com (opsional)"
                        value={form.email}
                        onChange={handleChange("email")}
                        className={`w-full h-12 pl-4 pr-4 rounded-xl border bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all ${
                          formErrors.email ? "border-[#d74c3c] focus:border-[#d74c3c]" : "border-[rgba(15,39,67,0.12)] focus:border-[#f37021]/60"
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-xs text-[#d74c3c] font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Kursi */}
                  <div>
                    <label className="block text-xs font-bold text-[#475467] mb-1.5">
                      Pilihan Kursi <span className="text-[#d74c3c]">*</span>
                    </label>
                    <div className="relative">
                      <Chair size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] z-10" />
                      <select
                        value={form.kursi}
                        onChange={handleChange("kursi")}
                        className={`w-full h-12 pl-10 pr-10 rounded-xl border bg-white text-[#101828] text-sm font-medium focus:outline-none focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all appearance-none cursor-pointer ${
                          formErrors.kursi ? "border-[#d74c3c] focus:border-[#d74c3c]" : "border-[rgba(15,39,67,0.12)] focus:border-[#f37021]/60"
                        }`}
                      >
                        <option value="">Pilih nomor kursi</option>
                        {SEAT_OPTIONS.map((seat) => {
                          const isBooked = BOOKED_SEATS.includes(seat.value);
                          return (
                            <option key={seat.value} value={seat.value} disabled={isBooked}>
                              {seat.label} {isBooked ? "(Sudah dipesan)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {formErrors.kursi && (
                      <p className="text-xs text-[#d74c3c] font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {formErrors.kursi}
                      </p>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 rounded-xl bg-[#ffeeec] border border-[rgba(215,76,60,0.16)] text-[#b42318] text-sm font-semibold flex items-center gap-2">
                      <AlertTriangle size={16} />
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-13 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-sm font-bold shadow-[0_14px_22px_rgba(243,112,33,0.22)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        LANJUT KE PEMBAYARAN
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* ── RIGHT: Booking Summary ── */}
            <div className="lg:col-span-5">
              <div className="bg-[#0f2743] rounded-3xl p-6 md:p-7 border border-[rgba(255,255,255,0.08)] shadow-lg sticky top-24 relative overflow-hidden">
                <div
                  className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(243,112,33,0.5) 0%, transparent 70%)" }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-[#f37021]" />
                    </div>
                    <h3 className="text-white font-bold text-base">Ringkasan Perjalanan</h3>
                  </div>

                  <div className="h-px bg-white/10 mb-5" />

                  {/* Train Icon + Name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Train size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-base">{trainData.name}</div>
                      <div className="text-white/60 text-xs font-semibold">{trainData.className}</div>
                    </div>
                  </div>

                  {/* Route Summary */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 text-center">
                      <div className="text-white font-bold font-display text-xl">{trainData.departure}</div>
                      <div className="text-white/60 text-xs font-semibold">{trainData.from}</div>
                      <div className="text-white/40 text-[10px]">{trainData.fromFull}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f37021]" />
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[#f37021] to-white/30" />
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

                  {/* Detail Items */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/50" />
                        <span className="text-white/70 text-xs font-medium">Tanggal</span>
                      </div>
                      <span className="text-white text-xs font-bold">Selasa, 9 Juni 2026</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-white/50" />
                        <span className="text-white/70 text-xs font-medium">Durasi</span>
                      </div>
                      <span className="text-white text-xs font-bold">{trainData.duration}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-white/50" />
                        <span className="text-white/70 text-xs font-medium">Rute</span>
                      </div>
                      <span className="text-white text-xs font-bold">{trainData.from} → {trainData.to}</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 mb-4" />

                  {/* Total Price */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-white/70 text-sm font-semibold">Total Tiket</span>
                    <span className="text-white font-bold font-display text-2xl">
                      Rp {trainData.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <p className="text-white/40 text-[11px] leading-relaxed">
                    <span className="text-white/60">✱</span> Harga sudah termasuk pajak dan biaya layanan.
                    Tiket elektronik akan dikirim setelah pembayaran berhasil.
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
