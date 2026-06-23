export const DB_UNAVAILABLE_MESSAGE =
  "Database tidak tersedia. Di Vercel, Anda perlu menambahkan Vercel Postgres atau mengatur environment variable DATABASE_URL / POSTGRES_URL ke connection string PostgreSQL yang valid.";

export function getDbErrorMessage(err) {
  if (err?.message?.includes("DATABASE_UNAVAILABLE")) {
    return DB_UNAVAILABLE_MESSAGE;
  }
  if (err?.message?.includes("ECONNREFUSED") || err?.message?.includes("could not connect")) {
    return "Gagal terhubung ke database. Pastikan database server sedang berjalan dan credential sudah benar.";
  }
  return `Terjadi kesalahan server: ${err?.message || "Unknown error"}`;
}

export default function DbError({ message }) {
  if (!message) return null;

  return (
    <div
      className="alert alert-error"
      style={{
        padding: "16px 20px",
        borderRadius: 12,
        background: "#fef3f2",
        border: "1px solid rgba(215,76,60,0.2)",
        color: "#b42318",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4, fontSize: "0.9rem" }}>
        ⚠️ Gagal Memuat Data
      </strong>
      <span style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{message}</span>
    </div>
  );
}
