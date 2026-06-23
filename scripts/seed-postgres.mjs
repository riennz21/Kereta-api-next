import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Set DATABASE_URL or POSTGRES_URL before running this seed script.");
  process.exit(1);
}

const pool = new Pool({ connectionString });

const trains = [
  { nama: "Argo Bromo Anggrek", asal: "Surabaya", tujuan: "Jakarta", kelas: "Eksekutif", harga: 150000, tanggal: "2026-07-01", jam: "07:00", status: "On Time", deskripsi: "Kereta eksekutif premium dengan fasilitas lengkap.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Taksaka", asal: "Jakarta", tujuan: "Bandung", kelas: "Eksekutif", harga: 150000, tanggal: "2026-07-01", jam: "08:30", status: "On Time", deskripsi: "Perjalanan nyaman dengan layanan prima.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Mutiara Selatan", asal: "Bandung", tujuan: "Surabaya", kelas: "Bisnis", harga: 100000, tanggal: "2026-07-01", jam: "09:00", status: "Delay", deskripsi: "Kereta bisnis dengan harga terjangkau.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Sancaka", asal: "Surabaya", tujuan: "Malang", kelas: "Ekonomi", harga: 50000, tanggal: "2026-07-01", jam: "06:00", status: "On Time", deskripsi: "Kereta ekonomi nyaman untuk perjalanan singkat.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Bima", asal: "Jakarta", tujuan: "Surabaya", kelas: "Eksekutif", harga: 150000, tanggal: "2026-07-02", jam: "10:00", status: "On Time", deskripsi: "Kereta favorit rute Jakarta-Surabaya.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Logawa", asal: "Banyuwangi", tujuan: "Jember", kelas: "Ekonomi", harga: 50000, tanggal: "2026-07-02", jam: "11:30", status: "Dibatalkan", deskripsi: "Perjalanan dibatalkan karena perawatan jalur.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Sri Tanjung", asal: "Malang", tujuan: "Ketapang", kelas: "Bisnis", harga: 100000, tanggal: "2026-07-03", jam: "07:30", status: "Delay", deskripsi: "Delay karena jadwal padat.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Mutiara Timur", asal: "Surabaya", tujuan: "Banyuwangi", kelas: "Bisnis", harga: 100000, tanggal: "2026-07-03", jam: "08:00", status: "On Time", deskripsi: "Rute favorit wisata Banyuwangi.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Jayabaya", asal: "Jakarta", tujuan: "Malang", kelas: "Eksekutif", harga: 150000, tanggal: "2026-07-04", jam: "06:30", status: "On Time", deskripsi: "Perjalanan malam dengan fasilitas tidur.", kapasitas: 48, kursi_tersedia: 48 },
  { nama: "Penataran", asal: "Malang", tujuan: "Surabaya", kelas: "Ekonomi", harga: 50000, tanggal: "2026-07-04", jam: "14:00", status: "On Time", deskripsi: "Kereta ekonomi untuk komuter harian.", kapasitas: 48, kursi_tersedia: 48 },
];

console.log("Seeding kereta table...");
let insertedCount = 0;
for (const train of trains) {
  const exists = await pool.query("SELECT id FROM kereta WHERE nama = $1 AND tanggal = $2 AND jam = $3", [train.nama, train.tanggal, train.jam]);
  if (exists.rows.length === 0) {
    await pool.query(
      `INSERT INTO kereta (nama, asal, tujuan, kelas, harga, tanggal, jam, status, deskripsi, kapasitas, kursi_tersedia)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [train.nama, train.asal, train.tujuan, train.kelas, train.harga, train.tanggal, train.jam, train.status, train.deskripsi, train.kapasitas, train.kursi_tersedia],
    );
    insertedCount++;
  }
}
console.log(`Inserted ${insertedCount} trains.`);

// Add sample purchases
const purchases = [
  { kereta_nama: "Argo Bromo Anggrek", kereta_tanggal: "2026-07-01", pembeli: "Budi Santoso", email: "budi@example.com", telepon: "081234567890", qty: 2, metode: "transfer", status: "paid" },
  { kereta_nama: "Taksaka", kereta_tanggal: "2026-07-01", pembeli: "Siti Rahayu", email: "siti@example.com", telepon: "081234567891", qty: 1, metode: "transfer", status: "paid" },
  { kereta_nama: "Mutiara Selatan", kereta_tanggal: "2026-07-01", pembeli: "Ahmad Hidayat", email: "ahmad@example.com", telepon: "081234567892", qty: 3, metode: "transfer", status: "pending" },
  { kereta_nama: "Bima", kereta_tanggal: "2026-07-02", pembeli: "Dewi Lestari", email: "dewi@example.com", telepon: "081234567893", qty: 2, metode: "transfer", status: "paid" },
  { kereta_nama: "Sancaka", kereta_tanggal: "2026-07-01", pembeli: "Rudi Hartono", email: "rudi@example.com", telepon: "081234567894", qty: 4, metode: "transfer", status: "cancelled" },
];

function generateKodeBooking() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KAI-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

console.log("Seeding pembelian table...");
let purchaseCount = 0;
for (const p of purchases) {
  const train = await pool.query(
    "SELECT id, nama, asal, tujuan, kelas, harga FROM kereta WHERE nama = $1 AND tanggal = $2 LIMIT 1",
    [p.kereta_nama, p.kereta_tanggal],
  );
  if (train.rows.length > 0) {
    const t = train.rows[0];
    const totalHarga = t.harga * p.qty;
    const kodeBooking = generateKodeBooking();
    await pool.query(
      `INSERT INTO pembelian
        (kereta_id, nama_kereta, asal, tujuan, kelas, harga_satuan, jumlah_tiket,
         total_harga, nama_pembeli, email_pembeli, no_telepon, metode_pembayaran,
         status_pembayaran, kode_booking, tanggal_keberangkatan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [t.id, t.nama, t.asal, t.tujuan, t.kelas, t.harga, p.qty, totalHarga,
       p.pembeli, p.email, p.telepon, p.metode, p.status, kodeBooking, t.tanggal],
    );
    purchaseCount++;
  }
}
console.log(`Inserted ${purchaseCount} purchases.`);

console.log("Seed complete.");
await pool.end();
