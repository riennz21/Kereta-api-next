import { useRouter } from "next/router";
import Link from "next/link";
import {
  Train,
  MapPin,
  Clock,
  Calendar,
  User,
  CreditCard,
  ArmchairIcon as Chair,
  CheckCircle,
  ArrowLeft,
  Download,
  Printer,
  Smartphone,
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";

function QRCodePlaceholder() {
  return (
    <div className="w-full max-w-[200px] mx-auto">
      {/* Simulated QR Code grid */}
      <div className="aspect-square bg-white rounded-xl p-3 border-2 border-[rgba(15,39,67,0.08)] shadow-sm">
        <div className="grid grid-cols-11 gap-0.5 w-full h-full">
          {Array.from({ length: 121 }).map((_, i) => {
            const isBlack = 
              i < 22 || i > 98 || 
              i % 11 === 0 || i % 11 === 10 ||
              (i >= 22 && i <= 32 && i % 11 === 0) ||
              (i >= 88 && i <= 98 && i % 11 === 10) ||
              (i > 33 && i < 87 && (i % 11 === 0 || i % 11 === 10)) ||
              (i > 44 && i < 76 && i % 11 === 5) ||
              Math.random() > 0.6;
            return (
              <div
                key={i}
                className={`rounded-sm ${isBlack ? "bg-[#101828]" : "bg-transparent"}`}
              />
            );
          })}
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#667085]">
          <Smartphone size={12} />
          Pindai saat Boarding di Stasiun
        </div>
      </div>
    </div>
  );
}

export default function CekPesananPage() {
  const router = useRouter();
  const query = router.query;

  const booking = {
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

  return (
    <PublicLayout title="E-Tiket">
      <div className="max-w-[720px] mx-auto">
        {/* Back Link */}
        <Link
          href="/jadwal"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#667085] hover:text-[#c6520f] mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-[#e4f8ee] to-[#f2fcf7] rounded-2xl p-4 mb-6 border border-[rgba(31,157,99,0.16)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1f9d63]/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={22} className="text-[#1f9d63]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#067647]">Pemesanan Berhasil!</div>
            <div className="text-xs text-[#067647]/70">Tiket elektronik siap digunakan. Simpan e-tiket ini untuk boarding.</div>
          </div>
        </div>

        {/* ── E-TICKET / BOARDING PASS ── */}
        <div className="bg-white rounded-3xl shadow-[0_22px_45px_rgba(15,39,67,0.12)] border border-[rgba(186,151,113,0.16)] overflow-hidden relative">
          {/* Top Gradient Accent */}
          <div className="h-2 bg-gradient-to-r from-[#f37021] via-[#ff9148] to-[#f37021]" />

          <div className="p-6 md:p-8">
            {/* ── Header: Booking Code + Status ── */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#667085] mb-1">
                  Kode Booking
                </div>
                <div className="text-2xl md:text-3xl font-bold font-display text-[#101828] tracking-tight">
                  {booking.bookingCode}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e4f8ee] border border-[rgba(31,157,99,0.14)] text-[#067647] text-xs font-bold whitespace-nowrap">
                <CheckCircle size={14} />
                LUNAS / BERHASIL
              </span>
            </div>

            {/* Dashed Divider */}
            <div className="relative h-0 mb-6">
              <div className="absolute left-[-24px] right-[-24px] border-t-2 border-dashed border-[rgba(186,151,113,0.25)]" />
            </div>

            {/* ── Middle: Passenger & Trip Details ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left: Passenger Info */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#667085] mb-3">
                  Data Penumpang
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(243,112,33,0.10)] flex items-center justify-center flex-shrink-0">
                      <User size={15} className="text-[#c6520f]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Nama</div>
                      <div className="text-sm font-bold text-[#101828]">{booking.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(15,39,67,0.06)] flex items-center justify-center flex-shrink-0">
                      <CreditCard size={15} className="text-[#475467]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">NIK</div>
                      <div className="text-sm font-bold text-[#101828]">{booking.nik}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(15,39,67,0.06)] flex items-center justify-center flex-shrink-0">
                      <Chair size={15} className="text-[#475467]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Kursi</div>
                      <div className="text-sm font-bold text-[#101828]">{booking.seat}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Trip Details */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#667085] mb-3">
                  Detail Perjalanan
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(243,112,33,0.10)] flex items-center justify-center flex-shrink-0">
                      <Train size={15} className="text-[#c6520f]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Kereta</div>
                      <div className="text-sm font-bold text-[#101828]">{booking.trainName}</div>
                      <div className="text-xs text-[#667085] font-medium">{booking.className}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(15,39,67,0.06)] flex items-center justify-center flex-shrink-0">
                      <MapPin size={15} className="text-[#475467]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Rute</div>
                      <div className="text-sm font-bold text-[#101828]">
                        {booking.from} ({booking.fromFull}) → {booking.to} ({booking.toFull})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(15,39,67,0.06)] flex items-center justify-center flex-shrink-0">
                      <Clock size={15} className="text-[#475467]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#667085] font-semibold">Jadwal</div>
                      <div className="text-sm font-bold text-[#101828]">
                        {booking.departure} - {booking.arrival} ({booking.duration})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashed Divider */}
            <div className="relative h-0 mb-6">
              <div className="absolute left-[-24px] right-[-24px] border-t-2 border-dashed border-[rgba(186,151,113,0.25)]" />
            </div>

            {/* ── Bottom: Barcode / QR Area ── */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <QRCodePlaceholder />
              </div>
              <div className="flex-1 flex flex-col items-center md:items-end gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#667085] mb-1">
                    Total Pembayaran
                  </div>
                  <div className="text-2xl font-bold font-display text-[#c6520f]">
                    Rp {booking.price.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#98a2b3] font-semibold">
                    {booking.from} → {booking.to}
                  </span>
                  <span className="text-[#d0d5dd]">•</span>
                  <span className="text-[10px] text-[#98a2b3] font-semibold">
                    {booking.departure}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <button className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-xs font-bold shadow-[0_10px_18px_rgba(243,112,33,0.25)] hover:from-[#c6520f] hover:to-[#ef7f32] transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
            <Download size={16} />
            Simpan E-Tiket
          </button>
          <button className="h-11 px-5 rounded-xl border border-[rgba(15,39,67,0.12)] bg-white text-[#475467] text-xs font-bold hover:bg-[#f8f2eb] transition-all flex items-center gap-2">
            <Printer size={16} />
            Cetak Tiket
          </button>
          <Link
            href="/jadwal"
            className="h-11 px-5 rounded-xl border border-[rgba(243,112,33,0.28)] bg-[#fff0e2]/70 text-[#c6520f] text-xs font-bold hover:bg-[#ffdcc0] transition-all flex items-center gap-2"
          >
            <Train size={16} />
            Pesan Tiket Lain
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
