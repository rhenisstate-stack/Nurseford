"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

export default function LpnNursingListCard() {
  return (
    <div className="rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] flex flex-col h-full lg:h-[190px] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      <style>{`
        .lpn-nursing-list-scroll::-webkit-scrollbar { width: 6px; }
        .lpn-nursing-list-scroll::-webkit-scrollbar-track { background: transparent; }
        .lpn-nursing-list-scroll::-webkit-scrollbar-thumb { background-color: #14b8a6; border-radius: 9999px; }
        .lpn-nursing-list-scroll::-webkit-scrollbar-thumb:hover { background-color: #0d9488; }
      `}</style>

      <div className="px-3 py-2 md:px-4 border-b border-[var(--text-color)]/10 shrink-0">
        <h2 className="text-sm md:text-base font-bold text-[var(--text-color)] text-center whitespace-nowrap truncate">
          Nursing Study Notes/Guides
        </h2>
      </div>

      <div
        className="lpn-nursing-list-scroll flex-1 overflow-y-scroll px-2.5 py-1.5 space-y-1.5 max-h-[146px]"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#14b8a6 transparent" }}
      >
        {SUBJECTS.map((subject) => (
          <Link
            key={subject.label}
            href={subject.href}
            className="group flex items-center justify-between gap-2 w-full rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] px-3 py-1.5 text-white text-xs md:text-sm font-semibold transition-colors duration-200"
          >
            <span className="truncate">{subject.label} Notes</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        ))}
      </div>
    </div>
  );
}
