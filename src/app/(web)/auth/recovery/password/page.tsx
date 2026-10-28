'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { FiCheckCircle, FiMail, FiArrowLeft } from 'react-icons/fi'
import { APP_NAME } from '@/lib/config/config'
import { useRouter } from 'next/navigation'
import { useCurrentSystemUser } from '@/lib/hooks/users/account/current/useCurrentSystemUser'
import {
  requestRecoveryCode,
  verifyRecoveryCode,
  resetCredentials,
} from '@/lib/services/auth/supportService'

// ─────────────────────────────────────────────────────────────────────────────

type Step = 'email' | 'code' | 'reset' | 'done'
type CredentialMethod = 'password' | 'pin' | 'both'

// ─────────────────────────────────────────────────────────────────────────────

export default function RecoveryPasswordPage() {
  const router = useRouter()
  const { user } = useCurrentSystemUser()

  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Step 1: Email
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email)
    }
  }, [user?.email, email])

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

  // ───────────────────────────────────────────────────────────────────────────

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

  // ───────────────────────────────────────────────────────────────────────────
  // Step 1 → Request code

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await requestRecoveryCode({
        userGuidId: user?.guidId,
        email,
        context: 'password',
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setSuccess(response.message || `A recovery code (or link) has been sent to ${email} ⚓`)
      setStep('code')
      startResendCooldown()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send recovery code.')
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
        userGuidId: user?.guidId,
        email,
        context: 'password',
      })
      if (response.error) {
        setError(response.error)
        return
      }
      setSuccess(response.message || 'Code resent ⚓')
      startResendCooldown()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to resend code.')
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Step 2 → Verify code

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await verifyRecoveryCode({
        userGuidId: user?.guidId,
        email,
        code,
        context: 'password',
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setSuccess(response.message || 'Code verified ✓ Now set your new credentials.')
      setStep('reset')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code.')
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Step 3 → Reset credentials

  const handleResetCredentials = async (e: React.FormEvent) => {
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
        userGuidId: user?.guidId,
        email,
        code,
        context: 'password',
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
      setError(err instanceof Error ? err.message : 'Unable to reset credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-16 min-h-screen" style={{ backgroundColor: "var(--content-bg)" }}>

      {/* App Title / Branding */}
      <div className="flex flex-col items-center justify-center mb-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-navy/60 drop-shadow-md">
            Recover your
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-coral drop-shadow-md">
            {APP_NAME}
          </h1>
          <FiCheckCircle className="text-teal text-xl md:text-2xl drop-shadow-sm" title="Verified" />
        </div>
        <p className="text-xs text-navy/50 mt-1">
          Reset your password or PIN to get back into your account.
        </p>
      </div>

      {/* Card Container */}
      <div className="max-w-xl w-full bg-paper border border-black/50 dark:border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Form Container */}
        <div className="w-full p-6 sm:p-8 space-y-6">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-navy/50">
            <span className={step === 'email' ? 'text-coral' : ''}>1. Email</span>
            <span>→</span>
            <span className={step === 'code' ? 'text-coral' : ''}>2. Verify</span>
            <span>→</span>
            <span className={step === 'reset' || step === 'done' ? 'text-coral' : ''}>3. New Credentials</span>
          </div>

          {/* Explanatory Note */}
          <p className="text-center text-sm text-navy/70 max-w-md mx-auto">
            Use this page if you already have an Account with us to RECOVER your password or PIN you&apos;ve forgotten.
          </p>
          <p className="text-center text-sm text-navy/50 max-w-md mx-auto">
            Enter the email of your account, confirm the code (or link) we will send to your Email Account, then enter
            a new password, a new PIN, or both.
          </p>

          <p className="text-coral font-bold text-sm text-center"> Note Down Your New Password or Pin Credentials for next Login</p>

          {/* Alert Message */}
          {(error || success) && (
            <div className="flex justify-center">
              <div
                className={`relative max-w-md w-full px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3
                ${error ? 'bg-coral/10 border border-coral/30 text-coral' : ''}
                ${success ? 'bg-teal/10 border border-teal/30 text-teal' : ''}`}
              >
                <span className="flex items-center justify-center leading-none">
                  {error ? '⚠️' : '✅'}
                </span>
                <span className="flex-1 leading-tight">{error || success}</span>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess('') }}
                  className={`absolute top-2 right-2 font-bold hover:text-navy ${error ? 'text-coral' : 'text-teal'}`}
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
                <label className="block text-sm font-medium text-navy/70 mb-1">
                  Enter the email tied to your account
                </label>
                <div className="relative">
                  <FiMail className="absolute top-3 left-3 text-navy/40" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-paper-dim border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-coral"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coral text-[#0c1929] py-2 rounded-lg hover:bg-coral-hover font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending . . . ⚓' : 'Send Recovery Code'}
              </button>
            </form>
          )}

          {/* STEP 2: Code */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy/70 mb-1">
                  Enter the code sent to {email}
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  maxLength={8}
                  className="w-full bg-paper-dim border border-border rounded-lg px-3 py-2 text-center text-lg tracking-[0.5em] text-navy focus:outline-none focus:ring-2 focus:ring-coral"
                />
                <p className="text-xs text-navy/50 mt-2">
                  You can also click the link we sent to your email instead.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coral text-[#0c1929] py-2 rounded-lg hover:bg-coral-hover font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying . . . ⚓' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="w-full text-sm text-coral hover:text-coral-hover disabled:text-navy/30 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full flex items-center justify-center gap-1 text-sm text-navy/50 hover:text-navy"
              >
                <FiArrowLeft /> Use a different email
              </button>
            </form>
          )}

          {/* STEP 3: New Credentials */}
          {step === 'reset' && (
            <form onSubmit={handleResetCredentials} className="space-y-4">

              {/* Method Selector */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-navy/70 mb-2">
                  Choose Login Method
                </label>
                <div className="flex bg-paper-dim p-1 rounded-xl shadow-inner border border-border">
                  {(['password', 'pin', 'both'] as CredentialMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setCredentialMethod(method)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${credentialMethod === method
                        ? 'bg-coral text-[#0c1929] shadow'
                        : 'text-navy/70 hover:bg-paper-dim'
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
                      <label className="block text-sm font-medium text-navy/70">New Password</label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs bg-coral/10 text-coral px-2 py-1 rounded hover:bg-coral/20"
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
                        className="w-full bg-paper-dim border border-border rounded-lg px-3 py-2 text-md text-navy focus:outline-none focus:ring-2 focus:ring-coral pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-2.5 right-3 text-navy/40 hover:text-navy"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {password && (
                      <ul className="mt-2 text-xs space-y-1">
                        <li className={passwordRequirements.length ? 'text-teal' : 'text-navy/50'}>
                          {passwordRequirements.length ? '✓' : '•'} At least 8 characters
                        </li>
                        <li className={passwordRequirements.uppercase ? 'text-teal' : 'text-navy/50'}>
                          {passwordRequirements.uppercase ? '✓' : '•'} One uppercase letter (optional)
                        </li>
                        <li className={passwordRequirements.number ? 'text-teal' : 'text-navy/50'}>
                          {passwordRequirements.number ? '✓' : '•'} One number (optional)
                        </li>
                        <li className={passwordRequirements.specialChar ? 'text-teal' : 'text-navy/50'}>
                          {passwordRequirements.specialChar ? '✓' : '•'} One special character (optional)
                        </li>
                      </ul>
                    )}
                  </div>

                  {passwordRequirements.length && (
                    <div>
                      <label className="block text-sm font-medium text-navy/70 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          maxLength={24}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full bg-paper-dim border ${password && confirmPassword && password !== confirmPassword
                            ? 'border-coral/50'
                            : 'border-border'
                            } rounded-lg px-3 py-2 text-md text-navy focus:outline-none focus:ring-2 focus:ring-coral pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute top-2.5 right-3 text-navy/40 hover:text-navy"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {password && confirmPassword && password !== confirmPassword && (
                        <p className="mt-1 text-xs text-coral">Passwords do not match</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PIN Fields */}
              {(credentialMethod === 'pin' || credentialMethod === 'both') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-navy/70">New PIN (4–24 digits)</label>
                    <button
                      type="button"
                      onClick={() => generatePin(16)}
                      className="text-xs bg-coral/10 text-coral px-2 py-1 rounded hover:bg-coral/20"
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

                  <div>
                    <label className="block text-sm font-medium text-navy/70 mb-1">Confirm New PIN</label>
                    <div className="relative">
                      <input
                        type={showConfirmPin ? 'text' : 'password'}
                        required
                        maxLength={24}
                        inputMode="numeric"
                        value={pinConfirmation}
                        onChange={(e) => setPinConfirmation(e.target.value.replace(/\D/g, ''))}
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
                    {pin && pinConfirmation && pin !== pinConfirmation && (
                      <p className="mt-1 text-xs text-coral">PINs do not match</p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coral text-[#0c1929] py-2 rounded-lg hover:bg-coral-hover font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving . . . ⚓' : 'Save New Credentials'}
              </button>
            </form>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="text-center space-y-3">
              <FiCheckCircle className="text-teal text-4xl mx-auto" />
              <h3 className="text-lg font-semibold text-navy">All set ⚓</h3>
              <p className="text-sm text-navy/60">Redirecting you to login . . .</p>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 flex flex-row space-x-3 w-full">
            <Link
              href="/auth/login"
              className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-2 px-4 rounded-lg hover:bg-paper-dim transition-colors duration-300"
            >
              Back to Login
            </Link>
            <Link
              href="/auth/support"
              className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-2 px-4 rounded-lg hover:bg-paper-dim transition-colors duration-300"
            >
              Having Issues ?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// The End By B.L.S.M.C - [SkewBlanc] - The Winds Chase Us ⚓