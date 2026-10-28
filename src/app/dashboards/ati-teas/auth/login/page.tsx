// SkewLine\castoline\src\app\web\(auth)\login\page.tsx
'use client'

import { useState, useCallback } from 'react'
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import Link from 'next/link'
import 'react-phone-number-input/style.css'
import { FcGoogle } from 'react-icons/fc'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { FiCheckCircle } from 'react-icons/fi'
import { APP_NAME } from '@/lib/config/config'
import { useRouter } from 'next/navigation' // Use useRouter for navigation
import { login, LoginCredentials } from '@/lib/services/auth/loginService' //  use your authService.ts which calls apiFetch to login - avoid direct axios calls to backend
import { useEffect } from 'react'
import { session } from '@/lib/services/auth/sessionService'
import { DEFAULT_USER_ROLE } from '@/lib/constants/roles'
import { useSearchParams } from 'next/navigation'
import { redirectToSocialProvider } from '@/lib/services/auth/socialService'

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

import { Suspense } from 'react'

const TARGET_PROGRAM = "ati-teas";

// ── extract searchParams logic into a child ──
function LoginSearchParamsHandler({
  onRegistered,
}: {
  onRegistered: (email: string, message: string) => void;
}) {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';
  const registeredEmail = searchParams.get('email') ?? '';

  useEffect(() => {
    if (justRegistered && registeredEmail) {
      onRegistered(
        decodeURIComponent(registeredEmail),
        `Account created successfully ⚓ You can now log in as ${decodeURIComponent(registeredEmail)}`
      );
    }
  }, [justRegistered, registeredEmail, onRegistered]);

  return null;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Main Login Page User Inputs and Logic
export default function WebLoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    pin: '',
    phone: '',
    remember: false,
  })

  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const router = useRouter() // Initialize router for redirection
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'email' | 'google' | null>('email')

  const [loginMethod, setLoginMethod] = useState<"password" | "pin" | "both">("password");

  const [showPin, setShowPin] = useState(false);
  const role = DEFAULT_USER_ROLE; // hidden, fixed role

  const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]['provider']) => {
    redirectToSocialProvider({ provider, context: 'login', redirectPath: '/pages/entrance' }).catch((err) => {
      console.error(`Social redirect (${provider}) failed:`, err)
      setError('Could not start social sign-in. Please try again.')
    })
  }
  const LANDING_PATH = `/dashboards/${TARGET_PROGRAM}`; // Landing page

  const handleRegisteredRedirect = useCallback((email: string, message: string) => {
    setForm(prev => ({ ...prev, email }));
    setSuccess(message);
  }, []);

  // Check if user is already authenticated for him to avoid login again
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Check if the User in Logged In
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await session.check()

        // 🔹 Debug log only
        console.log("➡️ Login status check :", {
          logged_in: data.logged_in,
          // user_id: data.user_id,
          // user_email: data.user_email,
          redirect_url: data.redirect_url,
        })

        //  Only update state
        setIsAuthenticated(!!data.logged_in)
      } catch (err) {
        console.error("Session check failed:", err)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, []) // ❗ no router dependency

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Handle login submission using authService.ts
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Build credentials object based on selected login method
      let credentials: LoginCredentials;

      if (loginMethod === "password") {
        credentials = {
          email: form.email,
          password: form.password,
          pin: "",              // not used for password login
          loginMethod: "password",
          LoginProvider: selectedProvider || "email",
          loginProviderPayload: "Void",
          dashboardName: "web", // hardcoded
          role: role,           // Predefined
          challenge: "learner.login.skew8lancasto",
          remember: form.remember,
        }
      } else {
        credentials = {
          email: form.email,
          password: "",         // not used for pin login
          pin: form.pin!,
          loginMethod: "pin",
          LoginProvider: selectedProvider || "email",
          loginProviderPayload: "Void",
          dashboardName: "web", // hardcoded
          role: role,           // from dropdown
          challenge: "learner.login.skew8lancasto",
          remember: form.remember,
        }
      }

      // Call authService login function 
      const data = await login(credentials); // LoginResponse object already

      if (data?.error) {
        console.warn("⚠️ Login error (400 body):", data.error, data);
        setError(data.error)
        setSuccess('')
        return
      }

      if (!data.casto_line || !data.casto_badge) {
        setError(
          "Login was accepted, but the backend returned no session token, so the session cookie was never written — you remain a Guest (greeting stays \", Guest\" and Login / Register stay visible). See browser console for the received response keys."
        )
        setSuccess('')
        setIsLoading(false)
        return
      }

      setSuccess("Login Successful ! Redirecting . . . ⚓")
      setError('')
      setTimeout(() => {
        window.location.href = LANDING_PATH
      }, 800)
      return

    } catch (err: unknown) {
      console.error("Login failed:", err)
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Render the login form
  return (
    <main
      className={`pt-20 sm:pt-24 pb-8 sm:pb-12 transition-all duration-300 ease-in-out overflow-x-hidden flex flex-col items-center justify-center relative`}
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

      {/* App Title / Branding */}
      <div className="flex flex-col items-center justify-center mb-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl sm:text-2xl font-extrabold text-gray-500 drop-shadow-md">
            Welcome to
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-blue-800 drop-shadow-md">
            {APP_NAME}
          </h1>
          <FiCheckCircle className="text-green-500 text-lg sm:text-xl drop-shadow-sm"
            title="Verified"
          />
        </div>

        <p className="text-[11px] text-gray-600 mt-1">
          Your trusted platform for streamlined access to all Nursing Resources .
        </p>
      </div>

      {/* Login Card Container */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-5 space-y-3 bg-gradient-to-b from-green-10 to-yellow-100">

        {/* Social Login Buttons */}
        <div>
          <p className="text-center text-gray-500 text-xs font-semibold tracking-wide uppercase mb-1.5">
            Sign in with
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-gray-300 py-1.5 px-3 rounded-xl hover:bg-gray-50 transition text-gray-800 w-full font-medium shadow-xs text-xs sm:text-sm"
              onClick={() => handleSocialClick('google')}
            >
              <FcGoogle className="text-lg" />
              <span className="text-xs sm:text-sm font-semibold">Google</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs">
          <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-800 via-gray-300 to-green-600 bg-[length:200%_100%] [animation:shimmer_3s_linear_infinite]">
            or continue with email
          </span>
        </div>

        <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>

        {/* Error Message */}
        {error && (
          <div className="flex justify-center mt-4">
            <div className="relative max-w-md w-full bg-yellow-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3">

              <span className="text-red-600 text-base shrink-0">⚓</span>

              <span className="flex-1 leading-tight">
                {error}
              </span>

              <button
                type="button"
                onClick={() => setError("")}
                className="absolute top-2 right-2 text-red-800 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex justify-center mt-4">
            <div className="relative max-w-md w-full bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3">

              <FiCheckCircle className="text-green-600 text-base shrink-0" />

              <span className="flex-1 leading-tight">
                {success}
              </span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="absolute top-2 right-2 text-green-800 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* If authenticated, show dashboard button */}
        {isAuthenticated ? (
          <div className="text-center">
            <button
              onClick={() => router.push('/dashboards')}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold transition"
            >
              🚀 Dive in &amp; Continue
            </button>
            <p className="text-md text-gray-600 mt-3">
              Your trusted platform for streamlined Nursing Resources  .
            </p>

          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-2.5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-pink-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* PASSWORD FIELD */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Your Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  maxLength={32}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 pr-10 text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 font-semibold transition text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in . . . ⚓' : 'Submit and Login'}
            </button>

            {/* Links */}
            <div className="mt-3 flex flex-row space-x-3 w-full">
              <Link
                href="/auth/recovery/password"
                className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-1.5 px-3 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
              >
                Forgot Password ?
              </Link>
              <Link
                href={`/dashboards/${TARGET_PROGRAM}/auth/register`}
                className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-1.5 px-3 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
              >
                Register Instead ?
              </Link>
            </div>

          </form>
        )}
      </div>

    </main>
  )
}
