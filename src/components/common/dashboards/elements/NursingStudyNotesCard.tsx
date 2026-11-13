"use client";

import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";

const SUBJECTS = [
  { label: "Pediatric/Child Health", href: "/register" },
  { label: "Adult Health", href: "/register" },
  { label: "Medical-Surgical", href: "/register" },
  { label: "Maternal & Newborn", href: "/register" },
  { label: "Pharmacology", href: "/register" },
  { label: "Mental Health", href: "/register" },
  { label: "Nutrition", href: "/register" },
  { label: "Fundamentals of Nursing", href: "/register" },
  { label: "Dosage Calculation", href: "/register" },
  { label: "Leadership", href: "/register" },
];

export default function NursingStudyNotesCard() {
  return (
    <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[var(--card-bg,#15273e)] flex flex-col h-[180px] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      <style>{`
        .nursing-notes-scroll::-webkit-scrollbar { width: 5px; }
        .nursing-notes-scroll::-webkit-scrollbar-track { background: transparent; }
        .nursing-notes-scroll::-webkit-scrollbar-thumb { background-color: rgba(148, 163, 184, 0.45); border-radius: 9999px; }
        .nursing-notes-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(20, 184, 166, 0.7); }
      `}</style>

      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-[#2FD9C4] shrink-0">
            <BookOpen className="w-3 h-3" />
          </span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            Study Notes &amp; Guides
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 shrink-0">
          {SUBJECTS.length} topics
        </span>
      </div>

      <div
        className="nursing-notes-scroll flex-1 min-h-0 overflow-y-auto px-2.5 py-1.5 space-y-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(148, 163, 184, 0.45) transparent" }}
      >
        {SUBJECTS.map((subject) => (
          <Link
            key={subject.label}
            href={subject.href}
            className="group flex items-center justify-between gap-2 w-full rounded-lg border border-slate-200/75 dark:border-white/10 bg-slate-50/75 dark:bg-white/[0.04] hover:bg-teal-50/70 dark:hover:bg-teal-500/15 hover:border-teal-400/50 dark:hover:border-teal-400/40 text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-200 px-2.5 py-1.5 text-xs font-medium transition-all duration-150"
          >
            <span className="truncate">{subject.label} Notes</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all duration-150" />
          </Link>
        ))}
      </div>
    </div>
  );
}
