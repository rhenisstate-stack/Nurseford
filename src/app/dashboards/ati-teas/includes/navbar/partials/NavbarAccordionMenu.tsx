"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FolderTree,
  GraduationCap,
  BarChart3,
  Receipt,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { APP_TITLE } from "@/lib/config/config";
import { useSidebarAutoScroll } from "@/lib/hooks/nexus/includes/sidebars/useSidebarAutoScroll";

import LeftSidebarProgramHierarchyOutline from "../../sidebar/partials/left/vista/outline/VistaHierarchyProgramOutline";
import LeftSidebarProgress from "../../sidebar/partials/left/elements/Progress";
import LeftSidebarReports from "../../sidebar/partials/left/elements/Reports";
import LeftSidebarSubscriptionPackages from "../../sidebar/partials/left/elements/SubscriptionPackages";
import LeftSidebarSubscriptionItems from "../../sidebar/partials/left/elements/SubscriptionItems";
import LeftSidebarContact from "../../sidebar/partials/left/elements/Contact";
import LeftSidebarSupport from "../../sidebar/partials/left/elements/Support";
import LeftSidebarTerms from "../../sidebar/partials/left/elements/Terms";
import LeftSidebarAbout from "../../sidebar/partials/left/elements/About";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const PANEL = "ati-teas";
const VISTA = `/dashboards/${PANEL}/vista`;

