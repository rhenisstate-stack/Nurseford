import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";



export type UserAction =
  | "Store"
  | "Update"
  | "Delete"
  | "AbsoluteFetch"
  | "CurrentFetch"
  | "RelativeFetch"
  | "DistinctFetch";

export interface UserServiceResponse<GenericPayloadType = unknown> {
  message?: string;
  error?: string;
  data?: GenericPayloadType;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Route Map to internal Route based on the UserRoleId and useraction invoked from the hooks or pages 

const ROUTE_MAP: Record<UserAction, string> = {
  Store: "/api/users/user",
  Update: "/api/users/user",
  Delete: "/api/users/user",
  AbsoluteFetch: "/api/users/user",
  CurrentFetch: "/api/users/user",
  RelativeFetch: "/api/users/user",
  DistinctFetch: "/api/users/user",
};


/* ─────────────────────────────────────────────────────────────
 Main Service
───────────────────────────────────────────────────────────── */

export const userService = async <
  GenericPayloadType = unknown,
  Payload = Record<string, unknown>
>(
    targetAction: UserAction,
    payload?: Payload
): Promise<UserServiceResponse<GenericPayloadType>> => {
  try {
    const methodMap: Record<UserAction, "POST" | "PUT" | "DELETE" | "GET"> = {
      Store: "POST",
      Update: "PUT",
      Delete: "DELETE",
      AbsoluteFetch: "GET",
      CurrentFetch: "GET",
      RelativeFetch: "GET",
      DistinctFetch: "GET",
    };

    const method = methodMap[targetAction];

    // handle fetch types
   const baseRoute =
    targetAction === "AbsoluteFetch"
      ? `${ROUTE_MAP[targetAction]}?fetchtype=absolute`
      : targetAction === "DistinctFetch"
      ? `${ROUTE_MAP[targetAction]}?fetchtype=distinct`
      : targetAction === "CurrentFetch"
      ? `${ROUTE_MAP[targetAction]}?fetchtype=current`
      : targetAction === "RelativeFetch"
      ? `${ROUTE_MAP[targetAction]}?fetchtype=relative`
      : ROUTE_MAP[targetAction];

 // append payload as query params for GET
    const route =
      methodMap[targetAction] === "GET" && payload
        ? `${baseRoute}&${new URLSearchParams(payload as Record<string, string>).toString()}`
        : baseRoute;

  // PARTIAL HELPER AS A SINGLE SOURCE OF TRUTH FOR SESSION HEADERS
    //  If a function returns part of an object,you must use the spread operator (...) to merge it.
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...renderSystemSessionHeaders(),
    };

    // Send request via internal API
    const result = await apiFetch<UserServiceResponse<GenericPayloadType>>(route, {
      method,
      headers,  // Include the Session Headers Info 
      body: method !== "GET" ? JSON.stringify(payload ?? {}) : undefined,
      credentials: "include",
    });
  
   // console.log(`👤 [userService] -> ${targetAction}:`, result);
    return result;
  } catch (err: unknown) {
   console.error(
  `❌ [userService] -> ${targetAction} failed:`,
  err
);

    return {
      error:
        err instanceof Error
          ? err.message
          : "Unknown user service Error",
    };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

