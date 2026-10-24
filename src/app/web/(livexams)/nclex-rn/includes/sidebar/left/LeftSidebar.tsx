"use client";

import Link from "next/link";
import { Home, LayoutDashboard, Settings, X } from "lucide-react";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useEffect, useState } from "react";
import { useSidebarAutoScroll } from "@/lib/hooks/nexus/includes/sidebars/useSidebarAutoScroll";

import LeftSidebarDashboardDropdown from "../partials/left/dashboards/DashboardDropdown";

import LeftSidebarContentDropdown from "../partials/left/content/ContentDropdown";
import LeftSidebarDocumentDropdown from "../partials/left/content/DocumentDropdown";
import LeftSidebarMachineLearningDropdown from "../partials/left/cognition/MachineLearningDropdown";

import LeftSidebarProgramHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchyProgramDropdown";
import LeftSidebarCourseHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchyCourseDropdown";
import LeftSidebarSubjectHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchySubjectDropdown";
import LeftSidebarUnitHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchyUnitDropdown";
import LeftSidebarLessonHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchyLessonDropdown";
import LeftSidebarTopicHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchyTopicDropdown";
import LeftSidebarConceptHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchyConceptDropdown";
import LeftSidebarFactHierarchyDropdown from "../partials/left/vista/learning/VistaHierarchyFactDropdown";

import LeftSidebarAssessmentHierarchyDropdown from "../partials/left/vista/assessment/VistaHierarchyAssessmentDropdown";
import LeftSidebarExamHierarchyDropdown from "../partials/left/vista/assessment/VistaHierarchyExamDropdown";

import LeftSidebarAbout from "../partials/left/elements/About";
import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";
import { APP_TITLE, APP_ACRONYM } from "@/lib/config/config";

