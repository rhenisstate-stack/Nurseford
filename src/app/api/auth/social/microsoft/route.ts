// src/app/api/auth/social/microsoft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export async function GET(req: NextRequest) {
  const backendBaseUrl = getBackendBaseUrl();
  const searchParams = req.nextUrl.searchParams; // already carries fingerprint/ipAddress/context/etc, forwarded as-is below

  const backendUrl = `${backendBaseUrl}/api/castoline/auth/social/microsoft?${searchParams.toString()}`;

  const backendResponse = await fetch(backendUrl, {
    redirect: "manual",
    headers: { ...(await getSiteHeaders()) },
  });

  const providerUrl = backendResponse.headers.get("location");

  if (!providerUrl) {
    console.error("Social route (Microsoft): backend did not return a Location header", {
      status: backendResponse.status,
    });

    // Send the user back to whichever page initiated the OAuth flow (login, register, etc.)
    const referer = req.headers.get("referer");
    let target: URL;
    try {
      target = referer ? new URL(referer) : new URL("/auth/login", req.url);
      if (target.origin !== req.nextUrl.origin) {
        target = new URL("/auth/login", req.url);
      }
    } catch {
      target = new URL("/auth/login", req.url);
    }

    const response = NextResponse.redirect(target, { status: 302 });
    response.cookies.set("socialError", "Failed Sign In with Microsoft - Kindly Continue with Email.", {
      maxAge: 30, // short-lived, just long enough to survive the redirect
      path: "/",
    });
    return response;
  }

  return NextResponse.redirect(providerUrl, { status: 302 });
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ; - SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────