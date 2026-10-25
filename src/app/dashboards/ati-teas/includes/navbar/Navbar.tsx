"use client";

import UserDropdown from "./partials/UserDropdown";
import ThemeModeToggle from "@/components/common/theme/ThemeModeToggle";

import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import HeedMessageBell from "./partials/HeedMessageBell";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Menu, X } from "lucide-react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import DashboardNavbarSearch from "@/components/common/dashboards/navbar/DashboardNavbarSearch";

const Navbar: React.FC = () => {
  const { theme } = useThemeContext();
  const { user, loading: userLoading } = useCurrentSystemUser();

  /** LEFT SIDEBAR */
  const {
    isOpened: isLeftOpened,
    toggle: toggleLeftSidebar,
  } = useLeftSidebar();

  /** HANDLERS */
  const handleLeftSidebarToggle = () => {
    toggleLeftSidebar();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center bg-[var(--navbar-bg)] text-[var(--text-color)] border-b border-[var(--text-color)]/10 px-3 md:px-6"
      style={{
        backgroundColor:
          theme.navbar === "custom" ? "var(--navbar-bg)" : undefined,
      }}
    >
      {/* LEFT: Logo + Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo/logo.webp"
            alt="Logo"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
            priority
          />
        </Link>

        <button
          onClick={handleLeftSidebarToggle}
          className="flex items-center justify-center w-8 h-8 border rounded-lg border-[var(--text-color)]/25 hover:bg-[var(--text-color)]/10 transition-colors"
          aria-label="Toggle Left Sidebar"
        >
          {isLeftOpened ? (
            <X className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <Menu className="w-4 h-4" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* SPACER */}
      <div className="flex-1" />

      {/* SEARCH BAR */}
      <DashboardNavbarSearch />

      {/* RIGHT: Theme Toggle + Login/Register */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeModeToggle />
        {!userLoading && user && <HeedMessageBell />}
        <UserDropdown />
      </div>
    </header>
  );
};

export default Navbar;
