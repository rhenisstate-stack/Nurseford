// src/app/api/auth/social/onetap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

// Incoming payload now matches what socialService.oneTapLogin sends — same shape as
// loginService's fingerprint/ipAddress/challenge attachment pattern.
export interface OneTapCredentialBody {
  credential: string;
  select_by?: string;
  context?: "login" | "register";
  role?: string;
  dashboardName?: string;
  challenge?: string;
  fingerprint?: string;
  ipAddress?: string;
}

// ⚠️ ASSUMPTION: backend has a dedicated verification endpoint at
// /api/castoline/auth/social/onetap that takes { idToken, context, role, dashboardName,
// challenge, fingerprint, ipAddress }, verifies the JWT signature + audience + expiry
// against Google's public keys server-side, upserts the user (create if context is
// "register"/doesn't exist, else log in), and returns the SAME response shape as
// /api/castoline/auth/login: { user: { castoBadge, castoLine }, ...rest }. Confirm this
// endpoint + response shape against your ApiAuthController.
export async function POST(req: NextRequest) {
  try {
    const body: OneTapCredentialBody = await req.json();

    if (!body?.credential) {
      return NextResponse.json(
        { error: "Missing One Tap credential ⚓" },
        { status: 400 }
      );
    }

    const backendBaseUrl = getBackendBaseUrl();
    const backendUrl = `${backendBaseUrl}/api/castoline/auth/social/onetap`;

    console.log("Making POST request to:", backendUrl);
    console.log("Request body:", JSON.stringify({ ...body, credential: "[redacted]" }));

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
      },
      body: JSON.stringify({
        idToken: body.credential,
        context: body.context ?? "login",
        role: body.role ?? "Learner",
        dashboardName: body.dashboardName ?? "web",
        challenge: body.challenge ?? "learner.login.skew8lancasto",
        fingerprint: body.fingerprint,
        ipAddress: body.ipAddress,
      }),
    });

    console.log("Backend Response Status : ", backendResponse.status);
    const responseBody = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    console.log("📌 Backend Response Body : ", responseBody);

    const { user, ...rest } = responseBody;

    return NextResponse.json(
      {
        ...rest,
        casto_badge: user?.castoBadge,
        casto_line: user?.castoLine,
      },
      { status: backendResponse.status }
    );
  } catch (err: unknown) {
    console.error("One Tap API route error:", err);
    const message = err instanceof Error ? err.message : "One Tap login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ; - SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────