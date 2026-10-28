"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import { useNominalStrataExams, type StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { ArrowLeft, Calendar, Check, FileQuestion, Loader2, Play, Search, X } from "lucide-react";
import { NclexCustomTestPopup } from "@/components/common/dashboards/nclex/NclexDashboardSections";
import { useRelativeStrataAssessmentResults } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import type { DashboardCourse, DashboardSubCategory } from "@/lib/hooks/home/useExamCourses";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";

const PER_PAGE = 50;

type LoadStatus = "idle" | "loading" | "ready" | "error";

/**
 * Full-page exam hierarchy for a single subject under a course, e.g. rendered
 * at /dashboards/{panel}/exams/{courseSlug}/{courseId}/exams/{subjectId}.
 *
 * Fetches the subject's exams via strata "Exam / NominalFetch" and renders each
 * card with Practice / Review / Exam mode buttons that launch the shared
 * live-panel exam player.
 */
interface SubjectExamsHierarchyCacheItem {
  exams: (StrataItem & { modes?: string[] })[];
  courseName?: string;
  subjectName?: string;
  showCustomTestButton?: boolean;
  hideSeason?: boolean;
}
const subjectExamsHierarchyClientCache = new Map<string, SubjectExamsHierarchyCacheItem>();

export function SubjectExamsHierarchyPage({
  panelSlug,
  livePanelSlug,
  panelLabel,
  courseSlug,
  courseId,
  subjectId,
}: {
  panelSlug: string;
  livePanelSlug: string;
  panelLabel: string;
  courseSlug: string;
  courseId: string;
  subjectId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectName = searchParams?.get("subjectName") ?? "";
  const { leftWidth } = useFlexPageClasp();

  const cacheKey = `${panelSlug}:${courseId}:${subjectId}`;
  const cached = subjectExamsHierarchyClientCache.get(cacheKey);

  const [exams, setExams] = useState<(StrataItem & { modes?: string[] })[]>(() => cached?.exams ?? []);
  const [dynamicCourseName, setDynamicCourseName] = useState<string>(() => cached?.courseName ?? "");
  const [dynamicSubjectName, setDynamicSubjectName] = useState<string>(() => cached?.subjectName ?? "");
  const [showCustomTest, setShowCustomTest] = useState(() => cached?.showCustomTestButton ?? false);
  const [hideSeason, setHideSeason] = useState(() => cached?.hideSeason ?? false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [status, setStatus] = useState<LoadStatus>(() => (cached?.exams?.length ? "ready" : "idle"));
  const [page, setPage] = useState(1);

  // Client-side search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");

  const formattedUpdateDate = useMemo(() => {
    return getPreviousDayFormatted();
  }, []);

  const { filteredExamResults: allResults } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 200,
    sortColumn: null,
    sortDirection: "asc",
  });

  const { filteredExams: nominalExams } = useNominalStrataExams({
    parentIdentifier: subjectId,
    dynamicLearningStrataName: "subject",
    page: 1,
    perPage: 100,
    allowEmptyParent: false,
  });

  const completedExamIds = useMemo(() => {
    const completedSet = new Set<string>();

    allResults.forEach((r) => {
      const hasScore = r.percentageScore != null || r.score != null;
      const isCompleted =
        hasScore ||
        r.status === "Completed" ||
        r.status === "Finished";

      if (isCompleted) {
        if (r.examGuidId) completedSet.add(r.examGuidId);
        if (r.examId) completedSet.add(String(r.examId));
      }
    });

    nominalExams.forEach((ne) => {
      const actions = ne.examActions ?? [];
      const hasCompleted = actions.some((a) => a.status === "Completed" || a.status === "Finished");
      if (hasCompleted) {
        if (ne.guidId) completedSet.add(ne.guidId);
        if (ne.id) completedSet.add(String(ne.id));
      }
    });

    return completedSet;
  }, [allResults, nominalExams]);

  useEffect(() => {
    setPage(1);
  }, [subjectId]);

  useEffect(() => {
    if (!subjectId) return;

    let cancelled = false;
    if (!subjectExamsHierarchyClientCache.has(cacheKey)) {
      setStatus("loading");
      setExams([]);
    }
    setSearchQuery("");
    setSelectedYear("all");
    setSelectedSeason("all");

    const loadExams = async () => {
      try {
        // Direct nominal fetch matching origin repo flow: strictly query this subjectId
        const result = await strataService<{
          items?: StrataItem[];
          skewTotal?: number;
          skewTotalPages?: number;
        }>("Exam", "NominalFetch", {
          identifier: subjectId,
          dynamicPage: page,
          dynamicPerPage: PER_PAGE,
          dynamicSearch: "",
          dynamicSortColumn: "id",
          dynamicSortDirection: "desc",
          dynamicLearningStrataName: "subject",
        });

        if (cancelled) return;

        if (result?.error) {
          throw new Error(result.error);
        }

        const rawItems = result?.data?.items ?? [];
        const sortedExams = [...rawItems].sort((a, b) => {
          const idB = Number(b.id) || 0;
          const idA = Number(a.id) || 0;
          if (idB !== idA) return idB - idA;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          return timeB - timeA;
        });

        const currentCached = subjectExamsHierarchyClientCache.get(cacheKey);
        const resolvedSubName = (rawItems[0] as any)?.subjectName || currentCached?.subjectName || subjectName;
        const resolvedCourseName = (rawItems[0] as any)?.courseName || currentCached?.courseName || "";
        subjectExamsHierarchyClientCache.set(cacheKey, {
          exams: sortedExams,
          courseName: resolvedCourseName,
          subjectName: resolvedSubName,
          showCustomTestButton: false,
          hideSeason: false,
        });

        if (resolvedSubName) setDynamicSubjectName(resolvedSubName);
        if (resolvedCourseName) setDynamicCourseName(resolvedCourseName);
        setExams(sortedExams);
        try {
          sortedExams.forEach((e) => {
            if (e.guidId && e.title) {
              localStorage.setItem(`exam_title_${e.guidId}`, e.title);
              sessionStorage.setItem(`exam_title_${e.guidId}`, e.title);
            }
            if (e.id && e.title) {
              localStorage.setItem(`exam_title_${e.id}`, e.title);
              sessionStorage.setItem(`exam_title_${e.id}`, e.title);
            }
          });
        } catch {}
        setStatus("ready");
      } catch (err) {
        console.error("[SubjectExamsHierarchyPage] Failed to load exams:", err);
        if (!cancelled) setStatus("error");
      }
    };

    loadExams();

    return () => {
      cancelled = true;
    };
  }, [panelSlug, courseId, subjectId, subjectName, page, cacheKey]);

  const startExam = (examTarget: (StrataItem & { modes?: string[] }) | string, mode: string) => {
    let idToUse = "";
    try {
      if (typeof window !== "undefined") {
        let targetObj: StrataItem | undefined;
        if (typeof examTarget === "string") {
          idToUse = examTarget;
          targetObj = exams.find((e) => e.guidId === examTarget || String(e.id) === examTarget);
        } else {
          targetObj = examTarget;
          idToUse = examTarget.guidId ?? String(examTarget.id);
        }

        const title = targetObj?.title;

        const storeKeys = [
          idToUse,
          targetObj?.guidId,
          targetObj?.id ? String(targetObj.id) : undefined,
        ].filter(Boolean) as string[];

        storeKeys.forEach((key) => {
          if (title) {
            localStorage.setItem(`exam_title_${key}`, title);
            sessionStorage.setItem(`exam_title_${key}`, title);
          }
        });
      }
    } catch {}
    if (!idToUse) {
      idToUse = typeof examTarget === "string" ? examTarget : (examTarget.guidId ?? String(examTarget.id));
    }
    router.push(`/web/${livePanelSlug}/vista/exam/generic?mode=${mode}&identifier=${idToUse}`);
  };

  const courseName =
    dynamicCourseName ||
    courseSlug
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
      .trim() ||
    `Course ${courseId}`;

  const currentSubjectTitle = dynamicSubjectName || subjectName || "Examinations";
  const backHref = `/dashboards/${panelSlug}/exams/${courseSlug}/${courseId}`;

  const customCoursesForBuilder: DashboardCourse[] = useMemo(() => {
    const subCategories: DashboardSubCategory[] = exams.map((e, index) => ({
      id: String(e.guidId || e.id),
      title: e.title,
      questionCount: e.questionsCount && e.questionsCount > 0 ? e.questionsCount : 45,
      usedCount: 0,
      order: index + 1,
    }));
    const totalQuestions = subCategories.reduce((sum, sc) => sum + sc.questionCount, 0);
    return [
      {
        id: Number(subjectId) || 1,
        guidId: String(subjectId),
        examType: panelSlug,
        title: currentSubjectTitle,
        category: "subject",
        questionCount: totalQuestions,
        examCount: exams.length,
        doneCount: 0,
        easyPct: 35,
        mediumPct: 45,
        hardPct: 20,
        order: 1,
        subCategories,
      },
    ];
  }, [exams, subjectId, panelSlug, currentSubjectTitle]);

  // Unique years dynamically fetched from exams for this subject
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    exams.forEach((e) => {
      const yr = extractExamYear(e.title, currentSubjectTitle, e.year);
      if (yr) years.add(String(yr));
    });
    return Array.from(years).sort((a, b) => Number(a) - Number(b));
  }, [exams, currentSubjectTitle]);

  // Split availableYears into vertical columns of up to 3 items each
  const yearColumns = useMemo(() => {
    const cols: string[][] = [];
    for (let i = 0; i < availableYears.length; i += 3) {
      cols.push(availableYears.slice(i, i + 3));
    }
    return cols;
  }, [availableYears]);

  const availableSeasons = useMemo(() => {
    const seasons = new Set<string>(["Fall", "Spring", "Summer"]);
    exams.forEach((e) => {
      const resolved = resolveExamSeason(e.season, e.title, e.description);
      if (resolved) seasons.add(resolved);
      else if (e.season) seasons.add(e.season);
    });
    return Array.from(seasons);
  }, [exams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const examYr = String(extractExamYear(exam.title, currentSubjectTitle, exam.year));
      const examSeason = resolveExamSeason(exam.season, exam.title, exam.description) || exam.season;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = exam.title?.toLowerCase().includes(q);
        const matchYear = examYr.includes(q);
        const matchSeason = examSeason ? examSeason.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchYear && !matchSeason) return false;
      }
      if (selectedYear !== "all") {
        if (examYr !== selectedYear) return false;
      }
      if (selectedSeason !== "all") {
        if (!examSeason || examSeason.toLowerCase() !== selectedSeason.toLowerCase()) return false;
      }
      return true;
    }).sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [exams, searchQuery, selectedYear, selectedSeason, currentSubjectTitle]);

  return (
    <div
      className="flex-1 flex flex-col pt-14 pb-8 md:pb-12 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        backgroundColor: "var(--content-bg)",
        color: "var(--text-color)",
      }}
    >
      <div className="p-3 md:p-5 lg:p-6 space-y-3.5 sm:space-y-4 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          {/* Breadcrumb line (Row 1 on phone, Left on desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg text-slate-600 dark:text-white/70 min-w-0 max-w-full overflow-hidden whitespace-nowrap">
            <Link
              href={`/dashboards/${panelSlug}`}
              className="hover:text-slate-950 dark:hover:text-white transition-colors font-normal shrink-0"
            >
              {panelLabel}
            </Link>
            <span className="text-slate-400 dark:text-white/40 font-normal shrink-0">/</span>
            <Link
              href={backHref}
              className="hover:text-slate-950 dark:hover:text-white transition-colors font-normal shrink-0 max-w-[130px] sm:max-w-none truncate"
              title={courseName}
            >
              {courseName}
            </Link>
            <span className="text-slate-400 dark:text-white/40 font-normal shrink-0">/</span>
            <span
              className="text-slate-950 dark:text-white font-normal truncate min-w-0"
              title={currentSubjectTitle}
            >
              {currentSubjectTitle}
            </span>
          </div>

          {/* Desktop Back button */}
          <Link
            href={backHref}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm sm:text-base font-semibold border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-white/90 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-xs shrink-0 self-center"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to {courseName}
          </Link>

          {/* Phone mode: Back button & Exams last updated on (same row outside container) */}
          <div className="flex sm:hidden items-center justify-between w-full pt-0.5 gap-2">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-white/90 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {courseName}
            </Link>

            <p className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-white/80 font-medium shrink-0">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
              <span>
                Exams last updated on{" "}
                <span suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {formattedUpdateDate}
                </span>
              </span>
            </p>
          </div>
        </div>

        {/* Reference-style Filter Bar & Create Custom Test */}
        <div className="grid grid-cols-2 md:grid-cols-3 items-start md:items-center gap-4 sm:gap-6 p-3.5 sm:p-4 md:p-5 rounded-xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] shadow-xs">
          {/* 1. Left: Years Column */}
          <div className="col-span-1 flex flex-col gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 justify-self-start">
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={selectedYear === "all"}
                onChange={() => setSelectedYear("all")}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-bold">All Years</span>
            </label>
            <div className="flex items-start gap-4">
              {yearColumns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5">
                  {col.map((yr) => (
                    <label
                      key={yr}
                      className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedYear === yr}
                        onChange={() => setSelectedYear(selectedYear === yr ? "all" : yr)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>{yr}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Center: Seasons Column (Centered in computer mode, pushed right on phone mode opposite to All Years) */}
          <div className="col-span-1 flex flex-col gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 justify-self-end md:justify-self-center">
            <label className="inline-flex items-center gap-2 cursor-pointer text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={selectedSeason === "all"}
                onChange={() => setSelectedSeason("all")}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="font-bold">All Seasons</span>
            </label>
            {!hideSeason &&
              availableSeasons.map((sn) => (
                <label
                  key={sn}
                  className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white pl-2 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeason === sn}
                    onChange={() => setSelectedSeason(selectedSeason === sn ? "all" : sn)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>{sn}</span>
                </label>
              ))}
          </div>

          {/* 3. Right: Search Box + Exams last updated (Side by side on phone mode, stacked on desktop) */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-2 w-full md:w-64 md:justify-self-end">
            <div className="flex flex-row items-center gap-2 w-full">
              {/* Search bar (left on phone mode, full width on desktop) */}
              <div className="relative flex-1 min-w-0 sm:w-full">
                <input
                  type="text"
                  placeholder="Search by Exams Name ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-lg text-xs bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors shadow-2xs placeholder:truncate"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
                )}
              </div>

              {/* Build Custom Exam button (right on phone mode, hidden on desktop here) */}
              <button
                type="button"
                onClick={() => setIsBuilderOpen(true)}
                className="sm:hidden shrink-0 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>Build Custom Exam</span>
              </button>
            </div>

            {/* Exams last updated on (under the search bar inside the box, desktop/tablet only) */}
            <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 dark:text-white/80 font-semibold px-0.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
              <span>
                Exams last updated on{" "}
                <span suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {formattedUpdateDate}
                </span>
              </span>
            </p>

            {/* Desktop/Tablet (sm+): Build Custom Exam button */}
            <button
              type="button"
              onClick={() => setIsBuilderOpen(true)}
              className="hidden sm:flex w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all shadow-xs items-center justify-center gap-1.5 cursor-pointer mt-0.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Build Custom Exam
            </button>
          </div>
        </div>

        {/* Exam Cards */}
        {status === "loading" || status === "idle" ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--card-bg,#15273e)] px-5 py-12 space-y-3 shadow-md">
            <Loader2 className="w-6 h-6 text-teal-600 dark:text-[#2FD9C4] animate-spin" />
            <p className="text-sm text-slate-600 dark:text-white/50 font-medium">Loading exams…</p>
          </div>
        ) : status === "error" ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-50 dark:bg-red-950/20 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Couldn&rsquo;t load exams right now.
            </p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--card-bg,#15273e)] px-5 py-10 text-center shadow-md">
            <FileQuestion className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-white/60">
              {exams.length === 0 ? "No exams available yet — check back soon." : "No exams match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {filteredExams.map((exam) => {
              const examId = exam.guidId ?? String(exam.id);
              const hasFreeAccess = exam.accessType === "Free";
              const allowedModes = exam.modes || ["Practice", "Review", "Exam"];

              const examIdStr = String(exam.id ?? "");
              const examGuid = exam.guidId ? String(exam.guidId) : "";
              const examTitleKey = exam.title ? exam.title.trim().toLowerCase() : "";

              const nominalMatch = nominalExams.find(
                (ne) =>
                  (examGuid && (ne.guidId === examGuid || String(ne.id) === examGuid)) ||
                  (examIdStr && (String(ne.id) === examIdStr || ne.guidId === examIdStr)) ||
                  (examTitleKey && ne.title && ne.title.trim().toLowerCase() === examTitleKey)
              );

              const actions = exam.examActions?.length
                ? exam.examActions
                : (nominalMatch?.examActions ?? []);
              const hasCompletedAction = actions.some((a) => a.status === "Completed" || a.status === "Finished");
              const hasResultCompleted =
                (examGuid ? completedExamIds.has(examGuid) : false) ||
                (examIdStr ? completedExamIds.has(examIdStr) : false) ||
                (examId ? completedExamIds.has(String(examId)) : false) ||
                exam.status === "Completed";
              const isCompleted = hasCompletedAction || hasResultCompleted;

              return (
                <div
                  key={examId}
                  className="rounded-xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] px-3.5 py-3 sm:px-4 sm:py-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200"
                >
                  {/* Top: Title + Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-[13px] sm:text-[14px] font-medium text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {exam.title}
                    </h3>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs shrink-0">
                        <Check className="w-2.5 h-2.5" />
                        Completed
                      </span>
                    ) : hasFreeAccess ? (
                      <span className="bg-[#1877F2] text-white text-[10.5px] font-medium px-1.5 py-0.5 rounded shadow-xs shrink-0">
                        Free
                      </span>
                    ) : null}
                  </div>

                  {/* Middle: Meta pills */}
                  <div className="relative flex items-center justify-between gap-1.5 my-1.5 min-h-[22px]">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-normal text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-xs shrink-0 whitespace-nowrap">
                      Total Questions : {exam.questionsCount ?? 0}
                    </span>

                    {!hideSeason && (resolveExamSeason(exam.season, exam.title, exam.description) || exam.season) && (
                      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-normal text-orange-800 dark:text-orange-400 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-xs uppercase pointer-events-auto whitespace-nowrap">
                          {resolveExamSeason(exam.season, exam.title, exam.description) || exam.season}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                      {extractExamYear(exam.title, currentSubjectTitle, exam.year) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-normal text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-xs whitespace-nowrap">
                          Year : {extractExamYear(exam.title, currentSubjectTitle, exam.year)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Mode Buttons */}
                  <div className="flex items-center gap-1.5 mt-2 pt-1">
                    {allowedModes.includes("Practice") && (
                      <button
                        type="button"
                        onClick={() => startExam(exam, "Practice")}
                        className="flex-1 py-1 px-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-slate-950 dark:text-slate-950 bg-[#00D0FF] hover:bg-[#00BCE6] transition-colors shadow-xs text-center border border-white/70 dark:border-white/30 truncate"
                      >
                        Practice Mode
                      </button>
                    )}
                    {allowedModes.includes("Review") && (
                      <button
                        type="button"
                        onClick={() => startExam(exam, "Review")}
                        className="flex-1 py-1 px-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-white bg-[#212529] hover:bg-[#15181B] transition-colors shadow-xs text-center border border-white/50 dark:border-white/30 truncate"
                      >
                        Review Mode
                      </button>
                    )}
                    {allowedModes.includes("Exam") && (
                      <button
                        type="button"
                        onClick={() => startExam(exam, "Exam")}
                        className="flex-1 py-1 px-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-white bg-[#782828] hover:bg-[#682020] transition-colors shadow-xs text-center border border-white/50 dark:border-white/30 truncate"
                      >
                        Exam Mode
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NclexCustomTestPopup
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        panelSlug={panelSlug}
        livePanelSlug={livePanelSlug}
        title={`${currentSubjectTitle.toUpperCase()} EXAM BUILDER`}
        builderMode="questions"
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
    </div>
  );
}