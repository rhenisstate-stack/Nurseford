"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { NclexCustomTestPopup } from "@/components/common/dashboards/nclex/NclexDashboardSections";
import { SubjectExamsPopup } from "@/components/common/dashboards/subjects/SubjectExamsPopup";
import { toSlug, type BackendSubject } from "@/lib/data/exam-subjects";
import type { DashboardCourse } from "@/lib/hooks/home/useExamCourses";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";
import { ArrowLeft, Calendar, Command, Play } from "lucide-react";

/**
 * Full-page subject listing for a course (e.g. "EXIT ATI Exams-RN").
 *
 * Rendered under /dashboards/{panel}/exams/{courseSlug}/{courseId} so it inherits
 * the dashboard shell (navbar / sidebar / footer). Subject cards are fetched
 * exactly from the backend via GET /api/exams/{panel}/subjects/{courseId} (the
 * server forwards the session headers).
 *
 * When `showExamBuilder` is true the page renders a "Build Your Own Exam" card
 * that opens the shared custom-test popup, and subject cards navigate to the
 * exam hierarchy page for that subject. Otherwise the legacy behaviour is kept:
 * clicking a subject opens the exam picker popup.
 */
const courseSubjectsClientCache = new Map<
  string,
  { subjects: BackendSubject[]; courseName: string }
>();

