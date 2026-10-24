import "server-only";
import { headers } from "next/headers";
import { APP_KEY, APP_DOMAIN, APP_NAME } from "./config";

export async function getSiteHeaders(): Promise<Record<string, string>> {
  let h: Headers | null = null;
  try {
    h = await headers();
  } catch {
    // outside request scope
  }

  return {
    "x-site-key": APP_KEY,
    "x-site-domain": APP_DOMAIN,
    "x-site-name": APP_NAME,
    "x-site-path": h?.get("x-current-path") || "",
    "x-site-ip-address": h?.get("x-current-ip") || "",
    "x-site-location": h?.get("x-current-location") || "",
    "x-site-country": h?.get("x-current-country") || "",
    "x-site-brouser": h?.get("x-current-ua") || "",
    "x-site-time": new Date().toISOString(),
    "x-site-referrer": h?.get("x-current-referrer") || "",
    "x-site-mobile": h?.get("x-current-mobile") || "",
    "x-site-request-id": h?.get("x-current-request-id") || crypto.randomUUID(),
    "x-site-session-id": h?.get("x-current-session-id") || "",
  };
}
