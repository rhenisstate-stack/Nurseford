import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api"; // helper function to get backend URL
import { getSiteHeaders } from "@/lib/config/siteHeaders";

// Type definitions for incoming support issue submission
export type SupportIssueRequest = {
  email: string;
  phone: string;
  category: "login_issue" | "account_recovery" | "payment_billing" | "exam_technical" | "other";
  message: string;
};

// Expected backend response type
export interface SupportResponse {
  error?: string;
  message?: string;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Parse incoming request body
    const body: SupportIssueRequest = await req.json();

    // Build full backend URL for support endpoint - defined at backend\app\routers.py plus the prefix in main.py
    const backendBaseUrl = getBackendBaseUrl(); // e.g., "http://127.0.0.1:8000"
    const backendUrl = `${backendBaseUrl}/api/castoline/auth/support`;

    // Log the request URL and body for debugging
    console.log("💡 [support route] Forwarding POST request to:", backendUrl);
    console.log("💡 [support route] Request body:", JSON.stringify(body));

    // Forward request to the actual backend
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
      },
      body: JSON.stringify({
        email: body.email,
        phone: body.phone,
        category: body.category,
        message: body.message,
      }),
    });

    // Log the backend response status and body for debugging
    console.log("💡 [support route] Backend response status:", backendResponse.status);
    const responseBody = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    console.log("📌 [support route] Backend response body:", responseBody);

    // Return data to frontend
    return NextResponse.json(responseBody, { status: backendResponse.status });

  } catch (err: unknown) {
    console.error("❌ [support route] Support API route error:", err);
    const message = err instanceof Error ? err.message : "Support submission failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────