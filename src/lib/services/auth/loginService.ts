// src/lib/services/auth/loginService.ts
import { apiFetch } from "@/lib/api/api/api";
import {
  getOrCreateFingerprint,
  getStoredIPAddress,
  resolveAndStoreIPAddress,
  writeAuthSessionCookies,
  getCookie,
  clearAuthSessionCookies,
  setUsernameCookie,
  COOKIE_DAYS,
} from "@/lib/utils/sessions/generateSystemUserSessionCookies";

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────

export type LoginCredentials =
  | {
    email: string;
    password: string;
    pin: string;  // Pin Submitted as Null for password login, but required for pin login
    loginMethod: "password";
    challenge: string;
    LoginProvider: string;
    loginProviderPayload?: string;
    dashboardName?: string;
    role?: string;
    remember?: boolean;
  }
  | {
    email: string;
    password: string; // Password Submitted as Null for pin login, but required for password login
    pin: string;
    loginMethod: "pin";
    challenge: string;
    LoginProvider: string;
    loginProviderPayload?: string;
    dashboardName?: string;
    role?: string;
    remember?: boolean;
  };

export interface LoginResponse {
  redirect_url?: string;
  error?: string;
  casto_line?: string;
  casto_badge?: string;
  user?: {
    id?: string | number;
    email?: string;
    userName?: string;
    role?: string;
  };
}

// ───────────────────────────────────────────────────────────────
// SESSION HELPERS
// ───────────────────────────────────────────────────────────────

export const getSessionFromCookies = (): {
  sessions: Record<string, string>;
  current_user: string | null;
} => {
  const sessionsRaw = getCookie("skew_blanc_session_line");
  const currentUser = getCookie("skew_blanc_session_badge");

  let sessions: Record<string, string> = {};
  if (sessionsRaw) {
    try {
      sessions = JSON.parse(sessionsRaw);
    } catch {
      sessions = {};
    }
  }

  return { sessions, current_user: currentUser };
};

// Re-export under the original name so existing callers don't break
export { clearAuthSessionCookies as clearAuthCookies } from "@/lib/utils/sessions/generateSystemUserSessionCookies";

// ───────────────────────────────────────────────────────────────
// LOGIN
// ───────────────────────────────────────────────────────────────

export const login = async (
  data: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const fingerprint = getOrCreateFingerprint();
    const ipAddress = getStoredIPAddress() ?? (await resolveAndStoreIPAddress());

    const result = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        fingerprint,
        ipAddress: ipAddress ?? undefined,
      }),
      credentials: "include",
    });

    if (result.casto_line && result.casto_badge) {
      clearAuthSessionCookies();
      const days = data.remember ? 30 : COOKIE_DAYS;
      writeAuthSessionCookies(result.casto_badge, result.casto_line, days);
      const resObj = result as Record<string, unknown>;
      const resolvedUsername =
        result.user?.userName ||
        (result.user as { name?: string } | undefined)?.name ||
        (typeof resObj.userName === "string" ? resObj.userName : null) ||
        (typeof resObj.name === "string" ? resObj.name : null) ||
        data.email?.split("@")[0];
      if (resolvedUsername) {
        setUsernameCookie(resolvedUsername);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("session:login", {
            detail: { username: resolvedUsername, user: result.user },
          })
        );
      }
    } else {
      console.warn(
        "⚠️ [loginService] Login succeeded (no error) but backend returned no casto_line / casto_badge — session cookies were NOT written, so the user stays a guest. Received keys:",
        Object.keys(result)
      );
    }

    return result;
  } catch (err: unknown) {
    // Try to parse ASP.NET validation error body from the thrown error
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.errors) {
          const messages = Object.entries(parsed.errors)
            .flatMap(([field, msgs]) =>
              (msgs as string[]).map((m) => `${field}: ${m}`)
            )
            .join(" | ");
          return { error: messages };
        }
        if (parsed?.error) return { error: parsed.error };
        if (parsed?.title) return { error: parsed.title };
      } catch {
        // message wasn't JSON, fall through
      }
      return { error: err.message };
    }
    return { error: "Unknown login error" };
  }
};

// ───────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C - The Winds Chase US ⚓
// ───────────────────────────────────────────────────────────────