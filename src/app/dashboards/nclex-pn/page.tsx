"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { Sun, Sunset, Moon, CreditCard, Receipt } from "lucide-react";
import PerformanceIndexGauge from "./includes/components/PerformanceIndexGauge";
import NclexPnListCard from "./includes/components/NclexPnListCard";
import {
  NclexActionRow,
  NclexStudyByCourseSection,
  NclexCustomTestPopup,
  type NclexAction,
} from "@/components/common/dashboards/nclex/NclexDashboardSections";

const PANEL_SLUG = "nclex-pn";

export default function NclexPnHomePage() {
  const router = useRouter();
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

  const formattedTime = useMemo(() => {
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
  }, [now]);

  // ─── Popup State ───
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupDefaultMode, setPopupDefaultMode] = useState<NclexAction>("custom");

  useEffect(() => {
    const checkParams = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "custom") {
        setPopupDefaultMode("custom");
        setPopupOpen(true);
      }
    };
    checkParams();

    const handleOpen = () => {
      setPopupDefaultMode("custom");
      setPopupOpen(true);
    };
    window.addEventListener("open-nclex-custom-test", handleOpen);
    window.addEventListener("popstate", checkParams);
    return () => {
      window.removeEventListener("open-nclex-custom-test", handleOpen);
      window.removeEventListener("popstate", checkParams);
    };
  }, []);

  const handleAction = (action: NclexAction) => {
    if (action === "practice") {
      router.push(`/dashboards/${PANEL_SLUG}/exams/nclex-pn-practice-exams/1cb41630-1203-42ae-8844-92afa60eea9b`);
      return;
    }
    if (action === "readiness") {
      router.push(`/dashboards/${PANEL_SLUG}/exams/nclex-pn-readiness-assessment-tests/176de88a-d9de-48d3-a76f-24f1e71f016c`);
      return;
    }
    setPopupDefaultMode(action);
    setPopupOpen(true);
  };

  const handleCourseCustomTest = () => {
    setPopupDefaultMode("custom");
    setPopupOpen(true);
  };

  return (
    <main
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        backgroundColor: "var(--content-bg)",
        color: "var(--text-color)",
      }}
    >
      <div className="p-2 sm:p-2.5 md:p-3 pb-4 md:pb-6 space-y-2.5 sm:space-y-3 w-full max-w-7xl mx-auto">

        {/* ─── Greeting + List + Gauge ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:items-stretch">
          {/* Greeting Card */}
          <div className="order-1 min-w-0 relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-3 sm:p-3.5 md:p-4 flex flex-col justify-center lg:h-[190px] shadow-xs hover:shadow-md transition-all duration-200">
            <p className="text-[10px] sm:text-xs text-[var(--text-color)]/70 mb-0.5">
              {formattedDate} · {formattedTime}
            </p>

            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm sm:text-base lg:text-xl font-bold text-[var(--text-color)] truncate">
                {greeting}{firstName ? `, ${firstName}` : isUserLoading ? "" : ", Guest"} ✌️
              </p>
              <div className="shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-purple-500/60 bg-purple-500/10 text-center leading-none">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-extrabold text-purple-600 dark:text-purple-300">72%</div>
                  <div className="text-[6px] sm:text-[6.5px] font-bold tracking-wider text-purple-600 dark:text-purple-200 uppercase">READY</div>
                </div>
              </div>
            </div>

            <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--text-color)]/60 italic leading-snug line-clamp-2">
              &ldquo;{randomQuote.quoteDescription}&rdquo;
            </p>

            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <Link
                href="/dashboards/nclex-pn/vista/subscriptions/items"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.98] transition-all shadow-xs w-fit"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Subscription Packages</span>
              </Link>
              <Link
                href="/dashboards/nclex-pn/vista/subscriptions/packages"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.98] transition-all shadow-xs w-fit"
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>My Subscriptions</span>
              </Link>
            </div>
          </div>

          {/* NCLEX-PN List Card (desktop only — phone shows it at the bottom) */}
          <div className="hidden lg:block shrink-0 order-2 sm:order-last lg:order-2 lg:h-[190px]">
            <NclexPnListCard />
          </div>

          {/* Performance Index Gauge (desktop only — phone shows it at the bottom) */}
          <div className="hidden lg:block shrink-0 order-3 lg:order-3 lg:h-[190px]">
            <PerformanceIndexGauge score={0} />
          </div>
        </div>

        {/* ─── NCLEX Action Row ─── */}
        <NclexActionRow examLabel="NCLEX-PN" onAction={handleAction} />

        {/* ─── Study By Course Banner + Course Grid ─── */}
        <div id="study-by-course" className="scroll-mt-20">
          <NclexStudyByCourseSection
            title="NCLEX-PN — Study By Course"
            examType="nclex-pn"
            onCreateCustomTest={handleCourseCustomTest}
          />
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
                href={`/web/${PANEL_SLUG}/vista/exam/generic?mode=Exam&identifier=${activeExam.guidId ?? activeExam.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-xs md:text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200 shrink-0"
              >
                Continue Exam
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ─── Custom Test Popup ─── */}
      <NclexCustomTestPopup
        isOpen={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          if (typeof window !== "undefined" && window.location.search.includes("action=custom")) {
            const url = new URL(window.location.href);
            url.searchParams.delete("action");
            window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
          }
        }}
        defaultMode={popupDefaultMode}
        panelSlug={PANEL_SLUG}
        livePanelSlug={PANEL_SLUG}
        examType="nclex-pn"
      />
      {/* Performance Index and Nursing Study Notes/Guides — phone mode only (bottom above footer) */}
      <div className="lg:hidden pt-6 lg:pt-8 pb-4 lg:pb-8 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-3">
          {/* Performance Index Gauge */}
          <div>
            <PerformanceIndexGauge score={0} />
          </div>

          {/* Nursing Study Notes/Guides Card */}
          <div>
            <NclexPnListCard />
          </div>
        </div>
      </div>

    </main>
  );
}
