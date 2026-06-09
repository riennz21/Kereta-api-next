import Link from "next/link";
import StatusBadge from "../StatusBadge";
import TrainClassBadge from "../TrainClassBadge";
import { formatCurrency, getImageUrl } from "../../lib/train-utils";

export default function RecommendedTrain({ train }) {
  if (!train) {
    return (
      <aside className="recommend-card recommend-empty">
        <div className="recommend-empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </div>
        <h3>Belum Ada Rekomendasi</h3>
        <p className="muted">Gunakan form pencarian untuk menemukan tiket kereta yang tersedia.</p>
      </aside>
    );
  }

  const isAvailable = train.status === "On Time";
  const statusLabel = isAvailable ? "Tersedia" : train.status;

  return (
    <aside className="recommend-card">
      <div className="recommend-header">
        <span className="recommend-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {isAvailable ? "Rekomendasi Terbaik" : statusLabel}
        </span>
      </div>

      {train.gambar ? (
        <img className="recommend-image" src={getImageUrl(train.gambar)} alt={`Foto ${train.nama}`} />
      ) : (
        <div className="recommend-image recommend-image-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      <div className="recommend-body">
        <h3 className="recommend-title">{train.nama}</h3>
        <p className="recommend-desc">{train.deskripsi || "Kereta favorit dengan rute populer."}</p>

        <div className="recommend-route">
          <span className="recommend-station">{train.asal}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
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
          className={`btn ${isAvailable ? "btn-primary btn-cta" : "btn-muted"} recommend-cta`}
          style={!isAvailable ? { pointerEvents: "none", opacity: 0.5 } : {}}
        >
          {isAvailable ? "Pesan Sekarang" : "Tidak Tersedia"}
        </Link>
      </div>
    </aside>
  );
}
