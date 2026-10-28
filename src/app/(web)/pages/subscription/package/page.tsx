"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/config/config";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

type NormalizedStatus = "success" | "pending" | "cancel" | "failed" | "unknown";

function resolveProviderName(raw?: string | null): string {
  if (!raw) return "Payment Provider";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("stripe")) return "Stripe (Card)";
  if (lower.includes("mpesa") || lower.includes("m-pesa")) return "M-Pesa Express";
  if (lower.includes("paypal")) return "PayPal";
  if (lower.includes("paystack")) return "Paystack";
  if (lower.includes("intasend")) return "IntaSend";
  if (lower.includes("flutterwave")) return "Flutterwave";
  if (lower.includes("apple")) return "Apple Pay";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function SubscriptionPackageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useCurrentSystemUser();

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract all query params that providers or internal redirects supply
  const rawStatus = (searchParams.get("status") || "").toLowerCase().trim();
  const provider = searchParams.get("provider") || searchParams.get("gateway");
  const subscriptionId =
    searchParams.get("subscriptionId") ||
    searchParams.get("subId") ||
    searchParams.get("subscription_id");
  const sessionId =
    searchParams.get("session_id") ||
    searchParams.get("sessionId") ||
    searchParams.get("reference") ||
    searchParams.get("tracking_id") ||
    searchParams.get("token") ||
    searchParams.get("tx_ref");
  const planName =
    searchParams.get("plan") ||
    searchParams.get("item") ||
    searchParams.get("name") ||
    "Premium Nursing Exam Pass";
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") || "USD";
  const customMessage = searchParams.get("message");

  // Determine user's target dashboard panel
  const panel =
    searchParams.get("panel") ||
    searchParams.get("examType") ||
    user?.categories?.[0]?.dashboard ||
    "rn-nursing";

  // Normalize status
  let status: NormalizedStatus = "unknown";
  if (rawStatus === "success" || rawStatus === "completed" || rawStatus === "active" || rawStatus === "paid") {
    status = "success";
  } else if (
    rawStatus === "pending" ||
    rawStatus === "processing" ||
    rawStatus === "in_progress" ||
    rawStatus === "unpaid" ||
    rawStatus === "awaiting"
  ) {
    status = "pending";
  } else if (rawStatus === "cancel" || rawStatus === "cancelled" || rawStatus === "aborted") {
    status = "cancel";
  } else if (rawStatus === "failed" || rawStatus === "declined" || rawStatus === "error" || rawStatus === "rejected") {
    status = "failed";
  } else if (!rawStatus && sessionId) {
    // Some gateways (like Stripe Checkout default return) only pass session_id without status
    status = "success";
  }

  const referenceCode = subscriptionId || sessionId || "";

  const handleCopyReference = () => {
    if (!referenceCode) return;
    navigator.clipboard.writeText(referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const providerLabel = resolveProviderName(provider);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors"
      style={{ backgroundColor: "var(--content-bg, #0b1523)" }}
    >
      <div className="w-full max-w-xl mx-auto space-y-4">
        {/* Top return link */}
        <div className="flex items-center justify-between px-1">
          <Link
            href={`/dashboards/${panel}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {APP_NAME} Billing
          </span>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CASE 1: SUCCESS                                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {status === "success" && (
          <div className="rounded-3xl border border-emerald-500/25 bg-white dark:bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-inner mb-1 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Subscription Confirmed ✓
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                You&apos;re All Set!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you for subscribing to <strong>{APP_NAME}</strong>. Your payment was verified through{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{providerLabel}</span>. Full access
                to practice exams, Q-Banks, and clinical rationales is now unlocked.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Selected Plan</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {planName}
                </span>
              </div>

              {amount && (
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Amount Paid</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    ${amount} {currency}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payment Gateway</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{providerLabel}</span>
              </div>

              {referenceCode && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    Reference / ID
                  </span>
                  <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                    <code className="text-[11px] font-mono text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded truncate">
                      {referenceCode}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyReference}
                      className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                      title="Copy Reference ID"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Unlocked Features Perks */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                What&apos;s Now Available
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full Q-Bank &amp; Practice Exams</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Next-Gen Clinical Rationales</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Personal Coverage Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>CAT Test Mode Simulation</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                href={`/dashboards/${panel}`}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/dashboards/${panel}/exams`}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Start Practice Exam</span>
                </Link>

                <Link
                  href={`/dashboards/${panel}/vista/subscriptions/packages`}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <span>My Subscriptions</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CASE 2: PENDING                                                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {status === "pending" && (
          <div className="rounded-3xl border border-amber-500/30 bg-white dark:bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-inner mb-1 ring-8 ring-amber-500/10">
                <Clock className="w-10 h-10 stroke-[2.5] animate-pulse" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                Payment Pending Confirmation
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Processing Your Subscription
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                We are currently awaiting confirmation from{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">{providerLabel}</span>. As soon as the
                payment webhook or gateway clears, your account will be activated automatically.
              </p>
            </div>

            {/* Pending Details Card */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  Awaiting Gateway Finalization
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Provider</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{providerLabel}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Plan</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{planName}</span>
              </div>

              {referenceCode && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    Transaction Code
                  </span>
                  <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                    <code className="text-[11px] font-mono text-slate-800 dark:text-slate-200 bg-amber-500/10 px-2 py-0.5 rounded truncate">
                      {referenceCode}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyReference}
                      className="p-1 rounded-md hover:bg-amber-500/20 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                      title="Copy Transaction Reference"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Helpful Guidance Notice */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">What should I do next?</p>
                  <p className="opacity-80">
                    • <strong>M-Pesa Users:</strong> If an STK Push appeared on your handset, complete PIN entry. If prompt
                    expired, visit &quot;My Subscriptions&quot; to re-trigger.
                  </p>
                  <p className="opacity-80">
                    • <strong>Card &amp; Bank Transfers:</strong> Most bank authorizations take 30 to 90 seconds. Please do
                    not initiate a duplicate charge while this is pending.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.01] cursor-pointer disabled:opacity-75"
              >
                <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Checking Status…" : "Check Status Now"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/dashboards/${panel}/vista/subscriptions/packages`}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <span>My Subscriptions</span>
                </Link>

                <Link
                  href={`/dashboards/${panel}`}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <span>Return to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CASE 3: CANCEL / CANCELLED                                          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {status === "cancel" && (
          <div className="rounded-3xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-slate-500/15 text-slate-600 dark:text-slate-300 shadow-inner mb-1 ring-8 ring-slate-500/10">
                <AlertTriangle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                Checkout Cancelled
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Subscription Not Completed
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                You cancelled the checkout session before finalizing. <strong>No charge was made</strong> to your
                card, M-Pesa, or payment account.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 text-center">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Need more time to choose?</p>
              <p className="opacity-80">
                You can review our 30-day, 3-month, and 6-month study packages anytime without losing your saved practice
                progress.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href={`/dashboards/${panel}/vista/subscriptions/items`}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <span>Browse &amp; Select a Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>

                <Link
                  href={`/dashboards/${panel}`}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <span>Back to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CASE 4: FAILED / DECLINED                                           */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {status === "failed" && (
          <div className="rounded-3xl border border-rose-500/30 bg-white dark:bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-inner mb-1 ring-8 ring-rose-500/10">
                <XCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                Payment Declined ✕
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Payment Could Not Be Completed
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                {customMessage ||
                  `The transaction could not be authorized by ${providerLabel}. No charge was successfully completed.`}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-rose-700 dark:text-rose-400">Common reasons for payment issues:</p>
              <ul className="list-disc pl-4 space-y-1 opacity-80 text-[11px]">
                <li>Insufficient available balance in your account or card limit reached.</li>
                <li>Incorrect billing zip code, CVV, or card expiration date.</li>
                <li>M-Pesa PIN timeout or SIM toolkit cancel.</li>
                <li>Your bank blocked online international or education transactions.</li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href={`/dashboards/${panel}/vista/subscriptions/items`}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Another Payment Method</span>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/dashboards/${panel}`}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <span>Back to Dashboard</span>
                </Link>

                <Link
                  href="/auth/support"
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <span>Contact Support</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CASE 5: UNKNOWN / DIRECT PLAN DETAILS                               */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {status === "unknown" && (
          <div className="rounded-3xl border border-indigo-500/25 bg-white dark:bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-inner mb-1 ring-8 ring-indigo-500/10">
                <Sparkles className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                Subscription Information
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {planName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Unlock full access to {APP_NAME}&apos;s nursing practice exams, Next-Gen rationales, and real-time coverage analytics.
              </p>
            </div>

            {amount && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Price</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  ${amount} {currency}
                </span>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <Link
                href={`/dashboards/${panel}/vista/subscriptions/items`}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`/dashboards/${panel}/vista/subscriptions/packages`}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>View Existing Subscriptions</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SubscriptionPackageCallbackPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center px-4 py-16"
          style={{ backgroundColor: "var(--content-bg, #0b1523)" }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3 shadow-xl">
            <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Loading subscription status…
            </p>
          </div>
        </main>
      }
    >
      <SubscriptionPackageContent />
    </Suspense>
  );
}