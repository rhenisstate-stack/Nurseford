import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

export type CheckSessionResponse<GenericPayloadType = unknown> = {
  logged_in: boolean;
  redirect_url?: string;
  user_id?: string;
  user_email?: string;
  data?: GenericPayloadType; // Generic payload for flexibility
};

export const session = {
  async check<GenericPayloadType = unknown>(): Promise<CheckSessionResponse<GenericPayloadType>> {

    // PARTIAL HELPER AS A SINGLE SOURCE OF TRUTH FOR SESSION HEADERS
    //  If a function returns part of an object,you must use the spread operator (...) to merge it.
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...renderSystemSessionHeaders(),
    };

    const data = await apiFetch<CheckSessionResponse<GenericPayloadType>>("/api/auth/session", {
      method: "GET",
      credentials: "include",
      headers,  // Include the Session Headers Info 
    });

    return data;
  },
};
