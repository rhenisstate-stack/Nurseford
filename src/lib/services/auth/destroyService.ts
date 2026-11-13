import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

export interface DestroyAccountPayload {
  guidId: string;
  email: string;
  reason?: string;
}

export interface DestroyAccountApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Does NOT clear cookies: the backend needs x-casto-line / x-casto-badge.
// The caller clears the session only after success.
export const destroyAccountService = async (
  payload: DestroyAccountPayload
): Promise<DestroyAccountApiResponse> => {
  try {
    const res = (await apiFetch("/api/auth/account/destroy", {
      method: "POST",
      credentials: "include",
      headers: {
        ...renderSystemSessionHeaders(),
      },
      body: JSON.stringify(payload),
    })) as DestroyAccountApiResponse;

    return res ?? { success: false, error: "Empty response from server" };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Account deletion failed ⚓",
    };
  }
};