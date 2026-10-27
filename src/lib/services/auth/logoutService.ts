import { apiFetch } from "@/lib/api/api/api";
import { clearAuthSessionCookies } from "@/lib/utils/sessions/generateSystemUserSessionCookies";

interface LogoutApiResponse {
  success?: boolean;
  redirect_to?: string;
  message?: string;
  error?: string;
}

//  @param targetDashboard - The dashboard to redirect after logout
//  @param fetchType - "distinct" = current session, "relative" = all sessions
export const dynamicLogoutService = async (
  targetDashboard: string,
  fetchType: "distinct" | "relative" = "distinct"
): Promise<LogoutApiResponse> => {
  let backendResponse: LogoutApiResponse = { success: false };

  // 1. Immediately wipe client credentials so all listeners flip to Guest without waiting on backend
  clearAuthSessionCookies();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("session:logout"));
  }

  try {
    backendResponse = (await apiFetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        targetDashboard,
        fetchType,
      }),
    })) as LogoutApiResponse;

  } catch (err) {
    console.warn("Logout API Call Failed:", err);
    backendResponse = { success: false, redirect_to: "/auth/login", message: "Signed out successfully ⚓" };
  } finally {
    clearAuthSessionCookies();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("session:logout"));
    }
  }

  return backendResponse;
};
