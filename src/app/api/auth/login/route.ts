import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api"; // helper functions
import { getSiteHeaders } from "@/lib/config/siteHeaders";

// Type definitions for incoming login request
export type LoginCredentials =
  | {
    email: string;
    password: string;
    loginMethod: "password";
    LoginProvider: string;
    dashboardName?: string;
    role?: string;
    fingerprint?: string;
    ipAddress?: string;

  }
  | {
    email: string;
    pin: string;
    loginMethod: "pin";
    LoginProvider: string;
    dashboardName?: string;
    role?: string;
    fingerprint?: string;
    ipAddress?: string;

  };

// Expected backend response type
export interface DynamicLoginResponse {
  redirect_url?: string;
  error?: string;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Parse incoming request body
    const body: LoginCredentials = await req.json();

    // Build full backend URL for login endpoint - defined at backend\app\routers.py plus the prefix in main.py
    const backendBaseUrl = getBackendBaseUrl(); // e.g., "http://127.0.0.1:8000"
    const backendUrl = `${backendBaseUrl}/api/castoline/auth/login`;

    // Log the request URL and body for debugging
    console.log("Making POST request to:", backendUrl);
    console.log("Request body:", JSON.stringify(body));

    const payload = {
      ...body,
      challenge: (body as Record<string, unknown>).challenge || "learner.login.skew8lancasto",
    };

    // Forward request to the actual backend
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
      },
      body: JSON.stringify(payload),
    });

    // Log the backend response status and body for debugging
    console.log("Backend Response Status : ", backendResponse.status);
    const responseBody = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    console.log("📌 Backend Response Body : ", responseBody);

    const { user, ...rest } = responseBody;

    // Return data to frontend - Read 
    return NextResponse.json({
      ...rest,
      user,
      casto_badge: user?.castoBadge,
      casto_line: user?.castoLine,
    }, { status: backendResponse.status });

  } catch (err: unknown) {
    console.error("Login API route error:", err);
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
