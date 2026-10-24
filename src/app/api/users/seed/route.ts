// D:\Estupendo\FastAPI\skewblanc\frontend\src\app\api\system\developer\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api"; // your helper function
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface SeedDeveloperResponse {
  message?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body (if any)
    const body = await req.json().catch(() => ({}));

    // Build backend URL
    const backendBaseUrl = getBackendBaseUrl(); // e.g., "http://127.0.0.1:8000"
    const backendUrl = `${backendBaseUrl}/api/castoline/system/user/developer/seed`;

    console.log("🌱 [developerRoute] Forwarding POST to:", backendUrl);
    console.log("Request body:", JSON.stringify(body));

    // Forward request to FastAPI backend
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
      },
      body: JSON.stringify(body),
    });

    const responseBody: SeedDeveloperResponse = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    console.log("📌 Backend Response Body : ", responseBody);

    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    console.error("❌ [developerRoute] Error seeding developer:", err);
    const errorMsg = err instanceof Error ? err.message : "Unknown seed error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
