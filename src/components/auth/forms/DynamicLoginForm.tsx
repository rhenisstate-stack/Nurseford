"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { login } from "@/lib/services/auth/loginService";
import { DEFAULT_USER_ROLE } from "@/lib/constants/roles";
import DynamicPassWordResetForm from "@/components/auth/forms/DynamicPassWordResetForm";

type Mode = "login" | "forgot";

export default function DeveloperLoginForm({
    onSuccess,
}: {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
}) {
    const [mode, setMode] = useState<Mode>("login");

    const [input, setInput] = useState({
        email: "",
        password: "",
        pin: "",
        challenge: "learner.login.skew8lancasto",
    });

    const [authMode, setAuthMode] = useState<"password" | "pin">("password");
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔥 LOGIN
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setMessage(null);

        const result = await login({
            email: input.email,
            password: input.password,
            pin: input.pin,
            challenge: input.challenge,
            loginMethod: authMode,
            LoginProvider: "email",
            dashboardName: "web",
            role: DEFAULT_USER_ROLE,
        });

        setLoading(false);

        if (result.error) {
            setMessage(result.error);
            return;
        }

        onSuccess?.();
    };

    // 🔥 SOCIAL LOGIN (stub)
    const handleSocialLogin = (provider: string) => {
        setMessage(`🔗 ${provider} login coming soon`);
    };

    return (
        <div className="space-y-4">

            {/* MESSAGE */}
            {message && (
                <div className="p-2 text-sm bg-gray-100 text-gray-700 rounded text-center">
                    {message}
                </div>
            )}

            {/* LOGIN */}
            {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-2">

                    <input
                        type="email"
                        placeholder="Email"
                        value={input.email}
                        onChange={(e) => setInput({ ...input, email: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm text-black"
                        required
                    />

                    {/* AUTH TOGGLE */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">
                            {authMode === "password" ? "Password Login" : "PIN Login"}
                        </span>

                        <div className="flex border rounded overflow-hidden text-xs">
                            <button
                                type="button"
                                onClick={() => setAuthMode("password")}
                                className={`px-2 py-1 ${authMode === "password"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-indigo-600"
                                    }`}
                            >
                                Password
                            </button>

                            <button
                                type="button"
                                onClick={() => setAuthMode("pin")}
                                className={`px-2 py-1 ${authMode === "pin"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white text-indigo-600"
                                    }`}
                            >
                                PIN
                            </button>
                        </div>
                    </div>

                    {/* INPUT SWITCH */}
                    {authMode === "password" ? (
                        <input
                            type="password"
                            placeholder="Password"
                            value={input.password}
                            onChange={(e) =>
                                setInput({ ...input, password: e.target.value })
                            }
                            className="w-full border rounded px-3 py-2 text-sm text-black"
                            required
                        />
                    ) : (
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="PIN"
                            value={input.pin}
                            onChange={(e) => setInput({ ...input, pin: e.target.value })}
                            className="w-full border rounded px-3 py-2 text-sm text-black text-center tracking-widest"
                            required
                        />
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-semibold"
                    >
                        {loading ? "Logging In . . . ⚓" : "Submit &Log In"}
                    </button>

                    {/* LINKS */}
                    <div className="flex justify-between text-xs text-indigo-900">
                        <button type="button" onClick={() => setMode("forgot")}>
                            Forgot Password ?
                        </button>

                     
                    </div>
                </form>
            )}

            {/* RESET (REAL COMPONENT) */}
            {mode === "forgot" && (
                <DynamicPassWordResetForm
                    onBack={() => setMode("login")}
                />
            )}

            {/* SOCIAL LOGIN */}
            <div className="border-t space-y-2 pt-2">

                <p className="text-xs text-center text-gray-500">
                    Or Continue With
                </p>

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin("Google")}
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium shadow-xs transition"
                    >
                        <FcGoogle className="text-base" />
                        <span>Google</span>
                    </button>
                </div>
            </div>

        </div>
    );
}