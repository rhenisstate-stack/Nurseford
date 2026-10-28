"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, GraduationCap, Sparkles, Layers, ChevronRight } from "lucide-react";

export interface SearchEntry {
  title: string;
  subtitle: string;
  category: "Exam Bank" | "Subject / Course" | "Dashboard Tool" | "Navigation";
  href: string;
  keywords: string;
}

const SEARCH_CATALOG: SearchEntry[] = [
  // ─── Exam Banks ───
  {
    title: "RN Nursing Test Bank",
    subtitle: "ATI & HESI RN course examination library",
    category: "Exam Bank",
    href: "/dashboards/rn-nursing",
    keywords: "rn nursing test bank ati hesi registered nurse courses",
  },
  {
    title: "LPN Nursing Test Bank",
    subtitle: "ATI & HESI LPN examination library",
    category: "Exam Bank",
    href: "/dashboards/lpn-nursing",
    keywords: "lpn nursing test bank practical nurse ati hesi",
  },
  {
    title: "ATI Exit Exams (RN)",
    subtitle: "Comprehensive RN exit examinations with rationales",
    category: "Exam Bank",
    href: "/dashboards/rn-nursing/exams/exit-ati-exams-rn/36",
    keywords: "ati exit exams rn comprehensive exit proctored predictor",
  },
  {
    title: "HESI Exit Exams (RN)",
    subtitle: "Comprehensive HESI RN exit examinations",
    category: "Exam Bank",
    href: "/dashboards/rn-nursing/exams/exit-hesi-exams-rn/37",
    keywords: "hesi exit exams rn comprehensive exit proctored",
  },
  {
    title: "ATI Exams (RN)",
    subtitle: "All ATI subject-based examinations for RN students",
    category: "Exam Bank",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "ati exams rn adult medical surgical maternal pharmacology",
  },
  {
    title: "HESI Exams (RN)",
    subtitle: "All HESI subject-based examinations for RN students",
    category: "Exam Bank",
    href: "/dashboards/rn-nursing/exams/hesi-exams-rn/39",
    keywords: "hesi exams rn specialty exams",
  },

  // ─── Subjects & Courses ───
  {
    title: "Medical-Surgical (MED-SURG) Exams",
    subtitle: "Cardiovascular, respiratory, neurological, endocrine, GI & renal",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34/exams/130?subjectName=MED-SURG+Exams+(RN+ati)",
    keywords: "med-surg medical surgical adult health med surg cardio respiratory",
  },
  {
    title: "Pharmacology Exams",
    subtitle: "Medication administration, calculations, anti-infectives, psych",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34/exams/134?subjectName=Pharmacology+Exams+(RN+ati)",
    keywords: "pharmacology pharm drugs dosage medications side effects",
  },
  {
    title: "Pediatrics & Child Health",
    subtitle: "Growth & development, pediatric disorders, pediatric dosages",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "pediatrics child health infants children peds developmental",
  },
  {
    title: "Adult Health Nursing",
    subtitle: "Acute & chronic adult patient care, pathophysiology",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "adult health nursing med surg internal medicine",
  },
  {
    title: "Maternal & Newborn Nursing (OB/GYN)",
    subtitle: "Antepartum, intrapartum, postpartum & neonatal care",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "maternal newborn ob obstetrics labor delivery postpartum gyn",
  },
  {
    title: "Mental Health & Psychiatric Nursing",
    subtitle: "Psychiatric disorders, psychopharmacology, therapeutic communication",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "mental health psych psychiatric depression anxiety schizophrenia",
  },
  {
    title: "Fundamentals of Nursing",
    subtitle: "Basic nursing principles, vital signs, safety, infection control",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "fundamentals nursing skills asepsis vital signs ethics legal",
  },
  {
    title: "Dosage Calculation",
    subtitle: "IV drip rates, oral dosages, pediatric doses, reconstitution",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "dosage calculation math iv drip rate formulas reconstitution",
  },
  {
    title: "Leadership & Nursing Management",
    subtitle: "Delegation, prioritization, quality improvement, ethical dilemmas",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "leadership management delegation priority prioritization triage",
  },
  {
    title: "Nutrition & Diet Therapy",
    subtitle: "Clinical nutrition, enteral feeds, dietary restrictions",
    category: "Subject / Course",
    href: "/dashboards/rn-nursing/exams/ati-exams-rn/34",
    keywords: "nutrition diet therapy renal diabetic vitamins electrolytes",
  },

  // ─── Dashboard Tools ───
  {
    title: "Create Custom Test",
    subtitle: "Build a personalized exam selecting specific domains & topics",
    category: "Dashboard Tool",
    href: "/dashboards/nclex-rn",
    keywords: "create custom test builder personalized quiz questions selector",
  },
  {
    title: "Readiness Assessment Test (RAT)",
    subtitle: "Measure exam readiness probability and identify weak areas",
    category: "Dashboard Tool",
    href: "/dashboards/nclex-rn/practice/domains/28",
    keywords: "readiness assessment test rat predict passing score readiness benchmark",
  },
  {
    title: "NCLEX Practice Mode",
    subtitle: "Study mode with instant rationales and feedback",
    category: "Dashboard Tool",
    href: "/dashboards/nclex-rn/practice/domains/27",
    keywords: "nclex practice mode rationales explanations study review",
  },
  {
    title: "Nursing Study Notes & Guides",
    subtitle: "High-yield summary sheets, drug cards, and cheat sheets",
    category: "Dashboard Tool",
    href: "/register",
    keywords: "study notes guides cheat sheets flashcards pharmacology summaries",
  },
  {
    title: "Performance Index",
    subtitle: "Analyze your accuracy scores across all completed assessments",
    category: "Dashboard Tool",
    href: "/dashboards/nclex-rn",
    keywords: "performance index score gauge accuracy analytics statistics",
  },
];

