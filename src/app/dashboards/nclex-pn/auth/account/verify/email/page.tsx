"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiMail, FiCheckCircle } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { sendEmailVerificationCode, confirmEmailVerificationCode } from "@/lib/services/auth/supportService";

const CURRENT_PANEL = "nclex-pn";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 px-1 rounded-lg hover:bg-[var(--text-color)]/5 transition-colors">
      <span className="opacity-60 text-[var(--text-color)]">{label}</span>
      <span className="font-medium text-[var(--text-color)] truncate max-w-[60%] text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading } = useCurrentSystemUser();

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const [resendCooldown, setResendCooldown] = useState(0);

  const primaryEmail = user?.emails?.find((e) => e.isPrimary);
  const alreadyVerified = !!primaryEmail?.isVerified;

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };


  const handleSendCode = async () => {
    if (!user) {
      setMessage({ text: "You need to be signed in to verify your email.", ok: false });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await sendEmailVerificationCode(user.guidId, user.email);
      if (result?.error) throw new Error(result.error);
      setCodeSent(true);
      setMessage({ text: result?.message ?? "Verification code sent.", ok: true });
      startResendCooldown();
    } catch (err) {
      console.error("❌ [VerifyEmailPage] Failed to send code:", err);
      setMessage({ text: err instanceof Error ? err.message : "Failed to send verification code.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!user) {
      setMessage({ text: "You need to be signed in to verify your email.", ok: false });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await confirmEmailVerificationCode(user.guidId, user.email, code);
      if (result?.error) throw new Error(result.error);
      setMessage({ text: result?.message ?? "Email verified successfully.", ok: true });
    } catch (err) {
      console.error("❌ [VerifyEmailPage] Failed to confirm code:", err);
      setMessage({ text: err instanceof Error ? err.message : "Invalid or expired code.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main
        className="pt-16 flex items-center justify-center"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}
      >
        <p className="text-sm font-bold opacity-60 text-[var(--text-color)]">Loading . . . ⚓</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="pt-16 flex flex-col items-center justify-center gap-4 text-center px-4"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}
      >
        <p className="text-sm font-bold opacity-70 text-[var(--text-color)]">
          You need to be signed in to verify your email.
        </p>
        <Link
          href={`/dashboards/${CURRENT_PANEL}/auth/login`}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:scale-105 transition-transform"
        >
          Log In
        </Link>
      </main>
    );
  }

  return (
    <main
      className="pt-16 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 md:p-4 space-y-5 w-full max-w-5xl mx-auto">

        <Link
          href={`/dashboards/${CURRENT_PANEL}/auth/account/security/profile`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-100 text-[var(--text-color)] transition-opacity"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back to My Security Profile
        </Link>

        {/* Current user info */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl px-5 py-5 flex items-center gap-4">

          <div>
            <h1 className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
              <FiMail className="w-4 h-4 text-indigo-500" />
              Verify Email
            </h1>
            <p className="text-lg text-[var(--text-color)]">{user.userName} · {user.email}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-3">
          <InfoRow label="Email on File" value={primaryEmail?.email ?? user.email} />
          <InfoRow label="Status" value={alreadyVerified ? "Verified" : "Not Verified"} />
        </div>

        {message && (
          <p className={`text-md text-center font-semibold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {alreadyVerified ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 md:p-5 flex flex-col items-center justify-center gap-3 text-center">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-[var(--text-color)] opacity-80">
              Your email address is already verified — no further action needed.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-4 flex flex-col items-center text-center">
            {!codeSent ? (
              <>
                <p className="text-xs text-[var(--text-color)] opacity-70">
                  We&apos;ll send a verification code to <strong>{user.email}</strong>.
                </p>

                <button
                  onClick={handleSendCode}
                  disabled={busy}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {busy ? "Sending…" : "Send Verification Code"}
                </button>
              </>
            ) : (
              <>
                <p className="text-md text-[var(--text-color)] opacity-70">
                  Enter the code sent to your email address.
                </p>

                <input
                  type="text"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault()
                    const pasted = e.clipboardData.getData("text").trim()
                    setCode(pasted.slice(0, 8))
                  }}
                  placeholder="········"
                  className="w-90 text-center tracking-[0.5em] rounded-lg border border-[var(--text-color)] bg-[var(--content-bg)] px-3 py-2 text-lg font-mono text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                />

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={busy || code.length < 4}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    {busy ? "Verifying…" : "Submit & Confirm Code"}
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={busy || resendCooldown > 0}
                    className="px-4 py-2.5 rounded-xl font-semibold text-xs text-[var(--text-color)] border p-2
                    opacity-60 hover:opacity-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}


      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────