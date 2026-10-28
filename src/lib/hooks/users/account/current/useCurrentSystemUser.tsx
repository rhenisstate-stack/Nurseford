// src/lib/hooks/users/account/current/useCurrentSystemUser.tsx
"use client";

import { useEffect, useState } from "react";
import { userService, UserAction } from "@/lib/services/users/user/userService";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";
import { getCookie, setUsernameCookie, getUsernameCookie, deleteUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";

export interface SystemUser {
  id: number;
  guidId: string;

  userName: string;
  name?: string | null;
  email: string;
  emailConfirmed: boolean;

  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;

  userType: string;
  twoFactorEnabled: boolean;

  lockoutEnabled: boolean;
  lockoutEnd: string | null;

  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;

  // -------------------------
  // Relations
  // -------------------------
  profile: {
    id: number;
    guidId: string;
    name?: string | null;
    gender: string | null;
    ethnicity: string | null;
    race: string | null;
    religion: string | null;
    language: string | null;
    dateOfBirth: string | null;
    profilePicture: string | null;
    bio: string | null;
    website: string | null;
    about: string | null;

    credential?: {
      id: number;
      guidId: string;
      username: string;
      passwordHash: string;
      createdAt: string;
    } | null;

    location?: {
      id: number;
      guidId: string;
      name: string;
      country: string;
      createdAt: string;
    } | null;
  } | null;

  accesses: Array<{
    id: number;
    isActive: boolean;
    isLocked: boolean;
    isVerified: boolean;
    lockoutEnd: string | null;
    twoFactorExpiry: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
  }>;

  // Roles
  roles: Array<{
    id: number;
    guidId: string;
    name: string | null;
    rank: number;
    status: string | null;
    validFrom: string;
    validUntil: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
  }>;

  // Grants
  grants: Array<{
    id: number;
    guidId: string | null;
    name: string | null;
    description: string | null;
    target: string | null;
    type: string | null;
    status: string | null;
    validFrom: string;
    validUntil: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
  }>;

  emails: Array<{
    email: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt: string | null;
  }>;

  phones: Array<{
    phoneNumber: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt: string | null;
  }>;

  categories: Array<{
    categoryName: string;
    target: string;
    explanation: string;
    dashboard: string;
    dashboardRole: string;
    accessLevel: string;
  }>;

  backupCodes: Array<{
    id: number;
    isUsed: boolean;
    generatedAt: string | null;
    usedAt: string | null;
  }>;

  badges: Array<{
    id: number;
    badgeName: string;
    description: string;
    awardedAt: string | null;
  }>;
}

// Resolve the display name from the backend user object.
// The backend's `userName` is a type-prefixed login handle (e.g. "(U)jane doe")
// — we prefer a real human name (`name` / `profile.name`), and only fall back
// to the cleaned-up login handle/email prefix when no name is stored, so a
// logged-in user never shows the "Guest" placeholder.
function cleanLoginHandle(handle: string): string {
  let out = handle
    // strip leading type prefix like "(U) ", "(E) ", "[A] " etc.
    .replace(/^[\(\[\{][^\)\]\}]*[\)\]\}]\s*/i, "")
    // strip any stray punctuation prefixes
    .replace(/^[#*_-]+/, "")
    .trim();
  if (out.includes("@")) out = out.split("@")[0].trim();
  out = out.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return out;
}

function resolveDisplayName(user: {
  name?: string | null;
  userName?: string;
  profile?: { name?: string | null } | null;
} | null): string {
  if (!user) return "";
  const humanName = (user.name ?? user.profile?.name)?.trim();
  if (humanName) return humanName;

  const handle = (user.userName ?? "").trim();
  if (handle) return cleanLoginHandle(handle);

  return "";
}

// Locate the actual user object inside a backend response.  Endpoints in this
// codebase return their payloads under different envelopes — `{data: {...}}`,
// `{data: {items: [...]}}`, `{data: [user]}`, or the bare object — so walk the
// known wrapper keys and pick the first object that looks like a user record.
function findUserInResponse(value: unknown): SystemUser | null {
  const isUserLike = (v: unknown): v is SystemUser => {
    if (!v || typeof v !== "object") return false;
    const rec = v as Record<string, unknown>;
    return (
      typeof rec.id === "number" ||
      typeof rec.userName === "string" ||
      typeof rec.username === "string" ||
      (typeof rec.email === "string" && rec.email.includes("@"))
    );
  };

  const walk = (v: unknown, depth: number): SystemUser | null => {
    if (v == null || depth > 6) return null;
    if (isUserLike(v)) return v;
    if (Array.isArray(v)) {
      for (const item of v) {
        const found = walk(item, depth + 1);
        if (found) return found;
      }
      return null;
    }
    if (typeof v !== "object") return null;
    for (const key of ["data", "user", "item", "record", "result", "items"]) {
      const found = walk((v as Record<string, unknown>)[key], depth + 1);
      if (found) return found;
    }
    return null;
  };

  return walk(value, 0);
}

export const useCurrentSystemUser = () => {
  const [user, setUser] = useState<SystemUser | null>(() => {
    if (typeof window === "undefined") return null;
    const badgeCookie = getCookie("skew_blanc_session_badge");
    const lineCookie = getCookie("skew_blanc_session_line");
    const storedUsername = getUsernameCookie();
    if (badgeCookie && lineCookie && storedUsername) {
      return {
        id: 0,
        guidId: "",
        userName: storedUsername,
        email: "",
        emailConfirmed: false,
        phoneNumber: null,
        phoneNumberConfirmed: false,
        userType: "",
        twoFactorEnabled: false,
        lockoutEnabled: false,
        lockoutEnd: null,
        createdAt: "",
        updatedAt: null,
        deletedAt: null,
        profile: null,
        accesses: [],
        roles: [],
        grants: [],
        emails: [],
        phones: [],
        categories: [],
        backupCodes: [],
        badges: [],
      };
    }
    return null;
  });
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const badgeCookie = getCookie("skew_blanc_session_badge");
    const lineCookie = getCookie("skew_blanc_session_line");
    return Boolean(badgeCookie && lineCookie);
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const badgeCookie = getCookie("skew_blanc_session_badge");
    const lineCookie = getCookie("skew_blanc_session_line");
    if (!badgeCookie || !lineCookie) return false;
    return !getUsernameCookie();
  });

  // 👇 Action & type constants
  const FETCH_ACTION: UserAction = "CurrentFetch";
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 700;

  useEffect(() => {
    let cancelled = false;

    const badgeCookie = getCookie("skew_blanc_session_badge");
    const lineCookie = getCookie("skew_blanc_session_line");

    if (!badgeCookie || !lineCookie) {
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    const fetchUser = async (attempt: number) => {
      try {
        const result = await userService<SystemUser>(
          FETCH_ACTION
        );

        if (result?.error) throw new Error(result.error);

        // Convert PascalCase to camelCase for .NET backend if set default as per pascalToCamelCase Convertor
        const camelCasedResult = convertBackendKeysToCamel(result);

        if (cancelled) return;

        // LOGIC — Set user safely
        if (camelCasedResult && typeof camelCasedResult === "object") {
           // The backend user may be wrapped in `{data: {...}}`,
           // `{data: {items: [...]}}` or returned directly — find the actual
           // user record, then resolve its display name.
           const userData = findUserInResponse(camelCasedResult);

           if (userData) {
             const displayName = resolveDisplayName(userData);
             userData.userName = displayName;
             setUser(userData);
             setUsernameCookie(displayName);
             setAuthenticated(true);
           } else {
             console.warn(
               "⚠️ [useCurrentSystemUser] current-user response contained no user record; received keys:",
               Object.keys(camelCasedResult as Record<string, unknown>)
             );
             setUser(null);
             setAuthenticated(false);
           }
        } else {
          setUser(null);
          setAuthenticated(false);
        }

        if (!cancelled) {
          setLoading(false);
        }
        return;

      } catch (err: unknown) {
        if (cancelled) return;

        // Transient backend blips (non-JSON proxy responses, timeouts) retry
        if (attempt < MAX_ATTEMPTS - 1) {
          console.warn(
            `⚠️ [useCurrentSystemUser] attempt ${attempt + 1} of ${MAX_ATTEMPTS} failed (${
              err instanceof Error ? err.message : err
            }) — retrying in ${RETRY_DELAY_MS * (attempt + 1)}ms`
          );
          setTimeout(() => fetchUser(attempt + 1), RETRY_DELAY_MS * (attempt + 1));
          return;
        }

        const badgeCookie = getCookie("skew_blanc_session_badge");
        const lineCookie = getCookie("skew_blanc_session_line");

        if (badgeCookie && lineCookie) {
          const fallbackUser: SystemUser = {
            id: 0,
            guidId: "",
            userName: getUsernameCookie() ?? "",
            email: "",
            emailConfirmed: false,
            phoneNumber: null,
            phoneNumberConfirmed: false,
            userType: "",
            twoFactorEnabled: false,
            lockoutEnabled: false,
            lockoutEnd: null,
            createdAt: "",
            updatedAt: null,
            deletedAt: null,
            profile: null,
            accesses: [],
            roles: [],
            grants: [],
            emails: [],
            phones: [],
            categories: [],
            backupCodes: [],
            badges: [],
          };
          setUser(fallbackUser);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser(0);

    const handleLogout = () => {
      cancelled = true;
      deleteUsernameCookie();
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
    };

    const handleLogin = (e?: Event) => {
      const customEvent = e as CustomEvent<{ username?: string }>;
      const quickUsername = customEvent?.detail?.username || getUsernameCookie();
      if (quickUsername) {
        setUser((prev) => ({
          ...(prev ?? ({} as SystemUser)),
          id: prev?.id ?? 0,
          guidId: prev?.guidId ?? "",
          userName: quickUsername,
          email: prev?.email ?? "",
          emailConfirmed: prev?.emailConfirmed ?? false,
          phoneNumber: prev?.phoneNumber ?? null,
          phoneNumberConfirmed: prev?.phoneNumberConfirmed ?? false,
          userType: prev?.userType ?? "",
          twoFactorEnabled: prev?.twoFactorEnabled ?? false,
          lockoutEnabled: prev?.lockoutEnabled ?? false,
          lockoutEnd: prev?.lockoutEnd ?? null,
          createdAt: prev?.createdAt ?? "",
          updatedAt: prev?.updatedAt ?? null,
          deletedAt: prev?.deletedAt ?? null,
          profile: prev?.profile ?? null,
          accesses: prev?.accesses ?? [],
          roles: prev?.roles ?? [],
          grants: prev?.grants ?? [],
          emails: prev?.emails ?? [],
          phones: prev?.phones ?? [],
          categories: prev?.categories ?? [],
          backupCodes: prev?.backupCodes ?? [],
          badges: prev?.badges ?? [],
        }));
        setAuthenticated(true);
      }
      fetchUser(0);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("session:logout", handleLogout);
      window.addEventListener("session:login", handleLogin);
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("session:logout", handleLogout);
        window.removeEventListener("session:login", handleLogin);
      }
    };
  }, []);

  return {
    user,
    loading,
    authenticated,
  };
};
