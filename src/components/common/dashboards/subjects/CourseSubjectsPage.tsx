"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { NclexCustomTestPopup } from "@/components/common/dashboards/nclex/NclexDashboardSections";
import { SubjectExamsPopup } from "@/components/common/dashboards/subjects/SubjectExamsPopup";
import { toSlug, type BackendSubject } from "@/lib/data/exam-subjects";
import { useExamCourses, type DashboardCourse } from "@/lib/hooks/home/useExamCourses";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";
import { ArrowLeft, ArrowRight, Calendar, Command, Play } from "lucide-react";
import { registerSearchSubjects } from "@/lib/services/search/searchRegistry";

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
const cleanSubjectStr = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

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

  const hasValidCached = Boolean(cached?.subjects?.length && cached.subjects.some((s) => (s.questionCount || 0) > 0));
  const [subjects, setSubjects] = useState<BackendSubject[]>(() => (hasValidCached ? (cached?.subjects ?? []) : []));
  const [dynamicCourseName, setDynamicCourseName] = useState<string>(() => cached?.courseName ?? "");
  const [isLoading, setIsLoading] = useState<boolean>(() => !hasValidCached);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedBuilderSubject, setSelectedBuilderSubject] = useState<BackendSubject | null>(null);
  const [activeSubject, setActiveSubject] = useState<BackendSubject | null>(null);

  const normalizedExamType =
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
              : "nclex-rn";

  const { courses: dashboardCourses } = useExamCourses(normalizedExamType);

  const formattedUpdateDate = useMemo(() => {
    return getPreviousDayFormatted();
  }, []);

  const customCoursesForBuilder: DashboardCourse[] = useMemo(() => {
    return subjects.map((s, index) => {
      const sGuid = String(s.guidId || s.id).toLowerCase();
      const sTitle = cleanSubjectStr(s.name);
      const matched = dashboardCourses.find((c) => {
        const cGuid = String(c.backendSubjectGuid || c.guidId || "").toLowerCase();
        const cId = String(c.id).toLowerCase();
        if (cGuid && (cGuid === sGuid || cId === sGuid)) return true;
        const cTitle = cleanSubjectStr(c.title);
        return cTitle === sTitle || (sTitle && cTitle && (cTitle.includes(sTitle) || sTitle.includes(cTitle)));
      });

      const subs = (s.subCategories && s.subCategories.length > 0)
        ? s.subCategories
        : (matched?.subCategories && matched.subCategories.length > 0)
          ? matched.subCategories
          : [];

      const qCount =
        s.questionCount ||
        (subs.length > 0
          ? subs.reduce((a, b) => a + (b.questionCount || 0), 0)
          : 0) ||
        matched?.questionCount ||
        0;

      return {
        id: typeof s.id === "number" ? s.id : (Number(s.id) || index + 1),
        guidId: s.guidId || String(s.id),
        backendSubjectGuid: matched?.backendSubjectGuid || s.guidId || String(s.id),
        examType: panelSlug,
        title: s.name,
        category: "subject",
        questionCount: qCount,
        examCount: s.examCount ?? (subs.length || matched?.examCount || 0),
        doneCount: matched?.doneCount || 0,
        easyPct: matched?.easyPct || 33,
        mediumPct: matched?.mediumPct || 34,
        hardPct: matched?.hardPct || 33,
        order: index + 1,
        subCategories: subs, // Preserve real subcategories/exams so when clicking a subject card, its exams appear in the popup
        examList: subs, // Preserve real underlying exams for custom exam builder launch
      };
    });
  }, [subjects, panelSlug, dashboardCourses]);

  const activeCustomCourses = useMemo(() => {
    if (!selectedBuilderSubject) return customCoursesForBuilder;
    const match = customCoursesForBuilder.find(
      (c) => String(c.backendSubjectGuid || c.guidId || c.id) === String(selectedBuilderSubject.guidId || selectedBuilderSubject.id) ||
        cleanSubjectStr(c.title) === cleanSubjectStr(selectedBuilderSubject.name)
    );
    return match ? [match] : customCoursesForBuilder;
  }, [selectedBuilderSubject, customCoursesForBuilder]);

  useEffect(() => {
    if (subjects.length > 0) {
      registerSearchSubjects(
        panelSlug,
        courseSlug,
        courseId,
        dynamicCourseName || cached?.courseName || "",
        subjects
      );
    }
  }, [panelSlug, courseSlug, courseId, dynamicCourseName, cached?.courseName, subjects]);

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
          const mapped = (list as BackendSubject[])
            .map((s) => ({
              ...s,
              slug: s.slug || toSlug(s.name),
            }))
            .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

          courseSubjectsClientCache.set(cacheKey, {
            subjects: mapped,
            courseName: resolvedCourseName || cached?.courseName || "",
          });

          registerSearchSubjects(panelSlug, courseSlug, courseId, resolvedCourseName || cached?.courseName || "", mapped);
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
  }, [panelSlug, courseSlug, courseId, cacheKey, cached?.courseName]);

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
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between min-h-[80px] sm:min-h-[96px] md:min-h-[115px] p-3.5 sm:p-4 md:p-4.5 transition-all duration-200 shadow-xs text-left">
              <div className="flex items-start justify-between gap-2 sm:gap-3 w-full">
                <div className="min-w-0">
                  <h1 className="font-serif text-base sm:text-lg md:text-xl font-bold text-navy dark:text-white truncate leading-tight">
                    {courseName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate mt-1">
                    {isLoading
                      ? "Loading subjects..."
                      : `${subjects.length} Subject${subjects.length === 1 ? "" : "s"} under this course`}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span suppressHydrationWarning className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {formattedUpdateDate}
                  </span>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium pt-1 text-right whitespace-nowrap">
                    Last updated:{" "}
                    <span suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      {formattedUpdateDate}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex-1 min-h-[8px]" />
              <Link
                href={backHref}
                className="w-full select-none inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-navy dark:text-white transition-all duration-200 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {panelSlug.toUpperCase()} Dashboard
              </Link>
            </div>

            {/* Card 2: Build Your Own Exam (Custom) */}
            <button
              type="button"
              onClick={() => setShowBuilder(true)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 bg-white dark:bg-[#1E293B] p-3.5 sm:p-4 md:p-4.5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[80px] sm:min-h-[96px] md:min-h-[115px] text-left cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3 w-full">
                <div className="min-w-0">
                  <span className="font-serif text-base sm:text-lg md:text-xl font-bold text-navy dark:text-white block leading-tight">
                    Build Your Own Exam
                  </span>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate mt-1">
                    Select custom question count, topics & test modes
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 text-xs font-bold shrink-0">
                  Custom
                </span>
              </div>
              <div className="flex-1 min-h-[8px]" />
              <span className="w-full select-none inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#0A2540] hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white transition-all duration-200 shadow-2xs">
                <Play className="w-3.5 h-3.5 fill-current" />
                Create Exam
              </span>
            </button>
          </div>
        ) : (
          /* Fallback header when exam builder is disabled for this panel */
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-5 md:p-6 shadow-xs text-center space-y-2.5">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-0.5 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {panelSlug.toUpperCase()} Dashboard
            </Link>
            <h1 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-navy dark:text-white">
              {courseName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {isLoading
                ? "Loading subjects..."
                : `${subjects.length} Subject${subjects.length === 1 ? "" : "s"} under this course`}
            </p>
            <p className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Exams last updated on{" "}
              <span suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400 font-bold">
                {formattedUpdateDate}
              </span>
            </p>
          </div>
        )}

        {/* ─── Subjects Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
          {subjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] px-5 py-12 text-center shadow-xs">
              <Command className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                No subjects available for this course yet — check back soon.
              </p>
            </div>
          ) : (
            subjects.map((card) => (
              <button
                key={`${card.id}-${card.slug}`}
                type="button"
                onClick={() => openSubjectExams(card)}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 hover:shadow-md flex flex-col justify-between min-h-[90px] sm:min-h-[105px] md:min-h-[115px] p-3.5 sm:p-4 transition-all duration-200 shadow-2xs text-left cursor-pointer"
              >
                <div className="min-w-0 w-full">
                  <span className="font-serif text-xs sm:text-sm md:text-[15px] font-bold text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                    {card.name}
                  </span>
                  {card.description && (
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  )}
                </div>
                <div className="w-full pt-3 mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  <span className="group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                    Access Exams
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {showExamBuilder && (
        <NclexCustomTestPopup
          isOpen={showBuilder}
          onClose={() => {
            setShowBuilder(false);
            setSelectedBuilderSubject(null);
          }}
          panelSlug={panelSlug}
          livePanelSlug={livePanelSlug}
          title={
            selectedBuilderSubject
              ? `${selectedBuilderSubject.name.toUpperCase()} EXAM BUILDER`
              : `${courseName.toUpperCase()} EXAM BUILDER`
          }
          builderMode="questions"
          customCourses={activeCustomCourses}
          examType={normalizedExamType}
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