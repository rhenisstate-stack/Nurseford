// src\app\api\auth\support\password\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface DynamicStrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const STRATA_GROUP = "support";
const STRATA_NAME = "password";
const BASE_ROUTE = `/api/castoline/strata/${STRATA_GROUP}/${STRATA_NAME}`;

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
    const queryParams = method === "GET" ? new URL(req.url).searchParams.toString() : "";
    const url = `${backendBaseUrl}${backendPath}${queryParams ? `?${queryParams}` : ""}`;

    console.log(`🌿 [${STRATA_NAME} Route] Forwarding ${method} To :`, url);
    if (method !== "GET") console.log("Request Body : ", JSON.stringify(body));

    // EXTRACT SESSION HEADERS FIRST
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

    console.log("📌 Backend Response Body : ", responseBody);

    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : `Unknown ${method} error`;
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// POST -> Store (e.g. request recovery code)
export async function POST(req: NextRequest) {
  return forwardToBackend(req, "POST", `${BASE_ROUTE}/store`);
}

// PUT -> Update (e.g. verify recovery code)
export async function PUT(req: NextRequest) {
  return forwardToBackend(req, "PUT", `${BASE_ROUTE}/update`);
}

// DELETE -> Delete (e.g. apply new credentials)
export async function DELETE(req: NextRequest) {
  return forwardToBackend(req, "DELETE", `${BASE_ROUTE}/delete`);
}

// GET -> list [ Supports Filters / Pagination ]
export async function GET(req: NextRequest) {
  const fetchtype = new URL(req.url).searchParams.get("fetchtype");

  if (fetchtype === "absolute") return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/absolute`);
  if (fetchtype === "distinct") return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/distinct`);
  if (fetchtype === "relative") return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/relative`);
  if (fetchtype === "current") return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/current`);
  if (fetchtype === "discrete") return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/discrete`);
  if (fetchtype === "nominal") return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/nominal`);
  if (fetchtype === "live") return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/live`);

  return NextResponse.json({ error: "Invalid Fetchtype" }, { status: 400 });
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────