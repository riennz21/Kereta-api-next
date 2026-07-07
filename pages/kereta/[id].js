import { useState } from "react";
import Link from "next/link";
import {
  Train, MapPin, Clock, Calendar, Users, ArrowRight, ArrowLeft,
  Star, ShieldCheck, ArmchairIcon as Chair, AlertTriangle
} from "lucide-react";
import PublicLayout from "../../components/public/PublicLayout";
import StatusBadge from "../../components/StatusBadge";
import TrainClassBadge from "../../components/TrainClassBadge";
import { getTrainById, getAllTrains } from "../../lib/db";
import { formatCurrency, getImageUrl } from "../../lib/train-utils";

const SEAT_MAP = [
  ["A1", "B1", "C1", "D1", "E1", "F1"],
  ["A2", "B2", "C2", "D2", "E2", "F2"],
  ["A3", "B3", "C3", "D3", "E3", "F3"],
  ["A4", "B4", "C4", "D4", "E4", "F4"],
  ["A5", "B5", "C5", "D5", "E5", "F5"],
  ["A6", "B6", "C6", "D6", "E6", "F6"],
  ["A7", "B7", "C7", "D7", "E7", "F7"],
  ["A8", "B8", "C8", "D8", "E8", "F8"],
];

const BOOKED_SEATS = ["A1", "A2", "C4", "D5", "F3", "E6"];

const features = [
  { icon: "❄️", label: "AC" },
  { icon: "🔌", label: "Stop Kontak" },
  { icon: "📶", label: "Wi-Fi" },
  { icon: "🍱", label: "Makanan" },
  { icon: "🚻", label: "Toilet" },
  { icon: "🆘", label: "Tombol Darurat" },
];

