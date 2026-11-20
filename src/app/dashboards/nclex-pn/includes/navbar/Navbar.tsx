"use client";

import UserDropdown from "./partials/UserDropdown";
import ThemeModeToggle from "@/components/common/theme/ThemeModeToggle";

import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import HeedMessageBell from "./partials/HeedMessageBell";

import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import { Menu, X, CreditCard } from "lucide-react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import DashboardNavbarSearch from "@/components/common/dashboards/navbar/DashboardNavbarSearch";
import { CourseSchoolNavbarDropdowns } from "@/components/common/dashboards/navbar/CourseSchoolNavbarDropdowns";

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
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center bg-[var(--navbar-bg)] text-[var(--text-color)] border-b border-[var(--text-color)]/10 px-2 sm:px-3 lg:px-4 xl:px-6 gap-1 sm:gap-2"
      style={{
        backgroundColor:
          theme.navbar === "custom" ? "var(--navbar-bg)" : undefined,
      }}
    >
      {/* LEFT: Logo + Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

      {/* DIVIDER */}
      <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-700/80 mx-1 shrink-0" />

      {/* DROPDOWNS: Courses, Schools & Subscribe */}
      <div className="flex items-center shrink-0">
        <Suspense fallback={null}>
          <CourseSchoolNavbarDropdowns />
        </Suspense>
      </div>

      {/* SPACER */}
      <div className="flex-1 min-w-0" />

      {/* RIGHT ACTIONS: Search + Theme + Account */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 ml-auto">
        <div className="hidden lg:block">
          <DashboardNavbarSearch />
        </div>
        <ThemeModeToggle />
        {!userLoading && user && <HeedMessageBell />}
        <div className="hidden sm:block">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
