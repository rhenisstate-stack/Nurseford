import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

export interface RegistrationControlInput {
  registration_code: string;
  email?: string;
  role_id: number;
  description?: string;
  max_usage: number;
  expires_on?: string;
  is_active: boolean;
}

// Generic service response
export interface ServiceResponse<GenericPayloadType = unknown> {
  message?: string;
  error?: string;
  data?: GenericPayloadType;
}

/* ---------------------------------------------
 * Service
 * --------------------------------------------- */

export async function upsertRegistrationOption<GenericPayloadType = unknown>(
  input: RegistrationControlInput
): Promise<ServiceResponse<GenericPayloadType>> {
  try {

    // PARTIAL HELPER AS A SINGLE SOURCE OF TRUTH FOR SESSION HEADERS
    //  If a function returns part of an object,you must use the spread operator (...) to merge it.
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...renderSystemSessionHeaders(),
    };

    const result = await apiFetch<ServiceResponse<GenericPayloadType>>('/api/users/controls/registrations/option', {
      method: 'POST',
      headers,  // Include the Session Headers Info 
      body: JSON.stringify(input),
    });

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

