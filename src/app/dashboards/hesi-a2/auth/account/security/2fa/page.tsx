"use client";

import Link from "next/link";
import { useState } from "react";
import { FiLogIn, FiLock, FiArrowLeft, FiSmartphone, FiCheckCircle, FiCopy } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { start2faSetup, confirm2faSetup, disable2fa } from "@/lib/services/auth/supportService";

const CURRENT_PANEL = "hesi-a2";

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
export default function TwoFactorAuthPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading } = useCurrentSystemUser();

  // Local wizard state — step 1: generate secret/QR, step 2: confirm code
  const [step, setStep] = useState<"idle" | "setup" | "confirm">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const [secret, setSecret] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(undefined);

  const handleStartSetup = async () => {
    if (!user) {
      setMessage({ text: "You need to be signed in to manage two-factor authentication.", ok: false });
      return;
    }
    setMessage(null);
    setBusy(true);
    try {
      const result = await start2faSetup(user.guidId, user.email);
      if (result?.error) throw new Error(result.error);
      const data = result?.data as { secret: string; qrCodeUrl?: string } | undefined;
      setSecret(data?.secret ?? "");
      setQrCodeUrl(data?.qrCodeUrl);
      setStep("setup");
    } catch (err) {
      console.error("❌ [TwoFactorAuthPage] Failed to start 2FA setup:", err);
      setMessage({ text: err instanceof Error ? err.message : "Failed to start 2FA setup.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!user) {
      setMessage({ text: "You need to be signed in to manage two-factor authentication.", ok: false });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await confirm2faSetup(user.guidId, code);
      if (result?.error) throw new Error(result.error);
      setMessage({ text: result?.message ?? "Two-factor authentication enabled.", ok: true });
      setStep("idle");
      setCode("");
    } catch (err) {
      console.error("❌ [TwoFactorAuthPage] Failed to confirm 2FA:", err);
      setMessage({ text: err instanceof Error ? err.message : "Invalid code.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!user) {
      setMessage({ text: "You need to be signed in to manage two-factor authentication.", ok: false });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await disable2fa(user.guidId);
      if (result?.error) throw new Error(result.error);
      setMessage({ text: result?.message ?? "Two-factor authentication disabled.", ok: true });
    } catch (err) {
      console.error("❌ [TwoFactorAuthPage] Failed to disable 2FA:", err);
      setMessage({ text: err instanceof Error ? err.message : "Failed to disable 2FA.", ok: false });
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
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-10 bg-amber-50">
        <div className="w-full max-w-md rounded-3xl border border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl shadow-xl px-6 py-8 text-center">

          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
            <FiLock className="h-7 w-7 text-indigo-500" />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-[var(--text-color)]">
            Sign In Required
          </h2>

          {/* Message */}
          <p className="mt-2 text-sm leading-relaxed opacity-70 text-[var(--text-color)]">
            You must be logged in to access your security settings.
            Please sign in to update your password or PIN.
          </p>

          {/* Button */}
          <Link
          href={`/dashboards/${CURRENT_PANEL}/auth/login`}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:shadow-xl"
          >
            <FiLogIn className="h-4 w-4" />
            Log In to Continue
          </Link>

          {/* Small hint */}
          <p className="mt-4 text-[11px] opacity-50 text-[var(--text-color)]">
            Password and PIN settings are available only to signed-in users.
          </p>
        </div>
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
        <div className="rounded-2xl border text-center border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl px-5 py-5 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold text-[var(--text-color)] flex items-center justify-center gap-2">
              <FiSmartphone className="w-4 h-4 text-indigo-500" />
              Two-Factor Authentication
            </h1>

            <p className="text-lg text-[var(--text-color)]">
              {user.userName} ── {user.email}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-3">
          <InfoRow label="Your Two Factor Authentication Status : " value={user.twoFactorEnabled ? "Enabled" : "Disabled"} />
          <InfoRow
            label="Your Backup Codes"
            value={`${user.backupCodes?.filter((b) => !b.isUsed).length ?? 0} of ${user.backupCodes?.length ?? 0} unused`}
          />
        </div>


        {message && (
          <p className={`text-xs text-center font-semibold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {user.twoFactorEnabled ? (
          <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-3 flex flex-col items-center text-center">
            <p className="text-xs text-[var(--text-color)] opacity-70">
              Two-factor authentication is currently protecting your account.
              Disabling it will remove this extra layer of security.
            </p>

            <button
              onClick={handleDisable}
              disabled={busy}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-800 to-red-800 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {busy ? "Disabling…" : "Disable 2FA"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--text-color)] text-center bg-[var(--content-bg)] p-4 md:p-5 space-y-4 flex flex-col items-center">
            {step === "idle" && (
              <>
                <p className="text-xs text-[var(--text-color)] opacity-70">
                  Add an extra layer of security by requiring a verification code
                  from your authenticator app at login.
                </p>

                <button
                  onClick={handleStartSetup}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform"
                >
                  Click to Set Up 2FA
                </button>
              </>
            )}

            {step === "setup" && (
              <>
                <p className="text-xs text-[var(--text-color)] opacity-70">
                  Scan this into your authenticator app (Google Authenticator,
                  Authy, etc.), or enter the code manually.
                </p>

                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      qrCodeUrl.startsWith("data:")
                        ? qrCodeUrl
                        : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`
                    }
                    alt="2FA QR Code"
                    width={144}
                    height={144}
                    className="block mx-auto rounded-xl border border-[var(--text-color)]/20"
                  />
                ) : (
                  <div className="w-36 h-36 mx-auto rounded-xl border border-[var(--text-color)]/20 bg-[var(--text-color)]/5 flex items-center justify-center text-[10px] opacity-50 text-[var(--text-color)]">
                    QR Code Unavailable
                  </div>
                )}

                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-1.5 rounded-lg bg-[var(--text-color)]/10 text-xs font-mono text-[var(--text-color)]">
                    {secret}
                  </code>

                  <button
                    onClick={() => navigator.clipboard.writeText(secret)}
                    className="p-1.5 rounded-lg hover:bg-[var(--text-color)]/10 text-[var(--text-color)] opacity-60 hover:opacity-100 transition"
                    title="Copy secret"
                  >
                    <FiCopy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setStep("confirm")}
                  className="px-5 py-2 rounded-xl font-semibold text-xs bg-indigo-500 text-white hover:scale-105 transition-transform"
                >
                  I&apos;ve Added It — Continue
                </button>
              </>
            )}

            {step === "confirm" && (
              <>
                <p className="text-md text-[var(--text-color)] opacity-70">
                  Enter the 6-digit code from your authenticator app to confirm setup.
                </p>

                <input
                  type="text"
                  maxLength={88}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").trim();
                    setCode(pasted.slice(0, 88));
                  }}
                  placeholder="········"
                  className="w-200 text-center tracking-[0.5em] rounded-lg border border-[var(--text-color)]/20 bg-[var(--content-bg)] px-3 py-2 text-lg font-mono text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                />

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={busy || code.length < 4}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    {busy ? "Confirming…" : "Submit,  Confirm & Enable"}
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