"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { NCLEX_PRACTICE_CONFIG, type NclexExamType } from "@/lib/config/nclex-practice";
import { NCLEX_PRACTICE_EXAMS } from "@/lib/config/nclex-practice-exams";
import { ArrowLeft, Play, GraduationCap, Activity } from "lucide-react";

const ACCENT_TEAL = "#2FD9C4";
const ACCENT_GOLD = "#F5B843";

export type NclexPracticeMode = "practice" | "readiness";

/**
 * NCLEX practice hub.
 *
 * Landing page for the "Start Practice" / "Start Now" buttons.
 *
 *   - Start Practice -> single card "NCLEX RN (Practice Exams)"   (← group 27)
 *   - Start Now      -> single card "NCLEX RN- (Readiness Assessment Test)" (← group 28)
 *
 * Each card's exam count is filtered live from the backend via the Exam hook
 * (parent = the practice/readiness group), never hardcoded.
 */
export function NclexPracticeHub({
  panelSlug,
  examType,
  panelLabel,
}: {
  panelSlug: string;
  examType: NclexExamType;
  panelLabel: string;
}) {
  const { leftWidth } = useFlexPageClasp();
  const searchParams = useSearchParams();
  const mode: NclexPracticeMode =
    searchParams.get("action") === "readiness" ? "readiness" : "practice";

  const config = NCLEX_PRACTICE_CONFIG[examType];
  const group =
    mode === "readiness"
      ? { ...config.readiness, subtext: "Measure your readiness and track your progress", icon: Activity, accent: ACCENT_GOLD }
      : { ...config.practice, subtext: "Jump into practice mode", icon: GraduationCap, accent: ACCENT_TEAL };

  const { skewTotal, isLoading } = useNominalStrataExams({
    parentIdentifier: group.domainsGroupId,
    page: 1,
    perPage: 1,
  });

  // Prefer the live backend count; fall back to the NCLEX catalog (4 practice /
  // 6 readiness) until those groups are populated on the backend.
  const catalog = NCLEX_PRACTICE_EXAMS[examType][mode === "readiness" ? "readiness" : "practice"];
  const examCount = (skewTotal && skewTotal > 0) ? skewTotal : catalog.length;

  return (
    <div
      className="flex-1 flex flex-col pt-14 pb-8 md:pb-12 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        backgroundColor: "var(--content-bg)",
        color: "var(--text-color)",
      }}
    >
      <div className="p-2 md:p-3 lg:p-3 space-y-3 lg:space-y-3 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        <div className="grid grid-cols-1 gap-3 lg:gap-3">
          <div className="order-2 lg:order-last lg:col-span-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
              <Link
                href={`/dashboards/${panelSlug}`}
                className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-[var(--text-color)]/50 hover:text-[#2FD9C4] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {panelLabel} Dashboard
              </Link>

              <div className="w-full" />

              <h2 className="text-lg md:text-2xl font-bold text-[var(--text-color)]">
                {mode === "readiness"
                  ? `${panelLabel} Readiness Assessment Test (RAT)`
                  : `${panelLabel} Practice Exams`}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-[#CBDCF8] dark:border-white/10 min-h-[160px] animate-pulse shadow-xs"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5">
                <div className="group relative flex flex-col overflow-hidden rounded-xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-[#CBDCF8] dark:border-white/10 hover:border-[#2FD9C4]/60 min-h-[50px] md:min-h-[70px] shadow-xs hover:shadow-md transition-all duration-200">
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ backgroundColor: group.accent }}
                  />

                  <div className="flex items-start justify-between gap-2 px-3 pt-3">
                    <span className="text-xs md:text-sm font-medium text-slate-900 dark:text-[var(--text-color)] leading-snug line-clamp-2">
                      {group.label}
                    </span>
                    <group.icon className="w-5 h-5 shrink-0" style={{ color: group.accent }} />
                  </div>

                  <div className="flex-1 flex items-center justify-center px-2 py-1">
                    <span className="text-[11px] md:text-xs text-slate-600 dark:text-[var(--text-color)]/50 text-center line-clamp-2">
                      {group.subtext}
                    </span>
                  </div>

                  <div className="px-3 pb-2 flex justify-center">
                    <span className="text-[11px] font-medium text-slate-700 dark:text-[var(--text-color)]/60">
                      Exams: {examCount}
                    </span>
                  </div>

                  <Link
                    href={`/dashboards/${panelSlug}/practice/examinations/${group.domainsGroupId}?subjectName=${encodeURIComponent(group.label)}`}
                    className="mx-2.5 mt-auto mb-2.5 select-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] md:text-sm font-medium bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.99] transition-all shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Access Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}