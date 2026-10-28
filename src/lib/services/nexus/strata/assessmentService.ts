import { apiFetch } from "@/lib/api/api/api";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";

// Supported actions
export type AssessmentAction = "Delete" | "AbsoluteFetch" |"RelativeFetch" | "DistinctFetch"| "NominalFetch"| "CurrentFetch";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

// Supported types
export type StrataType = "Result" ;

// Generic response type
export interface AssessmentResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Map Each combination of StrataType + Action to Internal API route
const ROUTE_MAP: Record<StrataType, Record<AssessmentAction, string>> = {
  Result: {
    Delete: "/api/nexus/strata/assessment/result",
    AbsoluteFetch: "/api/nexus/strata/assessment/result",
    RelativeFetch: "/api/nexus/strata/assessment/result",
    DistinctFetch: "/api/nexus/strata/assessment/result",
    NominalFetch: "/api/nexus/strata/assessment/result",
    CurrentFetch: "/api/nexus/strata/assessment/result",
  },
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Main service function
export const assessmentService = async <T = unknown, Payload = Record<string, unknown>>(
  strataType: StrataType,
  targetAction: AssessmentAction,
  payload?: Payload
): Promise<AssessmentResponse<T>> => {
  try {
    // console.log("🚨 assessmentService payload inspection:");
    Object.entries(payload ?? {}).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        // console.log(k, "→ array", v.map(x => x?.constructor?.name));
      } else {
        console.log(k, "→", v?.constructor?.name);
      }
    });

    // Determine HTTP method
    const methodMap: Record<AssessmentAction, "DELETE" | "GET"> = {
      Delete: "DELETE",
      AbsoluteFetch: "GET",
      RelativeFetch: "GET",
      DistinctFetch: "GET",
      NominalFetch: "GET",
      CurrentFetch: "GET",
    };
    const method = methodMap[targetAction];

    // Determine route
    const baseRoute =
      targetAction === "AbsoluteFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=absolute`
        : targetAction === "RelativeFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=relative`
        : targetAction === "DistinctFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=distinct`
        : targetAction === "CurrentFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=current`
        : targetAction === "NominalFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=nominal`
        : ROUTE_MAP[strataType][targetAction];

    // Append payload as query params for GET (clean empty/null/undefined)
    const cleanPayload: Record<string, string> = {};
    if (payload && typeof payload === "object") {
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          cleanPayload[k] = String(v);
        }
      });
    }
    const searchParams = new URLSearchParams(cleanPayload).toString();
    const route =
      methodMap[targetAction] === "GET" && searchParams
        ? `${baseRoute}&${searchParams}`
        : baseRoute;
  
    console.log(`🔍 [assessmentService] Final route + query string:`, route);

    // Session headers
    const sessionHeaders = renderSystemSessionHeaders();

    // 🔥 IMPROVED FILE DETECTION
    const hasFiles = payload && Object.values(payload).some((v) => {
      if (v instanceof File) return true;
      if (Array.isArray(v)) {
        return v.some(item => item instanceof File);
      }
      return false;
    });

    console.log(`🔍 [assessmentService] Has files? ${hasFiles}`);
    console.log(`🔍 [assessmentService] Method: ${method}`);

    let body: BodyInit | undefined;
    const headers: HeadersInit = {
      ...sessionHeaders,
    };

    // MULTIPART (FILES) ONLY FOR FILES
if (hasFiles && method !== "GET") {
  console.log("🔍 [assessmentService] Creating FormData for file upload");

  const formData = new FormData();

  // Only append actual File objects
  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
      console.log(`  📁 Appended single file: ${key} = ${value.name}`);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) formData.append(key, item);
      });
    }
    // Ignore non-file values entirely — metadata goes to JSON
  });

  // Create a JSON blob for metadata
  const metadata: Record<string, unknown> = {};
  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (!(value instanceof File) && !(Array.isArray(value) && value.some(v => v instanceof File))) {
      metadata[key] = value;
    }
  });

  // Attach metadata as JSON blob
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));

  body = formData;
      
      // Log FormData contents for debugging
      console.log("🔍 [assessmentService] FormData entries:");
      for (const [key, val] of formData.entries()) {
        if (val instanceof File) {
          console.log(`  ${key}: File(${val.name}, ${val.size} bytes, ${val.type})`);
        } else {
          console.log(`  ${key}: ${val}`);
        }
      }
      
    // JSON (NO FILES)
    } else if (method !== "GET") {
      console.log("🔍 [assessmentService] Creating JSON payload");
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload ?? {});
      console.log("🔍 [assessmentService] JSON body:", body);
    }

    // console.log(`🔍 [assessmentService] Final headers:`, headers);
    // console.log(`🔍 [assessmentService] Route: ${route}`);
    // console.log(`🔍 [assessmentService] Body type: ${body?.constructor?.name}`);

    // Send request via internal API
    const result = await apiFetch<AssessmentResponse<T>>(route, {
      method,
      headers,
      body,
      credentials: "include",
    });

    console.log(`🌿 [assessmentService] ${strataType} -> ${targetAction}:`, result);
    return convertBackendKeysToCamel(result) as AssessmentResponse<T>;
  } catch (err: unknown) {
    console.error(`❌ [assessmentService] ${strataType} -> ${targetAction} failed:`, err);
    return { error: err instanceof Error ? err.message : "Unknown strata service error" };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

