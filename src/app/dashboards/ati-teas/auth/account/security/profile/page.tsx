// src/app/dashboards/ati-teas/auth/account/security/page.tsx
"use client";

import Link from "next/link";
import {
  FiArrowLeft,
  FiShield,
  FiMail,
  FiLock,
  FiKey,
  FiSmartphone,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";

const CURRENT_PANEL = "ati-teas";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--text-color)] opacity-70">{icon}</span>
        <h2 className="text-sm font-bold text-[var(--text-color)]">{title}</h2>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function StatusRow({
  label,
  description,
  ok,
  actionHref,
  actionLabel,
  neutral = false,
}: {
  label: string;
  description?: string;
  ok: boolean;
  actionHref?: string;
  actionLabel?: string;
  neutral?: boolean;
}) {
  const tone = neutral
    ? "bg-gray-500/15 text-gray-500"
    : ok
      ? "bg-emerald-200 text-emerald-800"
      : "bg-rose-200 text-rose-800";

  return (
    <div className="flex items-center justify-between gap-3 text-xs py-2 px-1 rounded-lg hover:bg-[var(--text-color)]/5 transition-colors">
      <div className="min-w-0">
        <p className="font-semibold text-[var(--text-color)]">{label}</p>
        {description && (
          <p className="text-[10px] opacity-50 text-[var(--text-color)] truncate">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tone}`}>
          {neutral ? label : ok ? "Enabled" : "Disabled"}
        </span>
        {!ok && !neutral && actionHref && (
          <Link
            href={actionHref}
            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
          >
            {actionLabel ?? "Fix"}
          </Link>
        )}
      </div>
    </div>
  );
}

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
export default function AccountSecurityPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading } = useCurrentSystemUser();

  if (loading) {
    return (
      <main
        className="pt-14 flex items-center justify-center"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}
      >
        <p className="text-sm font-bold opacity-60 text-[var(--text-color)]">Loading security details . . . ⚓</p>
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
          You need to be signed in to view your security settings.
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

  const access = user.accesses?.[0];
  const primaryEmail = user.emails?.find((e) => e.isPrimary);
  const primaryPhone = user.phones?.find((p) => p.isPrimary);
  const unusedBackupCodes = user.backupCodes?.filter((b) => !b.isUsed).length ?? 0;
  const totalBackupCodes = user.backupCodes?.length ?? 0;

  // A rough "security score" out of the checks we actually have data for — purely illustrative.
  const checks = [
    !!primaryEmail?.isVerified,
    !!primaryPhone?.isVerified,
    user.twoFactorEnabled,
    !access?.isLocked,
  ];
  const scorePercent = Math.round((checks.filter(Boolean).length / checks.length) * 100);

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
      <div className="p-3 md:p-4 space-y-5 w-full max-w-7xl mx-auto">

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboards/${CURRENT_PANEL}/auth/account/show`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-60 hover:opacity-100 text-[var(--text-color)] transition-opacity"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Header + security score */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl px-5 py-6 flex flex-col sm:flex-row items-center gap-5">

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-lg md:text-xl font-bold text-[var(--text-color)] flex items-center justify-center sm:justify-start gap-2">
              <FiShield className="w-5 h-5 text-indigo-500" />
              Security &amp; Account
            </h1>
            <p className="text-lg text-[var(--text-color)]">
              {user.userName} · {user.email}
            </p>

            <Link
              href={`/dashboards/${CURRENT_PANEL}/auth/account/security/password`}
              className="inline-flex items-center gap-1.5 px-3 py-2 mt-3 rounded-lg font-semibold text-[11px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:scale-105 transition-transform whitespace-nowrap"
            >
              <FiLock className="w-3.5 h-3.5" />
              Update / Change My Password
            </Link>

          </div>

          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-14 h-14 rounded-full border flex items-center justify-center text-sm font-bold ${scorePercent >= 75
                  ? "bg-emerald-200 text-emerald-900"
                  : scorePercent >= 50
                    ? "bg-yellow-100 text-red-800"
                    : "bg-rose-100 text-rose-800"
                }`}
            >
              {scorePercent}%
            </div>

            <span className="text-lg uppercase font-bold text-[var(--text-color)] mt-1 tracking-wide">
              Security Score
            </span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <SectionCard title="Verification" icon={<FiCheckCircle className="w-4 h-4" />}>
            <StatusRow
              label="Email Verified"
              description={primaryEmail?.email ?? user.email}
              ok={!!primaryEmail?.isVerified}
              actionHref="/dashboards/ati-teas/auth/account/verify/email"
              actionLabel="Verify email"
            />
            <StatusRow
              label="Phone Verified"
              description={primaryPhone?.phoneNumber ?? user.phoneNumber ?? "No phone on file"}
              ok={!!primaryPhone?.isVerified}
              actionHref="/dashboards/ati-teas/auth/account/verify/phone"
              actionLabel="Verify phone"
            />
          </SectionCard>

          <SectionCard title="Two-Factor Authentication" icon={<FiSmartphone className="w-4 h-4" />}>
            <StatusRow
              label="2FA"
              description="Extra verification step at login"
              ok={user.twoFactorEnabled}
              actionHref="/dashboards/ati-teas/auth/account/security/2fa"
              actionLabel="Enable 2FA"
            />
            <InfoRow
              label="Backup Codes"
              value={totalBackupCodes > 0 ? `${unusedBackupCodes} of ${totalBackupCodes} unused` : "None generated"}
            />
          </SectionCard>

          <SectionCard title="Account Access" icon={<FiLock className="w-4 h-4" />}>
            <StatusRow
              label="Account Active"
              ok={!!access?.isActive}
              neutral={false}
            />
            <StatusRow
              label="Account Locked"
              description={access?.isLocked ? "Your account is currently locked" : "No active lockout"}
              ok={!access?.isLocked}
            />
            <InfoRow label="Lockout Enabled" value={user.lockoutEnabled ? "Yes" : "No"} />
            <InfoRow label="Lockout Ends" value={user.lockoutEnd ?? "Not locked out"} />
            <InfoRow label="Two-Factor Expiry" value={access?.twoFactorExpiry ?? "—"} />
          </SectionCard>

          <SectionCard title="Contact on File" icon={<FiMail className="w-4 h-4" />}>
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phoneNumber ?? "—"} />
            <InfoRow label="User Type" value={user.userType} />
          </SectionCard>

          <SectionCard title="Roles" icon={<FiShield className="w-4 h-4" />}>
            {user.roles?.length ? (
              user.roles.map((r) => (
                <InfoRow key={r.id} label={r.name ?? "Unnamed Role"} value={`Rank ${r.rank} · ${r.status ?? "—"}`} />
              ))
            ) : (
              <p className="text-xs opacity-50 text-[var(--text-color)]">No roles assigned.</p>
            )}
          </SectionCard>

          <SectionCard title="Grants" icon={<FiKey className="w-4 h-4" />}>
            {user.grants?.length ? (
              user.grants.map((g) => (
                <InfoRow key={g.id} label={g.name ?? "Unnamed Grant"} value={g.status ?? "—"} />
              ))
            ) : (
              <p className="text-xs opacity-50 text-[var(--text-color)]">No grants assigned.</p>
            )}
          </SectionCard>

          <SectionCard title="Account Timeline" icon={<FiAlertTriangle className="w-4 h-4" />}>
            <InfoRow label="Created" value={user.createdAt} />
            <InfoRow label="Last Updated" value={user.updatedAt ?? "Never"} />
            <InfoRow label="Deleted" value={user.deletedAt ?? "Not deleted"} />
          </SectionCard>

        </div>
      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────