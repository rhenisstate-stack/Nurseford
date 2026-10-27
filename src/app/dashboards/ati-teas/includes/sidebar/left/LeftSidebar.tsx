"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  X,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  ClipboardList,
  Receipt,
  CreditCard,
  LifeBuoy,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useEffect, useState } from "react";
import { useSidebarAutoScroll } from "@/lib/hooks/nexus/includes/sidebars/useSidebarAutoScroll";

import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";
import { APP_TITLE, APP_ACRONYM } from "@/lib/config/config";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const PANEL = "ati-teas";
const VISTA = `/dashboards/${PANEL}/vista`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Small accordion group wrapper
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
          border border-transparent hover:border-[var(--text-color)]/40 select-none
          ${isOpened ? "justify-between" : "justify-center"}`}
      >
        <div className="flex items-center min-w-0">
          <Icon className="w-5 h-5 shrink-0" />
          {isOpened && (
            <span className={`ml-3 font-medium truncate ${isMobile ? "text-xs" : "text-sm"}`}>{label}</span>
          )}
        </div>

        {isOpened &&
          (isActive ? (
            <ChevronDown className="w-4 h-4 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ))}

        {!isOpened && hoveredItem === id && (
          <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
            {label}
          </Tooltip>
        )}
      </div>

      {isOpened && isActive && (
        <div className="ml-3 pl-3 mt-1 space-y-1 border-l border-[var(--text-color)]/15">
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
          border border-transparent hover:border-[var(--text-color)]/40 select-none
          ${isOpen ? "bg-[var(--text-color)]/5" : ""}
          ${isOpened ? "justify-between" : "justify-center"}`}
      >
        <div className="flex items-center min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isOpen ? "bg-indigo-400" : "bg-[var(--text-color)]/40"
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
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
          ))}
      </div>

      {isOpened && isOpen && (
        <div className="ml-3 pl-2.5 mt-1 space-y-1 border-l border-[var(--text-color)]/15">
          {children}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Simple nav link
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
  const isActive = exact
    ? pathname === href
    : pathname === href || (href !== "/" && href !== "/dashboards/rn-nursing" && href !== "/dashboards/lpn-nursing" && pathname?.startsWith(href));

  return (
    <Link href={href} onClick={handleItemClick}>
      <div
        onClick={handleItemClick}
        onMouseEnter={(e) => handleItemHover(label, e)}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center py-1.5 px-1 rounded-lg transition
          border border-transparent select-none
          ${isActive
            ? "bg-[var(--text-color)]/10 border-[var(--text-color)]/40 font-medium"
            : "hover:border-[var(--text-color)]/40"
          }
          ${isOpened ? "justify-start" : "justify-center"}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isActive ? "bg-indigo-400" : "bg-[var(--text-color)]/40"
          }`}
        />
        {isOpened && <span className={`ml-2.5 truncate ${isMobile ? "text-xs" : "text-sm"}`}>{label}</span>}

        {isCollapsed && hoveredItem === label && (
          <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
            {label}
          </Tooltip>
        )}
      </div>
    </Link>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function LeftSidebar() {
  const DASHBOARD_NAME = "ati-teas";

  const { state, open, close } = useLeftSidebar();

  const isOpened = state === "opened";
  const isCollapsed = false;
  const isClosed = !isOpened;

  const { theme } = useThemeContext();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leftSidebarActiveDropdown");
      return saved || "TEAS 7 Prep Exams";
    }
    return "TEAS 7 Prep Exams";
  });

  const [openSubDropdowns, setOpenSubDropdowns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      "explore-rn-exit": true,
      "explore-lpn-exit": true,
    };
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p.includes("/exit-") && (p.includes("-rn") || p.includes("rn-nursing"))) {
        initial["explore-rn-exit"] = true;
      } else if (p.includes("/exit-") && (p.includes("-lpn") || p.includes("lpn-nursing"))) {
        initial["explore-lpn-exit"] = true;
      } else if (p.includes("rn-nursing")) {
        initial["explore-rn-nursing"] = true;
      } else if (p.includes("lpn-nursing")) {
        initial["explore-lpn-nursing"] = true;
      }
    }
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

  useEffect(() => setIsMounted(true), []);
  if (!isMounted || isClosed) return null;

  const isLightSidebar =
    (theme.leftSidebar === "system" ? theme.global : theme.leftSidebar) === "light";

  const sidebarWidth = isOpened ? "w-64" : "w-20";

  const toggleDropdown = (key: string) => {
    let newActive: string | null;
    if (!isOpened) {
      open();
      setTimeout(() => {
        newActive = activeDropdown === key ? null : key;
        setActiveDropdown(newActive);
        if (typeof window !== "undefined") localStorage.setItem("leftSidebarActiveDropdown", newActive || "");
      }, 250);
    } else {
      newActive = activeDropdown === key ? null : key;
      setActiveDropdown(newActive);
      if (typeof window !== "undefined") localStorage.setItem("leftSidebarActiveDropdown", newActive || "");
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

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  RENDER
  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpened && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={close}
        />
      )}

      <aside
        className={`fixed top-14 left-0 z-40 flex flex-col h-[calc(100vh-56px)]
          ${isMobile ? (isOpened ? "w-64" : "w-0") : sidebarWidth}
          ${isMobile && isClosed ? "overflow-hidden" : ""}
          transition-all duration-300 ease-in-out
          shadow-md border-r border-[var(--text-color)]/10`}
        style={{
          backgroundColor: "var(--leftSidebar-bg, #000f25)",
          color: "var(--text-color)",
        }}
      >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-[var(--text-color)]/10
          ${isLightSidebar ? "border-gray-200" : ""}`}
      >
        <div className={`flex-1 ${!isOpened && "justify-center flex"}`}>
          <Link
            href={`/dashboards/${DASHBOARD_NAME}`}
            className={`${isMobile ? "text-base" : "text-lg"} font-semibold ${isLightSidebar
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

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto space-y-1 p-2 left-sidebar-scroll ${isMobile ? "text-xs" : ""}`}>

        {/* My Dashboard */}
        <Link href={`/dashboards/${DASHBOARD_NAME}`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Dashboard", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>My Dashboard</span>}

            {isCollapsed && hoveredItem === "My Dashboard" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                My Dashboard
              </Tooltip>
            )}
          </div>
        </Link>

        {/* Return Home */}
        <Link href="/">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Return Home", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Return Home</span>}

            {isCollapsed && hoveredItem === "Return Home" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Return Home
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─── TEAS 7 Prep Exams ─── */}
        <AccordionGroup
          id="TEAS 7 Prep Exams"
          icon={ClipboardCheck}
          label="TEAS 7 Prep Exams"
          isActive={activeDropdown === "TEAS 7 Prep Exams"}
          onToggle={toggleDropdown}
          {...sharedNavProps}
        >
          <NavItem href="/dashboards/ati-teas/exams/comprehensive-ati-teas-tests/5" label="Comprehensive TEAS 7 Prep" {...sharedNavProps} />
          <NavItem href="/dashboards/ati-teas/exams/english/6" label="English" {...sharedNavProps} />
          <NavItem href="/dashboards/ati-teas/exams/math/7" label="Math" {...sharedNavProps} />
          <NavItem href="/dashboards/ati-teas/exams/reading-comprehension/8" label="Reading Comprehension" {...sharedNavProps} />
          <NavItem href="/dashboards/ati-teas/exams/science/9" label="Science" {...sharedNavProps} />
        </AccordionGroup>

        {/* ─── Explore More Products ─── */}
        <AccordionGroup
          id="Explore More Products"
          icon={Sparkles}
          label="Explore More Products"
          isActive={activeDropdown === "Explore More Products"}
          onToggle={toggleDropdown}
          {...sharedNavProps}
        >
          <NavItem href="/dashboards/hesi-a2" label="HESI A2" {...sharedNavProps} />

          {/* RN Nursing Exams Sub-Accordion */}
          <SubAccordionGroup
            id="explore-rn-nursing"
            label="RN Nursing Exams"
            isOpen={!!openSubDropdowns["explore-rn-nursing"]}
            onToggle={toggleSubDropdown}
            isOpened={isOpened}
            isMobile={isMobile}
          >
            <NavItem href="/dashboards/rn-nursing" label="All RN Nursing Exams" exact {...sharedNavProps} />
            <NavItem href="/dashboards/rn-nursing/exams/ati-exams-rn/34" label="ATI Exam (RN)" {...sharedNavProps} />
            <NavItem href="/dashboards/rn-nursing/exams/examplify-practice-rn/35" label="EXAMPLIFY Practice" {...sharedNavProps} />
            <NavItem href="/dashboards/rn-nursing/exams/general-exams/38" label="GENERAL Exams" {...sharedNavProps} />
            <NavItem href="/dashboards/rn-nursing/exams/hesi-exams-rn/39" label="HESI EXAM (RN)" {...sharedNavProps} />
          </SubAccordionGroup>

          {/* RN Exit Exams Sub-Accordion */}
          <SubAccordionGroup
            id="explore-rn-exit"
            label="RN Exit Exams"
            isOpen={!!openSubDropdowns["explore-rn-exit"]}
            onToggle={toggleSubDropdown}
            isOpened={isOpened}
            isMobile={isMobile}
          >
            <NavItem href="/dashboards/rn-nursing/exams/exit-ati-exams-rn/36" label="EXIT ATI Exams-RN" {...sharedNavProps} />
            <NavItem href="/dashboards/rn-nursing/exams/exit-hesi-exams-rn/37" label="EXIT HESI Exams-RN" {...sharedNavProps} />
          </SubAccordionGroup>

          {/* LPN Nursing Exams Sub-Accordion */}
          <SubAccordionGroup
            id="explore-lpn-nursing"
            label="LPN Nursing Exams"
            isOpen={!!openSubDropdowns["explore-lpn-nursing"]}
            onToggle={toggleSubDropdown}
            isOpened={isOpened}
            isMobile={isMobile}
          >
            <NavItem href="/dashboards/lpn-nursing" label="All LPN Nursing Exams" exact {...sharedNavProps} />
            <NavItem href="/dashboards/lpn-nursing/exams/ati-exams-lpn/21" label="ATI Exams (LPN)" {...sharedNavProps} />
            <NavItem href="/dashboards/lpn-nursing/exams/examplify-practice-pn/22" label="EXAMPLIFY Practice (PN)" {...sharedNavProps} />
            <NavItem href="/dashboards/lpn-nursing/exams/hesi-exams-lpn/25" label="HESI Exams (LPN)" {...sharedNavProps} />
            <NavItem href="/dashboards/lpn-nursing/exams/kaplan-exams/26" label="KAPLAN EXAMS" {...sharedNavProps} />
          </SubAccordionGroup>

          {/* LPN Exit Exams Sub-Accordion */}
          <SubAccordionGroup
            id="explore-lpn-exit"
            label="LPN Exit Exams"
            isOpen={!!openSubDropdowns["explore-lpn-exit"]}
            onToggle={toggleSubDropdown}
            isOpened={isOpened}
            isMobile={isMobile}
          >
            <NavItem href="/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23" label="EXIT ATI Exams-LPN" {...sharedNavProps} />
            <NavItem href="/dashboards/lpn-nursing/exams/exit-hesi-exams-lpn/24" label="EXIT HESI Exams-LPN" {...sharedNavProps} />
          </SubAccordionGroup>

          <NavItem href="/dashboards/nclex-rn" label="NCLEX-RN" {...sharedNavProps} />
          <NavItem href="/dashboards/nclex-pn" label="NCLEX-PN" {...sharedNavProps} />
        </AccordionGroup>

        {/* ─── Divider ─── */}
        <div className="my-2 border-t border-[var(--text-color)]/10" />

        {/* Section Label: MY ACCOUNT DATA MANAGEMENT */}
        {isOpened && (
          <div className="flex justify-center p-0">
            <span className="text-[10px] font-semibold tracking-widest uppercase opacity-50 select-none">
              My Account Data Management
            </span>
          </div>
        )}

        {/* My Progress */}
        <Link href={`${VISTA}/stats/progress`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Progress", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>My Progress</span>}

            {isCollapsed && hoveredItem === "My Progress" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                My Progress
              </Tooltip>
            )}
          </div>
        </Link>

        {/* My Reports */}
        <Link href={`${VISTA}/stats/reports`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Reports", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <ClipboardList className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>My Reports</span>}

            {isCollapsed && hoveredItem === "My Reports" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                My Reports
              </Tooltip>
            )}
          </div>
        </Link>

        {/* My Subscriptions */}
        <Link href={`${VISTA}/subscriptions/packages`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("My Subscriptions", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <Receipt className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>My Subscriptions</span>}

            {isCollapsed && hoveredItem === "My Subscriptions" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                My Subscriptions
              </Tooltip>
            )}
          </div>
        </Link>

        {/* Subscription Packages */}
        <Link href={`${VISTA}/subscriptions/items`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Subscription Packages", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <CreditCard className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Subscription Packages</span>}

            {isCollapsed && hoveredItem === "Subscription Packages" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Subscription Packages
              </Tooltip>
            )}
          </div>
        </Link>

        {/* Contact Us */}
        <Link href="/contact">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Contact Us", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <LifeBuoy className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Contact Us</span>}

            {isCollapsed && hoveredItem === "Contact Us" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Contact Us
              </Tooltip>
            )}
          </div>
        </Link>

        {/* Need Help / Assistance */}
        <Link href="/support">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Need Help / Assistance", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
              border border-transparent hover:border-[var(--text-color)]/40 select-none
              ${!isOpened && "justify-center"}`}
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            {isOpened && <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Need Help / Assistance</span>}

            {isCollapsed && hoveredItem === "Need Help / Assistance" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Need Help / Assistance
              </Tooltip>
            )}
          </div>
        </Link>

      </nav>
    </aside>
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
