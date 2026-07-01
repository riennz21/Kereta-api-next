import path from "node:path";
import Database from "better-sqlite3";
import pkg from "pg";
import {
  canonicalStatus,
  computeStats,
  parseNumber,
  serializeTrainPayload,
} from "./train-utils";

const { Pool } = pkg;
const sqlitePath = path.join(process.cwd(), "kereta.db");
function detectProvider() {
  if (process.env.DATABASE_URL?.startsWith("postgres")) return "postgres";
  if (process.env.POSTGRES_URL?.startsWith("postgres")) return "postgres";
  if (process.env.POSTGRES_PRISMA_URL?.startsWith("postgres")) return "postgres";
  // On Vercel without Postgres, we can't use SQLite (read-only filesystem)
  if (process.env.VERCEL) return "unavailable";
  return "sqlite";
}

const provider = detectProvider();

let sqliteDb;
let pgPool;
let initPromise;

function generateBookingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KAI-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

function getSqliteDb() {
  if (!sqliteDb) {
    sqliteDb = new Database(sqlitePath);
    sqliteDb.pragma("journal_mode = WAL");
  }
  return sqliteDb;
}

function getPgPool() {
  if (!pgPool) {
    pgPool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pgPool;
}

async function initializeSqlite() {
  const db = getSqliteDb();
  db.prepare(`
    CREATE TABLE IF NOT EXISTS kereta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS pembelian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kereta_id INTEGER NOT NULL,
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
      tanggal_pembelian DATETIME DEFAULT (datetime('now', 'localtime')),
      tanggal_keberangkatan TEXT,
      FOREIGN KEY (kereta_id) REFERENCES kereta(id)
    )
  `).run();

  // Migration: add kode_booking column if table existed from before this change
  try {
    db.prepare("ALTER TABLE pembelian ADD COLUMN kode_booking TEXT").run();
  } catch {
    // Column already exists — ignore
  }

  // UNIQUE index on kode_booking (handles both fresh tables and existing migrated tables)
  try {
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_pembelian_kode_booking ON pembelian(kode_booking)").run();
  } catch {
    // Index already exists — ignore
  }
}

async function initializePostgres() {
  const pool = getPgPool();
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

  // Migration: add kode_booking column if table existed from before this change
  try {
    await pool.query("ALTER TABLE pembelian ADD COLUMN kode_booking TEXT");
  } catch {
    // Column already exists — ignore
  }

  // UNIQUE index on kode_booking (handles both fresh tables and existing migrated tables)
  try {
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_pembelian_kode_booking ON pembelian(kode_booking)");
  } catch {
    // Index already exists — ignore
  }
}

const DB_UNAVAILABLE_MESSAGE =
  "DATABASE_UNAVAILABLE: Aplikasi di Vercel membutuhkan PostgreSQL. " +
  "Tambahkan Vercel Postgres atau set environment variable DATABASE_URL / POSTGRES_URL " +
  "ke connection string PostgreSQL yang valid.";

export { DB_UNAVAILABLE_MESSAGE };

async function ensureInitialized() {
  if (provider === "unavailable") {
    throw new Error(DB_UNAVAILABLE_MESSAGE);
  }
  if (!initPromise) {
    initPromise = provider === "postgres" ? initializePostgres() : initializeSqlite();
  }
  await initPromise;
}

function buildSqliteFilters(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.asal) {
    clauses.push("asal LIKE ?");
    params.push(`%${filters.asal}%`);
  }
  if (filters.tujuan) {
    clauses.push("tujuan LIKE ?");
    params.push(`%${filters.tujuan}%`);
  }
  if (filters.tanggal) {
    clauses.push("tanggal = ?");
    params.push(filters.tanggal);
  }
  if (filters.search) {
    clauses.push("(nama LIKE ? OR asal LIKE ? OR tujuan LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.kelas) {
    clauses.push("kelas = ?");
    params.push(filters.kelas);
  }
  if (filters.status) {
    clauses.push("status = ?");
    params.push(canonicalStatus(filters.status));
  }
  if (filters.minPrice && /^\d+$/.test(filters.minPrice)) {
    clauses.push("harga >= ?");
    params.push(parseNumber(filters.minPrice, 0));
  }
  if (filters.maxPrice && /^\d+$/.test(filters.maxPrice)) {
    clauses.push("harga <= ?");
    params.push(parseNumber(filters.maxPrice, 0));
  }

  return {
    clause: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

function buildPostgresFilters(filters = {}) {
  const clauses = [];
  const params = [];
  let index = 1;

  if (filters.asal) {
    clauses.push(`asal ILIKE $${index}`);
    params.push(`%${filters.asal}%`);
    index += 1;
  }
  if (filters.tujuan) {
    clauses.push(`tujuan ILIKE $${index}`);
    params.push(`%${filters.tujuan}%`);
    index += 1;
  }
  if (filters.tanggal) {
    clauses.push(`tanggal = $${index}`);
    params.push(filters.tanggal);
    index += 1;
  }
  if (filters.search) {
    clauses.push(`(nama ILIKE $${index} OR asal ILIKE $${index + 1} OR tujuan ILIKE $${index + 2})`);
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    index += 3;
  }
  if (filters.kelas) {
    clauses.push(`kelas = $${index}`);
    params.push(filters.kelas);
    index += 1;
  }
  if (filters.status) {
    clauses.push(`status = $${index}`);
    params.push(canonicalStatus(filters.status));
    index += 1;
  }
  if (filters.minPrice && /^\d+$/.test(filters.minPrice)) {
    clauses.push(`harga >= $${index}`);
    params.push(parseNumber(filters.minPrice, 0));
    index += 1;
  }
  if (filters.maxPrice && /^\d+$/.test(filters.maxPrice)) {
    clauses.push(`harga <= $${index}`);
    params.push(parseNumber(filters.maxPrice, 0));
    index += 1;
  }

  return {
    clause: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
    params,
    nextIndex: index,
  };
}

function mapTrainRecord(row) {
  return row
    ? {
        ...row,
        harga: Number(row.harga || 0),
      }
    : null;
}

export async function getAllTrains(filters = {}) {
  await ensureInitialized();

  if (provider === "postgres") {
    const built = buildPostgresFilters(filters);
    const result = await getPgPool().query(
      `SELECT * FROM kereta${built.clause} ORDER BY id DESC`,
      built.params,
    );
    return result.rows.map(mapTrainRecord);
  }

  const built = buildSqliteFilters(filters);
  return getSqliteDb()
    .prepare(`SELECT * FROM kereta${built.clause} ORDER BY id DESC`)
    .all(...built.params)
    .map(mapTrainRecord);
}

export async function getPaginatedTrains(filters = {}, options = {}) {
  await ensureInitialized();

  const requestedPage = Math.max(1, parseNumber(options.page, 1));
  const perPage = Math.max(1, parseNumber(options.perPage, 6));

  if (provider === "postgres") {
    const built = buildPostgresFilters(filters);
    const countResult = await getPgPool().query(`SELECT COUNT(*)::int AS total FROM kereta${built.clause}`, built.params);
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * perPage;
    const pageQuery = `SELECT * FROM kereta${built.clause} ORDER BY id DESC LIMIT $${built.nextIndex} OFFSET $${built.nextIndex + 1}`;
    const dataResult = await getPgPool().query(pageQuery, [...built.params, perPage, offset]);
    return {
      rows: dataResult.rows.map(mapTrainRecord),
      total,
      page,
      perPage,
    };
  }

  const built = buildSqliteFilters(filters);
  const totalRow = getSqliteDb()
    .prepare(`SELECT COUNT(*) AS total FROM kereta${built.clause}`)
    .get(...built.params);
  const total = totalRow?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * perPage;
  const rows = getSqliteDb()
    .prepare(`SELECT * FROM kereta${built.clause} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...built.params, perPage, offset)
    .map(mapTrainRecord);

  return { rows, total, page, perPage };
}

export async function getTrainById(id) {
  await ensureInitialized();
  if (provider === "postgres") {
    const result = await getPgPool().query("SELECT * FROM kereta WHERE id = $1", [id]);
    return mapTrainRecord(result.rows[0] || null);
  }
  return mapTrainRecord(getSqliteDb().prepare("SELECT * FROM kereta WHERE id = ?").get(id));
}

export async function createTrain(input) {
  await ensureInitialized();
  const payload = serializeTrainPayload(input);
  const values = [
    payload.nama,
    payload.asal,
    payload.tujuan,
    payload.kelas,
    payload.harga,
    payload.tanggal,
    payload.jam,
    payload.status,
    payload.deskripsi,
    input.gambar || null,
  ];

  if (provider === "postgres") {
    const result = await getPgPool().query(
      `
        INSERT INTO kereta (nama, asal, tujuan, kelas, harga, tanggal, jam, status, deskripsi, gambar)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
      values,
    );
    return mapTrainRecord(result.rows[0]);
  }

  const db = getSqliteDb();
  const info = db
    .prepare(
      `
        INSERT INTO kereta (nama, asal, tujuan, kelas, harga, tanggal, jam, status, deskripsi, gambar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(...values);
  return getTrainById(info.lastInsertRowid);
}

export async function updateTrain(id, input) {
  await ensureInitialized();
  const payload = serializeTrainPayload(input);
  const values = [
    payload.nama,
    payload.asal,
    payload.tujuan,
    payload.kelas,
    payload.harga,
    payload.tanggal,
    payload.jam,
    payload.status,
    payload.deskripsi,
    input.gambar,
    id,
  ];

  if (provider === "postgres") {
    const result = await getPgPool().query(
      `
        UPDATE kereta
        SET nama = $1, asal = $2, tujuan = $3, kelas = $4, harga = $5,
            tanggal = $6, jam = $7, status = $8, deskripsi = $9, gambar = $10
        WHERE id = $11
        RETURNING *
      `,
      values,
    );
    return mapTrainRecord(result.rows[0] || null);
  }

  getSqliteDb()
    .prepare(
      `
        UPDATE kereta
        SET nama = ?, asal = ?, tujuan = ?, kelas = ?, harga = ?,
            tanggal = ?, jam = ?, status = ?, deskripsi = ?, gambar = ?
        WHERE id = ?
      `,
    )
    .run(...values);
  return getTrainById(id);
}

export async function deleteTrain(id) {
  await ensureInitialized();
  const existing = await getTrainById(id);
  if (!existing) return null;

  if (provider === "postgres") {
    await getPgPool().query("DELETE FROM kereta WHERE id = $1", [id]);
    return existing;
  }

  getSqliteDb().prepare("DELETE FROM kereta WHERE id = ?").run(id);
  return existing;
}

export async function getScheduleRows() {
  await ensureInitialized();
  if (provider === "postgres") {
    const result = await getPgPool().query("SELECT nama, tanggal, jam FROM kereta ORDER BY tanggal, jam");
    return result.rows;
  }
  return getSqliteDb().prepare("SELECT nama, tanggal, jam FROM kereta ORDER BY tanggal, jam").all();
}

export async function getStatusRows() {
  await ensureInitialized();
  if (provider === "postgres") {
    const result = await getPgPool().query("SELECT nama, status FROM kereta ORDER BY nama");
    return result.rows;
  }
  return getSqliteDb().prepare("SELECT nama, status FROM kereta ORDER BY nama").all();
}

export async function getDashboardSummary(filters = {}, options = {}) {
  const paginated = await getPaginatedTrains(filters, options);
  const allRows = await getAllTrains();
  const stats = computeStats(allRows);
  const totalPages = Math.max(1, Math.ceil((paginated.total || 0) / paginated.perPage));
  const currentPage = Math.min(paginated.page, totalPages);
  const startIndex = paginated.total ? (currentPage - 1) * paginated.perPage + 1 : 0;
  const endIndex = paginated.total ? startIndex + paginated.rows.length - 1 : 0;

  const stationSet = new Set();
  for (const row of allRows) {
    if (row.asal) stationSet.add(row.asal);
    if (row.tujuan) stationSet.add(row.tujuan);
  }
  const stations = [...stationSet].sort();

  return {
    trains: paginated.rows,
    total: paginated.total,
    stats,
    stations,
    ontime: stats.on_time,
    delay: stats.delay,
    dibatalkan: stats.dibatalkan,
    page: currentPage,
    totalPages,
    startIndex,
    endIndex,
  };
}

export async function getAdminKeretaSummary(filters = {}, options = {}) {
  const paginated = await getPaginatedTrains(filters, options);
  const totalPages = Math.max(1, Math.ceil((paginated.total || 0) / paginated.perPage));
  const currentPage = Math.min(paginated.page, totalPages);
  const startIndex = paginated.total ? (currentPage - 1) * paginated.perPage + 1 : 0;
  const endIndex = paginated.total ? startIndex + paginated.rows.length - 1 : 0;

  return {
    data: paginated.rows,
    total: paginated.total,
    page: currentPage,
    totalPages,
    startIndex,
    endIndex,
    stats: computeStats(paginated.rows),
  };
}

export async function getReportSummary() {
  const rows = await getAllTrains();
  return computeStats(rows);
}

export async function migrateSqliteRows() {
  const db = new Database(sqlitePath, { readonly: true });
  const rows = db.prepare("SELECT * FROM kereta ORDER BY id ASC").all();
  db.close();
  return rows.map(mapTrainRecord);
}

export async function createPurchase(data) {
  await ensureInitialized();

  const insertPurchase = async (kodeBooking) => {
    const values = [
      data.kereta_id,
      data.nama_kereta,
      data.asal || "",
      data.tujuan || "",
      data.kelas || "",
      Number(data.harga_satuan) || 0,
      Number(data.jumlah_tiket) || 1,
      Number(data.total_harga) || 0,
      data.nama_pembeli,
      data.email_pembeli || "",
      data.no_telepon || "",
      data.metode_pembayaran || "transfer",
      "paid",
      kodeBooking,
      data.tanggal_keberangkatan || "",
    ];

    if (provider === "postgres") {
      const result = await getPgPool().query(
        `
          INSERT INTO pembelian
            (kereta_id, nama_kereta, asal, tujuan, kelas, harga_satuan, jumlah_tiket,
             total_harga, nama_pembeli, email_pembeli, no_telepon, metode_pembayaran,
             status_pembayaran, kode_booking, tanggal_keberangkatan)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *
        `,
        values,
      );
      return result.rows[0];
    }

    const db = getSqliteDb();
    const info = db
      .prepare(
        `
          INSERT INTO pembelian
            (kereta_id, nama_kereta, asal, tujuan, kelas, harga_satuan, jumlah_tiket,
             total_harga, nama_pembeli, email_pembeli, no_telepon, metode_pembayaran,
             status_pembayaran, kode_booking, tanggal_keberangkatan)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(...values);
    return db.prepare("SELECT * FROM pembelian WHERE id = ?").get(info.lastInsertRowid);
  };

  // Retry up to 3 times if kode_booking collides (extremely unlikely with 31^8 combos)
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const kodeBooking = attempt === 1 && data.kode_booking
        ? data.kode_booking
        : generateBookingCode();
      return await insertPurchase(kodeBooking);
    } catch (error) {
      const isUniqueViolation =
        (error?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
         error?.code === "23505" ||  // Postgres unique violation
         (error?.message && error.message.includes("UNIQUE constraint failed")));
      if (isUniqueViolation && attempt < maxAttempts) {
        continue; // Retry with a new code
      }
      throw error;
    }
  }
}

