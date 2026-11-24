"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const FIRST_DELAY_MS = 1500;
const REMINDER_DELAY_MS = 5 * 60 * 1000;

type Tone = "blue" | "amber" | "emerald" | "violet";

const TONES: Record<Tone, { pill: string; icon: string; btn: string; ring: string }> = {
  blue: {
    pill: "border-blue-200 bg-blue-50 text-blue-700",
    icon: "bg-blue-100 text-blue-600",
    btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30",
    ring: "ring-blue-200",
  },
  amber: {
    pill: "border-amber-200 bg-amber-50 text-amber-700",
    icon: "bg-amber-100 text-amber-600",
    btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30",
    ring: "ring-amber-200",
  },
  emerald: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-100 text-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30",
    ring: "ring-emerald-200",
  },
  violet: {
    pill: "border-violet-200 bg-violet-50 text-violet-700",
    icon: "bg-violet-100 text-violet-600",
    btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-600/30",
    ring: "ring-violet-200",
  },
};

const STEPS = ["Log in", "Verify email", "Subscribe"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-5 flex items-center gap-2" aria-label="Access steps">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${done
                ? "bg-emerald-500 text-white"
                : current
                  ? "bg-slate-900 text-white ring-4 ring-slate-200"
                  : "bg-slate-100 text-slate-400"
                }`}
            >
              {done ? "✓" : n}
            </span>
            <span
              className={`hidden whitespace-nowrap text-[11px] font-semibold sm:inline ${current ? "text-slate-900" : "text-slate-400"
                }`}
            >
              {label}
            </span>
            {n < STEPS.length && (
              <span className={`h-px flex-1 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ReminderModal({
  isOpen,
  onClose,
  badge,
  title,
  description,
  secondaryLabel,
  primaryLabel,
  primaryHref,
  step,
  icon = "🔒",
  tone = "blue",
  points,
  blocking = false,
  locked = false,
  onPrimary,
  tertiaryLabel,
  tertiaryHref,
}: {
  isOpen: boolean;
  onClose: () => void;
  badge: string;
  title: string;
  description: string;
  secondaryLabel: string;
  primaryLabel: string;
  primaryHref: string;
  /** Hard lock: no X, no Esc, no backdrop click, no secondary button. */
  locked?: boolean;
  /** 1 = log in 2 = verify email, 3 = subscribe. Omit to hide the stepper. */
  step?: number;
  icon?: string;
  tone?: Tone;
  points?: string[];
  /** When true, clicking the backdrop does nothing (Esc / X / secondary still call onClose). */
  blocking?: boolean;
  /** Runs when the primary link is clicked. Defaults to onClose. */
  onPrimary?: () => void;
  /** Optional extra link shown under the primary button. */
  tertiaryLabel?: string;
  tertiaryHref?: string;
}) {
  const t = TONES[tone];

  useEffect(() => {
    if (!isOpen || locked) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, locked]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      onClick={blocking || locked ? undefined : onClose}
    >
      <style>{`
        @keyframes arm-pop { from { opacity: 0; transform: translateY(12px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes arm-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "arm-pop .28s cubic-bezier(.2,.8,.2,1)" }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-40 blur-3xl ${t.icon}`} />

        {!locked && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        )}

        {/* Badge: one row, bordered */}
        <div className="relative mb-4 flex items-center gap-3 pr-8">
          <span
            className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${t.pill}`}
          >
            {badge}
          </span>
        </div>

        {typeof step === "number" && <Stepper step={step} />}

        <div className="relative flex items-start gap-4">
          <div
            style={{ animation: "arm-float 3s ease-in-out infinite" }}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ring-4 ${t.icon} ${t.ring}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-snug text-slate-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>

        {points && points.length > 0 && (
          <ul className="relative mt-4 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-600">
                  ✓
                </span>
                <span className="min-w-0 truncate">{p}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="relative mt-6 flex flex-col gap-2.5">
          <Link
            href={primaryHref}
            onClick={onPrimary ?? onClose}
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${t.btn}`}
          >
            {primaryLabel}
          </Link>
          {tertiaryLabel && tertiaryHref && (
            <Link
              href={tertiaryHref}
              className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 px-4 py-3 text-center text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100"
            >
              {tertiaryLabel}
            </Link>
          )}
          {!locked && secondaryLabel && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function GuestReminderModal({
  isOpen,
  onClose,
  loginHref,
  panelName,
  badge,
}: {
  isOpen: boolean;
  onClose: () => void;
  loginHref: string;
  panelName: string;
  badge: string;
}) {
  return (
    <ReminderModal
      isOpen={isOpen}
      onClose={onClose}
      badge={badge}
      title={`You're Viewing ${panelName} as a Guest`}
      description="Log in to unlock all advanced features — track your progress, save results and access your full subscription. You can also keep browsing as a guest."
      secondaryLabel="Continue as Guest"
      primaryLabel="Log In Now"
      primaryHref={loginHref}
    />
  );
}

// Guest (not logged in) → login reminder. Logged in but no active sub → subscription reminder.
// Each re-appears every 5 min after dismiss. Never both at once.
export function useAccessReminders({
  isUserLoading,
  isLoggedIn,
  hasActiveSubscription,
}: {
  isUserLoading: boolean;
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
}) {
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestDismissCount, setGuestDismissCount] = useState(0);
  const [subOpen, setSubOpen] = useState(false);
  const [subDismissCount, setSubDismissCount] = useState(0);

  useEffect(() => {
    if (isUserLoading) return;
    if (isLoggedIn) {
      setGuestOpen(false);
      return;
    }
    if (guestOpen) return;

    const timer = setTimeout(
      () => setGuestOpen(true),
      guestDismissCount === 0 ? FIRST_DELAY_MS : REMINDER_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [isUserLoading, isLoggedIn, guestOpen, guestDismissCount]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isLoggedIn || hasActiveSubscription) {
      setSubOpen(false);
      return;
    }
    if (subOpen) return;

    // First delay is longer so subscription data has time to load before we alert
    const timer = setTimeout(
      () => setSubOpen(true),
      subDismissCount === 0 ? 3000 : REMINDER_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [isUserLoading, isLoggedIn, hasActiveSubscription, subOpen, subDismissCount]);

  return {
    guestOpen: guestOpen && !isLoggedIn,
    closeGuest: () => {
      setGuestOpen(false);
      setGuestDismissCount((c) => c + 1);
    },
    subOpen: subOpen && isLoggedIn && !hasActiveSubscription,
    closeSub: () => {
      setSubOpen(false);
      setSubDismissCount((c) => c + 1);
    },
  };
}




export interface OtherSubscription {
  name: string; // program the user is subscribed to
  href: string; // that program's dashboard
}

// Flow: guest → login | unverified email → verify | no sub here → (other program? go there : subscribe) | all good → full access.
// Closing a login / verify modal sends the user back to the home page.
export function AccessGate({
  isUserLoading,
  isLoggedIn,
  isEmailVerified,
  hasActiveSubscription,
  otherSubscriptions,
  panelName,
  badge,
  loginHref,
  verifyHref,
  packagesHref,
  homeHref = "/",
  lock = true,
}: {
  isUserLoading: boolean;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  hasActiveSubscription: boolean;
  otherSubscriptions: OtherSubscription[];
  panelName: string;
  badge: string;
  loginHref: string;
  verifyHref: string;
  packagesHref: string;
  homeHref?: string;
  /** After login: force verify email, then subscription. */
  lock?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const goHome = () => router.replace(homeHref);
  const verifyPath = verifyHref.split("?")[0];
  const packagesPath = packagesHref.split("?")[0].replace(/\/[^/]+$/, "");
  const onVerifyPage = pathname.startsWith(verifyPath);
  const onPackagesPage = pathname.startsWith(packagesPath);

  // Subscription data loads after the user does, so wait a moment before judging it
  const [subReady, setSubReady] = useState(false);
  const [subHidden, setSubHidden] = useState(false);

  const passedAuth = !isUserLoading && isLoggedIn && isEmailVerified;

  useEffect(() => {
    if (!passedAuth) {
      setSubReady(false);
      return;
    }
    const t = setTimeout(() => setSubReady(true), 3000);
    return () => clearTimeout(t);
  }, [passedAuth]);

  // After "stay here" / "limited access", remind again in 5 minutes
  useEffect(() => {
    if (!subHidden) return;
    const t = setTimeout(() => setSubHidden(false), REMINDER_DELAY_MS);
    return () => clearTimeout(t);
  }, [subHidden]);

  // Locked: unverified users get pushed back to verify on every route change
  useEffect(() => {
    if (lock && !isUserLoading && isLoggedIn && !isEmailVerified && !onVerifyPage) {
      router.replace(verifyHref);
    }
  }, [lock, isUserLoading, isLoggedIn, isEmailVerified, onVerifyPage, verifyHref, router, pathname]);

  if (isUserLoading) return null;

  // 1. Not logged in
  if (!isLoggedIn) {
    return (
      <ReminderModal
        isOpen
        blocking
        step={1}
        icon="🔐"
        tone="blue"
        badge={badge}
        title={`Log in to Access ${panelName}`}
        description="You need an account to practice, track your progress and keep your results. Log in to continue, or head back to the home page."
        points={["Track your progress", "Save your exam results", "Unlock your subscription"]}
        primaryLabel="Log In Now"
        primaryHref={loginHref}
        secondaryLabel="Back to Home"
        onClose={goHome}
        onPrimary={() => { }}
      />
    );
  }

  // 2. Email not verified
  if (!isEmailVerified) {
    if (onVerifyPage) return null;
    return (
      <ReminderModal
        isOpen
        blocking
        locked={lock}
        step={2}
        icon="✉️"
        tone="amber"
        badge={badge}
        title="Verify your email to continue"
        description="We sent a verification link to your email. Confirm it to protect your account and unlock your dashboard."
        points={["Check your inbox and spam folder", "Click the verification link", "Come back and refresh this page"]}
        primaryLabel="Verify My Email"
        primaryHref={verifyHref}
        secondaryLabel="Back to Home"
        onClose={goHome}
        onPrimary={() => { }}
      />
    );
  }

  // 3. Subscription checks
  if (!subReady || hasActiveSubscription || onPackagesPage) return null;
  if (!lock && subHidden) return null;

  // 3a. Subscribed, but to a different program
  if (otherSubscriptions.length > 0) {
    const first = otherSubscriptions[0];
    return (
      <ReminderModal
        isOpen
        locked={lock}
        step={3}
        icon="🧭"
        tone="violet"
        badge={badge}
        title={`You're Subscribed To ${first.name}`}
        description={`Your active plan doesn't include ${panelName}. Continue to the dashboard you're subscribed to, or add ${panelName} (and other programs like RN Nursing, HESI A2, NCLEX) with one of our easy plans.`}
        points={otherSubscriptions.map((s) => `✓ Subscribed: ${s.name}`)}
        primaryLabel={`Take me to ${first.name}`}
        primaryHref={first.href}
        tertiaryLabel={`🚀 Open our easy plans for ${panelName}`}
        tertiaryHref={packagesHref}
        secondaryLabel={`Stay in ${panelName}`}
        onClose={() => setSubHidden(true)}
        onPrimary={() => { }}
      />
    );
  }

  // 3b. No subscription at all
  return (
    <ReminderModal
      isOpen
      locked={lock}
      step={3}
      icon="⭐"
      tone="emerald"
      badge={badge}
      title={`Unlock full access to ${panelName}`}
      description="You don't have an active subscription yet. Subscribe for full exams, detailed explanations and progress tracking, or continue with limited access."
      points={["Full exam library", "Detailed explanations", "Progress tracking"]}
      primaryLabel="View Subscription Packages"
      primaryHref={packagesHref}
      secondaryLabel="Continue with Limited Access"
      onClose={() => setSubHidden(true)}
      onPrimary={() => { }}
    />
  );
}


