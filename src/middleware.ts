// Placed at Root Level : src\middleware.ts
import { NextResponse, type NextRequest } from "next/server";

function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export function middleware(req: NextRequest) {
  const h = new Headers(req.headers);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "";

  const country =
    req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "";
  const city = safeDecode(req.headers.get("x-vercel-ip-city") || "");
  const location = [city, country].filter(Boolean).join(", ");

  const mobileRaw = req.headers.get("sec-ch-ua-mobile");
  const mobile = mobileRaw === "?1" ? "true" : mobileRaw === "?0" ? "false" : "";

  h.set("x-current-path", req.nextUrl.pathname + req.nextUrl.search);
  h.set("x-current-ip", ip);
  h.set("x-current-location", encodeURIComponent(location));
  h.set("x-current-country", country);
  h.set("x-current-ua", req.headers.get("user-agent") || "");
  h.set("x-current-referrer", req.headers.get("referer") || "");
  h.set("x-current-mobile", mobile);
  h.set("x-current-request-id", crypto.randomUUID());

  let sid = req.cookies.get("x-site-session")?.value;
  const isNew = !sid;
  if (!sid) sid = crypto.randomUUID();
  h.set("x-current-session-id", sid);

  const res = NextResponse.next({ request: { headers: h } });
  if (isNew) {
    res.cookies.set("x-site-session", sid, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};