export default function DetailKeretaPage({ train, relatedTrains }) {
  const [selectedSeat, setSelectedSeat] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);

  const isCancelled = train.status === "Dibatalkan";
  const availableSeats = train.kapasitas || 48;
  const bookedCount = BOOKED_SEATS.length;
  const remainingSeats = availableSeats - bookedCount;

  return (
    <PublicLayout title={train.nama}>
      <div className="max-w-[1100px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#667085] hover:text-[#4f46e5] mb-5 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Pencarian
        </Link>

        <div className="detail-grid">
          {/* LEFT: Main Content */}
          <div className="flex flex-col gap-5">
            {/* Hero */}
            <section className="modern-hero">
              <div className="modern-hero-content">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/80 px-3 py-1 text-[11px] font-bold backdrop-blur">
                    <Star size={12} /> Detail Kereta
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Train size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl text-white font-bold font-display mb-1">{train.nama}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <TrainClassBadge trainClass={train.kelas} />
                      <StatusBadge status={train.status} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            <div className="modern-card-static p-6">
              <h2 className="text-lg font-bold font-display text-[#101828] mb-3">Tentang Kereta</h2>
              <p className={`text-[#667085] leading-relaxed ${showFullDesc ? "" : "line-clamp-3"}`}>
                {train.deskripsi || "Deskripsi belum tersedia untuk kereta ini."}
              </p>
              {train.deskripsi && train.deskripsi.length > 150 && (
                <button onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-[#4f46e5] text-sm font-bold mt-2 hover:text-[#4338ca] transition-colors">
                  {showFullDesc ? "Lihat lebih sedikit" : "Baca selengkapnya..."}
                </button>
              )}
            </div>

            {/* Route & Schedule */}
            <div className="modern-card-static p-6">
              <h2 className="text-lg font-bold font-display text-[#101828] mb-4">Rute & Jadwal</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold font-display text-[#101828]">{train.jam?.split(" - ")[0] || train.jam || "-"}</div>
                  <div className="text-sm font-bold text-[#667085] mt-1">{train.asal}</div>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0 px-4">
                  <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                  <div className="w-0.5 h-12 bg-gradient-to-b from-[#4f46e5] to-[#6366f1]" />
                  <div className="text-[10px] font-bold text-[#667085] bg-white px-2 py-0.5 rounded-full border">Langganan</div>
                  <div className="w-0.5 h-12 bg-gradient-to-b from-[#6366f1] to-[#6366f1]/40" />
                  <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold font-display text-[#101828]">{train.jam?.split(" - ")[1] || "-"}</div>
                  <div className="text-sm font-bold text-[#667085] mt-1">{train.tujuan}</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[rgba(15,39,67,0.06)]">
                <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                  <Calendar size={14} /> <span className="font-semibold">{train.tanggal || "-"}</span>
                </div>
                <span className="text-[#d0d5dd]">|</span>
                <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                  <Users size={14} /> <span className="font-semibold">{remainingSeats} kursi tersedia</span>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="modern-card-static p-6">
              <h2 className="text-lg font-bold font-display text-[#101828] mb-3">Fasilitas Kereta</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {features.map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[rgba(15,39,67,0.03)]">
                    <span className="text-2xl">{f.icon}</span>
                    <span className="text-[11px] font-bold text-[#475467] text-center">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Map */}
            <div className="modern-card-static p-6">
              <h2 className="text-lg font-bold font-display text-[#101828] mb-1">Pilih Kursi</h2>
              <p className="text-[#667085] text-sm mb-4">
                Kursi tersedia: <strong className="text-[#1f9d63]">{remainingSeats}</strong> dari {availableSeats}
              </p>
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-3 rounded-t-full bg-[#4f46e5]/10 border border-[rgba(79,70,229,0.15)] mb-2" />
                <div className="grid grid-cols-6 gap-2">
                  {SEAT_MAP.flat().map((seat) => {
                    const isBooked = BOOKED_SEATS.includes(seat);
                    const isSelected = selectedSeat === seat;
                    return (
                      <button key={seat} disabled={isBooked}
                        onClick={() => setSelectedSeat(isSelected ? "" : seat)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-bold transition-all ${
                          isBooked ? "bg-[#f4f5f7] text-[#98a2b3] cursor-not-allowed line-through"
                          : isSelected ? "bg-[#4f46e5] text-white shadow-md scale-110"
                          : "bg-white border border-[rgba(79,70,229,0.12)] text-[#475467] hover:border-[#4f46e5] hover:bg-[#eef2ff] cursor-pointer"
                        }`}>{seat}</button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-[#667085]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-[rgba(15,39,67,0.12)]" /> Tersedia</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#f4f5f7]" /> Terisi</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#4f46e5]" /> Dipilih</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="modern-card-static p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[rgba(79,70,229,0.10)] flex items-center justify-center">
                  <ShieldCheck size={18} className="text-[#4f46e5]" />
                </div>
                <h3 className="font-bold text-base text-[#101828]">Harga Tiket</h3>
              </div>
              <div className="text-center mb-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085] mb-1">Harga per Tiket</div>
                <div className="text-3xl font-bold font-display text-[#4f46e5]">{formatCurrency(train.harga)}</div>
                <div className="text-xs text-[#667085] mt-1">/ orang</div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[rgba(15,39,67,0.04)]">
                  <span className="flex items-center gap-2 text-xs text-[#667085]"><MapPin size={14} className="text-[#4f46e5]" /> Rute</span>
                  <span className="text-xs font-bold text-[#101828]">{train.asal} → {train.tujuan}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[rgba(15,39,67,0.04)]">
                  <span className="flex items-center gap-2 text-xs text-[#667085]"><Chair size={14} /> Kursi Tersisa</span>
                  <span className={`text-xs font-bold ${remainingSeats <= 5 ? "text-[#d74c3c]" : "text-[#1f9d63]"}`}>{remainingSeats} kursi</span>
                </div>
              </div>
              {isCancelled ? (
                <div className="w-full py-3 px-4 rounded-xl bg-[#fef3f2] border border-[rgba(215,76,60,0.14)] text-[#b42318] text-sm font-bold text-center flex items-center justify-center gap-2">
                  <AlertTriangle size={16} /> Tiket Tidak Tersedia
                </div>
              ) : (
                <Link href={`/checkout/${train.id}`}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white text-sm font-bold shadow-[0_10px_18px_rgba(79,70,229,0.22)] hover:from-[#4338ca] hover:to-[#4f46e5] transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Pesan Sekarang <ArrowRight size={18} />
                </Link>
              )}
              <p className="text-[10px] text-[#98a2b3] text-center mt-3">Harga sudah termasuk pajak dan biaya layanan</p>
            </div>

            {relatedTrains.length > 0 && (
              <div className="modern-card-static p-5">
                <h3 className="text-sm font-bold font-display text-[#101828] mb-3">Kereta Lainnya</h3>
                <div className="space-y-2">
                  {relatedTrains.slice(0, 3).map((rt) => (
                    <Link key={rt.id} href={`/kereta/${rt.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(15,39,67,0.04)] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgba(79,70,229,0.12)] to-[rgba(99,102,241,0.08)] flex items-center justify-center flex-shrink-0">
                        <Train size={15} className="text-[#4f46e5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#101828] truncate">{rt.nama}</div>
                        <div className="text-xs text-[#667085]">{rt.asal} → {rt.tujuan}</div>
                      </div>
                      <div className="text-xs font-bold text-[#4f46e5] flex-shrink-0">{formatCurrency(rt.harga)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export async function getServerSideProps(context) {
  const id = Number(context.params.id);
  const train = await getTrainById(id);
  if (!train) return { notFound: true };
  const allTrains = await getAllTrains();
  const relatedTrains = allTrains.filter((t) => t.id !== id && t.kelas === train.kelas).slice(0, 3);
  return { props: { train, relatedTrains } };
}
