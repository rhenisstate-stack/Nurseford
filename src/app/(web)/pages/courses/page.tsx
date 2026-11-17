"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  Calendar,
  Sun,
  School,
  ArrowRight,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Check,
  ChevronDown,
} from "lucide-react";
import { useNursingSchools } from "@/lib/data/nursingSchools";
import { toSlug } from "@/lib/data/exam-subjects";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";
import { isAllowedNursingCourse } from "@/lib/utils/exams/nursingProgramScope";

export interface DynamicCourse {
  id: string;
  guidId?: string;
  name: string;
  description?: string;
  slug: string;
  programName: string;
  category: "core" | "exit";
  panelSlug: "rn-nursing" | "lpn-nursing";
  year: number | null;
  season: string | null;
  subjectsCount: number;
}

interface RawCoursePayload {
  id?: number | string;
  guidId?: string;
  name?: string;
  title?: string;
  description?: string;
  slug?: string;
  panelHint?: string;
  segment?: string;
  programName?: string;
  year?: number;
  season?: string;
  createdAt?: string;
  coursesCount?: number;
  subjectsCount?: number;
}

const PROGRAM_OPTIONS = [
  "All Programmes",
  "RN Nursing Exams",
  "LPN Nursing Exams",
  "RN Exit Exams",
  "LPN Exit Exams",
];

