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
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie =
    `${name}=${encoded}; ` +
    `expires=${expires}; path=${COOKIE_PATH}; ` +
    `${isHttps ? "Secure; " : ""}` +
    `SameSite=Lax`;
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
  const past = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

  // Try multiple paths, samesite variants, and domains to ensure browser clears the cookie completely
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const paths = ["/", "", currentPath];
  const sameSites = ["Strict", "Lax", "None"];

  for (const p of paths) {
    const pathStr = p ? `; path=${p}` : "";
    for (const ss of sameSites) {
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const secureStr = ss === "None" || isHttps ? "; Secure" : "";
      document.cookie = `${name}=; ${past}${pathStr}; SameSite=${ss}${secureStr}`;
    }
    // Also without SameSite
    document.cookie = `${name}=; ${past}${pathStr}`;
  }

  // Domain-specific deletions
  if (typeof window !== "undefined" && window.location.hostname) {
    const hostname = window.location.hostname;
    const domainParts = hostname.split(".");
    if (domainParts.length > 1) {
      const rootDomain = `.${domainParts.slice(-2).join(".")}`;
      document.cookie = `${name}=; ${past}; path=/; domain=${rootDomain}`;
      document.cookie = `${name}=; ${past}; path=/; domain=${hostname}`;
    }
  }
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
 * Wipes all auth session cookies and user-level storage caches.
 * Call on login (before writing new) and on logout.
 */
export const clearAuthSessionCookies = () => {
  AUTH_COOKIES.forEach(deleteCookie);
  deleteCookie("skew_blanc_session_username");

  // Also purge local and session storage user markers
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("skew_blanc_session_username");
      localStorage.removeItem("skew_blanc_session_badge");
      localStorage.removeItem("skew_blanc_session_line");

      // Purge all cached user subscription keys: user_sub_*
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith("user_sub_") || k.startsWith("skew_blanc_"))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
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

export const setUsernameCookie = (username: string) => {
  setCookie("skew_blanc_session_username", username);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("skew_blanc_session_username", username);
    } catch {}
  }
};

export const getUsernameCookie = (): string | null => {
  const cookieVal = getCookie("skew_blanc_session_username");
  if (cookieVal) return cookieVal;
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("skew_blanc_session_username");
    } catch {}
  }
  return null;
};

export const deleteUsernameCookie = () => {
  deleteCookie("skew_blanc_session_username");
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("skew_blanc_session_username");
    } catch {}
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
