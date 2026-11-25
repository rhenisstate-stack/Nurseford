"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  X,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Sparkles,
                Zap,
  ArrowRight,
  type LucideIcon,
  TrendingUp,
  FileCheck2,
  Crown,
  BadgeCheck,
  UserCog,
  Headphones,
  MessageCircleQuestion,
} from "lucide-react";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useEffect, useState, useRef } from "react";
import { useSidebarAutoScroll } from "@/lib/hooks/nexus/includes/sidebars/useSidebarAutoScroll";

import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";
import { APP_TITLE, APP_ACRONYM } from "@/lib/config/config";
import SidebarUserProfile from "@/components/common/user/SidebarUserProfile";
import PerformanceIndexGauge from "@/components/common/dashboards/PerformanceIndexGauge";

const PANEL = "rn-nursing";
const VISTA = `/dashboards/${PANEL}/vista`;

function AccordionGroup({
  id,
  icon: Icon,
  label,
  isOpened,
  isActive,
  onToggle,
  hoveredItem,
  handleItemHover,
  handleMouseLeave,
  tooltipPosition,
  isMobile,
  children,
}: {
  id: string;
  icon: LucideIcon;
  label: string;
  isOpened: boolean;
  isActive: boolean;
  onToggle: (id: string) => void;
  hoveredItem: string | null;
  handleItemHover: (item: string, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  tooltipPosition: { x: number; y: number };
  isMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div
        target-scroll-item-accordion-key={id}
        onClick={() => onToggle(id)}
        onMouseEnter={(e) => handleItemHover(id, e)}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center py-2 px-1 rounded-lg transition cursor-pointer
          border border-transparent hover:border-[var(--text-color)]/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-100 select-none
          ${isOpened ? "justify-between" : "justify-center"}`}
      >
        <div className="flex items-center min-w-0">
          <Icon className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-300" />
          {isOpened && (
            <span className={`ml-3 font-medium truncate ${isMobile ? "text-xs" : "text-sm"}`}>{label}</span>
          )}
        </div>

        {isOpened &&
          (isActive ? (
            <ChevronDown className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
          ))}

        {!isOpened && hoveredItem === id && (
          <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
            {label}
          </Tooltip>
        )}
      </div>

      {isOpened && isActive && (
        <div className="ml-3 pl-3 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
}

function SubAccordionGroup({
  id,
  label,
  isOpen,
  onToggle,
  isOpened,
  isMobile,
  children,
}: {
  id: string;
  label: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  isOpened: boolean;
  isMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(id);
        }}
        className={`relative flex items-center py-1.5 px-1 rounded-lg transition cursor-pointer
          border border-transparent hover:border-[var(--text-color)]/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-100 select-none
          ${isOpen ? "bg-slate-100/90 dark:bg-slate-800/70 font-semibold" : ""}
          ${isOpened ? "justify-between" : "justify-center"}`}
      >
        <div className="flex items-center min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isOpen ? "bg-teal-500" : "bg-slate-400 dark:bg-slate-500"
            }`}
          />
          {isOpened && (
            <span className={`ml-2.5 font-medium truncate ${isMobile ? "text-xs" : "text-sm"}`}>
              {label}
            </span>
          )}
        </div>

        {isOpened &&
          (isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70 text-slate-500 dark:text-slate-400" />
          ))}
      </div>

      {isOpened && isOpen && (
        <div className="ml-3 pl-2.5 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
}

function NavItem({
  href,
  label,
  isOpened,
  isCollapsed,
  hoveredItem,
  handleItemHover,
  handleMouseLeave,
  tooltipPosition,
  handleItemClick,
  isMobile,
  exact,
}: {
  href: string;
  label: string;
  isOpened: boolean;
  isCollapsed: boolean;
  hoveredItem: string | null;
  handleItemHover: (item: string, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  tooltipPosition: { x: number; y: number };
  handleItemClick: () => void;
  isMobile: boolean;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTrack = searchParams?.get("track");

  let isActive = false;
  if (href.includes("?track=exit")) {
    isActive = pathname === href.split("?")[0] && currentTrack === "exit";
  } else if (href === "/dashboards/rn-nursing" || href === "/dashboards/lpn-nursing") {
    isActive = pathname === href && currentTrack !== "exit";
  } else {
    isActive = exact
      ? pathname === href
      : pathname === href || (href !== "/" && href !== "/dashboards/rn-nursing" && href !== "/dashboards/lpn-nursing" && pathname?.startsWith(href));
  }

  return (
    <Link href={href} onClick={handleItemClick}>
      <div
        onClick={handleItemClick}
        onMouseEnter={(e) => handleItemHover(label, e)}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center py-1.5 px-1 rounded-lg transition
          border border-transparent select-none
          ${isActive
            ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40 font-semibold"
            : "hover:border-[var(--text-color)]/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
          }
          ${isOpened ? "justify-start" : "justify-center"}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isActive ? "bg-teal-500" : "bg-slate-400 dark:bg-slate-500"
          }`}
        />
        {isOpened && <span className={`ml-2.5 truncate ${isMobile ? "text-[10px]" : "text-[12px]"}`}>{label}</span>}

        {isCollapsed && hoveredItem === label && (
          <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
            {label}
          </Tooltip>
        )}
      </div>
    </Link>
  );
}

export default function LeftSidebar() {
  const DASHBOARD_NAME = "rn-nursing";

  const { state, open, close } = useLeftSidebar();

  const isOpened = state === "opened";
  const isCollapsed = false;
  const isClosed = !isOpened;

  const { theme } = useThemeContext();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leftSidebarActiveDropdown_rn");
      if (saved) return saved;
      if (window.location.pathname.includes("/exit-")) return "RN Programs";
    }
    return "RN Programs";
  });

  const [openSubDropdowns, setOpenSubDropdowns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      "explore-lpn-nursing": true,
      "explore-lpn-exit": false,
    };
    return initial;
  });

  const toggleSubDropdown = (key: string) => {
    setOpenSubDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [isMounted, setIsMounted] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useSidebarAutoScroll({
    sidebarScrollContainerSelector: ".left-sidebar-scroll",
    sidebarActiveDropdownKey: activeDropdown,
    sidebarScrollMaxAttempts: 30,
    sidebarScrollRetryDelay: 100,
  });

  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (isMobile) {
        close();
      }
    }
  }, [pathname, isMobile, close]);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted || isClosed) return null;

  const isLightSidebar =
    (theme.leftSidebar === "system" ? theme.global : theme.leftSidebar) === "light";

  const sidebarWidth = "w-64";

  const toggleDropdown = (key: string) => {
    let newActive: string | null;
    if (!isOpened) {
      open();
      setTimeout(() => {
        newActive = activeDropdown === key ? null : key;
        setActiveDropdown(newActive);
        if (typeof window !== "undefined") localStorage.setItem("leftSidebarActiveDropdown_rn", newActive || "");
      }, 250);
    } else {
      newActive = activeDropdown === key ? null : key;
      setActiveDropdown(newActive);
      if (typeof window !== "undefined") localStorage.setItem("leftSidebarActiveDropdown_rn", newActive || "");
    }
  };

  const handleItemClick = () => {
    if (isMobile) {
      close();
      return;
    }
    if (isCollapsed) {
      open();
    }
  };

  const handleItemHover = (item: string, e: React.MouseEvent) => {
    if (isCollapsed) {
      setHoveredItem(item);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 8,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const handleMouseLeave = () => setHoveredItem(null);

  const sharedNavProps = {
    isOpened,
    isCollapsed,
    hoveredItem,
    handleItemHover,
    handleMouseLeave,
    tooltipPosition,
    handleItemClick,
    isMobile,
  };

  return (
    <>
      {isMobile && isOpened && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={close}
        />
      )}

      <aside
        className={`fixed top-14 left-0 z-40 flex flex-col h-[calc(100vh-56px)]
          ${isMobile
            ? (isOpened ? "w-64 shadow-2xl" : "w-0 overflow-hidden border-r-0 pointer-events-none")
            : sidebarWidth}
          transition-all duration-300 ease-in-out
          shadow-md border-r border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100`}
        style={{
          backgroundColor: "var(--leftSidebar-bg, #0f172a)",
          color: "var(--text-color)",
        }}
      >
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800"
      >
        <div className={`flex-1 ${!isOpened && "justify-center flex"}`}>
          <Link
            href={`/dashboards/${DASHBOARD_NAME}`}
            onClick={isMobile ? close : undefined}
            className={`${isMobile ? "text-base" : "text-lg"} font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors`}
          >
            {isOpened ? APP_TITLE : APP_ACRONYM}
          </Link>
        </div>

        {isOpened && (
          <button
            onClick={close}
            aria-label="Close sidebar"
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto space-y-1 p-2 pb-4 left-sidebar-scroll ${isMobile ? "text-xs" : ""}`}>

        <Link href="/" onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Return Home", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-100 select-none
              ${!isOpened && "justify-center"}`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-300" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Return Home</span>}

            {isCollapsed && hoveredItem === "Return Home" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Return Home
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ── Quick Practice Hero Button ── */}
        {isOpened ? (
          <div className="px-1 py-1.5">
            <Link
              href="/pages/sample-questions"
              onClick={handleItemClick}
              className="group relative flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 hover:from-teal-500 hover:to-sky-600 text-white shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                </span>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold leading-tight truncate">Quick Practice</div>
                  <div className="text-[10px] text-teal-100/90 leading-tight truncate">Daily Clinical Drill</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        ) : (
          <Link
            href="/pages/sample-questions"
            onClick={handleItemClick}
            className="flex items-center justify-center py-2 px-1 rounded-lg text-amber-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
            title="Quick Practice"
          >
            <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
          </Link>
        )}

        <div className="my-2 border-t border-[var(--text-color)]/10" />

                {/* MY ACCOUNT DATA MANAGEMENT */}
        {isOpened && (
          <div className="flex justify-center pt-1 pb-0.5">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-400 select-none">
              My Account Data Management
            </span>
          </div>
        )}

        {/* 1. My Progress */}
        <Link href={`${VISTA}/stats/progress`} onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Progress", e)}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center py-1.5 px-2 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer
              ${!isOpened && "justify-center"}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
            {isOpened && (
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                My Progress
              </span>
            )}

            {isCollapsed && hoveredItem === "My Progress" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                My Progress
              </Tooltip>
            )}
          </div>
        </Link>

        {/* 2. My Reports */}
        <Link href={`${VISTA}/stats/reports`} onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Reports", e)}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center py-1.5 px-2 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer
              ${!isOpened && "justify-center"}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </span>
            {isOpened && (
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                My Reports
              </span>
            )}

            {isCollapsed && hoveredItem === "My Reports" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                My Reports
              </Tooltip>
            )}
          </div>
        </Link>

        {/* 3. Subscription Packages */}
        <Link href={`${VISTA}/subscriptions/items`} onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Subscription Packages", e)}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center py-1.5 px-2 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer
              ${!isOpened && "justify-center"}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <Crown className="w-4 h-4" />
            </span>
            {isOpened && (
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                Subscription Packages
              </span>
            )}

            {isCollapsed && hoveredItem === "Subscription Packages" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Subscription Packages
              </Tooltip>
            )}
          </div>
        </Link>

        {/* 4. My Subscriptions */}
        <Link href={`${VISTA}/subscriptions/packages`} onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Subscriptions", e)}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center py-1.5 px-2 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer
              ${!isOpened && "justify-center"}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform shrink-0">
              <BadgeCheck className="w-4 h-4" />
            </span>
            {isOpened && (
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                My Subscriptions
              </span>
            )}

            {isCollapsed && hoveredItem === "My Subscriptions" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                My Subscriptions
              </Tooltip>
            )}
          </div>
        </Link>

        {/* 5. Account Settings */}
        <Link href={`/dashboards/${DASHBOARD_NAME}/auth/account/edit`} onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Account Settings", e)}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center py-1.5 px-2 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer
              ${!isOpened && "justify-center"}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform shrink-0">
              <UserCog className="w-4 h-4" />
            </span>
            {isOpened && (
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                Account Settings
              </span>
            )}

            {isCollapsed && hoveredItem === "Account Settings" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Account Settings
              </Tooltip>
            )}
          </div>
        </Link>

        {/* 6. Contact Us */}
        <Link href="/contact" onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Contact Us", e)}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center py-1.5 px-2 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer
              ${!isOpened && "justify-center"}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform shrink-0">
              <Headphones className="w-4 h-4" />
            </span>
            {isOpened && (
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                Contact Us
              </span>
            )}

            {isCollapsed && hoveredItem === "Contact Us" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Contact Us
              </Tooltip>
            )}
          </div>
        </Link>

        {/* 7. Need Help / Assistance */}
        <Link href="/support" onClick={handleItemClick}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Need Help / Assistance", e)}
            onMouseLeave={handleMouseLeave}
            className={`group relative flex items-center py-1.5 px-2 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer
              ${!isOpened && "justify-center"}`}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform shrink-0">
              <MessageCircleQuestion className="w-4 h-4" />
            </span>
            {isOpened && (
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                Need Help / Assistance
              </span>
            )}

            {isCollapsed && hoveredItem === "Need Help / Assistance" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Need Help / Assistance
              </Tooltip>
            )}
          </div>
        </Link>

        {isOpened && (
          <div className="pt-2">
            <div className="my-2 border-t border-slate-200/80 dark:border-slate-800" />
            <div className="px-1">
              <PerformanceIndexGauge
                bare
                scope="all"
                className="w-full bg-transparent"
              />
            </div>
          </div>
        )}

      </nav>

      {/* Profile Dropdown Below All Other Components */}
      {isOpened && (
        <div className="sm:hidden mt-auto shrink-0 border-t border-slate-200/80 dark:border-slate-800">
          <SidebarUserProfile panelSlug={DASHBOARD_NAME} onClose={close} />
        </div>
      )}
    </aside>
    </>
  );
}
