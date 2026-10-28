'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { FiCheckCircle, FiMail } from 'react-icons/fi'
import { APP_NAME } from '@/lib/config/config'
import { CountryCode } from 'libphonenumber-js'
import PhoneInput from 'react-phone-number-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { submitSupportIssue } from '@/lib/services/auth/supportService'
import { useCurrentSystemUser } from '@/lib/hooks/users/account/current/useCurrentSystemUser'

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const TARGET_PROGRAM = "nclex-pn";

type IssueCategory =
  | 'login_issue'
  | 'account_recovery'
  | 'payment_billing'
  | 'exam_technical'
  | 'other'

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading: userLoading } = useCurrentSystemUser()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [category, setCategory] = useState<IssueCategory>('login_issue')
  const [message, setMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [userCountry, setUserCountry] = useState<CountryCode | undefined>('US')

  useEffect(() => {
    const browserLocale = navigator.language || 'en-US'
    const countryCode = browserLocale.split('-')[1]?.toUpperCase() as CountryCode
    setUserCountry(countryCode)
  }, [])

  useEffect(() => {
    if (!user) return
    const primaryPhone = user.phones?.find(p => p.isPrimary)?.phoneNumber

    if (user.email) setEmail(user.email)
    if (primaryPhone) {
      setPhone(primaryPhone)
      setPhoneValid(isValidPhoneNumber(primaryPhone))
    }
  }, [user])

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
        ...(user ? { userGuidId: user.guidId } : {}),
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

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  return (
    <main
      className="pt-16 flex flex-col items-center justify-center gap-4 text-center px-4"
      style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}>

      {/* App Title / Branding */}
      <div className="flex flex-col items-center justify-center mb-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-500 drop-shadow-md">
            Support at
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-800 drop-shadow-md">
            {APP_NAME}
          </h1>
          <FiCheckCircle className="text-green-500 text-xl md:text-2xl drop-shadow-sm" title="Verified" />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Having trouble? Tell us what happened and we&apos;ll help you sort it out.
        </p>
      </div>

      {/* Card Container */}
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

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
        <div className="w-full p-8 space-y-6 border-l border-gray-200">

          {/* Alert Message */}
          {(error || success) && (
            <div className="flex justify-center">
              <div
                className={`relative max-w-md w-full px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3
                ${error ? 'bg-red-100 border border-red-200 text-red-800' : ''}
                ${success ? 'bg-green-100 border border-green-200 text-green-800' : ''}`}
              >
                <span className="flex items-center justify-center leading-none">
                  {error ? '⚠️' : '✔️'}
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

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Phone {' '}
                  {phone && phone.length > 6 && !phoneValid && (
                    <span className="text-red-500 text-xs">(Invalid phone number)</span>
                  )}
                </label>
                <PhoneInput
                  international
                  defaultCountry={userCountry}
                  value={phone}
                  onChange={handlePhoneChange}
                  name="phone"
                  disabled={!!user}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all ${user ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  countrySelectProps={{ className: 'text-blue-600 text-sm' }}
                />

                <style jsx global>{`
                  .PhoneInputInput {
                    width: 100%;
                    font-size: 1rem;
                    padding: 0rem 0;
                    color: #1f2937;
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What&apos;s this About ?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Unable To Access Account">Unable To Access Account</option>
                  <option value="Account Recovery Problem">Account Recovery Problem</option>
                  <option value="Payment / Billing Issue">Payment / Billing Issue</option>
                  <option value="Exam or Technical Issue">Exam or Technical Issue</option>
                  <option value="Something Else">Something Else</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kindly Describe your Issue
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what happened, what you expected, and any error messages you saw . . ."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{message.length} characters</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || userLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting . . . ⚓' : userLoading ? 'Checking Your Session . . . ⚓' : 'Submit the Issue'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-3">
              <FiCheckCircle className="text-green-500 text-4xl mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800">Thanks for Reaching Out ⚓</h3>
              <p className="text-sm text-gray-600">
                We&apos;ve logged your issue and will follow up at {email} or by phoneasap.
              </p>
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
              href={`/dashboards/${TARGET_PROGRAM}/auth/account/recovery/password`}
              className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
            >
              Forgot Password ?
            </Link>
          </div>


          {/* Links */}
          <div className="mt-6 flex flex-row space-x-3 w-full">
            <Link
              href={`/dashboards/${TARGET_PROGRAM}/auth/account/recovery/social`}
              className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
            >
              Switch to use Email and Password / Pin  ?
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// The End By B.L.S.M.C - [SkewBlanc] - The Winds Chase Us ⚓

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
