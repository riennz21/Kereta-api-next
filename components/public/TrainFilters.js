import { TRAIN_CLASSES, STATIONS } from "../../lib/constants";

export default function TrainFilters({ action, filters, showReset, resetHref, buttonLabel = "Cari Tiket" }) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="search-hero-card">
      <form method="get" action={action} className="search-hero-form">
        <div className="search-fields">
          <label className="search-field">
            <span className="search-field-label">Stasiun Asal</span>
            <select
              name="asal"
              defaultValue={filters.asal}
              className="input-control search-select"
            >
              <option value="">Pilih stasiun asal</option>
              {STATIONS.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </label>

          <label className="search-field">
            <span className="search-field-label">Stasiun Tujuan</span>
            <select
              name="tujuan"
              defaultValue={filters.tujuan}
              className="input-control search-select"
            >
              <option value="">Pilih stasiun tujuan</option>
              {STATIONS.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </label>

          <label className="search-field">
            <span className="search-field-label">Tanggal Keberangkatan</span>
            <input
              type="date"
              name="tanggal"
              defaultValue={filters.tanggal}
              className="input-control"
              min={today}
              required
            />
          </label>

          <label className="search-field">
            <span className="search-field-label">Kelas</span>
            <select name="kelas" defaultValue={filters.kelas} className="input-control">
              <option value="">Semua Kelas</option>
              {TRAIN_CLASSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="search-actions">
          <button type="submit" className="btn btn-primary btn-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {buttonLabel}
          </button>

          {showReset ? (
            <a href={resetHref} className="btn btn-muted">
              Reset
            </a>
          ) : null}
        </div>
      </form>
    </div>
  );
}
