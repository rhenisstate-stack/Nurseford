// D:\Estupendo\FastAPI\skewblanc\frontend\src\app\api\nexus\strata\document\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface DynamicStrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Base Route Logic 📌
const STRATA_NAME = "document";
const BASE_ROUTE = `/api/castoline/strata/${STRATA_NAME}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Helper function to Forward Requests to  Backend ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
async function forwardToBackend(
  req: NextRequest,
  method: "POST" | "PUT" | "DELETE" | "GET",
  backendPath: string
): Promise<NextResponse> {
  try {
    const backendBaseUrl = getBackendBaseUrl();
    const queryParams = method === "GET" ? new URL(req.url).searchParams.toString() : "";
    const url = `${backendBaseUrl}${backendPath}${queryParams ? `?${queryParams}` : ""}`;

    console.log(`🌿 Forwarding ${method} to:`, url);

    const contentType = req.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let body: BodyInit | undefined;
    const headers: Record<string, string> = {
      ...(await getSiteHeaders()),
    };

    // Forward Session Headers 📌
    const castoLine = req.headers.get("x-casto-line");
    const castoBadge = req.headers.get("x-casto-badge");

    if (castoLine) headers["x-casto-line"] = castoLine;
    if (castoBadge) headers["x-casto-badge"] = castoBadge;

    // Handle Request Body 📌
    if (method !== "GET") {
      if (isMultipart) {
        // Properly forward multipart as FormData (FILES + JSON METADATA)
        const formData = await req.formData();
        body = formData;

        // ❗ DO NOT SET Content-Type
        // Fetch will automatically set correct multipart boundary

        console.log("📦 Forwarding multipart FormData:");
        for (const [key, val] of formData.entries()) {
          if (val instanceof File) {
            console.log(`  📁 ${key}: File(${val.name}, ${val.size})`);
          } else {
            console.log(`  📝 ${key}: ${val}`);
          }
        }

      } else {
        const raw = await req.text();
        if (!raw.trim()) {
          body = "{}";
          headers["Content-Type"] = "application/json";
        } else {
          try {
            const parsed = JSON.parse(raw);
            body = JSON.stringify(parsed);
            headers["Content-Type"] = "application/json";
            console.log("📄 JSON keys:", Object.keys(parsed).join(", "));
          } catch {
            body = raw;
            headers["Content-Type"] = "text/plain";
            console.log("📝 Plain text body length:", raw.length);
          }
        }
      }
    }

    // Forward request to backend
    const backendResponse = await fetch(url, {
      method,
      headers,
      body,
    });

    const responseBody: DynamicStrataResponse = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    // Normalize Backend Failures and Errors !
    if ('success' in responseBody && responseBody.success === false) {
      responseBody.error = responseBody.message ?? "Unknown Backend Error 🔖";
    }

    console.log("📌 Backend Response Body : ", responseBody);

    console.log(`Backend response: ${backendResponse.status}`);
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    console.error("❌ Proxy error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Proxy error" },
      { status: 500 }
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// POST ROUTE -> Store a New Record
export async function POST(req: NextRequest) {
  return forwardToBackend(req, "POST", `${BASE_ROUTE}/store`);
}

// ────────────────────────────────────────────────────────────────────────────────────
// PUT ROUTE -> Update Existing Record !
export async function PUT(req: NextRequest) {
  return forwardToBackend(req, "PUT", `${BASE_ROUTE}/update`);
}

// ────────────────────────────────────────────────────────────────────────────────────
// DELETE ROUTE -> Remove / Destroy Record !
export async function DELETE(req: NextRequest) {
  return forwardToBackend(req, "DELETE", `${BASE_ROUTE}/delete`);
}

// ────────────────────────────────────────────────────────────────────────────────────
// GET ROUTE -> list [ Supports Filters / Pagination ]
export async function GET(req: NextRequest) {
  const fetchtype = new URL(req.url).searchParams.get("fetchtype");

  if (fetchtype === "absolute") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/absolute`);
  }

  if (fetchtype === "distinct") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/distinct`);
  }

  if (fetchtype === "relative") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/relative`);
  }

  return NextResponse.json(
    { error: "Invalid Fetchtype" },
    { status: 400 }
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
