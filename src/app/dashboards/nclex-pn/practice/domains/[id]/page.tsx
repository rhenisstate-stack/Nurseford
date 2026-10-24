"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useDistinctStrataDomains } from "@/lib/hooks/nexus/strata/main/domains/distinct/useDistinctStrataDomains";
import { NCLEX_PRACTICE_CONFIG, type NclexExamType } from "@/lib/config/nclex-practice";
import { ClipboardCheck, Play, Search } from "lucide-react";

export default function NclexPnPracticeDomainsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { leftWidth, navHeight } = useFlexPageClasp();
  const [domainSearch, setDomainSearch] = useState("");

  const { filteredDomains } = useDistinctStrataDomains({
    parentIdentifier: id,
    page: 1,
    perPage: 50,
  });

  const config = NCLEX_PRACTICE_CONFIG["nclex-pn" as NclexExamType];
  const isPractice =
    id === "5" ||
    id === "110" ||
    id === config.practice.domainsGroupId ||
    id === config.practice.subjectGuidId;
  const isReadiness =
    id === "30" ||
    id === "111" ||
    id === config.readiness.domainsGroupId ||
    id === config.readiness.subjectGuidId;
  const groupLabel = isReadiness
    ? config.readiness.label
    : isPractice
      ? config.practice.label
      : "Practice Domains";

  const fallbackDomains = useMemo(() => {
    if (isPractice) {
      return [
        {
          id: "110",
          guidId: "110",
          name: config.practice.label,
          examCount: 4,
          description: "NCLEX-PN Practice Exams",
        },
      ];
    }
    if (isReadiness) {
      return [
        {
          id: "111",
          guidId: "111",
          name: config.readiness.label,
          examCount: 6,
          description: "NCLEX-PN Readiness Assessment Test",
        },
      ];
    }
    return [];
  }, [isPractice, isReadiness, config]);

  const rawDomains =
    filteredDomains.length > 0
      ? filteredDomains.map((d) => ({
          id: String(d.id ?? d.guidId),
          guidId: d.guidId,
          name: d.name,
          examCount: d.strataCounts?.assessments ?? 0,
          description: d.description,
        }))
      : fallbackDomains;

  const displayDomains = useMemo(() => {
    const q = domainSearch.trim().toLowerCase();
    return q ? rawDomains.filter((d) => d.name.toLowerCase().includes(q)) : rawDomains;
  }, [rawDomains, domainSearch]);

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
      <div className="p-2 md:p-4 lg:p-6 space-y-5 w-full max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-color)]/50">
          <Link href="/dashboards/nclex-pn" className="hover:text-[var(--text-color)] transition-colors">
            NCLEX PN
          </Link>
          <span>→</span>
          <span className="text-[var(--text-color)] font-medium">{groupLabel}</span>
        </div>

        {/* Search Bar matching live site */}
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-color)]/35 pointer-events-none" />
          <input
            type="text"
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            placeholder="Search by Domain Name ... !"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] text-sm text-[var(--text-color)] placeholder:text-[var(--text-color)]/40 focus:outline-none focus:border-[#2FD9C4] transition-all"
          />
        </div>

        {/* Domain Cards */}
        {displayDomains.length === 0 ? (
          <div className="rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] px-5 py-10 text-center shadow-xs">
            <ClipboardCheck className="w-10 h-10 text-slate-400 dark:text-[var(--text-color)]/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-[var(--text-color)]/60">
              No domain groups available yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayDomains.map((domain) => (
              <div
                key={domain.id}
                className="rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-5 flex flex-col gap-4 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-[var(--text-color)] leading-snug">
                    {domain.name}
                  </h3>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-[#2FD9C4] border border-teal-500/20 text-xs font-bold shrink-0">
                    Exams: {domain.examCount}
                  </span>
                </div>

                {domain.description && (
                  <p className="text-xs text-slate-600 dark:text-[var(--text-color)]/60 line-clamp-2">
                    {domain.description}
                  </p>
                )}

                <Link
                  href={`/dashboards/nclex-pn/practice/examinations/${domain.id}?subjectName=${encodeURIComponent(domain.name)}`}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold bg-[#00D0FF] text-slate-950 hover:bg-[#00BCE6] active:scale-[0.99] transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Access Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
