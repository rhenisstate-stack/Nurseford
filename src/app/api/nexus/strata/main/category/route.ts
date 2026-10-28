// D:\Estupendo\FastAPI\skewblanc\frontend\src\app\api\strata\${STRATA_NAME}\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface DynamicStrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T; // Optional Payload for List Endpoints 📌
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Base Route Logic 📌
const STRATA_GROUP = "main";
const STRATA_NAME = "categories";
const BASE_ROUTE = `/api/castoline/strata/${STRATA_GROUP}/${STRATA_NAME}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Helper function to Forward Requests to  Backend ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
async function forwardToBackend(
  req: NextRequest,
  method: "POST" | "PUT" | "DELETE" | "GET",
  backendPath: string
): Promise<NextResponse> {
  try {
    let body: unknown = {};
    if (method !== "GET") {
      body = await req.json().catch(() => ({}));
    }

    const backendBaseUrl = getBackendBaseUrl();
    const url = `${backendBaseUrl}${backendPath}`;

    console.log(`🌿 [${STRATA_NAME} Route] Forwarding ${method} To :`, url);
    if (method !== "GET") console.log("Request Body : ", JSON.stringify(body));

    //  EXTRACT SESSION HEADERS FIRST
    const castoLine = req.headers.get("x-casto-line");
    const castoBadge = req.headers.get("x-casto-badge");

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

    const responseBody: DynamicStrataResponse = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

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
// GET ROUTE -> List  [Supports FetchType + Pagination + Sorting]
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fetchType = url.searchParams.get("fetchtype") || "absolute";
    const identifier = url.searchParams.get("identifier") || "";

    let backendPath = "";
    let params = new URLSearchParams();

    // ────────────────────────────────────────────────────────────────────────────────────
    // ABSOLUTE FETCH → Pagination + Sorting - Absolute Fetch All with Pagination and Sorting
    if (fetchType === "absolute") {
      const dynamicPage = Number(url.searchParams.get("dynamicPage") || 1);
      const dynamicPerPage = Number(url.searchParams.get("dynamicPerPage") || 20);
      const dynamicSearch = url.searchParams.get("dynamicSearch") || "";
      const dynamicSortColumn = url.searchParams.get("dynamicSortColumn") || "";
      const dynamicSortDirection = url.searchParams.get("dynamicSortDirection") || "asc";

      backendPath = `${BASE_ROUTE}/list/absolute`;

      params = new URLSearchParams({
        fetchtype: fetchType,
        dynamicPage: dynamicPage.toString(),
        dynamicPerPage: dynamicPerPage.toString(),
        dynamicSearch,
        dynamicSortColumn,
        dynamicSortDirection,
      });
    }

    // ────────────────────────────────────────────────────────────────────────────────────
    // CURRENT FETCH → Identifier Only =  Current Fetch for Single Record Based on Identifier
    else if (fetchType === "current") {
      backendPath = `${BASE_ROUTE}/list/current`;

      params = new URLSearchParams({
        fetchtype: fetchType,
        identifier,
      });
    }

    // ────────────────────────────────────────────────────────────────────────────────────
    // DISTINCT FETCH → Identifier Only -  Distinct Fetch for Unique Values Based on Given ID
    else if (fetchType === "distinct") {
      backendPath = `${BASE_ROUTE}/list/distinct`;

      params = new URLSearchParams({
        fetchtype: fetchType,
        identifier,
      });
    }

    // ────────────────────────────────────────────────────────────────────────────────────
    // RELATIVE FETCH → Fetch for Dropdowns / Selections (Search + Limit)
    else if (fetchType === "relative") {
      const dynamicSearch = url.searchParams.get("dynamicSearch") || "";

      // Accept Items Limit From Frontend Hook
      const limitParam = url.searchParams.get("limit");
      const dynamicItems = Number(limitParam || url.searchParams.get("dynamicItems") || 20);

      backendPath = `${BASE_ROUTE}/list/relative`;

      params = new URLSearchParams({
        fetchtype: fetchType,
        identifier,
        dynamicItems: dynamicItems.toString(),
        dynamicSearch,
      });
    }

    // ────────────────────────────────────────────────────────────────────────────────────

    else {
      return NextResponse.json(
        { error: "Invalid Fetchtype ⚓" },
        { status: 400 }
      );
    }

    // Append query string
    backendPath += `?${params.toString()}`;

    // ────────────────────────────────────────────────────────────────────────────────────

    // Forward request to backend
    return forwardToBackend(req, "GET", backendPath);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown GET Route Error ⚓";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