const CATEGORY_COLORS: Record<SearchEntry["category"], { bg: string; text: string; border: string }> = {
  "Exam Bank": {
    bg: "bg-teal-500/15 dark:bg-teal-400/15",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/30",
  },
  "Subject / Course": {
    bg: "bg-blue-500/15 dark:bg-blue-400/15",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30",
  },
  "Dashboard Tool": {
    bg: "bg-purple-500/15 dark:bg-purple-400/15",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/30",
  },
  "Navigation": {
    bg: "bg-slate-500/15 dark:bg-slate-400/15",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/30",
  },
};

export default function DashboardNavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default recommended quick shortcuts when search is focused but empty
      return SEARCH_CATALOG.slice(0, 6);
    }
    const terms = q.split(/\s+/).filter(Boolean);
    return SEARCH_CATALOG.filter((item) => {
      const fullText = `${item.title} ${item.subtitle} ${item.category} ${item.keywords}`.toLowerCase();
      return terms.every((t) => fullText.includes(t));
    }).slice(0, 8);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (entry: SearchEntry) => {
    setIsOpen(false);
    setQuery("");
    router.push(entry.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[activeIndex]) {
        handleSelect(filteredResults[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-28 sm:w-48 lg:w-80 mr-3">
      {/* Search Input Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--text-color)]/5 border border-[var(--text-color)]/15 focus-within:border-blue-500 dark:focus-within:border-teal-400 focus-within:bg-[var(--card-bg,#15273e)] transition-all shadow-2xs">
        <Search className="w-3.5 h-3.5 shrink-0 opacity-50 text-[var(--text-color)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-[var(--text-color)] outline-none placeholder:opacity-40"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-full hover:bg-[var(--text-color)]/10 text-[var(--text-color)]/60 hover:text-[var(--text-color)] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Floating Results Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-[280px] sm:w-[340px] md:w-[400px] z-[9999] rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1d30]/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {query.trim() ? `Search Results (${filteredResults.length})` : "Quick Navigation"}
            </span>
            <span className="text-[10px] opacity-70">ESC to close</span>
          </div>

          {/* Results List */}
          <div className="max-h-[340px] overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-white/5">
            {filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No matches found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Try searching for MED-SURG, Pharmacology, RN Nursing, Exit Exams, or Custom Test.
                </p>
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isActive = idx === activeIndex;
                const colors = CATEGORY_COLORS[item.category];

                return (
                  <button
                    key={`${item.title}-${item.href}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-blue-500/10 dark:bg-teal-500/15 text-blue-950 dark:text-white"
                        : "hover:bg-slate-100/70 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {item.category === "Exam Bank" && (
                          <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        )}
                        {item.category === "Subject / Course" && (
                          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                        {item.category === "Dashboard Tool" && (
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )}
                        {item.category === "Navigation" && (
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold leading-snug truncate">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
