import { useState } from "react";
import Link from "next/link";
import {
  Search, Train, MapPin, Clock, Calendar, User, CreditCard,
  CheckCircle, XCircle, ArrowRight, Package, Smartphone, FileText, Loader2
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import { formatCurrency } from "../lib/train-utils";

const TRACKING_STEPS = [
  { key: "booking", label: "Pemesanan", icon: FileText },
  { key: "payment", label: "Menunggu Pembayaran", icon: CreditCard },
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
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!bookingCode.trim()) return;

    setLoading(true);
    setSearched(false);
    setTrackingData(null);
    setError("");

    try {
      const code = bookingCode.trim();

      if (!/^KAI-/i.test(code)) {
        setError("Format kode booking tidak valid. Contoh: KAI-A3X9B2Z7");
        setSearched(true);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/purchases/code/${encodeURIComponent(code)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(`Pemesanan dengan kode "${code}" tidak ditemukan.`);
          setSearched(true);
          setLoading(false);
          return;
        }
        throw new Error("Gagal memuat data");
      }

      const purchase = await res.json();

      // Map purchase data to tracking format
      const status = purchase.status_pembayaran || "paid";
      const trackStatus = status === "paid" ? "confirmation"
        : status === "pending" ? "payment"
        : status === "cancelled" ? "booking"
        : "confirmation";

      setTrackingData({
        bookingCode: purchase.kode_booking || `KAI-${String(purchase.id).padStart(5, "0")}`,
        status: trackStatus,
        trainName: purchase.nama_kereta,
        className: purchase.kelas || "-",
        from: purchase.asal || "-",
        fromFull: purchase.asal || "-",
        to: purchase.tujuan || "-",
        toFull: purchase.tujuan || "-",
        departure: "-",
        arrival: "-",
        date: purchase.tanggal_keberangkatan || purchase.tanggal_pembelian?.split(" ")[0] || "-",
        passengers: Number(purchase.jumlah_tiket) || 1,
        totalPrice: Number(purchase.total_harga) || 0,
        name: purchase.nama_pembeli,
        paymentMethod: purchase.metode_pembayaran || "-",
        paidAt: purchase.tanggal_pembelian || "-",
        estimatedArrival: "-",
        platform: "-",
        gate: "-",
      });

      setSearched(true);
    } catch {
      setError("Terjadi kesalahan saat mencari pesanan. Coba lagi.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout title="Status Pesanan">
      <section className="modern-hero">
        <div className="modern-hero-content">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/80 px-3 py-1 text-[11px] font-bold backdrop-blur">
              <Package size={12} /> Tracking Pesanan
            </span>
          </div>
          <h1>Status Pesanan</h1>
          <p>Lacak status pemesanan tiket Anda secara real-time.</p>
        </div>
      </section>

      <div className="modern-search-card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
            <input type="text" aria-label="Kode booking" placeholder="Masukkan kode booking (contoh: KAI-00001)" value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              className="input-control" style={{ paddingLeft: 44 }} required />
          </div>
          <button type="submit" disabled={loading}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white text-sm font-bold shadow-[0_10px_18px_rgba(79,70,229,0.22)] hover:from-[#4338ca] hover:to-[#4f46e5] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Mencari...</>
              : <><Search size={16} /> Lacak Pesanan</>}
          </button>
        </form>
        <p className="text-[11px] text-[#98a2b3] mt-3">Kode booking dapat ditemukan di email konfirmasi atau e-tiket Anda. Format: KAI-XXXXX</p>
      </div>

      {loading && <LoadingState title="Mencari pesanan..." description="Memeriksa data pemesanan Anda." />}

      {!loading && searched && error && (
        <div role="alert">
          <EmptyState title="Pesanan Tidak Ditemukan"
            description={error}
            action={<button onClick={() => { setSearched(false); setError(""); }} className="btn btn-primary">Coba Lagi</button>} />
        </div>
      )}

      {!loading && searched && trackingData && (
        <div className="flex flex-col gap-5">
          <div className="modern-card-static p-6">
            <h2 className="text-lg font-bold font-display text-[#101828] mb-5">Status Perjalanan</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[rgba(15,39,67,0.08)]" />
              <div className="space-y-6 relative">
                {TRACKING_STEPS.map((step) => {
                  const status = getTrackingStatus(trackingData.status, step.key);
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        status === "completed" ? "bg-[#e4f8ee] text-[#1f9d63]"
                        : status === "active" ? "bg-[#eef2ff] text-[#4f46e5] ring-4 ring-[rgba(79,70,229,0.15)]"
                        : "bg-[#f4f5f7] text-[#98a2b3]"
                      }`}>
                        {status === "completed" ? <CheckCircle size={18} /> : <Icon size={18} />}
                      </div>
                      <div className="flex-1 pt-1.5">
                        <div className={`text-sm font-bold ${
                          status === "completed" ? "text-[#1f9d63]"
                          : status === "active" ? "text-[#4f46e5]"
                          : "text-[#98a2b3]"
                        }`}>{step.label}</div>
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

          <div className="modern-card-static p-6">
            <h2 className="text-lg font-bold font-display text-[#101828] mb-4">Detail Pesanan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: FileText, label: "Kode Booking", value: trackingData.bookingCode, color: "text-[#4f46e5]" },
                { icon: Train, label: "Kereta", value: trackingData.trainName, color: "text-[#4f46e5]" },
                { icon: User, label: "Penumpang", value: `${trackingData.name}${trackingData.passengers > 1 ? ` & ${trackingData.passengers - 1} lainnya` : ""}`, color: "text-[#4f46e5]" },
                { icon: MapPin, label: "Rute", value: `${trackingData.from} → ${trackingData.to}`, color: "text-[#4f46e5]" },
                { icon: Calendar, label: "Jadwal", value: trackingData.date, color: "text-[#4f46e5]" },
                { icon: CreditCard, label: "Pembayaran", value: trackingData.paymentMethod, color: "text-[#4f46e5]" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,39,67,0.04)]">
                    <Icon size={16} className={item.color + " flex-shrink-0"} />
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">{item.label}</div>
                      <div className="text-sm font-bold text-[#101828]">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href={`/cek-pesanan?bookingCode=${trackingData.bookingCode}&purchaseId=${trackingData.bookingCode.replace("KAI-", "")}`}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white text-xs font-bold shadow-[0_10px_18px_rgba(79,70,229,0.25)] hover:from-[#4338ca] hover:to-[#4f46e5] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
              <Smartphone size={16} /> Lihat E-Tiket
            </Link>
            <Link href="/riwayat"
              className="h-11 px-5 rounded-xl border border-[rgba(79,70,229,0.28)] bg-[#eef2ff]/70 text-[#4f46e5] text-xs font-bold hover:bg-[#e0e7ff] transition-all flex items-center gap-2">
              Riwayat Pesanan
            </Link>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
