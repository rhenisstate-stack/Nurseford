"use client";

import Link from "next/link";
import { Home, BarChart2, LayoutDashboard, BarChart3, X, Receipt, CreditCard } from "lucide-react";
import { useRightSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useEffect, useState } from "react";
import { useSidebarAutoScroll } from "@/lib/hooks/nexus/includes/sidebars/useSidebarAutoScroll";

// import RightSidebarUserDropdown from "../partials/right/accounts/UserDropdown";
// import RightSidebarDashboardDropdown from "../partials/right/dashboards/DashboardDropdown";
// import RightSidebarDocumentationDropdown from "../partials/right/documentation/DocumentationDropdown";
import RightSidebarSupport from "../partials/right/elements/Support";
import RightSidebarContact from "../partials/right/elements/Contact";
import RightSidebarTerms from "../partials/right/elements/Terms";
import RightSidebarAbout from "../partials/right/elements/About";

import RightSidebarProfileDropdown from "../partials/right/account/ProfileDropdown";

import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";
import { APP_TITLE, APP_ACRONYM } from "@/lib/config/config";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function RightSidebar() {

  const DASHBOARD_NAME = "Ati-Teas";
  const PROGRAM_PANEL = "ati-teas";

  const { state, open, close } = useRightSidebar();

  const isOpened = state === "opened";
  const isCollapsed = state === "collapsed";
  const isClosed = state === "closed";

  const { theme } = useThemeContext();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rightActiveDropdown") || null;
    }
    return null;
  });

  const [isMounted, setIsMounted] = useState(false);

  //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // On Reaload Auto Scroll to Active Dropdown (if any)
  useSidebarAutoScroll({
    sidebarScrollContainerSelector: ".right-sidebar-scroll", // or ".right-sidebar-scroll" for right sidebar
    sidebarActiveDropdownKey: activeDropdown,
    sidebarScrollMaxAttempts: 30, // Try for up to 3 seconds (30 * 100ms)
    sidebarScrollRetryDelay: 100, // Check every 100ms
  });

  //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 🚨 EARLY RETURN MUST COME AFTER ALL HOOKS
  useEffect(() => setIsMounted(true), []);
  if (!isMounted || isClosed) return null;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  THEME + LAYOUT
  const isLightSidebar =
    (theme.rightSidebar === "system" ? theme.global : theme.rightSidebar) === "light";

  const sidebarWidth = isOpened ? "w-64" : "w-20";

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  HANDLERS
  const toggleDropdown = (key: string) => {
    let newActive: string | null;
    if (!isOpened) {
      open(); // 👈 FORCE OPEN (NOT toggle)
      setTimeout(() => {
        newActive = activeDropdown === key ? null : key;
        setActiveDropdown(newActive);
        if (typeof window !== "undefined") localStorage.setItem("rightActiveDropdown", newActive || "");
      }, 250);
    } else {
      newActive = activeDropdown === key ? null : key;
      setActiveDropdown(newActive);
      if (typeof window !== "undefined") localStorage.setItem("rightActiveDropdown", newActive || "");
    }
  };

  const handleItemClick = () => {
    if (isCollapsed) {
      open(); // 👈 FORCE OPEN
    }
  };

  const handleItemHover = (item: string, e: React.MouseEvent) => {
    if (isCollapsed) {
      setHoveredItem(item);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left, //  anchor only (Tooltip handles direction)
        y: rect.top + rect.height / 2,
      });
    }
  };

  const handleMouseLeave = () => setHoveredItem(null);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  RENDER
  return (
    <aside
      className={`fixed top-16 right-0 z-40 flex flex-col h-[calc(100vh-64px)]
      ${sidebarWidth}
      transition-all duration-300 ease-in-out
      shadow-md border-l border-[var(--text-color)]/10`}
      style={{
        backgroundColor: "var(--rightSidebar-bg)",
        color: "var(--text-color)",
      }}
    >

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-[var(--text-color)]/10`}
      >
        <div className={`flex-1 ${!isOpened && "justify-center flex"}`}>
          <Link
            href="/dashboards"
            className={`text-lg font-bold ${isLightSidebar
              ? "text-gray-800 hover:text-gray-600"
              : "text-[var(--text-color)]"
              }`}
          >
            {isOpened ? APP_TITLE : APP_ACRONYM}
          </Link>
        </div>

        {isOpened && (
          <button
            onClick={close}
            aria-label="Close sidebar"
            className="p-1 rounded hover:bg-[var(--text-color)]/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 p-2 right-sidebar-scroll">

        {/* Dashboard */}
        <Link href={`/dashboards/${DASHBOARD_NAME.toLowerCase()}`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Dashboard", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
            border-1 border-transparent hover:border-[var(--text-color)]/40 select-none
            ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
            ${!isOpened && "justify-center"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {isOpened && <span className="ml-3">My Dashboard</span>}

            {isCollapsed && hoveredItem === "Dashboard" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y} position="left">
                Dashboard
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Home */}
        <Link href="/">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Home", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border-1 border-transparent hover:border-[var(--text-color)]/40 select-none
              ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
              ${!isOpened && "justify-center"}`}
          >
            <Home className="w-5 h-5" />
            {isOpened && <span className="ml-3">Return Home</span>}

            {isCollapsed && hoveredItem === "Home" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y} position="left">
                Home
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Dashboards */}
        {/* <RightSidebarDashboardDropdown
          {...{
            isOpened,
            activeDropdown,
            toggleDropdown,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}

        /> */}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="space-y-8">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>  
      
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {isOpened && (
          <div className="flex justify-center p-0">
            <span className="text-[10px] tracking-wide uppercase opacity-50 select-none">
              My Account Management
            </span>
          </div>
        )}
        {/* Profile */}
        <RightSidebarProfileDropdown
          {...{
            isOpened,
            activeDropdown,
            toggleDropdown,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}

        />

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="space-y-8">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {isOpened && (
          <div className="flex justify-center p-0">
            <span className="text-[10px] tracking-wide uppercase opacity-50 select-none">
              My Data Management
            </span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Reports */}
        <Link href={`/dashboards/${PROGRAM_PANEL}/vista/stats/reports`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Reports", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
            border border-transparent hover:border-[var(--text-color)]/40 select-none
            ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
            ${!isOpened && "justify-center"}`}
          >
            <BarChart2 className="w-5 h-5" />
            {isOpened && <span className="ml-3">My Reports</span>}

            {isCollapsed && hoveredItem === "Reports" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y} position="left">
                My Reports
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Dropdowns */}
        {/* <RightSidebarUserDropdown
          {...{
            isOpened,
            activeDropdown,
            toggleDropdown,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}
        /> */}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* <RightSidebarDocumentationDropdown
          {...{
            isOpened,
            activeDropdown,
            toggleDropdown,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}
        /> */}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Progress */}
        <Link href={`/dashboards/${PROGRAM_PANEL}/vista/stats/progress`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Progress", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
            border border-transparent hover:border-[var(--text-color)]/40 select-none
            ${isLightSidebar
                ? "text-[var(--text-color)]"
                : "text-[var(--text-color)]"
              }
            ${!isOpened && "justify-center"}`}
          >
            <BarChart3 className="w-5 h-5" />

            {isOpened && <span className="ml-3">My Progress</span>}

            {isCollapsed && hoveredItem === "Progress" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y} position="left">
               My Progress
              </Tooltip>
            )}
          </div>
        </Link>
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* My Subscriptions */}
        <Link href={`/dashboards/${PROGRAM_PANEL}/vista/subscriptions/packages`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Subscriptions", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${isLightSidebar
                ? "text-[var(--text-color)]"
                : "text-[var(--text-color)]"
              }
               ${!isOpened && "justify-center"}`}
          >
            <Receipt className="w-5 h-5" />

            {isOpened && <span className="ml-3">My Subscriptions</span>}

            {isCollapsed && hoveredItem === "My Subscriptions" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y} position="left">
                My Subscriptions
              </Tooltip>
            )}
          </div>
        </Link>
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Subscription Packages */}
        <Link href={`/dashboards/${PROGRAM_PANEL}/vista/subscriptions/items`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Subscription Packages", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${isLightSidebar
                ? "text-[var(--text-color)]"
                : "text-[var(--text-color)]"
              }
              ${!isOpened && "justify-center"}`}
          >
            <CreditCard className="w-5 h-5" />

            {isOpened && <span className="ml-3">Subscription Packages</span>}

            {isCollapsed && hoveredItem === "Subscription Packages" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y} position="left">
                Subscription Packages
              </Tooltip>
            )}
          </div>
        </Link>
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* About */}
        <RightSidebarTerms
          {...{
            isOpened,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}
        />
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* About */}
        <RightSidebarSupport
          {...{
            isOpened,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}
        />
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* About */}
        <RightSidebarContact
          {...{
            isOpened,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}
        />
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* About */}
        <RightSidebarAbout
          {...{
            isOpened,
            hoveredItem,
            handleItemHover,
            handleMouseLeave,
            tooltipPosition,
            handleItemClick,
          }}
        />
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      </nav>
    </aside>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By BLSMAC , The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
