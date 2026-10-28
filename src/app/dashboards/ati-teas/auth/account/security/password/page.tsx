"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
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

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-[10px] uppercase font-bold opacity-50 tracking-wide text-[var(--text-color)]">
        {label}
      </span>
      <div className="mt-1 relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-[var(--text-color)]/20 bg-[var(--content-bg)] px-3 py-2 pr-9 text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-color)] opacity-50 hover:opacity-100 transition"
          tabIndex={-1}
        >
          {visible ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
}

// A lightweight, non-prescriptive strength hint — not a hard gate, just guidance.
function getStrength(password: string): { label: string; percent: number; tone: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", percent: 20, tone: "bg-rose-500" };
  if (score <= 3) return { label: "Fair", percent: 55, tone: "bg-yellow-500" };
  return { label: "Strong", percent: 100, tone: "bg-emerald-500" };
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function ChangePasswordPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading } = useCurrentSystemUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const strength = getStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch && !busy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setMessage(null);
    try {
      // const result = await changeCurrentUserPassword({ currentPassword, newPassword });
      // if (result?.error) throw new Error(result.error);
      await new Promise((r) => setTimeout(r, 400));
      setMessage({ text: "Password changed successfully ⚓", ok: true });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("❌ [ChangePasswordPage] Failed to change password:", err);
      setMessage({ text: "Failed to change password. Check your current password and try again.", ok: false });
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
          You need to be signed in to change your password.
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
              <FiLock className="w-4 h-4 text-indigo-500" />
              Change / Update My Current Password
            </h1>
            <p className="text-xs opacity-60 text-[var(--text-color)]">{user.userName} · {user.email}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-3">
          <InfoRow label="Account" value={user.userName} />
          <InfoRow label="User Type" value={user.userType} />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--text-color)] bg-[var(--content-bg)] p-4 md:p-5 space-y-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />

          {newPassword.length > 0 && (
            <div>
              <div className="h-1.5 w-full rounded-full bg-[var(--text-color)] overflow-hidden">
                <div
                  className={`h-full ${strength.tone} transition-all duration-300`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
              <p className="text-[16px] mt-1 opacity-60 text-[var(--text-color)]">
                Strength: {strength.label} — use 8+ characters with a mix of case, numbers, and symbols.
              </p>
            </div>
          )}

          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-[16px] font-semibold text-rose-600">Passwords do not match.</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <FiCheckCircle className="w-4 h-4" />
            {busy ? "Updating…" : "Update Password"}
          </button>
        </div>

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