export async function getPurchaseByBookingCode(kodeBooking) {
  await ensureInitialized();
  if (provider === "postgres") {
    const result = await getPgPool().query("SELECT * FROM pembelian WHERE kode_booking = $1", [kodeBooking]);
    return result.rows[0] || null;
  }
  return getSqliteDb().prepare("SELECT * FROM pembelian WHERE kode_booking = ?").get(kodeBooking) || null;
}

export async function getPurchaseById(id) {
  await ensureInitialized();
  if (provider === "postgres") {
    const result = await getPgPool().query("SELECT * FROM pembelian WHERE id = $1", [id]);
    return result.rows[0] || null;
  }
  return getSqliteDb().prepare("SELECT * FROM pembelian WHERE id = ?").get(id) || null;
}

function buildPurchaseSearchFilter(search, status) {
  const clauses = [];
  const params = [];

  if (search && search.trim()) {
    clauses.push("(nama_kereta LIKE ? OR kode_booking LIKE ?)");
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }
  if (status && status !== "all") {
    clauses.push("status_pembayaran = ?");
    params.push(status);
  }

  return {
    clause: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
    params,
  };
}

function buildFullTextFilter(search) {
  if (!search || !search.trim()) {
    return { clause: "", params: [] };
  }
  const term = `%${search.trim()}%`;
  // Search across all text-searchable columns (column names must be literal in the SQL string)
  const fields = [
    "kode_booking",
    "nama_kereta",
    "nama_pembeli",
    "asal",
    "tujuan",
    "kelas",
    "metode_pembayaran",
    "no_telepon",
    "email_pembeli",
    "status_pembayaran",
  ];
  const orClauses = fields.map((f) => `${f} LIKE ?`);
  const params = fields.map(() => term);
  return {
    clause: ` AND (${orClauses.join(" OR ")})`,
    params,
  };
}

