import { apiFetch } from "@/lib/api/api/api";

// Supported actions
export type SupportAction = "Store" | "Update" | "Delete" | "AbsoluteFetch" | "RelativeFetch" | "CurrentFetch" | "DistinctFetch" | "DiscreteFetch" | "NominalFetch" | "LiveFetch";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
export type ClientReadStatus = "Unread" | "Read" | "Later" | "Bookmarked" | "Flagged" | "Pinned" | "Starred";
// Supported types
export type SupportType =
  | "SupportSocial"
  | "SupportPassword"
  | "SupportMessage"
  | "SupportEmail"
  | "SupportPhone"
  | "Support2fa"
  | "SupportAccount"
  ;

// Generic response type
export interface StrataResponse<T = unknown> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// Mirrors HeedSystemUserMessageResponseDto (camelCase from ASP.NET)
export interface SupportMessageItem {
  id: number;
  guidId: string;
  userId?: number | null;
  userGuidId?: string | null;
  userName?: string | null;
  email?: string | null;
  phone?: string | null;
  category: string;
  priority: string;
  status: string; // Open | Responded | Resolved
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  clientReadStatus: ClientReadStatus;
  clientReadAt?: string | null;
  target: string;
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Mirrors PaginationResponseDto<T>
export interface SupportMessagePage {
  items: SupportMessageItem[];
  skewPage: number;
  skewPerPage: number;
  skewTotal: number;
  skewTotalPages?: number;
  skewSearch?: string | null;
  skewSortColumn?: string | null;
  skewSortDirection?: string | null;
}

const buildQueryString = (payload?: Record<string, unknown>): string => {
  const params = new URLSearchParams();
  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    params.append(key, String(value));
  });
  return params.toString();
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Map Each combination of SupportType + Action to Internal API route
const ROUTE_MAP: Record<SupportType, Record<SupportAction, string>> = {
  SupportSocial: {
    Store: "/api/auth/support/social",
    Update: "/api/auth/support/social",
    Delete: "/api/auth/support/social",
    AbsoluteFetch: "/api/auth/support/social",
    RelativeFetch: "/api/auth/support/social",
    CurrentFetch: "/api/auth/support/social",
    DistinctFetch: "/api/auth/support/social",
    DiscreteFetch: "/api/auth/support/social",
    NominalFetch: "/api/auth/support/social",
    LiveFetch: "/api/auth/support/social",
  },
  SupportPassword: {
    Store: "/api/auth/support/password",
    Update: "/api/auth/support/password",
    Delete: "/api/auth/support/password",
    AbsoluteFetch: "/api/auth/support/password",
    RelativeFetch: "/api/auth/support/password",
    CurrentFetch: "/api/auth/support/password",
    DistinctFetch: "/api/auth/support/password",
    DiscreteFetch: "/api/auth/support/password",
    NominalFetch: "/api/auth/support/password",
    LiveFetch: "/api/auth/support/password",
  },
  SupportMessage: {
    Store: "/api/auth/support/message",
    Update: "/api/auth/support/message",
    Delete: "/api/auth/support/message",
    AbsoluteFetch: "/api/auth/support/message",
    RelativeFetch: "/api/auth/support/message",
    CurrentFetch: "/api/auth/support/message",
    DistinctFetch: "/api/auth/support/message",
    DiscreteFetch: "/api/auth/support/message",
    NominalFetch: "/api/auth/support/message",
    LiveFetch: "/api/auth/support/message",
  },
  SupportEmail: {
    Store: "/api/auth/support/email",
    Update: "/api/auth/support/email",
    Delete: "/api/auth/support/email",
    AbsoluteFetch: "/api/auth/support/email",
    RelativeFetch: "/api/auth/support/email",
    CurrentFetch: "/api/auth/support/email",
    DistinctFetch: "/api/auth/support/email",
    DiscreteFetch: "/api/auth/support/email",
    NominalFetch: "/api/auth/support/email",
    LiveFetch: "/api/auth/support/email",
  },
  SupportPhone: {
    Store: "/api/auth/support/phone",
    Update: "/api/auth/support/phone",
    Delete: "/api/auth/support/phone",
    AbsoluteFetch: "/api/auth/support/phone",
    RelativeFetch: "/api/auth/support/phone",
    CurrentFetch: "/api/auth/support/phone",
    DistinctFetch: "/api/auth/support/phone",
    DiscreteFetch: "/api/auth/support/phone",
    NominalFetch: "/api/auth/support/phone",
    LiveFetch: "/api/auth/support/phone",
  },
  Support2fa: {
    Store: "/api/auth/support/2fa",
    Update: "/api/auth/support/2fa",
    Delete: "/api/auth/support/2fa",
    AbsoluteFetch: "/api/auth/support/2fa",
    RelativeFetch: "/api/auth/support/2fa",
    CurrentFetch: "/api/auth/support/2fa",
    DistinctFetch: "/api/auth/support/2fa",
    DiscreteFetch: "/api/auth/support/2fa",
    NominalFetch: "/api/auth/support/2fa",
    LiveFetch: "/api/auth/support/2fa",
  },
  SupportAccount: {
    Store: "/api/auth/support/account",
    Update: "/api/auth/support/account",
    Delete: "/api/auth/support/account",
    AbsoluteFetch: "/api/auth/support/account",
    RelativeFetch: "/api/auth/support/account",
    CurrentFetch: "/api/auth/support/account",
    DistinctFetch: "/api/auth/support/account",
    DiscreteFetch: "/api/auth/support/account",
    NominalFetch: "/api/auth/support/account",
    LiveFetch: "/api/auth/support/account",
  },
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Main service function
export const supportService = async <T = unknown, Payload = Record<string, unknown>>(
  supportType: SupportType,
  targetAction: SupportAction,
  payload?: Payload
): Promise<StrataResponse<T>> => {
  try {
    Object.entries(payload ?? {}).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        // console.log(k, "→ array", v.map(x => x?.constructor?.name));
      } else {
        console.log(k, "→", v?.constructor?.name);
      }
    });

    // Determine HTTP method
    const methodMap: Record<SupportAction, "POST" | "PUT" | "DELETE" | "GET"> = {
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
        ? `${ROUTE_MAP[supportType][targetAction]}?fetchtype=absolute`
        : targetAction === "CurrentFetch"
          ? `${ROUTE_MAP[supportType][targetAction]}?fetchtype=current`
          : targetAction === "RelativeFetch"
            ? `${ROUTE_MAP[supportType][targetAction]}?fetchtype=relative`
            : targetAction === "DistinctFetch"
              ? `${ROUTE_MAP[supportType][targetAction]}?fetchtype=distinct`
              : targetAction === "DiscreteFetch"
                ? `${ROUTE_MAP[supportType][targetAction]}?fetchtype=discrete`
                : targetAction === "NominalFetch"
                  ? `${ROUTE_MAP[supportType][targetAction]}?fetchtype=nominal`
                  : targetAction === "LiveFetch"
                    ? `${ROUTE_MAP[supportType][targetAction]}?fetchtype=live`
                    : ROUTE_MAP[supportType][targetAction];

    // Append payload as query params for GET (skips null / undefined / empty)
    const query =
      method === "GET" ? buildQueryString(payload as Record<string, unknown>) : "";
    const route = query
      ? `${baseRoute}${baseRoute.includes("?") ? "&" : "?"}${query}`
      : baseRoute;

    // Session headers
    const sessionHeaders = renderSystemSessionHeaders();

    // 🔥 FILE DETECTION
    const hasFiles = payload && Object.values(payload).some((v) => {
      if (v instanceof File) return true;
      if (Array.isArray(v)) {
        return v.some(item => item instanceof File);
      }
      return false;
    });

    console.log(`🔍 [supportService] Has files? ${hasFiles}`);
    console.log(`🔍 [supportService] Method: ${method}`);

    let body: BodyInit | undefined;
    const headers: HeadersInit = {
      ...sessionHeaders,
    };

    // MULTIPART (FILES) ONLY FOR FILES
    if (hasFiles && method !== "GET") {
      console.log("🔍 [supportService] Creating FormData for file upload");

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
      console.log("🔍 [supportService] FormData entries:");
      for (const [key, val] of formData.entries()) {
        if (val instanceof File) {
          console.log(`  ${key}: File(${val.name}, ${val.size} bytes, ${val.type})`);
        } else {
          console.log(`  ${key}: ${val}`);
        }
      }

      // JSON (NO FILES)
    } else if (method !== "GET") {
      console.log("🔍 [supportService] Creating JSON payload");
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload ?? {});
      console.log("🔍 [supportService] JSON body:", body);
    }

    // Send request via internal API
    const result = await apiFetch<StrataResponse<T>>(route, {
      method,
      headers,
      body,
      credentials: "include",
    });

    console.log(`🌿 [supportService] ${supportType} -> ${targetAction}:`, result);
    return result;
  } catch (err: unknown) {
    console.error(`❌ [supportService] ${supportType} -> ${targetAction} failed:`, err);
    return { error: err instanceof Error ? err.message : "Unknown support service error" };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Recovery flow (unauthenticated) — routes by context to SupportPassword or SupportSocial
const recoveryTypeForContext = (context: "password" | "social"): SupportType =>
  context === "social" ? "SupportSocial" : "SupportPassword";

export const requestRecoveryCode = (payload: {
  userGuidId?: string;
  email: string;
  context: "password" | "social";
}) => supportService(recoveryTypeForContext(payload.context), "Store", payload);

export const verifyRecoveryCode = (payload: {
  userGuidId?: string;
  email: string;
  code: string;
  context: "password" | "social";
}) => supportService(recoveryTypeForContext(payload.context), "Update", payload);

export const resetCredentials = (payload: {
  userGuidId?: string;
  email: string;
  code: string;
  context: "password" | "social";
  loginMethod: "password" | "pin" | "both";
  password?: string;
  passwordConfirmation?: string;
  pin?: string;
  pinConfirmation?: string;
}) => supportService(recoveryTypeForContext(payload.context), "Delete", payload);

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Support ticket submission
export const submitSupportIssue = (payload: {
  userGuidId?: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}) => supportService("SupportMessage", "Store", payload);

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Support message reads (authenticated via x-casto-line / x-casto-badge)
export const fetchRelativeSupportMessages = (params: {
  dynamicItems?: number;
  dynamicSearch?: string;
  dynamicClientStatus?: ClientReadStatus;
}) => supportService<SupportMessageItem[]>("SupportMessage", "RelativeFetch", params);

// Single or bulk — the user marks their own messages Read / Unread / Later / Starred
export const updateSupportMessageClientStatus = (guidIds: string[], status: ClientReadStatus) =>
  supportService("SupportMessage", "Update", { guidIds, status });

export const fetchDistinctSupportMessages = (params: {
  identifier: string; // parent message GuidId
  dynamicPage?: number;
  dynamicPerPage?: number;
  dynamicSearch?: string;
  dynamicSortColumn?: string | null;
  dynamicSortDirection?: "asc" | "desc";
}) => supportService<SupportMessagePage>("SupportMessage", "DistinctFetch", params);

export const fetchCurrentSupportMessage = (params: { identifier: string }) =>
  supportService<SupportMessageItem>("SupportMessage", "CurrentFetch", params);

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Authenticated password change (current password required) — lives on SupportAccount.Store
export const changeCurrentUserPassword = (payload: {
  userGuidId: string;
  currentPassword: string;
  newPassword: string;
}) => supportService("SupportAccount", "Store", { ...payload, credentialType: "password" });

// Authenticated PIN change (current PIN required if one is already set) — lives on SupportAccount.Store
export const changeCurrentUserPin = (payload: {
  userGuidId: string;
  currentPin?: string;
  newPin: string;
}) => supportService("SupportAccount", "Store", { ...payload, credentialType: "pin" });

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// 2FA lifecycle — Store=generate secret/QR, Update=confirm code, Delete=disable
export const start2faSetup = (userGuidId: string, email: string) =>
  supportService("Support2fa", "Store", { userGuidId, email, context: "2fa" });
export const confirm2faSetup = (userGuidId: string, code: string) =>
  supportService("Support2fa", "Update", { userGuidId, code, context: "2fa" });
export const disable2fa = (userGuidId: string) =>
  supportService("Support2fa", "Delete", { userGuidId, context: "2fa" });

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Authenticated profile update
export const updateCurrentUserProfile = (payload: {
  gender: string;
  ethnicity: string;
  race: string;
  religion: string;
  language: string;
  dateOfBirth: string;
  bio: string;
  website: string;
  about: string;
}) => supportService("SupportAccount", "Update", payload);

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Email verification (authenticated) — Store=send code, Update=confirm code
export const sendEmailVerificationCode = (userGuidId: string, email: string) =>
  supportService("SupportEmail", "Store", { userGuidId, email, context: "verification" });
export const confirmEmailVerificationCode = (userGuidId: string, email: string, code: string) =>
  supportService("SupportEmail", "Update", { userGuidId, email, code, context: "verification" });

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Phone verification (authenticated) — Store=send code to given number, Update=confirm code
export const sendPhoneVerificationCode = (userGuidId: string, email: string, phoneNumber: string) =>
  supportService("SupportPhone", "Store", { userGuidId, email, phoneNumber, context: "verification" });
export const confirmPhoneVerificationCode = (userGuidId: string, email: string, phoneNumber: string, code: string) =>
  supportService("SupportPhone", "Update", { userGuidId, email, phoneNumber, code, context: "verification" });

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────












// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────