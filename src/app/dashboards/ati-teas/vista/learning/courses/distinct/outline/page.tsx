"use client";

import { useState } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useDistinctStrataCourses } from "@/lib/hooks/nexus/strata/learning/courses/distinct/useDistinctStrataCourses";
import type { StrataItem } from "@/lib/hooks/nexus/strata/learning/courses/distinct/useDistinctStrataCourses";
import SearchBar from "@/lib/utils/data/SearchBar";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_TITLE } from "@/lib/config/config";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import { useMemo } from "react";  // For Random Quote Memoization

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const VISTA_STRATA_PANEL = "ati-teas";
const VISTA_STRATA_LEVEL = "Courses";
const VISTA_STRATA_NAME = "Course";
const VISTA_STRATA_GROUP = "learning";
const VISTA_CHILD_LEVEL = "Subjects";  // For Distinct Child Redirection
const VISTA_DEFAULT_PERPAGE_LIST = 12;
const VISTA_STRATA = VISTA_STRATA_LEVEL.toLocaleLowerCase();
const VISTA_CHILD_STRATA = VISTA_CHILD_LEVEL.toLocaleLowerCase();
const BASE_CHILD_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_CHILD_STRATA}`;
const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_STRATA}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Main Component
export default function SubCategoriesPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  const [perPage, setPerPage] = useState(VISTA_DEFAULT_PERPAGE_LIST); // Default Per PAge
  const [currentPage, setCurrentPage] = useState(1);

  type SortDirection = "asc" | "desc";

  const [sortColumn, setSortColumn] = useState<keyof StrataItem | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Router for Edit Redirection
  const router = useRouter();

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Extract Parent Identifier from URL Search Params
  const searchParams = useSearchParams();
  const parentStrataIdentifier = searchParams.get("identifier");
  const safeParentStrataIdentifier = parentStrataIdentifier ?? "";
  const isMissingParentStrataIdentifier = !parentStrataIdentifier;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Pull Data From the Hook !
  const {
    filteredCourses,
    skewTotal,
    skewTotalPages,
    courseSearch,
    setCourseSearch,
  } = useDistinctStrataCourses({
    parentIdentifier: safeParentStrataIdentifier, // REQUIRED PARENT STRATA IDENTIFIER
    page: currentPage,
    perPage,
    sortColumn,
    sortDirection,
  });

  // Pagination Logic based on Backend 
  const totalPages = skewTotalPages;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Random Quote Selection (Memoized for Performance)
  const randomQuote = useMemo(() => {
    return VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const handleSort = (column: keyof StrataItem) => {
    let direction: SortDirection = "asc";

    if (sortColumn === column) {
      direction = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(direction);
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    setCurrentPage(1);

    // Remove previous static sort toasts
    setStaticToasts((prev) =>
      prev.filter((t) => !t.message.includes("Sorted by"))
    );

    showToast(
      `Sorted By "${column}" In ${direction.toUpperCase()} Order`, "success"
    );
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Row Click → Redirect to Overview
  const handleRowClick = (row: StrataItem) => {
    const identifier = row.guidId ?? row.id;

    router.push(
      `${BASE_CHILD_ROUTE}/distinct/outline?identifier=${identifier}`
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

  const formatDateHuman = (dateString?: string) => {
    if (!dateString) return "—";

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = "";

    if (diffMinutes < 1) relative = "Just now";
    else if (diffMinutes < 60) relative = `${diffMinutes} min ago`;
    else if (diffHours < 24) relative = `${diffHours} hr ago`;
    else if (diffDays < 7) relative = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    else relative = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;

    const formatted = date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return { relative, formatted };
  };


  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Render
  return (
    <main
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
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

          {/* Layout Toggle Action */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 border border-[var(--text-color)] rounded-lg">
            <Link
              href={{
                pathname: `${BASE_TOGGLE_ROUTE}/distinct/overview`,
                query: parentStrataIdentifier
                  ? { identifier: parentStrataIdentifier }
                  : {},
              }}
              className="
                flex items-center gap-2
                px-4 py-2
                text-sm
                font-bold
                text-[var(--text-color)]
                hover:bg-gradient-to-r
                hover:from-purple-500
                hover:via-pink-500
                hover:to-red-500
                hover:text-white
                rounded-lg
                transition-all duration-200
              "
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
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
              Divulging : <strong>{filteredCourses.length}</strong>
              {" "}of <strong>{skewTotal}</strong>
            </span>
          </div>

          <SearchBar
            value={courseSearch}
            onChange={(v) => {
              setCourseSearch(v);
              setCurrentPage(1);
            }}
            placeholder={`Type & Search ${VISTA_STRATA_LEVEL} . . . 🏌️‍♂️`}
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-xl border bg-[var(--content-bg)] text-[var(--text-color)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--content-bg)] text-[var(--text-color)]">
              <tr>
                <th className="px-4 py-2 text-left">🟢</th>

                {/** Sortable Headers with Inline Hover Arrows */}
                {[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "description", label: "Description" },
                  { key: "type", label: "Type" },
                  { key: "status", label: "Status" },
                  { key: "code", label: "Code" },
                  { key: "target", label: "Target" },
                  { key: "segment", label: "Segment" },
                  { key: "fragment", label: "Fragment" },
                  { key: "level", label: "Level" },
                  { key: "difficulty", label: "Difficulty" },
                  { key: "order", label: "Order" },
                  { key: "season", label: "Season" },
                  { key: "module", label: "Module" },
                  { key: "link", label: "Link" },
                  { key: "ratings", label: "Ratings" },
                  { key: "version", label: "Version" },
                  { key: "tag", label: "Tag" },
                  { key: "year", label: "Year" },
                  { key: "resources", label: "Resources" },
                  { key: "prerequisites", label: "Prerequisites" },
                  { key: "objectives", label: "Objectives" },
                  { key: "language", label: "Language" },
                  { key: "isFeatured", label: "Featured" },
                  { key: "createdAt", label: "Created At" },
                  { key: "updatedAt", label: "Updated At" }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as keyof StrataItem)}
                    className="px-4 py-2 text-left cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>

                      {/** Inline arrows with dot separator */}
                      <span className="flex flex-col items-center text-[8px] transition-opacity">
                        <span
                          className={`${sortColumn === col.key && sortDirection === "asc" ? "text-blue-500 font-bold opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100"}`}
                          style={{ lineHeight: 0.8 }}
                        >
                          ▲
                        </span>
                        <span className="text-gray-400 text-[6px] leading-[1] opacity-0 group-hover:opacity-100">•</span>
                        <span
                          className={`${sortColumn === col.key && sortDirection === "desc" ? "text-blue-500 font-bold opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100"}`}
                          style={{ lineHeight: 0.8 }}
                        >
                          ▼
                        </span>
                      </span>
                    </div>

                  </th>
                ))}

                <th className="px-4 py-2 text-center">Exams</th>
                <th className="px-3 py-2 text-left">GuidID</th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={28} className="px-0">
                    <div className="w-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent">

                      {/* Top Gradient Line */}
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

                      {/* Empty State Message */}
                      <div className="px-4 py-10 text-center opacity-70">
                        No {VISTA_STRATA_LEVEL} Found ⚓
                      </div>

                      {/* Bottom Gradient Line */}
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

                    </div>
                  </td>
                </tr>
              )}

              {filteredCourses.map((strataName, index) => {
                const autoNumber = (currentPage - 1) * perPage + index + 1;

                return (
                  <tr
                    key={strataName.id}
                    onClick={() => handleRowClick(strataName)}
                    className="
                      group cursor-pointer
                      bg-[var(--content-bg)] text-[var(--text-color)]
                      hover:font-bold
                      hover:bg-[var(--text-color)]/10 dark:hover:bg-[var(--text-color)]/20
                      transition-colors duration-200
                    "
                  >
                    {/* Auto Number */}
                    <td className="px-4 py-2 relative text-xs">
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--text-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="pl-3">{autoNumber}</span>
                    </td>

                    <td className="px-3 py-2 font-mono text-xs">
                      <span className="blur-sm group-hover:blur-none transition-all duration-100">
                        {strataName.id}
                      </span>
                    </td>

                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.name)}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.description)}</td>
                    <td className="px-4 py-2">{strataName.type ?? "—"}</td>
                    <td className="px-4 py-2">{strataName.status ?? "—"}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.code)}</td>
                    <td className="px-4 py-2">{strataName.target ?? "—"}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.segment)}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.fragment)}</td>
                    <td className="px-4 py-2">{strataName.level ?? "—"}</td>
                    <td className="px-4 py-2">{strataName.difficulty ?? "—"}</td>
                    <td className="px-4 py-2">{strataName.order ?? "—"}</td>
                    <td className="px-4 py-2">{strataName.season ?? "—"}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.module)}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.link)}</td>
                    <td className="px-4 py-2">{strataName.ratings ?? "—"}</td>
                    <td className="px-4 py-2">{strataName.version ?? "—"}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.tag)}</td>
                    <td className="px-4 py-2">{strataName.year ?? "—"}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.resources)}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.prerequisites)}</td>
                    <td className="px-4 py-2 truncate max-w-[220px]">{funcTruncateHelper(strataName.objectives)}</td>
                    <td className="px-4 py-2">{strataName.language ?? "—"}</td>
                    <td className="px-4 py-2">{strataName.isFeatured ? "Yes" : "No"}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      {(() => {
                        const d = formatDateHuman(strataName.createdAt);
                        if (d === "—") return "—";

                        return (
                          <span title={d.relative}>
                            {d.formatted}
                          </span>
                        );
                      })()}
                    </td>


                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      {(() => {
                        const d = formatDateHuman(strataName.updatedAt);
                        if (d === "—") return "—";

                        return (
                          <span title={d.relative}>
                            {d.formatted}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-2 text-center">{strataName.subjectsCount ?? 0}</td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                      <span className="blur-sm group-hover:blur-none transition-all duration-100">
                        {strataName.guidId}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              Manifesting : <strong>{filteredCourses.length}</strong>
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

      <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-[var(--text-color)] to-transparent" />

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
            href={`${BASE_TOGGLE_ROUTE}/absolute/outline`}
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