export default function LeftSidebar() {

  const DASHBOARD_NAME = "Exams";

  const { state, open, close } = useLeftSidebar();

  const isOpened = state === "opened";
  const isCollapsed = state === "collapsed";
  const isClosed = state === "closed";

  const { theme } = useThemeContext();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("leftSidebarActiveDropdown") || null;
    }
    return null;
  });

  const [isMounted, setIsMounted] = useState(false);

  //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // On Reaload Auto Scroll to Active Dropdown (if any)
  useSidebarAutoScroll({
    sidebarScrollContainerSelector: ".left-sidebar-scroll", // or ".right-sidebar-scroll" for right sidebar
    sidebarActiveDropdownKey: activeDropdown,
    sidebarScrollMaxAttempts: 30, // Try for up to 3 seconds (30 * 100ms)
    sidebarScrollRetryDelay: 100, // Check every 100ms
  });

  //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 🚨 EARLY RETURN MUST COME AFTER ALL HOOKS
  useEffect(() => setIsMounted(true), []);
  if (!isMounted || isClosed) return null;

  //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  THEME + LAYOUT
  const isLightSidebar =
    (theme.leftSidebar === "system" ? theme.global : theme.leftSidebar) === "light";

  const sidebarWidth = isOpened ? "w-64" : "w-20";

  //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  HANDLERS
  const toggleDropdown = (key: string) => {
    let newActive: string | null;
    if (!isOpened) {
      open(); // 👈 FORCE OPEN (NOT toggle)
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
    if (isCollapsed) {
      open();      // 👈 FORCE OPEN
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

  //───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  //  RENDER
  return (

    <aside
      className={`fixed top-16 leftSidebar-0 z-40 flex flex-col h-[calc(100vh-64px)]
    ${sidebarWidth}
    transition-all duration-300 ease-in-out
    shadow-md border-r`}
      style={{
        backgroundColor: "var(--leftSidebar-bg)",
        color: "var(--text-color)",
      }}
    >

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b
        ${isLightSidebar ? "border-gray-200" : "border-gray-700"}`}
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
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto space-y-1 p-2 left-sidebar-scroll">
        {/* Dashboard */}
        <Link href={`/dashboards/${DASHBOARD_NAME.toLowerCase()}`}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Dashboard", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center py-2 px-1 rounded-lg transition
            border-1 border-transparent hover:border-gray-900 select-none
            ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
            ${!isOpened && "justify-center"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {isOpened && <span className="ml-3">My Dashboard</span>}

            {isCollapsed && hoveredItem === "Dashboard" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
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
            border-1 border-transparent hover:border-gray-900 select-none
            ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
            ${!isOpened && "justify-center"}`}
          >
            <Home className="w-5 h-5" />
            {isOpened && <span className="ml-3">Return Home</span>}

            {isCollapsed && hoveredItem === "Home" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Home
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}


        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Dashboards */}
        <LeftSidebarDashboardDropdown
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

        {/* Settings */}
        <Link href="/dashboards/exams/vista/strata/assessment/assessments/absolute/overview">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Settings", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center p-2 rounded-lg transition
          border border-transparent hover:border-gray-900 select-none
          ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
          ${!isOpened && "justify-center"}`}
          >
            <Settings className="w-5 h-5" />
            {isOpened && <span className="ml-3">Get Started Now</span>}

            {isCollapsed && hoveredItem === "Settings" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Settings
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Settings */}
        <Link href="/dashboards/exams/vista/strata/assessment/learning/assessments/absolute/overview">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Settings", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center p-2 rounded-lg transition
          border border-transparent hover:border-gray-900 select-none
          ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
          ${!isOpened && "justify-center"}`}
          >
            <Settings className="w-5 h-5" />
            {isOpened && <span className="ml-3">Start Learning Now</span>}

            {isCollapsed && hoveredItem === "Settings" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Settings
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Settings */}
        <Link href="/dashboards/atiteas/vista/assessments/absolute/overview">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Settings", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center p-2 rounded-lg transition
          border border-transparent hover:border-gray-900 select-none
          ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
          ${!isOpened && "justify-center"}`}
          >
            <Settings className="w-5 h-5" />
            {isOpened && <span className="ml-3">Start Learning AtiTeas</span>}

            {isCollapsed && hoveredItem === "Settings" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Settings
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="space-y-8">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {isOpened && (
          <div className="flex justify-center p-0">
            <span className="text-[10px] tracking-wide uppercase opacity-50 select-none">
              Learning Hierarchy List / Cards
            </span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <LeftSidebarProgramHierarchyDropdown
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

        <LeftSidebarCourseHierarchyDropdown
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

        <LeftSidebarSubjectHierarchyDropdown
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

        <LeftSidebarUnitHierarchyDropdown
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

        <LeftSidebarLessonHierarchyDropdown
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

        <LeftSidebarTopicHierarchyDropdown
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

        <LeftSidebarConceptHierarchyDropdown
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

        <LeftSidebarFactHierarchyDropdown
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

        <div className="space-y-3">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {isOpened && (
          <div className="flex justify-center p-0">
            <span className="text-[10px] tracking-wide uppercase opacity-50 select-none">
              Assessment Hierarchy List / Cards
            </span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <LeftSidebarAssessmentHierarchyDropdown
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

        <LeftSidebarExamHierarchyDropdown
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

        <div className="space-y-18">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}



        {isOpened && (
          <div className="flex justify-center p-0">
            <span className="text-[10px] tracking-wide uppercase opacity-50 select-none">
              My Contents &amp; Documents
            </span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <LeftSidebarContentDropdown
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

        <LeftSidebarDocumentDropdown
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




        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="space-y-8">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {isOpened && (
          <div className="flex justify-center p-0">
            <span className="text-[10px] tracking-wide uppercase opacity-50 select-none">
              AL / ML Management
            </span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <LeftSidebarMachineLearningDropdown
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




        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="space-y-8">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Settings */}
        <Link href="/dashboards/admin/settings">
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover("Settings", e)}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center p-2 rounded-lg transition
          border border-transparent hover:border-gray-900 select-none
          ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
          ${!isOpened && "justify-center"}`}
          >
            <Settings className="w-5 h-5" />
            {isOpened && <span className="ml-3">Settings</span>}

            {isCollapsed && hoveredItem === "Settings" && (
              <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
                Settings
              </Tooltip>
            )}
          </div>
        </Link>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* LeftSidebarAbout */}
        <LeftSidebarAbout
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





        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="space-y-18">
          <hr className="dark:border-[var(--text-color)]" />
          <hr className="dark:border-[var(--text-color)]" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      </nav>
    </aside>
  );
}