export async function searchPurchases(search, options = {}) {
  await ensureInitialized();
  const { clause: searchCondition, params: searchParams } = buildFullTextFilter(search);

  const requestedPage = Math.max(1, Number(options.page) || 1);
  const perPage = Math.max(1, Math.min(Number(options.perPage) || 20, 100));

  if (provider === "postgres") {
    const countResult = await getPgPool().query(
      `SELECT COUNT(*)::int AS total FROM pembelian WHERE 1=1${searchCondition}`,
      searchParams,
    );
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * perPage;
    const dataResult = await getPgPool().query(
      `SELECT * FROM pembelian WHERE 1=1${searchCondition} ORDER BY tanggal_pembelian DESC LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}`,
      [...searchParams, perPage, offset],
    );
    return { rows: dataResult.rows, total, page, perPage, totalPages };
  }

  const db = getSqliteDb();
  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM pembelian WHERE 1=1${searchCondition}`).get(...searchParams);
  const total = countRow?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * perPage;
  const rows = db
    .prepare(`SELECT * FROM pembelian WHERE 1=1${searchCondition} ORDER BY tanggal_pembelian DESC LIMIT ? OFFSET ?`)
    .all(...searchParams, perPage, offset);
  return { rows, total, page, perPage, totalPages };
}

export async function getAllPurchases(filters = {}) {
  await ensureInitialized();
  const { period, startDate, endDate, limit, offset, search, status } = filters;
  const { clause: dateCondition, params: dateParams } = buildPurchaseDateFilter(period, startDate, endDate);
  const { clause: searchCondition, params: searchParams } = buildPurchaseSearchFilter(search, status);

  const pageLimit = Math.min(Math.max(1, Number(limit) || 50), 200);
  const pageOffset = Math.max(0, Number(offset) || 0);

  if (provider === "postgres") {
    let query = `SELECT * FROM pembelian WHERE 1=1 ${dateCondition}${searchCondition} ORDER BY tanggal_pembelian DESC`;
    if (pageLimit) {
      query += ` LIMIT $${dateParams.length + searchParams.length + 1} OFFSET $${dateParams.length + searchParams.length + 2}`;
    }
    const result = await getPgPool().query(query, [...dateParams, ...searchParams, pageLimit, pageOffset]);
    return result.rows;
  }

  const db = getSqliteDb();
  let query = `SELECT * FROM pembelian WHERE 1=1 ${dateCondition}${searchCondition} ORDER BY tanggal_pembelian DESC`;
  if (pageLimit) {
    query += ` LIMIT ? OFFSET ?`;
  }
  return db.prepare(query).all(...dateParams, ...searchParams, pageLimit, pageOffset);
}

export async function getPaginatedPurchases(filters = {}, options = {}) {
  await ensureInitialized();
  const { period, startDate, endDate, search, status } = filters;
  const { clause: dateCondition, params: dateParams } = buildPurchaseDateFilter(period, startDate, endDate);
  const { clause: searchCondition, params: searchParams } = buildPurchaseSearchFilter(search, status);

  const requestedPage = Math.max(1, Number(options.page) || 1);
  const perPage = Math.max(1, Math.min(Number(options.perPage) || 15, 100));
  const allParams = [...dateParams, ...searchParams];

  if (provider === "postgres") {
    const countResult = await getPgPool().query(
      `SELECT COUNT(*)::int AS total FROM pembelian WHERE 1=1 ${dateCondition}${searchCondition}`,
      allParams,
    );
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * perPage;
    const dataResult = await getPgPool().query(
      `SELECT * FROM pembelian WHERE 1=1 ${dateCondition}${searchCondition} ORDER BY tanggal_pembelian DESC LIMIT $${allParams.length + 1} OFFSET $${allParams.length + 2}`,
      [...allParams, perPage, offset],
    );
    return { rows: dataResult.rows, total, page, perPage, totalPages };
  }

  const db = getSqliteDb();
  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM pembelian WHERE 1=1 ${dateCondition}${searchCondition}`).get(...allParams);
  const total = countRow?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * perPage;
  const rows = db
    .prepare(`SELECT * FROM pembelian WHERE 1=1 ${dateCondition}${searchCondition} ORDER BY tanggal_pembelian DESC LIMIT ? OFFSET ?`)
    .all(...allParams, perPage, offset);
  return { rows, total, page, perPage, totalPages };
}

