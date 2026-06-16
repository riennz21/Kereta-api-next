import { useState } from "react";
import Link from "next/link";
import {
  Train,
  MapPin,
  Clock,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock as ClockIcon,
  ArrowRight,
  ArrowLeft,
  FileText,
  Filter,
} from "lucide-react";
import PublicLayout from "../components/public/PublicLayout";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import { formatCurrency } from "../lib/train-utils";

// Data riwayat pesanan contoh (akan digantikan dengan data dari API/database)
const SAMPLE_HISTORY = [
  {
    id: 1,
    bookingCode: "KAI-7X9B2Z",
    trainName: "Argo Bromo Anggrek",
    from: "GMR",
    fromFull: "Gambir",
    to: "SBY",
    toFull: "Surabaya Pasar Turi",
    departure: "08:30",
    arrival: "14:45",
    date: "2026-06-09",
    className: "Eksekutif",
    price: 350000,
    passengers: 2,
    status: "completed",
    paymentMethod: "GoPay",
  },
  {
    id: 2,
    bookingCode: "KAI-A3C8D1",
    trainName: "Taksaka",
    from: "GMR",
    fromFull: "Gambir",
    to: "YK",
    toFull: "Yogyakarta",
    departure: "19:30",
    arrival: "23:45",
    date: "2026-06-15",
    className: "Eksekutif",
    price: 180000,
    passengers: 1,
    status: "completed",
    paymentMethod: "Transfer BCA",
  },
  {
    id: 3,
    bookingCode: "KAI-B5F2E8",
    trainName: "Logawa",
    from: "PWT",
    fromFull: "Purwokerto",
    to: "YK",
    toFull: "Yogyakarta",
    departure: "06:45",
    arrival: "11:30",
    date: "2026-07-01",
    className: "Ekonomi",
    price: 45000,
    passengers: 3,
    status: "upcoming",
    paymentMethod: "DANA",
  },
  {
    id: 4,
    bookingCode: "KAI-D9G4H6",
    trainName: "Bima",
    from: "GMR",
    fromFull: "Gambir",
    to: "SLO",
    toFull: "Solo Balapan",
    departure: "09:15",
    arrival: "13:40",
    date: "2026-05-20",
    className: "Bisnis",
    price: 160000,
    passengers: 1,
    status: "cancelled",
    paymentMethod: "OVO",
  },
  {
    id: 5,
    bookingCode: "KAI-M7N3P9",
    trainName: "Mutiara Selatan",
    from: "BDG",
    fromFull: "Bandung",
    to: "ML",
    toFull: "Malang",
    departure: "15:20",
    arrival: "22:10",
    date: "2026-08-12",
    className: "Bisnis",
    price: 220000,
    passengers: 2,
    status: "upcoming",
    paymentMethod: "Transfer Mandiri",
  },
];

const STATUS_CONFIG = {
  completed: {
    label: "Selesai",
    badge: "bg-[#e4f8ee] text-[#067647] border border-[rgba(31,157,99,0.14)]",
    dot: "bg-[#1f9d63]",
    icon: CheckCircle,
  },
  upcoming: {
    label: "Akan Datang",
    badge: "bg-[#eff4ff] text-[#175cd3] border border-[rgba(47,111,237,0.14)]",
    dot: "bg-[#2f6fed]",
    icon: ClockIcon,
  },
  cancelled: {
    label: "Dibatalkan",
    badge: "bg-[#fef3f2] text-[#b42318] border border-[rgba(215,76,60,0.14)]",
    dot: "bg-[#d74c3c]",
    icon: XCircle,
  },
};

