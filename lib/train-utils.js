import {
  ADMIN_PER_PAGE,
  ALLOWED_IMAGE_EXTENSIONS,
  CLASS_PRICE_MAP,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
} from "./constants";

export function parseNumber(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampPerPage(value, fallback = DEFAULT_PER_PAGE) {
  const parsed = parseNumber(value, fallback);
  if (parsed <= 0 || parsed > MAX_PER_PAGE) {
    return fallback;
  }
  return parsed;
}

export function getPublicPagination(query = {}) {
  return {
    page: Math.max(1, parseNumber(query.page, 1)),
    perPage: clampPerPage(query.per_page, DEFAULT_PER_PAGE),
  };
}

export function getAdminPagination(query = {}) {
  return {
    page: Math.max(1, parseNumber(query.page, 1)),
    perPage: clampPerPage(query.per_page, ADMIN_PER_PAGE),
  };
}

export function normalizeStatus(value = "") {
  const compact = value.trim().toLowerCase().replaceAll(" ", "").replaceAll("-", "");
  if (compact === "ontime") return "on-time";
  if (compact === "delay") return "delay";
  if (["dibatalkan", "batal", "cancelled", "canceled"].includes(compact)) return "dibatalkan";
  return "unknown";
}

export function canonicalStatus(value = "") {
  const key = normalizeStatus(value);
  if (key === "on-time") return "On Time";
  if (key === "delay") return "Delay";
  if (key === "dibatalkan") return "Dibatalkan";
  return value.trim();
}

export function formatCurrency(value = 0) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function getStatusClass(status = "") {
  return normalizeStatus(status);
}

export function getClassClass(trainClass = "") {
  return trainClass.trim().toLowerCase();
}

export function getFiltersFromQuery(query = {}) {
  return {
    search: String(query.search || "").trim(),
    kelas: String(query.kelas || "").trim(),
    status: String(query.status || "").trim(),
    minPrice: String(query.min_price || "").trim(),
    maxPrice: String(query.max_price || "").trim(),
  };
}

export function hasActiveFilters(filters = {}) {
  return Object.values(filters).some((value) => String(value || "").trim() !== "");
}

export function computeStats(rows = []) {
  const counts = { total: rows.length, on_time: 0, delay: 0, dibatalkan: 0 };
  for (const row of rows) {
    const key = normalizeStatus(row.status);
    if (key === "on-time") counts.on_time += 1;
    if (key === "delay") counts.delay += 1;
    if (key === "dibatalkan") counts.dibatalkan += 1;
  }
  return counts;
}

export function computeClassCounts(rows = []) {
  return rows.reduce((accumulator, row) => {
    const key = row.kelas?.trim();
    if (!key) return accumulator;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

export function getImageUrl(image = "") {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
    return image;
  }
  return `/uploads/kereta/${image}`;
}

export function serializeTrainPayload(source = {}) {
  return {
    nama: String(source.nama || "").trim(),
    asal: String(source.asal || "").trim(),
    tujuan: String(source.tujuan || "").trim(),
    kelas: String(source.kelas || "").trim(),
    harga: parseNumber(source.harga, 0),
    tanggal: String(source.tanggal || "").trim(),
    jam: String(source.jam || "").trim(),
    status: canonicalStatus(source.status || ""),
    deskripsi: String(source.deskripsi || "").trim(),
  };
}

export function validateTrainPayload(payload = {}) {
  const missingRequiredField = ["nama", "asal", "tujuan", "kelas", "tanggal", "jam"].find(
    (key) => !String(payload[key] || "").trim(),
  );

  if (missingRequiredField) {
    return `Field ${missingRequiredField} wajib diisi.`;
  }

  return "";
}

export function getSuggestedPrice(trainClass = "") {
  return CLASS_PRICE_MAP[trainClass] || "";
}

export function isAllowedImageFilename(filename = "") {
  const lowerFilename = filename.toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.some((extension) => lowerFilename.endsWith(extension));
}
