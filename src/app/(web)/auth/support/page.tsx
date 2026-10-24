'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiCheckCircle, FiMail } from 'react-icons/fi'
import { APP_NAME } from '@/lib/config/config'
import { CountryCode } from 'libphonenumber-js'
import PhoneInput from 'react-phone-number-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { submitSupportIssue } from '@/lib/services/auth/supportService'
import { useCurrentSystemUser } from '@/lib/hooks/users/account/current/useCurrentSystemUser'

// ─────────────────────────────────────────────────────────────────────────────

type IssueCategory =
  | 'login_issue'
  | 'account_recovery'
  | 'payment_billing'
  | 'exam_technical'
  | 'other'

// ─────────────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { user } = useCurrentSystemUser()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)

  const emailRef = useRef(email)
  const phoneRef = useRef(phone)
  emailRef.current = email
  phoneRef.current = phone

  const [phoneTouched, setPhoneTouched] = useState(false)
  const [category, setCategory] = useState<IssueCategory>('login_issue')
  const [message, setMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [userCountry, setUserCountry] = useState<CountryCode | undefined>('US')

  useEffect(() => {
    if (user?.email && !emailRef.current) {
      setEmail(user.email)
    }
    if (user?.phoneNumber && !phoneRef.current) {
      setPhone(user.phoneNumber)
      setPhoneValid(isValidPhoneNumber(user.phoneNumber))
    }
  }, [user?.email, user?.phoneNumber])

  useEffect(() => {
    const browserLocale = navigator.language || 'en-US'
    const countryCode = browserLocale.split('-')[1]?.toUpperCase() as CountryCode
    setUserCountry(countryCode)
  }, [])

  const handlePhoneChange = (value: string | undefined) => {
    const phoneVal = value || ''
    if (!phoneTouched) setPhoneTouched(true)
    setPhone(phoneVal)
    setPhoneValid(isValidPhoneNumber(phoneVal))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!phoneValid) {
      setError('Please enter a valid phone number.')
      return
    }

    if (message.trim().length < 10) {
      setError('Please describe your issue in a bit more detail (at least 10 characters).')
      return
    }

    setIsLoading(true)

    try {
      const response = await submitSupportIssue({
        userGuidId: user?.guidId,
        email,
        phone,
        category,
        message,
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setSuccess('Your issue has been submitted. Our team will reach out shortly ⚓')
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to submit your issue right now.')
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 min-h-screen" style={{ backgroundColor: "var(--content-bg)" }}>

      {/* App Title / Branding */}
      <div className="flex flex-col items-center justify-center mb-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-navy/60 drop-shadow-md">
            Support at
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-coral drop-shadow-md">
            {APP_NAME}
          </h1>
          <FiCheckCircle className="text-teal text-xl md:text-2xl drop-shadow-sm" title="Verified" />
        </div>
        <p className="text-xs text-navy/50 mt-1">
          Having trouble? Tell us what happened and we&apos;ll help you sort it out.
        </p>
      </div>

      {/* Card Container */}
      <div className="max-w-5xl w-full bg-paper border border-black/50 dark:border-border rounded-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE: Photo */}
        <div className="hidden md:flex relative w-full h-full items-end justify-center overflow-hidden">
          <Image
            src="/web/auth/support/supportFoto.jpg"
            alt="Support"
            layout="fill"
            objectFit="cover"
            priority
            className="z-0"
          />

          <div className="z-10 w-full p-8 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-center">
            <h2 className="text-3xl font-extrabold drop-shadow-lg">We&apos;ve Got You ⚓</h2>
            <p className="text-sm mt-2 drop-shadow-md">
              Let us know what&apos;s going on and our team will follow up directly.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full p-8 space-y-6 border-l border-border">

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

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy/70 mb-1">Email</label>
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

              <div>
                <label className="block text-sm font-medium text-navy/70 mb-1">
                  Phone {' '}
                  {phone && phone.length > 6 && !phoneValid && (
                    <span className="text-coral text-xs">(Invalid phone number)</span>
                  )}
                </label>
                <PhoneInput
                  international
                  defaultCountry={userCountry}
                  value={phone}
                  onChange={handlePhoneChange}
                  name="phone"
                  className="w-full bg-paper-dim border border-border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-coral transition-all"
                  countrySelectProps={{ className: 'text-navy text-sm' }}
                />

                <style jsx global>{`
                  .PhoneInputInput {
                    width: 100%;
                    font-size: 1rem;
                    padding: 0rem 0;
                    color: #e2e8f0;
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

              <div>
                <label className="block text-sm font-medium text-navy/70 mb-1">
                  What&apos;s this about ?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full bg-paper-dim border border-border rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral"
                >
                  <option value="login_issue">I can&apos;t log in</option>
                  <option value="account_recovery">Account recovery problem</option>
                  <option value="payment_billing">Payment / billing issue</option>
                  <option value="exam_technical">Exam or technical issue</option>
                  <option value="other">Something else</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy/70 mb-1">
                  Describe your issue
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what happened, what you expected, and any error messages you saw . . ."
                  className="w-full bg-paper-dim border border-border rounded-lg px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-coral resize-none"
                />
                <p className="text-xs text-navy/40 mt-1">{message.length} characters</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coral text-[#0c1929] py-2 rounded-lg hover:bg-coral-hover font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting . . . ⚓' : 'Submit Issue'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-3">
              <FiCheckCircle className="text-teal text-4xl mx-auto" />
              <h3 className="text-lg font-semibold text-navy">Thanks for reaching out ⚓</h3>
              <p className="text-sm text-navy/60">
                We&apos;ve logged your issue and will follow up at {email} or by phone if needed.
              </p>
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
              href="/auth/recovery/password"
              className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-2 px-4 rounded-lg hover:bg-paper-dim transition-colors duration-300"
            >
              Forgot Password ?
            </Link>
          </div>


          {/* Links */}
          <div className="mt-6 flex flex-row space-x-3 w-full">
            <Link
              href="/auth/recovery/social"
              className="flex-1 text-center bg-transparent border border-border-light text-navy font-semibold py-2 px-4 rounded-lg hover:bg-paper-dim transition-colors duration-300"
            >
              Switch to use Email and Password / Pin  ?
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

// The End By B.L.S.M.C - [SkewBlanc] - The Winds Chase Us ⚓