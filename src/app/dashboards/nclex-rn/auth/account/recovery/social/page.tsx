'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { FiCheckCircle, FiMail, FiArrowLeft } from 'react-icons/fi'
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { APP_NAME } from '@/lib/config/config'
import { useRouter } from 'next/navigation'
import {
  requestRecoveryCode,
  verifyRecoveryCode,
  resetCredentials,
} from '@/lib/services/auth/supportService'
import { useCurrentSystemUser } from '@/lib/hooks/users/account/current/useCurrentSystemUser'

const TARGET_PROGRAM = "nclex-rn";

// ─────────────────────────────────────────────────────────────────────────────

type Step = 'email' | 'code' | 'reset' | 'done'
type CredentialMethod = 'password' | 'pin' | 'both'

// ─────────────────────────────────────────────────────────────────────────────

export default function RecoverySocialPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentSystemUser()

  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Step 1: Email
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user])

  // Step 2: Code
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Step 3: New credentials
  const [credentialMethod, setCredentialMethod] = useState<CredentialMethod>('password')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirmation, setPinConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  })

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const handlePasswordInput = (value: string) => {
    setPassword(value)
    setPasswordRequirements({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    })
  }

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    const specials = '!@#$%^&*()-_=+[]{};:,.<>?'
    const allChars = upper + lower + digits + specials

    let generated = ''
    generated += upper.charAt(Math.floor(Math.random() * upper.length))
    generated += lower.charAt(Math.floor(Math.random() * lower.length))
    generated += digits.charAt(Math.floor(Math.random() * digits.length))
    generated += specials.charAt(Math.floor(Math.random() * specials.length))
    for (let i = 0; i < 12; i++) {
      generated += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    generated = generated.split('').sort(() => 0.5 - Math.random()).join('')

    setPassword(generated)
    setConfirmPassword(generated)
    setPasswordRequirements({ length: true, uppercase: true, number: true, specialChar: true })
  }

  const generatePin = (length = 16) => {
    const digits = '0123456789'
    let generated = ''
    for (let i = 0; i < length; i++) {
      generated += digits.charAt(Math.floor(Math.random() * digits.length))
    }
    setPin(generated)
    setPinConfirmation(generated)
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Step 1 → Request code

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await requestRecoveryCode({
        ...(user ? { userGuidId: user.guidId } : {}),
        email,
        context: 'social',
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setSuccess(`A verification code (or link) has been sent to ${email} ⚓`)
      setStep('code')
      startResendCooldown()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send verification code.')
    } finally {
      setIsLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    setError('')
    setIsLoading(true)
    try {
      const response = await requestRecoveryCode({
        ...(user ? { userGuidId: user.guidId } : {}),
        email,
        context: 'social',
      })
      if (response.error) {
        setError(response.error)
        return
      }
      setSuccess('Code resent ⚓')
      startResendCooldown()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to resend code.')
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Step 2 → Verify code

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await verifyRecoveryCode({
        ...(user ? { userGuidId: user.guidId } : {}),
        email,
        code,
        context: 'social',
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setSuccess('Email verified ✓ Now set up your credentials.')
      setStep('reset')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code.')
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Step 3 → Create credentials

  const handleCreateCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (credentialMethod !== 'pin' && password !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (credentialMethod !== 'password' && pin !== pinConfirmation) {
      setError('PINs do not match!')
      return
    }

    const isPasswordStrong = Object.values(passwordRequirements).every(Boolean)
    if (credentialMethod !== 'pin' && !isPasswordStrong) {
      setError('Password does not meet all requirements.')
      return
    }

    setIsLoading(true)

    try {
      const response = await resetCredentials({
        ...(user ? { userGuidId: user.guidId } : {}),
        email,
        code,
        context: 'social',
        loginMethod: credentialMethod,
        password: credentialMethod !== 'pin' ? password : undefined,
        passwordConfirmation: credentialMethod !== 'pin' ? confirmPassword : undefined,
        pin: credentialMethod !== 'password' ? pin : undefined,
        pinConfirmation: credentialMethod !== 'password' ? pinConfirmation : undefined,
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setStep('done')
      setTimeout(() => {
        router.push(`/auth/login?registered=true&email=${encodeURIComponent(email)}`)
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  return (
    <main
      className="pt-16 flex flex-col items-center justify-center gap-4 text-center px-4"
      style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}>

      {/* App Title / Branding */}
      <div className="flex flex-col items-center justify-center mb-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-500 drop-shadow-md">
            Switch to email on
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-800 drop-shadow-md">
            {APP_NAME}
          </h1>
          <FiCheckCircle className="text-green-500 text-xl md:text-2xl drop-shadow-sm" title="Verified" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Signed up with Google, Apple, or another provider? Set up a password or PIN here.
        </p>
      </div>

      {/* Card Container */}
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE: Photo */}
        <div className="hidden md:flex relative w-full h-full items-end justify-center overflow-hidden">
          <Image
            src="/web/auth/recovery/social/socialFoto.jpg"
            alt="Account Recovery"
            layout="fill"
            objectFit="cover"
            priority
            className="z-0"
          />

          <div className="z-10 w-full p-8 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-center">
            <h2 className="text-3xl font-extrabold drop-shadow-lg">New Device ?</h2>
            <p className="text-sm mt-2 drop-shadow-md">
              Verify the email you used with your social account to set up a direct login.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full p-8 space-y-6 border-l border-gray-200">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
            <span className={step === 'email' ? 'text-blue-600' : ''}>1. Email</span>
            <span>→</span>
            <span className={step === 'code' ? 'text-blue-600' : ''}>2. Verify</span>
            <span>→</span>
            <span className={step === 'reset' || step === 'done' ? 'text-blue-600' : ''}>3. Set Credentials</span>
          </div>

          {/* Explanatory Note */}
          <p className="text-center text-sm text-red-800 max-w-md mx-auto">
            Use this page only if you originally signed up with Google, Apple, FaFacebookF, GitHub, LinkedIn, or Microsoft, and now need a to shift and use direct Email + Password or Pin login
          </p>
          <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
            For Instance on a new device where that provider isn&apos;t available. Enter the same email your social
            account used, verify it, then set up a password, a PIN, or both.
          </p>

          <p className="text-blue-500 font-bold text-sm text-center"> Note Down Your New Password or Pin Credentials for next Login</p>

          {/* Alert Message */}
          {(error || success) && (
            <div className="flex justify-center">
              <div
                className={`relative max-w-md w-full px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3
                ${error ? 'bg-red-100 border border-red-200 text-red-800' : ''}
                ${success ? 'bg-green-100 border border-green-200 text-green-800' : ''}`}
              >
                <span className="flex items-center justify-center leading-none">
                  {error ? '⚠️' : '✅'}
                </span>
                <span className="flex-1 leading-tight">{error || success}</span>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess('') }}
                  className={`absolute top-2 right-2 font-bold hover:text-gray-700 ${error ? 'text-red-800' : 'text-green-800'}`}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter the email you registered with via social login
                  {userLoading && <span className="ml-2 text-xs text-gray-400">(checking session . . .)</span>}
                </label>
                <div className="relative">
                  <FiMail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    readOnly={!!user}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${user ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-cyan-800'
                      }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending . . . ⚓' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* STEP 2: Code */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter the code sent to {email}
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault()
                    const pasted = e.clipboardData.getData('text').trim()
                    setCode(pasted.slice(0, 8))
                  }}
                  maxLength={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg tracking-[0.5em] text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can also click the link we sent to your email instead.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying . . . ⚓' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="w-full text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <FiArrowLeft /> Use a different email
              </button>
            </form>
          )}

          {/* STEP 3: Create Credentials */}
          {step === 'reset' && (
            <form onSubmit={handleCreateCredentials} className="space-y-4">

              {/* Method Selector */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Login Method
                </label>
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                  {(['password', 'pin', 'both'] as CredentialMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setCredentialMethod(method)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${credentialMethod === method
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {method === 'password' && 'Password Only'}
                      {method === 'pin' && 'PIN Only'}
                      {method === 'both' && 'Password + PIN'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Fields */}
              {(credentialMethod === 'password' || credentialMethod === 'both') && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        maxLength={24}
                        value={password}
                        onChange={(e) => handlePasswordInput(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {password && (
                      <ul className="mt-2 text-xs space-y-1">
                        <li className={passwordRequirements.length ? 'text-green-500' : 'text-gray-500'}>
                          {passwordRequirements.length ? '✓' : '•'} At least 8 characters
                        </li>
                        <li className={passwordRequirements.uppercase ? 'text-green-500' : 'text-gray-500'}>
                          {passwordRequirements.uppercase ? '✓' : '•'} One uppercase letter (optional)
                        </li>
                        <li className={passwordRequirements.number ? 'text-green-500' : 'text-gray-500'}>
                          {passwordRequirements.number ? '✓' : '•'} One number (optional)
                        </li>
                        <li className={passwordRequirements.specialChar ? 'text-green-500' : 'text-gray-500'}>
                          {passwordRequirements.specialChar ? '✓' : '•'} One special character (optional)
                        </li>
                      </ul>
                    )}
                  </div>

                  {passwordRequirements.length && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          maxLength={24}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full border ${password && confirmPassword && password !== confirmPassword
                            ? 'border-red-300'
                            : 'border-gray-300'
                            } rounded-lg px-3 py-2 text-md text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {password && confirmPassword && password !== confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PIN Fields */}
              {(credentialMethod === 'pin' || credentialMethod === 'both') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">PIN (4–24 digits)</label>
                    <button
                      type="button"
                      onClick={() => generatePin(16)}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Generate
                    </button>
                  </div>
                  <div className="relative mb-3">
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={24}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                    <div className="relative">
                      <input
                        type={showConfirmPin ? 'text' : 'password'}
                        required
                        maxLength={24}
                        inputMode="numeric"
                        value={pinConfirmation}
                        onChange={(e) => setPinConfirmation(e.target.value.replace(/\D/g, ''))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPin ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {pin && pinConfirmation && pin !== pinConfirmation && (
                      <p className="mt-1 text-xs text-red-500">PINs do not match</p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving . . . ⚓' : 'Create Credentials'}
              </button>
            </form>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="text-center space-y-3">
              <FiCheckCircle className="text-green-500 text-4xl mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800">You&apos;re all set ⚓</h3>
              <p className="text-sm text-gray-600">You can now log in with email. Redirecting . . .</p>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 flex flex-row space-x-3 w-full">
            <Link
              href={`/dashboards/${TARGET_PROGRAM}/auth/login`}
              className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
            >
              Back to Login
            </Link>
            <Link
              href={`/dashboards/${TARGET_PROGRAM}/auth/account/support`}
              className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
            >
              Having Issues ?
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

// The End By B.L.S.M.C - [SkewBlanc] - The Winds Chase Us ⚓