"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { Sun, Sunset, Moon, Calendar, CreditCard, Receipt } from "lucide-react";
import PerformanceIndexGauge from "@/components/common/dashboards/PerformanceIndexGauge";
import NursingStudyNotesCard from "@/components/common/dashboards/elements/NursingStudyNotesCard";
import { SubjectPlaceholderGrid } from "@/components/common/dashboards/elements/SubjectDataPlaceholders";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";

export interface NursingDashboardHomeProps {
  programScope: "rn-nursing" | "lpn-nursing";
  heading: string;
}

function NursingDashboardHomeContent({
  programScope,
  heading,
}: NursingDashboardHomeProps) {
  const searchParams = useSearchParams();
  const track = searchParams?.get("track")?.toLowerCase();

  const isRN = programScope === "rn-nursing";
  const displayHeading =
    track === "exit"
      ? (isRN ? "RN Exit Exams" : "LPN Exit Exams")
      : track === "nursing"
      ? (isRN ? "RN Nursing Exams" : "LPN Nursing Exams")
      : heading;

  const filteredExamTypes =
    track === "exit"
      ? [isRN ? "rn-exit" : "lpn-exit"]
      : track === "nursing"
      ? [programScope]
      : undefined;

  const { leftWidth } = useFlexPageClasp();

  const { user, loading: isUserLoading } = useCurrentSystemUser();
  const firstName = user?.userName?.trim()?.split(" ")[0] || "";

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { greeting, GreetingIcon } = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return { greeting: "Good morning", GreetingIcon: Sun };
    if (hour < 18) return { greeting: "Good afternoon", GreetingIcon: Sunset };
    return { greeting: "Good evening", GreetingIcon: Moon };
  }, [now]);

  const randomQuote = useMemo(() => {
    return VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];
  }, []);

  const formattedDate = useMemo(() => {
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [now]);

  const formattedUpdateDate = useMemo(() => {
    return getPreviousDayFormatted(now);
  }, [now]);

  const formattedTime = useMemo(() => {
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
  }, [now]);

  return (
    <main
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        backgroundColor: "var(--content-bg)",
        color: "var(--text-color)",
      }}
    >
      <div className="p-3 md:p-4 pb-20 md:pb-24 space-y-3.5 w-full max-w-7xl mx-auto">
        {/* ─── Top Row: Greeting + Study Notes + Performance Gauge ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:items-stretch">
          {/* Greeting Card */}
          <div className="order-1 md:col-span-2 lg:col-span-1 min-w-0 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-[#F5F9FF] to-[#ECF4FF] dark:bg-none dark:bg-[var(--card-bg,#15273e)] px-4 py-3 flex flex-col justify-between h-auto lg:h-[180px] shadow-xs hover:shadow-md transition-all duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-0.5">
                <GreetingIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {formattedDate} at {formattedTime}
                </span>
              </div>

              <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1 truncate">
                {greeting}
                {firstName ? `, ${firstName}` : isUserLoading ? "" : ", Guest"}!
              </h1>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-snug line-clamp-2">
                {randomQuote.quoteDescription}
              </p>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/dashboards/${programScope}/vista/subscriptions/items`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] bg-teal-600 hover:bg-teal-700 text-white shadow-xs active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Subscription Packages</span>
              </Link>
              <Link
                href={`/dashboards/${programScope}/vista/subscriptions/packages`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] border border-slate-200 dark:border-white/15 bg-white dark:bg-white/10 hover:border-teal-500/50 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-100 active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>My Subscriptions</span>
              </Link>
            </div>
          </div>

          {/* Nursing Study Notes/Guides Card */}
          <div className="order-3 lg:order-2 min-w-0 lg:h-[180px]">
            <NursingStudyNotesCard />
          </div>

          {/* Performance Index Gauge */}
          <div className="order-2 lg:order-3 min-w-0 lg:h-[180px]">
            <PerformanceIndexGauge scope={programScope} />
          </div>
        </div>

        {/* ─── Nursing Exams Grid ─── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 mb-3">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {displayHeading}
            </h2>
            <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-300/80 font-medium">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
              <span>Exams updated on</span>
              <span
                suppressHydrationWarning
                className="text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                {formattedUpdateDate}
              </span>
            </p>
          </div>

          <SubjectPlaceholderGrid
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            examType={programScope}
            examTypes={filteredExamTypes}
            showStartNow
          />
        </section>
      </div>
    </main>
  );
}

/**
 * Shared overview page for the RN Nursing and LPN Nursing dashboards.
 */
export default function NursingDashboardHome(props: NursingDashboardHomeProps) {
  return (
    <Suspense fallback={null}>
      <NursingDashboardHomeContent {...props} />
    </Suspense>
  );
}
