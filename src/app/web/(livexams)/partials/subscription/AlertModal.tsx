"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE — Subscription Alert Suppression
// ─────────────────────────────────────────────────────────────────────────

const SUBSCRIPTION_ALERT_FOREVER_KEY = "exam_subscription_alert_dismiss_forever";

export function shouldSuppressSubscriptionAlert(examGuidId?: string | null): boolean {
    if (typeof window === "undefined") return true;
    try {
        if (localStorage.getItem(SUBSCRIPTION_ALERT_FOREVER_KEY) === "true") return true;
        if (examGuidId && localStorage.getItem(`${SUBSCRIPTION_ALERT_FOREVER_KEY}_${examGuidId}`) === "true") {
            return true;
        }
    } catch {
        // localStorage unavailable (SSR / privacy mode) — fail open, show the alert
    }
    return false;
}

export function suppressSubscriptionAlertForever(examGuidId?: string | null) {
    if (typeof window === "undefined") return;
    try {
        if (examGuidId) {
            localStorage.setItem(`${SUBSCRIPTION_ALERT_FOREVER_KEY}_${examGuidId}`, "true");
        } else {
            localStorage.setItem(SUBSCRIPTION_ALERT_FOREVER_KEY, "true");
        }
    } catch {
        // ignore
    }
}

// ─────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────

export default function SubscriptionAlertModal({
    open,
    reason,
    onClose,
}: {
    open: boolean;
    reason: string | null;
    examGuidId?: string | null;
    onClose: (dontShowAgain: boolean) => void;
}) {
    const router = useRouter();
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        if (open) setDontShowAgain(false);
    }, [open]);

    if (!open) return null;

    const handleOpenSubscriptions = () => {
        router.push("/dashboards/rn-nursing/vista/subscriptions/items");
    };

    return (
        <div className="fixed inset-0 z-[10011] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                <div className="bg-red-900 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-white text-lg font-bold">Subscription Required ⚓</h2>
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

                <div className="px-5 py-5 space-y-4 text-center">
                    <div className="text-5xl">🔒</div>
                    <p className="text-sm font-semibold text-gray-700">
                        {reason ?? "You Do Not Have Access to Full Content for This Exam ⚓"}
                    </p>

                    <button
                        onClick={handleOpenSubscriptions}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-green-700 text-white text-md font-bold transition"
                    >
                        View Our Cheap Subscription Plans
                    </button>

                    <button
                        onClick={() => onClose(dontShowAgain)}
                        className="w-full py-2 rounded-xl border border-gray-300 bg-green-100 text-gray-600 text-md font-medium hover:bg-yellow-400 transition"
                    >
                        Continue With Limited Access
                    </button>

                    <label className="flex items-center border p-2 rounded-lg justify-center gap-2 text-xs text-gray-500 hover:bg-amber-200 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="accent-red-600"
                        />
                        Do Not Show This Again
                    </label>
                </div>
            </div>
        </div>
    );
}