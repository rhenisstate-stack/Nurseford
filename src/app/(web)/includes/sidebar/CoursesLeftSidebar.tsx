"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  TrendingUp,
  FileCheck2,
  Crown,
  BadgeCheck,
  UserCog,
  Headphones,
  MessageCircleQuestion,
  X,
  Zap,
  ArrowRight,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { APP_TITLE } from "@/lib/config/config";
import SidebarUserProfile from "@/components/common/user/SidebarUserProfile";
import PerformanceIndexGauge from "@/components/common/dashboards/PerformanceIndexGauge";

export default function CoursesLeftSidebar() {
  const { isOpened, close, isMobile = false } = useLeftSidebar();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const track = searchParams?.get("track") || "";

  const isLpn =
    pathname.includes("lpn") ||
    pathname.includes("nclex-pn") ||
    track === "lpn" ||
    track === "exit";

  const vistaPath = isLpn
    ? "/dashboards/lpn-nursing/vista"
    : "/dashboards/rn-nursing/vista";

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
                    {/* Return to Dashboard */}
          <Link href={isLpn ? "/dashboards/lpn-nursing" : "/dashboards/rn-nursing"} onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-100 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform shrink-0">
                <LayoutDashboard className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-bold tracking-tight text-teal-700 dark:text-teal-300 ${isMobile ? "text-xs" : "text-sm"}`}>
                Dashboard
              </span>
            </div>
          </Link>

          {/* Return Home */}
          <Link href="/" onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-100 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-500/10 text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform shrink-0">
                <Home className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-medium tracking-tight text-slate-600 dark:text-slate-400 ${isMobile ? "text-xs" : "text-sm"}`}>
                Return Home
              </span>
            </div>
          </Link>

          {/* Quick Practice Hero Button */}
          <div className="py-1">
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
                  <div className="text-[10px] text-teal-100/90 leading-tight truncate">Daily Practice Drill</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {/* MY ACCOUNT DATA MANAGEMENT */}
          <div className="px-2.5 py-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 select-none">
              My Account Data Management
            </span>
          </div>

          {/* 1. Daily Analytics & Clinical Progress */}
          <Link href={`${vistaPath}/stats/progress`} onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${isMobile ? "text-xs" : "text-sm"}`}>
                My Progress
              </span>
            </div>
          </Link>

          {/* 2. Exam Diagnostic Reports & Scorecards */}
          <Link href={`${vistaPath}/stats/reports`} onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${isMobile ? "text-xs" : "text-sm"}`}>
                My Reports
              </span>
            </div>
          </Link>

          {/* 3. Browse & Unlock Subscription Plans */}
          <Link href={`${vistaPath}/subscriptions/items`} onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                <Crown className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${isMobile ? "text-xs" : "text-sm"}`}>
                Subscription Packages
              </span>
            </div>
          </Link>

          {/* 4. Active Subscriptions & Invoices */}
          <Link href={`${vistaPath}/subscriptions/packages`} onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${isMobile ? "text-xs" : "text-sm"}`}>
                My Subscriptions
              </span>
            </div>
          </Link>

          {/* 5. User Account Credentials & Profile */}
          <Link
            href={isLpn ? "/dashboards/lpn-nursing/auth/account/edit" : "/dashboards/rn-nursing/auth/account/edit"}
            onClick={handleItemClick}
          >
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                <UserCog className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${isMobile ? "text-xs" : "text-sm"}`}>
                Account Settings
              </span>
            </div>
          </Link>

          {/* 6. Contact Support */}
          <Link href="/pages/contact-us" onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                <Headphones className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${isMobile ? "text-xs" : "text-sm"}`}>
                Contact Us
              </span>
            </div>
          </Link>

          {/* 7. Need Help / Assistance */}
          <Link href="/pages/contact-us" onClick={handleItemClick}>
            <div className="group flex items-center py-2 px-2.5 rounded-xl transition hover:bg-slate-100/90 dark:hover:bg-slate-800/70 select-none cursor-pointer">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                <MessageCircleQuestion className="w-4 h-4" />
              </span>
              <span className={`ml-3 font-semibold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors ${isMobile ? "text-xs" : "text-sm"}`}>
                Need Help / Assistance
              </span>
            </div>
          </Link>

          <div className="my-2.5 border-t border-slate-100 dark:border-slate-800" />

          {/* Syringe Performance Index Gauge at the bottom (borderless / unboxed) */}
          <div className="my-2 px-1">
            <PerformanceIndexGauge
              bare
              scope="all"
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
