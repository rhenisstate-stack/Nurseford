"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { APP_NAME } from "@/lib/config/config";
import { login, LoginCredentials } from "@/lib/services/auth/loginService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const DEFAULT_LANDING_PATH = "/pages/entrance";
const role = "Learner";

const CHALLENGE_STANDARD = "learner.login.skew8lancasto";
const CHALLENGE_CUSTOM = "custom.login.skew8lancasto";

type AnnexCredentials = LoginCredentials & { targetEmail?: string };

interface AnnexProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

export default function Annex({ isOpen, onClose, redirectPath }: AnnexProps) {
  const [form, setForm] = useState({ targetEmail: "", email: "", password: "" });
  const [targetMode, setTargetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTargetMode = () => {
    setTargetMode((prev) => !prev);
    setForm((prev) => ({ ...prev, targetEmail: "" }));
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const credentials: AnnexCredentials = {
        email: form.email.trim(),
        password: form.password,
        pin: "",
        loginMethod: "password",
        LoginProvider: "email",
        loginProviderPayload: "Void",
        dashboardName: "web",
        role,
        challenge: targetMode ? CHALLENGE_CUSTOM : CHALLENGE_STANDARD,
        remember: false,
        ...(targetMode ? { targetEmail: form.targetEmail.trim() } : {}),
      };

      const data = await login(credentials);

      if (data?.error) {
        setError(data.error);
        return;
      }

      setSuccess("Login Successful ! Redirecting . . . ⚓");
      setTimeout(() => {
        onClose();
        window.location.assign(redirectPath || DEFAULT_LANDING_PATH);
      }, 800);
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-2 md:px-3 py-2 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-2 md:p-4"
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
          <p className="text-xs text-gray-600">Log in to Continue . . . </p>
        </div>

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

        <form onSubmit={handleLogin} className="space-y-4 p-1">
          {targetMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Target Email</label>
              <input
                type="email"
                name="targetEmail"
                autoComplete="off"
                required
                value={form.targetEmail}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-pink-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter your Email</label>
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in . . . ⚓" : "Submit and Login"}
          </button>

          {/* Camouflaged toggle — looks like a tiny "remember" switch */}
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              role="switch"
              aria-checked={targetMode}
              aria-label="Option"
              onClick={toggleTargetMode}
              className="group flex items-center justify-center opacity-90 transition-opacity hover:opacity-100 focus:opacity-100"
            >
              <span
                className={`relative inline-flex h-3 w-10 items-center rounded-full transition-colors duration-200 ${targetMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full bg-green-100 shadow transition-transform duration-200 ${targetMode ? "translate-x-8" : "translate-x-1"
                    }`}
                />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────