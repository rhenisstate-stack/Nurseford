"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import {
  Activity,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  GraduationCap,
  Play,
  Target,
  X,
  RotateCcw,
  Settings,
} from "lucide-react";
import { useExamCourses, type DashboardCourse, type DashboardSubCategory } from "@/lib/hooks/home/useExamCourses";

export type { DashboardCourse };

const ACCENT_TEAL = "#2FD9C4";
const ACCENT_GOLD = "#F5B843";

const EXAM_MODES = ["Exam", "Practice", "Tutor", "Test"] as const;
const LAYOUTS = ["generic", "glacial"] as const;
type ExamLayout = (typeof LAYOUTS)[number];

type PopupDefaultMode = "custom" | "practice" | "readiness";

export type BuilderExamType = "nclex-rn" | "nclex-pn" | "hesi-a2" | "ati-teas" | "rn-nursing" | "lpn-nursing";

const EXAM_LABELS: Record<BuilderExamType, string> = {
  "nclex-rn": "NCLEX-RN",
  "nclex-pn": "NCLEX-PN",
  "hesi-a2": "HESI A2",
  "ati-teas": "TEAS 7 Prep",
  "rn-nursing": "RN NURSING",
  "lpn-nursing": "LPN NURSING",
};

interface NclexCustomTestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: PopupDefaultMode;
  panelSlug: string;
  livePanelSlug?: string;
  examType: BuilderExamType;
  customCourses?: DashboardCourse[];
  title?: string;
  builderMode?: "questions" | "exams";
}

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";
type StatusFilter = "All" | "Unused" | "Used" | "Bookmarked";

// ─── Estimated Exam Duration Helper ──────────────────────────────────────────────────────────

function formatEstimatedDuration(count: number): string {
  const totalMinutes = Math.max(1, count) * 2;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `~ ${hours} ${hours === 1 ? "Hour" : "Hours"} ${minutes} ${minutes === 1 ? "Minute" : "Minutes"}`;
  }
  if (hours > 0) {
    return `~ ${hours} ${hours === 1 ? "Hour" : "Hours"}`;
  }
  return `~ ${minutes} ${minutes === 1 ? "Minute" : "Minutes"}`;
}

// ─── Filter Calculations Helper ─────────────────────────────────────────────────────────────

function getSubCategoryCounts(
  sc: DashboardSubCategory,
  course: DashboardCourse,
  difficultyFilter: DifficultyFilter,
  statusFilter: StatusFilter
) {
  let diffCount = sc.questionCount;
  if (difficultyFilter === "Easy") {
    diffCount = Math.max(1, Math.round(sc.questionCount * ((course.easyPct || 33) / 100)));
  } else if (difficultyFilter === "Medium") {
    diffCount = Math.max(1, Math.round(sc.questionCount * ((course.mediumPct || 34) / 100)));
  } else if (difficultyFilter === "Hard") {
    diffCount = Math.max(1, Math.round(sc.questionCount * ((course.hardPct || 33) / 100)));
  }

  const usedCount = Math.min(diffCount, sc.usedCount || 0);
  const unusedCount = Math.max(0, diffCount - usedCount);
  const bookmarkedCount = 0;

  let available = diffCount;
  if (statusFilter === "Unused") {
    available = unusedCount;
  } else if (statusFilter === "Used") {
    available = usedCount;
  } else if (statusFilter === "Bookmarked") {
    available = bookmarkedCount;
  }

  return {
    totalInScope: diffCount,
    usedInScope: usedCount,
    available,
  };
}

// ─── Domain Row ──────────────────────────────────────────────────────────────────────────────

