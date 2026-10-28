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
const STRATA_GROUP = "assessment";
const STRATA_NAME = "exams";
const BASE_ROUTE = `/api/castoline/strata/${STRATA_GROUP}/${STRATA_NAME}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Guest Preview Auth Token Cache (Allows unauthenticated guests to preview the first 10 questions)
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
let cachedGuestBadge: string | null = "B536816D72FA09B200042157A4140BB5ADF8F2CA9D1BF7FEA592AB1A759D33C29696C0D09522571C8081FA69512A97AA";
let cachedGuestLine: string | null = null;
let guestTokenPromise: Promise<{ line: string; badge: string } | null> | null = null;

async function getGuestPreviewToken(): Promise<{ line: string; badge: string } | null> {
  if (cachedGuestLine && cachedGuestBadge) {
    return { line: cachedGuestLine, badge: cachedGuestBadge };
  }
  if (guestTokenPromise) return guestTokenPromise;

  guestTokenPromise = (async () => {
    try {
      const backendBaseUrl = getBackendBaseUrl();
      const loginUrl = `${backendBaseUrl}/api/castoline/auth/login`;
      const email = "preview_guest@rhenis.internal";
      const password = "PreviewGuest2026!#";

      const loginRes = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getSiteHeaders()),
        },
        body: JSON.stringify({
          email,
          password,
          loginMethod: "password",
          LoginProvider: "email",
          dashboardName: "web",
          role: "Learner",
          challenge: "learner.login.skew8lancasto",
        }),
      });

      const loginData = await loginRes.json().catch(() => null);
      if (loginData?.user?.castoLine) {
        const line = String(loginData.user.castoLine);
        const badge = String(loginData.user.castoBadge || cachedGuestBadge);
        cachedGuestLine = line;
        cachedGuestBadge = badge;
        return { line, badge };
      }
    } catch (e) {
      console.error("Failed to acquire guest preview token:", e);
    } finally {
      guestTokenPromise = null;
    }
    return null;
  })();

  return guestTokenPromise;
}

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

    // Fallback: If unauthenticated guest is previewing live exam questions (e.g. first 10 questions free)
    const isLiveExamPath = backendPath.includes("list/live") || backendPath.includes("list/nominal") || fetchtype === "live" || fetchtype === "nominal";
    if (!castoLine && isLiveExamPath) {
      const guestAuth = await getGuestPreviewToken();
      if (guestAuth) {
        castoLine = guestAuth.line;
        if (!castoBadge) castoBadge = guestAuth.badge;
      }
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(await getSiteHeaders()),
    };

    if (castoLine) headers["x-casto-line"] = castoLine;
    if (castoBadge) headers["x-casto-badge"] = castoBadge;

    let backendResponse = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    });

    // If guest preview token expired (401), refresh token and retry once
    if (backendResponse.status === 401 && !req.headers.get("x-casto-line") && isLiveExamPath) {
      cachedGuestLine = null;
      const freshGuestAuth = await getGuestPreviewToken();
      if (freshGuestAuth) {
        headers["x-casto-line"] = freshGuestAuth.line;
        headers["x-casto-badge"] = freshGuestAuth.badge;
        backendResponse = await fetch(url, {
          method,
          headers,
          body: method !== "GET" ? JSON.stringify(body) : undefined,
        });
      }
    }

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
// GET ROUTE -> list [ Supports Filters / Pagination ]
export async function GET(req: NextRequest) {
  const fetchtype = new URL(req.url).searchParams.get("fetchtype");

  if (fetchtype === "current") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/current`, fetchtype);
  }

  if (fetchtype === "absolute") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/absolute`, fetchtype);
  }

  if (fetchtype === "distinct") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/distinct`, fetchtype);
  }

  if (fetchtype === "relative") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/relative`, fetchtype);
  }

  if (fetchtype === "nominal") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/nominal`, fetchtype);
  }

  if (fetchtype === "live") {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/live`, fetchtype);
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
