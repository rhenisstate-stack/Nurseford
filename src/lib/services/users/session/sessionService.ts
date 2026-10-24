import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";


export interface SessionControlInput {
  role_id: number;
  max_concurrent_sessions: number;
  max_sessions_per_client: number;
  idle_timeout_minutes: number;
  absolute_timeout_minutes: number;
  enforce_fingerprint: boolean;
  enforce_ip_consistency: boolean;
  allow_ip_drift: boolean;
  rotate_on_login: boolean;
  rotate_on_privilege_change: boolean;
  rotate_on_password_change: boolean;
  terminate_on_violation: boolean;
  violation_grace_requests: number;
  is_active: boolean;
}

// Make ServiceResponse generic to allow different payload types
export interface ServiceResponse<GenericPayloadType = unknown> {
  message?: string;
  error?: string;
  data?: GenericPayloadType;
}

/* ---------------------------------------------
 * Service
 * --------------------------------------------- */

export async function upsertSessionControl<GenericPayloadType = unknown>(
  input: SessionControlInput
): Promise<ServiceResponse<GenericPayloadType>> {
  try {

    // PARTIAL HELPER AS A SINGLE SOURCE OF TRUTH FOR SESSION HEADERS
    //  If a function returns part of an object,you must use the spread operator (...) to merge it.
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...renderSystemSessionHeaders(),
    };

    // Make the fetch call generic with GenericPayloadType
    const result = await apiFetch<ServiceResponse<GenericPayloadType>>(
      "/api/users/session",
      {
        method: "POST",
        headers, // Include the Session Headers Info
        body: JSON.stringify(input),
      }
    );

      console.log(`👤 [userService]:`, result);
      return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }

    return { error: 'Unexpected error occurred' };
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

