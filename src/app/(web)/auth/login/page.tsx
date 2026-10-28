// SkewLine\castoline\src\app\web\(auth)\login\page.tsx
'use client'

import { useState, useCallback } from 'react'
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
import { EXAM_OPTIONS, examDashboardHref } from '@/lib/constants/dashboards/examOptions'
import { getStoredSelectedExam, setStoredSelectedExam } from '@/lib/constants/dashboards/examSelectionStorage'

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

import { Suspense } from 'react'

// ── extract searchParams logic into a child ──
function LoginSearchParamsHandler({
  onRegistered,
  onDashboard,
}: {
  onRegistered: (email: string, message: string) => void;
  onDashboard: (slug: string) => void;
}) {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';
  const registeredEmail = searchParams.get('email') ?? '';
  const dashboard = searchParams.get('dashboard') ?? '';

  useEffect(() => {
    if (justRegistered && registeredEmail) {
      onRegistered(
        decodeURIComponent(registeredEmail),
        `Account created successfully ⚓ You can now log in as ${decodeURIComponent(registeredEmail)}`
      );
    }
    if (dashboard) {
      onDashboard(dashboard);
    }
  }, [justRegistered, registeredEmail, dashboard, onRegistered, onDashboard]);

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

  const [selectedExam, setSelectedExam] = useState<string>(() => {
    const stored = getStoredSelectedExam()
    return EXAM_OPTIONS.some((opt) => opt.value === stored) ? stored : ""
  })

  const handleRegisteredRedirect = useCallback((email: string, message: string) => {
    setForm(prev => ({ ...prev, email }));
    setSuccess(message);
  }, []);

  const handleDashboardRedirect = useCallback((slug: string) => {
    setSelectedExam(slug);
    setStoredSelectedExam(slug);
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

    if (!selectedExam) {
      setError('Please select an exam/dashboard to continue ⚓')
      setIsLoading(false)
      return
    }

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
          "Login was accepted, but the backend returned no session token, so the session cookie was never written — you remain a Guest (no \"Sign In · <name>\" / no \"Dive In\"). This is a backend response mismatch, see browser console for the received keys."
        )
        setSuccess('')
        setIsLoading(false)
        return
      }

      setSuccess("Login Successful ! Redirecting . . . ⚓")
      setError('')
      setTimeout(() => {
        window.location.href = examDashboardHref(selectedExam)
      }, 500)
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
    <div className="flex flex-col items-center justify-center px-4 pt-20 sm:pt-24 pb-8 sm:pb-12 min-h-[calc(100vh-80px)]" style={{ backgroundColor: "var(--content-bg)" }}>

      <Suspense fallback={null}>
        <LoginSearchParamsHandler
          onRegistered={handleRegisteredRedirect}
          onDashboard={handleDashboardRedirect}
        />
      </Suspense>

      {/* App Title / Branding */}
      <div className="flex flex-col items-center justify-center mb-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-xl sm:text-2xl font-extrabold text-navy/60 drop-shadow-md">
            Welcome to
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-coral drop-shadow-md">
            {APP_NAME}
          </h1>
          <FiCheckCircle
            className="text-teal text-lg sm:text-xl drop-shadow-sm"
            title="Verified"
          />
        </div>

        <p className="text-[11px] text-navy/50 mt-1">
          Your trusted platform for streamlined access to all Nursing Resources .
        </p>
      </div>

      {/* Login Card Container */}
      <div className="max-w-md w-full bg-paper border border-black/50 dark:border-border rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">

        {/* Social Login Buttons */}
        <div>
          <p className="text-center text-navy/60 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            Sign in with
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-gray-300 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition text-gray-800 w-full font-medium shadow-xs text-xs sm:text-sm"
              onClick={() => handleSocialClick('google')}
            >
              <FcGoogle className="text-lg" />
              <span className="text-xs sm:text-sm font-semibold">Google</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 my-0.5">
          <span className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-navy/50">
            or continue with email
          </span>
          <span className="flex-1 h-px bg-border" />
        </div>

          {/* Error Message */}
          {error && (
            <div className="flex justify-center mt-4">
              <div className="relative max-w-md w-full bg-coral/10 border border-coral/30 text-coral px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3">

                <span className="text-coral text-base shrink-0">⚓</span>

                <span className="flex-1 leading-tight">
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="absolute top-2 right-2 text-coral hover:text-coral-hover"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex justify-center mt-4">
              <div className="relative max-w-md w-full bg-teal/10 border border-teal/30 text-teal px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3">

                <FiCheckCircle className="text-teal text-base shrink-0" />

                <span className="flex-1 leading-tight">
                  {success}
                </span>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="absolute top-2 right-2 text-teal hover:text-teal"
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
                onClick={() => router.push(examDashboardHref(selectedExam))}
                className="w-full bg-coral text-[#0c1929] py-2 rounded-lg hover:bg-coral-hover font-semibold transition"
              >
                🚀 Dive in &amp; Continue
              </button>
              <p className="text-md text-navy/60 mt-3">
                Your trusted platform for streamlined Nursing Resources  .
              </p>

            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-navy/70 mb-0.5">Email</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-paper-dim border border-border rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-coral"
                />
              </div>
              {/* PASSWORD FIELD */}
              <div className="mb-2 relative">
                <label className="block text-xs font-medium text-navy/70 mb-0.5">
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
                    className="w-full bg-paper-dim border border-border rounded-lg px-2.5 py-1.5 pr-9 text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2 right-2.5 text-navy/40 hover:text-navy text-sm"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-navy/60 cursor-pointer">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="accent-coral h-3.5 w-3.5"
                  />
                  Remember me
                </label>
              </div>

              {/* 🎯 Required Exam / Dashboard Selection */}
              <div>
                <label className="block text-xs font-medium text-navy/70 mb-0.5">
                  Select Your Exam / Dashboard <span className="text-coral">*</span>
                </label>
                <select
                  name="selectedExam"
                  value={selectedExam}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedExam(value)
                    setStoredSelectedExam(value)
                  }}
                  className="w-full bg-paper-dim border border-border rounded-lg px-2.5 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-coral"
                >
                  <option value="" disabled>
                    — Choose where to go after login —
                  </option>
                  {EXAM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {!selectedExam && (
                  <p className="mt-0.5 text-[10px] text-coral/80">
                    A dashboard must be selected before you can submit.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coral text-[#0c1929] py-1.5 rounded-lg hover:bg-coral-hover text-xs sm:text-sm font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in . . . ⚓' : 'Submit and Login'}
              </button>

              {/* Links */}
              <div className="mt-2 flex flex-row space-x-2 w-full">
                <Link
                  href="/auth/recovery/password"
                  className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-1.5 px-2 rounded-lg hover:bg-paper-dim transition-colors duration-300 text-xs"
                >
                  Forgot Password ?
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-1.5 px-2 rounded-lg hover:bg-paper-dim transition-colors duration-300 text-xs"
                >
                  Register Instead ?
                </Link>
              </div>

            </form>
          )}
        </div>

    </div>
  )
}
