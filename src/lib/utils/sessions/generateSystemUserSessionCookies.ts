// frontend/src/lib/utils/sessions/generateSystemUserSessionCookies.ts

"use client";

export const COOKIE_DAYS = 1;
export const COOKIE_PATH = "/";
const isProd = process.env.NODE_ENV === "production";
// Browsers cap a single cookie near 4096 bytes (RFC 6265 limit).
// Keep below that, but give the large session tokens enough room.
const SAFE_COOKIE_SIZE = 4000;

// ───────────────────────────────────────────────────────────────
// CORE COOKIE PRIMITIVES
// ───────────────────────────────────────────────────────────────

export const setCookie = (name: string, value: string, days = COOKIE_DAYS) => {
  if (typeof document === "undefined") return;

  const encoded = encodeURIComponent(value);

  if (encoded.length > SAFE_COOKIE_SIZE) {
    console.error(
      `❌ [setCookie] "${name}" exceeds safe cookie size (${encoded.length} bytes). Aborting write.`
    );
    return;
  }

  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie =
    `${name}=${encoded}; ` +
    `expires=${expires}; path=${COOKIE_PATH}; ` +
    `${isProd ? "Secure; " : ""}` +
    `SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((row) => row.startsWith(name + "="));
  if (!match) return null;
  const rawValue = match.slice(name.length + 1);
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  const expires = new Date(0).toUTCString();
  document.cookie =
    `${name}=; expires=${expires}; path=${COOKIE_PATH}; ` +
    `${isProd ? "Secure; " : ""}` +
    `SameSite=Strict`;
};

// ───────────────────────────────────────────────────────────────
// AUTH SESSION COOKIES
// ───────────────────────────────────────────────────────────────

const AUTH_COOKIES = [
  "skew_blanc_session_line",
  "skew_blanc_session_badge",
  "skew_blanc_session_fingerprint",
  "skew_blanc_session_address",
  "skew_blanc_session_username",
] as const;

/**
 * Wipes all auth session cookies.
 * Call on login (before writing new) and on logout.
 */
export const clearAuthSessionCookies = () => {
  AUTH_COOKIES.forEach(deleteCookie);
};

/**
 * Writes a fresh single-entry session map.
 * Clears stale cookies only after confirming the backend response is valid.
 */
export const writeAuthSessionCookies = (badge: string, line: string, days = COOKIE_DAYS) => {
  setCookie("skew_blanc_session_badge", badge, days);
  setCookie("skew_blanc_session_line", JSON.stringify({ [badge]: line }), days);
};

// ───────────────────────────────────────────────────────────────
// FINGERPRINT
// ───────────────────────────────────────────────────────────────

const FINGERPRINT_LENGTH = 64;
const FINGERPRINT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateFingerprint = (): string => {
  const array = new Uint8Array(FINGERPRINT_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(v => FINGERPRINT_CHARS[v % FINGERPRINT_CHARS.length])
    .join("");
};

export const getOrCreateFingerprint = (): string => {
  const existing = getCookie("skew_blanc_session_fingerprint");
  if (existing) return existing;
  const fingerprint = generateFingerprint();
  setCookie("skew_blanc_session_fingerprint", fingerprint);
  return fingerprint;
};

// ───────────────────────────────────────────────────────────────
// IP ADDRESS
// ───────────────────────────────────────────────────────────────

export const getStoredIPAddress = (): string | null =>
  getCookie("skew_blanc_session_address");

export const storeIPAddress = (ip: string) => {
  if (!getStoredIPAddress()) setCookie("skew_blanc_session_address", ip);
};

export const resolveAndStoreIPAddress = async (): Promise<string | null> => {
  const existing = getStoredIPAddress();
  if (existing) return existing;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (!res.ok) return null;
    const data: { ip?: string } = await res.json();
    if (data?.ip) { storeIPAddress(data.ip); return data.ip; }
    return null;
  } catch { return null; }
};

export const setUsernameCookie = (username: string) => setCookie("skew_blanc_session_username", username);

export const getUsernameCookie = (): string | null => getCookie("skew_blanc_session_username");

export const deleteUsernameCookie = () => deleteCookie("skew_blanc_session_username");

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

