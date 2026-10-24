'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { FiCheckCircle } from 'react-icons/fi'
import 'react-phone-number-input/style.css'
import { useRouter } from 'next/navigation'
import { CountryCode } from 'libphonenumber-js'
import PhoneInput from "react-phone-number-input"
import { isValidPhoneNumber } from 'react-phone-number-input'
import { APP_NAME } from '@/lib/config/config';
import { registerUser } from '@/lib/services/auth/registerService'
import { session } from '@/lib/services/auth/sessionService'
import { DEFAULT_USER_ROLE } from '@/lib/constants/roles'
import { EXAM_OPTIONS } from '@/lib/constants/dashboards/examOptions'
import { getStoredSelectedExam, setStoredSelectedExam } from '@/lib/constants/dashboards/examSelectionStorage'
import { setUsernameCookie } from '@/lib/utils/sessions/generateSystemUserSessionCookies'
const role = DEFAULT_USER_ROLE;
const LOGIN_PATH = "/auth/login";

// -------------------------------------------------------------------------------------------------------------------------------

export default function RegisterPage() {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    pin_confirmation: string;
    pin: string;
    loginMethod: "password" | "pin" | "both";
    agree: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    pin_confirmation: "",
    pin: "",
    loginMethod: "password",
    agree: false,
  })

  // -------------------------------------------------------------------------------------------------------------------------------

  const showPinFields = form.loginMethod === "pin" || form.loginMethod === "both"
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  const [phoneValid, setPhoneValid] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState<'email' | 'google' | null>(null)
  const [selectedExam, setSelectedExam] = useState<string>(() => {
    const stored = getStoredSelectedExam()
    return EXAM_OPTIONS.some((opt) => opt.value === stored) ? stored : ""
  })


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // -------------------------------------------------------------------------------------------------------------------------------
  // Check if the User in Logged In
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await session.check()

        // 🔹 Debug log only
        console.log("➡️ Login status check:", {
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

  // -------------------------------------------------------------------------------------------------------------------------------

  const [userCountry, setUserCountry] = useState<CountryCode | undefined>("US")

  useEffect(() => {
    const browserLocale = navigator.language || "en-US"
    const countryCode = browserLocale.split("-")[1]?.toUpperCase() as CountryCode
    setUserCountry(countryCode)
  }, [])


  const handlePhoneChange = (value: string | undefined) => {
    const phone = value || ''

    if (!phoneTouched) {
      setPhoneTouched(true)
    }

    setForm(prev => ({ ...prev, phone }))
    setPhoneValid(isValidPhoneNumber(phone))
  }

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specials = '!@#$%^&*()-_=+[]{};:,.<>?';
    const allChars = upper + lower + digits + specials;

    let password = '';

    // Ensure at least one of each required type for generated password
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += lower.charAt(Math.floor(Math.random() * lower.length));
    password += digits.charAt(Math.floor(Math.random() * digits.length));
    password += specials.charAt(Math.floor(Math.random() * specials.length));

    // Fill the rest randomly (12 more chars to make length ~16)
    for (let i = 0; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    // Update form
    setForm(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
  };

  const generatePin = (length = 16) => {
    const digits = '0123456789';
    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    setForm(prev => ({
      ...prev,
      pin,
      pin_confirmation: pin
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.agree) {
      alert('You must agree to the terms to continue.')
      return
    }

    if (!selectedExam) {
      alert('Please select the exam/dashboard you want to join.')
      return
    }

    const cleanEmail = form.email.trim().toLowerCase()
    if (!cleanEmail) {
      alert('Please enter a valid email address.')
      return
    }

    if (form.loginMethod !== "pin") {
      if (!form.password) {
        alert('Please enter a password.')
        return
      }
      if (form.password !== form.confirmPassword) {
        alert('Passwords do not match!')
        return
      }
    }

    if (form.loginMethod !== "password") {
      if (!form.pin || form.pin.length < 4) {
        alert('PIN must be at least 4 digits.')
        return
      }
      if (form.pin !== form.pin_confirmation) {
        alert('PINs do not match!')
        return
      }
    }

    if (!phoneValid) {
      alert('Please enter a valid phone number with at least 10 digits.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Call registerService instead of Axios
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
        dashboardName: selectedExam || 'web',
        provider: selectedProvider || 'email',
        providerPayload: selectedProvider && selectedProvider !== 'email' ? 'OAuth' : 'Void',
        challenge: "register-skew8@lancasto",
      })

      if (response.error) {
        setError(response.error)
      } else {
        const formAny = form as { name?: string; username?: string }
        const preUsername = (formAny.name || formAny.username || cleanEmail.split('@')[0]).trim()
        if (preUsername) {
          setUsernameCookie(preUsername)
        }
        // Redirect to login with success message and pre-filled email
        window.location.href = `${LOGIN_PATH}?registered=true&email=${encodeURIComponent(cleanEmail)}&dashboard=${encodeURIComponent(selectedExam)}`
      }

    } catch (err: unknown) {
      console.error('💥 Registration error:', err)
      setError(err instanceof Error ? err.message : 'Unexpected registration error')
    } finally {
      setIsLoading(false)
    }

  }

  // -------------------------------------------------------------------------------------------------------------------------------

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20 sm:pt-24 pb-8 sm:pb-12 min-h-[calc(100vh-80px)]" style={{ backgroundColor: "var(--content-bg)" }}>


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

      {/* Registration Card Container */}
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
              onClick={() => setSelectedProvider('google')}
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


          {/* Alert Message */}
          {(error || success) && (
            <div className="flex justify-center">
              <div
                className={`relative max-w-md w-full px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3
                ${error ? 'bg-coral/10 border border-coral/30 text-coral' : ''}
                ${success ? 'bg-teal/10 border border-teal/30 text-teal' : ''}
              `}
              >
                {/* Emoji */}
                <span className="flex items-center justify-center leading-none">
                  {error ? '⚠️' : '✅'}
                </span>

                {/* Message Text */}
                <span className="flex-1 leading-none">
                  {error || success}
                </span>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setSuccess('')
                  }}
                  className={`absolute top-2 right-2 font-bold hover:text-navy ${error ? 'text-coral' : 'text-teal'}`}
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
                className="w-full bg-coral text-[#0c1929] py-2 rounded-lg hover:bg-coral-hover font-semibold transition"
              >
                🚀 Dive in &amp; Continue
              </button>
            </div>
          ) : (
          <form onSubmit={handleRegister} className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-navy/70 mb-0.5">Enter Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-paper-dim border border-border rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-navy/70 mb-0.5">Enter Email</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-paper-dim border border-border rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-navy/70 mb-0.5">
                  Enter Phone{' '}
                  {form.phone && form.phone.length > 6 && !phoneValid && (
                    <span className="text-coral text-[11px]">(Invalid phone number)</span>
                  )}
                </label>

                <PhoneInput
                  international
                  defaultCountry={userCountry}
                  value={form.phone}
                  onChange={handlePhoneChange}
                  name="phone"
                  className="w-full bg-paper-dim border border-border rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-coral transition-all"
                  countrySelectProps={{
                    className: "text-navy text-xs",
                  }}
                />

                <style jsx global>{`
                .PhoneInputInput {
                  width: 100%;
                  font-size: 0.875rem; /* text-sm */
                  padding: 0.15rem 0;
                  color: var(--text-color, inherit);
                  background-color: transparent;
                  border: none;
                  outline: none;
                  box-shadow: none;
                }

                .PhoneInputInput:focus {
                  outline: none;
                  box-shadow: none;
                }
              `}</style>
              </div>


              {/* 🔑 PASSWORD FIELDS (if allowed) */}
              {(form.loginMethod === "password" || form.loginMethod === "both") && (
                <div className="animate-fadeIn space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="block text-xs font-medium text-navy/70">
                        Enter Password
                      </label>

                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-[11px] bg-coral/10 text-coral px-1.5 py-0.5 rounded hover:bg-coral/20"
                      >
                        Generate
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        required={form.loginMethod === "password" || form.loginMethod === "both"}
                        value={form.password}
                        maxLength={24}
                        onChange={handleChange}
                        className="w-full bg-paper-dim border border-border rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral pr-9"
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

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="block text-xs font-medium text-navy/70 mb-0.5">
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
                        maxLength={24}
                        className={`w-full bg-paper-dim border ${form.password &&
                          form.confirmPassword &&
                          form.password !== form.confirmPassword
                          ? "border-coral/50"
                          : "border-border"
                          } rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral pr-9`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-2 right-2.5 text-navy/40 hover:text-navy text-sm"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {form.password &&
                      form.confirmPassword &&
                      form.password !== form.confirmPassword && (
                        <p className="mt-0.5 text-xs text-coral">Passwords do not match</p>
                      )}
                  </div>
                </div>
              )}

              {/* 🔢 PIN FIELDS (if allowed) */}
              {(form.loginMethod === "pin" || form.loginMethod === "both") && (
                <div className="animate-fadeIn space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-navy/70">
                      Enter PIN (4–24 digits)
                    </label>

                    <button
                      type="button"
                      onClick={() => generatePin(16)} // generate 16-digit PIN
                      className="text-xs bg-coral/10 text-coral px-2 py-1 rounded hover:bg-coral/20"
                    >
                      Generate
                    </button>
                  </div>

                  {/* PIN Input */}
                  <div className="relative mb-3">
                    <input
                      type={showPin ? "text" : "password"}
                      name="pin"
                      maxLength={24}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      required={showPinFields}
                      value={form.pin || ""}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 24) {
                          setForm(prev => ({ ...prev, pin: value }))
                        }
                      }}
                      className="w-full bg-paper-dim border border-border rounded-lg px-3 py-2 text-md text-navy focus:outline-none focus:ring-2 focus:ring-coral pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute top-2.5 right-3 text-navy/40 hover:text-navy"
                    >
                      {showPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Confirm PIN */}
                  <div>
                    <label className="block text-sm font-medium text-navy/70 mb-1">
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
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            pin_confirmation: e.target.value.replace(/\D/g, "")
                          }))
                        }
                        className="w-full bg-paper-dim border border-border rounded-lg px-3 py-2 text-md text-navy focus:outline-none focus:ring-2 focus:ring-coral pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute top-2.5 right-3 text-navy/40 hover:text-navy"
                      >
                        {showConfirmPin ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {form.pin &&
                      form.pin_confirmation &&
                      form.pin !== form.pin_confirmation && (
                        <p className="mt-1 text-xs text-coral">PINs do not match</p>
                      )}
                  </div>

                </div>
              )}

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
                    — Choose your exam —
                  </option>
                  {EXAM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {!selectedExam && (
                  <p className="mt-0.5 text-[10px] text-coral/80">
                    Select the exam you want to prepare for.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="accent-coral h-3.5 w-3.5"
                />
                <label className="text-xs text-navy/60">
                  I agree to the{' '}
                  <Link href="/pages/terms" className="text-coral underline hover:text-coral-hover">
                    Terms and Conditions
                  </Link>
                </label>
              </div>


              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coral text-[#0c1929] py-1.5 rounded-lg hover:bg-coral-hover text-xs sm:text-sm font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering . . . ⚓' : 'Submit and Register'}
              </button>

              {/* Submit */}
              {error && (
                <p className="text-xs text-coral text-center font-medium">{error}</p>
              )}

              {/* Links */}
              <div className="mt-2 flex flex-row space-x-2 w-full">
                <Link
                  href="/auth/support"
                  className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-1.5 px-2 rounded-lg hover:bg-paper-dim transition-colors duration-300 text-xs"
                >
                  Having Issues ?
                </Link>
                <Link
                  href="/auth/login"
                  className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-1.5 px-2 rounded-lg hover:bg-paper-dim transition-colors duration-300 text-xs"
                >
                  Login Instead ?
                </Link>
              </div>

            </form>
          )}
        </div>

      </div>
    )
  }