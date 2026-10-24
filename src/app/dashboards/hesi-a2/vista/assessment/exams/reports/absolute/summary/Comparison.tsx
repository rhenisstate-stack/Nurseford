// src/app/dashboards/hesi-a2/vista/assessment/exams/reports/absolute/summary/Comparison.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { ArrowUpDown } from "lucide-react";
import { StrataExamResultItem } from "@/lib/hooks/nexus/strata/assessment/results/absolute/useAbsoluteStrataAssessmentResults";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import SearchBar from "@/lib/utils/data/SearchBar";

const VOID = "Void";

function formatDate(value?: string) {
    if (!value) return VOID;
    const d = new Date(value);
    if (isNaN(d.getTime())) return VOID;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Auto-numbered record id — derived from the row's position in the
// filtered/sorted list (not from any backend field), so it stays stable
function formatRecordNumber(position: number, totalWidth: number) {
    return `${String(position).padStart(Math.max(4, totalWidth), "0")}`;
}

type SortKey = "attemptedAt" | "percentageScore" | "attemptNumber";

interface ComparisonProps {
    isOpen: boolean;
    onClose: () => void;
    examTitle: string;
    myUserGuidId?: string;
    myScore: number;
    peers: StrataExamResultItem[]; // every OTHER Learner's attempts at this exam
}

export default function Comparison({
    isOpen,
    onClose,
    examTitle,
    myScore,
    peers,
}: ComparisonProps) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("percentageScore");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    // Reset to page 1 whenever the modal is reopened, or filters/sort change —
    // stale page numbers from a previous open/search are confusing otherwise.
    useEffect(() => {
        if (isOpen) setPage(1);
    }, [isOpen]);

    useEffect(() => {
        setPage(1);
    }, [search, sortKey, sortDir, perPage]);

    // Full filtered + sorted set. This still lives in memory client-side
    const filteredSorted = useMemo(() => {
        const filtered = peers.filter((p) => {
            if (!search) return true;
            const name = (p.userName ?? "").toLowerCase();
            const subj = (p.subjectName ?? "").toLowerCase();
            return name.includes(search.toLowerCase()) || subj.includes(search.toLowerCase());
        });

        return [...filtered].sort((a, b) => {
            let av: number | string = 0;
            let bv: number | string = 0;
            if (sortKey === "attemptedAt") {
                av = a.attemptedAt ? new Date(a.attemptedAt).getTime() : 0;
                bv = b.attemptedAt ? new Date(b.attemptedAt).getTime() : 0;
            } else if (sortKey === "percentageScore") {
                av = a.percentageScore ?? 0;
                bv = b.percentageScore ?? 0;
            } else {
                av = a.attemptNumber ?? 0;
                bv = b.attemptNumber ?? 0;
            }
            const diff = av < bv ? -1 : av > bv ? 1 : 0;
            return sortDir === "asc" ? diff : -diff;
        });
    }, [peers, search, sortKey, sortDir]);

    const totalRecords = filteredSorted.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
    const numberWidth = String(totalRecords).length;

    const pageRows = useMemo(() => {
        const start = (page - 1) * perPage;
        return filteredSorted.slice(start, start + perPage).map((p, idxInPage) => ({
            row: p,
            // Position across the FULL filtered/sorted set, not just this page —
            // same "index + 1" convention used for the Recharts sequence key.
            position: start + idxInPage + 1,
        }));
    }, [filteredSorted, page, perPage]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl border bg-white text-slate-700 shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-2 border-b border-green-300 bg-green-100 flex items-start justify-between gap-3 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-indigo-900">Title : {examTitle}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-gray-700 bg-pink-200 text-black shadow-sm transition-all duration-300 ease-out hover:scale-110 hover:border-red-500 hover:bg-black hover:text-red-600"
                    >
                        <FiX className="h-5 w-5 stroke-[3]" />
                    </button>
                </div>

                {/* Search / Exam Summary */}
                <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-xs text-slate-500 mt-0.5">
                        {totalRecords} Other Attempt{totalRecords === 1 ? "" : "s"} Recorded on this Exam · Your Score on This attempt is :{" "}
                        <span className="font-bold text-indigo-700">
                            {myScore}%
                        </span>
                    </p>

                    <div className="flex items-center gap-2">
                        <PerPageSelect value={perPage} onChange={(v) => setPerPage(v)} />
                        <SearchBar value={search} onChange={(v) => setSearch(v)} placeholder="Search by subject or learner . . . 🖋️" />
                    </div>
                </div>

                {/* Table — scrollable body, sticky header, only the current page is rendered */}
                <div className="overflow-auto flex-1">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                            <tr>
                                <th className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide">Learner</th>
                                <th className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide">Subject</th>
                                <th
                                    className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide cursor-pointer select-none"
                                    onClick={() => toggleSort("attemptNumber")}
                                >
                                    <span className="inline-flex items-center gap-1">Attempts <ArrowUpDown size={10} /></span>
                                </th>
                                <th
                                    className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide cursor-pointer select-none"
                                    onClick={() => toggleSort("attemptedAt")}
                                >
                                    <span className="inline-flex items-center gap-1">Date <ArrowUpDown size={10} /></span>
                                </th>
                                <th
                                    className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide cursor-pointer select-none"
                                    onClick={() => toggleSort("percentageScore")}
                                >
                                    <span className="inline-flex items-center gap-1">Score <ArrowUpDown size={10} /></span>
                                </th>
                                <th className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide">Grade</th>
                                <th className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide">Passed</th>
                                <th className="text-left px-4 py-2 font-black text-slate-500 uppercase tracking-wide">vs You</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-semibold">
                                        No matching attempts found ⚓
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map(({ row: p, position }) => {
                                    const score = p.percentageScore ?? 0;
                                    const diff = score - myScore;
                                    return (
                                        <tr key={`${p.guidId}-${position}`} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-indigo-500 flex-shrink-0">
                                                        {formatRecordNumber(position, numberWidth)}
                                                    </span>
                                                    <span
                                                        className="font-bold text-slate-700 blur-[2px] select-none pointer-events-none"
                                                        aria-hidden="true"
                                                    >
                                                        {p.userName?.trim() || "Anonymous Learner"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">{p.subjectName ?? VOID}</td>
                                            <td className="px-4 py-2 text-slate-600">{(p.attemptNumber ?? 0) + 1}</td>
                                            <td className="px-4 py-2 text-slate-600">{formatDate(p.attemptedAt)}</td>
                                            <td className="px-4 py-2 font-black text-slate-800">{score}%</td>
                                            <td className="px-4 py-2 text-slate-600">{p.grade ?? VOID}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                                    {p.passed ? "Yes" : "No"}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-2 font-bold ${diff > 0 ? "text-red-600" : diff < 0 ? "text-emerald-600" : "text-slate-500"}`}>
                                                {diff > 0 ? `+${diff}` : diff}%
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-2 border-t border-slate-100 flex-shrink-0 flex items-center justify-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1 rounded-md border text-xs font-bold disabled:opacity-40 bg-white text-slate-600"
                        >
                            Prior
                        </button>
                        <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 rounded-md border text-xs font-bold disabled:opacity-40 bg-white text-slate-600"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-800 bg-indigo-50 flex-shrink-0 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-[10px] text-slate-500 leading-tight">
                            Learner identities are blurred. Names, emails, and phone numbers are never
                            shown here.
                        </p>

                        <p className="text-[10px] text-slate-500 leading-tight">
                            Need to identify a specific learner for verified academic reasons?{" "}
                            <a
                                href="/dashboards/hesi-a2/vista/pages/contact-us"
                                className="font-bold text-indigo-600 underline hover:text-indigo-800"
                            >
                                Request Special Access
                            </a>
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex-shrink-0 rounded-lg border border-slate-300 px-4 py-1.5 bg-yellow-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                        Cancel &amp; Close
                    </button>
                </div>

            </div>
        </div>
    );
}