function buildPurchaseDateFilter(period, startDate, endDate) {
  if (period === "today") {
    return {
      clause: "AND date(tanggal_pembelian) = date('now', 'localtime')",
      params: [],
    };
  }
  if (period === "week") {
    return {
      clause: "AND tanggal_pembelian >= datetime('now', '-7 days', 'localtime')",
      params: [],
    };
  }
  if (period === "month") {
    return {
      clause: "AND tanggal_pembelian >= datetime('now', '-30 days', 'localtime')",
      params: [],
    };
  }
  if (startDate && endDate) {
    return {
      clause: "AND date(tanggal_pembelian) >= ? AND date(tanggal_pembelian) <= ?",
      params: [startDate, endDate],
    };
  }
  return { clause: "", params: [] };
}

function addStatusCondition(provider, whereClause, params, status) {
  if (status && status !== "all") {
    if (provider === "postgres") {
      const idx = params.length + 1;
      return `${whereClause} AND status_pembayaran = $${idx}`;
    }
    return `${whereClause} AND status_pembayaran = ?`;
  }
  return whereClause;
}

export async function getPurchaseSummary(period, startDate, endDate, status) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    if (provider === "postgres") {
      whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
    } else {
      whereClause = "WHERE date(tanggal_pembelian) = date('now', 'localtime')";
    }
  } else if (period === "week") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-7 days', 'localtime')";
    }
  } else if (period === "month") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-30 days', 'localtime')";
    }
  } else if (startDate && endDate) {
    whereClause = provider === "postgres"
      ? "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2"
      : "WHERE date(tanggal_pembelian) >= ? AND date(tanggal_pembelian) <= ?";
    params = [startDate, endDate];
  }

  whereClause = addStatusCondition(provider, whereClause, params, status);
  if (status && status !== "all") {
    params.push(status);
  }

  if (provider === "postgres") {
    const result = await getPgPool().query(
      `
        SELECT
          COUNT(*)::int AS total_transaksi,
          COALESCE(SUM(total_harga), 0)::int AS total_pendapatan,
          COALESCE(SUM(jumlah_tiket), 0)::int AS total_tiket_terjual
        FROM pembelian ${whereClause}
      `,
      params,
    );
    return result.rows[0];
  }

  const db = getSqliteDb();
  const row = db
    .prepare(`
      SELECT
        COUNT(*) AS total_transaksi,
        COALESCE(SUM(total_harga), 0) AS total_pendapatan,
        COALESCE(SUM(jumlah_tiket), 0) AS total_tiket_terjual
      FROM pembelian ${whereClause}
    `)
    .get(...params);

  return {
    total_transaksi: row?.total_transaksi || 0,
    total_pendapatan: row?.total_pendapatan || 0,
    total_tiket_terjual: row?.total_tiket_terjual || 0,
  };
}

