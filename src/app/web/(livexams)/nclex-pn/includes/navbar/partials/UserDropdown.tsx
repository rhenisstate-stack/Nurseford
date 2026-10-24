"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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
} from "react-icons/fi";

import { Dropdown } from "@/components/dashboards/includes/navbar/dropdowns/Dropdown";
import { DropdownItem } from "@/components/dashboards/includes/navbar/dropdowns/DropdownItem";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { dynamicLogoutService } from "@/lib/services/auth/logoutService";

const TARGET_LOGOUT_DASHBOARD = "Admin";
const DEFAULT_LOGOUT_REDIRECT = `/dashboards/${TARGET_LOGOUT_DASHBOARD.toLowerCase()}/logout`;

// const LOGOUT_FETCH_TYPE = "distinct" // Can  "relative" or  "distinct"  // "relative" destroys all sessions and distinct destroy current session only
const LOGOUT_FETCH_TYPE_DISTINCT = "distinct";
const LOGOUT_FETCH_TYPE_RELATIVE = "relative";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// INFO ROW 
function InfoRow({
  label,
  value,
  status,
  actionHref,
  actionLabel,
}: {
  label: string;
  value?: string;
  status?: boolean;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div
      className="
        group flex items-center justify-between
        text-xs py-1.5 px-2
        rounded-lg
        transition-all duration-200
        hover:bg-white
      "
    >
      <span className="text-black font-semibold">{label}</span>

      {typeof status === "boolean" ? (
        status ? (
          <span className="font-medium text-emerald-600">Yes</span>
        ) : (
          <a
            href={actionHref}
            className="
              inline-flex items-center gap-1
              text-[10px] font-semibold
              text-rose-600
              px-2 py-0.5 rounded-full
              border border-rose-300/50
              bg-rose-50
              hover:bg-rose-100
              hover:border-rose-400
              transition
            "
          >
            {actionLabel ?? "Verify"}
          </a>
        )
      ) : (
        <span className="font-medium text-gray-800 truncate max-w-[170px]">
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
/* MAIN COMPONENT */

export default function UserDropdown() {
  const { user, loading } = useCurrentSystemUser();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [logoutOptionsOpen, setLogoutOptionsOpen] = useState(false);

  /* Info collapse state (remembered) */
  const [infoOpen, setInfoOpen] = useState(true); // by default let the accordion state be open !
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user_dropdown_info_open");
    if (saved !== null) {
      setInfoOpen(saved === "true");
    }
  }, []);

  const toggleInfo = () => {
    const next = !infoOpen;
    setInfoOpen(next);
    localStorage.setItem("user_dropdown_info_open", String(next));
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading…</div>;
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NOT LOGGED IN 

  if (!user) {
    return (
      <div
        className="relative"
        onMouseEnter={() => {
          hoverTimeout.current = setTimeout(() => setIsOpen(true), 80);
        }}
        onMouseLeave={() => {
          if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        }}
      >

        <button
          onClick={() => setIsOpen(v => !v)}
          className="
            group relative flex items-center gap-2 px-5 py-2.5
            rounded-full text-sm font-semibold
            text-indigo-700
            bg-white/70 backdrop-blur
            border border-indigo-200
            shadow-sm
            hover:shadow-lg
            hover:border-indigo-400
            transition-all
          "
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition" />
          <FiLogIn className="relative" />
          <span className="relative">Login / Register</span>
          <FiChevronDown className="relative ml-1 text-xs" />
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="
            absolute right-0 mt-3 w-[260px]
            rounded-2xl border
            bg-gradient-to-br from-green-100 via-purple-100 to-cyan-100
            shadow-theme-lg z-50
          "
        >
          <div className="px-1 py-1 space-y-1">
            <DropdownItem>
              <Link
                href="/dashboards/admin/auth/login"
                className="
                  group flex items-center gap-2
                  rounded-xl px-3 py-2
                  transition-all duration-200
                  hover:bg-gradient-to-r hover:from-indigo-500/10 hover:via-purple-500/10 hover:to-cyan-500/10
                  hover:shadow-md
                  hover:ring-1 hover:ring-indigo-300
                "
              >
                <FiLogIn className="text-indigo-600 transition-transform duration-200 group-hover:translate-x-0.5" />
                <span className="font-medium">Login</span>
              </Link>
            </DropdownItem>

            <DropdownItem>
              <Link
                href="/dashboards/admin/auth/register"
                className="
                group flex items-center gap-2
                rounded-xl px-3 py-2
                transition-all duration-200
                hover:bg-gradient-to-r hover:from-emerald-500/10 hover:via-teal-500/10 hover:to-cyan-500/10
                hover:shadow-md
                hover:ring-1 hover:ring-emerald-300
              "
              >
                <FiUserPlus className="text-emerald-600 transition-transform duration-200 group-hover:translate-x-0.5" />
                <span className="font-medium">Create account</span>
              </Link>
            </DropdownItem>


            <div className="my-2 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

            <DropdownItem>
              <Link
                href="/dashboards/admin/support"
                className="
                group flex items-center gap-2
                rounded-xl px-3 py-2
                transition-all duration-200
                hover:bg-gradient-to-r hover:from-indigo-400/10 hover:to-indigo-500/10
                hover:shadow-sm
                hover:ring-1 hover:ring-indigo-500
              "
              >
                <FiHelpCircle className="text-indigo-500 transition-transform duration-200 group-hover:rotate-6" />
                <span className="font-medium">Help Center</span>
              </Link>
            </DropdownItem>


            <DropdownItem>
              <Link
                href="/dashboards/admin/contact"
                className="
                  group flex items-center gap-2
                  rounded-xl px-3 py-2
                  transition-all duration-200
                  hover:bg-gradient-to-r hover:from-purple-400/10 hover:to-fuchsia-500/10
                  hover:shadow-sm
                  hover:ring-1 hover:ring-purple-500
                "
              >
                <FiMail className="text-purple-500 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span className="font-medium">Contact Support</span>
              </Link>
            </DropdownItem>

          </div>

        </Dropdown>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  LOGGED IN

  const avatarSrc =
    !avatarBroken && user.profile?.profilePicture
      ? user.profile.profilePicture
      : null;

  const access = user.accesses?.[0];
  const primaryEmail = user.emails?.find(e => e.isPrimary);
  const primaryPhone = user.phones?.find(p => p.isPrimary);
  const userName = user?.userName?.trim() || "";
  const userInitial = userName ? userName[0].toUpperCase() : "?";
  const role =
    user.roles && user.roles.length > 0
      ? [...user.roles]
        .sort((a, b) => b.rank - a.rank)[0]?.name ?? "Void"
      : "Void"; const grantsCount = user.grants?.length ?? 0;
  const category = user.categories?.[0]?.categoryName;
  const badges = user.badges?.map(b => b.badgeName).join(", ");

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // LOGGED IN

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        hoverTimeout.current = setTimeout(() => setIsOpen(true), 80);
      }}
      onMouseLeave={() => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      }}
    >

      {/* Trigger */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="
          group flex items-center gap-2
          rounded-full px-2 py-1
          transition-all duration-300
          hover:bg-white/40
          hover:shadow-lg
          hover:ring-1 hover:ring-emerald-300/40
        "
      >
        <span
          className="
            h-10 w-10 rounded-full overflow-hidden
            flex items-center justify-center
            bg-gradient-to-br from-emerald-200 via-indigo-200 to-cyan-200
            transition-all duration-300
            group-hover:scale-[1.05]
            group-hover:shadow-md
          "
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={user.userName}
              width={40}
              height={40}
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <span className="font-medium text-gray-700">
              {userInitial}
              {/* {user.userName.charAt(0).toUpperCase()} */}
            </span>
          )}
        </span>

        <span className="text-sm font-medium transition-colors group-hover:text-emerald-700">
          {user.userName}
        </span>
      </button>

      {/* Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute right-0 mt-4 w-[340px] rounded-2xl border
          bg-gradient-to-br from-emerald-50 via-indigo-50 to-cyan-50
          shadow-theme-lg z-50"
      >
        {/* Header */}
        <div className="px-6 py-4 text-center border-b">
          <div className="mx-auto mb-2 h-14 w-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={user.userName} width={56} height={56} />
            ) : (
              <span className="text-xl font-semibold text-gray-600">
                {userInitial}
                {/* {user.userName.charAt(0).toUpperCase()} */}
              </span>
            )}
          </div>

          <div className="font-semibold text-gray-900">{user.userName}</div>
          <div className="text-xs text-gray-500 truncate">{user.email}</div>

          <div className="mt-2 text-xs font-medium text-emerald-600">
            {access?.isActive ? "Active Account" : "Inactive Account"}
          </div>
        </div>

        {/* Collapsible Info */}
        <button
          onClick={toggleInfo}
          className="
            group w-full
            flex flex-col items-center justify-center
            px-6 py-3
            text-xs font-semibold tracking-wide
            text-gray-900
            transition-all duration-300
            hover:bg-gradient-to-r
            hover:from-emerald-200
            hover:via-indigo-200
            hover:to-cyan-200
          "
        >
          <span className="flex items-center gap-2">
            <span>Account Information</span>
            <span className="text-[10px] text-blue-600 group-hover:text-gray-900">
              [ Click to {infoOpen ? "Collapse" : "Expand"} ]
            </span>
          </span>

          <span
            className="
              mt-1
              transition-transform duration-300
              group-hover:scale-110
              animate-pulse
            "
          >
            {infoOpen ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </button>


        {infoOpen && (
          <div
            className="
            px-6 pb-4 space-y-1
            rounded-xl
            transition-all duration-300
            hover:bg-green-200
          "
          >
            <InfoRow label="Role" value={role} />
            <InfoRow label="Grants" value={`${grantsCount}`} />
            <InfoRow label="User type" value={user.userType} />
            <InfoRow label="Phone" value={primaryPhone?.phoneNumber} />
            <InfoRow
              label="Email verified"
              status={primaryEmail?.isVerified}
              actionHref="/profile/security/email"
              actionLabel="Verify email"
            />

            <InfoRow
              label="Phone verified"
              status={primaryPhone?.isVerified}
              actionHref="/profile/security/phone"
              actionLabel="Verify phone"
            />

            <InfoRow
              label="2FA enabled"
              status={user.twoFactorEnabled}
              actionHref="/profile/security/2fa"
              actionLabel="Enable 2FA"
            />
            <InfoRow label="Category" value={category} />
            <InfoRow label="Badges" value={badges} />
          </div>
        )}

        {/* Actions */}
        <div className="border-t px-4 py-3 space-y-1">
          <DropdownItem
            href="/profile"
            className="
            group flex items-center gap-2 rounded-xl px-3 py-2
            transition-all duration-200
            hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-cyan-500/10
            hover:ring-1 hover:ring-indigo-300/40
          "
          >
            <FiUser className="text-indigo-600 group-hover:translate-x-0.5 transition" />
            Edit profile
          </DropdownItem>

          <DropdownItem
            href="/profile/settings"
            className="
              group flex items-center gap-2 rounded-xl px-3 py-2
              transition-all duration-200
              hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10
              hover:ring-1 hover:ring-emerald-300/40
            "
          >
            <FiSettings className="text-emerald-600 group-hover:rotate-6 transition" />
            Account settings
          </DropdownItem>

          <DropdownItem
            href="/profile/security"
            className="
              group flex items-center gap-2 rounded-xl px-3 py-2
              transition-all duration-200
              hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-fuchsia-500/10
              hover:ring-1 hover:ring-purple-300/40
            "
          >
            <FiShield className="text-purple-600 group-hover:-translate-y-0.5 transition" />
            Security
          </DropdownItem>
          {/* Logout Actions */}
          <div className="relative space-y-2">

            {/* PRIMARY: Distinct Logout */}
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await dynamicLogoutService(
                      TARGET_LOGOUT_DASHBOARD,
                      LOGOUT_FETCH_TYPE_DISTINCT
                    );

                    const redirectTo =
                      typeof response?.redirect_to === "string" &&
                        response.redirect_to.trim() !== ""
                        ? response.redirect_to
                        : DEFAULT_LOGOUT_REDIRECT;

                    const msg = encodeURIComponent(
                      typeof response?.message === "string" &&
                        response.message.trim() !== ""
                        ? response.message
                        : "You’ve Been Signed Out Successfully ⚓"
                    );

                    window.location.href = `${redirectTo}?msg=${msg}`;
                  } catch {
                    // 🚨 absolute final fallback — nothing can block logout navigation
                    const msg = encodeURIComponent("You’ve Been Signed Out Successfully ⚓");
                    window.location.href = `${DEFAULT_LOGOUT_REDIRECT}?msg=${msg}`;
                  }
                }}


                className="
                  flex-1
                  flex items-center justify-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  text-sm font-semibold
                  text-rose-900
                  border border-blue-300
                  bg-gradient-to-r from-rose-100 to-red-100
                  hover:from-yellow-500 hover:to-green-100
                  hover:border-rose-900
                "
              >
                <FiLogIn className="h-4 w-4" />
                <span>Sign Out</span>
              </button>

              {/* SECONDARY TOGGLE */}
              <button
                onClick={() => setLogoutOptionsOpen((v) => !v)}
                className="
                  p-2 rounded-xl
                  border border-gray-300
                  bg-white
                  hover:bg-gray-100
                  transition
                "
                title="Advanced logout options"
              >
                {logoutOptionsOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {/* ADVANCED DROPDOWN */}
            {logoutOptionsOpen && (
              <div
                className="
                  absolute right-0 mt-1
                  w-full
                  rounded-xl
                  border
                  bg-white
                  shadow-lg
                  animate-fade-in
                  z-50
                "
              >
                <button
                  onClick={async () => {
                    try {
                      const response = await dynamicLogoutService(
                        TARGET_LOGOUT_DASHBOARD,
                        LOGOUT_FETCH_TYPE_RELATIVE
                      );

                      const redirectTo =
                        typeof response?.redirect_to === "string" &&
                          response.redirect_to.trim() !== ""
                          ? response.redirect_to
                          : DEFAULT_LOGOUT_REDIRECT;

                      const msg = encodeURIComponent(
                        typeof response?.message === "string" &&
                          response.message.trim() !== ""
                          ? response.message
                          : "You’ve Been Signed Out Successfully ⚓"
                      );

                      window.location.href = `${redirectTo}?msg=${msg}`;
                    } catch {
                      // 🚨 absolute final fallback — nothing can block logout navigation
                      const msg = encodeURIComponent("You’ve Been Signed Out Successfully ⚓");
                      window.location.href = `${DEFAULT_LOGOUT_REDIRECT}?msg=${msg}`;
                    }
                  }}

                  className="
                    w-full
                    flex items-start gap-3
                    px-4 py-3
                    text-left
                    rounded-xl
                    hover:bg-rose-50
                    transition
                  "
                >
                  <FiShield className="text-rose-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-rose-800">
                      Log out of all Devices
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Sign out from all Active Sessions ⚓
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>

      </Dropdown>
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
}
