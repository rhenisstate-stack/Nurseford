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

// ─── Domain Row ──────────────────────────────────────────────────────────────────────────────

function DomainRow({
  course,
  selectedSubs,
  onToggleSub,
  onToggleDomain,
  defaultExpanded = false,
  isExamMode = false,
}: {
  course: DashboardCourse;
  selectedSubs: Set<string>;
  onToggleSub: (subId: string) => void;
  onToggleDomain: (subs: DashboardSubCategory[], courseId?: string) => void;
  defaultExpanded?: boolean;
  isExamMode?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const subCategories = course.subCategories || [];
  const hasSubs = subCategories.length > 0;

  const selectedCount = subCategories.filter((sc) => selectedSubs.has(sc.id)).length;
  const allSelected = hasSubs
    ? selectedCount === subCategories.length
    : selectedSubs.has(String(course.id)) || (course.guidId ? selectedSubs.has(course.guidId) : false);
  const someSelected = hasSubs ? selectedCount > 0 && !allSelected : false;

  const domainQs = hasSubs
    ? subCategories.reduce((s, sc) => s + sc.questionCount, 0)
    : course.questionCount;
  const domainExams = course.examCount ?? (hasSubs ? subCategories.length : 1);

  return (
    <div className="border border-[#CBDCF8] dark:border-white/10 rounded-xl overflow-hidden bg-white/70 dark:bg-black/20">
      {/* Domain Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-slate-100/90 dark:bg-white/5 cursor-pointer hover:bg-slate-200/90 dark:hover:bg-white/10 transition-colors"
        onClick={() => {
          if (hasSubs) setExpanded(!expanded);
        }}
      >
        {/* Domain Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDomain(subCategories, String(course.guidId || course.id));
          }}
          className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${
            allSelected
              ? "bg-[#2FD9C4] border-[#2FD9C4]"
              : someSelected
                ? "bg-[#2FD9C4]/40 border-[#2FD9C4]"
                : "border-slate-400 dark:border-white/30 hover:border-slate-600 dark:hover:border-white/50"
          }`}
        >
          {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-[#08111F]" />}
        </button>

        {/* Expand Arrow */}
        {hasSubs ? (
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
      {expanded && hasSubs && (
        <div className="border-t border-[#CBDCF8]/60 dark:border-white/5">
          {subCategories.map((sc) => {
            const isSelected = selectedSubs.has(sc.id);
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
                  Used {sc.usedCount} of {sc.questionCount}
                </span>

                {/* Question Count */}
                <span className="text-[10px] font-bold text-slate-700 dark:text-[var(--text-color)]/60 shrink-0">
                  {sc.questionCount}
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
  const { courses: rawCourses } = useExamCourses(examType);
  const courses = useMemo(() => {
    if (customCourses && customCourses.length > 0) {
      return customCourses;
    }
    return rawCourses.filter(
      (c) => !/^(?:ATI|HESI)\s*Exit\s*Exams/i.test(c.title.trim())
    );
  }, [customCourses, rawCourses]);
  const { user } = useCurrentSystemUser();

  const isExamMode =
    builderMode === "exams" ||
    (builderMode !== "questions" && courses.length > 0 && courses.every((c) => !c.subCategories || c.subCategories.length === 0));

  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(25);
  const [examCount, setExamCount] = useState(3);
  const [hasUserAdjustedCount, setHasUserAdjustedCount] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [selectedMode, setSelectedMode] = useState<string>("Practice");
  const [layout, setLayout] = useState<ExamLayout>("generic");
  const [showModeLayout, setShowModeLayout] = useState(false);

  // ─── Stats ────────────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalDomains = 0;
    let totalExams = 0;
    let totalQuestions = 0;
    for (const c of courses) {
      totalDomains += 1;
      totalExams += c.examCount || (c.subCategories.length > 0 ? c.subCategories.length : 1);
      if (c.subCategories.length > 0) {
        totalQuestions += c.subCategories.reduce((s, sc) => s + sc.questionCount, 0);
      } else {
        totalQuestions += c.questionCount || 45;
      }
    }
    return { totalDomains, totalExams, totalQuestions };
  }, [courses]);

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
    setQuestionCount(25);
    setExamCount(3);
    setDifficultyFilter("All");
    setStatusFilter("All");
  };

  const selectedQs = useMemo(() => {
    let total = 0;
    for (const c of courses) {
      if (c.subCategories.length > 0) {
        for (const sc of c.subCategories) {
          if (selectedSubs.has(sc.id)) total += sc.questionCount;
        }
      } else {
        if (selectedSubs.has(String(c.id)) || (c.guidId && selectedSubs.has(c.guidId))) {
          total += c.questionCount || 45;
        }
      }
    }
    return total;
  }, [courses, selectedSubs]);

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
        setQuestionCount((prev) => (hasUserAdjustedCount ? Math.min(Math.max(1, prev), selectedQs) : selectedQs));
      }
    }
  }, [isExamMode, totalSelectedExams, selectedQs, hasUserAdjustedCount]);

  const hasSelection = selectedSubs.size > 0;

  // ─── Start ────────────────────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (!hasSelection) return;
    const subIds = Array.from(selectedSubs).join(",");
    const firstId = Array.from(selectedSubs)[0];

    // Compute friendly title
    let resolvedTitle = "";
    if (isExamMode) {
      const chosenTitles: string[] = [];
      for (const c of courses) {
        if (selectedSubs.has(String(c.id)) || (c.guidId && selectedSubs.has(c.guidId))) {
          chosenTitles.push(c.title);
        }
      }
      if (chosenTitles.length > 0 && chosenTitles.length <= 3) {
        resolvedTitle = `Custom Exam: ${chosenTitles.join(" & ")}`;
      } else {
        const cleanTitle = (title || "").replace(/\s+EXAM\s+BUILDER$/i, "").trim();
        resolvedTitle = cleanTitle ? `${cleanTitle} - Custom Exam` : "Custom Exam";
      }
    } else {
      const chosenTitles: string[] = [];
      for (const c of courses) {
        for (const sc of c.subCategories) {
          if (selectedSubs.has(sc.id)) {
            chosenTitles.push(sc.title);
          }
        }
      }
      if (chosenTitles.length > 0 && chosenTitles.length <= 3) {
        resolvedTitle = `Custom Exam: ${chosenTitles.join(" & ")}`;
      } else {
        const cleanTitle = (title || "").replace(/\s+EXAM\s+BUILDER$/i, "").trim();
        resolvedTitle = cleanTitle ? `${cleanTitle} - Custom Exam` : "Custom Exam";
      }
    }

    const params = new URLSearchParams({
      mode: selectedMode,
      layout,
      difficulty: difficultyFilter,
      subCategories: subIds,
      examType,
      customTitle: resolvedTitle,
    });

    if (isExamMode) {
      params.set("builderMode", "exams");
      params.set("examCount", String(Math.min(Math.max(1, examCount), Math.max(1, totalSelectedExams))));
    } else {
      params.set("builderMode", "questions");
      params.set("questionCount", String(Math.min(Math.max(1, questionCount), Math.max(1, selectedQs || 100))));
      if (firstId) {
        params.set("identifier", firstId);
      }
    }

    router.push(`/web/${livePanelSlug ?? panelSlug}/vista/exam/generic?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  const builderTitle = title || `${EXAM_LABELS[examType] || panelSlug?.toUpperCase() || "EXAM"} EXAM BUILDER`;

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
        <div className="px-4 py-2 border-b border-slate-200 dark:border-[var(--text-color)]/10 flex flex-wrap items-center gap-2">
          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-600 dark:text-[var(--text-color)]/40 mr-1">Difficulty</span>
            {(["All", "Easy", "Medium", "Hard"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDifficultyFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  difficultyFilter === f
                    ? "bg-[#2FD9C4]/20 text-[#0f766e] dark:text-[#2FD9C4] border border-[#2FD9C4]/40"
                    : "text-slate-600 dark:text-[var(--text-color)]/40 hover:text-slate-900 dark:hover:text-[var(--text-color)]/60 border border-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-300 dark:bg-[var(--text-color)]/10" />

          {/* Status */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-600 dark:text-[var(--text-color)]/40 mr-1">Status</span>
            {(["All", "Unused", "Used", "Bookmarked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  statusFilter === f
                    ? "bg-[#2FD9C4]/20 text-[#0f766e] dark:text-[#2FD9C4] border border-[#2FD9C4]/40"
                    : "text-slate-600 dark:text-[var(--text-color)]/40 hover:text-slate-900 dark:hover:text-[var(--text-color)]/60 border border-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Scrollable Domain List ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 dark:text-[var(--text-color)]/40">No courses available yet.</p>
            </div>
          ) : (
            courses.map((course) => (
              <DomainRow
                key={course.id}
                course={course}
                selectedSubs={selectedSubs}
                onToggleSub={toggleSub}
                onToggleDomain={toggleDomain}
                defaultExpanded={courses.length <= 2}
                isExamMode={isExamMode}
              />
            ))
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)]">
          {/* Question / Exam Count Slider */}
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
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-700 dark:text-white/60 tracking-wide mb-1">
                  <span>Set Total Questions</span>
                  <span className="text-sm font-bold text-[#0891b2] dark:text-[#2FD9C4] normal-case">
                    {questionCount} {questionCount === 1 ? "Question" : "Questions"}
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, selectedQs || 100)}
                  step={1}
                  value={Math.min(Math.max(1, questionCount), Math.max(1, selectedQs || 100))}
                  onChange={(e) => {
                    setHasUserAdjustedCount(true);
                    setQuestionCount(Number(e.target.value));
                  }}
                  disabled={!hasSelection || selectedQs <= 1}
                  className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-white/10 appearance-none cursor-pointer accent-[#2FD9C4]"
                />
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-white/40 mt-0.5 font-medium">
                  <span>Min 1</span>
                  <span>Max {Math.max(1, selectedQs || 100)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Summary + Mode & Layout Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {hasSelection && (
                <span className="text-[10px] text-slate-600 dark:text-white/50">
                  <span className="text-[#0891b2] dark:text-[#2FD9C4] font-bold">{selectedSubs.size}</span>{" "}
                  {isExamMode
                    ? (selectedSubs.size === 1 ? "subject" : "subjects")
                    : (selectedSubs.size === 1 ? "item" : "items")}{" "}
                  selected
                  {" · "}
                  <span className="text-slate-800 dark:text-white/80 font-semibold">
                    {isExamMode
                      ? `${totalSelectedExams} ${totalSelectedExams === 1 ? "Exam" : "Exams"} available`
                      : `${selectedQs.toLocaleString()} Qs available`}
                  </span>
                </span>
              )}
            </div>
            <button
              onClick={() => setShowModeLayout(!showModeLayout)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all"
            >
              <Settings className="w-3 h-3 text-[#0891b2] dark:text-[#2FD9C4]" />
              Mode & Layout
            </button>
          </div>

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
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={!hasSelection}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#2FD9C4] to-[#2FD9C4]/80 text-[#08111F] hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit & Start Exam
            </button>
          </div>
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
  onCreateCustomTest: () => void;
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
        <Link
          href={examsHref}
          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[var(--text-color)] leading-snug truncate flex-1 min-w-0 hover:text-blue-600 dark:hover:text-[#2FD9C4] transition-colors"
        >
          {course.title}
        </Link>
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

      <div className="mt-auto flex items-center gap-2">
        <Link
          href={examsHref}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-lg font-bold text-[11px] sm:text-xs bg-[#1877F2] text-white hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-xs text-center"
        >
          <Play className="w-3 h-3 fill-current" />
          Access Exams
        </Link>
        <button
          onClick={onCreateCustomTest}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-lg font-bold text-[11px] sm:text-xs bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-xs"
        >
          Custom Test
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
  onCreateCustomTest: () => void;
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
  onCreateCustomTest: () => void;
}) {
  const [view, setView] = useState<NclexCourseView>("subject");

  return (
    <div className="space-y-3 lg:space-y-4">
      <NclexStudyByCourseBanner title={title} view={view} onViewChange={setView} />
      <NclexCourseGrid examType={examType} view={view} onCreateCustomTest={onCreateCustomTest} />
    </div>
  );
}
