"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Settings,
  ChevronUp,
} from "lucide-react";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { dynamicLogoutService } from "@/lib/services/auth/logoutService";
import { clearAuthSessionCookies, deleteUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";

interface SidebarUserProfileProps {
  panelSlug?: string;
  onClose?: () => void;
}

export default function SidebarUserProfile({
  panelSlug = "rn-nursing",
  onClose,
}: SidebarUserProfileProps) {
  const { user, authenticated, loading } = useCurrentSystemUser();
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or ESC
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    clearAuthSessionCookies();
    deleteUsernameCookie();
    if (typeof window !== "undefined") {
      try {
        sessionStorage.clear();
      } catch {}
      window.dispatchEvent(new CustomEvent("session:logout"));
    }

    try {
      await dynamicLogoutService(panelSlug, "distinct");
    } catch {}

    if (onClose) onClose();
    window.location.href = `/dashboards/${panelSlug}/auth/login?msg=${encodeURIComponent(
      "You've Been Signed Out Successfully ⚓"
    )}`;
  };

  if (loading) {
    return (
      <div className="p-3 animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // ─── LOGGED IN STATE ───
  if (authenticated && user) {
    const userName = user.userName?.trim() || "User";
    const userInitial = userName ? userName[0].toUpperCase() : "U";
    const avatarSrc =
      !avatarBroken && user.profile?.profilePicture
        ? user.profile.profilePicture
        : null;
    const role =
      user.roles && user.roles.length > 0
        ? [...user.roles].sort((a, b) => b.rank - a.rank)[0]?.name ?? "Learner"
        : "Learner";

    return (
      <div ref={dropdownRef} className="relative p-2.5 bg-slate-50/80 dark:bg-slate-900/60">
        {/* Dropdown Menu (Opens Upward Above Trigger) */}
        {isOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-1">
            {/* Header info inside dropdown */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="font-bold text-xs text-navy dark:text-white truncate">
                {userName}
              </div>
              {user.email && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user.email}
                </div>
              )}
              <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 px-1.5 py-0.2 rounded">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>{role}</span>
              </div>
            </div>

            {/* Menu Links */}
            <Link
              href={`/dashboards/${panelSlug}/auth/account/show`}
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-navy dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Profile &amp; Overview</span>
            </Link>

            <Link
              href={`/dashboards/${panelSlug}/auth/account/edit`}
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-navy dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Account Settings</span>
            </Link>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1" />

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        )}

        {/* Trigger Button Pinned at Bottom */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl transition cursor-pointer border ${
            isOpen
              ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              : "hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent"
          }`}
          aria-expanded={isOpen}
          aria-label="Account Settings & Profile"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-xs shadow-2xs shrink-0">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={userName}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>

            <div className="text-left min-w-0">
              <div className="font-bold text-xs text-navy dark:text-white truncate">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user.email || role}
              </div>
            </div>
          </div>

          <ChevronUp
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    );
  }

  // ─── GUEST (NOT LOGGED IN) ───
  return (
    <div ref={dropdownRef} className="relative p-2.5 bg-slate-50/80 dark:bg-slate-900/60">
      {isOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-2">
          <div className="text-left px-1">
            <div className="font-bold text-xs text-navy dark:text-white">
              Welcome to PubNurse
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Sign in to save and access exams
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Link
              href={`/dashboards/${panelSlug}/auth/login`}
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#0A2540] dark:bg-teal-600 text-white shadow-2xs hover:opacity-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>

            <Link
              href={`/dashboards/${panelSlug}/auth/register`}
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 text-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </Link>
          </div>
        </div>
      )}

      {/* Guest Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl transition cursor-pointer border ${
          isOpen
            ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            : "hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent"
        }`}
        aria-expanded={isOpen}
        aria-label="Account options"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="font-bold text-xs text-navy dark:text-white truncate">
              Guest User
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Sign in or create account
            </div>
          </div>
        </div>

        <ChevronUp
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}
