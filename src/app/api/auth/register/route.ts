import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api"; // helper function to get backend URL
import { getSiteHeaders } from "@/lib/config/siteHeaders";

// Type definitions for incoming registration request
export type RegisterCredentials = {
  username: string;
  email: string;
  phone: string;
  password?: string;
  passwordConfirmation?: string;
  pin?: string;
  pinConfirmation?: string;
  loginMethod: "password" | "pin" | "both";
  agree: boolean;
  role?: string;
  dashboardName?: string;
  provider?: string; // email | google | apple | facebook | github | linkedin | microsoft
  challenge: string;
};

// Expected backend response type
export interface RegisterResponse {
  redirect_url?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse incoming request body from frontend
    const body: RegisterCredentials = await req.json();

    // Build full backend URL for register endpoint
    const backendBaseUrl = getBackendBaseUrl(); // e.g., "http://127.0.0.1:8000"
    const backendUrl = `${backendBaseUrl}/api/castoline/auth/register`;

    // Log request for debugging
    console.log("💡 [register route] Forwarding POST request to:", backendUrl);
    console.log("💡 [register route] Request body:", JSON.stringify(body));

    // Forward request to backend
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
      },
      body: JSON.stringify({
        username: body.username,
        email: body.email,
        phone: body.phone,
        password: body.password,
        passwordConfirmation: body.passwordConfirmation,
        pin: body.pin,
        pinConfirmation: body.pinConfirmation,
        loginMethod: body.loginMethod,
        agree: body.agree,
        role: body.role || "user",
        dashboardName: body.dashboardName || "web",
        provider: body.provider || "email",
        challenge: body.challenge,
      }),
    });

    // Log backend response status and body
    console.log("💡 [register route] Backend response status:", backendResponse.status);
    const responseBody = await backendResponse.json().catch(() => ({ error: "Failed to parse backend response" }));
    console.log("💡 [register route] Backend response body:", responseBody);

    // Return response to frontend
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    console.error("❌ [register route] Registration API route error:", err);
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
