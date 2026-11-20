"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { APP_NAME } from "@/lib/config/config";
import { login, LoginCredentials } from "@/lib/services/auth/loginService";
import { session } from "@/lib/services/auth/sessionService";
import { DEFAULT_USER_ROLE } from "@/lib/constants/roles";
import { redirectToSocialProvider } from "@/lib/services/auth/socialService";

interface DashboardAuthLoginViewProps {
  targetProgram: string;
  landingPath?: string;
  programTitle?: string;
}

// ── SearchParams Handler ──
function LoginSearchParamsHandler({
  onRegistered,
}: {
  onRegistered: (email: string, message: string) => void;
}) {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const registeredEmail = searchParams.get("email") ?? "";

  useEffect(() => {
    if (justRegistered && registeredEmail) {
      onRegistered(
        decodeURIComponent(registeredEmail),
        `Account created successfully! You can now log in with ${decodeURIComponent(registeredEmail)}`
      );
    }
  }, [justRegistered, registeredEmail, onRegistered]);

  return null;
}

export default function DashboardAuthLoginView({
  targetProgram,
  landingPath,
  programTitle,
}: DashboardAuthLoginViewProps) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    pin: "",
    phone: "",
    remember: false,
  });

  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"email" | "google" | null>("email");
  const [loginMethod, setLoginMethod] = useState<"password" | "pin" | "both">("password");

  const role = DEFAULT_USER_ROLE;
  const resolvedLandingPath = landingPath || `/dashboards/${targetProgram}`;

  const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]["provider"]) => {
    redirectToSocialProvider({ provider, context: "login", redirectPath: "/pages/entrance" }).catch((err) => {
      console.error(`Social redirect (${provider}) failed:`, err);
      setError("Could not start social sign-in. Please try again.");
    });
  };

  const handleRegisteredRedirect = useCallback((email: string, message: string) => {
    setForm((prev) => ({ ...prev, email }));
    setSuccess(message);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await session.check();
        setIsAuthenticated(!!data.logged_in);
      } catch (err) {
        console.error("Session check failed:", err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let credentials: LoginCredentials;

      if (loginMethod === "password") {
        credentials = {
          email: form.email,
          password: form.password,
          pin: "",
          loginMethod: "password",
          LoginProvider: selectedProvider || "email",
          loginProviderPayload: "Void",
          dashboardName: "web",
          role: role,
          challenge: "learner.login.skew8lancasto",
          remember: form.remember,
        };
      } else {
        credentials = {
          email: form.email,
          password: "",
          pin: form.pin!,
          loginMethod: "pin",
          LoginProvider: selectedProvider || "email",
          loginProviderPayload: "Void",
          dashboardName: "web",
          role: role,
          challenge: "learner.login.skew8lancasto",
          remember: form.remember,
        };
      }

      const data = await login(credentials);

      if (data?.error) {
        console.warn("Login error:", data.error, data);
        setError(data.error);
        setSuccess("");
        return;
      }

      if (!data.casto_line || !data.casto_badge) {
        setError(
          "Login was accepted, but the backend returned no session token. Please verify your credentials or contact support."
        );
        setSuccess("");
        setIsLoading(false);
        return;
      }

      setSuccess("Login Successful! Redirecting to your dashboard...");
      setError("");
      setTimeout(() => {
        window.location.href = resolvedLandingPath;
      }, 700);
      return;
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="pt-16 sm:pt-20 pb-12 transition-all duration-300 ease-in-out overflow-x-hidden flex flex-col items-center justify-center relative px-4"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <Suspense fallback={null}>
        <LoginSearchParamsHandler onRegistered={handleRegisteredRedirect} />
      </Suspense>

      {/* Decorative ambient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[375px] space-y-3">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs mb-0.5">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to {APP_NAME}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sign in to access your nursing prep materials &amp; progress
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-4 sm:p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/40 backdrop-blur-xl space-y-3">
          {/* Social Sign In */}
          <div>
            <button
              type="button"
              onClick={() => handleSocialClick("google")}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition cursor-pointer"
            >
              <FcGoogle className="w-4 h-4 shrink-0" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2.5">
            <span className="flex-1 h-px bg-slate-200/80 dark:bg-slate-800" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              or continue with email
            </span>
            <span className="flex-1 h-px bg-slate-200/80 dark:bg-slate-800" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/90 dark:bg-rose-950/40 p-2.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 shadow-2xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug text-[11px]">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 font-bold ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/90 dark:bg-teal-950/40 p-2.5 text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug text-[11px]">{success}</div>
              <button
                type="button"
                onClick={() => setSuccess("")}
                className="text-teal-500 hover:text-teal-700 dark:hover:text-teal-300 font-bold ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Authenticated State */}
          {isAuthenticated ? (
            <div className="text-center py-2 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/50 text-xs text-teal-800 dark:text-teal-300">
                You are currently signed in.
              </div>
              <button
                onClick={() => router.push(resolvedLandingPath)}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-2.5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:focus:border-teal-400 transition shadow-2xs"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    maxLength={32}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:focus:border-teal-400 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 accent-teal-600 focus:ring-teal-500/20 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  href="/auth/recovery/password"
                  className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Footer Switcher */}
              <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/dashboards/${targetProgram}/auth/register`}
                  className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Create one now
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
