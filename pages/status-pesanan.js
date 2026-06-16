import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Train,
  MapPin,
  Clock,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Package,
  Smartphone,
  FileText,
  Loader2,
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import { formatCurrency } from "../lib/train-utils";

const TRACKING_STEPS = [
  { key: "booking", label: "Pemesanan", icon: FileText },
  { key: "payment", label: "Pembayaran", icon: CreditCard },
  { key: "confirmation", label: "Konfirmasi", icon: CheckCircle },
  { key: "boarding", label: "Boarding", icon: Train },
  { key: "completed", label: "Selesai", icon: CheckCircle },
];

function getTrackingStatus(currentStatus, stepKey) {
  const order = ["booking", "payment", "confirmation", "boarding", "completed"];
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepKey);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export default function StatusPesananPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Contoh data tracking
  const trackingData = {
    bookingCode: "KAI-7X9B2Z",
    status: "confirmation",
    trainName: "Argo Bromo Anggrek",
    className: "Eksekutif",
    from: "GMR",
    fromFull: "Gambir",
    to: "SBY",
    toFull: "Surabaya Pasar Turi",
    departure: "08:30",
    arrival: "14:45",
    date: "2026-06-09",
    passengers: 2,
    totalPrice: 700000,
    name: "Rizky",
    paymentMethod: "GoPay",
    paidAt: "2026-06-08 14:30",
    estimatedArrival: "14:45",
    platform: "Platform 3",
    gate: "Gate B",
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!bookingCode.trim()) return;
    setLoading(true);
    setSearched(false);
    // Simulasi pencarian API
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 1000);
  };

  const trackingStatus = getTrackingStatus(trackingData.status, "");

  return (
    <PublicLayout title="Status Pesanan">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2743] to-[#173b64] p-6 md:p-8 mb-6 shadow-lg border border-[rgba(255,255,255,0.06)]">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(243,112,33,0.6) 0%, transparent 70%)" }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-bold">
                <Package size={12} />
                Tracking Pesanan
              </span>
            </div>
            <h1 className="text-white font-bold font-display text-2xl md:text-3xl mb-2">Status Pesanan</h1>
            <p className="text-white/60 text-sm max-w-[520px]">
              Lacak status pemesanan tiket Anda secara real-time. Masukkan kode booking untuk memulai.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-[rgba(186,151,113,0.12)] shadow-md mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
              <input
                type="text"
                placeholder="Masukkan kode booking (contoh: KAI-7X9B2Z)"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#101828] text-sm font-medium placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/60 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.12)] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-sm font-bold shadow-[0_10px_18px_rgba(243,112,33,0.22)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Lacak Pesanan
                </>
              )}
            </button>
          </form>
          <p className="text-[11px] text-[#98a2b3] mt-3">
            Kode booking dapat ditemukan di email konfirmasi atau e-tiket Anda.
          </p>
        </div>

        {/* Loading State */}
        {loading && <LoadingState title="Mencari pesanan..." description="Memeriksa data pemesanan Anda." />}

        {/* Not Found */}
        {!loading && searched && !trackingData && (
          <EmptyState
            title="Pesanan Tidak Ditemukan"
            description={`Tidak ada pemesanan dengan kode "${bookingCode}". Periksa kembali kode booking Anda.`}
            action={
              <button onClick={() => setSearched(false)} className="btn btn-primary">
                Coba Lagi
              </button>
            }
          />
        )}

        {/* Tracking Result */}
        {!loading && searched && trackingData && (
          <div className="flex flex-col gap-5">
            {/* Tracking Timeline */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-[rgba(186,151,113,0.12)] shadow-md">
              <h2 className="text-lg font-bold font-display text-[#101828] mb-5">Status Perjalanan</h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[rgba(15,39,67,0.08)]" />

                <div className="space-y-6 relative">
                  {TRACKING_STEPS.map((step, idx) => {
                    const status = getTrackingStatus(trackingData.status, step.key);
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-4 relative">
                        <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          status === "completed"
                            ? "bg-[#e4f8ee] text-[#1f9d63]"
                            : status === "active"
                              ? "bg-[#fff0e2] text-[#f37021] ring-4 ring-[rgba(243,112,33,0.15)]"
                              : "bg-[#f4f5f7] text-[#98a2b3]"
                        }`}>
                          {status === "completed" ? (
                            <CheckCircle size={18} />
                          ) : (
                            <Icon size={18} />
                          )}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <div className={`text-sm font-bold ${
                            status === "completed"
                              ? "text-[#1f9d63]"
                              : status === "active"
                                ? "text-[#f37021]"
                                : "text-[#98a2b3]"
                          }`}>
                            {step.label}
                          </div>
                          <div className="text-xs text-[#667085] mt-0.5">
                            {status === "completed" && `${step.label} selesai`}
                            {status === "active" && "Sedang diproses..."}
                            {status === "pending" && "Menunggu"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-[rgba(186,151,113,0.12)] shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-display text-[#101828]">Detail Pesanan</h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  trackingData.status === "completed" 
                    ? "bg-[#e4f8ee] text-[#067647] border border-[rgba(31,157,99,0.14)]"
                    : trackingData.status === "cancelled"
                      ? "bg-[#fef3f2] text-[#b42318] border border-[rgba(215,76,60,0.14)]"
                      : "bg-[#eff4ff] text-[#175cd3] border border-[rgba(47,111,237,0.14)]"
                }`}>
                  {trackingData.status === "completed" ? "Selesai" : 
                   trackingData.status === "cancelled" ? "Dibatalkan" : "Diproses"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-[rgba(15,39,67,0.06)]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(243,112,33,0.12)] to-[rgba(15,39,67,0.08)] flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-navy" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#667085] font-semibold">Kode Booking</div>
                    <div className="text-base font-bold font-mono text-[#101828]">{trackingData.bookingCode}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,39,67,0.04)]">
                    <Train size={16} className="text-[#f37021] flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Kereta</div>
                      <div className="text-sm font-bold text-[#101828]">{trackingData.trainName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,39,67,0.04)]">
                    <User size={16} className="text-[#0f2743] flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Penumpang</div>
                      <div className="text-sm font-bold text-[#101828]">{trackingData.name} & {trackingData.passengers - 1} lainnya</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,39,67,0.04)]">
                    <MapPin size={16} className="text-[#f37021] flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Rute</div>
                      <div className="text-sm font-bold text-[#101828]">{trackingData.from} → {trackingData.to}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,39,67,0.04)]">
                    <Calendar size={16} className="text-[#0f2743] flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Jadwal</div>
                      <div className="text-sm font-bold text-[#101828]">{trackingData.date} {trackingData.departure}</div>
                    </div>
                  </div>
                </div>

                {/* Info Tambahan */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[rgba(243,112,33,0.08)] to-[rgba(255,255,255,0.5)] border border-[rgba(243,112,33,0.12)]">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">Platform</div>
                    <div className="font-bold text-[#101828]">{trackingData.platform}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[rgba(15,39,67,0.08)] to-[rgba(255,255,255,0.5)] border border-[rgba(15,39,67,0.12)]">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">Gate</div>
                    <div className="font-bold text-[#101828]">{trackingData.gate}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(15,39,67,0.04)] mt-3">
                  <span className="text-xs text-[#667085] font-semibold">Total Pembayaran</span>
                  <span className="text-lg font-bold font-display text-[#c6520f]">
                    {formatCurrency(trackingData.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href={`/cek-pesanan?bookingCode=${trackingData.bookingCode}&trainName=${encodeURIComponent(trackingData.trainName)}&from=${trackingData.from}&to=${trackingData.to}&fromFull=${encodeURIComponent(trackingData.fromFull)}&toFull=${encodeURIComponent(trackingData.toFull)}&departure=${trackingData.departure}&arrival=${trackingData.arrival}&className=${trackingData.className}&price=${trackingData.totalPrice}`}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-xs font-bold shadow-[0_10px_18px_rgba(243,112,33,0.25)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Smartphone size={16} />
                Lihat E-Tiket
              </Link>
              <Link
                href="/riwayat"
                className="h-11 px-5 rounded-xl border border-[rgba(243,112,33,0.28)] bg-[#fff0e2]/70 text-[#c6520f] text-xs font-bold hover:bg-[#ffdcc0] transition-all flex items-center gap-2"
              >
                Riwayat Pesanan
              </Link>
            </div>
          </div>
        )}

        {/* Empty / Info State */}
        {!loading && !searched && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[rgba(186,151,113,0.12)] shadow-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(243,112,33,0.10)] flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-[#f37021]" />
            </div>
            <h2 className="text-lg font-bold font-display text-[#101828] mb-2">
              Cek Status Pemesanan
            </h2>
            <p className="text-[#667085] text-sm max-w-[420px] mx-auto mb-6">
              Masukkan kode booking Anda untuk melacak status pemesanan secara real-time.
              Kode booking dikirim melalui email setelah pemesanan berhasil.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-[#98a2b3]">
              <span className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#1f9d63]" /> Konfirmasi
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-[#d7a43a]" /> Dalam Perjalanan
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#1f9d63]" /> Selesai
              </span>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