export async function getPurchaseSummaryByDate(period, startDate, endDate, status) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    if (provider === "postgres") {
      whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
    } else {
      whereClause = "WHERE date(tanggal_pembelian) = date('now', 'localtime')";
    }
  } else if (period === "week") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-7 days', 'localtime')";
    }
  } else if (period === "month") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-30 days', 'localtime')";
    }
  } else if (startDate && endDate) {
    whereClause = provider === "postgres"
      ? "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2"
      : "WHERE date(tanggal_pembelian) >= ? AND date(tanggal_pembelian) <= ?";
    params = [startDate, endDate];
  }

  whereClause = addStatusCondition(provider, whereClause, params, status);
  if (status && status !== "all") {
    params.push(status);
  }

  if (provider === "postgres") {
    const result = await getPgPool().query(
      `
        SELECT
          date(tanggal_pembelian) AS tanggal,
          COUNT(*)::int AS transaksi,
          COALESCE(SUM(total_harga), 0)::int AS pendapatan
        FROM pembelian ${whereClause}
        GROUP BY date(tanggal_pembelian)
        ORDER BY tanggal DESC
      `,
      params,
    );
    return result.rows;
  }

  const db = getSqliteDb();
  return db
    .prepare(`
      SELECT
        date(tanggal_pembelian) AS tanggal,
        COUNT(*) AS transaksi,
        COALESCE(SUM(total_harga), 0) AS pendapatan
      FROM pembelian ${whereClause}
      GROUP BY date(tanggal_pembelian)
      ORDER BY tanggal DESC
    `)
    .all(...params);
}

