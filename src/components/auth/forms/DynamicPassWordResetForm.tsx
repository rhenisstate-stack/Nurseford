"use client";

import { useState } from "react";

type Props = {
    onSuccess?: () => void;
    onBack?: () => void;
    email?: string;
};

export default function DynamicPassWordResetForm({
    onSuccess,
    onBack,
    email = "",
}: Props) {
    const [inputEmail, setInputEmail] = useState(email);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputEmail) {
            setError("Email is required");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // 👉 TODO: Replace with your actual API call
            await new Promise((res) => setTimeout(res, 1200));

            setSuccess(true);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: unknown) {
            console.error(err);
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {!success ? (
                <form onSubmit={handleReset} className="space-y-4">
                    {/* TITLE */}
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">Reset Password</h2>
                        <p className="text-xs text-gray-500">
                            Enter your email to receive a reset link
                        </p>
                    </div>

                    {/* EMAIL */}
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* ERROR */}
                    {error && (
                        <p className="text-xs text-red-500 text-center">{error}</p>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    {/* BACK */}
                    <div className="text-center text-xs text-indigo-600">
                        <button type="button" onClick={onBack}>
                            Back to Login
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center space-y-4">
                    <h2 className="text-lg font-semibold">Check your email</h2>
                    <p className="text-sm text-gray-600">
                        We’ve sent a password reset link to:
                    </p>

                    <p className="text-sm font-medium text-indigo-600">
                        {inputEmail}
                    </p>

                    <button
                        onClick={onBack}
                        className="text-xs text-indigo-600 underline"
                    >
                        Back to Login
                    </button>
                </div>
            )}
        </div>
    );
}