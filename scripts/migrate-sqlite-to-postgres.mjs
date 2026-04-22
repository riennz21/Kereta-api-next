import { Pool } from "pg";
import Database from "better-sqlite3";
import path from "node:path";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL or POSTGRES_URL before running this migration.");
  process.exit(1);
}

const sqlitePath = path.join(process.cwd(), "kereta.db");
const sqlite = new Database(sqlitePath, { readonly: true });
const pool = new Pool({ connectionString });

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
    status TEXT,
    deskripsi TEXT,
    gambar TEXT
  )
`);

const rows = sqlite.prepare("SELECT * FROM kereta ORDER BY id ASC").all();

for (const row of rows) {
  await pool.query(
    `
      INSERT INTO kereta (id, nama, asal, tujuan, kelas, harga, tanggal, jam, status, deskripsi, gambar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          gambar = EXCLUDED.gambar
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
    ],
  );
}

await pool.query(`
  SELECT setval(
    pg_get_serial_sequence('kereta', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM kereta), 1),
    true
  )
`);

console.log(`Migrated ${rows.length} rows to PostgreSQL.`);

sqlite.close();
await pool.end();
