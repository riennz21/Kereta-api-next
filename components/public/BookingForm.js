import { useState } from "react";
import Link from "next/link";
import { useBooking } from "../../lib/booking-context";

export default function BookingForm() {
  const [activeTab, setActiveTab] = useState("pesan");
  const { booking, updateField, swapRoute, setPenumpang, canSearch } = useBooking();
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSearch) return;
    const params = new URLSearchParams();
    if (booking.asal) params.set("asal", booking.asal);
    if (booking.tujuan) params.set("tujuan", booking.tujuan);
    if (booking.tanggal) params.set("tanggal", booking.tanggal);
    window.location.href = `/?${params.toString()}#tickets`;
  };

  return (
    <div className="booking-card">
      {/* Tabs */}
      <div className="booking-tabs">
        <button
          className={`booking-tab ${activeTab === "pesan" ? "active" : ""}`}
          onClick={() => setActiveTab("pesan")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
          Pesan Tiket
        </button>
        <button
          className={`booking-tab ${activeTab === "cekin" ? "active" : ""}`}
          onClick={() => setActiveTab("cekin")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Cek-In / Status
        </button>
      </div>

      {/* Tab Content */}
      <div className="booking-tab-content">
        {activeTab === "pesan" ? (
          <form className="booking-form" onSubmit={handleSubmit}>
            {/* Asal & Tujuan with Swap */}
            <div className="route-fields">
              <div className="route-field-group">
                <label className="booking-label">Stasiun Asal</label>
                <input
                  type="text"
                  value={booking.asal}
                  onChange={(e) => updateField("asal", e.target.value)}
                  className="input-control route-select"
                  placeholder="Ketik stasiun asal"
                  autoComplete="off"
                  required
                />
              </div>

              <button type="button" className="swap-btn" onClick={swapRoute} title="Tukar rute" aria-label="Tukar rute">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </button>

              <div className="route-field-group">
                <label className="booking-label">Stasiun Tujuan</label>
                <input
                  type="text"
                  value={booking.tujuan}
                  onChange={(e) => updateField("tujuan", e.target.value)}
                  className="input-control route-select"
                  placeholder="Ketik stasiun tujuan"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Date & Passengers */}
            <div className="booking-details">
              <div className="booking-detail-field">
                <label className="booking-label">Tanggal Keberangkatan</label>
                <input
                  type="date"
                  value={booking.tanggal}
                  onChange={(e) => updateField("tanggal", e.target.value)}
                  className="input-control"
                  min={today}
                />
              </div>

              <div className="booking-detail-field">
                <label className="booking-label">Jumlah Penumpang</label>
                <div className="passenger-selector">
                  <button
                    type="button"
                    className="passenger-btn"
                    onClick={() => setPenumpang(booking.penumpang - 1)}
                    disabled={booking.penumpang <= 1}
                    aria-label="Kurangi penumpang"
                  >
                    &minus;
                  </button>
                  <span className="passenger-value">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {booking.penumpang}
                  </span>
                  <button
                    type="button"
                    className="passenger-btn"
                    onClick={() => setPenumpang(booking.penumpang + 1)}
                    disabled={booking.penumpang >= 4}
                    aria-label="Tambah penumpang"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-search btn-booking-cta"
              disabled={!canSearch}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Cari Kereta
            </button>

            {!canSearch && (
              <p className="booking-hint">Ketik stasiun asal dan tujuan untuk mencari tiket.</p>
            )}
          </form>
        ) : (
          <div className="cekin-panel">
            <div className="cekin-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3>Cek-In / Status Kereta</h3>
            <p className="muted">Masukkan kode booking Anda untuk melakukan cek-in atau lihat status perjalanan.</p>
            <div className="cekin-input-group">
              <input
                type="text"
                className="input-control"
                placeholder="Masukkan kode booking (contoh: TKT-1-A1B2C)"
              />
              <Link href="/status" className="btn btn-outline">
                Cek Status
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