export function CourseSubjectsPage({
  panelSlug,
  courseSlug,
  courseId,
  livePanelSlug,
  showExamBuilder = false,
}: {
  panelSlug: string;
  courseSlug: string;
  courseId: string;
  livePanelSlug?: string;
  showExamBuilder?: boolean;
}) {
  const { leftWidth } = useFlexPageClasp();
  const router = useRouter();

  const cacheKey = `${panelSlug}:${courseId}`;
  const cached = courseSubjectsClientCache.get(cacheKey);

  const [subjects, setSubjects] = useState<BackendSubject[]>(() => cached?.subjects ?? []);
  const [dynamicCourseName, setDynamicCourseName] = useState<string>(() => cached?.courseName ?? "");
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached?.subjects?.length);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeSubject, setActiveSubject] = useState<BackendSubject | null>(null);

  const formattedUpdateDate = useMemo(() => {
    return getPreviousDayFormatted();
  }, []);

  const customCoursesForBuilder: DashboardCourse[] = useMemo(() => {
    return subjects.map((s, index) => {
      const subs = s.subCategories || [];
      const qCount =
        s.questionCount ||
        (subs.length > 0
          ? subs.reduce((a, b) => a + b.questionCount, 0)
          : (s.examCount || 1) * 45);
      return {
        id: typeof s.id === "number" ? s.id : (Number(s.id) || index + 1),
        guidId: s.guidId || String(s.id),
        backendSubjectGuid: s.guidId || String(s.id),
        examType: panelSlug,
        title: s.name,
        category: "subject",
        questionCount: qCount,
        examCount: s.examCount ?? subs.length,
        doneCount: 0,
        easyPct: 35,
        mediumPct: 45,
        hardPct: 20,
        order: index + 1,
        subCategories: subs,
      };
    });
  }, [subjects, panelSlug]);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    const loadSubjects = async () => {
      try {
        const res = await fetch(`/api/exams/${panelSlug}/subjects/${courseId}`, {
          headers: { ...renderSystemSessionHeaders() },
        });
        const data = await res.json();
        if (!cancelled) {
          const resolvedCourseName = data?.courseName || "";
          if (resolvedCourseName) {
            setDynamicCourseName(resolvedCourseName);
          }
          const list = Array.isArray(data?.subjects) ? data.subjects : [];
          const mapped = (list as BackendSubject[]).map((s) => ({
            ...s,
            slug: s.slug || toSlug(s.name),
          }));

          courseSubjectsClientCache.set(cacheKey, {
            subjects: mapped,
            courseName: resolvedCourseName || cached?.courseName || "",
          });

          setSubjects(mapped);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[CourseSubjectsPage] Failed to load subjects:", err);
        if (!cancelled) {
          if (!courseSubjectsClientCache.has(cacheKey)) setSubjects([]);
          setIsLoading(false);
        }
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [panelSlug, courseId, cacheKey, cached?.courseName]);

  const courseName =
    dynamicCourseName ||
    courseSlug
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
      .trim() ||
    `Course ${courseId}`;

  const backHref = `/dashboards/${panelSlug}`;

  const openSubjectExams = (card: BackendSubject) => {
    const identifier = card.guidId || card.id;
    if (showExamBuilder) {
      const examHref = `/dashboards/${panelSlug}/exams/${courseSlug}/${courseId}/exams/${identifier}?subjectName=${encodeURIComponent(card.name)}`;
      router.push(examHref);
    } else {
      setActiveSubject(card);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col pt-14 pb-8 md:pb-12 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        backgroundColor: "var(--content-bg)",
        color: "var(--text-color)",
      }}
    >
      <div className="p-2 md:p-4 lg:p-4 max-w-7xl mx-auto space-y-2.5 sm:space-y-3 md:space-y-4 w-full flex-1 flex flex-col">
        {/* ─── Top Row: Build Your Own Exam & Course Overview Card ─── */}
        {showExamBuilder ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {/* Card 1: Course Overview Card */}
            <div className="group relative overflow-hidden rounded-xl bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] border border-[var(--card-border,#CBDCF8)] dark:border-white/10 hover:border-[#3B82F6]/60 flex flex-col justify-between min-h-[80px] sm:min-h-[96px] md:min-h-[115px] p-3 sm:p-3.5 md:p-4 transition-all duration-200 shadow-xs hover:shadow-md text-left">
              <div className="flex items-start justify-between gap-2 sm:gap-3 w-full">
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#2563EB] dark:text-[#60A5FA] truncate leading-tight">
                    {courseName}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-white/80 font-semibold truncate mt-1">
                    {isLoading
                      ? "Loading subjects..."
                      : `${subjects.length} Subject${subjects.length === 1 ? "" : "s"} under this course`}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span suppressHydrationWarning className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm md:text-base font-bold shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-[#2FD9C4]" />
                    {formattedUpdateDate}
                  </span>
                  <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-white/70 font-semibold pt-1 text-right whitespace-nowrap">
                    Exams last updated on{" "}
                    <span suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {formattedUpdateDate}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex-1 min-h-[6px] sm:min-h-[8px]" />
              <Link
                href={backHref}
                className="w-full select-none inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 md:py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white active:scale-[0.99] transition-all shadow-sm"
              >
                <ArrowLeft className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                Back to {panelSlug.toUpperCase()} Dashboard
              </Link>
            </div>

            {/* Card 2: Build Your Own Exam (Custom) */}
            <button
              type="button"
              onClick={() => setShowBuilder(true)}
              className="group relative overflow-hidden rounded-xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 hover:border-[#8B5CF6]/60 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] p-3 sm:p-3.5 md:p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[80px] sm:min-h-[96px] md:min-h-[115px] text-left cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3 w-full">
                <div className="min-w-0">
                  <span className="text-sm sm:text-base md:text-lg font-medium text-slate-900 dark:text-white block leading-tight">
                    Build Your Own Exam
                  </span>
                </div>
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#8B5CF6] dark:text-[#A78BFA] border border-[#8B5CF6]/30 text-xs sm:text-sm font-medium shrink-0">
                  Custom
                </span>
              </div>
              <div className="flex-1 min-h-[6px] sm:min-h-[8px]" />
              <span className="w-full select-none inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 md:py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-[#8B5CF6] hover:bg-[#7C3AED] text-white group-hover:brightness-110 active:scale-[0.99] transition-all shadow-sm">
                <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
                Create Exam
              </span>
            </button>
          </div>
        ) : (
          /* Fallback header when exam builder is disabled for this panel */
          <div className="rounded-2xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] p-4 md:p-6 shadow-xs text-center space-y-2">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-white/60 hover:text-[#2FD9C4] transition-colors mb-0.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {panelSlug.toUpperCase()} Dashboard
            </Link>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#2563EB] dark:text-[#60A5FA]">
              {courseName}
            </h1>
            <p className="text-sm md:text-base text-slate-700 dark:text-white/80 font-semibold">
              {isLoading
                ? "Loading subjects..."
                : `${subjects.length} Subject${subjects.length === 1 ? "" : "s"} under this course`}
            </p>
            <p className="flex items-center justify-center gap-1.5 text-xs sm:text-sm md:text-base text-slate-700 dark:text-white/70 font-semibold pt-0.5">
              <Calendar className="w-4 h-4 text-teal-600 dark:text-[#2FD9C4]" />
              Exams last updated on{" "}
              <span suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400 font-bold">
                {formattedUpdateDate}
              </span>
            </p>
          </div>
        )}

        {/* ─── Subjects Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-4">
          {subjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] px-5 py-12 text-center">
              <Command className="w-8 h-8 text-[var(--text-color)]/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--text-color)]/50">
                No subjects available for this course yet — check back soon.
              </p>
            </div>
          ) : (
            subjects.map((card) => (
              <button
                key={`${card.id}-${card.slug}`}
                type="button"
                onClick={() => openSubjectExams(card)}
                className="group relative overflow-hidden rounded-xl bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] border border-[var(--card-border,#CBDCF8)] dark:border-white/10 hover:border-[#3B82F6]/60 flex flex-col justify-between min-h-[64px] sm:min-h-[72px] md:min-h-[100px] p-2 sm:p-2.5 md:p-3.5 transition-all duration-200 shadow-xs hover:shadow-md text-left"
              >
                <div className="flex items-start justify-between gap-1 sm:gap-2 w-full">
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {card.name}
                  </span>
                  <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-md bg-[#d1fae5] text-[#065f46] dark:bg-[#10b981]/20 dark:text-[#34d399] text-[8px] sm:text-[9px] md:text-xs font-normal shrink-0">
                    Exams: {card.examCount ?? 0}
                  </span>
                </div>
                <div className="flex-1 min-h-[3px] sm:min-h-[6px]" />
                <span className="w-full select-none inline-flex items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] md:text-xs font-medium bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.99] transition-all shadow-sm">
                  <Play className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" />
                  Access Now
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {showExamBuilder && (
        <NclexCustomTestPopup
          isOpen={showBuilder}
          onClose={() => setShowBuilder(false)}
          panelSlug={panelSlug}
          livePanelSlug={livePanelSlug}
          title={`${courseName.toUpperCase()} EXAM BUILDER`}
          builderMode="exams"
          customCourses={customCoursesForBuilder}
          examType={
            panelSlug === "hesi-a2"
              ? "hesi-a2"
              : panelSlug === "ati-teas"
                ? "ati-teas"
                : panelSlug === "rn-nursing"
                  ? "rn-nursing"
                  : panelSlug === "lpn-nursing"
                    ? "lpn-nursing"
                    : panelSlug === "nclex-pn"
                      ? "nclex-pn"
                      : "nclex-rn"
          }
        />
      )}

      {!showExamBuilder && (
        <SubjectExamsPopup
          isOpen={activeSubject !== null}
          onClose={() => setActiveSubject(null)}
          subject={activeSubject}
          panelSlug={panelSlug}
          livePanelSlug={livePanelSlug}
        />
      )}
    </div>
  );
}