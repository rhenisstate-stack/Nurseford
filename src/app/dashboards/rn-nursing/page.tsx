"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { Sun, Sunset, Moon, Calendar, CreditCard, Receipt } from "lucide-react";
import PerformanceIndexGauge from "./includes/components/PerformanceIndexGauge";
import RnNursingListCard from "./includes/components/RnNursingListCard";
import { SubjectPlaceholderGrid } from "@/components/common/dashboards/elements/SubjectDataPlaceholders";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";

export default function RnNursingHomePage() {
  const { leftWidth } = useFlexPageClasp();

  const { user, loading: isUserLoading } = useCurrentSystemUser();
  const firstName = user?.userName?.trim()?.split(" ")[0] || "";

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { greeting } = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return { greeting: "Good morning", GreetingIcon: Sun };
    if (hour < 18) return { greeting: "Good afternoon", GreetingIcon: Sunset };
    return { greeting: "Good evening", GreetingIcon: Moon };
  }, [now]);

  const { filteredExams: allExams } = useNominalStrataExams({
    parentIdentifier: "",
    page: 1,
    perPage: 50,
  });

  const activeExamMatch = useMemo(() => {
    for (const exam of allExams) {
      const action = exam.examActions?.find((a) => a.status === "InProgress");
      if (action) return { exam, action };
    }
    return null;
  }, [allExams]);

  const activeExam = activeExamMatch?.exam ?? null;

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
      <div className="p-2 md:p-3 lg:p-3 pb-4 md:pb-6 space-y-3 lg:space-y-3 w-full max-w-7xl mx-auto">

        {/* ─── Greeting + Subjects + List + Gauge ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-3 lg:items-stretch">
          {/* Greeting Card */}
          <div className="order-1 min-w-0 relative overflow-hidden rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col justify-center lg:h-[190px] shadow-xs hover:shadow-md transition-all duration-200">
            <p className="text-xs sm:text-sm text-[var(--text-color)] opacity-70 mb-0.5">
              {formattedDate} at {formattedTime}
            </p>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text-color)] mb-1">
              {greeting}{firstName ? `, ${firstName}` : isUserLoading ? "" : ", Guest"} !
            </p>

            <p className="text-xs sm:text-sm text-[var(--text-color)] opacity-60 italic leading-snug line-clamp-2">
              {randomQuote.quoteDescription}
            </p>

            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <Link
                href="/dashboards/rn-nursing/vista/subscriptions/items"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.98] transition-all shadow-xs w-fit"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Subscription Packages</span>
              </Link>
              <Link
                href="/dashboards/rn-nursing/vista/subscriptions/packages"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.98] transition-all shadow-xs w-fit"
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>My Subscriptions</span>
              </Link>
            </div>
          </div>

          {/* RN Nursing Subjects — order-2 on mobile, spans full width on desktop */}
          <div className="order-2 lg:order-last lg:col-span-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2.5">
              <h2 className="text-lg md:text-2xl font-bold text-[var(--text-color)]">
                RN Nursing Exams
              </h2>
              <p className="flex items-center gap-1.5 text-xs sm:text-sm md:text-base text-[var(--text-color)]/70 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4]" />
                Exams last updated on <span suppressHydrationWarning className="text-emerald-500 font-bold">{formattedUpdateDate}</span>
              </p>
            </div>

            {/* Placeholder — updated from admin dashboard */}
            <SubjectPlaceholderGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4" examType="rn-nursing" showStartNow />
          </div>

          {/* Nursing Study Notes/Guides Card */}
          <div className="shrink-0 order-4 lg:order-2 lg:h-[190px]">
            <RnNursingListCard />
          </div>

          {/* Performance Index Gauge */}
          <div className="shrink-0 order-3 lg:order-3 lg:h-[190px]">
            <PerformanceIndexGauge score={0} />
          </div>
        </div>

        {/* ─── Continue Exam Banner ─── */}
        {activeExam && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 shrink-0">
                  <span className="text-emerald-600 font-bold text-sm">IP</span>
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Exam In Progress
                  </p>
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {activeExam.title}
                  </h3>
                </div>
              </div>

              <Link
                href={`/web/rn-nursing/vista/exam/generic?mode=Exam&identifier=${activeExam.guidId ?? activeExam.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-xs md:text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200 shrink-0"
              >
                Continue Exam
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
