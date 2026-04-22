import { TRAIN_CLASSES, TRAIN_STATUSES } from "../../lib/constants";

export default function AdminTrainFilters({ action, filters, showReset, resetHref }) {
  return (
    <div className="filters-card admin-filters-card">
      <form method="get" action={action} className="filters-shell">
        <div className="filters-form">
          <label className="filter-field filter-field-wide" htmlFor="search">
            <span>Cari Data</span>
            <input
              id="search"
              type="text"
              name="search"
              placeholder="Nama, asal, tujuan..."
              defaultValue={filters.search}
              className="input-control search-control"
            />
          </label>

          <label className="filter-field" htmlFor="kelas">
            <span>Kelas</span>
            <select id="kelas" name="kelas" defaultValue={filters.kelas} className="input-control">
              <option value="">Semua Kelas</option>
              {TRAIN_CLASSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field" htmlFor="status">
            <span>Status</span>
            <select id="status" name="status" defaultValue={filters.status} className="input-control">
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
            Filter
          </button>

          {showReset ? (
            <a href={resetHref} className="btn btn-muted">
              Reset
            </a>
          ) : null}

          <span className="filter-chip">Pakai kombinasi filter untuk analisis operasional yang lebih cepat.</span>
        </div>
      </form>
    </div>
  );
}
