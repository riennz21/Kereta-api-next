import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Train, MapPin, Clock, Calendar, User, CreditCard,
  ArmchairIcon as Chair, CheckCircle, ArrowLeft, Download, Printer, Smartphone, Loader2
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import { formatCurrency } from "../lib/train-utils";

function QRCodePlaceholder() {
  return (
    <div className="w-full max-w-[200px] mx-auto">
      <div className="aspect-square bg-white rounded-xl p-3 border-2 border-slate-200 shadow-sm">
        <div className="grid grid-cols-11 gap-0.5 w-full h-full">
          {Array.from({ length: 121 }).map((_, i) => {
            const isBlack = 
              i < 22 || i > 98 || i % 11 === 0 || i % 11 === 10 ||
              (i >= 22 && i <= 32 && i % 11 === 0) ||
              (i >= 88 && i <= 98 && i % 11 === 10) ||
              (i > 33 && i < 87 && (i % 11 === 0 || i % 11 === 10)) ||
              (i > 44 && i < 76 && i % 11 === 5) || Math.random() > 0.6;
            return <div key={i} className={`rounded-sm ${isBlack ? "bg-slate-900" : "bg-transparent"}`} />;
          })}
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500">
          <Smartphone size={12} /> Pindai saat Boarding di Stasiun
        </div>
      </div>
    </div>
  );
}

export default function CekPesananPage() {
  const router = useRouter();
  const query = router.query;
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);

  // If we have a purchaseId, fetch from API
  useEffect(() => {
    const purchaseId = query.purchaseId;
    if (!purchaseId || query.trainName) return; // Skip if we already have all data or no purchaseId

    const fetchPurchase = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/purchases/${purchaseId}`);
        if (!res.ok) throw new Error();
        const purchase = await res.json();
        if (purchase) {
          setFetchedData(purchase);
        }
      } catch {
        // Silently fall back to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [query.purchaseId, query.trainName]);

  // Use fetched data if available, otherwise use query params, otherwise use defaults
  const purchase = fetchedData;
  const booking = purchase
    ? {
        bookingCode: purchase.kode_booking || `KAI-${String(purchase.id).padStart(5, "0")}`,
        purchaseId: purchase.id,
        name: purchase.nama_pembeli || query.name || "Penumpang",
        nik: query.nik || "-",
        phone: query.phone || purchase.no_telepon || "-",
        seat: query.seat || "-",
        trainName: purchase.nama_kereta || query.trainName || "-",
        from: purchase.asal || query.from || "-",
        to: purchase.tujuan || query.to || "-",
        fromFull: query.fromFull || purchase.asal || "-",
        toFull: query.toFull || purchase.tujuan || "-",
        departure: query.departure || "-",
        arrival: query.arrival || "-",
        duration: query.duration || "-",
        className: purchase.kelas || query.className || "-",
        price: Number(purchase.total_harga || query.price || 0),
        passengers: Number(purchase.jumlah_tiket) || 1,
      }
    : {
        bookingCode: query.bookingCode || "KAI-7X9B2Z",
        name: query.name || "riee",
        nik: query.nik || "3273010101950001",
        phone: query.phone || "081234567890",
        seat: query.seat || "12A",
        trainName: query.trainName || "Argo Bromo Anggrek",
        from: query.from || "GMR",
        to: query.to || "SBY",
        fromFull: query.fromFull || "Gambir",
        toFull: query.toFull || "Surabaya Pasar Turi",
        departure: query.departure || "08:30",
        arrival: query.arrival || "14:45",
        duration: query.duration || "6j 15m",
        className: query.className || "Eksekutif",
        price: Number(query.price) || 350000,
      };

  if (loading) {
    return (
      <PublicLayout title="E-Tiket">
        <div className="max-w-[720px] mx-auto text-center py-12">
          <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat data tiket...</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout title="E-Tiket">
      <div className="max-w-[720px] mx-auto">
        <Link href="/jadwal"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-5 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/80 rounded-2xl p-4 mb-6 border border-emerald-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={22} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-800">Pemesanan Berhasil!</div>
            <div className="text-xs text-emerald-600">Tiket elektronik siap digunakan. Simpan e-tiket ini untuk boarding.</div>
          </div>
        </div>

        {/* E-TICKET */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600" />
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">Kode Booking</div>
                <div className="text-2xl md:text-3xl font-bold font-display text-slate-900 tracking-tight">{booking.bookingCode}</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold whitespace-nowrap">
                <CheckCircle size={14} /> LUNAS / BERHASIL
              </span>
            </div>

            <div className="relative h-0 mb-6">
              <div className="absolute left-[-24px] right-[-24px] border-t-2 border-dashed border-slate-200" />
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-3">Data Penumpang</div>
                <div className="space-y-2.5">
                  {[
                    { icon: User, label: "Nama", value: booking.name, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { icon: CreditCard, label: "NIK", value: booking.nik, color: "text-slate-600", bg: "bg-slate-100" },
                    { icon: Chair, label: "Kursi", value: booking.seat, color: "text-slate-600", bg: "bg-slate-100" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={15} className={item.color} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold">{item.label}</div>
                          <div className="text-sm font-bold text-slate-900">{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-3">Detail Perjalanan</div>
                <div className="space-y-2.5">
                  {[
                    { icon: Train, label: "Kereta", value: `${booking.trainName} — ${booking.className}`, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { icon: MapPin, label: "Rute", value: `${booking.from} (${booking.fromFull}) → ${booking.to} (${booking.toFull})`, color: "text-slate-600", bg: "bg-slate-100" },
                    { icon: Clock, label: "Jadwal", value: `${booking.departure} - ${booking.arrival} (${booking.duration})`, color: "text-slate-600", bg: "bg-slate-100" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={15} className={item.color} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold">{item.label}</div>
                          <div className="text-sm font-bold text-slate-900">{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative h-0 mb-6">
              <div className="absolute left-[-24px] right-[-24px] border-t-2 border-dashed border-slate-200" />
            </div>

            {/* QR & Price */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <QRCodePlaceholder />
              </div>
              <div className="flex-1 flex flex-col items-center md:items-end gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">Total Pembayaran</div>
                  <div className="text-2xl font-bold font-display text-indigo-600">
                    Rp {booking.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <button className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold shadow-[0_10px_18px_rgba(79,70,229,0.25)] hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
            <Download size={16} /> Simpan E-Tiket
          </button>
          <button className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
            <Printer size={16} /> Cetak Tiket
          </button>
          <Link href="/jadwal"
            className="h-11 px-5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2">
            <Train size={16} /> Pesan Tiket Lain
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
