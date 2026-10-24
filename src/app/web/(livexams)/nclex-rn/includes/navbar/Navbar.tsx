"use client";

import NotificationDropdown from "./partials/NotificationDropdown";
import UserDropdown from "./partials/UserDropdown";
import ThemeDropdown from "./partials/ThemeDropdown";

import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useRightSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { APP_NAME } from "@/lib/config/config";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";

const Navbar: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLightLogoBroken, setIsLightLogoBroken] = useState(false);
  const [isDarkLogoBroken, setIsDarkLogoBroken] = useState(false);

  const { theme } = useThemeContext();
  const effectiveNavbarTheme =
    theme.navbar === "system" ? theme.global : theme.navbar;
  const isLightNavbar = effectiveNavbarTheme === "light";

  /** LEFT SIDEBAR */
  const {
    isOpened: isLeftOpened,
    toggle: toggleLeftSidebar,
  } = useLeftSidebar();

  /** RIGHT SIDEBAR */
  const {
    isOpened: isRightOpened,
    toggle: toggleRightSidebar,
  } = useRightSidebar();


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

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  /** HANDLERS */
  const handleLeftSidebarToggle = () => {
    toggleLeftSidebar();
  };

  const handleRightSidebarToggle = () => {
    toggleRightSidebar();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex bg-[var(--navbar-bg)] text-[var(--text-color)] border-b border-gray-200 dark:bg-[var(--navbar-bg)] dark:text-text-[var(--text-color)] dark:border-gray-800"
      style={{
        backgroundColor:
          theme.navbar === "custom" ? "var(--navbar-bg)" : undefined,
      }}
    >
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* LEFT AREA */}
          <div className="flex items-center justify-between w-full px-4 py-3 border-b border-gray-200 dark:border-gray-800 lg:border-b-0 lg:px-6">
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
            <span className="text-2xl font-semibold whitespace-nowrap">{APP_NAME}</span>
          </Link>

            {/* LEFT SIDEBAR TOGGLE */}
            <button
              onClick={handleLeftSidebarToggle}
              className={`flex items-center justify-center w-10 h-10 border rounded-lg
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

          {/* Mobile App Menu */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.5a1.5 1.5 0 1 1 0 3Zm6 0a1.5 1.5 0 1 1 0 3Zm6 0a1.5 1.5 0 1 1 0 3Z"
              />
            </svg>
          </button>

          {/* Search */}
          <div className="hidden lg:block">
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
          </div>
        </div>

        {/* RIGHT AREA */}
        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"
            } items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end`}
        >
          <div className="flex items-center gap-3">
            {/* RIGHT SIDEBAR TOGGLE */}
            <button
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

            </button>

            <ThemeDropdown />
            <NotificationDropdown />
          </div>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