function DomainRow({
  course,
  selectedSubs,
  onToggleSub,
  onToggleDomain,
  defaultExpanded = false,
  isExamMode = false,
  difficultyFilter = "All",
  statusFilter = "All",
}: {
  course: DashboardCourse;
  selectedSubs: Set<string>;
  onToggleSub: (subId: string) => void;
  onToggleDomain: (subs: DashboardSubCategory[], courseId?: string) => void;
  defaultExpanded?: boolean;
  isExamMode?: boolean;
  difficultyFilter?: DifficultyFilter;
  statusFilter?: StatusFilter;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  useEffect(() => {
    if (defaultExpanded != null) {
      setExpanded(defaultExpanded);
    }
  }, [defaultExpanded]);

  const subCategories = course.subCategories || [];
  const hasSubs = subCategories.length > 0;

  // Filter visible subcategories based on active difficulty & status
  const visibleSubCategories = hasSubs
    ? subCategories.filter(
        (sc) => getSubCategoryCounts(sc, course, difficultyFilter, statusFilter).available > 0
      )
    : [];

  const domainQs = hasSubs
    ? visibleSubCategories.reduce(
        (s, sc) => s + getSubCategoryCounts(sc, course, difficultyFilter, statusFilter).available,
        0
      )
    : course.questionCount;
  const domainExams = course.examCount ?? (visibleSubCategories.length > 0 ? visibleSubCategories.length : (hasSubs ? subCategories.length : 1));

  // If this domain has subcategories but NONE are available under the active filters, hide the domain completely
  if (hasSubs && visibleSubCategories.length === 0) {
    return null;
  }

  const selectedCount = visibleSubCategories.filter((sc) => selectedSubs.has(sc.id)).length;
  const allSelected = visibleSubCategories.length > 0
    ? selectedCount === visibleSubCategories.length
    : selectedSubs.has(String(course.id)) || (course.guidId ? selectedSubs.has(course.guidId) : false);
  const someSelected = visibleSubCategories.length > 0 ? selectedCount > 0 && !allSelected : false;

  return (
    <div className="border border-[#CBDCF8] dark:border-white/10 rounded-xl overflow-hidden bg-white/70 dark:bg-black/20">
      {/* Domain Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-slate-100/90 dark:bg-white/5 cursor-pointer hover:bg-slate-200/90 dark:hover:bg-white/10 transition-colors"
        onClick={() => {
          if (visibleSubCategories.length > 0) setExpanded(!expanded);
        }}
      >
        {/* Domain Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDomain(visibleSubCategories, String(course.guidId || course.id));
          }}
          className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${
            allSelected
              ? "bg-[#2FD9C4] border-[#2FD9C4]"
              : someSelected
                ? "bg-[#2FD9C4]/40 border-[#2FD9C4]"
                : "border-slate-400 dark:border-white/30 hover:border-slate-600 dark:hover:border-white/50"
          }`}
        >
          {allSelected && <Check className="w-2.5 h-2.5 text-[#08111F]" />}
          {someSelected && !allSelected && <div className="w-2 h-0.5 bg-[#08111F]" />}
        </button>

        {/* Expand Arrow */}
        {visibleSubCategories.length > 0 ? (
          expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-white/50 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-white/50 shrink-0" />
          )
        ) : (
          <div className="w-3.5 h-3.5 shrink-0" />
        )}

        {/* Domain Title */}
        <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-[var(--text-color)] truncate flex-1 min-w-0">
          {course.title}
        </span>

        {/* Question / Exam Count */}
        <span className="text-[10px] md:text-xs font-bold text-[#0891b2] dark:text-[#2FD9C4] shrink-0">
          {isExamMode ? `${domainExams} ${domainExams === 1 ? "Exam" : "Exams"}` : `${domainQs} Qs`}
        </span>
      </div>

      {/* Sub-Categories */}
      {expanded && visibleSubCategories.length > 0 && (
        <div className="border-t border-[#CBDCF8]/60 dark:border-white/5">
          {visibleSubCategories.map((sc) => {
            const isSelected = selectedSubs.has(sc.id);
            const counts = getSubCategoryCounts(sc, course, difficultyFilter, statusFilter);
            return (
              <div
                key={sc.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors border-b border-[#CBDCF8]/50 dark:border-white/5 last:border-b-0"
              >
                {/* Sub Checkbox */}
                <button
                  onClick={() => onToggleSub(sc.id)}
                  className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[#2FD9C4] border-[#2FD9C4]"
                      : "border-slate-400 dark:border-white/30 hover:border-slate-600 dark:hover:border-white/50"
                  }`}
                >
                  {isSelected && <Check className="w-2 h-2 text-[#08111F]" />}
                </button>

                {/* Sub Title */}
                <span className="text-[11px] md:text-xs text-slate-800 dark:text-[var(--text-color)]/80 font-medium truncate flex-1 min-w-0">
                  {sc.title}
                </span>

                {/* Used / Total */}
                <span className="text-[10px] text-slate-500 dark:text-[var(--text-color)]/40 shrink-0 font-medium">
                  Used {counts.usedInScope} of {counts.totalInScope}
                </span>

                {/* Question Count Badge */}
                <span className="text-[10px] font-bold text-slate-700 dark:text-[var(--text-color)]/70 shrink-0 min-w-6 text-right">
                  {counts.available}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Popup ──────────────────────────────────────────────────────────────────────────────

export function NclexCustomTestPopup({
  isOpen,
  onClose,
  panelSlug,
  livePanelSlug,
  examType,
  customCourses,
  title,
  builderMode,
}: NclexCustomTestPopupProps) {
  const router = useRouter();
  const { courses: rawCourses, examBuilderStats } = useExamCourses(examType);
  const courses = useMemo(() => {
    if (customCourses && customCourses.length > 0) {
      return customCourses;
    }
    const filtered = rawCourses.filter(
      (c) => !/^(?:ATI|HESI)\s*Exit\s*Exams/i.test(c.title.trim())
    );
    const subjects = filtered.filter((c) => c.category === "subject");
    return subjects.length > 0 ? subjects : filtered;
  }, [customCourses, rawCourses]);
  const { user } = useCurrentSystemUser();

  const isExamMode =
    builderMode === "exams" ||
    (builderMode !== "questions" && courses.length > 0 && courses.every((c) => !c.subCategories || c.subCategories.length === 0));

  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(50);
  const [examCount, setExamCount] = useState(3);
  const [hasUserAdjustedCount, setHasUserAdjustedCount] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [selectedMode, setSelectedMode] = useState<string>("Practice");
  const [layout, setLayout] = useState<ExamLayout>("generic");
  const [showModeLayout, setShowModeLayout] = useState(false);

  // ─── Stats ────────────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (examBuilderStats) return examBuilderStats;
    let totalDomains = 0;
    let totalExams = 0;
    let totalQuestions = 0;
    const subjectCourses = rawCourses.filter((c) => c.category === "subject");
    const target = subjectCourses.length > 0 ? subjectCourses : rawCourses;
    for (const sc of target) {
      totalDomains += 1;
      totalExams += sc.examCount || (sc.subCategories.length > 0 ? sc.subCategories.length : 1);
      if (sc.subCategories.length > 0) {
        totalQuestions += sc.subCategories.reduce((s, sub) => s + sub.questionCount, 0);
      } else {
        totalQuestions += sc.questionCount || 45;
      }
    }
    return { totalDomains, totalExams, totalQuestions };
  }, [examBuilderStats, rawCourses]);

  // ─── Selection Logic ──────────────────────────────────────────────────────────────────
  const toggleSub = useCallback((subId: string) => {
    setSelectedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  }, []);

  const toggleDomain = useCallback(
    (subs: DashboardSubCategory[], courseId?: string) => {
      setSelectedSubs((prev) => {
        const next = new Set(prev);
        if (subs && subs.length > 0) {
          const allSelected = subs.every((sc) => next.has(sc.id));
          for (const sc of subs) {
            if (allSelected) next.delete(sc.id);
            else next.add(sc.id);
          }
        } else if (courseId) {
          if (next.has(courseId)) next.delete(courseId);
          else next.add(courseId);
        }
        return next;
      });
    },
    []
  );

  const clearAll = () => {
    setSelectedSubs(new Set());
    setHasUserAdjustedCount(false);
    setQuestionCount(50);
    setExamCount(3);
    setDifficultyFilter("All");
    setStatusFilter("All");
  };

  useEffect(() => {
    if (isOpen) {
      clearAll();
    }
  }, [isOpen, customCourses]);

  const visibleCourses = useMemo(() => {
    return courses.filter((c) => {
      if (c.subCategories && c.subCategories.length > 0) {
        return c.subCategories.some(
          (sc) => getSubCategoryCounts(sc, c, difficultyFilter, statusFilter).available > 0
        );
      }
      return (c.questionCount || 0) > 0;
    });
  }, [courses, difficultyFilter, statusFilter]);

  const selectedQs = useMemo(() => {
    let total = 0;
    for (const c of courses) {
      if (c.subCategories.length > 0) {
        for (const sc of c.subCategories) {
          if (selectedSubs.has(sc.id)) {
            total += getSubCategoryCounts(sc, c, difficultyFilter, statusFilter).available;
          }
        }
      } else {
        if (selectedSubs.has(String(c.id)) || (c.guidId && selectedSubs.has(c.guidId))) {
          total += c.questionCount || 45;
        }
      }
    }
    return total;
  }, [courses, selectedSubs, difficultyFilter, statusFilter]);

  const totalSelectedExams = useMemo(() => {
    let total = 0;
    for (const c of courses) {
      const match = selectedSubs.has(String(c.id)) || (c.guidId && selectedSubs.has(c.guidId));
      if (match) {
        total += c.examCount || (c.subCategories.length > 0 ? c.subCategories.length : 1);
      }
    }
    return total;
  }, [courses, selectedSubs]);

  // Keep questionCount and examCount aligned with selections
  useEffect(() => {
    if (isExamMode) {
      if (totalSelectedExams > 0) {
        setExamCount((prev) => (hasUserAdjustedCount ? Math.min(Math.max(1, prev), totalSelectedExams) : Math.min(3, totalSelectedExams)));
      }
    } else {
      if (selectedQs > 0) {
        setQuestionCount((prev) => (hasUserAdjustedCount ? Math.min(85, Math.max(5, prev)) : Math.min(85, Math.max(5, 50))));
      }
    }
  }, [isExamMode, totalSelectedExams, selectedQs, hasUserAdjustedCount]);

  const activeSelectedCount = useMemo(() => {
    let count = 0;
    for (const c of courses) {
      if (c.subCategories && c.subCategories.length > 0) {
        for (const sc of c.subCategories) {
          if (selectedSubs.has(sc.id)) {
            const counts = getSubCategoryCounts(sc, c, difficultyFilter, statusFilter);
            if (counts.available > 0) count++;
          }
        }
      } else {
        if (selectedSubs.has(String(c.id)) || (c.guidId && selectedSubs.has(c.guidId))) {
          count++;
        }
      }
    }
    return count;
  }, [courses, selectedSubs, difficultyFilter, statusFilter]);

  const hasSelection = activeSelectedCount > 0;

  // ─── Selected Breakdown Stats (e.g. "0 Domain(s) · 3 Exam(s) · 12 Q Pool") ───────────
  const { selectedDomainsCount, selectedExamsCount } = useMemo(() => {
    let domainCount = 0;
    let examCount = 0;

    for (const c of courses) {
      if (c.subCategories && c.subCategories.length > 0) {
        const availableSubs = c.subCategories.filter(
          (sc) => getSubCategoryCounts(sc, c, difficultyFilter, statusFilter).available > 0
        );
        if (availableSubs.length > 0) {
          const selectedSubsInDomain = availableSubs.filter((sc) => selectedSubs.has(sc.id));
          examCount += selectedSubsInDomain.length;
          // Domain is counted as selected if all available exams in it are selected
          if (selectedSubsInDomain.length === availableSubs.length) {
            domainCount += 1;
          }
        }
      } else {
        if (selectedSubs.has(String(c.id)) || (c.guidId && selectedSubs.has(c.guidId))) {
          domainCount += 1;
          examCount += 1;
        }
      }
    }

    return { selectedDomainsCount: domainCount, selectedExamsCount: examCount };
  }, [courses, selectedSubs, difficultyFilter, statusFilter]);


  // ─── Start ────────────────────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (!hasSelection) return;
    const subIds = Array.from(selectedSubs).join(",");
    const firstId = Array.from(selectedSubs)[0];

    // Helper to strip redundant program suffix when joining domain titles
    const cleanDomain = (raw: string) =>
      raw.replace(/\s+NCLEX-(?:RN|PN)$/i, "").trim() || raw;

    // Identify which courses/domains have selections and which exams inside them were picked
    const selectedCoursesData: {
      course: DashboardCourse;
      selectedExamTitles: string[];
      totalAvailableExams: number;
    }[] = [];

    for (const c of courses) {
      if (c.subCategories && c.subCategories.length > 0) {
        const selectedInCourse: string[] = [];
        for (const sc of c.subCategories) {
          if (selectedSubs.has(sc.id)) {
            selectedInCourse.push(sc.title);
          }
        }
        if (selectedInCourse.length > 0) {
          selectedCoursesData.push({
            course: c,
            selectedExamTitles: selectedInCourse,
            totalAvailableExams: c.subCategories.length,
          });
        }
      } else {
        if (selectedSubs.has(String(c.id)) || (c.guidId && selectedSubs.has(c.guidId))) {
          selectedCoursesData.push({
            course: c,
            selectedExamTitles: [c.title],
            totalAvailableExams: 1,
          });
        }
      }
    }

    // Compute friendly title reflecting selected domains / exams
    let resolvedTitle = "";
    if (isExamMode) {
      if (selectedCoursesData.length === 1) {
        resolvedTitle = selectedCoursesData[0].course.title;
      } else if (selectedCoursesData.length === 2) {
        resolvedTitle = `${cleanDomain(selectedCoursesData[0].course.title)} & ${cleanDomain(selectedCoursesData[1].course.title)}`;
      } else if (selectedCoursesData.length === 3) {
        resolvedTitle = `${cleanDomain(selectedCoursesData[0].course.title)}, ${cleanDomain(selectedCoursesData[1].course.title)} & ${cleanDomain(selectedCoursesData[2].course.title)}`;
      } else if (selectedCoursesData.length > 3 && selectedCoursesData.length === courses.length) {
        resolvedTitle = `${EXAM_LABELS[examType] || "NCLEX"} - All Domains`;
      } else if (selectedCoursesData.length > 3) {
        resolvedTitle = `${cleanDomain(selectedCoursesData[0].course.title)}, ${cleanDomain(selectedCoursesData[1].course.title)} & ${selectedCoursesData.length - 2} more domains`;
      } else {
        const cleanTitle = (title || "").replace(/\s+EXAM\s+BUILDER$/i, "").trim();
        resolvedTitle = cleanTitle || `${EXAM_LABELS[examType] || "NCLEX"} Custom Exam`;
      }
    } else {
      // Questions mode
      if (selectedCoursesData.length === 1) {
        const item = selectedCoursesData[0];
        // If all available exams in this domain are selected or user picked > 3 exams
        if (item.selectedExamTitles.length === item.totalAvailableExams || item.selectedExamTitles.length > 3) {
          resolvedTitle = item.course.title;
        } else if (item.selectedExamTitles.length === 1) {
          resolvedTitle = `${cleanDomain(item.course.title)}: ${item.selectedExamTitles[0]}`;
        } else {
          // 2 or 3 exams in this single domain
          resolvedTitle = `${cleanDomain(item.course.title)}: ${item.selectedExamTitles.join(" & ")}`;
        }
      } else if (selectedCoursesData.length === 2) {
        resolvedTitle = `${cleanDomain(selectedCoursesData[0].course.title)} & ${cleanDomain(selectedCoursesData[1].course.title)}`;
      } else if (selectedCoursesData.length === 3) {
        resolvedTitle = `${cleanDomain(selectedCoursesData[0].course.title)}, ${cleanDomain(selectedCoursesData[1].course.title)} & ${cleanDomain(selectedCoursesData[2].course.title)}`;
      } else if (selectedCoursesData.length > 3 && selectedCoursesData.length === courses.length) {
        resolvedTitle = `${EXAM_LABELS[examType] || "NCLEX"} - All Domains`;
      } else if (selectedCoursesData.length > 3) {
        resolvedTitle = `${cleanDomain(selectedCoursesData[0].course.title)}, ${cleanDomain(selectedCoursesData[1].course.title)} & ${selectedCoursesData.length - 2} more domains`;
      } else {
        const cleanTitle = (title || "").replace(/\s+EXAM\s+BUILDER$/i, "").trim();
        resolvedTitle = cleanTitle || `${EXAM_LABELS[examType] || "NCLEX"} Custom Exam`;
      }
    }

    const params = new URLSearchParams({
      mode: selectedMode,
      layout,
      difficulty: difficultyFilter,
      status: statusFilter,
      subCategories: subIds,
      examType,
      customTitle: resolvedTitle,
    });

    if (isExamMode) {
      params.set("builderMode", "exams");
      params.set("examCount", String(Math.min(Math.max(1, examCount), Math.max(1, totalSelectedExams))));
    } else {
      params.set("builderMode", "questions");
      params.set("questionCount", String(Math.min(85, Math.max(5, questionCount))));
      if (firstId) {
        params.set("identifier", firstId);
      }
    }

    router.push(`/web/${livePanelSlug ?? panelSlug}/vista/exam/generic?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  const builderTitle =
    title ||
    (customCourses && customCourses.length === 1
      ? `${customCourses[0].title} EXAM BUILDER`
      : `${EXAM_LABELS[examType] || panelSlug?.toUpperCase() || "NCLEX"} EXAM BUILDER`);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 sm:px-3">
      <div className="w-full max-w-2xl rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] text-[var(--text-color)] shadow-2xl flex flex-col max-h-[92vh]">

        {/* ─── Header ─── */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[var(--text-color)]/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#2FD9C4]/15 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-[#2FD9C4]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-[var(--text-color)] truncate max-w-md">
                  {builderTitle}
                </h2>
                <p className="text-[10px] text-slate-600 dark:text-[var(--text-color)]/40 truncate">Select domains & exams · configure questions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-[var(--text-color)]/10 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-[var(--text-color)]/60" />
            </button>
          </div>
        </div>

        {/* ─── Greeting + Stats ─── */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[var(--text-color)]/10">
          <p className="text-xs text-slate-600 dark:text-[var(--text-color)]/50 mb-2">
            Hello, <span className="text-slate-900 dark:text-[var(--text-color)] font-semibold">{user?.userName?.trim() || "Guest"}</span> — Choose Your Practice Scope Below
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-[var(--text-color)]/5 border border-[#CBDCF8] dark:border-transparent text-[10px] font-bold text-slate-800 dark:text-[var(--text-color)]">
              {stats.totalDomains} Domains
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-[var(--text-color)]/5 border border-[#CBDCF8] dark:border-transparent text-[10px] font-bold text-slate-800 dark:text-[var(--text-color)]">
              {stats.totalExams} Exams
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-[var(--text-color)]/5 border border-[#CBDCF8] dark:border-transparent text-[10px] font-bold text-[#0891b2] dark:text-[#2FD9C4]">
              {stats.totalQuestions.toLocaleString()} Questions
            </span>
          </div>
        </div>

        {/* ─── Filter Tabs ─── */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-3 sm:gap-4 bg-slate-50/60 dark:bg-black/10">
          {/* Difficulty */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-white/60 mr-1">
              Difficulty
            </span>
            {(["All", "Easy", "Medium", "Hard"] as const).map((f) => {
              const active = difficultyFilter === f;
              let activeClass = "bg-[#0B1528] text-white border-[#0B1528]";
              if (f === "Easy") activeClass = "bg-[#16A34A] text-white border-[#16A34A]";
              if (f === "Medium") activeClass = "bg-[#D97706] text-white border-[#D97706]";
              if (f === "Hard") activeClass = "bg-[#DC2626] text-white border-[#DC2626]";

              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDifficultyFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                    active
                      ? `${activeClass} shadow-sm ring-1 ring-black/10`
                      : "bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 border border-slate-300 dark:border-white/15 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-5 bg-slate-300 dark:bg-white/10" />

          {/* Status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-white/60 mr-1">
              Status
            </span>
            {(["All", "Unused", "Used", "Bookmarked"] as const).map((f) => {
              const active = statusFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                    active
                      ? "bg-[#0B1528] text-white border-[#0B1528] shadow-sm ring-1 ring-black/10 dark:bg-[#1E293B] dark:border-white/20"
                      : "bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 border border-slate-300 dark:border-white/15 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Scrollable Domain List ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {visibleCourses.length === 0 ? null : (
            visibleCourses.map((course) => (
              <DomainRow
                key={course.id}
                course={course}
                selectedSubs={selectedSubs}
                onToggleSub={toggleSub}
                onToggleDomain={toggleDomain}
                defaultExpanded={courses.length <= 2}
                isExamMode={isExamMode}
                difficultyFilter={difficultyFilter}
                statusFilter={statusFilter}
              />
            ))
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)]">
          {/* Question / Exam Count Controls */}
          {isExamMode ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-700 dark:text-white/60 tracking-wide mb-1">
                  <span>Set Total Exams</span>
                  <span className="text-sm font-bold text-[#0891b2] dark:text-[#2FD9C4] normal-case">
                    {examCount} {examCount === 1 ? "Exam" : "Exams"}
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, totalSelectedExams)}
                  step={1}
                  value={Math.min(Math.max(1, examCount), Math.max(1, totalSelectedExams))}
                  onChange={(e) => {
                    setHasUserAdjustedCount(true);
                    setExamCount(Number(e.target.value));
                  }}
                  disabled={!hasSelection || totalSelectedExams <= 1}
                  className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-white/10 appearance-none cursor-pointer accent-[#2FD9C4]"
                />
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-white/40 mt-0.5 font-medium">
                  <span>Min 1</span>
                  <span>Max {Math.max(1, totalSelectedExams)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white/70">
                    Set Total Questions
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      max={85}
                      value={questionCount}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value, 10);
                        setHasUserAdjustedCount(true);
                        if (!isNaN(raw)) {
                          setQuestionCount(Math.min(85, Math.max(5, raw)));
                        }
                      }}
                      className="w-16 px-2 py-1 text-center font-bold text-sm bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-white/40 font-medium">
                    Min 5 · Max 85
                  </span>
                </div>

                {/* Middle Selection Indicator (e.g. "0 Domain(s) · 3 Exam(s) · 12 Q Pool") */}
                <div className="flex items-center justify-center">
                  {selectedExamsCount > 0 ? (
                    <span className="text-xs font-bold text-[#0891b2] dark:text-[#2FD9C4]">
                      {selectedDomainsCount} Domain(s) · {selectedExamsCount} Exam(s) · {selectedQs.toLocaleString()} Q Pool
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#10B981] dark:text-[#2FD9C4]">
                      No Selection
                    </span>
                  )}
                </div>

                {/* Mode & Layout Button */}
                <button
                  type="button"
                  onClick={() => setShowModeLayout(!showModeLayout)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-white transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Settings className="w-3.5 h-3.5 text-[#1877F2] dark:text-[#2FD9C4]" />
                  <span>Mode & Layout</span>
                </button>
              </div>

              <input
                type="range"
                min={5}
                max={85}
                step={1}
                value={Math.min(85, Math.max(5, questionCount))}
                onChange={(e) => {
                  setHasUserAdjustedCount(true);
                  setQuestionCount(Number(e.target.value));
                }}
                className="w-full h-2 rounded-full bg-slate-300 dark:bg-white/10 appearance-none cursor-pointer accent-[#1877F2] dark:accent-[#2FD9C4]"
              />

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-white/40 font-medium mt-1 mb-2">
                <span>Min 5</span>
                <span>Max 85</span>
              </div>
            </div>
          )}

          {/* Mode & Layout Panel */}
          {showModeLayout && (
            <div className="mb-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 space-y-3">
              <p className="text-[10px] font-bold text-slate-700 dark:text-white/60 uppercase tracking-wide">Set Preferred Mode & Layout</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-600 dark:text-white/50 mb-1.5 font-semibold">Select Mode</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAM_MODES.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                          selectedMode === mode
                            ? "bg-[#2FD9C4]/20 border-[#2FD9C4]/40 text-[#0f766e] dark:text-[#2FD9C4]"
                            : "border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 dark:text-white/50 mb-1.5 font-semibold">Select Layout</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LAYOUTS.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLayout(l)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                          layout === l
                            ? "bg-[#2FD9C4]/20 border-[#2FD9C4]/40 text-[#0f766e] dark:text-[#2FD9C4]"
                            : "border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
                        }`}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/15 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Selections</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={selectedExamsCount === 0 || selectedQs === 0}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#1877F2] to-[#2FD9C4] text-white hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Submit & Start Exam</span>
            </button>
          </div>

          {/* ─── Estimated Exam Duration ─── */}
          <p className="text-center text-xs italic text-slate-500 dark:text-white/40 mt-3 font-medium">
            Estimated Exam Duration : {formatEstimatedDuration(isExamMode ? examCount * 45 : (selectedQs > 0 ? Math.min(questionCount, selectedQs) : questionCount))}
          </p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export type NclexAction = "custom" | "practice" | "readiness";

export function NclexActionRow({
  examLabel,
  onAction,
}: {
  examLabel: string;
  onAction: (action: NclexAction) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
      {/* 1. Custom Test Card */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-2.5 sm:p-3 md:p-3.5 flex flex-col gap-2 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between gap-1.5">
          <div className="w-6 h-6 rounded-md bg-[#2FD9C4]/15 flex items-center justify-center shrink-0">
            <Edit3 className="w-3.5 h-3.5 text-[#00bda3] dark:text-[#2FD9C4]" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-[#00bda3] dark:text-[#2FD9C4] bg-[#2FD9C4]/15 border border-[#2FD9C4]/30">
            Personalized
          </span>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[var(--text-color)] truncate">
            Create Custom Test
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-[var(--text-color)]/50 truncate mt-0.5">
            Create a tailored test
          </p>
        </div>

        <button
          onClick={() => onAction("custom")}
          className="mt-auto w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-lg font-bold text-[11px] sm:text-xs bg-[#2FD9C4] text-[#08111F] hover:brightness-105 active:scale-[0.98] transition-all shadow-xs"
        >
          + Create Custom Test
        </button>
      </div>

      {/* 2. Practice Card */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-2.5 sm:p-3 md:p-3.5 flex flex-col gap-2 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between gap-1.5">
          <div className="w-6 h-6 rounded-md bg-[#8B5CF6]/15 flex items-center justify-center shrink-0">
            <GraduationCap className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-[#A855F7]" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-[#8B5CF6] dark:text-[#A855F7] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30">
            Practice
          </span>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[var(--text-color)] truncate">
            {examLabel} Practice
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-[var(--text-color)]/50 truncate mt-0.5">
            Jump into practice mode
          </p>
        </div>

        <button
          onClick={() => onAction("practice")}
          className="mt-auto w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-lg font-bold text-[11px] sm:text-xs bg-[#8B5CF6] text-white hover:brightness-105 active:scale-[0.98] transition-all shadow-xs"
        >
          Start Practice
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Readiness Assessment Test (RAT) */}
      <div className="col-span-2 md:col-span-1 rounded-xl sm:rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Mobile horizontal single-line strip */}
        <div className="flex md:hidden items-center justify-between gap-2 p-2 sm:p-2.5 px-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[#8B5CF6]/15 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-[#A855F7]" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-[var(--text-color)] truncate">
              {examLabel} — Readiness Assessment Test (RAT)
            </span>
          </div>
          <button
            onClick={() => onAction("readiness")}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white text-purple-700 dark:bg-white dark:text-purple-800 border border-purple-200 hover:brightness-105 active:scale-[0.98] transition-all shadow-xs"
          >
            Start Now
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop matching card */}
        <div className="hidden md:flex flex-col gap-2 p-3 md:p-3.5 h-full">
          <div className="flex items-start justify-between gap-1.5">
            <div className="w-6 h-6 rounded-md bg-[#F5B843]/15 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#F5B843]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-amber-700 dark:text-[#F5B843] bg-[#F5B843]/15 border border-[#F5B843]/30">
              Assessment
            </span>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[var(--text-color)] truncate">
              Readiness Assessment Test (RAT)
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-[var(--text-color)]/50 truncate mt-0.5">
              Measure your readiness and track progress
            </p>
          </div>

          <button
            onClick={() => onAction("readiness")}
            className="mt-auto w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-lg font-bold text-[11px] sm:text-xs bg-[#F5B843] text-[#08111F] hover:brightness-105 active:scale-[0.98] transition-all shadow-xs"
          >
            Start Now
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export type NclexCourseView = "subject" | "clientNeed";

export function NclexStudyByCourseBanner({
  title,
  view,
  onViewChange,
}: {
  title: string;
  view: NclexCourseView;
  onViewChange: (view: NclexCourseView) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-2 sm:p-2.5 md:p-3.5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="hidden sm:block">
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-[var(--text-color)]">{title}</h2>
          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-[var(--text-color)]/50 mt-0.5">
            Select a domain to create a focused custom test, or switch views.
          </p>
        </div>

        <div className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#0e1726] border border-white/10 p-1 shrink-0 shadow-2xs">
          <button
            onClick={() => onViewChange("subject")}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              view === "subject"
                ? "bg-[#3B82F6] text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <span>📖</span> Study Course / Subject
          </button>
          <button
            onClick={() => onViewChange("clientNeed")}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              view === "clientNeed"
                ? "bg-[#3B82F6] text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <span>👥</span> Client Need
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const DifficultyBar = ({ easy, medium, hard }: { easy: number; medium: number; hard: number }) => (
  <div>
    <div className="flex items-center justify-between text-[9px] sm:text-[10px] mb-1">
      <span className="font-bold text-slate-600 dark:text-[var(--text-color)]/50">Difficulty Spread</span>
      <div className="flex items-center gap-2 font-medium">
        <span className="text-emerald-700 dark:text-emerald-400">● Easy {easy}%</span>
        <span className="text-amber-700 dark:text-amber-400">● Med {medium}%</span>
        <span className="text-red-700 dark:text-red-400">● Hard {hard}%</span>
      </div>
    </div>
    <div className="flex h-1.5 sm:h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-[var(--text-color)]/10">
      <div style={{ width: `${easy}%`, backgroundColor: "#34D399" }} />
      <div style={{ width: `${medium}%`, backgroundColor: "#FBBF24" }} />
      <div style={{ width: `${hard}%`, backgroundColor: "#F87171" }} />
    </div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const CourseCard = ({
  course,
  onCreateCustomTest,
}: {
  course: DashboardCourse;
  onCreateCustomTest: (course?: DashboardCourse) => void;
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const left = Math.max(0, course.questionCount - course.doneCount);
  const completionPct =
    course.questionCount > 0
      ? Math.round((course.doneCount / course.questionCount) * 100)
      : 0;

  const standaloneCourseId =
    course.examType === "nclex-rn"
      ? "8ceb8bea-c04b-4a55-94ba-5d6368bdcaaa"
      : "3f25e1cf-dc97-4c77-a8be-1c2472dae993";

  const subjectId = course.backendSubjectGuid || course.guidId || String(course.id);
  const examsHref =
    course.category === "clientNeed"
      ? `/dashboards/${course.examType}?action=custom`
      : `/dashboards/${course.examType}/exams/standalone-questions-${course.examType}/${standaloneCourseId}/exams/${subjectId}?subjectName=${encodeURIComponent(
          course.title
        )}`;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-2.5 sm:p-3 md:p-3.5 flex flex-col gap-2 sm:gap-2.5 hover:border-blue-400 dark:hover:border-white/20 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onCreateCustomTest(course)}
          className="text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-[var(--text-color)] leading-snug truncate flex-1 min-w-0 hover:text-blue-600 dark:hover:text-[#2FD9C4] transition-colors cursor-pointer"
        >
          {course.title}
        </button>
        <button
          onClick={() => setBookmarked((b) => !b)}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark course"}
          className="shrink-0 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-[var(--text-color)]/10 transition-colors"
        >
          <Bookmark
            className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`}
            style={{ color: bookmarked ? ACCENT_GOLD : "rgba(100,116,139,0.5)" }}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-semibold">
        <span className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-[var(--text-color)]/5 border border-[#CBDCF8] dark:border-transparent text-[#0891b2] dark:text-[#2FD9C4]">
          {course.questionCount.toLocaleString()} Qs
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-[var(--text-color)]/5 border border-[#CBDCF8] dark:border-transparent text-[#ea580c] dark:text-[#FF9A80]">
          {course.examCount} Exams
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-[var(--text-color)]/5 border border-[#CBDCF8] dark:border-transparent text-slate-700 dark:text-[var(--text-color)]/60">
          {course.doneCount} Done
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-[var(--text-color)]/5 border border-[#CBDCF8] dark:border-transparent text-amber-700 dark:text-[#F5B843]">
          {left.toLocaleString()} Left
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1">
          <span className="font-semibold text-slate-600 dark:text-[var(--text-color)]/50">Completion</span>
          <span className="font-bold" style={{ color: ACCENT_TEAL }}>
            {completionPct}%
          </span>
        </div>
        <div className="h-1 sm:h-1.5 rounded-full bg-slate-200 dark:bg-[var(--text-color)]/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%`, backgroundColor: ACCENT_TEAL }}
          />
        </div>
      </div>

      <DifficultyBar easy={course.easyPct} medium={course.mediumPct} hard={course.hardPct} />

      <div className="mt-auto pt-1">
        <button
          type="button"
          onClick={() => onCreateCustomTest(course)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-[13px] bg-[#1877F2] hover:bg-[#166fe5] text-white hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-xs cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Create Custom Test</span>
        </button>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export function NclexCourseGrid({
  examType,
  view = "subject",
  onCreateCustomTest,
}: {
  examType: string;
  view?: NclexCourseView;
  onCreateCustomTest: (course?: DashboardCourse) => void;
}) {
  const { courses, status, error, reload } = useExamCourses(examType);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl sm:rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-2.5 sm:p-3 md:p-3.5 space-y-2 shadow-xs animate-pulse"
          >
            <div className="h-3.5 w-2/3 rounded bg-slate-300 dark:bg-[var(--text-color)]/10" />
            <div className="flex gap-1.5">
              <div className="h-4 w-12 rounded bg-slate-300 dark:bg-[var(--text-color)]/10" />
              <div className="h-4 w-12 rounded bg-slate-300 dark:bg-[var(--text-color)]/10" />
              <div className="h-4 w-12 rounded bg-slate-300 dark:bg-[var(--text-color)]/10" />
              <div className="h-4 w-12 rounded bg-slate-300 dark:bg-[var(--text-color)]/10" />
            </div>
            <div className="h-1 rounded-full bg-slate-300 dark:bg-[var(--text-color)]/10" />
            <div className="h-1.5 rounded-full bg-slate-300 dark:bg-[var(--text-color)]/10" />
            <div className="h-7 rounded-lg bg-slate-300 dark:bg-[var(--text-color)]/10" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-400/5 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          Couldn&rsquo;t load courses{error ? `: ${error}` : "."}
        </p>
        <button
          onClick={reload}
          className="mt-3 inline-flex px-5 py-2 rounded-xl font-bold text-xs bg-[#FF7A59]/20 text-[#FF7A59] border border-[#FF7A59]/40 hover:brightness-110 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const visibleCourses =
    view === "clientNeed"
      ? courses.filter((c) => c.category === "clientNeed")
      : courses.filter((c) => c.category !== "clientNeed");

  if (visibleCourses.length === 0) {
    return (
      <div className="rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] px-5 py-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-600 dark:text-[var(--text-color)]/50">
          {view === "clientNeed"
            ? "No Client Need categories available yet — check back soon."
            : "No courses available yet — check back soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
      {visibleCourses.map((course) => (
        <CourseCard
          key={`${course.examType}-${course.id}`}
          course={course}
          onCreateCustomTest={onCreateCustomTest}
        />
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export function NclexStudyByCourseSection({
  examType,
  title,
  onCreateCustomTest,
}: {
  examType: string;
  title: string;
  onCreateCustomTest: (course?: DashboardCourse) => void;
}) {
  const [view, setView] = useState<NclexCourseView>("subject");

  return (
    <div className="space-y-3 lg:space-y-4">
      <NclexStudyByCourseBanner title={title} view={view} onViewChange={setView} />
      <NclexCourseGrid examType={examType} view={view} onCreateCustomTest={onCreateCustomTest} />
    </div>
  );
}
