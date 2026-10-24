// src/lib/services/auth/socialService.ts
import { apiFetch } from "@/lib/api/api/api";
import {
  getOrCreateFingerprint,
  getStoredIPAddress,
  resolveAndStoreIPAddress,
  writeAuthSessionCookies,
} from "@/lib/utils/sessions/generateSystemUserSessionCookies";

export type SocialProvider =
  | "google"
  | "apple"
  | "facebook"
  | "github"
  | "linkedin"
  | "microsoft";

export type SocialContext = "login" | "register";

export interface SocialRedirectOptions {
  provider: SocialProvider;
  context: SocialContext;
  role?: string;
  dashboardName?: string;
  redirectPath?: string; // where the backend should send the browser back to after OAuth completes
}

// ⚠️ ASSUMPTION: one OAuth-initiation route per provider on the backend, each performing the
// full redirect dance itself: 302 → provider consent screen → provider callback → backend
// validates, sets casto_line/casto_badge session cookies (same as loginService), then 302s
// back to `redirectPath`. Since this is a full-page redirect chain, fingerprint/ipAddress
// (which loginService attaches to every password/pin login) CANNOT be attached here the same
// way — there's no JS round-trip to read them from. If your backend needs fingerprint/ip for
// social login same as password login, it must derive them itself from the request
// (User-Agent, IP from the request headers at the callback stage) rather than receiving them
// as params. Flag this to your backend team if fingerprint parity matters for fraud checks.
const SOCIAL_ROUTE_MAP: Record<SocialProvider, string> = {
  google: "/api/auth/social/google",
  apple: "/api/auth/social/apple",
  facebook: "/api/auth/social/facebook",
  github: "/api/auth/social/github",
  linkedin: "/api/auth/social/linkedin",
  microsoft: "/api/auth/social/microsoft",
};

export const buildSocialRedirectUrl = ({
  provider,
  context,
  role = "Learner",
  dashboardName = "web",
  redirectPath,
  fingerprint,
  ipAddress,
}: SocialRedirectOptions & { fingerprint?: string; ipAddress?: string }): string => {
  const base = SOCIAL_ROUTE_MAP[provider];
  const params = new URLSearchParams({
    context, // "login" | "register" — tells backend the caller's intent
    role,
    dashboardName,
    challenge:
      context === "login"
        ? "learner.login.skew8lancasto"
        : "register-skew8@lancasto",
  });
  if (redirectPath) params.set("redirectPath", redirectPath);
  if (fingerprint) params.set("fingerprint", fingerprint);
  if (ipAddress) params.set("ipAddress", ipAddress);
  return `${base}?${params.toString()}`;
};

// Now async. fingerprint is synchronous (localStorage via getOrCreateFingerprint); ipAddress is cached after first resolution.
export const redirectToSocialProvider = async (
  options: SocialRedirectOptions
): Promise<void> => {
  if (typeof window === "undefined") return;

  const fingerprint = getOrCreateFingerprint();
  const ipAddress = getStoredIPAddress() ?? (await resolveAndStoreIPAddress());

  const url = buildSocialRedirectUrl({
    ...options,
    fingerprint,
    ipAddress: ipAddress ?? undefined,
  });

  window.location.href = url;
};

// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Google One Tap
// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Unlike the redirect providers above, One Tap never leaves the page — Google hands us a
// signed ID token directly via JS callback. That means, unlike redirectToSocialProvider,
// this DOES run through apiFetch like loginService.login() does: same fingerprint/ipAddress
// attachment, same writeAuthSessionCookies() call on success, same error-shape handling.

export interface OneTapLoginParams {
  credential: string; // the signed JWT ID token from Google's GSI callback
  select_by?: string;
  context?: SocialContext; // defaults to "login" — backend should upsert-or-create either way
  role?: string;
  dashboardName?: string;
}

// Mirrors LoginResponse from loginService exactly, so callers can treat both the same way.
export interface OneTapLoginResponse {
  error?: string;
  casto_line?: string;
  casto_badge?: string;
  redirect_url?: string;
}

export const oneTapLogin = async ({
  credential,
  select_by,
  context = "login",
  role = "Learner",
  dashboardName = "web",
}: OneTapLoginParams): Promise<OneTapLoginResponse> => {
  try {
    const fingerprint = getOrCreateFingerprint();
    const ipAddress = getStoredIPAddress() ?? (await resolveAndStoreIPAddress());

    const result = await apiFetch<OneTapLoginResponse>("/api/auth/social/onetap", {
      method: "POST",
      body: JSON.stringify({
        credential,
        select_by,
        context,
        role,
        dashboardName,
        challenge:
          context === "login"
            ? "learner.login.skew8lancasto"
            : "register-skew8@lancasto",
        fingerprint,
        ipAddress: ipAddress ?? undefined,
      }),
      credentials: "include",
    });

    if (result.casto_line && result.casto_badge) {
      writeAuthSessionCookies(result.casto_badge, result.casto_line);
    }

    return result;
  } catch (err: unknown) {
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
    return { error: "Unknown One Tap login error" };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C - The Winds Chase US ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────