export async function getPurchaseRevenueByStatus(period, startDate, endDate) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    if (provider === "postgres") {
      whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
    } else {
      whereClause = "WHERE date(tanggal_pembelian) = date('now', 'localtime')";
    }
  } else if (period === "week") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-7 days', 'localtime')";
    }
  } else if (period === "month") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-30 days', 'localtime')";
    }
  } else if (startDate && endDate) {
    whereClause = provider === "postgres"
      ? "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2"
      : "WHERE date(tanggal_pembelian) >= ? AND date(tanggal_pembelian) <= ?";
    params = [startDate, endDate];
  }

  if (provider === "postgres") {
    const result = await getPgPool().query(
      `
        SELECT
          status_pembayaran,
          COUNT(*)::int AS jumlah,
          COALESCE(SUM(total_harga), 0)::int AS pendapatan
        FROM pembelian ${whereClause}
        GROUP BY status_pembayaran
      `,
      params,
    );
    const rows = result.rows;
    return {
      paid: { count: rows.find((r) => r.status_pembayaran === "paid")?.jumlah || 0, revenue: rows.find((r) => r.status_pembayaran === "paid")?.pendapatan || 0 },
      pending: { count: rows.find((r) => r.status_pembayaran === "pending")?.jumlah || 0, revenue: rows.find((r) => r.status_pembayaran === "pending")?.pendapatan || 0 },
      cancelled: { count: rows.find((r) => r.status_pembayaran === "cancelled")?.jumlah || 0, revenue: rows.find((r) => r.status_pembayaran === "cancelled")?.pendapatan || 0 },
    };
  }

  const db = getSqliteDb();
  const rows = db
    .prepare(`
      SELECT
        status_pembayaran,
        COUNT(*) AS jumlah,
        COALESCE(SUM(total_harga), 0) AS pendapatan
      FROM pembelian ${whereClause}
      GROUP BY status_pembayaran
    `)
    .all(...params);

  return {
    paid: { count: rows.find((r) => r.status_pembayaran === "paid")?.jumlah || 0, revenue: rows.find((r) => r.status_pembayaran === "paid")?.pendapatan || 0 },
    pending: { count: rows.find((r) => r.status_pembayaran === "pending")?.jumlah || 0, revenue: rows.find((r) => r.status_pembayaran === "pending")?.pendapatan || 0 },
    cancelled: { count: rows.find((r) => r.status_pembayaran === "cancelled")?.jumlah || 0, revenue: rows.find((r) => r.status_pembayaran === "cancelled")?.pendapatan || 0 },
  };
}

