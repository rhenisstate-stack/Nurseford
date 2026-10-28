"use client";

import Link from "next/link";
import React from "react";
import { FiEdit2, FiLock, FiUser } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface UserProfileShowProps {
  currentDashboard?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────
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
    <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--text-color)] opacity-70">{icon}</span>
        <h2 className="text-sm font-bold text-[var(--text-color)]">{title}</h2>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Row({
  label,
  value,
  badge,
  actionHref,
}: {
  label: string;
  value?: string | number | null;
  badge?: { text: string; tone: "good" | "bad" | "neutral" };
  actionHref?: string;
}) {
  const toneClasses = {
    good: "bg-emerald-300 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100",
    bad: "bg-rose-300 text-rose-900 dark:bg-rose-900 dark:text-rose-100",
    neutral: "bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-gray-100",
  };

  return (
    <div className="flex items-center justify-between text-xs py-1.5 px-1 rounded-lg hover:bg-[var(--text-color)]/5 transition-colors">
      <span className="opacity-60 text-[var(--text-color)]">{label}</span>
      {badge ? (
        actionHref && badge.tone === "bad" ? (
          <Link
            href={actionHref}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold hover:underline cursor-pointer ${toneClasses[badge.tone]}`}
            title="Click to verify email"
          >
            {badge.text}
          </Link>
        ) : (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${toneClasses[badge.tone]}`}
          >
            {badge.text}
          </span>
        )
      ) : (
        <span className="font-medium text-[var(--text-color)] truncate max-w-[60%] text-right">
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROFILE SHOW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function UserProfileShow({
  currentDashboard = "rn-nursing",
}: UserProfileShowProps) {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading } = useCurrentSystemUser();
  const panel = currentDashboard.toLowerCase();

  if (loading) {
    return (
      <main
        className="pt-14 flex items-center justify-center"
        style={{
          marginLeft: leftWidth,
          marginRight: rightWidth,
          minHeight: `calc(100vh - ${navHeight}px)`,
        }}
      >
        <p className="text-sm font-bold opacity-60 text-[var(--text-color)]">
          Loading profile . . . ⚓
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="pt-14 flex flex-col items-center justify-center gap-4 text-center px-4"
        style={{
          marginLeft: leftWidth,
          marginRight: rightWidth,
          minHeight: `calc(100vh - ${navHeight}px)`,
        }}
      >
        <p className="text-sm font-bold opacity-70 text-[var(--text-color)]">
          You need to be signed in to view this profile.
        </p>
        <Link
          href={`/dashboards/${panel}/auth/login`}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:scale-105 transition-transform"
        >
          Log In
        </Link>
      </main>
    );
  }

  const access = user.accesses?.[0];
  const primaryEmail = user.emails?.find((e) => e.isPrimary);
  const isEmailVerified = Boolean(
    primaryEmail?.isVerified ?? user.emailConfirmed ?? false
  );
  const topRole = user.roles?.length
    ? [...user.roles].sort((a, b) => b.rank - a.rank)[0]?.name ?? "Learner"
    : "Learner";

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
        {/* Header card */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-emerald-500/10 via-indigo-500/10 to-cyan-500/10 backdrop-blur-xl px-5 py-6 md:px-8 md:py-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl md:text-2xl font-medium text-[var(--text-color)]">
              {user.userName}
            </h1>
            <p className="text-xs md:text-sm opacity-60 text-[var(--text-color)]">
              {user.email}
            </p>

            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  access?.isActive !== false
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-rose-500/15 text-rose-600"
                }`}
              >
                {access?.isActive !== false ? "Active Account" : "Inactive Account"}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600">
                {topRole}
              </span>
              {user.userType && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/15 text-gray-500">
                  {user.userType}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center sm:items-end gap-3">
            <Link
              href={`/dashboards/${panel}/auth/account/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm bg-gradient-to-r from-green-700 to-pink-800 text-white shadow-md hover:scale-105 transition-transform"
            >
              <FiEdit2 className="w-4 h-4" />
              Edit My Profile
            </Link>

            <Link
              href={`/dashboards/${panel}/auth/account/security/password`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm bg-gradient-to-r from-indigo-500 to-purple-900 text-white shadow-md hover:scale-105 transition-transform"
            >
              <FiLock className="w-4 h-4" />
              Update / Change My Password
            </Link>
          </div>
        </div>

        {/* Content Section: ONLY Account card is shown, with Email Verified inside */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Account" icon={<FiUser className="w-4 h-4" />}>
            <Row label="Username" value={user.userName} />
            <Row
              label="Email Verified"
              badge={{
                text: isEmailVerified ? "Verified" : "Unverified",
                tone: isEmailVerified ? "good" : "bad",
              }}
              actionHref={`/dashboards/${panel}/auth/account/verify/email`}
            />
            <Row label="User Type" value={user.userType} />
            <Row label="Created" value={user.createdAt} />
            <Row label="Updated" value={user.updatedAt ?? "Never"} />
            <Row label="Deleted" value={user.deletedAt ?? "Not deleted"} />
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
