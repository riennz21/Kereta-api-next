import Link from "next/link";
import { Train, Star, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import StatusBadge from "../StatusBadge";
import TrainClassBadge from "../TrainClassBadge";
import { formatCurrency, getImageUrl } from "../../lib/train-utils";

export default function RecommendedTrain({ train }) {
  if (!train) {
    return (
      <aside className="recommend-card recommend-empty">
        <div className="recommend-empty-icon">
          <Star size={40} />
        </div>
        <h3>Belum Ada Rekomendasi</h3>
        <p>Gunakan form pencarian untuk menemukan tiket kereta yang tersedia.</p>
      </aside>
    );
  }

  const isAvailable = train.status === "On Time";
  const statusLabel = isAvailable ? "Tersedia" : train.status;

  return (
    <aside className="recommend-card">
      <div className="recommend-header">
        <span className="recommend-badge">
          <Sparkles size={12} />
          {isAvailable ? "Rekomendasi Terbaik" : statusLabel}
        </span>
      </div>

      {train.gambar ? (
        <img loading="lazy" className="recommend-image" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} />
      ) : (
        <div className="recommend-image recommend-image-empty">
          <Train size={32} />
        </div>
      )}

      <div className="recommend-body">
        <h3 className="recommend-title">{train.nama}</h3>
        <p className="recommend-desc">{train.deskripsi || "Kereta favorit dengan rute populer."}</p>

        <div className="recommend-route">
          <span className="recommend-station">{train.asal}</span>
          <ArrowRight size={16} className="text-slate-400" />
          <span className="recommend-station">{train.tujuan}</span>
        </div>

        <div className="recommend-meta">
          <TrainClassBadge trainClass={train.kelas} />
          <StatusBadge status={train.status} />
        </div>

        <div className="recommend-price">
          <span className="recommend-price-label">Mulai dari</span>
          <strong className="recommend-price-value">{formatCurrency(train.harga)}</strong>
        </div>

        <Link
          href={`/checkout/${train.id}`}
          className={`btn btn-primary btn-cta recommend-cta`}
          style={!isAvailable ? { pointerEvents: "none", opacity: 0.5 } : {}}
        >
          {isAvailable ? "Pesan Sekarang" : "Tidak Tersedia"}
        </Link>
      </div>
    </aside>
  );
}