export async function getPurchaseStatusCounts(period, startDate, endDate) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    if (provider === "postgres") {
      whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
    } else {
      whereClause = "WHERE date(tanggal_pembelian) = date('now', 'localtime')";
    }
  } else if (period === "week") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-7 days', 'localtime')";
    }
  } else if (period === "month") {
    if (provider === "postgres") {
      whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
    } else {
      whereClause = "WHERE tanggal_pembelian >= datetime('now', '-30 days', 'localtime')";
    }
  } else if (startDate && endDate) {
    whereClause = provider === "postgres"
      ? "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2"
      : "WHERE date(tanggal_pembelian) >= ? AND date(tanggal_pembelian) <= ?";
    params = [startDate, endDate];
  }

  if (provider === "postgres") {
    const result = await getPgPool().query(
      `
        SELECT
          status_pembayaran,
          COUNT(*)::int AS jumlah
        FROM pembelian ${whereClause}
        GROUP BY status_pembayaran
      `,
      params,
    );
    const rows = result.rows;
    return {
      paid: rows.find((r) => r.status_pembayaran === "paid")?.jumlah || 0,
      pending: rows.find((r) => r.status_pembayaran === "pending")?.jumlah || 0,
      cancelled: rows.find((r) => r.status_pembayaran === "cancelled")?.jumlah || 0,
    };
  }

  const db = getSqliteDb();
  const rows = db
    .prepare(`
      SELECT
        status_pembayaran,
        COUNT(*) AS jumlah
      FROM pembelian ${whereClause}
      GROUP BY status_pembayaran
    `)
    .all(...params);

  return {
    paid: rows.find((r) => r.status_pembayaran === "paid")?.jumlah || 0,
    pending: rows.find((r) => r.status_pembayaran === "pending")?.jumlah || 0,
    cancelled: rows.find((r) => r.status_pembayaran === "cancelled")?.jumlah || 0,
  };
}

export function getActiveProvider() {
  return provider;
}

export function isDatabaseAvailable() {
  return provider !== "unavailable";
}
