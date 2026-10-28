"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  FiLogIn,
  FiUserPlus,
  FiHelpCircle,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiSettings,
  FiShield,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";

import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { dynamicLogoutService } from "@/lib/services/auth/logoutService";
import { userService } from "@/lib/services/users/user/userService";
import { clearAuthSessionCookies, deleteUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";
interface UserAccountDropdownProps {
  currentDashboard?: string;
  align?: "right" | "left" | "center";
  hideAvatar?: boolean;
  customTrigger?: (props: {
    isOpen: boolean;
    toggle: () => void;
    userName: string;
    userInitial: string;
    avatarSrc: string | null;
  }) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO ROW COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  status,
  actionHref,
}: {
  label: string;
  value?: string;
  status?: boolean;
  actionHref?: string;
}) {
  return (
    <div className="group flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-all duration-200 hover:bg-white/90 dark:hover:bg-white/10">
      <span className="text-black dark:text-gray-200 font-semibold">{label}</span>

      {typeof status === "boolean" ? (
        status ? (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Verified
          </span>
        ) : actionHref ? (
          <Link
            href={actionHref}
            className="font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            title="Click to verify email"
          >
            Unverified
          </Link>
        ) : (
          <span className="font-semibold text-red-600 dark:text-red-400">
            Unverified
          </span>
        )
      ) : (
        <span className="font-medium text-gray-800 dark:text-gray-300 truncate max-w-[170px]">
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN USER ACCOUNT DROPDOWN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function UserAccountDropdown({
  currentDashboard = "rn-nursing",
  align = "right",
  hideAvatar = false,
  customTrigger,
}: UserAccountDropdownProps) {
  const { user, loading } = useCurrentSystemUser();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [logoutOptionsOpen, setLogoutOptionsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const targetDashboard = currentDashboard.toLowerCase();
  const logoutRedirect = `/dashboards/${targetDashboard}/auth/login`;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setLogoutOptionsOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setLogoutOptionsOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const VALID_DASHBOARDS = useMemo(
    () => new Set(["ati-teas", "hesi-a2", "lpn-nursing", "nclex-pn", "nclex-rn", "rn-nursing"]),
    []
  );

  const resolveLogoutRedirect = (backendRedirect?: string | null): string => {
    const cleaned = (backendRedirect || "").trim();

    if (cleaned) {
      if (cleaned === "/signin" || cleaned.startsWith("/signin?")) {
        return "/auth/login";
      }
      if (cleaned === "/login" || cleaned.startsWith("/login?")) {
        return "/auth/login";
      }
      if (cleaned === "/auth/login" || cleaned.startsWith("/auth/login?")) {
        return cleaned;
      }
      if (cleaned === "/auth/logout" || cleaned.startsWith("/auth/logout?")) {
        return cleaned;
      }
      const dashMatch = cleaned.match(/^\/dashboards\/([^/]+)\/auth\/(login|logout)/);
      if (dashMatch && VALID_DASHBOARDS.has(dashMatch[1].toLowerCase())) {
        return cleaned;
      }
    }

    if (VALID_DASHBOARDS.has(targetDashboard)) {
      return `/dashboards/${targetDashboard}/auth/login`;
    }

    return "/auth/login";
  };

  const handleLogout = async (fetchType: "distinct" | "relative") => {
    // 1. Immediately clear auth cookies, username, and local caches so UI responds instantly
    clearAuthSessionCookies();
    deleteUsernameCookie();
    if (typeof window !== "undefined") {
      try {
        sessionStorage.clear();
      } catch {}
      window.dispatchEvent(new CustomEvent("session:logout"));
    }

    try {
      const response = await dynamicLogoutService(targetDashboard, fetchType);
      const redirectTo = resolveLogoutRedirect(response?.redirect_to);

      const msg = encodeURIComponent(
        typeof response?.message === "string" && response.message.trim() !== ""
          ? response.message
          : "You’ve Been Signed Out Successfully ⚓"
      );

      const separator = redirectTo.includes("?") ? "&" : "?";
      window.location.href = `${redirectTo}${separator}msg=${msg}`;
    } catch {
      const fallbackUrl = resolveLogoutRedirect(null);
      const msg = encodeURIComponent("You’ve Been Signed Out Successfully ⚓");
      const separator = fallbackUrl.includes("?") ? "&" : "?";
      window.location.href = `${fallbackUrl}${separator}msg=${msg}`;
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await userService("Delete", {
        id: user?.id,
        guidId: user?.guidId,
        userName: user?.userName,
        email: user?.email,
      });

      if (res?.error && !res?.data && !res?.message) {
        setDeleteError(res.error);
        setIsDeleting(false);
        return;
      }

      clearAuthSessionCookies();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("session:logout"));
      }

      const msg = encodeURIComponent(
        res?.message || "Your account has been deleted and deactivated successfully ⚓"
      );
      window.location.href = `/auth/login?msg=${msg}`;
    } catch (err: unknown) {
      clearAuthSessionCookies();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("session:logout"));
      }
      const errMsg = err instanceof Error ? err.message : "Account deleted.";
      window.location.href = `/auth/login?msg=${encodeURIComponent(errMsg)}`;
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-navy/60 dark:text-white/60 animate-pulse">
        <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />
        <span>Loading...</span>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NOT LOGGED IN
  // ─────────────────────────────────────────────────────────────────────────────
  if (!user) {
    if (customTrigger) {
      return (
        <div ref={containerRef} className="relative inline-block">
          {customTrigger({
            isOpen,
            toggle: () => setIsOpen((v) => !v),
            userName: "Guest",
            userInitial: "G",
            avatarSrc: null,
          })}
          {isOpen && (
            <div
              className={`absolute mt-3 w-[260px] rounded-2xl border border-[#85AEEA] dark:border-white/20 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] shadow-2xl z-50 p-2 space-y-1 ${
                align === "left"
                  ? "left-0"
                  : align === "center"
                  ? "left-1/2 -translate-x-1/2"
                  : "right-0"
              }`}
            >
              <Link
                href={`/dashboards/${targetDashboard}/auth/login`}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <FiLogIn className="text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                <span>Login</span>
              </Link>
              <Link
                href={`/dashboards/${targetDashboard}/auth/register`}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                <FiUserPlus className="text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                <span>Create account</span>
              </Link>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="relative inline-block"
        onMouseEnter={() => {
          hoverTimeout.current = setTimeout(() => setIsOpen(true), 80);
        }}
        onMouseLeave={() => {
          if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        }}
      >
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="group relative flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white/70 dark:bg-white/10 backdrop-blur border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-lg transition-all"
        >
          <span>Login / Register</span>
        </button>

        {isOpen && (
          <div
            className={`absolute mt-3 w-[260px] rounded-2xl border border-[#85AEEA] dark:border-white/20 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] shadow-2xl z-50 p-2 space-y-1 ${
              align === "left"
                ? "left-0"
                : align === "center"
                ? "left-1/2 -translate-x-1/2"
                : "right-0"
            }`}
          >
            <Link
              href={`/dashboards/${targetDashboard}/auth/login`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <FiLogIn className="text-indigo-600 transition-transform group-hover:translate-x-0.5" />
              <span>Login</span>
            </Link>

            <Link
              href={`/dashboards/${targetDashboard}/auth/register`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <FiUserPlus className="text-emerald-600 transition-transform group-hover:translate-x-0.5" />
              <span>Create account</span>
            </Link>

            <div className="my-1 h-px bg-slate-300/80 dark:bg-white/15" />

            <Link
              href={`/dashboards/${targetDashboard}/vista/pages/support`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-navy/70 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <FiHelpCircle className="text-indigo-500" />
              <span>Help Center</span>
            </Link>

            <Link
              href={`/dashboards/${targetDashboard}/vista/pages/contact-us`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-navy/70 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <FiMail className="text-purple-500" />
              <span>Contact Support</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGGED IN
  // ─────────────────────────────────────────────────────────────────────────────
  const avatarSrc =
    !avatarBroken && user.profile?.profilePicture ? user.profile.profilePicture : null;

  const access = user.accesses?.[0];
  const primaryEmail = user.emails?.find((e) => e.isPrimary);
  const isEmailVerified = Boolean(
    primaryEmail?.isVerified ?? user.emailConfirmed ?? false
  );
  const userName = user?.userName?.trim() || "";
  const userInitial = userName ? userName[0].toUpperCase() : "?";
  const role =
    user.roles && user.roles.length > 0
      ? [...user.roles].sort((a, b) => b.rank - a.rank)[0]?.name ?? "Learner"
      : "Learner";

  const alignmentClass =
    align === "left"
      ? "left-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "right-0";

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => {
        hoverTimeout.current = setTimeout(() => setIsOpen(true), 80);
      }}
      onMouseLeave={() => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      }}
    >
      {/* Trigger Button */}
      {customTrigger ? (
        customTrigger({
          isOpen,
          toggle: () => setIsOpen((v) => !v),
          userName,
          userInitial,
          avatarSrc,
        })
      ) : (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className={`group flex items-center gap-2 rounded-full transition-all duration-300 hover:bg-white/40 dark:hover:bg-white/10 hover:shadow-lg hover:ring-1 hover:ring-emerald-300/40 ${
            hideAvatar
              ? "px-4 py-2 bg-white/30 dark:bg-white/5 border border-slate-300/60 dark:border-white/10"
              : "px-2 py-1"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {!hideAvatar && (
            <span className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-200 via-indigo-200 to-cyan-200 dark:from-emerald-900 dark:via-indigo-950 dark:to-cyan-900 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md shrink-0">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={userName}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {userInitial}
                </span>
              )}
            </span>
          )}
          <span className="text-sm font-medium transition-colors text-navy dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 max-w-[140px] truncate">
            {userName}
          </span>
          {hideAvatar && (
            <FiChevronDown
              className={`w-3.5 h-3.5 text-navy/60 dark:text-white/60 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      )}

      {/* Dropdown Card */}
      {isOpen && (
        <div
          className={`absolute mt-3 w-[340px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[#85AEEA] dark:border-white/20 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${alignmentClass}`}
        >
          {/* Header */}
          <div className="px-6 py-4 text-center border-b border-slate-300/80 dark:border-white/15">
            {!hideAvatar && (
              <div className="mx-auto mb-2 h-14 w-14 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 flex items-center justify-center shadow-inner">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={userName}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <span className="text-xl font-medium text-gray-600 dark:text-gray-200">
                    {userInitial}
                  </span>
                )}
              </div>
            )}

            <div className="font-medium text-gray-900 dark:text-white text-base">
              {userName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </div>

            <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {access?.isActive !== false ? "Active Account" : "Inactive Account"}
            </div>
          </div>

          {/* Account Information rows - always visible without expanding */}
          <div className="px-5 py-2.5 space-y-1 mx-3 my-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-[#85AEEA] dark:border-white/15 transition-all">
            <InfoRow label="Role" value={role} />
            <InfoRow
              label="Email Verification"
              status={isEmailVerified}
              actionHref={`/dashboards/${targetDashboard}/auth/account/verify/email`}
            />
          </div>

          {/* Menu Actions */}
          <div className="border-t border-slate-300/80 dark:border-white/15 px-4 py-2 space-y-1">
            <Link
              href={`/dashboards/${targetDashboard}/auth/account/show`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white transition-all hover:bg-indigo-500/10 dark:hover:bg-white/10"
            >
              <FiUser className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition" />
              <span>My profile Account</span>
            </Link>

            <Link
              href={`/dashboards/${targetDashboard}/auth/account/edit`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white transition-all hover:bg-emerald-500/10 dark:hover:bg-white/10"
            >
              <FiSettings className="text-emerald-600 dark:text-emerald-400 group-hover:rotate-6 transition" />
              <span>Update My Profile</span>
            </Link>

            {/* Logout & Delete Actions */}
            <div className="relative pt-1 space-y-2">
              {/* PRIMARY: Sign Out */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLogout("distinct")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-900/60 bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-950/60 dark:to-red-950/60 hover:from-rose-200 hover:to-red-200 dark:hover:from-rose-900 dark:hover:to-red-900 transition cursor-pointer"
                >
                  <FiLogIn className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>

                {/* Secondary Toggle (Advanced options) */}
                <button
                  type="button"
                  onClick={() => setLogoutOptionsOpen((v) => !v)}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition cursor-pointer"
                  title="Advanced account options"
                  aria-expanded={logoutOptionsOpen}
                >
                  {logoutOptionsOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>

              {/* ADVANCED DROPDOWN: Log out all devices & Delete my account */}
              {logoutOptionsOpen && (
                <div className="mt-2 w-full rounded-xl border border-[#85AEEA] dark:border-white/20 bg-white dark:bg-[#112338] shadow-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/10">
                  {/* Log out of all Devices */}
                  <button
                    type="button"
                    onClick={() => handleLogout("relative")}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  >
                    <FiShield className="text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-rose-800 dark:text-rose-300">
                        Log out of all Devices
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Sign out from all Active Sessions ⚓
                      </div>
                    </div>
                  </button>

                  {/* UNDER (Log out all devices): Delete my account btn for soft delete */}
                  <div className="bg-red-50/50 dark:bg-red-950/20">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm((v) => !v)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-red-100/70 dark:hover:bg-red-950/50 transition cursor-pointer"
                    >
                      <FiTrash2 className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-red-700 dark:text-red-400">
                          Delete my account
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Deactivate and delete account ⚓
                        </div>
                      </div>
                    </button>

                    {/* Inline Soft Delete Confirmation */}
                    {showDeleteConfirm && (
                      <div className="p-3 mx-3 mb-3 bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-start gap-2 text-xs font-semibold text-red-900 dark:text-red-200">
                          <FiAlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                          <span>
                            Are you sure you want to delete your account? This will deactivate your access.
                          </span>
                        </div>

                        {deleteError && (
                          <p className="text-[11px] text-red-700 dark:text-red-300">
                            {deleteError}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                          >
                            {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-lg transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
