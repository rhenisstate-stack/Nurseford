// D:\Estupendo\FastAPI\skewblanc\frontend\src\app\api\strata\${STRATA_NAME}\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

type BackendResponseBody = Record<string, unknown> & {
  success?: boolean;
  message?: string;
  error?: string;
};

export interface DynamicStrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T; // Optional Payload for List Endpoints 📌
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Base Route Logic 📌
const STRATA_GROUP = "assessment";
const STRATA_NAME = "exams";
const TARGET_NAME = "results";
const BASE_ROUTE = `/api/castoline/strata/${STRATA_GROUP}/${STRATA_NAME}/${TARGET_NAME}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Helper function to Forward Requests to  Backend ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
async function forwardToBackend(
  req: NextRequest,
  method: "POST" | "PUT" | "DELETE" | "GET",
  backendPath: string,
  fetchtype?: string | null
): Promise<NextResponse> {
  try {
    let body: unknown = {};
    if (method !== "GET") {
      body = await req.json().catch(() => ({}));
    }

    const backendBaseUrl = getBackendBaseUrl();
    let queryParams = "";
    if (method === "GET") {
      const sp = new URL(req.url).searchParams;
      const cleanSp = new URLSearchParams();
      sp.forEach((val, key) => {
        if (val !== "" && val !== "undefined" && val !== "null") {
          cleanSp.append(key, val);
        }
      });
      const resolvedFetchType = fetchtype || sp.get("fetchtype");
      if (resolvedFetchType && !cleanSp.has("fetchtype")) {
        cleanSp.set("fetchtype", resolvedFetchType);
      }
      queryParams = cleanSp.toString();
    }
    const url = `${backendBaseUrl}${backendPath}${queryParams ? `?${queryParams}` : ""}`;

    console.log(`🌿 [${STRATA_NAME} Route] Forwarding ${method} To :`, url);
    if (method !== "GET") console.log("Request Body : ", JSON.stringify(body));

    //  EXTRACT SESSION HEADERS (WITH COOKIE FALLBACK)
    let castoLine = req.headers.get("x-casto-line");
    let castoBadge = req.headers.get("x-casto-badge");

    if (!castoBadge) {
      castoBadge = req.cookies.get("skew_blanc_session_badge")?.value || null;
    }

    if (!castoLine && castoBadge) {
      const rawLine = req.cookies.get("skew_blanc_session_line")?.value;
      if (rawLine) {
        try {
          const parsed = JSON.parse(decodeURIComponent(rawLine));
          castoLine = parsed[castoBadge] || Object.values(parsed)[0] || null;
        } catch {
          try {
            const parsed = JSON.parse(rawLine);
            castoLine = parsed[castoBadge] || Object.values(parsed)[0] || null;
          } catch {
            castoLine = rawLine;
          }
        }
      }
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(await getSiteHeaders()),
    };

    if (castoLine) headers["x-casto-line"] = castoLine;
    if (castoBadge) headers["x-casto-badge"] = castoBadge;

    const backendResponse = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    });

    const rawText = await backendResponse.text();
    let responseBody: BackendResponseBody;
    try {
      responseBody = JSON.parse(rawText);
    } catch {
      console.error(`❌ [${STRATA_NAME} Route] Backend non-JSON status=${backendResponse.status}:`, rawText.slice(0, 300));
      responseBody = { error: rawText || "Failed to Parse Backend Response ⚓" };
    }

    // Normalize Backend Failures and Errors !
    if ('success' in responseBody && responseBody.success === false) {
      responseBody.error = responseBody.message ?? "Unknown Backend Error 🔖";
    }

    console.log("📌 Backend Response Body : ", responseBody);

    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : `Unknown ${method} error`;
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// DELETE ROUTE -> Remove / Destroy Record !
export async function DELETE(req: NextRequest) {
  return forwardToBackend(req, "DELETE", `${BASE_ROUTE}/delete`);
}

// ────────────────────────────────────────────────────────────────────────────────────
// GET ROUTE -> list [ Supports Filters / Pagination ]
export async function GET(req: NextRequest) {
  const fetchtype = new URL(req.url).searchParams.get("fetchtype");

  if (fetchtype === "absolute") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/absolute`, fetchtype);
  }

  if (fetchtype === "relative") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/relative`, fetchtype);
  }

  if (fetchtype === "current") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/current`, fetchtype);
  }

  if (fetchtype === "distinct") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/distinct`, fetchtype);
  }

  if (fetchtype === "nominal") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/nominal`, fetchtype);
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
