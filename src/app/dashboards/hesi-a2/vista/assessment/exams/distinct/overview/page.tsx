"use client";

import { useState, useEffect } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import SearchBar from "@/lib/utils/data/SearchBar";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_TITLE } from "@/lib/config/config";
import Link from "next/link";
import { LayoutList, ChevronLeft, ChevronRight, Check, SlidersHorizontal, ArrowDownUp } from "lucide-react";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { useMemo } from "react";   // For Random Quote Memoization
import { FiX } from "react-icons/fi";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export type LearningStrata =
  | "program"
  | "course"
  | "subject"
  | "unit"
  | "lesson"
  | "topic"
  | "concept"
  | "fact";

const VISTA_STRATA_PANEL = "hesi-a2";
const VISTA_STRATA_LEVEL = "Exams";
const VISTA_STRATA_NAME = "Exam";
const VISTA_STRATA_GROUP = "assessment";
const VISTA_CHILD_LEVEL = "Exam";  // For Live Child Redirection
const VISTA_DEFAULT_PERPAGE_LIST = 12;
const VISTA_STRATA = VISTA_STRATA_LEVEL.toLocaleLowerCase();
const VISTA_CHILD_STRATA = VISTA_CHILD_LEVEL.toLocaleLowerCase();
const BASE_CHILD_ROUTE = `/web/${VISTA_STRATA_PANEL}/vista/${VISTA_CHILD_STRATA}`;
const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_STRATA}`;


// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main Component
export default function StrataExamsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  const [perPage, setPerPage] = useState(VISTA_DEFAULT_PERPAGE_LIST); // Default Per PAge
  const [currentPage, setCurrentPage] = useState(1);

  type SortDirection = "asc" | "desc";

  const [sortColumn, setSortColumn] = useState<keyof StrataItem | null>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [showLearningBar, setShowLearningBar] = useState(false);
  const [showSortBar, setShowSortBar] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Router for Edit Redirection
  const router = useRouter();

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Extract Parent ParentIdentifier from URL Search Params
  const searchParams = useSearchParams();
  const examStrataIdentifier = searchParams.get("identifier");
  const safeExamStrataIdentifier = examStrataIdentifier ?? "";
  const isMissingExamStrataIdentifier = !examStrataIdentifier;

  // Sort / Filter Exams based on Learning — initialized synchronously from the URL
  // so the very first fetch already carries the correct level (no stale first request)
  const [dynamicLearningStrataName, setDynamicLearningStrataName] = useState<
    "program" | "course" | "subject" | "unit" | "lesson" | "topic" | "concept" | "fact" | null
  >(() => {
    const initialLevel = searchParams.get("level") as
      | "program" | "course" | "subject" | "unit" | "lesson" | "topic" | "concept" | "fact"
      | null;
    return initialLevel ?? null;
  });
  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  type ExamLayout = "generic" | "glacial" | "pulse" | "cascade" | "classic" | "atlas" | "orbit" | "zen";
  const [layout, setLayout] = useState<ExamLayout>("generic");
  const layouts: ExamLayout[] = ["generic", "glacial", "pulse", "cascade", "classic", "atlas", "orbit", "zen"];
  const formatLayoutName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  const layoutTooltips: Record<ExamLayout, string> = {
    generic: "Default balanced exam layout",
    glacial: "Focused, minimal distraction mode",
    pulse: "Dynamic rhythm-based layout",
    cascade: "Flowing sequential layout",
    classic: "Traditional structured exam layout",
    atlas: "Wide navigational layout",
    orbit: "Circular progress layout",
    zen: "Minimal distraction-free layout",
  };

  const urlLayout = searchParams.get("layout") as ExamLayout | null;

  useEffect(() => {
    if (urlLayout) {
      setLayout(urlLayout);
    }
  }, [urlLayout]);

  const [selectedExam, setSelectedExam] = useState<StrataItem | null>(null);
  const [showModePopup, setShowModePopup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const examModes = [
    "Practice",
    "Exam",
    "Tutor",
    "Test",
    "Review",
    "Adaptive",
  ];

  const examModeDescriptions: Record<string, string> = {
    Practice: "Low-pressure mode to build familiarity — no time limit, answers explained as you go.",
    Exam: "Full simulation of real exam conditions — timed, no hints, one continuous attempt.",
    Tutor: "Step-by-step guidance with explanations shown immediately after each question.",
    Test: "Timed assessment without explanations — mirrors formal testing conditions.",
    Review: "Revisit previously answered questions with full explanations and correct answers.",
    Adaptive: "Difficulty adjusts in real time based on your performance as you answer.",
  };

  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Pull Data From the Hook !
  const {
    filteredExams,
    skewTotal,
    skewTotalPages,
    examSearch,
    setExamSearch,
  } = useNominalStrataExams({
    parentIdentifier: safeExamStrataIdentifier, // REQUIRED EXAM STRATA IDENTIFIER
    page: currentPage,
    perPage,
    sortColumn,
    sortDirection,
    dynamicLearningStrataName, //Learning Strata Level
  });

  // Pagination Logic based on Backend 
  const totalPages = skewTotalPages;

  const parentAssessmentName = filteredExams[0]?.assessmentName ?? "";
  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Random Quote Selection (Memoized for Performance)
  const randomQuote = useMemo(() => {
    return VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Sorting Helper Function
  const handleSort = (column: keyof StrataItem) => {
    let newDirection: SortDirection = "asc";

    if (sortColumn === column) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
    } else {
      setSortColumn(column);
      setSortDirection("asc");
      newDirection = "asc";
    }

    setSortColumn(column);
    setCurrentPage(1);

    // 🔥 SUCCESS TOAST MESSAGE
    showToast(
      `Successfully Sorted By "${String(column)}" In ${newDirection === "asc" ? "Ascending ▲" : "Descending ▼"
      } Order.`,
      "success"
    );
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Card Click → Redirect to Overview
  const handleCardClick = (row: StrataItem) => {
    setSelectedExam(row);
    setShowModePopup(true);
    setShowAdvanced(false);
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Mode Slection Handler
  const handleModeSelection = (mode: string) => {
    if (!selectedExam) return;

    const identifier = selectedExam.guidId ?? selectedExam.id;

    router.push(
      `${BASE_CHILD_ROUTE}/${layout}?mode=${encodeURIComponent(mode)}&identifier=${identifier}`
    );

    setShowModePopup(false);
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Table Helper Function to Trancate Text Values
  const funcTruncateHelper = (text: string | undefined, max = 20) => {
    if (!text) return "—";
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Table Pagination Helper For Many skewTotalPages  
  const getVisiblePages = (
    current: number,
    total: number,
    windowSize = 2
  ) => {
    const pages: (number | "ellipsis")[] = [];

    const start = Math.max(2, current - windowSize);
    const end = Math.min(total - 1, current + windowSize);

    // Always show first page
    pages.push(1);

    // Left ellipsis
    if (start > 2) {
      pages.push("ellipsis");
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (end < total - 1) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Toast State
  type ToastType = "success" | "error" | "info";

  interface Toast {
    id: number;
    message: string;
    type: ToastType;
  }

  const [toasts, setToasts] = useState<Toast[]>([]); // for timed toasts
  const [staticToasts, setStaticToasts] = useState<Toast[]>([]); // for persistent toasts

  // Show toast (both timed and static)
  const showToast = (
    message: string,
    type: ToastType = "success",
    duration = 3000
  ) => {
    const id = Date.now();

    const updatedToast: Toast = { id, message, type };

    setToasts([updatedToast]);
    setStaticToasts([updatedToast]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return () => clearTimeout(timeout);
  };

  const removeStaticToast = (id: number) => {
    setStaticToasts((prev) => prev.filter((toast) => toast.id !== id));
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Render 
  return (
    <main
      className="pt-16 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-1 space-y-1 w-full">
        {/* Header */}
        <div className="relative border border-[var(--text-color)] rounded-2xl bg-[var(--content-bg)] text-[var(--text-color)] px-4 py-0">
          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold">
              {APP_TITLE} : {parentAssessmentName ? `${parentAssessmentName} ; ` : ""}{VISTA_STRATA_LEVEL}
            </h1>
            <p className="text-sm opacity-70">
              Absolute Registry of All {VISTA_STRATA_NAME} Strata Across the {APP_TITLE}.
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Timed Toast Container - Top Center */}
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
            {toasts.map((toastType) => (
              <div
                key={toastType.id}
                className={`
                  px-5 py-2 rounded-xl shadow-2xl text-black font-semibold
                  transition-all duration-300 flex items-center justify-between gap-3
                  bg-gradient-to-r ${toastType.type === "success" ? "from-green-300 via-pink-300 to-indigo-300 " : ""
                  } ${toastType.type === "error" ? "from-red-500 to-red-700" : ""} ${toastType.type === "info" ? "from-blue-500 to-blue-700" : ""
                  }
                `}
              >
                <span>{toastType.message}</span>
                <button
                  onClick={() => removeStaticToast(toastType.id)}
                  className="ml-3 px-2 py-1 text-sm font-bold bg-yellow-300 border border-cyan-500 text-black rounded-lg hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Static Toast Container - Bottom Center */}
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
            {staticToasts.map((toastType) => (
              <div
                key={toastType.id}
                className={`
                  px-5 py-2 rounded-xl shadow-2xl text-black font-semibold
                  transition-all duration-300 flex items-center justify-between gap-3
                  bg-gradient-to-r ${toastType.type === "success" ? "from-green-300 via-pink-300 to-indigo-300 " : ""
                  } ${toastType.type === "error" ? "from-red-500 to-red-700" : ""} ${toastType.type === "info" ? "from-blue-500 to-blue-700" : ""
                  }
                `}
              >
                <span>{toastType.message}</span>
                <button
                  onClick={() => removeStaticToast(toastType.id)}
                  className="ml-3 px-2 py-1 text-sm font-bold bg-yellow-300 border border-cyan-500 text-black rounded-lg hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Layout + Filter Toggle Actions */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLearningBar((prev) => !prev)}
              className="
                flex items-center gap-2
                px-4 py-2
                text-sm
                font-bold
                border border-[var(--text-color)] rounded-lg
                text-[var(--text-color)]
                hover:bg-gradient-to-r
                hover:from-purple-500
                hover:via-pink-500
                hover:to-red-500
                hover:text-white
                transition-all duration-200
              "
            >
              <SlidersHorizontal className="w-4 h-4" />
              Learning Level
            </button>

            <button
              type="button"
              onClick={() => setShowSortBar((prev) => !prev)}
              className="
                flex items-center gap-2
                px-4 py-2
                text-sm
                font-bold
                border border-[var(--text-color)] rounded-lg
                text-[var(--text-color)]
                hover:bg-gradient-to-r
                hover:from-purple-500
                hover:via-pink-500
                hover:to-red-500
                hover:text-white
                transition-all duration-200
              "
            >
              <ArrowDownUp className="w-4 h-4" />
              Sort
            </button>

            <Link
              href={{
                pathname: `${BASE_TOGGLE_ROUTE}/distinct/outline`,
                query: examStrataIdentifier
                  ? { identifier: examStrataIdentifier }
                  : {},
              }}
              className="
                flex items-center gap-2
                px-4 py-2
                text-sm
                font-bold
                border border-[var(--text-color)] rounded-lg
                text-[var(--text-color)]
                hover:bg-gradient-to-r
                hover:from-purple-500
                hover:via-pink-500
                hover:to-red-500
                hover:text-white
                transition-all duration-200
              "
            >
              <LayoutList className="w-4 h-4" />
              List
            </Link>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PerPageSelect
              value={perPage}
              onChange={(v) => {
                setPerPage(v);
                setCurrentPage(1);
              }}
            />
            <span className="text-xs font-bold text-[var(--text-color)]">
              Showing : <strong>{filteredExams.length}</strong>
              {" "}of <strong>{skewTotal}</strong>
            </span>
          </div>

          <SearchBar
            value={examSearch}
            onChange={(v) => {
              setExamSearch(v);
              setCurrentPage(1);
            }}
            placeholder={`Type & Search ${VISTA_STRATA_LEVEL} . . . 🏌️‍♂️`}
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Cards Grid */}
        <div className="w-full">
          {filteredExams.length === 0 && (
            <div className="w-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent rounded-xl border bg-[var(--content-bg)] text-[var(--text-color)]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="px-4 py-10 text-center opacity-70">
                No {VISTA_STRATA_LEVEL} Found ⚓
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* 🔹 Dynamic Learning Strata Row */}
          {showLearningBar && (
            <div className="mb-3 rounded-2xl border bg-[var(--content-bg)] text-[var(--text-color)] px-4 py-3 flex items-center gap-3">

              {/* Left Label */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs uppercase font-bold tracking-wide">
                  Learning Level
                </span>

                {dynamicLearningStrataName ? (
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-400">
                    {dynamicLearningStrataName.toUpperCase()}
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full text-xs bg-gray-300 text-gray-700">
                    None
                  </div>
                )}
              </div>

              {/* Center Buttons */}
              <div className="flex-1 overflow-x-auto px-4">
                <div className="flex gap-2">

                  {(
                    [
                      "program",
                      "course",
                      "subject",
                      "unit",
                      "lesson",
                      "topic",
                      "concept",
                      "fact",
                    ] as const
                  ).map((level) => {
                    const isActive = dynamicLearningStrataName === level;

                    return (
                      <button
                        key={level}
                        onClick={() => {
                          setDynamicLearningStrataName(level); //  properly typed
                          setCurrentPage(1);

                          showToast(
                            `Learning Strata Set To "${level.toUpperCase()}"`,
                            "success"
                          );
                        }}
                        className={`
                          px-4 py-1.5 text-xs rounded-full border transition-all
                          ${isActive
                            ? "bg-[var(--text-color)] text-[var(--content-bg)] shadow-md"
                            : "hover:bg-[var(--text-color)] hover:text-[var(--content-bg)]"
                          }
                      `}
                      >
                        {level}
                      </button>
                    );
                  })}

                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

              {/* Right Clear */}
              {dynamicLearningStrataName && (
                <button
                  onClick={() => {
                    setDynamicLearningStrataName(null);
                    setCurrentPage(1);
                    showToast("Learning Strata Cleared ⚓");
                  }}
                  className="ml-3 px-4 py-1.5 text-xs rounded-full bg-gradient-to-r from-gray-500 to-gray-700 text-white"
                >
                  Clear ✕
                </button>
              )}
            </div>
          )}

          {/* Sorting Row – Modern Fixed Ends with Scrollable Buttons */}
          {showSortBar && (
            <div className="mb-4 rounded-2xl border bg-[var(--content-bg)] text-[var(--text-color)] backdrop-blur-xl shadow-sm px-4 py-3 flex items-center gap-3">

              {/* Left: Sorted By (fixed) */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs uppercase font-bold tracking-wide">Sorted By</span>
                {sortColumn ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-300 via-pink-500 to-cyan-300 text-[var(--text-color)] text-xs font-semibold shadow-md">
                    {String(sortColumn).toUpperCase()}
                    <span className="text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-semibold">
                    None
                  </div>
                )}
              </div>

              {/* Center: Scrollable Sort Buttons */}
              <div className="flex-1 overflow-x-auto dynamic-vista-sort-scroll px-4">
                <div className="flex gap-3">
                  {[
                    { key: "name", label: "Name" },
                    { key: "description", label: "Description" },
                    { key: "isFeatured", label: "Featured" },
                    { key: "year", label: "Year" },
                    { key: "difficulty", label: "Difficulty" },
                    { key: "season", label: "Season" },
                    { key: "type", label: "Type" },
                    { key: "status", label: "Status" },
                    { key: "code", label: "Code" },
                    { key: "target", label: "Target" },
                    { key: "segment", label: "Segment" },
                    { key: "fragment", label: "Fragment" },
                    { key: "level", label: "Level" },
                    { key: "order", label: "Order" },
                    { key: "module", label: "Module" },
                    { key: "link", label: "Link" },
                    { key: "ratings", label: "Ratings" },
                    { key: "version", label: "Version" },
                    { key: "tag", label: "Tag" },
                    { key: "resources", label: "Resources" },
                    { key: "prerequisites", label: "Prerequisites" },
                    { key: "objectives", label: "Objectives" },
                    { key: "language", label: "Language" },
                    { key: "createdAt", label: "Created" },
                    { key: "updatedAt", label: "Updated" },
                    { key: "sectionsCount", label: "Sections" },
                    { key: "id", label: "ID" },
                    { key: "guidId", label: "GuidID" }
                  ].map((col) => {
                    const isActive = sortColumn === col.key;

                    return (
                      <button
                        key={col.key}
                        onClick={() => handleSort(col.key as keyof StrataItem)}
                        className={`
                        shrink-0
                        px-4 py-1.5
                        text-xs font-medium
                        rounded-full
                        border
                        transition-all duration-200
                        backdrop-blur-md
                        ${isActive
                            ? "bg-[var(--text-color)] text-[var(--content-bg)] border-[var(--text-color)] shadow-lg"
                            : "hover:text-[var(--content-bg)] hover:bg-[var(--text-color)]"
                          }
                     `}
                      >
                        {col.label}
                        {isActive && (
                          <span className="ml-1 text-[10px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Clear Button (fixed) */}
              {sortColumn && (
                <button
                  onClick={() => {
                    setSortColumn(null);
                    setSortDirection("asc");
                    setCurrentPage(1);

                    showToast("Sorting Has Been Reset Successfully 🏌️‍♀️");
                  }}

                  className="
                shrink-0 ml-4
                px-4 py-1.5
                text-xs font-semibold
                rounded-full
                bg-gradient-to-r from-gray-500 via-fuchsia-700 to-gray-700
                text-white
                hover:scale-105
                transition-all duration-200
              "
                >
                  Clear ✕
                </button>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Crads Grid Display Layout */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            {filteredExams.map((strataName) => {

              return (
                <div
                  key={strataName.id}
                  onClick={() => handleCardClick(strataName)}
                  className="rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: "#e2edff" }}
                >
                <div
                    className="relative px-3 pt-1"
                    style={{ borderTop: "1px solid #9b8d8d", borderLeft: "1px solid #9b8d8d", borderRight: "1px solid #9b8d8d", borderRadius: "8px" }}
                  >
                    {/* Top Row — Featured, Status, Activity all on one line */}
                    <div className="flex items-center justify-between min-h-[10px] gap-1.5">

                      {/* Featured */}
                      <div className="min-w-[90px] flex items-center">
                        {strataName.isFeatured && (
                          <span className="inline-flex items-center text-xs font-bold px-2 py-0 rounded-full bg-yellow-500 text-black shadow-md">
                            ★ FEATURED
                          </span>
                        )}
                      </div>

                      {/* Session Status Badge */}
                      <div className="flex-1 flex justify-center">
                        {strataName.examActions && strataName.examActions.length > 0 && (() => {
                          const s = strataName.examActions[0].status ?? "";
                          if (s === "InProgress") return null;
                          const statusColors: Record<string, string> = {
                            Completed: "bg-green-800 text-white",
                            Cancelled: "bg-red-800 text-white",
                            Paused: "bg-yellow-800 text-black",
                            Resumed: "bg-cyan-800 text-white",
                            Suspended: "bg-orange-800 text-white",
                            Archived: "bg-gray-800 text-white",
                            Pending: "bg-purple-400 text-white",
                            Scheduled: "bg-indigo-800 text-white",
                            UnderReview: "bg-pink-800 text-white",
                            Destroyed: "bg-black text-white",
                          };
                          return (
                            <span
                              className={`inline-flex items-center justify-center min-w-[110px] px-2 py-0.5 rounded-full text-[10px] font-bold shadow text-center ${statusColors[s] ?? "bg-gray-400 text-white"
                                }`}
                            >
                              {s}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Activity */}
                      <div className="flex items-center gap-1.5 min-w-[40px] justify-end">
                        {strataName.examActions?.length ? (
                          <>
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                            </span>

                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60 [animation-delay:0.3s]" />
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
                            </span>
                          </>
                        ) : null}
                      </div>

                    </div>
                    {/* Header */}
                    <div
                      className="my-1 text-center"
                      title={`${strataName.title ?? ""}${strataName.description ? "\n" + strataName.description : ""}`}
                    >
                      <h3 className="text-lg font-bold text-gray-800 truncate leading-tight">
                        {funcTruncateHelper(strataName.title, 50)}
                      </h3>
                      <div className="text-[12px] text-gray-600 opacity-70 truncate">
                        {funcTruncateHelper(strataName.description, 100)}
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="my-1 h-px w-full bg-gray-400/40" />

                    {/* Body */}
                    <div className="text-[11px] mt-1 text-gray-800">
                      <div className="grid grid-cols-2 gap-x-1">

                        {/* Left Column */}
                        <div className="space-y-0.5 pr-1 border-r border-gray-400/30">

                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">Season</span>
                            <span className="font-medium">{strataName.season ?? "—"}</span>
                          </div>
                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">Duration</span>
                            <span className="font-medium">{strataName.duration ?? "—"} min</span>
                          </div>
                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">Sections</span>
                            <span className="font-medium">{strataName.sectionsCount ?? 0}</span>
                          </div>
                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">Qestions ?</span>
                            <span className="font-medium">{strataName.questionsCount ?? 0}</span>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-0.5 pl-1">
                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">Status</span>
                            <span className="truncate font-medium">{strataName.status ?? "—"}</span>
                          </div>
                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">PassMark</span>
                            <span className="font-medium">{strataName.passMark ?? "—"} / {strataName.totalMarks ?? "—"}</span>
                          </div>
                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">Year</span>
                            <span className="font-medium">{strataName.year ?? "—"}</span>
                          </div>
                          <div className="flex justify-between gap-1">
                            <span className="opacity-50">Difficulty</span>
                            <span className="font-medium">{strataName.difficulty ?? "—"}</span>
                          </div>

                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Attempts / Pending — small text strip above the button */}
                  <div className="px-3 pt-1 pb-1 text-center" style={{ borderLeft: "1px solid #9b8d8d", borderRight: "1px solid #9b8d8d" }}>
                    {strataName.examActions && strataName.examActions.length > 0 ? (() => {
                      const action = strataName.examActions[0];
                      const attemptsAllowed = strataName.attemptsAllowed ?? 1;
                      const attemptsUsed = action.attemptCount ?? 0;
                      return (
                        <span className="text-[10px] font-medium text-gray-600">
                          Used <strong>{attemptsUsed}</strong> of <strong>{attemptsAllowed}</strong> Attempts
                          {action.residualDuration != null && (
                            <> ; Pending <strong>{Math.round(action.residualDuration)}</strong> Minutes</>
                          )}
                        </span>
                      );
                    })() : (
                      <span className="text-[10px] font-medium text-gray-600">
                        Used 0 of {strataName.attemptsAllowed ?? 1} Attempts
                      </span>
                    )}
                  </div>

                  {/* Start Exam button — same size/style as subjects card footer button */}
                  <div className="flex justify-center" style={{ borderRadius: "8px", border: "1px solid #9b8d8d" }}>
                    <button
                      type="button"
                      onClick={() => handleCardClick(strataName)}
                      className="w-full py-2 text-sm font-semibold rounded"
                      style={{ border: "1px solid #0d6efd", color: "#0d6efd", margin: "6px" }}
                    >
                      Start Exam
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Bottom Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[var(--text-color)]">
          <div className="flex items-center gap-3">
            <PerPageSelect
              value={perPage}
              onChange={(v) => {
                setPerPage(v);
                setCurrentPage(1);
              }}
            />
            <span className="text-xs font-bold text-[var(--text-color)]">
              Showing : <strong>{filteredExams.length}</strong>
              {" "}of <strong>{skewTotal}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 bg-[var(--content-bg)] text-[var(--text-color)]"
            >
              Prior
            </button>

            {getVisiblePages(currentPage, totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-sm opacity-60 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-2 rounded-md border text-sm ${p === currentPage
                    ? "bg-blue-400 border-red-500 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 bg-[var(--content-bg)] text-[var(--text-color)]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

      {isMissingExamStrataIdentifier && (
        <div className="
                max-w-xl mx-auto
                rounded-2xl
                border
                shadow-2xl
                backdrop-blur-xl
                px-8 py-10
                text-center
                text-[var(--text-color)]
                bg-gradient-to-r
                from-blue-300
                via-yellow-700
                to-indigo-300
              ">
          <div className="text-3xl font-bold mb-3">
            Missing Parent Identifier ⚓
          </div>

          <p className="opacity-70 text-sm mb-6 text-[var(--text-color)]">
            This Exams view Requires a Valid Parent Reference
            Kindly Navigate Using a Valid Strata Source or Return To The Parent Strata Overview To Select A Exam Strata To Explore.
          </p>

          <Link
            href={`${BASE_TOGGLE_ROUTE}/absolute/overview`}
            className="
                  inline-flex items-center gap-2
                  px-6 py-2
                  rounded-lg
                  font-semibold
                  border
                  transition-all duration-300
                  bg-green-900
                  text-yellow-100
                  hover:bg-[var(--text-color)]
                  hover:text-[var(--content-bg)]
                "
          >
            ← Return To All Exams
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* Dynamic Vista Quote */}

      <div className="w-full flex justify-center items-center py-4">
        <div className="
            max-w-5xl w-full
            text-center
            px-6 py-4
            rounded-2xl
            border
            backdrop-blur-xl
            bg-gradient-to-r
            from-purple-500/10
            via-pink-500/10
            to-cyan-500/10
            shadow-lg
            transition-all duration-500
          "
        >
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm md:text-base">

            <span className="font-bold tracking-wide text-[var(--text-color)]">
              {randomQuote.quoteTitle}
            </span>

            <span className="opacity-70 text-[var(--text-color)]">
              — {randomQuote.quoteDescription}
            </span>

          </div>
        </div>
      </div>

      <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-[var(--text-color)] to-transparent" />

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      {/* Exam Mode Popup */}
      {showModePopup && selectedExam && (() => {
        const modalAction = selectedExam.examActions?.[0] ?? null;
        const modalAllowed = selectedExam.attemptsAllowed ?? 1;
        const modalUsed = modalAction?.attemptCount ?? 0;
        return (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3">

            {/* Mode Explanation Toast — centered, above the modal, closable */}
            {hoveredMode && (
              <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100000] w-[92%] max-w-md">
                <div className="relative rounded-xl border border-indigo-400 bg-[var(--content-bg)] text-[var(--text-color)] shadow-2xl px-4 py-3 pr-9">
                  <button
                    onClick={() => setHoveredMode(null)}
                    aria-label="Close"
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold hover:bg-[var(--text-color)] hover:text-[var(--content-bg)] transition-all duration-200"
                  >
                    ✕
                  </button>
                  <div className="text-xs font-bold uppercase tracking-wide text-indigo-500 mb-0.5">
                    {hoveredMode} Mode
                  </div>
                  <div className="text-sm leading-snug">
                    {examModeDescriptions[hoveredMode]}
                  </div>
                </div>
              </div>
            )}

            <div className="relative w-full max-w-sm rounded-2xl border bg-[var(--content-bg)] text-[var(--text-color)] shadow-2xl p-4 flex flex-col gap-3">

              {/* Close Button */}
              <button
                onClick={() => setShowModePopup(false)}
                aria-label="Close"
                className="
                  absolute -top-5 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700
                  bg-pink-200 text-black shadow-sm backdrop-blur-md transition-all duration-300 ease-out
                  hover:scale-110 hover:border-red-500 hover:bg-black hover:text-red-600 hover:shadow-lg
                  active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500
                "
              >
                <FiX className="h-7 w-7 stroke-[3.5]" />
              </button>

              {/* Header */}
              <div className="text-center px-6">
                <h2 className="text-2xl font-bold leading-tight">{selectedExam.title}</h2>
                {selectedExam.description && (
                  <p className="text-xs opacity-60 mt-1 whitespace-normal break-words">{selectedExam.description}</p>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl border border-amber-300 px-3 py-2 flex flex-col items-center">
                  <span className="opacity-50 uppercase tracking-wide text-[10px]">Sections</span>
                  <span className="font-bold text-base">{selectedExam.sectionsCount ?? 0}</span>
                </div>
                <div className="rounded-xl border border-amber-300 px-3 py-2 flex flex-col items-center">
                  <span className="opacity-50 uppercase tracking-wide text-[10px]">Questions</span>
                  <span className="font-bold text-base">{selectedExam.questionsCount ?? 0}</span>
                </div>
              </div>

              {/* Attempts + Remaining */}
              <div className="text-center text-[11px] rounded-xl border border-yellow-400 px-3 py-2">
                <span className="font-medium">
                  Used <strong>{modalUsed}</strong> of <strong>{modalAllowed}</strong> Attempts
                  {modalAction?.residualDuration != null && (
                    <> — Remaining <strong>{Math.round(modalAction.residualDuration)}</strong> Minutes</>
                  )}
                </span>
              </div>

              {/* Layout — scrollable row with arrow controls */}
              {showAdvanced && (
                <div>
                  <p className="text-[10px] text-center uppercase font-bold opacity-50 mb-1.5 tracking-wide">Select Exam Layout</p>
                  <div className="relative flex items-center gap-1.5">

                    {/* Left Arrow */}
                    <button
                      onClick={() => {
                        const el = document.getElementById("layout-scroll");
                        if (el) el.scrollBy({ left: -90, behavior: "smooth" });
                      }}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-md hover:from-indigo-400 hover:to-purple-500 hover:scale-105 transition-all duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Scrollable Strip */}
                    <div
                      id="layout-scroll"
                      className="flex-1 overflow-x-auto flex gap-2 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                      {layouts.map((item) => {
                        const isActive = layout === item;
                        const layoutColors: Record<string, string> = {
                          generic: "from-yellow-200 to-indigo-100",
                          glacial: "from-cyan-100 to-yellow-300",
                          pulse: "from-pink-200 to-green-100",
                          cascade: "from-teal-100 to-yellow-100",
                          classic: "from-amber-200 to-indigo-100",
                          atlas: "from-violet-100 to-purple-100",
                          orbit: "from-sky-100 to-indigo-100",
                          zen: "from-green-100 to-pink-100",
                        };
                        return (
                          <div key={item} className="relative group shrink-0 overflow-visible pl-1">
                            <button
                              onClick={() => setLayout(item)}
                              className={`
                            relative
                            px-3 py-1.5 text-[11px] font-semibold rounded-lg border-0
                            whitespace-nowrap transition-all duration-200
                            bg-gradient-to-r ${layoutColors[item]}
                            ${isActive
                                  ? "text-black shadow-lg scale-105 ring-1 ring-indigo-600"
                                  : "text-black hover:opacity-100 hover:scale-105 hover:shadow-md hover:text-red"
                                }
                          `}
                            >
                              {formatLayoutName(item)}

                              {isActive && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center shadow-md">
                                  <Check className="w-2.5 h-2.5 font-black text-green-600" />
                                </span>
                              )}
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap px-2 py-1 rounded-md text-[10px] bg-black/90 text-white shadow-xl pointer-events-none z-50">
                              {layoutTooltips[item]}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Arrow */}
                    <button
                      onClick={() => {
                        const el = document.getElementById("layout-scroll");
                        if (el) el.scrollBy({ left: 90, behavior: "smooth" });
                      }}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-md hover:from-indigo-400 hover:to-purple-500 hover:scale-105 transition-all duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              )}

              {/* Modes — full grid */}
              <div className="grid grid-cols-2 gap-2">
                {examModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeSelection(mode)}
                    onMouseEnter={() => setHoveredMode(mode)}
                    onMouseLeave={() => setHoveredMode(null)}
                    onFocus={() => setHoveredMode(mode)}
                    onBlur={() => setHoveredMode(null)}
                    className="
                      rounded-xl border px-3 py-4
                      flex flex-col items-center justify-center gap-1
                      transition-all duration-200
                      hover:scale-105
                      bg-gradient-to-r from-purple-100 to-green-50
                      hover:bg-indigo-600
                      hover:text-black
                      group
                    "
                  >
                    <span className="text-lg font-bold">{mode} Mode</span>
                    <span className="text-sm opacity-60 group-hover:opacity-90">Click to Start</span>
                  </button>
                ))}
              </div>

              {/* Cancel */}
              <button
                onClick={() => setShowModePopup(false)}
                className="w-full py-2 rounded-xl border text-xs font-bold bg-gradient-to-r from-purple-200 to-green-200 text-black hover:opacity-80 transition-all"
              >
                Cancel &amp; Close
              </button>

              {/* Advanced Toggle */}
              <button
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="w-full py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide opacity-50 hover:opacity-100 transition-all duration-200"
              >
                {showAdvanced ? "Hide Advanced ▲" : "Advanced ▼"}
              </button>

            </div>
          </div>
        );
      })()}
      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

    </main >
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
