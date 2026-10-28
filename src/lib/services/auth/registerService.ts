import { apiFetch } from "@/lib/api/api/api";
import { DEFAULT_USER_ROLE } from "@/lib/constants/roles";

// Types for registration credentials
export type RegisterCredentials = {
  username: string;
  name?: string;
  email: string;
  phone: string;
  password?: string;
  passwordConfirmation?: string;
  pin?: string;
  pin_confirmation?: string;
  loginMethod: "password" | "pin" | "both";
  agree: boolean;
  role?: string;
  dashboardName?: string;
  provider?: string;
  providerPayload?: string;
  challenge: string;
};

// Expected response type from register
export interface RegisterResponse {
  redirect_url?: string;
  error?: string;
}

// Register a new user
export const registerUser = async (data: RegisterCredentials): Promise<RegisterResponse> => {
  console.log("💡 [registerService] registerUser() called with data:", data);

  try {
    const result = await apiFetch<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
        pin: data.pin,
        pin_confirmation: data.pin_confirmation,
        loginMethod: data.loginMethod,
        agree: data.agree,
        challenge: data.challenge,
        role: data.role || DEFAULT_USER_ROLE,
        dashboardName: data.dashboardName || "web",
        provider: data.provider || "email",
        providerPayload: data.providerPayload || "Void",
      }),
    });

    console.log("💡 [registerService] Backend response:", result);
    return result;
  } catch (err: unknown) {
    console.error("❌ [registerService] registerUser() failed:", err);

    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.errors && typeof parsed.errors === "object") {
          const messages = Object.entries(parsed.errors)
            .flatMap(([field, msgs]) =>
              Array.isArray(msgs) ? (msgs as string[]).map((m) => `${field}: ${m}`) : [`${field}: ${msgs}`]
            )
            .join(" | ");
          return { error: messages };
        }
        if (parsed?.error) return { error: parsed.error };
        if (parsed?.message) return { error: parsed.message };
        if (parsed?.detail) return { error: parsed.detail };
        if (parsed?.title) return { error: parsed.title };
      } catch {
        // Not JSON
      }
      return { error: err.message };
    }

    return { error: "Unknown registration error" };
  }
};
