"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Receipt,
  CreditCard,
  LifeBuoy,
  HelpCircle,
  Settings,
  X,
} from "lucide-react";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { APP_TITLE } from "@/lib/config/config";
import SidebarUserProfile from "@/components/common/user/SidebarUserProfile";
import PerformanceIndexGauge from "@/components/common/dashboards/PerformanceIndexGauge";

const VISTA_RN = "/dashboards/rn-nursing/vista";

export default function CoursesLeftSidebar() {
  const { isOpened, close, isMobile = false } = useLeftSidebar();

  const handleItemClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpened && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[57px] sm:top-[61px] left-0 bottom-0 z-40 flex flex-col w-64
          transition-transform duration-300 ease-in-out
          bg-white dark:bg-[#0f172a] border-r border-slate-200/90 dark:border-slate-800 shadow-sm
          ${isOpened ? "translate-x-0" : "-translate-x-full pointer-events-none"}`}
      >
        {/* Header inside sidebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
          <Link
            href="/"
            onClick={isMobile ? close : undefined}
            className="text-base font-bold text-navy dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            {APP_TITLE}
          </Link>
          <button
            onClick={close}
            aria-label="Close sidebar"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <nav className="flex-1 overflow-y-auto space-y-1 p-2.5 pb-4 left-sidebar-scroll">
          {/* Return Home */}
          <Link href="/" onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-100 select-none cursor-pointer">
              <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
              <span className={`ml-3 font-semibold ${isMobile ? "text-xs" : "text-sm"}`}>Return Home</span>
            </div>
          </Link>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {/* MY ACCOUNT DATA MANAGEMENT */}
          <div className="px-2.5 py-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 select-none">
              My Account Data Management
            </span>
          </div>

          <Link href="/dashboards/rn-nursing/auth/account/edit" onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <Settings className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Account Settings</span>
            </div>
          </Link>

          <Link href={`${VISTA_RN}/stats/progress`} onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <BarChart3 className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>My Progress</span>
            </div>
          </Link>

          <Link href={`${VISTA_RN}/stats/reports`} onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <ClipboardList className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>My Reports</span>
            </div>
          </Link>

          <Link href={`${VISTA_RN}/subscriptions/packages`} onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <Receipt className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>My Subscriptions</span>
            </div>
          </Link>

          <Link href={`${VISTA_RN}/subscriptions/items`} onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <CreditCard className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Subscription Packages</span>
            </div>
          </Link>

          <Link href="/pages/contact-us" onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <LifeBuoy className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Contact Us</span>
            </div>
          </Link>

          <Link href="/pages/contact-us" onClick={handleItemClick}>
            <div className="flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <HelpCircle className="w-4 h-4 shrink-0 text-slate-500" />
              <span className={`ml-3 font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Need Help / Assistance</span>
            </div>
          </Link>

          <div className="my-2.5 border-t border-slate-100 dark:border-slate-800" />

          {/* Syringe Performance Index Gauge at the bottom (borderless / unboxed) */}
          <div className="my-2 px-1">
            <PerformanceIndexGauge
              bare
              scope="rn-nursing"
              className="w-full bg-transparent"
            />
          </div>
        </nav>

        {/* Profile Dropdown Below All Other Components */}
        <div className="sm:hidden mt-auto shrink-0 border-t border-slate-200/80 dark:border-slate-800">
          <SidebarUserProfile panelSlug="rn-nursing" onClose={close} />
        </div>
      </aside>
    </>
  );
}
