import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

// Type definitions for incoming password recovery request
export type PasswordRecoveryRequest =
  | {
    step: "request";
    userGuidId?: string;
    email: string;
    context: "password";
  }
  | {
    step: "verify";
    userGuidId?: string;
    email: string;
    code: string;
    context: "password";
  }
  | {
    step: "reset";
    userGuidId?: string;
    email: string;
    code: string;
    context: "password";
    loginMethod: "password" | "pin" | "both";
    password?: string;
    passwordConfirmation?: string;
    pin?: string;
    pinConfirmation?: string;
  };

// Expected backend response type
export interface RecoveryResponse {
  redirect_url?: string;
  error?: string;
  message?: string;
  data?: unknown;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: PasswordRecoveryRequest = await req.json();
    const backendBaseUrl = getBackendBaseUrl();

    // Map step to backend strata endpoint and HTTP method
    let backendPath = "/api/castoline/strata/support/password/store";
    let method: "POST" | "PUT" | "DELETE" = "POST";

    if (body.step === "verify") {
      backendPath = "/api/castoline/strata/support/password/update";
      method = "PUT";
    } else if (body.step === "reset") {
      backendPath = "/api/castoline/strata/support/password/delete";
      method = "DELETE";
    } else {
      backendPath = "/api/castoline/strata/support/password/store";
      method = "POST";
    }

    const backendUrl = `${backendBaseUrl}${backendPath}`;
    console.log(`💡 [recovery/password route] Forwarding ${method} request to:`, backendUrl);
    console.log("💡 [recovery/password route] Request body:", JSON.stringify(body));

    // Extract session headers
    const castoLine = req.headers.get("x-casto-line");
    const castoBadge = req.headers.get("x-casto-badge");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(await getSiteHeaders()),
    };

    if (castoLine) headers["x-casto-line"] = castoLine;
    if (castoBadge) headers["x-casto-badge"] = castoBadge;

    const backendResponse = await fetch(backendUrl, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    console.log("💡 [recovery/password route] Backend response status:", backendResponse.status);

    const responseBody: RecoveryResponse = await backendResponse.json().catch(() => ({
      error: "Failed to parse backend response.",
    }));

    console.log("📌 [recovery/password route] Backend response body:", responseBody);
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    console.error("❌ [recovery/password route] Password recovery API route error:", err);
    const message = err instanceof Error ? err.message : "Password recovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────