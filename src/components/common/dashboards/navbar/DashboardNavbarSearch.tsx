"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  Loader2,
  FileQuestion,
} from "lucide-react";
import {
  searchClientRegistry,
  type DynamicSearchResult,
} from "@/lib/services/search/searchRegistry";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

export interface SearchEntry {
  id?: string;
  title: string;
  subtitle: string;
  category: "Exam" | "Exam Bank" | "Subject / Course" | "Dashboard Tool" | "Navigation";
  href: string;
  keywords?: string;
  badge?: string;
  panelSlug?: string;
}

const CATEGORY_COLORS: Record<SearchEntry["category"], { bg: string; text: string; border: string }> = {
  "Exam": {
    bg: "bg-emerald-500/15 dark:bg-emerald-400/15",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
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
  const pathname = usePathname();

  const currentPanel = useMemo(() => {
    if (!pathname) return "rn-nursing";
    const m = pathname.match(/\/dashboards\/([^\/]+)/);
    return m ? m[1] : "rn-nursing";
  }, [pathname]);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [dynamicResults, setDynamicResults] = useState<DynamicSearchResult[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Runtime live page matches (0ms instant response from currently loaded page data)
  const clientMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchClientRegistry(q, currentPanel);
  }, [query, currentPanel]);

  // Combined live results: purely dynamic from backend API + active page data
  const displayedResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const seen = new Set<string>();
    const merged: SearchEntry[] = [];

    // Prioritize direct dynamic API results
    for (const item of dynamicResults) {
      if (!seen.has(item.href)) {
        seen.add(item.href);
        merged.push({
          ...item,
          keywords: item.keywords || "",
        });
      }
    }

    // Merge active on-page matches
    for (const item of clientMatches) {
      if (!seen.has(item.href)) {
        seen.add(item.href);
        merged.push(item);
      }
    }

    return merged.slice(0, 12);
  }, [query, dynamicResults, clientMatches]);

  // Debounced dynamic API search querying the live database
  const performDynamicSearch = useCallback(
    async (searchTerm: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const trimmed = searchTerm.trim();
      if (trimmed.length < 2) {
        setDynamicResults([]);
        setIsSearching(false);
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsSearching(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&panel=${encodeURIComponent(currentPanel)}`,
          {
            headers: {
              ...renderSystemSessionHeaders(),
            },
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          setIsSearching(false);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data?.results)) {
          setDynamicResults(data.results);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.warn("[DashboardNavbarSearch] Dynamic search error:", err);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [currentPanel]
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setDynamicResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      performDynamicSearch(trimmed);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [query, performDynamicSearch]);

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

    // If selecting an exam, pre-store title in session storage for live exam player
    if (entry.category === "Exam" && entry.id) {
      const cleanId = entry.id.replace(/^exam-/, "");
      try {
        localStorage.setItem(`exam_title_${cleanId}`, entry.title);
        sessionStorage.setItem(`exam_title_${cleanId}`, entry.title);
      } catch {}
    }

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
      setActiveIndex((prev) => (prev + 1) % Math.max(1, displayedResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + displayedResults.length) % Math.max(1, displayedResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (displayedResults[activeIndex]) {
        handleSelect(displayedResults[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-28 sm:w-48 lg:w-80 mr-3">
      {/* Search Input Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--text-color)]/5 border border-[var(--text-color)]/15 focus-within:border-blue-500 dark:focus-within:border-teal-400 focus-within:bg-[var(--card-bg,#15273e)] transition-all shadow-2xs">
        {isSearching ? (
          <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-blue-500 dark:text-teal-400" />
        ) : (
          <Search className="w-3.5 h-3.5 shrink-0 opacity-50 text-[var(--text-color)]" />
        )}
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
          placeholder="Search live exams, subjects..."
          className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-[var(--text-color)] outline-none placeholder:opacity-40"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDynamicResults([]);
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
        <div className="absolute top-full left-0 mt-1.5 w-[280px] sm:w-[340px] md:w-[420px] z-[9999] rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1d30]/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              {query.trim() ? (
                <>
                  <span>Live Search Results ({displayedResults.length})</span>
                  {isSearching && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-500" />}
                </>
              ) : (
                "Live Search"
              )}
            </span>
            <span className="text-[10px] opacity-70">ESC to close</span>
          </div>

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-white/5">
            {!query.trim() ? (
              <div className="px-4 py-8 text-center">
                <Search className="w-6 h-6 mx-auto mb-2 text-slate-400/50" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Search Live Examinations & Subjects
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Type any exam name, subject, or course to query live from the database.
                </p>
              </div>
            ) : displayedResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                {isSearching ? (
                  <>
                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-500" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Searching live database...
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No live matches found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Check your spelling or try searching another subject or exam name.
                    </p>
                  </>
                )}
              </div>
            ) : (
              displayedResults.map((item, idx) => {
                const isActive = idx === activeIndex;
                const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Navigation"];

                return (
                  <button
                    key={`${item.title}-${item.href}-${idx}`}
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
                        {item.category === "Exam" && (
                          <FileQuestion className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
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
                            {item.badge || item.category}
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
