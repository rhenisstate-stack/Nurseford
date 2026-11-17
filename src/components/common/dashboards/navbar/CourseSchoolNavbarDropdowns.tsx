"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNursingSchools } from "@/lib/data/nursingSchools";
import { useCoursesFilter } from "@/lib/contexts/courses/CoursesFilterContext";
import {
  GraduationCap,
  School,
  Calendar,
  Sun,
  ChevronDown,
  Check,
  Search,
  X,
  Filter,
  RefreshCw,
  CreditCard,
} from "lucide-react";

export function CourseSchoolNavbarDropdowns() {
  const pathname = usePathname();

  // Extract panel from pathname: /dashboards/[panelSlug]/...
  const panelSlug = useMemo(() => {
    const match = pathname?.match(/\/dashboards\/([^/]+)/);
    return match ? match[1] : "rn-nursing";
  }, [pathname]);

  const {
    selectedProgram,
    setSelectedProgram,
    selectedSchool,
    setSelectedSchool,
    selectedYear,
    setSelectedYear,
    selectedSeason,
    setSelectedSeason,
    clearAllFilters,
    hasActiveFilters,
    dynamicPrograms,
    dynamicYears,
    dynamicSeasons,
  } = useCoursesFilter();

  const { schools } = useNursingSchools(panelSlug);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [schoolSearch, setSchoolSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or ESC
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const availableProgramOptions = useMemo(() => {
    return Array.from(new Set(["All Programmes", ...dynamicPrograms]));
  }, [dynamicPrograms]);

  const isDashboardPage = Boolean(pathname?.includes("/dashboards/"));

  const detectedDashboardProgram = useMemo(() => {
    if (!pathname) return null;
    const isExit =
      pathname.includes("exit") ||
      (typeof window !== "undefined" && window.location.search.includes("track=exit"));
    if (panelSlug === "lpn-nursing") {
      return isExit ? "LPN Exit Exams" : "LPN Nursing Exams";
    }
    if (panelSlug === "rn-nursing") {
      return isExit ? "RN Exit Exams" : "RN Nursing Exams";
    }
    if (panelSlug === "hesi-a2") return "HESI A2";
    if (panelSlug === "ati-teas") return "ATI TEAS";
    if (panelSlug === "nclex-rn") return "NCLEX RN";
    if (panelSlug === "nclex-pn") return "NCLEX PN";
    return null;
  }, [pathname, panelSlug]);

  const activeProgramLabel = useMemo(() => {
    if (selectedProgram && selectedProgram !== "All Programmes") {
      return selectedProgram;
    }
    if (isDashboardPage && detectedDashboardProgram) {
      return detectedDashboardProgram;
    }
    return "All";
  }, [selectedProgram, isDashboardPage, detectedDashboardProgram]);

  const isProgramOptionSelected = (prog: string) => {
    if (selectedProgram && selectedProgram !== "All Programmes") {
      return selectedProgram === prog;
    }
    if (isDashboardPage && detectedDashboardProgram) {
      return detectedDashboardProgram === prog;
    }
    return prog === "All Programmes";
  };

  const getProgramHref = (prog: string) => {
    const params = new URLSearchParams();
    if (prog !== "All Programmes") {
      params.set("program", prog);
    }
    if (selectedSchool && selectedSchool !== "All Schools" && selectedSchool !== "all") {
      params.set("school", selectedSchool);
    }
    if (selectedYear && selectedYear !== "All Years" && selectedYear !== "all") {
      params.set("year", selectedYear);
    }
    if (selectedSeason && selectedSeason !== "All Seasons" && selectedSeason !== "all") {
      params.set("season", selectedSeason);
    }
    const qs = params.toString();
    return qs ? `/courses?${qs}` : "/courses";
  };

  const filteredSchools = useMemo(() => {
    if (!schoolSearch.trim()) return schools;
    const q = schoolSearch.toLowerCase();
    return schools.filter((s) => s.toLowerCase().includes(q));
  }, [schools, schoolSearch]);

  const handleSelectSchool = (school: string) => {
    const val = school === "all" ? "All Schools" : school;
    setSelectedSchool(val);
    setOpenMenu(null);
    setSchoolSearch("");
  };

  const handleSelectYear = (yr: string) => {
    const val = yr === "all" ? "All Years" : yr;
    setSelectedYear(val);
    setOpenMenu(null);
  };

  const handleSelectSeason = (sn: string) => {
    const val = sn === "all" ? "All Seasons" : sn;
    setSelectedSeason(val);
    setOpenMenu(null);
  };

  const isSchoolActive = selectedSchool !== "All Schools" && selectedSchool !== "all";
  const isYearActive = selectedYear !== "All Years" && selectedYear !== "all";
  const isSeasonActive = selectedSeason !== "All Seasons" && selectedSeason !== "all";
  const isProgramActive =
    (selectedProgram && selectedProgram !== "All Programmes") ||
    (isDashboardPage && Boolean(detectedDashboardProgram));

  return (
    <div ref={containerRef} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {/* ─── 1. PROGRAMME FILTER ─── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("program")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            isProgramActive
              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] border-teal-500/60 ring-2 ring-teal-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={`Programme: ${activeProgramLabel}`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
          <span className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 hidden sm:inline">
            Programme:
          </span>
          <span className="font-normal text-slate-600 dark:text-slate-300 truncate max-w-[70px] sm:max-w-[90px] md:max-w-[120px]">
            {activeProgramLabel}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${
              openMenu === "program" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openMenu === "program" && (
          <div className="absolute left-0 top-full mt-1.5 w-56 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Filter by Programme
            </div>
            {availableProgramOptions.map((prog) => (
              <Link
                key={prog}
                href={getProgramHref(prog)}
                onClick={() => {
                  setSelectedProgram(prog);
                  setOpenMenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  isProgramOptionSelected(prog)
                    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <span className="truncate">{prog}</span>
                {isProgramOptionSelected(prog) && (
                  <Check className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── 2. SCHOOL FILTER ─── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("school")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            isSchoolActive
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 border-blue-500/60 ring-2 ring-blue-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={`School: ${selectedSchool}`}
        >
          <School className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
          <span className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 hidden sm:inline">
            School:
          </span>
          <span className="font-normal text-slate-600 dark:text-slate-300 truncate max-w-[65px] sm:max-w-[85px] md:max-w-[110px]">
            {isSchoolActive ? selectedSchool : "All"}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${
              openMenu === "school" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openMenu === "school" && (
          <div className="fixed inset-x-3 top-[60px] sm:absolute sm:inset-x-auto sm:left-0 sm:top-full mt-1.5 sm:w-80 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700/90 shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Filter by School
                </span>
                <span className="text-[10px] font-medium text-blue-600 dark:text-sky-400">
                  {schools.length} Available
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search nursing school..."
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                {schoolSearch && (
                  <button
                    onClick={() => setSchoolSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto p-1.5 space-y-0.5">
              <button
                type="button"
                onClick={() => handleSelectSchool("all")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  !isSchoolActive
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>All Schools</span>
                </div>
                {!isSchoolActive && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                )}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              {filteredSchools.map((sch) => (
                <button
                  key={sch}
                  type="button"
                  onClick={() => handleSelectSchool(sch)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    selectedSchool === sch
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span className="truncate pr-2">{sch}</span>
                  {selectedSchool === sch && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. YEAR FILTER ─── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("year")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            isYearActive
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-500/60 ring-2 ring-amber-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={`Year: ${selectedYear}`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 hidden md:inline">
            Year:
          </span>
          <span className="font-normal text-slate-600 dark:text-slate-300">
            {isYearActive ? selectedYear : "All"}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${
              openMenu === "year" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openMenu === "year" && (
          <div className="absolute left-0 top-full mt-1.5 w-40 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Academic Year
            </div>
            <button
              type="button"
              onClick={() => handleSelectYear("all")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                !isYearActive
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>All Years</span>
              {!isYearActive && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
            </button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            {dynamicYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => handleSelectYear(String(yr))}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  selectedYear === String(yr)
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <span>{yr}</span>
                {selectedYear === String(yr) && (
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. SEASON FILTER ─── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("season")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            isSeasonActive
              ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-500/60 ring-2 ring-purple-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={`Season: ${selectedSeason}`}
        >
          <Sun className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 hidden md:inline">
            Season:
          </span>
          <span className="font-normal text-slate-600 dark:text-slate-300">
            {isSeasonActive ? selectedSeason : "All"}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${
              openMenu === "season" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openMenu === "season" && (
          <div className="absolute left-0 top-full mt-1.5 w-40 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Exam Season
            </div>
            <button
              type="button"
              onClick={() => handleSelectSeason("all")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                !isSeasonActive
                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>All Seasons</span>
              {!isSeasonActive && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
            </button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            {dynamicSeasons.map((seas) => (
              <button
                key={seas}
                type="button"
                onClick={() => handleSelectSeason(seas)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  selectedSeason === seas
                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <span>{seas}</span>
                {selectedSeason === seas && (
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── 5. RESET BUTTON ─── */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      )}

      {/* ─── 6. SUBSCRIBE PLANS BUTTON ─── */}
      <Link
        href={`/dashboards/${panelSlug}/vista/subscriptions/items`}
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold
          bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-700 hover:to-emerald-700
          text-white shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 whitespace-nowrap cursor-pointer select-none shrink-0"
        title="View Subscription Plans"
      >
        <CreditCard className="w-3.5 h-3.5 text-white/90 shrink-0" />
        <span className="font-semibold text-white text-[11px] sm:text-xs">Subscribe</span>
        <span className="hidden md:inline font-normal text-white/90">Plans</span>
      </Link>
    </div>
  );
}
export default CourseSchoolNavbarDropdowns;
