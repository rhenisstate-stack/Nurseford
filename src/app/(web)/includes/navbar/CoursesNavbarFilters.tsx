"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  School,
  Calendar,
  Sun,
  RefreshCw,
} from "lucide-react";
import { useCoursesFilter } from "@/lib/contexts/courses/CoursesFilterContext";
import { useNursingSchools } from "@/lib/data/nursingSchools";
import { formatCourseDropdownName, compareCourses } from "@/lib/utils/exams/formatCourseDropdownName";
import {
  CANONICAL_PROGRAM_ORDER,
  getProgramRank,
  formatProgramDropdownName,
} from "@/lib/utils/exams/formatProgramDropdownName";

interface CoursesNavbarFiltersProps {
  activeTrack?: "rn" | "lpn" | "all";
  hideCourse?: boolean;
  hideSchool?: boolean;
  hideYear?: boolean;
  hideSeason?: boolean;
}

export default function CoursesNavbarFilters({
  activeTrack,
  hideCourse = false,
  hideSchool = false,
  hideYear = false,
  hideSeason = false,
}: CoursesNavbarFiltersProps = {}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const trackParam = searchParams?.get("track");

  const {
    selectedProgram,
    setSelectedProgram,
    selectedSchool,
    setSelectedSchool,
    selectedCourse,
    setSelectedCourse,
    selectedYear,
    setSelectedYear,
    selectedSeason,
    setSelectedSeason,
    clearAllFilters,
    dynamicPrograms,
    dynamicCourses,
    dynamicYears,
    dynamicSeasons,
  } = useCoursesFilter();

  // Determine current effective track (RN, LPN, or All)
  const effectiveTrack: "rn" | "lpn" | "all" = useMemo(() => {
    if (activeTrack) return activeTrack;
    if (trackParam === "lpn") return "lpn";
    if (trackParam === "all" || trackParam === "both") return "all";
    if (trackParam === "rn") return "rn";
    if (selectedProgram && selectedProgram !== "All Programmes" && selectedProgram !== "all") {
      if (/lpn|pn/i.test(selectedProgram)) return "lpn";
      if (/rn/i.test(selectedProgram)) return "rn";
    }
    if (pathname?.includes("/subjects")) return "rn";
    return "all";
  }, [activeTrack, trackParam, selectedProgram, pathname]);

  const { schools } = useNursingSchools();

  const availableProgramOptions = useMemo(() => {
    const set = new Set<string>();
    CANONICAL_PROGRAM_ORDER.forEach((p) => set.add(p));

    if (Array.isArray(dynamicPrograms)) {
      dynamicPrograms.forEach((p) => {
        if (p && p !== "All Programmes") {
          set.add(formatProgramDropdownName(p));
        }
      });
    }

    const sorted = Array.from(set).sort((a, b) => {
      const rankA = getProgramRank(a);
      const rankB = getProgramRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return a.localeCompare(b);
    });

    return ["All Programmes", ...sorted];
  }, [dynamicPrograms]);

  const selectedProgramDisplay = useMemo(() => {
    if (!selectedProgram || selectedProgram === "All Programmes" || selectedProgram === "all") {
      return "All Programmes";
    }
    return formatProgramDropdownName(selectedProgram);
  }, [selectedProgram]);

  // Dynamically filter course options based on the active track (RN vs LPN vs All)
  const availableCourses = useMemo(() => {
    const list = Array.isArray(dynamicCourses) ? dynamicCourses : [];

    const isRnCourse = (c: string) => {
      const norm = formatCourseDropdownName(c).toLowerCase().trim();
      if (/lpn|pn\b/i.test(norm) || /kap-?lan/i.test(norm)) return false;
      return /rn\b/i.test(norm) || /general/i.test(norm);
    };

    const isLpnCourse = (c: string) => {
      const norm = formatCourseDropdownName(c).toLowerCase().trim();
      if (/rn\b/i.test(norm) && !/lpn|pn\b/i.test(norm)) return false;
      return /lpn|pn\b/i.test(norm) || /kap-?lan/i.test(norm);
    };

    const filtered = list.filter((course) => {
      if (effectiveTrack === "rn") {
        return isRnCourse(course);
      }
      if (effectiveTrack === "lpn") {
        return isLpnCourse(course);
      }
      return true;
    });

    const sorted = [...new Set(filtered)].sort((a, b) => compareCourses(a, b));

    return ["All Courses", ...sorted];
  }, [dynamicCourses, effectiveTrack]);

  const selectedCourseDisplay = useMemo(() => {
    if (!selectedCourse || selectedCourse === "All Courses" || selectedCourse === "all") {
      return "All Courses";
    }
    const match = availableCourses.find(
      (c) =>
        c === selectedCourse ||
        formatCourseDropdownName(c).toLowerCase().trim() === formatCourseDropdownName(selectedCourse).toLowerCase().trim()
    );
    return match || "All Courses";
  }, [selectedCourse, availableCourses]);

  // Safely reset selectedCourse if it does not belong to the newly active track's available courses
  useEffect(() => {
    if (!selectedCourse || selectedCourse === "All Courses" || selectedCourse === "all") return;
    const isPresent = availableCourses.some(
      (c) =>
        c !== "All Courses" &&
        (c === selectedCourse ||
          formatCourseDropdownName(c).toLowerCase().trim() === formatCourseDropdownName(selectedCourse).toLowerCase().trim())
    );
    if (!isPresent && availableCourses.length > 1) {
      setSelectedCourse("All Courses");
    }
  }, [availableCourses, selectedCourse, setSelectedCourse]);

  const availableSchools = useMemo(() => {
    const list = Array.isArray(schools) ? schools : [];
    return Array.from(new Set(["All Schools", ...list]));
  }, [schools]);

  const availableYears = useMemo(() => {
    const list = Array.isArray(dynamicYears) ? dynamicYears : [];
    return Array.from(new Set(["All Years", ...list.map(String)]));
  }, [dynamicYears]);

  const availableSeasons = useMemo(() => {
    const list = Array.isArray(dynamicSeasons) ? dynamicSeasons : [];
    return Array.from(new Set(["All Seasons", ...list]));
  }, [dynamicSeasons]);

  const isProgramActive = !!selectedProgram && selectedProgram !== "All Programmes" && selectedProgram !== "all";
  const isCourseActive = !!selectedCourse && selectedCourse !== "All Courses" && selectedCourse !== "all";
  const isSchoolActive = !!selectedSchool && selectedSchool !== "All Schools" && selectedSchool !== "all";
  const isYearActive = !!selectedYear && selectedYear !== "All Years" && selectedYear !== "all";
  const isSeasonActive = !!selectedSeason && selectedSeason !== "All Seasons" && selectedSeason !== "all";

  const hasAnyActiveFilter =
    isProgramActive ||
    (!hideCourse && isCourseActive) ||
    (!hideSchool && isSchoolActive) ||
    (!hideYear && isYearActive) ||
    (!hideSeason && isSeasonActive);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      
      {/* 1. Programme Filter */}
      <div className="relative inline-flex items-center">
        <GraduationCap
          className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
            isProgramActive ? "text-teal-600 dark:text-[#2FD9C4]" : "text-slate-400"
          }`}
        />
        <select
          value={selectedProgramDisplay}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className={`pl-8 pr-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer appearance-none focus:outline-none max-w-[130px] sm:max-w-[160px] truncate ${
            isProgramActive
              ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] border-teal-500/60 ring-2 ring-teal-500/20"
              : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
          }`}
          title={isProgramActive ? `Program: ${selectedProgram}` : "Programme"}
        >
          <option value="All Programmes" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            Programme
          </option>
          {availableProgramOptions
            .filter((p) => p !== "All Programmes")
            .map((prog) => (
              <option key={prog} value={prog} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {prog}
              </option>
            ))}
        </select>
      </div>

      {/* 2. Course Filter */}
      {!hideCourse && (
        <div className="relative inline-flex items-center">
          <BookOpen
            className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
              isCourseActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
            }`}
          />
          <select
            value={selectedCourseDisplay}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className={`pl-8 pr-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer appearance-none focus:outline-none max-w-[120px] sm:max-w-[160px] truncate ${
              isCourseActive
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-500/60 ring-2 ring-indigo-500/20"
                : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
            title={isCourseActive ? `Course: ${formatCourseDropdownName(selectedCourse)}` : "Course"}
          >
            <option value="All Courses" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              Course
            </option>
            {availableCourses
              .filter((c) => c !== "All Courses")
              .map((crs) => (
                <option key={crs} value={crs} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {formatCourseDropdownName(crs)}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* 3. School Filter */}
      {!hideSchool && (
        <div className="relative inline-flex items-center">
          <School
            className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
              isSchoolActive ? "text-blue-600 dark:text-sky-400" : "text-slate-400"
            }`}
          />
          <select
            value={selectedSchool || "All Schools"}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className={`pl-8 pr-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer appearance-none focus:outline-none max-w-[120px] sm:max-w-[150px] truncate ${
              isSchoolActive
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 border-blue-500/60 ring-2 ring-blue-500/20"
                : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
            title={isSchoolActive ? `School: ${selectedSchool}` : "School"}
          >
            <option value="All Schools" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              School
            </option>
            {availableSchools
              .filter((s) => s !== "All Schools")
              .map((sch) => (
                <option key={sch} value={sch} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {sch}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* 4. Year Filter */}
      {!hideYear && (
        <div className="relative inline-flex items-center">
          <Calendar
            className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
              isYearActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
            }`}
          />
          <select
            value={selectedYear || "All Years"}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`pl-8 pr-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer appearance-none focus:outline-none max-w-[100px] sm:max-w-[120px] truncate ${
              isYearActive
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-500/60 ring-2 ring-amber-500/20"
                : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
            title={isYearActive ? `Year: ${selectedYear}` : "Year"}
          >
            <option value="All Years" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              Year
            </option>
            {availableYears
              .filter((y) => y !== "All Years")
              .map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {yr}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* 5. Season Filter */}
      {!hideSeason && (
        <div className="relative inline-flex items-center">
          <Sun
            className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
              isSeasonActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400"
            }`}
          />
          <select
            value={selectedSeason || "All Seasons"}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className={`pl-8 pr-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer appearance-none focus:outline-none max-w-[110px] sm:max-w-[130px] truncate ${
              isSeasonActive
                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-500/60 ring-2 ring-purple-500/20"
                : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300"
            }`}
            title={isSeasonActive ? `Season: ${selectedSeason}` : "Season"}
          >
            <option value="All Seasons" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              Season
            </option>
            {availableSeasons
              .filter((s) => s !== "All Seasons")
              .map((seas) => (
                <option key={seas} value={seas} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {seas}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* 6. Reset Filter Button */}
      {hasAnyActiveFilter && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
