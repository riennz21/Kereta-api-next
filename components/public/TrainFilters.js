import { TRAIN_CLASSES, TRAIN_STATUSES } from "../../lib/constants";

export default function TrainFilters({ action, filters, showReset, resetHref, buttonLabel = "Cari" }) {
  return (
    <div className="filters-card">
      <form method="get" action={action} className="filters-shell">
        <div className="filters-form">
          <label className="filter-field filter-field-wide">
            <span>Cari Perjalanan</span>
            <input
              type="text"
              name="search"
              placeholder="Nama kereta, asal, atau tujuan..."
              defaultValue={filters.search}
              className="input-control search-control"
            />
          </label>

          <label className="filter-field">
            <span>Kelas</span>
            <select name="kelas" defaultValue={filters.kelas} className="input-control">
              <option value="">Semua Kelas</option>
              {TRAIN_CLASSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Status</span>
            <select name="status" defaultValue={filters.status} className="input-control">
              <option value="">Semua Status</option>
              {TRAIN_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Rentang Harga</span>
            <div className="price-range">
              <input
                type="number"
                name="min_price"
                placeholder="Min"
                defaultValue={filters.minPrice}
                className="input-control"
              />
              <span>-</span>
              <input
                type="number"
                name="max_price"
                placeholder="Max"
                defaultValue={filters.maxPrice}
                className="input-control"
              />
            </div>
          </label>
        </div>

        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">
            {buttonLabel}
          </button>

          {showReset ? (
            <a href={resetHref} className="btn btn-muted">
              Reset
            </a>
          ) : null}

          <span className="filter-chip">Filter cepat untuk menemukan perjalanan yang tepat.</span>
        </div>
      </form>
    </div>
  );
}
