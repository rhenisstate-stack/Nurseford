"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, XCircle, X } from "lucide-react";

export function SubscriptionStatusBanner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const rawStatus = (searchParams.get("status") || "").toLowerCase().trim();
  const provider = searchParams.get("provider") || searchParams.get("gateway");

  if (dismissed || !rawStatus) return null;

  const isSuccess =
    rawStatus === "success" ||
    rawStatus === "completed" ||
    rawStatus === "active" ||
    rawStatus === "paid";

  const isPending =
    rawStatus === "pending" ||
    rawStatus === "processing" ||
    rawStatus === "in_progress" ||
    rawStatus === "awaiting";

  const isCancel =
    rawStatus === "cancel" ||
    rawStatus === "cancelled" ||
    rawStatus === "aborted";

  const isFailed =
    rawStatus === "failed" ||
    rawStatus === "declined" ||
    rawStatus === "error";

  if (!isSuccess && !isPending && !isCancel && !isFailed) return null;

  return (
    <div
      className={`rounded-2xl border p-4 flex items-center justify-between gap-3 text-xs shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
        isSuccess
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
          : isPending
          ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          : isCancel
          ? "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          {isPending && <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />}
          {isCancel && <AlertTriangle className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
          {isFailed && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight">
            {isSuccess && "Subscription Confirmed & Activated!"}
            {isPending && "Subscription Payment Pending"}
            {isCancel && "Subscription Checkout Cancelled"}
            {isFailed && "Subscription Payment Declined"}
          </p>
          <p className="text-[11px] opacity-80 mt-0.5">
            {isSuccess &&
              `Your payment ${provider ? `via ${provider}` : ""} was confirmed. All practice exams and clinical rationales are now unlocked.`}
            {isPending &&
              `We are awaiting final confirmation from ${provider || "the payment gateway"}. Your status will switch to Active automatically as soon as it clears.`}
            {isCancel &&
              "Your checkout session was cancelled. No charges were made to your account."}
            {isFailed &&
              "The transaction could not be processed. Please check your card balance or try another payment method."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition shrink-0 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
export default SubscriptionStatusBanner;
