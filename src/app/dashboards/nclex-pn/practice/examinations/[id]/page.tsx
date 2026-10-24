"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { NCLEX_PRACTICE_CONFIG, type NclexExamType } from "@/lib/config/nclex-practice";
import { NCLEX_PRACTICE_EXAMS } from "@/lib/config/nclex-practice-exams";
import {
  NclexCustomTestPopup,
  type BuilderExamType,
} from "@/components/common/dashboards/nclex/NclexDashboardSections";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";
import { useRelativeStrataAssessmentResults } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import {
  ClipboardList,
  Check,
  Calendar,
  Search,
  ArrowLeft,
  X,
} from "lucide-react";

const PANEL: BuilderExamType = "nclex-pn";
const VISTA = `/dashboards/${PANEL}/vista`;
const OVERVIEW = `/dashboards/${PANEL}/practice/overview`;

const PER_PAGE = 50;

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function NclexPnPracticeExaminationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectName = searchParams.get("subjectName") ?? null;
  const { leftWidth, navHeight } = useFlexPageClasp();

  const [page, setPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [isCustomTestOpen, setIsCustomTestOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [id]);

  const { filteredExams: exams, skewTotal, skewTotalPages, examSearch, setExamSearch } = useNominalStrataExams({
    parentIdentifier: id,
    page,
    perPage: PER_PAGE,
  });

  const config = NCLEX_PRACTICE_CONFIG["nclex-pn" as NclexExamType];
  const isReadiness =
    id === "30" ||
    id === "111" ||
    id === config.readiness.subjectGuidId ||
    id === config.readiness.domainsGroupId;
  const isPractice =
    !isReadiness &&
    (id === "5" ||
      id === "110" ||
      id === config.practice.domainsGroupId ||
      id === config.practice.subjectGuidId);
  const groupLabel = isReadiness ? config.readiness.label : (subjectName || config.practice.label);

  // When the backend has no records for the practice/readiness group yet, fall
  // back to the NCLEX catalog so the flow always shows the expected exams.
  const catalog = (isPractice || isReadiness)
    ? NCLEX_PRACTICE_EXAMS["nclex-pn" as NclexExamType][isReadiness ? "readiness" : "practice"]
    : null;

  // Filter out any backend exams that don't belong to NCLEX (e.g. legacy id collisions)
  const validBackendExams = useMemo(() => {
    if (!isPractice && !isReadiness) return exams;
    return exams.filter((e) => /nclex/i.test(e.title || ""));
  }, [exams, isPractice, isReadiness]);

  const fallbackExams = useMemo(() => {
    if (validBackendExams.length > 0 || !catalog) return [];
    const q = examSearch.trim().toLowerCase();
    return q ? catalog.filter((e) => e.title.toLowerCase().includes(q)) : catalog;
  }, [validBackendExams, catalog, examSearch]);

  const { filteredExamResults: allResults } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 200,
    sortColumn: null,
    sortDirection: "asc",
  });

  const completedExamIds = useMemo(() => {
    const set = new Set<string>();
    allResults.forEach((r) => {
      if (r.examGuidId) set.add(r.examGuidId);
      if (r.examId) set.add(String(r.examId));
      if (r.id) set.add(String(r.id));
    });
    return set;
  }, [allResults]);

  type ExamCard = {
    id: string | number;
    guidId?: string;
    title: string;
    year?: number;
    season?: string;
    questionsCount?: number;
    accessType?: string;
    updatedAt?: string;
    examActions?: {
      status?: string;
      isAttempted?: boolean;
    }[];
    status?: string;
  };

  const shownExams: ExamCard[] = useMemo(() => {
    const list: ExamCard[] =
      validBackendExams.length > 0
        ? validBackendExams.map((e) => ({
            id: e.id,
            guidId: e.guidId,
            title: e.title,
            year: e.year,
            season: e.season,
            questionsCount: e.questionsCount,
            accessType: e.accessType,
            updatedAt: e.updatedAt,
            examActions: e.examActions,
            status: e.status,
          }))
        : fallbackExams.map((e) => ({
            id: e.id,
            title: e.title,
            year: e.year,
            questionsCount: e.questionsCount,
            accessType: "Restricted",
          }));
    return list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [validBackendExams, fallbackExams]);

  // Unique years dynamically fetched from exams for this subject
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    shownExams.forEach((e) => {
      const yr = extractExamYear(e.title, subjectName, e.year);
      if (yr) years.add(String(yr));
    });
    return Array.from(years).sort((a, b) => Number(a) - Number(b));
  }, [shownExams, subjectName]);

  // Split availableYears into vertical columns of up to 3 items each
  const yearColumns = useMemo(() => {
    const cols: string[][] = [];
    for (let i = 0; i < availableYears.length; i += 3) {
      cols.push(availableYears.slice(i, i + 3));
    }
    return cols;
  }, [availableYears]);

  const availableSeasons = useMemo(() => {
    const seasons = new Set<string>(["Fall", "Spring"]);
    shownExams.forEach((e) => {
      if (e.season) seasons.add(e.season);
    });
    return Array.from(seasons).sort();
  }, [shownExams]);

  const formattedUpdateDate = useMemo(() => {
    return getPreviousDayFormatted();
  }, []);

  // Client-side filtering by search query, selected year & season
  const filteredShownExams = useMemo(() => {
    return shownExams
      .filter((exam) => {
        const examYr = String(extractExamYear(exam.title, subjectName, exam.year));
        if (examSearch.trim()) {
          const q = examSearch.toLowerCase().trim();
          const matchTitle = exam.title?.toLowerCase().includes(q);
          const matchYear = examYr.includes(q);
          const matchSeason = exam.season ? exam.season.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchYear && !matchSeason) return false;
        }
        if (selectedYear !== "all") {
          if (examYr !== selectedYear) return false;
        }
        if (selectedSeason !== "all") {
          if (!exam.season || exam.season !== selectedSeason) return false;
        }
        return true;
      })
      .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [shownExams, examSearch, selectedYear, selectedSeason, subjectName]);

  const shownTotal = exams.length > 0 ? skewTotal : fallbackExams.length;

  const startExam = (examId: string, mode: string) => {
    router.push(`/web/lpn-nursing/vista/exam/generic?mode=${mode}&identifier=${examId}`);
  };

  const backHref = subjectName
    ? OVERVIEW
    : `${VISTA}/practice/domains/${isPractice ? config.practice.domainsGroupId : config.readiness.domainsGroupId}`;

  return (
    <main
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--text-color)",
      }}
    >
      <div className="p-2 md:p-3 lg:p-4 space-y-3 lg:space-y-4 w-full max-w-7xl mx-auto">
        {/* Breadcrumb Row 1 */}
        <div className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-slate-500 dark:text-[var(--text-color)]/70 flex-wrap">
          <Link href="/dashboards/nclex-pn" className="hover:text-blue-600 dark:hover:text-[#2FD9C4] transition-colors font-semibold">
            NCLEX PN
          </Link>
          <span className="text-slate-400 dark:text-white/40 font-normal">/</span>
          {subjectName ? (
            <>
              <Link
                href={OVERVIEW}
                className="hover:text-blue-600 dark:hover:text-[#2FD9C4] transition-colors font-semibold truncate max-w-[140px] sm:max-w-none"
              >
                Practice Subjects
              </Link>
              <span className="text-slate-400 dark:text-white/40 font-normal">/</span>
              <span className="text-slate-800 dark:text-[var(--text-color)]/80 font-bold truncate max-w-[180px] sm:max-w-none">
                {subjectName}
              </span>
              <span className="text-slate-400 dark:text-white/40 font-normal">/</span>
            </>
          ) : (
            <>
              <Link
                href={`${VISTA}/practice/domains/${isPractice ? config.practice.domainsGroupId : config.readiness.domainsGroupId}`}
                className="hover:text-blue-600 dark:hover:text-[#2FD9C4] transition-colors font-semibold truncate max-w-[160px] sm:max-w-none"
              >
                {isPractice ? config.practice.label : config.readiness.label}
              </Link>
              <span className="text-slate-400 dark:text-white/40 font-normal">/</span>
            </>
          )}
          <span className="text-slate-900 dark:text-[var(--text-color)] font-bold">Examinations</span>
        </div>

        {/* Phone mode: Back button */}
        <div className="flex sm:hidden items-center justify-start w-full pt-0.5">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-white/90 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            {subjectName ? "Back to Practice Subjects" : "Back to Domains"}
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-4 md:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF7A59]/15">
                <ClipboardList className="w-5 h-5 text-[#FF7A59]" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-[var(--text-color)]">
                  {subjectName ? `${subjectName} — ` : ""}
                  {shownTotal} Exam{shownTotal !== 1 ? "s" : ""} Available
                </h1>
                <p className="text-xs text-slate-600 dark:text-[var(--text-color)]/50">
                  {subjectName
                    ? `${subjectName} exams within ${groupLabel}`
                    : "Select a mode to begin your assessment"}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm sm:text-base font-semibold border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-white/90 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                {subjectName ? "Back to Practice Subjects" : "Back to Domains"}
              </Link>
            </div>
          </div>
        </div>

        {/* Reference-style Filter Bar & Create Custom Test */}
        <div className="grid grid-cols-2 md:grid-cols-3 items-start md:items-center gap-4 sm:gap-6 p-3.5 sm:p-4 md:p-5 rounded-xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] shadow-xs">
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
            {availableSeasons.map((sn) => (
              <label key={sn} className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white pl-2 transition-colors">
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

          {/* 3. Right: Search Box + Exams last updated + Create Custom Test (Side by side on phone mode, stacked on desktop) */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-2 w-full md:w-64 md:justify-self-end">
            <div className="flex flex-row items-center gap-2 w-full">
              {/* Search bar (left on phone mode, full width on desktop) */}
              <div className="relative flex-1 min-w-0 sm:w-full">
                <input
                  type="text"
                  placeholder="Search by Exams Name ..."
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors placeholder:truncate"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {examSearch && (
                  <button
                    type="button"
                    onClick={() => setExamSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile-only Create Custom Test button */}
              <button
                type="button"
                onClick={() => setIsCustomTestOpen(true)}
                className="sm:hidden shrink-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-xs font-semibold hover:bg-teal-500/20 dark:hover:bg-teal-500/30 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <span>+</span>
                <span>Create Custom Test</span>
              </button>
            </div>

            {/* Exams last updated on (under search bar inside the box) */}
            <p className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-white/80 font-semibold px-0.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
              <span>
                Exams last updated on{" "}
                <span suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {formattedUpdateDate}
                </span>
              </span>
            </p>

            {/* Desktop/Tablet (sm+): Create Custom Test button */}
            <button
              type="button"
              onClick={() => setIsCustomTestOpen(true)}
              className="hidden sm:inline-flex w-full items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-xs font-semibold hover:bg-teal-500/20 dark:hover:bg-teal-500/30 transition-all cursor-pointer shadow-2xs"
            >
              <span>+</span>
              <span>Create Custom Test</span>
            </button>
          </div>
        </div>

        {/* Exam Cards */}
        {filteredShownExams.length === 0 ? (
          <div className="rounded-xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] px-5 py-10 text-center shadow-xs">
            <ClipboardList className="w-10 h-10 text-[var(--text-color)]/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[var(--text-color)]/50">
              No exams available yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {filteredShownExams.map((exam) => {
              const examId = exam.guidId ?? String(exam.id);
              const hasFreeAccess = exam.accessType === "Free";

              const actions = exam.examActions ?? [];
              const hasCompletedAction = actions.some((a) => a.status === "Completed" || a.status === "Finished");
              const hasResultCompleted =
                (exam.guidId ? completedExamIds.has(exam.guidId) : false) ||
                (exam.id ? completedExamIds.has(String(exam.id)) : false) ||
                exam.status === "Completed";
              const isCompleted = hasCompletedAction || hasResultCompleted;

              return (
                <div
                  key={examId}
                  className="rounded-xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] p-4 md:p-5 flex flex-col gap-3 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <Check className="w-2.5 h-2.5" />
                        Completed
                      </span>
                    ) : hasFreeAccess ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        FREE
                      </span>
                    ) : (
                      <span />
                    )}
                    {Boolean(extractExamYear(exam.title, subjectName, exam.year)) && (
                      <span className="text-[10px] text-slate-600 dark:text-[var(--text-color)]/40 font-medium">
                        Year: {extractExamYear(exam.title, subjectName, exam.year)}
                      </span>
                    )}
                  </div>

                  {/* Exam Info */}
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-[var(--text-color)] leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-[var(--text-color)]/50 mt-1">
                      Total Questions : {exam.questionsCount ?? 0}
                      {extractExamYear(exam.title, subjectName, exam.year)
                        ? ` | Year : ${extractExamYear(exam.title, subjectName, exam.year)}`
                        : ""}
                    </p>
                  </div>

                  {/* Mode Buttons */}
                  <div className="flex items-center gap-1.5 mt-auto pt-2">
                    <button
                      type="button"
                      onClick={() => startExam(examId, "Practice")}
                      className="flex-1 py-1 px-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-slate-950 dark:text-slate-950 bg-[#00D0FF] hover:bg-[#00BCE6] transition-colors shadow-xs text-center border border-white/70 dark:border-white/30 truncate"
                    >
                      Practice Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => startExam(examId, "Review")}
                      className="flex-1 py-1 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-white bg-[#212529] hover:bg-[#15181B] transition-colors shadow-xs text-center border border-white/50 dark:border-white/30 truncate"
                    >
                      Review Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => startExam(examId, "Exam")}
                      className="flex-1 py-1 px-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-white bg-[#782828] hover:bg-[#682020] transition-colors shadow-xs text-center border border-white/50 dark:border-white/30 truncate"
                    >
                      Exam Mode
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {skewTotalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--text-color)]/10 text-[var(--text-color)]/60 hover:text-[var(--text-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>
            {pageList(page, skewTotalPages).map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-xs text-[var(--text-color)]/40">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    p === page
                      ? "bg-[#2FD9C4] text-[#08111F]"
                      : "border border-[var(--text-color)]/10 text-[var(--text-color)]/60 hover:text-[var(--text-color)] hover:bg-[var(--text-color)]/5"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(skewTotalPages, p + 1))}
              disabled={page >= skewTotalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--text-color)]/10 text-[var(--text-color)]/60 hover:text-[var(--text-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <NclexCustomTestPopup
        isOpen={isCustomTestOpen}
        onClose={() => setIsCustomTestOpen(false)}
        defaultMode="custom"
        panelSlug={PANEL}
        livePanelSlug="lpn-nursing"
        examType={PANEL}
      />
    </main>
  );
}
