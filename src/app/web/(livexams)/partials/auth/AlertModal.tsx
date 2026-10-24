"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE — Auth Alert Suppression
// ─────────────────────────────────────────────────────────────────────────

const AUTH_ALERT_FOREVER_KEY = "exam_auth_alert_dismiss_forever";
const AUTH_ALERT_COOLDOWN_KEY = "exam_auth_alert_dismiss_until";
const AUTH_ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function shouldSuppressAuthAlert(): boolean {
    if (typeof window === "undefined") return true;
    try {
        if (localStorage.getItem(AUTH_ALERT_FOREVER_KEY) === "true") return true;
        const until = localStorage.getItem(AUTH_ALERT_COOLDOWN_KEY);
        if (until && Date.now() < parseInt(until, 10)) return true;
    } catch {
        // localStorage unavailable (SSR / privacy mode) — fail open, show the alert
    }
    return false;
}

export function suppressAuthAlertTemporarily() {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(AUTH_ALERT_COOLDOWN_KEY, String(Date.now() + AUTH_ALERT_COOLDOWN_MS));
    } catch { /* ignore */ }
}

export function suppressAuthAlertForever() {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(AUTH_ALERT_FOREVER_KEY, "true");
    } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────

export default function AuthRequiredModal({
    open,
    onClose,
    onLogin,
}: {
    open: boolean;
    onClose: (dontShowAgain: boolean) => void;
    onLogin: () => void;
}) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        if (open) setDontShowAgain(false);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-white text-lg font-bold">You&apos;re Not Logged In ⚓</h2>
                    <button
                        onClick={() => onClose(dontShowAgain)}
                        aria-label="Close"
                        className="
                        relative top-0 right-0 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700
                        bg-pink-200 text-black shadow-sm backdrop-blur-md transition-all duration-300 ease-out
                        hover:scale-110 hover:border-red-500 hover:bg-black hover:text-red-600 hover:shadow-lg
                        active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500
                    "
                    >
                        <FiX className="h-7 w-7 stroke-[3.5]" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4 text-center">
                    <p className="text-sm text-gray-700">
                        You Can Keep Previewing Questions Without An Account, But You Must{" "}
                        <span className="font-bold text-indigo-700">Login / Register</span>{" "}
                        To Save Answers &amp; Submit This Exam ⚓
                    </p>

                    <button
                        onClick={onLogin}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
                    >
                        Click to Login / Register Now
                    </button>

                    <label className="flex items-center border p-2 rounded-lg justify-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="accent-indigo-600"
                        />
                        Do Not Show This Again
                    </label>
                </div>

            </div>
        </div>
    );
}