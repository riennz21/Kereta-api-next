export const ADMIN_COOKIE_NAME = "tiketkai_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 12;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
export const DEFAULT_PER_PAGE = 6;
export const ADMIN_PER_PAGE = 5;
export const MAX_PER_PAGE = 24;
export const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
export const TRAIN_CLASSES = ["Ekonomi", "Bisnis", "Eksekutif"];
export const TRAIN_STATUSES = ["On Time", "Delay", "Dibatalkan"];
export const CLASS_PRICE_MAP = {
  Ekonomi: 50000,
  Bisnis: 100000,
  Eksekutif: 150000,
};
