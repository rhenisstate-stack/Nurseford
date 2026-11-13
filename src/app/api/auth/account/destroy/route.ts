import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface DestroyAccountResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const backendBaseUrl = getBackendBaseUrl();
    const { guidId, email, reason } = await req.json();

    if (!guidId || !email) {
      return NextResponse.json(
        { error: "guidId and email are required" },
        { status: 400 }
      );
    }

    const backendUrl = `${backendBaseUrl}/api/castoline/auth/account/destroy`;
    console.log("🗑️ Making POST request to:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
        cookie: req.headers.get("cookie") ?? "",
        "x-casto-line": req.headers.get("x-casto-line") ?? "",
        "x-casto-badge": req.headers.get("x-casto-badge") ?? "",
      },
      // Matches DestroyAccountRequestDto (GuidId, Email, Reason) – ASP.NET binds camelCase
      body: JSON.stringify({ guidId, email, reason: reason ?? null }),
    });

    const responseBody: DestroyAccountResponse =
      await backendResponse.json().catch(() => ({
        error: "Failed to parse backend Response 💎",
      }));

    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Account deletion failed ⚓" },
      { status: 500 }
    );
  }
}