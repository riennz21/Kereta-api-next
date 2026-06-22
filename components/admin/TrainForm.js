import { useEffect, useState } from "react";
import { TRAIN_CLASSES, TRAIN_STATUSES } from "../../lib/constants";
import { getImageUrl, getSuggestedPrice } from "../../lib/train-utils";

const emptyValues = {
  nama: "",
  asal: "",
  tujuan: "",
  kelas: "",
  harga: "",
  tanggal: "",
  jam: "",
  status: "On Time",
  deskripsi: "",
  gambar: "",
};

export default function TrainForm({ action, initialValues = emptyValues, submitLabel, cancelHref, error }) {
  const [selectedClass, setSelectedClass] = useState(initialValues.kelas || "");
  const [price, setPrice] = useState(initialValues.harga || "");
  const [previewUrl, setPreviewUrl] = useState(getImageUrl(initialValues.gambar));
  const isCreateMode = submitLabel === "Simpan";

  useEffect(() => {
    setSelectedClass(initialValues.kelas || "");
    setPrice(initialValues.harga || "");
    setPreviewUrl(getImageUrl(initialValues.gambar));
  }, [initialValues]);

  return (
    <div className="stack-md admin-form-wrapper">
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="form-shell">
        <div className="form-header">
          <span className="page-kicker">Formulir Kereta</span>
          <h2>{isCreateMode ? "Lengkapi data kereta baru" : "Perbarui detail perjalanan"}</h2>
          <p>
            {isCreateMode
              ? "data inti, jadwal, status, harga, dan media."
              : "Perbarui informasi kereta supaya data publik dan panel admin tetap sinkron, jelas, dan siap dipakai."}
          </p>
        </div>

        <div className="form-grid">
          <form action={action} method="post" encType="multipart/form-data" className="form-kereta">
            <div className="form-group">
              <label htmlFor="nama">Nama Kereta</label>
              <input id="nama" type="text" name="nama" defaultValue={initialValues.nama} required />
            </div>

            <div className="form-group">
              <label htmlFor="gambar">Foto Kereta</label>
              <input
                id="gambar"
                type="file"
                name="gambar"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    setPreviewUrl(getImageUrl(initialValues.gambar));
                    return;
                  }
                  setPreviewUrl(URL.createObjectURL(file));
                }}
              />
              <small className="hint">Opsional, format: jpg/png/webp/gif</small>
            </div>

            <div className="form-group">
              <label htmlFor="asal">Asal</label>
              <input id="asal" type="text" name="asal" defaultValue={initialValues.asal} required />
            </div>

            <div className="form-group">
              <label htmlFor="tujuan">Tujuan</label>
              <input id="tujuan" type="text" name="tujuan" defaultValue={initialValues.tujuan} required />
            </div>

            <div className="form-group">
              <label htmlFor="kelas">Kelas</label>
              <select
                id="kelas"
                name="kelas"
                value={selectedClass}
                onChange={(event) => {
                  const nextClass = event.target.value;
                  setSelectedClass(nextClass);
                  setPrice(getSuggestedPrice(nextClass));
                }}
                required
              >
                <option value="">-- Pilih Kelas --</option>
                {TRAIN_CLASSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="harga">Harga</label>
              <input
                id="harga"
                type="number"
                name="harga"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tanggal">Tanggal</label>
              <input id="tanggal" type="date" name="tanggal" defaultValue={initialValues.tanggal} required />
            </div>

            <div className="form-group">
              <label htmlFor="jam">Jam</label>
              <input id="jam" type="time" name="jam" defaultValue={initialValues.jam} required />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={initialValues.status || "On Time"} required>
                {TRAIN_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full">
              <label htmlFor="deskripsi">Deskripsi</label>
              <textarea id="deskripsi" name="deskripsi" rows="4" defaultValue={initialValues.deskripsi} />
            </div>

            <div className="form-actions full">
              <button type="submit" className="btn btn-accent">
                {submitLabel}
              </button>
              <a href={cancelHref} className="btn btn-muted">
                Batal
              </a>
            </div>
          </form>

          <aside className="preview-panel">
            <div className="stack-sm">
              <h3>Preview Media</h3>
              <p>Pastikan foto kereta dengan jelas dan benar.</p>
            </div>

            {previewUrl ? (
              <img loading="lazy" src={previewUrl} alt={initialValues.nama || "Preview"} className="preview" />
            ) : (
              <div className="preview preview-empty">Belum ada gambar untuk ditampilkan.</div>
            )}

            <div className="stack-sm">
              <span className="filter-chip">Nama, asal, tujuan, kelas, tanggal, dan jam wajib diisi.</span>
              <span className="filter-chip">Harga bisa disesuaikan otomatis setelah kelas dipilih.</span>
              <span className="filter-chip">Deskripsi singkat membantu kartu tiket tampil lebih informatif.</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
