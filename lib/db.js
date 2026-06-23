import pkg from "pg";
import {
  canonicalStatus,
  computeStats,
  parseNumber,
  serializeTrainPayload,
} from "./train-utils";

const { Pool } = pkg;

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

function getPgPool() {
  if (!pgPool) {
    pgPool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pgPool;
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

  try {
    await pool.query("ALTER TABLE pembelian ADD COLUMN kode_booking TEXT");
  } catch {
  }

  try {
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_pembelian_kode_booking ON pembelian(kode_booking)");
  } catch {
  }
}

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = initializePostgres();
  }
  await initPromise;
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
  const built = buildPostgresFilters(filters);
  const result = await getPgPool().query(
    `SELECT * FROM kereta${built.clause} ORDER BY id DESC`,
    built.params,
  );
  return result.rows.map(mapTrainRecord);
}

export async function getPaginatedTrains(filters = {}, options = {}) {
  await ensureInitialized();

  const requestedPage = Math.max(1, parseNumber(options.page, 1));
  const perPage = Math.max(1, parseNumber(options.perPage, 6));

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

export async function getTrainById(id) {
  await ensureInitialized();
  const result = await getPgPool().query("SELECT * FROM kereta WHERE id = $1", [id]);
  return mapTrainRecord(result.rows[0] || null);
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

export async function deleteTrain(id) {
  await ensureInitialized();
  const existing = await getTrainById(id);
  if (!existing) return null;

  await getPgPool().query("DELETE FROM kereta WHERE id = $1", [id]);
  return existing;
}

export async function getScheduleRows() {
  await ensureInitialized();
  const result = await getPgPool().query("SELECT nama, tanggal, jam FROM kereta ORDER BY tanggal, jam");
  return result.rows;
}

export async function getStatusRows() {
  await ensureInitialized();
  const result = await getPgPool().query("SELECT nama, status FROM kereta ORDER BY nama");
  return result.rows;
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
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const kodeBooking = attempt === 1 && data.kode_booking
        ? data.kode_booking
        : generateBookingCode();
      return await insertPurchase(kodeBooking);
    } catch (error) {
      const isUniqueViolation =
        error?.code === "23505";
      if (isUniqueViolation && attempt < maxAttempts) {
        continue;
      }
      throw error;
    }
  }
}

export async function getPurchaseByBookingCode(kodeBooking) {
  await ensureInitialized();
  const result = await getPgPool().query("SELECT * FROM pembelian WHERE kode_booking = $1", [kodeBooking]);
  return result.rows[0] || null;
}

export async function getPurchaseById(id) {
  await ensureInitialized();
  const result = await getPgPool().query("SELECT * FROM pembelian WHERE id = $1", [id]);
  return result.rows[0] || null;
}

function buildPurchaseSearchFilter(search, status, paramStartIndex = 1) {
  const clauses = [];
  const params = [];

  if (search && search.trim()) {
    clauses.push(`(nama_kereta ILIKE $${paramStartIndex} OR kode_booking ILIKE $${paramStartIndex + 1})`);
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }
  if (status && status !== "all") {
    const idx = paramStartIndex + params.length;
    clauses.push(`status_pembayaran = $${idx}`);
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
  const orClauses = fields.map((f, i) => `${f} ILIKE $${i + 1}`);
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

export async function getAllPurchases(filters = {}) {
  await ensureInitialized();
  const { period, startDate, endDate, limit, offset, search, status } = filters;
  const { clause: dateCondition, params: dateParams } = buildPurchaseDateFilter(period, startDate, endDate);
  const searchStartIndex = dateParams.length + 1;
  const { clause: searchCondition, params: searchParams } = buildPurchaseSearchFilter(search, status, searchStartIndex);

  const pageLimit = Math.min(Math.max(1, Number(limit) || 50), 200);
  const pageOffset = Math.max(0, Number(offset) || 0);

  let query = `SELECT * FROM pembelian WHERE 1=1 ${dateCondition}${searchCondition} ORDER BY tanggal_pembelian DESC`;
  if (pageLimit) {
    query += ` LIMIT $${dateParams.length + searchParams.length + 1} OFFSET $${dateParams.length + searchParams.length + 2}`;
  }
  const result = await getPgPool().query(query, [...dateParams, ...searchParams, pageLimit, pageOffset]);
  return result.rows;
}

export async function getPaginatedPurchases(filters = {}, options = {}) {
  await ensureInitialized();
  const { period, startDate, endDate, search, status } = filters;
  const { clause: dateCondition, params: dateParams } = buildPurchaseDateFilter(period, startDate, endDate);
  const searchStartIndex = dateParams.length + 1;
  const { clause: searchCondition, params: searchParams } = buildPurchaseSearchFilter(search, status, searchStartIndex);

  const requestedPage = Math.max(1, Number(options.page) || 1);
  const perPage = Math.max(1, Math.min(Number(options.perPage) || 15, 100));
  const allParams = [...dateParams, ...searchParams];

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

function buildPurchaseDateFilter(period, startDate, endDate) {
  if (period === "today") {
    return {
      clause: "AND date(tanggal_pembelian) = CURRENT_DATE",
      params: [],
    };
  }
  if (period === "week") {
    return {
      clause: "AND tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'",
      params: [],
    };
  }
  if (period === "month") {
    return {
      clause: "AND tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'",
      params: [],
    };
  }
  if (startDate && endDate) {
    return {
      clause: "AND date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2",
      params: [startDate, endDate],
    };
  }
  return { clause: "", params: [] };
}

export async function getPurchaseSummary(period, startDate, endDate) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
  } else if (period === "week") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
  } else if (period === "month") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
  } else if (startDate && endDate) {
    whereClause = "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2";
    params = [startDate, endDate];
  }

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

export async function getPurchaseSummaryByDate(period, startDate, endDate) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
  } else if (period === "week") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
  } else if (period === "month") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
  } else if (startDate && endDate) {
    whereClause = "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2";
    params = [startDate, endDate];
  }

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

export async function getPurchaseRevenueByStatus(period, startDate, endDate) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
  } else if (period === "week") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
  } else if (period === "month") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
  } else if (startDate && endDate) {
    whereClause = "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2";
    params = [startDate, endDate];
  }

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

export async function getPurchaseStatusCounts(period, startDate, endDate) {
  await ensureInitialized();

  let whereClause = "WHERE 1=1";
  let params = [];

  if (period === "today") {
    whereClause = "WHERE date(tanggal_pembelian) = CURRENT_DATE";
  } else if (period === "week") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '7 days'";
  } else if (period === "month") {
    whereClause = "WHERE tanggal_pembelian >= CURRENT_DATE - INTERVAL '30 days'";
  } else if (startDate && endDate) {
    whereClause = "WHERE date(tanggal_pembelian) >= $1 AND date(tanggal_pembelian) <= $2";
    params = [startDate, endDate];
  }

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