export default function CoursesPage() {
  const searchParams = useSearchParams();

  // Local filter states
  const [courses, setCourses] = useState<DynamicCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>(() => {
    return searchParams.get("program") || "All Programmes";
  });
  const [selectedSchool, setSelectedSchool] = useState<string>(() => {
    return searchParams.get("school") || "All Schools";
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return searchParams.get("year") || "All Years";
  });
  const [selectedSeason, setSelectedSeason] = useState<string>(() => {
    return searchParams.get("season") || "All Seasons";
  });

  // Dropdown menus visibility
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Dynamic schools list
  const { schools } = useNursingSchools();

  // Fetch courses dynamically from both endpoints with fallback
  useEffect(() => {
    let cancelled = false;

    async function loadAllCourses() {
      setIsLoading(true);
      setError(null);

      try {
        const [rnRes, lpnRes, strataRes] = await Promise.allSettled([
          fetch("/api/exams/rn-nursing/subjects", { cache: "no-store" }),
          fetch("/api/exams/lpn-nursing/subjects", { cache: "no-store" }),
          fetch("/api/nexus/strata/learning/course?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200", {
            cache: "no-store",
          }),
        ]);

        const rawList: RawCoursePayload[] = [];

        if (rnRes.status === "fulfilled" && rnRes.value.ok) {
          const data = (await rnRes.value.json().catch(() => ({}))) as {
            subjects?: RawCoursePayload[];
          };
          const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
          subjects.forEach((s) => rawList.push({ ...s, panelHint: "rn-nursing" }));
        }

        if (lpnRes.status === "fulfilled" && lpnRes.value.ok) {
          const data = (await lpnRes.value.json().catch(() => ({}))) as {
            subjects?: RawCoursePayload[];
          };
          const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
          subjects.forEach((s) => rawList.push({ ...s, panelHint: "lpn-nursing" }));
        }

        if (strataRes.status === "fulfilled" && strataRes.value.ok) {
          const strataData = (await strataRes.value.json().catch(() => ({}))) as {
            data?: { items?: RawCoursePayload[] } | RawCoursePayload[];
          };
          const items = Array.isArray(strataData?.data)
            ? strataData.data
            : Array.isArray(strataData?.data?.items)
            ? strataData.data.items
            : [];
          items.forEach((c) => {
            if (isAllowedNursingCourse(c, "all")) {
              rawList.push(c);
            }
          });
        }

        if (cancelled) return;

        // Deduplicate and normalize
        const seen = new Set<string>();
        const normalized: DynamicCourse[] = [];

        for (const item of rawList) {
          const name = (item.name || item.title || "").trim();
          if (!name) continue;

          const slug = item.slug || toSlug(name);
          const id = String(item.guidId || item.id || slug);

          if (seen.has(slug)) continue;
          seen.add(slug);

          const isLpn =
            item.panelHint === "lpn-nursing" ||
            /lpn|pn\b/i.test(name) ||
            /lpn|pn\b/i.test(item.programName || "") ||
            item.segment === "LPN_NURSING" ||
            item.segment === "LPN_EXIT";

          const isExit =
            /exit/i.test(name) ||
            /exit/i.test(item.programName || "") ||
            item.segment === "RN_EXIT" ||
            item.segment === "LPN_EXIT";

          const panelSlug: "rn-nursing" | "lpn-nursing" = isLpn ? "lpn-nursing" : "rn-nursing";

          const programName = isLpn
            ? isExit
              ? "LPN Exit Exams"
              : "LPN Nursing Exams"
            : isExit
            ? "RN Exit Exams"
            : "RN Nursing Exams";

          const year = extractExamYear(name, undefined, item.year, item.createdAt);
          const season = resolveExamSeason(item.season, name, item.description);

          normalized.push({
            id,
            guidId: item.guidId,
            name,
            description:
              item.description ||
              `Comprehensive ${programName} module with verified practice questions and clinical rationales.`,
            slug,
            programName,
            category: isExit ? "exit" : "core",
            panelSlug,
            year,
            season,
            subjectsCount: item.subjectsCount || item.coursesCount || (isExit ? 4 : 6),
          });
        }

        // Sort: Exit exams grouped with their program, newest year first
        normalized.sort((a, b) => {
          if (a.programName !== b.programName) {
            return a.programName.localeCompare(b.programName);
          }
          if ((b.year || 0) !== (a.year || 0)) {
            return (b.year || 0) - (a.year || 0);
          }
          return a.name.localeCompare(b.name);
        });

        setCourses(normalized);
      } catch (err: unknown) {
        console.error("[CoursesPage] Error loading dynamic courses:", err);
        if (!cancelled) setError("Failed to load courses. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAllCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside() {
      setOpenDropdown(null);
    }
    if (openDropdown) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  // Dynamically extract unique available years from loaded courses
  const dynamicYears = useMemo(() => {
    const set = new Set<number>();
    courses.forEach((c) => {
      if (c.year) set.add(c.year);
    });
    // Add current/recent years if not present
    [2026, 2025, 2024, 2023].forEach((y) => set.add(y));
    return Array.from(set).sort((a, b) => b - a);
  }, [courses]);

  // Dynamically extract unique seasons
  const dynamicSeasons = useMemo(() => {
    const standard = ["Fall", "Spring", "Summer", "Winter"];
    const found = new Set<string>(standard);
    courses.forEach((c) => {
      if (c.season) found.add(c.season);
    });
    return Array.from(found);
  }, [courses]);

  // Filter courses based on active filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = course.name.toLowerCase().includes(q);
        const matchesDesc = (course.description || "").toLowerCase().includes(q);
        const matchesProg = course.programName.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesProg) return false;
      }

      // 2. Programme Filter
      if (selectedProgram !== "All Programmes") {
        if (course.programName !== selectedProgram) return false;
      }

      // 3. Year Filter
      if (selectedYear !== "All Years") {
        const targetYear = parseInt(selectedYear, 10);
        if (course.year && course.year !== targetYear) return false;
        if (!course.year && !course.name.includes(selectedYear)) return false;
      }

      // 4. Season Filter
      if (selectedSeason !== "All Seasons") {
        if (course.season && course.season.toLowerCase() !== selectedSeason.toLowerCase()) {
          return false;
        }
        if (!course.season && !course.name.toLowerCase().includes(selectedSeason.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [courses, searchQuery, selectedProgram, selectedYear, selectedSeason]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedProgram !== "All Programmes" ||
    selectedSchool !== "All Schools" ||
    selectedYear !== "All Years" ||
    selectedSeason !== "All Seasons";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedProgram("All Programmes");
    setSelectedSchool("All Schools");
    setSelectedYear("All Years");
    setSelectedSeason("All Seasons");
  };

  // Build target link for a course, preserving school filter if active
  const getCourseHref = (course: DynamicCourse) => {
    const isExit = course.category === "exit";
    const base = `/dashboards/${course.panelSlug}/exams/${course.slug}/${course.id}`;
    const params = new URLSearchParams();

    if (isExit) {
      params.set("track", "exit");
    }
    if (selectedSchool && selectedSchool !== "All Schools") {
      params.set("school", selectedSchool);
    }

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-20" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-[#2FD9C4] text-xs font-mono font-bold tracking-widest uppercase mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Exam Curriculum</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy dark:text-white tracking-tight leading-tight mb-3.5">
            Explore All Nursing Courses
          </h1>

          <p className="text-sm sm:text-base text-navy/70 dark:text-white/70 leading-relaxed max-w-2xl mx-auto">
            Choose your course to access comprehensive question banks, realistic practice CATs, and verified Next-Gen rationales. Filter by program, school, academic year, and season.
          </p>

          {/* Quick Counter Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isLoading ? "..." : `${courses.length} Total Courses`}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>RN &amp; LPN Specializations</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs">
              <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{schools.length} Nursing Schools</span>
            </span>
          </div>
        </div>

        {/* Dynamic Filter Controls Bar */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] p-4 sm:p-5 shadow-sm mb-8 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input */}
            <div className="relative md:col-span-4 lg:col-span-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-navy dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Programme Dropdown */}
            <div className="relative md:col-span-3 lg:col-span-2.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "program" ? null : "program")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  selectedProgram !== "All Programmes"
                    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] border-teal-500/50"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">{selectedProgram}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "program" ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === "program" && (
                <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
                  {PROGRAM_OPTIONS.map((prog) => (
                    <button
                      key={prog}
                      type="button"
                      onClick={() => {
                        setSelectedProgram(prog);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        selectedProgram === prog
                          ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>{prog}</span>
                      {selectedProgram === prog && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter by School Dropdown */}
            <div className="relative md:col-span-3 lg:col-span-2.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "school" ? null : "school")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  selectedSchool !== "All Schools"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 border-blue-500/50"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <School className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{selectedSchool}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "school" ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === "school" && (
                <div className="absolute left-0 top-full mt-1.5 w-72 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchool("All Schools");
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      selectedSchool === "All Schools"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>All Schools</span>
                    {selectedSchool === "All Schools" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  {schools.map((sch) => (
                    <button
                      key={sch}
                      type="button"
                      onClick={() => {
                        setSelectedSchool(sch);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        selectedSchool === sch
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="truncate pr-2">{sch}</span>
                      {selectedSchool === sch && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter by Year Dropdown */}
            <div className="relative md:col-span-2 lg:col-span-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "year" ? null : "year")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  selectedYear !== "All Years"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-500/50"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">{selectedYear}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "year" ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === "year" && (
                <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear("All Years");
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      selectedYear === "All Years"
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>All Years</span>
                    {selectedYear === "All Years" && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  {dynamicYears.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setSelectedYear(String(yr));
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        selectedYear === String(yr)
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>{yr}</span>
                      {selectedYear === String(yr) && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter by Season Dropdown */}
            <div className="relative md:col-span-2 lg:col-span-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "season" ? null : "season")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  selectedSeason !== "All Seasons"
                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-500/50"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sun className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">{selectedSeason}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "season" ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === "season" && (
                <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSeason("All Seasons");
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      selectedSeason === "All Seasons"
                        ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span>All Seasons</span>
                    {selectedSeason === "All Seasons" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  {dynamicSeasons.map((seas) => (
                    <button
                      key={seas}
                      type="button"
                      onClick={() => {
                        setSelectedSeason(seas);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        selectedSeason === seas
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>{seas}</span>
                      {selectedSeason === seas && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters Action Button */}
            {hasActiveFilters && (
              <div className="md:col-span-12 lg:col-span-0.5 flex justify-end">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Clear all active filters"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Filter Tags Pill Row */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Active Filters:</span>
              {selectedProgram !== "All Programmes" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold">
                  Program: {selectedProgram}
                  <button onClick={() => setSelectedProgram("All Programmes")} className="hover:text-teal-900 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSchool !== "All Schools" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold">
                  School: {selectedSchool}
                  <button onClick={() => setSelectedSchool("All Schools")} className="hover:text-blue-900 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedYear !== "All Years" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold">
                  Year: {selectedYear}
                  <button onClick={() => setSelectedYear("All Years")} className="hover:text-amber-900 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSeason !== "All Seasons" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold">
                  Season: {selectedSeason}
                  <button onClick={() => setSelectedSeason("All Seasons")} className="hover:text-purple-900 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
                  Keyword: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")} className="hover:text-slate-900 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-5 px-1">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            Showing <strong className="text-navy dark:text-white font-bold">{filteredCourses.length}</strong> of{" "}
            {courses.length} courses
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center max-w-xl mx-auto space-y-3">
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              Retry Loading Courses
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCourses.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-10 sm:p-14 text-center max-w-xl mx-auto space-y-4">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-navy dark:text-white">No courses match your current filters</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Try resetting your programme, year, or season filters to explore the full curriculum.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0A2540] hover:bg-teal-700 text-white transition shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Show All Courses</span>
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {filteredCourses.map((course) => {
              const isLpn = course.panelSlug === "lpn-nursing";
              const href = getCourseHref(course);

              return (
                <div
                  key={`${course.panelSlug}-${course.id}`}
                  className="group relative rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] hover:border-teal-500/70 dark:hover:border-teal-400/60 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border ${
                          isLpn
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                        }`}
                      >
                        {course.programName}
                      </span>

                      {/* Year & Season Pill */}
                      {(course.year || course.season) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shrink-0">
                          {course.season && <span>{course.season}</span>}
                          {course.year && <span>{course.year}</span>}
                        </span>
                      )}
                    </div>

                    {/* Course Title */}
                    <h2 className="font-serif text-base sm:text-lg md:text-[1.15rem] font-bold text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors leading-snug line-clamp-2 mb-2">
                      {course.name}
                    </h2>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {course.description}
                    </p>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{course.subjectsCount} Subjects</span>
                    </span>

                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0A2540] hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-2xs group-hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>Start Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
