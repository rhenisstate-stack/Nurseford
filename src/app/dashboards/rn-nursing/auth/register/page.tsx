'use client'

import { useState, useEffect } from 'react'
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
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
import { redirectToSocialProvider } from '@/lib/services/auth/socialService'
import { DEFAULT_USER_ROLE } from '@/lib/constants/roles'
import { setUsernameCookie } from '@/lib/utils/sessions/generateSystemUserSessionCookies';
const role = DEFAULT_USER_ROLE;
const LOGIN_PATH = "/dashboards/rn-nursing/auth/login";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

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

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

    const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();


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

    const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]['provider']) => {
        redirectToSocialProvider({ provider, context: 'register', redirectPath: '/pages/entrance' }).catch((err) => {
            console.error(`Social redirect (${provider}) failed:`, err)
            setError('Could not start social sign-up. Please try again.')
        })
    }

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

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

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
                dashboardName: 'ati-teas',
                provider: selectedProvider || 'email',
                providerPayload: selectedProvider && selectedProvider !== 'email' ? 'OAuth' : 'Void',
                challenge: "register-skew8@lancasto",
            })

            if (response.error) {
                setError(response.error)
            } else {
                // Redirect to login with success message and pre-filled email
                const preUsername = (form.name || cleanEmail.split('@')[0]).trim();
                if (preUsername) {
                    setUsernameCookie(preUsername);
                }
                window.location.href = `${LOGIN_PATH}?registered=true&email=${encodeURIComponent(cleanEmail)}`;
            }

        } catch (err: unknown) {
            console.error('💥 Registration error:', err)
            setError(err instanceof Error ? err.message : 'Unexpected registration error')
        } finally {
            setIsLoading(false)
        }

    }

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

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
            <div>

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

                {/* Registration Card Container */}
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-5 space-y-3 bg-gradient-to-b from-green-10 to-yellow-100">

                    {/* Social Login Buttons */}
                    <div>
                        <p className="text-center text-gray-500 text-xs font-semibold tracking-wide uppercase mb-1.5">
                            Sign in with
                        </p>
                        <div className="flex justify-center">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2.5 border border-gray-300 py-1.5 px-3 rounded-xl hover:bg-gray-50 transition text-gray-800 w-full font-medium shadow-xs text-xs sm:text-sm"
                                onClick={() => handleSocialClick('google')}
                            >
                                <FcGoogle className="text-xl" />
                                <span className="text-sm font-semibold">Google</span>
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

                    {/* Alert Message */}
                    {(error || success) && (
                        <div className="flex justify-center">
                            <div
                                className={`relative max-w-md w-full px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3
                                    ${error ? 'bg-red-100 border border-red-200 text-red-800' : ''}
                                    ${success ? 'bg-green-100 border border-green-200 text-green-800' : ''}
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
                                    className={`absolute top-2 right-2 font-bold hover:text-gray-700 ${error ? 'text-red-800' : 'text-green-800'}`}
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
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-0.5">Enter Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-0.5">Enter Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-cyan-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                                    Enter Phone{' '}
                                    {form.phone && form.phone.length > 6 && !phoneValid && (
                                        <span className="text-red-500 text-xs">(Invalid phone number)</span>
                                    )}
                                </label>

                                <PhoneInput
                                    international
                                    defaultCountry={userCountry}
                                    value={form.phone}
                                    onChange={handlePhoneChange}
                                    name="phone"
                                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-blue-500 transition-all"
                                    countrySelectProps={{
                                        className: "text-blue-600 text-sm",
                                    }}
                                />

                                <style jsx global>{`
                                    .PhoneInputInput {
                                    width: 100%;
                                    font-size: 1rem; /* text-sm */
                                    padding: 0rem 0; /* py-2 */
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
                                <div className="animate-fadeIn space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Enter Password
                                            </label>

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
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required={form.loginMethod === "password" || form.loginMethod === "both"}
                                                value={form.password}
                                                maxLength={24}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
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

                                    {/* CONFIRM PASSWORD */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
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
                                                className={`w-full border ${form.password &&
                                                    form.confirmPassword &&
                                                    form.password !== form.confirmPassword
                                                    ? "border-red-300"
                                                    : "border-gray-300"
                                                    } rounded-lg px-3 py-2 text-md text-green-700 
                                                            focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>

                                        {form.password &&
                                            form.confirmPassword &&
                                            form.password !== form.confirmPassword && (
                                                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                                            )}
                                    </div>
                                </div>
                            )}

                            {/* 🔢 PIN FIELDS (if allowed) */}
                            {(form.loginMethod === "pin" || form.loginMethod === "both") && (
                                <div className="animate-fadeIn space-y-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Enter  PIN (4–24 digits)
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => generatePin(16)} // generate 16-digit PIN
                                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
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

                                    {/* Confirm PIN */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
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

                                        {form.pin &&
                                            form.pin_confirmation &&
                                            form.pin !== form.pin_confirmation && (
                                                <p className="mt-1 text-xs text-red-500">PINs do not match</p>
                                            )}
                                    </div>

                                </div>
                            )}

                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    name="agree"
                                    checked={form.agree}
                                    onChange={handleChange}
                                    className="mt-1 accent-blue-600"
                                />
                                <label className="text-sm text-gray-600">
                                    I agree to the{' '}
                                    <Link href="/pages/terms" className="text-blue-600 underline hover:text-blue-800">
                                        Terms and Conditions
                                    </Link>
                                </label>
                            </div>


                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-1.5 rounded-lg hover:bg-yellow-900 font-semibold transition text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Registering . . . ⚓' : 'Submit and Register'}
                            </button>

                            {/* Submit */}
                            {error && (
                                <p className="text-sm text-red-700 text-center font-medium">{error}</p>
                            )}

                            {/* Links */}
                            <div className="mt-3 flex flex-row space-x-3 w-full">
                                <Link
                                    href="/auth/support"
                                    className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-1.5 px-3 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
                                >
                                    Having Issues ?
                                </Link>
                                <Link
                                    href={LOGIN_PATH}
                                    className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-1.5 px-3 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
                                >
                                    Login Instead ?
                                </Link>
                            </div>

                        </form>
                    )}
                </div>

            </div>
        </main>

    )
}