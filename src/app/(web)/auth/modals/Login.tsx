"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import {
  FaLinkedin,
  FaGithub,
  FaApple,
  FaMicrosoft,
  FaFacebookF,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { APP_NAME } from "@/lib/config/config";
import { login, LoginCredentials } from "@/lib/services/auth/loginService";
import { redirectToSocialProvider } from "@/lib/services/auth/socialService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const DEFAULT_LANDING_PATH = "/pages/entrance";
const role = "Learner";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  initialEmail?: string;
  initialMessage?: string;
  redirectPath?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  initialEmail,
  initialMessage,
  redirectPath,
}: LoginModalProps) {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "", pin: "", remember: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "pin">("password");

  const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]['provider']) => {
    redirectToSocialProvider({ provider, context: 'login', redirectPath: DEFAULT_LANDING_PATH }).catch((err) => {
      console.error(`Social redirect (${provider}) failed:`, err)
      setError('Could not start social sign-in. Please try again.')
    })
  }

  useEffect(() => {
    if (isOpen && initialEmail) {
      setForm((prev) => ({ ...prev, email: initialEmail }));
    }
    if (isOpen && initialMessage) {
      setSuccess(initialMessage);
    }
  }, [isOpen, initialEmail, initialMessage]);

  // check for a social login error cookie when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const match = document.cookie.match(/(?:^|; )socialError=([^;]*)/);
    if (match) {
      setError(decodeURIComponent(match[1]));
      document.cookie = 'socialError=; path=/; max-age=0';
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialEmail) {
      setForm((prev) => ({ ...prev, email: initialEmail }));
    }
    if (isOpen && initialMessage) {
      setSuccess(initialMessage);
    }
  }, [isOpen, initialEmail, initialMessage]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const credentials: LoginCredentials =
        loginMethod === "password"
          ? {
            email: form.email,
            password: form.password,
            pin: "",
            loginMethod: "password",
            LoginProvider: "email",
            loginProviderPayload: "Void",
            dashboardName: "web",
            role,
            challenge: "learner.login.skew8lancasto",
            remember: form.remember,
          }
          : {
            email: form.email,
            password: "",
            pin: form.pin,
            loginMethod: "pin",
            LoginProvider: "email",
            loginProviderPayload: "Void",
            dashboardName: "web",
            role,
            challenge: "learner.login.skew8lancasto",
            remember: form.remember,
          };

      const data = await login(credentials);

      if (data?.error) {
        setError(data.error);
        setSuccess("");
        return;
      }

      setSuccess("Login Successful ! Redirecting . . . ⚓");
      setError("");
      setTimeout(() => {
        onClose();
        window.location.href = redirectPath || DEFAULT_LANDING_PATH;
      }, 500);
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700
            bg-pink-200 text-black shadow-sm backdrop-blur-md transition-all duration-300 ease-out
            hover:scale-110 hover:border-red-500 hover:bg-black hover:text-red-600 hover:shadow-lg
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500
          "
        >
          <FiX className="h-7 w-7 stroke-[3.5]" />
        </button>

        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-blue-800">{APP_NAME}</h1>
            <FiCheckCircle className="text-green-500 text-lg" title="Verified" />
          </div>
          <p className="text-xs text-gray-600 mt-1">Log in to continue.</p>
        </div>

        <p className="text-center text-gray-500 text-xs font-semibold tracking-wide uppercase mb-3">
          Sign in with
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button type="button"
            onClick={() => handleSocialClick('google')}
            className="flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition">
            <FcGoogle className="text-xl" />
          </button>
          <button type="button"
            onClick={() => handleSocialClick('apple')}
            className="flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition text-gray-800">
            <FaApple className="text-xl" />
          </button>
          <button type="button"
            onClick={() => handleSocialClick('facebook')}
            className="flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition text-blue-700">
            <FaFacebookF className="text-xl" />
          </button>
          <button type="button"
            onClick={() => handleSocialClick('github')}
            className="flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition text-gray-800">
            <FaGithub className="text-xl" />
          </button>
          <button type="button"
            onClick={() => handleSocialClick('linkedin')}
            className="flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition text-blue-700">
            <FaLinkedin className="text-xl" />
          </button>
          <button type="button"
            onClick={() => handleSocialClick('microsoft')}
            className="flex items-center justify-center border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition text-blue-600">
            <FaMicrosoft className="text-xl" />
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 mb-4">or continue with email</div>

        {error && (
          <div className="mb-3 relative bg-yellow-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3">
            <span className="text-red-600 shrink-0">⚓</span>
            <span className="flex-1 leading-tight">{error}</span>
            <button type="button" onClick={() => setError("")} className="text-red-800 hover:text-red-700">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-3 relative bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3">
            <FiCheckCircle className="text-green-600 shrink-0" />
            <span className="flex-1 leading-tight">{success}</span>
            <button type="button" onClick={() => setSuccess("")} className="text-green-800 hover:text-green-700">✕</button>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-pink-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                maxLength={32}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="accent-blue-600" />
            Remember me
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in . . . ⚓" : "Submit and Login"}
          </button>

          <div className="flex flex-row gap-3 pt-2">
            <Link
              href="/auth/recovery/password"
              className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition"
              onClick={onClose}
            >
              Forgot Password?
            </Link>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition"
            >
              Register Instead?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
