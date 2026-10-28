// src/lib/services/auth/recoveryService.ts
import {
  requestRecoveryCode as supportRequestRecoveryCode,
  verifyRecoveryCode as supportVerifyRecoveryCode,
  resetCredentials as supportResetCredentials,
  submitSupportIssue as supportSubmitSupportIssue,
} from "./supportService";

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────

export type RecoveryContext = "password" | "social";

export type RecoveryStep = "request" | "verify" | "reset";

export interface RecoveryResponse {
  redirect_url?: string;
  error?: string;
  message?: string;
}

export interface SupportResponse {
  error?: string;
  message?: string;
}

export type IssueCategory =
  | "login_issue"
  | "account_recovery"
  | "payment_billing"
  | "exam_technical"
  | "other";

// ───────────────────────────────────────────────────────────────
// STEP 1 — REQUEST CODE
// ───────────────────────────────────────────────────────────────

export const requestRecoveryCode = async (payload: {
  userGuidId?: string;
  email: string;
  context: RecoveryContext;
}): Promise<RecoveryResponse> => {
  console.log("💡 [recoveryService] requestRecoveryCode() delegating to supportService:", payload);
  return supportRequestRecoveryCode(payload);
};

// ───────────────────────────────────────────────────────────────
// STEP 2 — VERIFY CODE
// ───────────────────────────────────────────────────────────────

export const verifyRecoveryCode = async (payload: {
  userGuidId?: string;
  email: string;
  code: string;
  context: RecoveryContext;
}): Promise<RecoveryResponse> => {
  console.log("💡 [recoveryService] verifyRecoveryCode() delegating to supportService:", payload);
  return supportVerifyRecoveryCode(payload);
};

// ───────────────────────────────────────────────────────────────
// STEP 3 — RESET / CREATE CREDENTIALS
// ───────────────────────────────────────────────────────────────

export const resetCredentials = async (payload: {
  userGuidId?: string;
  email: string;
  code: string;
  context: RecoveryContext;
  loginMethod: "password" | "pin" | "both";
  password?: string;
  passwordConfirmation?: string;
  pin?: string;
  pinConfirmation?: string;
}): Promise<RecoveryResponse> => {
  console.log("💡 [recoveryService] resetCredentials() delegating to supportService:", {
    ...payload,
    password: payload.password ? "•••" : undefined,
    passwordConfirmation: payload.passwordConfirmation ? "•••" : undefined,
    pin: payload.pin ? "•••" : undefined,
    pinConfirmation: payload.pinConfirmation ? "•••" : undefined,
  });
  return supportResetCredentials(payload);
};

// ───────────────────────────────────────────────────────────────
// SUPPORT ISSUE SUBMISSION
// ───────────────────────────────────────────────────────────────

export const submitSupportIssue = async (payload: {
  userGuidId?: string;
  email: string;
  phone: string;
  category: IssueCategory | string;
  message: string;
}): Promise<SupportResponse> => {
  console.log("💡 [recoveryService] submitSupportIssue() delegating to supportService:", payload);
  return supportSubmitSupportIssue(payload);
};

// ───────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C - The Winds Chase US ⚓
// ───────────────────────────────────────────────────────────────