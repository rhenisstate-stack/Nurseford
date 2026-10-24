"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiSmartphone, FiCheckCircle, FiCopy } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";

const CURRENT_PANEL = "ati-teas";

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

  // ⚠️ ASSUMPTION: your backend will return a QR code image URL / otpauth secret here.
  const [mockSecret] = useState("JBSWY3DPEHPK3PXP");

  const handleStartSetup = () => {
    setMessage(null);
    setStep("setup");
  };

  const handleConfirm = async () => {
    setBusy(true);
    setMessage(null);
    try {
      // const result = await confirm2faSetup(code);
      // if (result?.error) throw new Error(result.error);
      await new Promise((r) => setTimeout(r, 400)); // simulated latency
      setMessage({ text: "Two-factor authentication enabled ⚓", ok: true });
      setStep("idle");
      setCode("");
    } catch (err) {
      console.error("❌ [TwoFactorAuthPage] Failed to confirm 2FA:", err);
      setMessage({ text: "Invalid code. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      // const result = await disable2fa();
      // if (result?.error) throw new Error(result.error);
      await new Promise((r) => setTimeout(r, 400));
      setMessage({ text: "Two-factor authentication disabled.", ok: true });
    } catch (err) {
      console.error("❌ [TwoFactorAuthPage] Failed to disable 2FA:", err);
      setMessage({ text: "Failed to disable 2FA. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main
        className="pt-14 flex items-center justify-center"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}
      >
        <p className="text-sm font-bold opacity-60 text-[var(--text-color)]">Loading . . . ⚓</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="pt-14 flex flex-col items-center justify-center gap-4 text-center px-4"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}
      >
        <p className="text-sm font-bold opacity-70 text-[var(--text-color)]">
          You need to be signed in to manage two-factor authentication.
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
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 md:p-4 space-y-5 w-full max-w-2xl mx-auto">

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
              <FiSmartphone className="w-4 h-4 text-indigo-500" />
              Two-Factor Authentication
            </h1>
            <p className="text-lg text-[var(--text-color)]">{user.userName} · {user.email}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-3">
          <InfoRow label="Status" value={user.twoFactorEnabled ? "Enabled" : "Disabled"} />
          <InfoRow
            label="Backup Codes"
            value={`${user.backupCodes?.filter((b) => !b.isUsed).length ?? 0} of ${user.backupCodes?.length ?? 0} unused`}
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {user.twoFactorEnabled ? (
          <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-3">
            <p className="text-xs text-[var(--text-color)] opacity-70">
              Two-factor authentication is currently protecting your account. Disabling it will remove this extra layer of security.
            </p>
            <button
              onClick={handleDisable}
              disabled={busy}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {busy ? "Disabling…" : "Disable 2FA"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-4">
            {step === "idle" && (
              <>
                <p className="text-xs text-[var(--text-color)] opacity-70">
                  Add an extra layer of security by requiring a verification code from your authenticator app at login.
                </p>
                <button
                  onClick={handleStartSetup}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform"
                >
                  Set Up 2FA
                </button>
              </>
            )}

            {step === "setup" && (
              <>
                <p className="text-xs text-[var(--text-color)] opacity-70">
                  Scan this into your authenticator app (Google Authenticator, Authy, etc.), or enter the code manually.
                </p>
                {/* ⚠️ ASSUMPTION: real QR image would come from backend; placeholder shown here */}
                <div className="w-36 h-36 rounded-xl border border-[var(--text-color)]/20 bg-[var(--text-color)]/5 flex items-center justify-center text-[10px] opacity-50 text-[var(--text-color)]">
                  QR Code Placeholder
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1.5 rounded-lg bg-[var(--text-color)]/10 text-xs font-mono text-[var(--text-color)]">
                    {mockSecret}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(mockSecret)}
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
                <p className="text-xs text-[var(--text-color)] opacity-70">
                  Enter the 6-digit code from your authenticator app to confirm setup.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-40 text-center tracking-[0.5em] rounded-lg border border-[var(--text-color)]/20 bg-[var(--content-bg)] px-3 py-2 text-lg font-mono text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={busy || code.length !== 6}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    {busy ? "Confirming…" : "Confirm & Enable"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {message && (
          <p className={`text-xs font-semibold ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────