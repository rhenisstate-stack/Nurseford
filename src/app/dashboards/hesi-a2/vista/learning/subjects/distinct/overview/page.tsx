"use client";

import { useState } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useDistinctStrataSubjects } from "@/lib/hooks/nexus/strata/learning/subjects/distinct/useDistinctStrataSubjects";
import type { StrataItem } from "@/lib/hooks/nexus/strata/learning/subjects/distinct/useDistinctStrataSubjects";
import SearchBar from "@/lib/utils/data/SearchBar";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_TITLE } from "@/lib/config/config";
import Link from "next/link";
import { LayoutList, PlusCircle, ArrowDownUp } from "lucide-react";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { useRelativeStrataAssessmentResults } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import { useMemo } from "react";   // For Random Quote Memoization

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const VISTA_STRATA_PANEL = "hesi-a2";
const VISTA_STRATA_LEVEL = "Subjects";
const VISTA_STRATA_NAME = "Subject";
const VISTA_STRATA_GROUP = "learning";
const VISTA_CHILD_LEVEL = "Exams";  // For Distinct Child Redirection
const VISTA_DEFAULT_PERPAGE_LIST = 12;
const VISTA_STRATA = VISTA_STRATA_LEVEL.toLocaleLowerCase();
const VISTA_CHILD_STRATA = VISTA_CHILD_LEVEL.toLocaleLowerCase();
const BASE_CHILD_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/assessment/${VISTA_CHILD_STRATA}`;
const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_STRATA}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main Component
export default function StrataSubjectsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  const [perPage, setPerPage] = useState(VISTA_DEFAULT_PERPAGE_LIST); // Default Per PAge
  const [currentPage, setCurrentPage] = useState(1);

  type SortDirection = "asc" | "desc";

  const [sortColumn, setSortColumn] = useState<keyof StrataItem | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [showSortBar, setShowSortBar] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Router for Edit Redirection
  const router = useRouter();

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Extract Parent ParentIdentifier from URL Search Params
  const searchParams = useSearchParams();
  const parentStrataIdentifier = searchParams.get("identifier");
  const safeParentStrataIdentifier = parentStrataIdentifier ?? "";
  const isMissingParentStrataIdentifier = !parentStrataIdentifier;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Pull Data From the Hook !
  const {
    filteredSubjects,
    skewTotal,
    skewTotalPages,
    subjectSearch,
    setSubjectSearch,
  } = useDistinctStrataSubjects({
    parentIdentifier: safeParentStrataIdentifier, // REQUIRED PARENT STRATA IDENTIFIER
    page: currentPage,
    perPage,
    sortColumn,
    sortDirection,
  });

  // Pagination Logic based on Backend 
  const totalPages = skewTotalPages;
  const { filteredExamResults: allResults } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const subjectProgressMap = useMemo(() => {
    const map = new Map<string, { total: number; count: number; passedCount: number; attempted: boolean }>();
    allResults.forEach((r) => {
      if (!r.subjectGuidId) return;
      if (!map.has(r.subjectGuidId)) {
        map.set(r.subjectGuidId, { total: 0, count: 0, passedCount: 0, attempted: false });
      }
      const entry = map.get(r.subjectGuidId)!;
      entry.total += r.percentageScore ?? 0;
      entry.count += 1;
      entry.attempted = true;
      if (r.passed) entry.passedCount += 1;
    });
    return map;
  }, [allResults]);

  // Featured subjects surface first, everything else keeps its existing order
  const sortedSubjects = useMemo(() => {
    const featured = filteredSubjects.filter((s) => s.isFeatured);
    const rest = filteredSubjects.filter((s) => !s.isFeatured);
    return [...featured, ...rest];
  }, [filteredSubjects]);

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
    const identifier = row.guidId ?? row.id;

    router.push(
      `${BASE_CHILD_ROUTE}/distinct/overview?level=subject&identifier=${identifier}`
    );
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
            <h1 className="text-2xl md:text-3xl font-bold">{APP_TITLE} {VISTA_STRATA_LEVEL}</h1>
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

          {/* Layout + Sort Toggle Actions */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
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
                query: parentStrataIdentifier
                  ? { identifier: parentStrataIdentifier }
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
              Showing : <strong>{filteredSubjects.length}</strong>
              {" "}of <strong>{skewTotal}</strong>
            </span>
          </div>

          <SearchBar
            value={subjectSearch}
            onChange={(v) => {
              setSubjectSearch(v);
              setCurrentPage(1);
            }}
            placeholder={`Type & Search ${VISTA_STRATA_LEVEL} . . . 🏌️‍♂️`}
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Cards Grid */}
        <div className="w-full">
          {filteredSubjects.length === 0 && (
            <div className="w-full bg-gradient-to-r from-transparent via-yellow-200 to-transparent rounded-xl border bg-[var(--content-bg)] text-[var(--text-color)]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="px-4 py-10 text-center opacity-70">
                No {VISTA_STRATA_LEVEL} Found ⚓
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            </div>
          )}


          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

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
                    { key: "examsCount", label: "Exams" },
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-3 rounded-xl">

            {/* Build Your Own Exam — only shown when subjects exist */}
            {sortedSubjects.length > 0 && (
              <div
                className="rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "#e2edff" }}
              >
                <div
                  className="px-3 pb-3"
                  style={{ borderTop: "1px solid #9b8d8d", borderLeft: "1px solid #9b8d8d", borderRight: "1px solid #9b8d8d", borderRadius: "8px" }}
                >
                  <div className="flex items-center gap-2 pt-2">
                    <PlusCircle className="w-4 h-4 shrink-0 text-gray-800" />
                    <h3 className="text-base font-semibold text-gray-800 truncate">Build Your Own Exam</h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ background: "#198754" }}>
                      Custom Selection
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ background: "#198754" }}>
                      Choose Domains &amp; Exams
                    </span>
                  </div>
                </div>

                {/* ⚠️ ASSUMPTION: adjust this href to your real custom-exam-builder route */}
                <div className="flex justify-center" style={{ borderRadius: "8px", border: "1px solid #9b8d8d" }}>
                  <Link
                    href="#"
                    className="block w-full py-2 text-center text-sm font-semibold rounded"
                    style={{ border: "1px solid #0d6efd", color: "#0d6efd", margin: "6px" }}
                  >
                    Create Custom Exam
                  </Link>
                </div>
              </div>
            )}

            {sortedSubjects.map((strataName) => {
              const subjectKey = strataName.guidId ?? String(strataName.id);
              const progress = subjectProgressMap.get(subjectKey);
              const cardPct = progress ? Math.round(progress.total / progress.count) : 0;
              const cardStatus = progress
                ? progress.passedCount > 0
                  ? "In Progress"
                  : "Attempted"
                : strataName.status ?? "Not Started";
              const statusBg =
                cardPct >= 100 ? "#adffd9" : cardPct > 0 ? "#ffc107" : "#d29cff";
              const statusColor = cardPct > 0 && cardPct < 100 ? "#000" : "#fff";

              return (
                <div
                  key={strataName.id}
                  className="rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: "#e2edff" }}
                >
                  <div
                    className="relative px-3 pb-3"
                    style={{ borderTop: "1px solid #9b8d8d", borderLeft: "1px solid #9b8d8d", borderRight: "1px solid #9b8d8d", borderRadius: "8px" }}
                  >
                    {strataName.isFeatured && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-black shadow-md">
                        FEATURED
                      </span>
                    )}

                    <h3 className="text-lg font-semibold text-gray-800 truncate pr-16 pt-2">
                      {funcTruncateHelper(strataName.name, 40)}
                    </h3>

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ background: statusBg, color: statusColor }}
                      >
                        {cardStatus}
                      </span>
                      <span className="px-2 py-1 border rounded text-xs font-bold text-black" style={{ background: "#dfff80" }}>
                        {cardPct}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center" style={{ borderRadius: "8px", border: "1px solid #9b8d8d" }}>
                    <button
                      type="button"
                      onClick={() => handleCardClick(strataName)}
                      className="w-full py-2 text-sm font-semibold rounded"
                      style={{ border: "1px solid #0d6efd", color: "#0d6efd", margin: "6px" }}
                    >
                      View Exams
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
              Showing : <strong>{filteredSubjects.length}</strong>
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

      {isMissingParentStrataIdentifier && (
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
            This SubCategories view Requires a Valid Parent Reference
            Kindly Navigate Using a Valid Strata Source or Return To The Parent Strata Overview To Select A SubCategory Strata To Explore.
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
                  hover:bg-[var(--text-color)]
                  hover:text-[var(--content-bg)]
                "
          >
            ← Return To Parent Strata
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

    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
