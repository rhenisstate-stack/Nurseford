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
import { login, LoginCredentials } from '@/lib/services/auth/loginService' //  use your authService.ts which calls apiFetch to login - avoid direct axios calls to backend
import { useEffect } from 'react'
import Image from 'next/image'
import { session } from '@/lib/services/auth/sessionService'
import { useSearchParams } from 'next/navigation'
import { redirectToSocialProvider } from '@/lib/services/auth/socialService'

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

import { Suspense } from 'react'

const TARGET_PROGRAM = "nclex-rn";

// ── extract searchParams logic into a child ──
function LoginSearchParamsHandler({
  onRegistered,
  onSocialError,
}: {
  onRegistered: (email: string, message: string) => void;
  onSocialError: (message: string) => void;
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

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )socialError=([^;]*)/);
    if (match) {
      onSocialError(decodeURIComponent(match[1]));
      document.cookie = 'socialError=; path=/; max-age=0';
    }
  }, [onSocialError]);

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

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const loginMethod: "password" | "pin" = "password";

  const role = "Learner"; // hidden, fixed role
  const LANDING_PATH = `/dashboards/${TARGET_PROGRAM}`; // Landing page

  const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]['provider']) => {
    redirectToSocialProvider({ provider, context: 'login', redirectPath: LANDING_PATH }).catch((err) => {
      console.error(`Social redirect (${provider}) failed:`, err)
      setError('Could not start social sign-in. Please try again.')
    })
  }

  const handleRegisteredRedirect = useCallback((email: string, message: string) => {
    setForm(prev => ({ ...prev, email }));
    setSuccess(message);
  }, []);

  const handleSocialError = useCallback((message: string) => {
    setError(message);
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
          LoginProvider: "email",
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
          LoginProvider: "email",
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

      setSuccess("Login Successful ! Redirecting . . . ⚓")
      setError('')
      setTimeout(() => {
        window.location.assign(LANDING_PATH)
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
      className={`py-16 transition-all duration-300 ease-in-out overflow-x-hidden flex flex-col items-center justify-center relative  }`}
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >

      <Suspense fallback={null}>
        <LoginSearchParamsHandler onRegistered={handleRegisteredRedirect} onSocialError={handleSocialError} />
      </Suspense>

      {/* App Title / Branding */}
      <div className="flex flex-col items-center justify-center mb-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-500 drop-shadow-md">
            Welcome to
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-800 drop-shadow-md">
            {APP_NAME}
          </h1>
          <FiCheckCircle
            className="text-green-500 text-xl md:text-2xl drop-shadow-sm"
            title="Verified"
          />
        </div>

        <p className="text-xs text-gray-600 mt-1">
          Your trusted platform for streamlined access to all Nursing Resources .
        </p>
      </div>

      {/* Login Card Container */}
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">


        {/* LEFT SIDE: Full Image Background + Text at Bottom */}
        <div className="hidden md:flex relative w-full h-full items-end justify-center overflow-hidden">
          {/* Background Image */}
          <Image
            src="/web/auth/login/loginFoto.jpg"
            alt="Welcome"
            layout="fill"
            objectFit="cover"
            priority
            className="z-0"
          />

          {/* Top Social Login Buttons Overlay DESKTOP */}
          <div className="absolute top-0 left-0 z-10 w-full p-4">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 shadow-lg">
              <p className="text-center text-white text-xs font-semibold tracking-wide uppercase mb-3 drop-shadow-md">
                Sign in with
              </p>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white/90 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-white transition text-gray-700 font-semibold text-sm"
                onClick={() => handleSocialClick('google')}
              >
                <FcGoogle className="text-xl" />
                Continue with Google (Gmail)
              </button>
            </div>
          </div>

          {/* Bottom Text Overlay */}
          <div className="z-10 w-full p-8 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-center">
            {isAuthenticated ? (
              <>
                <h2 className="text-3xl font-extrabold drop-shadow-lg">Welcome Back !</h2>
                <p className="text-sm mt-2 drop-shadow-md">
                  You&apos;re already signed in. Ready to dive into {APP_NAME}?
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-extrabold drop-shadow-lg">Hello, there !</h2>
                <p className="text-sm mt-2 drop-shadow-md">
                  Sign in to continue exploring {APP_NAME}. Secure. Fast. Reliable.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="w-full px-3 md:px-4 pb-3 space-y-2 border-l border-gray-200">

          {/* Mobile-only Social Login Buttons (hidden on md+, shown inside photo panel instead) */}
          <div className="md:hidden">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white/90 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-white transition text-gray-700 font-semibold text-sm"
              onClick={() => handleSocialClick('google')}
            >
              <FcGoogle className="text-xl" />
              Continue with Google (Gmail)
            </button>
          </div>

          <div className="text-center text-md">
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
                onClick={() => window.location.assign('/dashboards')}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold transition"
              >
                🚀 Dive in &amp; Continue
              </button>
              <p className="text-md text-gray-600 mt-3">
                Your trusted platform for streamlined Nursing Resources  .
              </p>

            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
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

              {/* PASSWORD FIELD — always in DOM, hidden when not active */}
              <div className={`mb-4 relative ${loginMethod !== "password" ? "hidden" : ""}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Your Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required={loginMethod === "password"}
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
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in . . . ⚓' : 'Submit and Login'}
              </button>

              {/* Links */}
              <div className="mt-3 flex flex-row space-x-3 w-full">
                <Link
                  href={`/dashboards/${TARGET_PROGRAM}/auth/account/recovery/password`}
                  className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-1 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
                >
                  Forgot Password ?
                </Link>
                <Link
                  href={`/dashboards/${TARGET_PROGRAM}/auth/register`}
                  className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-1 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
                >
                  Register Instead ?
                </Link>
              </div>

            </form>
          )}
        </div>
      </div>

    </main>
  )
}