export default function RiwayatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const filteredData = SAMPLE_HISTORY.filter((item) => {
    const matchSearch =
      item.trainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fromFull.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.toFull.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === "all" || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const stats = {
    total: SAMPLE_HISTORY.length,
    completed: SAMPLE_HISTORY.filter((i) => i.status === "completed").length,
    upcoming: SAMPLE_HISTORY.filter((i) => i.status === "upcoming").length,
    cancelled: SAMPLE_HISTORY.filter((i) => i.status === "cancelled").length,
  };

  return (
    <PublicLayout title="Riwayat Pesanan">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2743] to-[#173b64] p-6 md:p-8 mb-6 shadow-lg border border-[rgba(255,255,255,0.06)]">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(243,112,33,0.6) 0%, transparent 70%)" }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-bold">
                <FileText size={12} />
                Riwayat Pemesanan
              </span>
            </div>
            <h1 className="text-white font-bold font-display text-2xl md:text-3xl mb-2">Riwayat Pesanan</h1>
            <p className="text-white/60 text-sm max-w-[520px]">
              Lihat semua pemesanan tiket yang pernah Anda lakukan. Pantau status dan unduh e-tiket.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Pesanan", value: stats.total, color: "text-[#c6520f]" },
            { label: "Selesai", value: stats.completed, color: "text-[#1f9d63]" },
            { label: "Akan Datang", value: stats.upcoming, color: "text-[#2f6fed]" },
            { label: "Dibatalkan", value: stats.cancelled, color: "text-[#d74c3c]" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/90 rounded-2xl p-4 border border-[rgba(186,151,113,0.12)] shadow-sm"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[380px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
            <input
              type="text"
              placeholder="Cari kode booking, nama kereta, atau stasiun..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(15,39,67,0.10)] bg-white/90 text-sm font-medium text-[#101828] placeholder:text-[#98a2b3] focus:outline-none focus:border-[#f37021]/50 focus:shadow-[0_0_0_4px_rgba(243,112,33,0.10)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#667085]" />
            {["all", "completed", "upcoming", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  statusFilter === status
                    ? "bg-[#0f2743] text-white"
                    : "bg-white/90 text-[#475467] border border-[rgba(15,39,67,0.08)] hover:border-[#f37021]/30"
                }`}
              >
                {status === "all" ? "Semua" : STATUS_CONFIG[status]?.label || status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingState title="Memuat riwayat..." description="Sedang mengambil data pemesanan." />
        )}

        {/* Empty State */}
        {!loading && filteredData.length === 0 && (
          <EmptyState
            title="Belum Ada Riwayat Pesanan"
            description={
              searchQuery || statusFilter !== "all"
                ? "Tidak ada pesanan yang cocok dengan filter yang Anda pilih."
                : "Anda belum pernah melakukan pemesanan tiket. Mulai pesan tiket sekarang!"
            }
            action={
              searchQuery || statusFilter !== "all" ? (
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                  className="btn btn-primary"
                >
                  Reset Filter
                </button>
              ) : (
                <Link href="/" className="btn btn-primary">
                  Pesan Tiket
                </Link>
              )
            }
          />
        )}

        {/* History List */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col gap-3">
            {filteredData.map((item) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-[rgba(186,151,113,0.12)] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#667085]">
                          {item.bookingCode}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Train Info */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgba(243,112,33,0.12)] to-[rgba(15,39,67,0.08)] flex items-center justify-center flex-shrink-0">
                          <Train size={16} className="text-navy" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#101828]">{item.trainName}</div>
                          <div className="text-[11px] text-[#667085] font-semibold">{item.className}</div>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                        <MapPin size={12} className="text-[#f37021]" />
                        <span className="font-semibold">{item.from} ({item.fromFull})</span>
                        <ArrowRight size={10} className="text-[#98a2b3]" />
                        <span className="font-semibold">{item.to} ({item.toFull})</span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-[#98a2b3]">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {item.departure} - {item.arrival}
                        </span>
                        <span>{item.passengers} penumpang</span>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-lg font-bold font-display text-[#c6520f]">
                        {formatCurrency(item.price * item.passengers)}
                      </div>
                      <div className="text-[10px] text-[#98a2b3] font-medium">
                        {item.paymentMethod}
                      </div>
                      <Link
                        href={`/cek-pesanan?bookingCode=${item.bookingCode}&trainName=${encodeURIComponent(item.trainName)}&from=${item.from}&to=${item.to}&fromFull=${encodeURIComponent(item.fromFull)}&toFull=${encodeURIComponent(item.toFull)}&departure=${item.departure}&arrival=${item.arrival}&className=${item.className}&price=${item.price}`}
                        className="h-8 px-3 rounded-lg bg-gradient-to-r from-[#f37021] to-[#ff9148] text-white text-[10px] font-bold hover:from-[#c6520f] hover:to-[#ef7f32] transition-all flex items-center gap-1"
                      >
                        Lihat E-Tiket
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#98a2b3]">
            Menampilkan {filteredData.length} dari {SAMPLE_HISTORY.length} pesanan
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
