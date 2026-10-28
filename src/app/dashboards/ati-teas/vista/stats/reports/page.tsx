"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiFileText, FiArrowLeft, FiDownload } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import SearchBar from "@/lib/utils/data/SearchBar";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";

const CURRENT_PANEL = "ati-teas";

type SortDirection = "asc" | "desc";
type ReportColumn = keyof StrataItem | "attemptsUsed" | "status" | "residualDuration";

const STATUS_TONE: Record<string, string> = {
  Completed: "bg-emerald-500/15 text-emerald-600",
  InProgress: "bg-blue-500/15 text-blue-600",
  Cancelled: "bg-rose-500/15 text-rose-600",
  Paused: "bg-yellow-500/15 text-yellow-700",
  Resumed: "bg-cyan-500/15 text-cyan-700",
  Suspended: "bg-orange-500/15 text-orange-700",
  Archived: "bg-gray-500/15 text-gray-500",
  Pending: "bg-purple-500/15 text-purple-600",
  Scheduled: "bg-indigo-500/15 text-indigo-600",
  UnderReview: "bg-pink-500/15 text-pink-600",
  Destroyed: "bg-black/15 text-black",
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function ReportsStatsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading: userLoading } = useCurrentSystemUser();

  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<ReportColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // ⚠️ ASSUMPTION: parentIdentifier="" fetches across all parents for this panel.
  const { filteredExams, examSearch, setExamSearch, skewTotal } = useNominalStrataExams({
    parentIdentifier: "",
    page: currentPage,
    perPage,
    sortColumn: (sortColumn as keyof StrataItem) ?? null,
    sortDirection,
  });

  const handleSort = (column: ReportColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const rows = useMemo(
    () =>
      filteredExams.map((exam) => {
        const action = exam.examActions?.[0];
        return {
          exam,
          status: action?.status ?? "Not Started",
          attemptsUsed: action?.attemptCount ?? 0,
          residualDuration: action?.residualDuration ?? null,
        };
      }),
    [filteredExams]
  );

  const handleExportCsv = () => {
    const headers = ["Exam", "Assessment", "Status", "Attempts Used", "Attempts Allowed", "Questions", "Sections", "Remaining Minutes"];
    const lines = rows.map((r) =>
      [
        r.exam.title,
        r.exam.assessmentName ?? "—",
        r.status,
        r.attemptsUsed,
        r.exam.attemptsAllowed ?? 1,
        r.exam.questionsCount ?? 0,
        r.exam.sectionsCount ?? 0,
        r.residualDuration != null ? Math.round(r.residualDuration) : "—",
      ].join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${CURRENT_PANEL}-exam-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="p-3 md:p-4 space-y-5 w-full max-w-7xl mx-auto">

        <Link
          href={`/dashboards/${CURRENT_PANEL}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-60 hover:opacity-100 text-[var(--text-color)] transition-opacity"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Current user header */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-indigo-500" />
                Exam Reports
              </h1>
              <p className="text-xs opacity-60 text-[var(--text-color)]">
                {userLoading ? "Loading…" : `${user?.userName ?? "Guest"} · ${user?.email ?? ""}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform shrink-0"
          >
            <FiDownload className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PerPageSelect
            value={perPage}
            onChange={(v) => {
              setPerPage(v);
              setCurrentPage(1);
            }}
          />
          <SearchBar
            value={examSearch}
            onChange={(v) => {
              setExamSearch(v);
              setCurrentPage(1);
            }}
            placeholder="Search exams . . ."
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--text-color)]/10 text-left">
                {[
                  { key: "title" as ReportColumn, label: "Exam" },
                  { key: "assessmentName" as ReportColumn, label: "Assessment" },
                  { key: "status" as ReportColumn, label: "Status" },
                  { key: "attemptsUsed" as ReportColumn, label: "Attempts" },
                  { key: "questionsCount" as ReportColumn, label: "Questions" },
                  { key: "sectionsCount" as ReportColumn, label: "Sections" },
                  { key: "residualDuration" as ReportColumn, label: "Remaining" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-3 py-2.5 font-bold uppercase tracking-wide text-[10px] text-[var(--text-color)] opacity-70 cursor-pointer hover:opacity-100 select-none whitespace-nowrap"
                  >
                    {col.label}
                    {sortColumn === col.key && (
                      <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center opacity-60 text-[var(--text-color)]">
                    No exam records found ⚓
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr
                  key={r.exam.id}
                  className="border-b border-[var(--text-color)]/5 hover:bg-[var(--text-color)]/5 transition-colors"
                >
                  <td className="px-3 py-2.5 font-semibold text-[var(--text-color)] whitespace-nowrap max-w-[220px] truncate">
                    {r.exam.title}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--text-color)] opacity-70 whitespace-nowrap">
                    {r.exam.assessmentName ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${STATUS_TONE[r.status] ?? "bg-gray-500/15 text-gray-500"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--text-color)] whitespace-nowrap">
                    {r.attemptsUsed} / {r.exam.attemptsAllowed ?? 1}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--text-color)] whitespace-nowrap">
                    {r.exam.questionsCount ?? 0}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--text-color)] whitespace-nowrap">
                    {r.exam.sectionsCount ?? 0}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--text-color)] whitespace-nowrap">
                    {r.residualDuration != null ? `${Math.round(r.residualDuration)} min` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-color)] opacity-70">
          <span>
            Showing {rows.length} of {skewTotal} exams
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 bg-[var(--content-bg)] text-[var(--text-color)]"
            >
              Prior
            </button>
            <span>{currentPage}</span>
            <button
              disabled={rows.length < perPage}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 rounded-md border font-bold disabled:opacity-40 bg-[var(--content-bg)] text-[var(--text-color)]"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────