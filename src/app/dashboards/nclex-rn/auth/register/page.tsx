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
import Image from 'next/image'
import { session } from '@/lib/services/auth/sessionService'
import { redirectToSocialProvider } from '@/lib/services/auth/socialService'

const role = "Learner"; // hidden, fixed role
const LOGIN_PATH = "/dashboards/nclex-rn/auth/login";

const TARGET_PROGRAM = "nclex-rn";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const [form, setForm] = useState<{
        username: string;
        email: string;
        phone: string;
        password: string;
        confirmPassword: string;
        pin_confirmation: string;
        pin: string;
        loginMethod: "password" | "pin" | "both";
        agree: boolean;
    }>({
        username: '',
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

    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        number: false,
        specialChar: false,
    })
    const showPinFields = form.loginMethod === "pin" || form.loginMethod === "both"

    const [phoneValid, setPhoneValid] = useState(false)
    const [phoneTouched, setPhoneTouched] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]['provider']) => {
        redirectToSocialProvider({ provider, context: 'register' }).catch((err) => {
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


        // Check password requirements when password changes
        if (name === 'password') {
            setPasswordRequirements({
                length: value.length >= 6,
                uppercase: /[A-Z]/.test(value),
                number: /\d/.test(value),
                specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            })
        }
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

    useEffect(() => {
        const match = document.cookie.match(/(?:^|; )socialError=([^;]*)/);
        if (match) {
            setError(decodeURIComponent(match[1]));
            document.cookie = 'socialError=; path=/; max-age=0';
        }
    }, []);

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

        // Set password requirements as satisfied for generated password
        setPasswordRequirements({
            length: true,
            uppercase: true,
            number: true,
            specialChar: true, // generated password always has special char
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.agree) {
            alert('You must agree to the terms to continue.')
            return
        }

        if (form.loginMethod !== "pin" && form.password !== form.confirmPassword) {
            alert('Passwords do not match!')
            return
        }

        if (!phoneValid) {
            alert('Please enter a valid phone number with at least 10 digits.')
            return
        }

        if (form.loginMethod !== "pin" && !passwordRequirements.length) {
            alert('Password must be at least 6 characters.')
            return
        }

        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            // Call registerService instead of Axios
            const response = await registerUser({
                username: form.username,
                email: form.email,
                phone: form.phone,
                password: form.loginMethod !== "pin" ? form.password : undefined,
                passwordConfirmation: form.loginMethod !== "pin" ? form.confirmPassword : undefined,
                pin: form.loginMethod !== "password" ? form.pin : undefined,
                pin_confirmation: form.loginMethod !== "password" ? form.pin_confirmation : undefined,
                loginMethod: form.loginMethod,
                agree: form.agree,
                role: role,
                dashboardName: 'web',
                provider: 'email',
                providerPayload: 'Void',
                challenge: "register-skew8@lancasto",
            })

            if (response.error) {
                setError(response.error)
            } else {
                // Redirect to login with success message and pre-filled email
                router.push(`${LOGIN_PATH}?registered=true&email=${encodeURIComponent(form.email)}`)
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
            className={`py-16 transition-all duration-300 ease-in-out overflow-x-hidden flex flex-col items-center justify-center relative  }`}
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
                <div className="flex flex-col items-center justify-center my-3 text-center">
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
                            src="/auth/loginImage.jpg"
                            alt="Welcome"
                            layout="fill"
                            objectFit="cover"
                            priority
                            className="z-0"
                        />

                        {/* Top Social Login Buttons Overlay */}
                        <div className="absolute top-0 left-0 z-10 w-full p-4">
                            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 shadow-lg">
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

                    <div className="w-full px-3 md:px-4 bg-gradient-to-b from-green-10 to-yellow-100 space-y-3 border-l border-gray-200">

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

                        <div className="text-center text-lg">
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
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        autoComplete="nickname"
                                        required
                                        value={form.username}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-cyan-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all"
                                        countrySelectProps={{
                                            className: "text-blue-600 text-sm",
                                        }}
                                    />

                                    <style jsx global>{`
                                    .PhoneInputInput {
                                    width: 100%;
                                    font-size: 1rem; /* text-sm */
                                    padding: 0rem 0; /* py-2 */
                                    color: #1f2937; /* text-gray-900 */
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
                                                    required={showPinFields} //  Use explicit boolean
                                                    value={form.password}
                                                    maxLength={24}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md 
                                                  text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>

                                            {/* Password Requirements */}
                                            {form.password && (
                                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                                    <p className="font-medium">Password must contain:</p>
                                                    <ul className="space-y-1 mt-1">
                                                        <li
                                                            className={`${passwordRequirements.length
                                                                ? "text-green-500"
                                                                : "text-gray-500"
                                                                }`}
                                                        >
                                                            {passwordRequirements.length ? "✓" : "•"} At Least 6 Characters
                                                        </li>
                                                        <li
                                                            className={`${passwordRequirements.uppercase
                                                                ? "text-green-500"
                                                                : "text-gray-500"
                                                                }`}
                                                        >
                                                            {passwordRequirements.uppercase ? "✓" : "•"} One Uppercase Letter (Optional)
                                                        </li>
                                                        <li
                                                            className={`${passwordRequirements.number
                                                                ? "text-green-500"
                                                                : "text-gray-500"
                                                                }`}
                                                        >
                                                            {passwordRequirements.number ? "✓" : "•"} One Number (Optional)
                                                        </li>
                                                        <li
                                                            className={`${passwordRequirements.specialChar
                                                                ? "text-green-500"
                                                                : "text-gray-500"
                                                                }`}
                                                        >
                                                            {passwordRequirements.specialChar ? "✓" : "•"} One special
                                                            character (optional)
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* CONFIRM PASSWORD */}
                                        {passwordRequirements.length &&
                                            // passwordRequirements.uppercase &&
                                            // passwordRequirements.number &&
                                            // passwordRequirements.specialChar &&    // without special characters the confirm password shows up
                                            (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm Password
                                                    </label>

                                                    <div className="relative">
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            name="confirmPassword"
                                                            required={showPinFields} //  Use explicit boolean
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
                                            )}
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
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-yellow-900 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Registering . . . ⚓' : 'Submit and Register'}
                                </button>

                                {/* Submit */}
                                {error && (
                                    <p className="text-sm text-red-700 text-center font-medium">{error}</p>
                                )}

                                {/* Links */}
                                <div className="my-3 flex flex-row space-x-3 w-full">
                                    <Link
                                        href={`/dashboards/${TARGET_PROGRAM}/auth/account/support`}
                                        className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
                                    >
                                        Having Issues ?
                                    </Link>
                                    <Link
                                        href={`/dashboards/${TARGET_PROGRAM}/auth/login`}
                                        className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
                                    >
                                        Login Instead ?
                                    </Link>
                                </div>

                            </form>
                        )}
                    </div>
                </div>

            </div>
        </main>

    )
}