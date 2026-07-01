import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Train, MapPin, Clock, Calendar, User, CreditCard,
  ArmchairIcon as Chair, CheckCircle, XCircle, Clock as ClockIcon,
  ArrowLeft, Download, Printer, Smartphone, Loader2
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import { formatCurrency } from "../lib/train-utils";

const STATUS_CONFIG = {
  paid: { label: "Lunas", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle },
  pending: { label: "Menunggu Pembayaran", badge: "bg-amber-50 text-amber-700 border border-amber-200", icon: ClockIcon },
  cancelled: { label: "Dibatalkan", badge: "bg-red-50 text-red-700 border border-red-200", icon: XCircle },
};

function RealQRCode({ value, size = 180 }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function generateCode() {
      try {
        const qrCodeModule = await import("qrcode");
        const qrCode = qrCodeModule.default || qrCodeModule;
        const url = await qrCode.toDataURL(value, {
          width: size * 2,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setDataUrl(url);
      } catch {
        // The ticket still renders without the QR image if generation fails.
      }
    }

    generateCode();
    return () => { cancelled = true; };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div className="w-full max-w-[200px] mx-auto">
        <div className="aspect-square bg-white rounded-xl p-3 border-2 border-slate-200 shadow-sm flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
        <div className="text-center mt-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500">
            <Smartphone size={12} /> Menyiapkan QR Code...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[200px] mx-auto">
      <div className="aspect-square bg-white rounded-xl p-2.5 border-2 border-slate-200 shadow-sm flex items-center justify-center relative group">
        <img src={dataUrl} alt={`QR Code - ${value}`} className="w-full h-full"
          style={{ imageRendering: "pixelated" }} />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 pointer-events-none" />
      </div>
      <div className="text-center mt-2">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500">
          <Smartphone size={12} /> Pindai saat Boarding di Stasiun
        </div>
      </div>
    </div>
  );
}

const BADGE_COLORS = {
  paid: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  pending: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  cancelled: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

const QR_API_BASE = "https://api.qrserver.com/v1/create-qr-code/";

function getQRImageUrl(text, size = 200) {
  const params = new URLSearchParams({
    data: text,
    size: `${size}x${size}`,
    margin: 12,
    format: "png",
    bgcolor: "ffffff",
    color: "0f172a",
    qzone: 1,
    ecc: "M",
  });
  return `${QR_API_BASE}?${params.toString()}`;
}

function generateTicketHTML(booking, paymentStatus, statusLabel) {
  const badgeColors = BADGE_COLORS[paymentStatus] || BADGE_COLORS.paid;
  const qrImageUrl = getQRImageUrl(booking.bookingCode, 220);
  const items = [
    { label: "Kode Booking", value: booking.bookingCode },
    { label: "Nama Penumpang", value: booking.name },
    { label: "NIK", value: booking.nik },
    { label: "No. Telepon", value: booking.phone },
    { label: "Kursi", value: booking.seat },
    { label: "Kereta", value: `${booking.trainName} — ${booking.className}` },
    { label: "Rute", value: `${booking.from} (${booking.fromFull}) → ${booking.to} (${booking.toFull})` },
    { label: "Jadwal", value: `${booking.departure} - ${booking.arrival} (${booking.duration})` },
    { label: "Status", value: statusLabel },
  ];

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${item.label}</td>
        <td style="padding: 8px 12px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-weight: 700;">${item.value}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>E-Tiket - ${booking.bookingCode}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, sans-serif;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
    }
    .ticket {
      max-width: 680px;
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header-bar {
      height: 8px;
      background: linear-gradient(90deg, #4f46e5, #818cf8, #4f46e5);
    }
    .body { padding: 32px; }
    .title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 24px;
    }
    table { width: 100%; border-collapse: collapse; }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px dashed #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      background: ${badgeColors.bg};
      color: ${badgeColors.color};
      border: 1px solid ${badgeColors.border};
    }
    @media print {
      body { background: white; padding: 0; }
      .ticket { box-shadow: none; border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header-bar"></div>
    <div class="body">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div>
          <div class="title">E-Tiket Kereta Api</div>
          <div class="subtitle">Tunjukkan e-tiket ini saat boarding di stasiun</div>
        </div>
        <div class="badge">${statusLabel}</div>
      </div>
      <table>${rows}</table>
      <div style="display: flex; flex-direction: row; align-items: center; gap: 24px; margin-top: 20px;">
        <div style="flex: 1; display: flex; justify-content: center;">
          <img src="${qrImageUrl}" alt="QR Code" style="width: 180px; height: 180px;" />
        </div>
        <div style="flex: 1; text-align: right;">
          <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">Total Pembayaran</div>
          <div style="font-size: 24px; font-weight: 800; color: #4f46e5;">Rp ${booking.price.toLocaleString("id-ID")}</div>
        </div>
      </div>
      <div class="footer">
        E-Tiket ini adalah bukti pemesanan yang sah. Harap simpan dengan baik.
        <br>Dicetak pada ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  </div>
</body>
</html>`;
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
  const paymentStatus = purchase?.status_pembayaran || query.status || "paid";
  const statusCfg = STATUS_CONFIG[paymentStatus] || STATUS_CONFIG.paid;
  const StatusIcon = statusCfg.icon;

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
        paymentMethod: purchase.metode_pembayaran || "-",
        purchaseDate: purchase.tanggal_pembelian || "-",
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
        paymentMethod: "-",
        purchaseDate: "-",
      };

  const handleDownload = () => {
    const statusLabel = statusCfg.label;
    const html = generateTicketHTML(booking, paymentStatus, statusLabel);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `E-TIKET_${booking.bookingCode.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // Open a new window with just the ticket HTML for a clean print
    const statusLabel = statusCfg.label;
    const html = generateTicketHTML(booking, paymentStatus, statusLabel);
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
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
      <h1 className="sr-only">E-Tiket Kereta</h1>
      <div className="max-w-[720px] mx-auto">
        <Link href="/jadwal"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-5 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* Status Banner */}
        {paymentStatus === "paid" ? (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/80 rounded-2xl p-4 mb-6 border border-emerald-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={22} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-800">Pemesanan Berhasil!</div>
              <div className="text-xs text-emerald-600">Tiket elektronik siap digunakan. Simpan e-tiket ini untuk boarding.</div>
            </div>
          </div>
        ) : paymentStatus === "pending" ? (
          <div className="bg-gradient-to-r from-amber-50 to-amber-50/80 rounded-2xl p-4 mb-6 border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ClockIcon size={22} className="text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-800">Menunggu Pembayaran</div>
              <div className="text-xs text-amber-600">Pembayaran sedang diproses. E-tiket akan tersedia setelah pembayaran dikonfirmasi.</div>
            </div>
          </div>
        ) : paymentStatus === "cancelled" ? (
          <div className="bg-gradient-to-r from-red-50 to-red-50/80 rounded-2xl p-4 mb-6 border border-red-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle size={22} className="text-red-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-red-800">Pemesanan Dibatalkan</div>
              <div className="text-xs text-red-600">Pemesanan ini telah dibatalkan. Silakan hubungi layanan pelanggan untuk informasi lebih lanjut.</div>
            </div>
          </div>
        ) : null}

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
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusCfg.badge}`}>
                <StatusIcon size={14} /> {statusCfg.label}
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
                <RealQRCode value={booking.bookingCode} />
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
          <button onClick={handleDownload}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold shadow-[0_10px_18px_rgba(79,70,229,0.25)] hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2">
            <Download size={16} /> Simpan E-Tiket
          </button>
          <button onClick={handlePrint}
            className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
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
