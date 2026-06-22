import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ArrowLeftRight, MapPin, Calendar, Users, CheckCircle } from "lucide-react";
import { STATIONS } from "../../lib/constants";
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
          <ArrowRight size={18} />
          Pesan Tiket
        </button>
        <button
          className={`booking-tab ${activeTab === "cekin" ? "active" : ""}`}
          onClick={() => setActiveTab("cekin")}
        >
          <CheckCircle size={18} />
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
                <label className="booking-label">
                  <MapPin size={12} className="inline mr-1" />
                  Stasiun Asal
                </label>
                <select
                  value={booking.asal}
                  onChange={(e) => updateField("asal", e.target.value)}
                  className="input-control route-select"
                  required
                >
                  <option value="">Pilih stasiun asal</option>
                  {STATIONS.filter((s) => s !== booking.tujuan).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button type="button" className="swap-btn" onClick={swapRoute} title="Tukar rute" aria-label="Tukar rute">
                <ArrowLeftRight size={18} />
              </button>

              <div className="route-field-group">
                <label className="booking-label">
                  <MapPin size={12} className="inline mr-1" />
                  Stasiun Tujuan
                </label>
                <select
                  value={booking.tujuan}
                  onChange={(e) => updateField("tujuan", e.target.value)}
                  className="input-control route-select"
                  required
                >
                  <option value="">Pilih stasiun tujuan</option>
                  {STATIONS.filter((s) => s !== booking.asal).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Passengers */}
            <div className="booking-details">
              <div className="booking-detail-field">
                <label className="booking-label">
                  <Calendar size={12} className="inline mr-1" />
                  Tanggal Keberangkatan
                </label>
                <input
                  type="date"
                  value={booking.tanggal}
                  onChange={(e) => updateField("tanggal", e.target.value)}
                  className="input-control"
                  min={today}
                />
              </div>

              <div className="booking-detail-field">
                <label className="booking-label">
                  <Users size={12} className="inline mr-1" />
                  Jumlah Penumpang
                </label>
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
                  <span className="passenger-value">{booking.penumpang}</span>
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
              className="btn btn-primary btn-booking-cta"
              disabled={!canSearch}
            >
              <Search size={18} />
              Cari Kereta
            </button>

            {!canSearch && (
              <p className="booking-hint">Pilih stasiun asal dan tujuan untuk mencari tiket.</p>
            )}
          </form>
        ) : (
          <div className="cekin-panel">
            <div className="cekin-icon">
              <CheckCircle size={48} />
            </div>
            <h3>Cek-In / Status Kereta</h3>
            <p>Masukkan kode booking Anda untuk melakukan cek-in atau lihat status perjalanan.</p>
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