// Props shared by the sidebar partial components
const partialProps = {
  isOpened: true,
  hoveredItem: null,
  handleItemHover: () => {},
  handleMouseLeave: () => {},
  tooltipPosition: { x: 0, y: 0 },
  handleItemClick: () => {},
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Accordion group wrapper (always expanded — labels always visible)
function AccordionGroup({
  id,
  icon: Icon,
  label,
  isActive,
  onToggle,
  children,
}: {
  id: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Group header */}
      <div
        target-scroll-item-accordion-key={id}
        onClick={() => onToggle(id)}
        className={`flex items-center justify-between py-2 px-2 rounded-lg transition cursor-pointer select-none border
          ${isActive
            ? "border-[var(--text-color)]/40 bg-[var(--text-color)]/10"
            : "border-transparent hover:border-[var(--text-color)]/40"
          }`}
      >
        <div className="flex items-center min-w-0">
          <Icon className="w-5 h-5 shrink-0" />
          <span className="ml-3 text-sm font-bold truncate">{label}</span>
        </div>

        {isActive ? (
          <ChevronDown className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" />
        )}
      </div>

      {/* Group content */}
      {isActive && (
        <div className="ml-3 pl-3 mt-1 mb-1 space-y-1 border-l border-[var(--text-color)]/15">
          {children}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Simple nav link
function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(href);

  return (
    <Link href={href}>
      <div
        className={`relative flex items-center py-1.5 px-2 rounded-lg transition select-none border
          ${isActive
            ? "bg-[var(--text-color)]/10 border-[var(--text-color)]/40 font-medium"
            : "border-transparent hover:border-[var(--text-color)]/40"
          }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isActive ? "bg-indigo-400" : "bg-[var(--text-color)]/40"
          }`}
        />
        <span className="ml-2.5 text-sm truncate">{label}</span>
      </div>
    </Link>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function NavbarAccordionMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("Overview");

  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close on outside click + Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Auto-scroll to the active accordion section
  useSidebarAutoScroll({
    sidebarScrollContainerSelector: ".navbar-accordion-scroll",
    sidebarActiveDropdownKey: openAccordion,
    sidebarScrollMaxAttempts: 30,
    sidebarScrollRetryDelay: 100,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordion((current) => (current === key ? null : key));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Menu toggle */}
      <button
        onClick={() => setIsMenuOpen((open) => !open)}
        className="flex items-center justify-center w-10 h-10 border rounded-lg border-[var(--text-color)]/25 hover:bg-[var(--text-color)]/10 transition-colors"
        aria-label="Toggle Navigation Menu"
      >
        {isMenuOpen ? (
          <X className="w-5 h-5" strokeWidth={2.5} />
        ) : (
          <Menu className="w-5 h-5" strokeWidth={2.5} />
        )}
      </button>

      {/* Dropdown accordion panel */}
      {isMenuOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-[var(--text-color)]/15 shadow-2xl"
          style={{
            backgroundColor: "var(--leftSidebar-bg)",
            color: "var(--text-color)",
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--text-color)]/10">
            <Link
              href={`/dashboards/${PANEL}`}
              className="text-sm font-bold text-[var(--text-color)] hover:opacity-80"
            >
              {APP_TITLE}
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu"
              className="p-1 rounded hover:bg-[var(--text-color)]/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Accordion navigation */}
          <nav className="overflow-y-auto p-2 max-h-[calc(100vh-6.5rem)] space-y-1 navbar-accordion-scroll">
            {/* Overview */}
            <AccordionGroup
              id="Overview"
              icon={LayoutDashboard}
              label="Overview"
              isActive={openAccordion === "Overview"}
              onToggle={toggleAccordion}
            >
              <NavItem href={`/dashboards/${PANEL}`} label="My Dashboard" />
              <NavItem href="/" label="Return Home" />
            </AccordionGroup>

            {/* Programs */}
            <AccordionGroup
              id="Programs"
              icon={FolderTree}
              label="Programs"
              isActive={openAccordion === "Programs"}
              onToggle={toggleAccordion}
            >
              <LeftSidebarProgramHierarchyOutline {...partialProps} />
            </AccordionGroup>

            {/* Exams & Assessments */}
            <AccordionGroup
              id="ExamsAssessments"
              icon={BookOpen}
              label="Exams & Assessments"
              isActive={openAccordion === "ExamsAssessments"}
              onToggle={toggleAccordion}
            >
              <NavItem href={`${VISTA}/assessment/exams/absolute/overview`} label="All Exams" />
              <NavItem href={`${VISTA}/assessment/exams/distinct/overview`} label="Your Exams" />
              <NavItem href={`${VISTA}/assessment/assessments/absolute/overview`} label="All Assessments" />
              <NavItem href={`${VISTA}/assessment/assessments/distinct/overview`} label="Your Assessments" />
            </AccordionGroup>

            {/* Learning */}
            <AccordionGroup
              id="Learning"
              icon={GraduationCap}
              label="Learning"
              isActive={openAccordion === "Learning"}
              onToggle={toggleAccordion}
            >
              <NavItem href={`${VISTA}/learning/courses/absolute/overview`} label="Courses" />
              <NavItem href={`${VISTA}/learning/programs/absolute/overview`} label="Programs" />
              <NavItem href={`${VISTA}/learning/subjects/absolute/overview`} label="Subjects" />
            </AccordionGroup>

            {/* Stats */}
            <AccordionGroup
              id="Stats"
              icon={BarChart3}
              label="Stats"
              isActive={openAccordion === "Stats"}
              onToggle={toggleAccordion}
            >
              <LeftSidebarProgress {...partialProps} />
              <LeftSidebarReports {...partialProps} />
            </AccordionGroup>

            {/* Subscriptions */}
            <AccordionGroup
              id="Subscriptions"
              icon={Receipt}
              label="Subscriptions"
              isActive={openAccordion === "Subscriptions"}
              onToggle={toggleAccordion}
            >
              <LeftSidebarSubscriptionPackages {...partialProps} />
              <LeftSidebarSubscriptionItems {...partialProps} />
            </AccordionGroup>

            {/* Support */}
            <AccordionGroup
              id="Support"
              icon={LifeBuoy}
              label="Support"
              isActive={openAccordion === "Support"}
              onToggle={toggleAccordion}
            >
              <LeftSidebarContact {...partialProps} />
              <LeftSidebarSupport {...partialProps} />
              <LeftSidebarTerms {...partialProps} />
              <LeftSidebarAbout {...partialProps} />
            </AccordionGroup>
          </nav>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
