"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { useCoursesFilter } from "@/lib/contexts/courses/CoursesFilterContext";
import { useNursingSchools } from "@/lib/data/nursingSchools";

export default function CoursesNavbarFilters() {
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

  const { schools } = useNursingSchools();
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
    return Array.from(new Set(["All Programmes", ...(dynamicPrograms || [])]));
  }, [dynamicPrograms]);

  const filteredSchools = useMemo(() => {
    const list = Array.isArray(schools) ? schools : [];
    if (!schoolSearch.trim()) return list;
    const q = schoolSearch.toLowerCase();
    return list.filter((s) => typeof s === "string" && s.toLowerCase().includes(q));
  }, [schools, schoolSearch]);

  const formatProgramDisplay = (name: string) => {
    if (!name || name === "All Programmes" || name === "all") return "Program";
    return name.replace(/\s+Exams$/i, "");
  };

  const isProgramActive = selectedProgram && selectedProgram !== "All Programmes" && selectedProgram !== "all";
  const isSchoolActive = selectedSchool && selectedSchool !== "All Schools" && selectedSchool !== "all";
  const isYearActive = selectedYear && selectedYear !== "All Years" && selectedYear !== "all";
  const isSeasonActive = selectedSeason && selectedSeason !== "All Seasons" && selectedSeason !== "all";

  return (
    <div ref={containerRef} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      
      {/* 1. Programme Filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("program")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            isProgramActive
              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] border-teal-500/60 ring-2 ring-teal-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={isProgramActive ? `Program: ${selectedProgram}` : "Filter by Program"}
        >
          <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[85px] sm:max-w-[110px] md:max-w-[140px]">
            {isProgramActive ? formatProgramDisplay(selectedProgram) : "Program"}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openMenu === "program" ? "rotate-180" : ""}`} />
        </button>

        {openMenu === "program" && (
          <div className="absolute left-0 top-full mt-1.5 w-56 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Filter by Programme
            </div>
            {availableProgramOptions.map((prog) => (
              <button
                key={prog}
                type="button"
                onClick={() => {
                  setSelectedProgram(prog);
                  setOpenMenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  selectedProgram === prog
                    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <span className="truncate">{prog}</span>
                {selectedProgram === prog && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. School Filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("school")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            selectedSchool !== "All Schools"
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 border-blue-500/60 ring-2 ring-blue-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={selectedSchool !== "All Schools" ? `School: ${selectedSchool}` : "Filter by School"}
        >
          <School className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[75px] sm:max-w-[100px] md:max-w-[130px]">
            {selectedSchool !== "All Schools" ? selectedSchool : "School"}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openMenu === "school" ? "rotate-180" : ""}`} />
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
                onClick={() => {
                  setSelectedSchool("All Schools");
                  setOpenMenu(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  selectedSchool === "All Schools"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>All Schools</span>
                </div>
                {selectedSchool === "All Schools" && <Check className="w-4 h-4 text-blue-600 dark:text-sky-400" />}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              {filteredSchools.map((sch) => (
                <button
                  key={sch}
                  type="button"
                  onClick={() => {
                    setSelectedSchool(sch);
                    setOpenMenu(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    selectedSchool === sch
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span className="truncate pr-2">{sch}</span>
                  {selectedSchool === sch && <Check className="w-4 h-4 text-blue-600 dark:text-sky-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Year Filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("year")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            selectedYear !== "All Years"
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-500/60 ring-2 ring-amber-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={selectedYear !== "All Years" ? `Year: ${selectedYear}` : "Filter by Year"}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {selectedYear !== "All Years" ? selectedYear : "Year"}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openMenu === "year" ? "rotate-180" : ""}`} />
        </button>

        {openMenu === "year" && (
          <div className="absolute left-0 top-full mt-1.5 w-40 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Academic Year
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedYear("All Years");
                setOpenMenu(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                selectedYear === "All Years"
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>All Years</span>
              {selectedYear === "All Years" && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            {(dynamicYears || []).map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  setSelectedYear(String(yr));
                  setOpenMenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
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

      {/* 4. Season Filter */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu("season")}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer select-none ${
            selectedSeason !== "All Seasons"
              ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-500/60 ring-2 ring-purple-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={selectedSeason !== "All Seasons" ? `Season: ${selectedSeason}` : "Filter by Season"}
        >
          <Sun className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {selectedSeason !== "All Seasons" ? selectedSeason : "Season"}
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openMenu === "season" ? "rotate-180" : ""}`} />
        </button>

        {openMenu === "season" && (
          <div className="absolute left-0 top-full mt-1.5 w-40 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Exam Season
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedSeason("All Seasons");
                setOpenMenu(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                selectedSeason === "All Seasons"
                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>All Seasons</span>
              {selectedSeason === "All Seasons" && <Check className="w-3.5 h-3.5 text-purple-600" />}
            </button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            {(dynamicSeasons || []).map((seas) => (
              <button
                key={seas}
                type="button"
                onClick={() => {
                  setSelectedSeason(seas);
                  setOpenMenu(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
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

      {/* 5. Reset Action */}
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
    </div>
  );
}
