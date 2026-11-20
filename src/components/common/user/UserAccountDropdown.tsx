"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
import { destroyAccountService } from "@/lib/services/auth/destroyService";
import VerifyEmailModal from "@/components/common/modals/VerifyEmailModal";
import DeleteAccountModal from "@/components/common/modals/DeleteAccountModal";
import { isPrimaryEmailUnverified } from "@/lib/utils/users/isPrimaryEmailUnverified";
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
    <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-700/50">
      <span className="text-navy/70 dark:text-white/70 font-medium">{label}</span>

      {typeof status === "boolean" ? (
        status ? (
          <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
            Verified ✓
          </span>
        ) : actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 font-semibold text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-md hover:underline cursor-pointer"
            title="Click to verify email"
          >
            Verify Email
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-md">
            Unverified
          </span>
        )
      ) : (
        <span className="font-semibold text-navy dark:text-white truncate max-w-[170px]">
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
    () => new Set(["lpn-nursing", "rn-nursing"]),
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
      } catch { }
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

  const handleDeleteAccount = async (reason: string) => {
    if (!user?.guidId || !user?.email) {
      setDeleteError("Unable to identify your account. Please sign in again.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    const res = await destroyAccountService({
      guidId: user.guidId,
      email: user.email,
      reason: reason.trim() || undefined,
    });

    if (!res.success) {
      // Session stays intact so the user can retry
      setDeleteError(
        res.error || res.message || "Could not delete your account. Please try again."
      );
      setIsDeleting(false);
      return;
    }

    // Success: now it is safe to wipe the session
    clearAuthSessionCookies();
    deleteUsernameCookie();
    if (typeof window !== "undefined") {
      try {
        sessionStorage.clear();
      } catch { }
      window.dispatchEvent(new CustomEvent("session:logout"));
    }

    const msg = encodeURIComponent(
      res.message || "Your account has been deleted and deactivated successfully ⚓"
    );
    window.location.href = `/auth/login?msg=${msg}`;
  };

  /* Verify-email prompt (hooks must stay above the early returns) */
  const pathname = usePathname();
  const [verifyPromptOpen, setVerifyPromptOpen] = useState(false);
  const emailUnverified = isPrimaryEmailUnverified(user);
  const onVerifyPage = pathname?.includes("/auth/account/verify/email") ?? false;
  const verifyPromptKey = `verify_email_prompt_dismissed:${user?.guidId ?? ""}`;

  useEffect(() => {
    if (loading || !emailUnverified || onVerifyPage) {
      setVerifyPromptOpen(false);
      return;
    }
    if (sessionStorage.getItem(verifyPromptKey) === "1") return;
    setVerifyPromptOpen(true);
  }, [loading, emailUnverified, onVerifyPage, verifyPromptKey]);

  const closeVerifyPrompt = () => {
    sessionStorage.setItem(verifyPromptKey, "1");
    setVerifyPromptOpen(false);
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
              className={`absolute mt-2 w-[220px] sm:w-[240px] max-w-[calc(100vw-1rem)] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-2xl z-[100] p-2 space-y-1 right-0`}
            >
              <Link
                href={`/dashboards/${targetDashboard}/auth/login`}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition"
              >
                <FiLogIn className="text-blue-600 transition-transform group-hover:translate-x-0.5" />
                <span>Login</span>
              </Link>
              <Link
                href={`/dashboards/${targetDashboard}/auth/register`}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition"
              >
                <FiUserPlus className="text-teal-600 transition-transform group-hover:translate-x-0.5" />
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
          className="group relative flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-navy dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
          aria-label="Login or Register"
          title="Login / Register"
        >
          <FiLogIn className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="hidden sm:inline ml-1.5">Login / Register</span>
        </button>

        {isOpen && (
          <div
            className={`absolute mt-2 w-[220px] sm:w-[240px] max-w-[calc(100vw-1rem)] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-2xl z-[100] p-2 space-y-1 right-0`}
          >
            <Link
              href={`/dashboards/${targetDashboard}/auth/login`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <FiLogIn className="text-blue-600 transition-transform group-hover:translate-x-0.5" />
              <span>Login</span>
            </Link>

            <Link
              href={`/dashboards/${targetDashboard}/auth/register`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <FiUserPlus className="text-teal-600 transition-transform group-hover:translate-x-0.5" />
              <span>Create account</span>
            </Link>

            <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />

            <Link
              href={`/dashboards/${targetDashboard}/vista/pages/support`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-navy/70 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <FiHelpCircle className="text-blue-500" />
              <span>Help Center</span>
            </Link>

            <Link
              href={`/dashboards/${targetDashboard}/vista/pages/contact-us`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-navy/70 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <FiMail className="text-teal-500" />
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
  const isEmailVerified = !emailUnverified;
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
      className="relative inline-block shrink-0"
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
          className="group flex items-center gap-1.5 xl:gap-2 rounded-xl p-0.5 sm:px-2 sm:py-1 transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 cursor-pointer shrink-0"
          aria-expanded={isOpen}
          aria-haspopup="true"
          title={userName || "User Profile"}
        >
          {!hideAvatar && (
            <span className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60 transition-transform group-hover:scale-105 shrink-0 text-xs shadow-2xs">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={userName}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </span>
          )}
          <span className="hidden sm:inline text-xs font-semibold text-navy dark:text-white max-w-[75px] lg:max-w-[95px] xl:max-w-[130px] truncate">
            {userName}
          </span>
          <FiChevronDown
            className={`hidden sm:inline w-3.5 h-3.5 text-navy/50 dark:text-white/50 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Dropdown Card */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-[320px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${alignmentClass}`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              {!hideAvatar && (
                <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-sm shadow-2xs">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={userName}
                      width={44}
                      height={44}
                      className="object-cover w-full h-full"
                      onError={() => setAvatarBroken(true)}
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-navy dark:text-white truncate">
                  {userName}
                </div>
                <div className="text-xs text-navy/55 dark:text-white/50 truncate">
                  {user.email}
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{access?.isActive !== false ? "Active Account" : "Inactive Account"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Summary */}
          <div className="p-2 mx-3 my-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-0.5">
            <InfoRow label="Role" value={role} />
            <InfoRow
              label="Email Verification"
              status={isEmailVerified}
              actionHref={`/dashboards/${targetDashboard}/auth/account/verify/email`}
            />
          </div>

          {/* Menu Actions */}
          <div className="border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 space-y-0.5">
            <Link
              href={`/dashboards/${targetDashboard}/auth/account/show`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy/85 dark:text-white/85 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FiUser className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Profile &amp; Overview</span>
            </Link>

            <Link
              href={`/dashboards/${targetDashboard}/auth/account/edit`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy/85 dark:text-white/85 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FiSettings className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:rotate-45 transition-transform" />
              <span>Account Settings</span>
            </Link>

            {/* Logout & Delete Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLogout("distinct")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 transition cursor-pointer"
                >
                  <FiLogIn className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoutOptionsOpen((v) => !v)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-navy/60 dark:text-white/60 transition cursor-pointer"
                  title="More account options"
                  aria-expanded={logoutOptionsOpen}
                >
                  {logoutOptionsOpen ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Advanced options */}
              {logoutOptionsOpen && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 overflow-hidden divide-y divide-slate-200/60 dark:divide-slate-700/60">
                  <button
                    type="button"
                    onClick={() => handleLogout("relative")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  >
                    <FiShield className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                        Sign Out All Devices
                      </div>
                      <div className="text-[10px] text-navy/45 dark:text-white/40">
                        Terminate all active browser sessions
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setIsOpen(false);
                      setLogoutOptionsOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                  >
                    <FiTrash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-red-600 dark:text-red-400">
                        Delete Account
                      </div>
                      <div className="text-[10px] text-navy/45 dark:text-white/40">
                        Deactivate and permanently delete data
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <VerifyEmailModal
        isOpen={verifyPromptOpen}
        onClose={closeVerifyPrompt}
        verifyHref={`/dashboards/${targetDashboard}/auth/account/verify/email`}
        email={user.email}
      />

      <DeleteAccountModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
