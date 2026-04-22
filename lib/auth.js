import crypto from "node:crypto";
import { serialize as serializeCookie, parse as parseCookie } from "cookie";
import { ADMIN_COOKIE_NAME, ADMIN_PASSWORD, COOKIE_MAX_AGE } from "./constants";

function getSecret() {
  return process.env.SECRET_KEY || "dev-secret-key";
}

function signValue(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function useSecureCookie() {
  return Boolean(process.env.VERCEL) || process.env.COOKIE_SECURE === "1";
}

export function createAdminCookie() {
  const payload = "admin";
  const signature = signValue(payload);
  return serializeCookie(ADMIN_COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: useSecureCookie(),
  });
}

export function clearAdminCookie() {
  return serializeCookie(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: useSecureCookie(),
  });
}

export function verifyAdminPassword(password = "") {
  return password === ADMIN_PASSWORD;
}

export function getSafeAdminPath(value, fallback = "/admin/dashboard") {
  return typeof value === "string" && value.startsWith("/admin") ? value : fallback;
}

export function isAdminRequest(req) {
  const cookies = parseCookie(req.headers.cookie || "");
  const rawCookie = cookies[ADMIN_COOKIE_NAME];
  if (!rawCookie) return false;

  const [payload, signature] = rawCookie.split(".");
  if (!payload || !signature) return false;
  return signValue(payload) === signature && payload === "admin";
}
