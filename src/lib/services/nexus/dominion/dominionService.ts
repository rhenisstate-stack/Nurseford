import { apiFetch } from "@/lib/api/api/api";

// Supported actions
export type DominionAction = "Store" | "Update" | "Delete" | "AbsoluteFetch" | "RelativeFetch" | "CurrentFetch" | "DistinctFetch"| "DiscreteFetch"| "NominalFetch" | "LiveFetch";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

// Supported types
export type DominionType =
  | "SubscriptionItem"
  | "SubscriptionPackage"
  ;

// Generic response type
export interface StrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Map Each combination of DominionType + Action to Internal API route
const ROUTE_MAP: Record<DominionType, Record<DominionAction, string>> = {
  SubscriptionItem: {
    Store: "/api/nexus/dominion/subscription/item",
    Update: "/api/nexus/dominion/subscription/item",
    Delete: "/api/nexus/dominion/subscription/item",
    AbsoluteFetch: "/api/nexus/dominion/subscription/item",
    RelativeFetch: "/api/nexus/dominion/subscription/item",
    CurrentFetch: "/api/nexus/dominion/subscription/item",
    DistinctFetch: "/api/nexus/dominion/subscription/item",
    DiscreteFetch: "/api/nexus/dominion/subscription/item",
    NominalFetch: "/api/nexus/dominion/subscription/item",
    LiveFetch: "/api/nexus/dominion/subscription/item",
  },
  SubscriptionPackage: {
    Store: "/api/nexus/dominion/subscription/package",
    Update: "/api/nexus/dominion/subscription/package",
    Delete: "/api/nexus/dominion/subscription/package",
    AbsoluteFetch: "/api/nexus/dominion/subscription/package",
    RelativeFetch: "/api/nexus/dominion/subscription/package",
    CurrentFetch: "/api/nexus/dominion/subscription/package",
    DistinctFetch: "/api/nexus/dominion/subscription/package",
    DiscreteFetch: "/api/nexus/dominion/subscription/package",
    NominalFetch: "/api/nexus/dominion/subscription/package",
    LiveFetch: "/api/nexus/dominion/subscription/package",
  }, 
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Main service function
export const dominionService = async <T = unknown, Payload = Record<string, unknown>>(
  dominionType: DominionType,
  targetAction: DominionAction,
  payload?: Payload
): Promise<StrataResponse<T>> => {
  try {
    // console.log("🚨 dominionService payload inspection:");
    Object.entries(payload ?? {}).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        // console.log(k, "→ array", v.map(x => x?.constructor?.name));
      } else {
        console.log(k, "→", v?.constructor?.name);
      }
    });

    // Determine HTTP method
    const methodMap: Record<DominionAction, "POST" | "PUT" | "DELETE" | "GET"> = {
      Store: "POST",
      Update: "PUT",
      Delete: "DELETE",
      AbsoluteFetch: "GET",
      RelativeFetch: "GET",
      CurrentFetch: "GET",
      DistinctFetch: "GET",
      DiscreteFetch: "GET",
      NominalFetch: "GET",
      LiveFetch: "GET",
    };
    const method = methodMap[targetAction];

    // Determine route
    const baseRoute =
      targetAction === "AbsoluteFetch"
        ? `${ROUTE_MAP[dominionType][targetAction]}?fetchtype=absolute`
        : targetAction === "CurrentFetch"
        ? `${ROUTE_MAP[dominionType][targetAction]}?fetchtype=current`  
        : targetAction === "RelativeFetch"
        ? `${ROUTE_MAP[dominionType][targetAction]}?fetchtype=relative`
        : targetAction === "DistinctFetch"
        ? `${ROUTE_MAP[dominionType][targetAction]}?fetchtype=distinct`
        : targetAction === "DiscreteFetch"
        ? `${ROUTE_MAP[dominionType][targetAction]}?fetchtype=discrete` 
        : targetAction === "NominalFetch"
        ? `${ROUTE_MAP[dominionType][targetAction]}?fetchtype=nominal`
        : targetAction === "LiveFetch"
        ? `${ROUTE_MAP[dominionType][targetAction]}?fetchtype=live`
        : ROUTE_MAP[dominionType][targetAction];

    // Append payload as query params for GET
    const route =
      methodMap[targetAction] === "GET" && payload
        ? `${baseRoute}&${new URLSearchParams(payload as Record<string, string>).toString()}`
        : baseRoute;
  
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

    console.log(`🔍 [dominionService] Has files? ${hasFiles}`);
    console.log(`🔍 [dominionService] Method: ${method}`);

    let body: BodyInit | undefined;
    const headers: HeadersInit = {
      ...sessionHeaders,
    };

    // MULTIPART (FILES) ONLY FOR FILES
if (hasFiles && method !== "GET") {
  console.log("🔍 [dominionService] Creating FormData for file upload");

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
      console.log("🔍 [dominionService] FormData entries:");
      for (const [key, val] of formData.entries()) {
        if (val instanceof File) {
          console.log(`  ${key}: File(${val.name}, ${val.size} bytes, ${val.type})`);
        } else {
          console.log(`  ${key}: ${val}`);
        }
      }
      
    // JSON (NO FILES)
    } else if (method !== "GET") {
      console.log("🔍 [dominionService] Creating JSON payload");
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload ?? {});
      console.log("🔍 [dominionService] JSON body:", body);
    }

    // console.log(`🔍 [dominionService] Final headers:`, headers);
    // console.log(`🔍 [dominionService] Route: ${route}`);
    // console.log(`🔍 [dominionService] Body type: ${body?.constructor?.name}`);

    // Send request via internal API
    const result = await apiFetch<StrataResponse<T>>(route, {
      method,
      headers,
      body,
      credentials: "include",
    });

    console.log(`🌿 [dominionService] ${dominionType} -> ${targetAction}:`, result);
    return result;
  } catch (err: unknown) {
    console.error(`❌ [dominionService] ${dominionType} -> ${targetAction} failed:`, err);
    return { error: err instanceof Error ? err.message : "Unknown strata service error" };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
