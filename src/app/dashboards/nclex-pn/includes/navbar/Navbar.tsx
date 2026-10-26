"use client";

// import NotificationDropdown from "./partials/NotificationDropdown";
import UserDropdown from "./partials/UserDropdown";
import ThemeDropdown from "./partials/ThemeDropdown";

import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import HeedMessageBell from "./partials/HeedMessageBell";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { APP_NAME } from "@/lib/config/config";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";

const TARGET_PROGRAM = "nclex-pn";

const Navbar: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLightLogoBroken, setIsLightLogoBroken] = useState(false);
  const [isDarkLogoBroken, setIsDarkLogoBroken] = useState(false);
  const { user, loading: userLoading } = useCurrentSystemUser();

  const { theme } = useThemeContext();
  const effectiveNavbarTheme =
    theme.navbar === "system" ? theme.global : theme.navbar;
  const isLightNavbar = effectiveNavbarTheme === "light";

  /** LEFT SIDEBAR */
  const {
    isOpened: isLeftOpened,
    toggle: toggleLeftSidebar,
  } = useLeftSidebar();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  /** HANDLERS */
  const handleLeftSidebarToggle = () => {
    toggleLeftSidebar();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex bg-[var(--navbar-bg)] border-b border-gray-200  text-[var(--text-color)] dark:bg-[var(--navbar-bg)] dark:text-text-[var(--text-color)] dark:border-gray-800  "
      style={{
        backgroundColor:
          theme.navbar === "custom" ? "var(--navbar-bg)" : undefined,
      }}
    >

      <div className="flex flex-col items-center justify-center h-full grow lg:flex-row lg:justify-between lg:px-6">
        <div className="flex items-center justify-between w-full h-full gap-2 px-1 py-0 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-0">

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* MOBILE AREA: Icon, Toggle, App Name, Login */}
          <div className="flex lg:hidden items-center w-full h-full gap-2 px-1">
            <Link href="/" className="shrink-0">
              <Image
                src={isLightLogoBroken ? "/logo/logo-dark.png" : "/logo/logo.png"}
                alt="Logo"
                width={32}
                height={32}
                className="dark:hidden"
                onError={() => setIsLightLogoBroken(true)}
              />
              <Image
                src={isDarkLogoBroken ? "/logo/logo.png" : "/logo/logo-dark.png"}
                alt="Logo Dark"
                width={32}
                height={32}
                className="hidden dark:block"
                onError={() => setIsDarkLogoBroken(true)}
              />
            </Link>

            <button
              onClick={handleLeftSidebarToggle}
              className={`shrink-0 flex items-center justify-center w-9 h-9 border rounded-lg
                ${isLightNavbar ? "border-gray-300" : "border-gray-800"}`}
              aria-label="Toggle Left Sidebar"
            >
              {isLeftOpened ? (
                <X className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>

            <Link href="/" className="text-2xl font-bold leading-tight whitespace-nowrap min-w-0">
              {APP_NAME}
            </Link>

            {!userLoading && !user && (
              <Link
                href={`/dashboards/${TARGET_PROGRAM}/auth/login`}
                className="ml-auto shrink-0 rounded-lg bg-blue-600 text-white text-xs font-semibold px-3 py-2 hover:bg-blue-700 transition"
              >
                Login
              </Link>
            )}

            {!userLoading && user && (
              <div className="ml-auto shrink-0 flex items-center gap-2">
                <HeedMessageBell />
                <UserDropdown />
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* LEFT AREA DESKTOP */}

          <div className="hidden lg:flex items-center justify-left w-full h-full px-4 py-0 dark:border-gray-800 lg:border-b-0 lg:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              {/* Light logo */}
              <Image
                src={isLightLogoBroken ? "/logo/logo-dark.png" : "/logo/logo.png"}
                alt="Logo"
                width={32}
                height={32}
                className="dark:hidden"
                onError={() => setIsLightLogoBroken(true)}
              />

              {/* Dark logo */}
              <Image
                src={isDarkLogoBroken ? "/logo/logo.png" : "/logo/logo-dark.png"}
                alt="Logo Dark"
                width={32}
                height={32}
                className="hidden dark:block"
                onError={() => setIsDarkLogoBroken(true)}
              />

              {/* App Name */}
              <span className="text-2xl font-semibold whitespace-nowrap leading-none">{APP_NAME}</span>
            </Link>

            {/* LEFT SIDEBAR TOGGLE */}
            <button
              onClick={handleLeftSidebarToggle}
              className={`flex items-center justify-center ml-5 w-10 h-10 border rounded-lg
                ${isLightNavbar ? "border-gray-300" : "border-gray-800"}`}
              aria-label="Toggle Left Sidebar"
            >
              {isLeftOpened ? (
                <X className="w-5 h-5" strokeWidth={2.5} />  // increase strokeWidth
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2.5} /> // increase strokeWidth
              )}

            </button>
          </div>

          {/* Search */}
          {/* <div className="hidden lg:block">
            <form>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type and Search ... ?!"
                  className="h-11 w-full xl:w-[430px] rounded-lg border bg-transparent py-2.5 pl-12 pr-14 text-sm shadow-sm focus:outline-none focus:ring-2"
                />
              </div>
            </form>
          </div> */}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* RIGHT AREA */}
        <div
          className="hidden items-center justify-between w-full h-full gap-4 px-5 py-0 lg:flex lg:justify-end"
        >
          <div className="flex items-center gap-3">
            {/* RIGHT SIDEBAR TOGGLE */}
            {/* <button
              onClick={handleRightSidebarToggle}
              className={`flex items-center justify-center w-10 h-10 border rounded-lg
                ${isLightNavbar ? "border-gray-300" : "border-gray-800"}`}
              aria-label="Toggle Right Sidebar"
            >
              {isRightOpened ? (
                <X className="w-5 h-5" strokeWidth={2.5} />  //  increase strokeWidth
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2.5} /> //  increase strokeWidth
              )}

            </button> */}

            <ThemeDropdown />
            {/* <NotificationDropdown /> */}
            {!userLoading && user && <HeedMessageBell />}

          </div>

          <UserDropdown />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      </div>
    </header>
  );
};

export default Navbar;
