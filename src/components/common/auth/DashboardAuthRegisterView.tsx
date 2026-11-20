"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import "react-phone-number-input/style.css";
import { useRouter } from "next/navigation";
import { CountryCode } from "libphonenumber-js";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { APP_NAME } from "@/lib/config/config";
import { registerUser } from "@/lib/services/auth/registerService";
import { session } from "@/lib/services/auth/sessionService";
import { DEFAULT_USER_ROLE } from "@/lib/constants/roles";
import { setUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";
import { redirectToSocialProvider } from "@/lib/services/auth/socialService";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";

interface DashboardAuthRegisterViewProps {
  targetProgram: string;
  loginPath?: string;
  programTitle?: string;
}

export default function DashboardAuthRegisterView({
  targetProgram,
  loginPath,
  programTitle,
}: DashboardAuthRegisterViewProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    pin_confirmation: "",
    pin: "",
    loginMethod: "password" as "password" | "pin" | "both",
    agree: false,
  });

  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const router = useRouter();

  const resolvedLoginPath = loginPath || `/dashboards/${targetProgram}/auth/login`;
  const role = DEFAULT_USER_ROLE;

  const showPinFields = form.loginMethod === "pin" || form.loginMethod === "both";
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Parameters<typeof redirectToSocialProvider>[0]["provider"] | "email" | null>(null);

  const [userCountry, setUserCountry] = useState<CountryCode | undefined>("US");

  useEffect(() => {
    const browserLocale = navigator.language || "en-US";
    const countryCode = browserLocale.split("-")[1]?.toUpperCase() as CountryCode;
    setUserCountry(countryCode);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handlePhoneChange = (value: string | undefined) => {
    const phone = value || "";
    if (!phoneTouched) {
      setPhoneTouched(true);
    }
    setForm((prev) => ({ ...prev, phone }));
    setPhoneValid(isValidPhoneNumber(phone));
  };

  const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]["provider"]) => {
    setSelectedProvider(provider);
    redirectToSocialProvider({ provider, context: "register", redirectPath: "/pages/entrance" }).catch((err) => {
      console.error(`Social redirect (${provider}) failed:`, err);
      setError("Could not start social registration. Please try again.");
    });
  };

  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const specials = "!@#$%^&*()-_=+[]{};:,.<>?";
    const allChars = upper + lower + digits + specials;

    let pwd = "";
    pwd += upper.charAt(Math.floor(Math.random() * upper.length));
    pwd += lower.charAt(Math.floor(Math.random() * lower.length));
    pwd += digits.charAt(Math.floor(Math.random() * digits.length));
    pwd += specials.charAt(Math.floor(Math.random() * specials.length));

    for (let i = 0; i < 12; i++) {
      pwd += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    const shuffled = pwd
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setForm((prev) => ({
      ...prev,
      password: shuffled,
      confirmPassword: shuffled,
    }));
  };

  const generatePin = (length = 16) => {
    const digits = "0123456789";
    let pin = "";
    for (let i = 0; i < length; i++) {
      pin += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    setForm((prev) => ({
      ...prev,
      pin,
      pin_confirmation: pin,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.agree) {
      setError("You must agree to the Terms and Conditions to continue.");
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.loginMethod !== "pin") {
      if (!form.password) {
        setError("Please enter a password.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
    }

    if (form.loginMethod !== "password") {
      if (!form.pin || form.pin.length < 4) {
        setError("PIN must be at least 4 digits.");
        return;
      }
      if (form.pin !== form.pin_confirmation) {
        setError("PINs do not match!");
        return;
      }
    }

    if (!phoneValid) {
      setError("Please enter a valid phone number with country code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await registerUser({
        username: form.name,
        name: form.name,
        email: cleanEmail,
        phone: form.phone,
        password: form.loginMethod !== "pin" ? form.password : undefined,
        passwordConfirmation: form.loginMethod !== "pin" ? form.confirmPassword : undefined,
        pin: form.loginMethod !== "password" ? form.pin : undefined,
        pin_confirmation: form.loginMethod !== "password" ? form.pin_confirmation : undefined,
        loginMethod: form.loginMethod,
        agree: form.agree,
        role: role,
        dashboardName: targetProgram,
        provider: selectedProvider || "email",
        providerPayload: selectedProvider && selectedProvider !== "email" ? "OAuth" : "Void",
        challenge: "register-skew8@lancasto",
      });

      if (response.error) {
        setError(response.error);
      } else {
        const formAny = form as { name?: string; username?: string };
        const preUsername = (formAny.name || formAny.username || cleanEmail.split("@")[0]).trim();
        if (preUsername) {
          setUsernameCookie(preUsername);
        }
        window.location.href = `${resolvedLoginPath}?registered=true&email=${encodeURIComponent(cleanEmail)}`;
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Unexpected registration error");
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
      {/* Ambient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[385px] space-y-3">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs mb-0.5">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Join {APP_NAME} to prepare with high-yield nursing exams &amp; questions
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-4 sm:p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/40 backdrop-blur-xl space-y-3">
          {/* Social Sign Up */}
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
              or register with email
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

          {isAuthenticated ? (
            <div className="text-center py-2 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/50 text-xs text-teal-800 dark:text-teal-300">
                You already have an active session.
              </div>
              <button
                onClick={() => router.push(`/dashboards/${targetProgram}`)}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-2.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:focus:border-teal-400 transition shadow-2xs"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:focus:border-teal-400 transition shadow-2xs"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                  {form.phone && form.phone.length > 6 && !phoneValid && (
                    <span className="text-rose-500 text-[10px] font-normal ml-1">(Invalid)</span>
                  )}
                </label>
                <div className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 bg-slate-50/60 dark:bg-slate-800/50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 dark:focus-within:border-teal-400 transition shadow-2xs">
                  <PhoneInput
                    international
                    defaultCountry={userCountry}
                    value={form.phone}
                    onChange={handlePhoneChange}
                    name="phone"
                    className="w-full text-xs"
                  />
                </div>
              </div>

              {/* Password Fields */}
              {(form.loginMethod === "password" || form.loginMethod === "both") && (
                <div className="space-y-2.5">
                  {/* Enter Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Create Password
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Auto-Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required={form.loginMethod === "password" || form.loginMethod === "both"}
                        value={form.password}
                        maxLength={32}
                        onChange={handleChange}
                        placeholder="••••••••"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        required={form.loginMethod === "password" || form.loginMethod === "both"}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        maxLength={32}
                        placeholder="••••••••"
                        className={`w-full border ${
                          form.password && form.confirmPassword && form.password !== form.confirmPassword
                            ? "border-rose-400 focus:border-rose-500"
                            : "border-slate-200 dark:border-slate-700"
                        } rounded-xl px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:focus:border-teal-400 transition shadow-2xs`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 -translate-y-1/2 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="mt-1 text-[10px] text-rose-500">Passwords do not match</p>
                    )}
                  </div>
                </div>
              )}

              {/* PIN fields if allowed */}
              {(form.loginMethod === "pin" || form.loginMethod === "both") && (
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        PIN (4–24 digits)
                      </label>
                      <button
                        type="button"
                        onClick={() => generatePin(16)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Auto-Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPin ? "text" : "password"}
                        name="pin"
                        maxLength={24}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        required={showPinFields}
                        value={form.pin || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 24) {
                            setForm((prev) => ({ ...prev, pin: value }));
                          }
                        }}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute top-1/2 -translate-y-1/2 right-2.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPin ? "text" : "password"}
                        name="pin_confirmation"
                        maxLength={24}
                        inputMode="numeric"
                        required={showPinFields}
                        value={form.pin_confirmation || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            pin_confirmation: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute top-1/2 -translate-y-1/2 right-2.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {form.pin && form.pin_confirmation && form.pin !== form.pin_confirmation && (
                      <p className="mt-1 text-[10px] text-rose-500">PINs do not match</p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-0.5">
                <input
                  type="checkbox"
                  name="agree"
                  id="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-teal-600 accent-teal-600 focus:ring-teal-500/20 cursor-pointer shrink-0"
                />
                <label htmlFor="agree" className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug cursor-pointer select-none">
                  I agree to the{" "}
                  <Link href="/pages/terms" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                    Terms &amp; Conditions
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              {/* Footer Links */}
              <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                Already registered?{" "}
                <Link
                  href={resolvedLoginPath}
                  className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
