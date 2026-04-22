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
const provider = process.env.DATABASE_URL?.startsWith("postgres")
  ? "postgres"
  : process.env.POSTGRES_URL?.startsWith("postgres")
    ? "postgres"
    : "sqlite";

let sqliteDb;
let pgPool;
let initPromise;

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
      status TEXT,
      deskripsi TEXT,
      gambar TEXT
    )
  `).run();
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
      status TEXT,
      deskripsi TEXT,
      gambar TEXT
    )
  `);
}

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = provider === "postgres" ? initializePostgres() : initializeSqlite();
  }
  await initPromise;
}

function buildSqliteFilters(filters = {}) {
  const clauses = [];
  const params = [];

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

  return {
    trains: paginated.rows,
    total: paginated.total,
    stats,
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

export function getActiveProvider() {
  return provider;
}
