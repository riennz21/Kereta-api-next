import { Pool } from "pg";
import Database from "better-sqlite3";
import path from "node:path";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("❌ Set DATABASE_URL or POSTGRES_URL before running this migration.");
  console.error("   Example: DATABASE_URL=postgres://user:pass@host:5432/db node scripts/migrate-sqlite-to-postgres.mjs");
  process.exit(1);
}

const sqlitePath = path.join(process.cwd(), "kereta.db");
const sqlite = new Database(sqlitePath, { readonly: true });
const pool = new Pool({ connectionString });

console.log("🔌 Terhubung ke PostgreSQL...");
console.log("📂 Membaca data dari SQLite...\n");

// ── Buat tabel kereta ──────────────────────────────────────────
console.log("📦 Migrasi tabel: kereta");

await pool.query(`
  CREATE TABLE IF NOT EXISTS kereta (
    id SERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    asal TEXT,
    tujuan TEXT,
    kelas TEXT,
    harga INTEGER,
    tanggal TEXT,
    jam TEXT,
    status TEXT DEFAULT 'On Time',
    deskripsi TEXT,
    gambar TEXT,
    kapasitas INTEGER DEFAULT 48,
    kursi_tersedia INTEGER DEFAULT 48
  )
`);

const trainRows = sqlite.prepare("SELECT * FROM kereta ORDER BY id ASC").all();
console.log(`   ${trainRows.length} data kereta ditemukan.`);

for (const row of trainRows) {
  await pool.query(
    `
      INSERT INTO kereta (id, nama, asal, tujuan, kelas, harga, tanggal, jam, status, deskripsi, gambar, kapasitas, kursi_tersedia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE
      SET nama = EXCLUDED.nama,
          asal = EXCLUDED.asal,
          tujuan = EXCLUDED.tujuan,
          kelas = EXCLUDED.kelas,
          harga = EXCLUDED.harga,
          tanggal = EXCLUDED.tanggal,
          jam = EXCLUDED.jam,
          status = EXCLUDED.status,
          deskripsi = EXCLUDED.deskripsi,
          gambar = EXCLUDED.gambar,
          kapasitas = EXCLUDED.kapasitas,
          kursi_tersedia = EXCLUDED.kursi_tersedia
    `,
    [
      row.id,
      row.nama,
      row.asal,
      row.tujuan,
      row.kelas,
      row.harga,
      row.tanggal,
      row.jam,
      row.status,
      row.deskripsi,
      row.gambar,
      row.kapasitas ?? 48,
      row.kursi_tersedia ?? 48,
    ],
  );
}

// Reset sequence id kereta
await pool.query(`
  SELECT setval(
    pg_get_serial_sequence('kereta', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM kereta), 1),
    true
  )
`);

console.log(`   ✅ ${trainRows.length} data kereta berhasil dimigrasi.\n`);

// ── Buat tabel pembelian ───────────────────────────────────────
console.log("📦 Migrasi tabel: pembelian");

await pool.query(`
  CREATE TABLE IF NOT EXISTS pembelian (
    id SERIAL PRIMARY KEY,
    kereta_id INTEGER NOT NULL REFERENCES kereta(id),
    nama_kereta TEXT NOT NULL,
    asal TEXT,
    tujuan TEXT,
    kelas TEXT,
    harga_satuan INTEGER NOT NULL,
    jumlah_tiket INTEGER DEFAULT 1,
    total_harga INTEGER NOT NULL,
    nama_pembeli TEXT NOT NULL,
    email_pembeli TEXT,
    no_telepon TEXT,
    metode_pembayaran TEXT,
    status_pembayaran TEXT DEFAULT 'paid',
    kode_booking TEXT NOT NULL,
    tanggal_pembelian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_keberangkatan TEXT
  )
`);

// Add unique index on kode_booking
try {
  await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_pembelian_kode_booking ON pembelian(kode_booking)");
} catch {
  // index already exists
}

const purchaseRows = sqlite.prepare("SELECT * FROM pembelian ORDER BY id ASC").all();
console.log(`   ${purchaseRows.length} data pembelian ditemukan.`);

for (const row of purchaseRows) {
  await pool.query(
    `
      INSERT INTO pembelian
        (id, kereta_id, nama_kereta, asal, tujuan, kelas, harga_satuan, jumlah_tiket,
         total_harga, nama_pembeli, email_pembeli, no_telepon, metode_pembayaran,
         status_pembayaran, kode_booking, tanggal_pembelian, tanggal_keberangkatan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE
      SET kereta_id = EXCLUDED.kereta_id,
          nama_kereta = EXCLUDED.nama_kereta,
          asal = EXCLUDED.asal,
          tujuan = EXCLUDED.tujuan,
          kelas = EXCLUDED.kelas,
          harga_satuan = EXCLUDED.harga_satuan,
          jumlah_tiket = EXCLUDED.jumlah_tiket,
          total_harga = EXCLUDED.total_harga,
          nama_pembeli = EXCLUDED.nama_pembeli,
          email_pembeli = EXCLUDED.email_pembeli,
          no_telepon = EXCLUDED.no_telepon,
          metode_pembayaran = EXCLUDED.metode_pembayaran,
          status_pembayaran = EXCLUDED.status_pembayaran,
          kode_booking = EXCLUDED.kode_booking,
          tanggal_pembelian = EXCLUDED.tanggal_pembelian,
          tanggal_keberangkatan = EXCLUDED.tanggal_keberangkatan
    `,
    [
      row.id,
      row.kereta_id,
      row.nama_kereta,
      row.asal || "",
      row.tujuan || "",
      row.kelas || "",
      row.harga_satuan,
      row.jumlah_tiket || 1,
      row.total_harga,
      row.nama_pembeli,
      row.email_pembeli || "",
      row.no_telepon || "",
      row.metode_pembayaran || "transfer",
      row.status_pembayaran || "paid",
      row.kode_booking,
      row.tanggal_pembelian || new Date().toISOString(),
      row.tanggal_keberangkatan || "",
    ],
  );
}

// Reset sequence id pembelian
await pool.query(`
  SELECT setval(
    pg_get_serial_sequence('pembelian', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM pembelian), 1),
    true
  )
`);

console.log(`   ✅ ${purchaseRows.length} data pembelian berhasil dimigrasi.\n`);

// ── Selesai ────────────────────────────────────────────────────
sqlite.close();
await pool.end();

console.log("🎉 Migrasi selesai! Data SQLite berhasil dipindahkan ke PostgreSQL.");
console.log(`   - ${trainRows.length} kereta`);
console.log(`   - ${purchaseRows.length} pembelian`);
