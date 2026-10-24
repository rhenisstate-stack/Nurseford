import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface LogoutResponse {
  success?: boolean;
  message?: string;
  destroyedSessions?: number;
  redirect_to?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const backendBaseUrl = getBackendBaseUrl();
    const { fetchType, targetDashboard } = await req.json();

    // 🔹 Use a Map for DRY route mapping
    const logoutRouteMap = new Map<string, string>([
      ["distinct", "/api/castoline/auth/logout/sessions/distinct"],
      ["relative", "/api/castoline/auth/logout/sessions/relative"],
    ]);

    const logoutPath = logoutRouteMap.get(fetchType);

    if (!logoutPath) {
      return NextResponse.json(
        { error: `Invalid fetchType: ${fetchType}` },
        { status: 400 }
      );
    }

    const backendUrl = `${backendBaseUrl}${logoutPath}`;

    console.log("🚪 Making POST request to:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
        cookie: req.headers.get("cookie") ?? "",
        "x-casto-line": req.headers.get("x-casto-line") ?? "",
        "x-casto-badge": req.headers.get("x-casto-badge") ?? "",
      },
      body: JSON.stringify({ target_dashboard: targetDashboard }),
    });

    const responseBody: LogoutResponse =
      await backendResponse.json().catch(() => ({
        error: "Failed to parse backend Response 💎",
      }));

    console.log("Backend response body:", responseBody);

    return NextResponse.json(responseBody, {
      status: backendResponse.status,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Logout Failed ⚓" },
      { status: 500 }
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
