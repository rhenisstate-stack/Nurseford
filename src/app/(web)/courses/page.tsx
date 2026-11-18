"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toSlug } from "@/lib/data/exam-subjects";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";
import { resolveExamSchool } from "@/lib/utils/exams/resolveExamSchool";
import { isAllowedNursingCourse } from "@/lib/utils/exams/nursingProgramScope";
import { useCoursesFilter } from "@/lib/contexts/courses/CoursesFilterContext";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { setAvailableSchools } from "@/lib/data/nursingSchools";
import CoursesNavbarFilters from "@/app/(web)/includes/navbar/CoursesNavbarFilters";
import CoursesLeftSidebar from "@/app/(web)/includes/sidebar/CoursesLeftSidebar";

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
  school?: string;
  subjectsCount?: number;
}

interface RawCoursePayload {
  id?: number | string;
  guidId?: string;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  details?: string;
  slug?: string;
  panelHint?: string;
  segment?: string;
  programName?: string;
  schoolName?: string;
  school?: string;
  institution?: string;
  institutionName?: string;
  year?: number;
  season?: string;
  createdAt?: string;
  coursesCount?: number;
  subjectsCount?: number;
}

export default function CoursesPage() {
  const { isOpened: isSidebarOpened } = useLeftSidebar();

  const {
    searchQuery,
    selectedProgram,
    selectedSchool,
    selectedYear,
    selectedSeason,
    clearAllFilters,
    setDynamicPrograms,
    setDynamicYears,
    setDynamicSeasons,
    setTotalCoursesCount,
    setFilteredCount,
  } = useCoursesFilter();

  const [courses, setCourses] = useState<DynamicCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Clear any legacy sessionStorage cache so courses are always 100% dynamic
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("nurseford_cached_courses");
      } catch {}
    }
  }, []);

  // Fetch courses dynamically from endpoints with timeout & caching
  useEffect(() => {
    isMountedRef.current = true;

    async function loadAllCourses() {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const rawList: RawCoursePayload[] = [];

        // Primary: fetch master courses catalog directly
        try {
          const strataRes = await fetch(
            "/api/nexus/strata/learning/course?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200",
            { cache: "no-store", signal: controller.signal }
          );
          if (strataRes.ok) {
            const strataData = (await strataRes.json().catch(() => ({}))) as {
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
        } catch (e) {
          console.warn("[CoursesPage] Master courses fetch failed, trying dashboard endpoints:", e);
        }

        // Secondary fallback if master catalog returned empty
        if (rawList.length === 0) {
          const [rnRes, lpnRes] = await Promise.allSettled([
            fetch("/api/exams/rn-nursing/subjects", { cache: "no-store", signal: controller.signal }),
            fetch("/api/exams/lpn-nursing/subjects", { cache: "no-store", signal: controller.signal }),
          ]);

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
        }

        clearTimeout(timeoutId);

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

          // Map strictly to the discussed RN and LPN nursing programs
          const programName = isLpn
            ? isExit
              ? "LPN Exit Exams"
              : "LPN Nursing Exams"
            : isExit
            ? "RN Exit Exams"
            : "RN Nursing Exams";

          const year = extractExamYear(name, undefined, item.year, item.createdAt);
          const season = resolveExamSeason(item.season, name, item.description);
          const rawSchool = (item.schoolName || item.school || item.institution || item.institutionName || "").trim();
          const school =
            rawSchool ||
            resolveExamSchool({
              title: name,
              description: item.description,
              school: item.school,
              schoolName: item.schoolName,
              institution: item.institution,
              institutionName: item.institutionName,
            }) ||
            undefined;

          normalized.push({
            id,
            guidId: item.guidId,
            name,
            description: (item.description || item.summary || item.details || "").trim(),
            slug,
            programName,
            category: isExit ? "exit" : "core",
            panelSlug,
            year,
            season,
            school,
            subjectsCount:
              typeof item.subjectsCount === "number" && item.subjectsCount > 0
                ? item.subjectsCount
                : undefined,
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

        // Compute available programs, years, seasons, and schools strictly from backend courses data
        const programsSet = new Set<string>();
        const yearsSet = new Set<number>();
        const seasonsSet = new Set<string>();
        const schoolsSet = new Set<string>();

        normalized.forEach((c) => {
          if (c.programName) programsSet.add(c.programName);
          if (c.year) yearsSet.add(c.year);
          if (c.season) seasonsSet.add(c.season);
          if (c.school) schoolsSet.add(c.school);
        });

        setDynamicPrograms(Array.from(programsSet).sort((a, b) => a.localeCompare(b)));
        setDynamicYears(Array.from(yearsSet).sort((a, b) => b - a));
        setDynamicSeasons(Array.from(seasonsSet).sort((a, b) => a.localeCompare(b)));
        if (schoolsSet.size > 0) {
          setAvailableSchools(Array.from(schoolsSet).sort((a, b) => a.localeCompare(b)));
        }

        if (isMountedRef.current) {
          if (normalized.length > 0) {
            setCourses(normalized);
            setTotalCoursesCount(normalized.length);
          } else {
            setError("No courses are currently available from the server.");
          }
        }
      } catch (err: unknown) {
        console.error("[CoursesPage] Error loading dynamic courses:", err);
        if (isMountedRef.current) {
          setError("Failed to load courses. Please check your connection and try again.");
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    loadAllCourses();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter courses based on active filters
  const filteredCourses = useMemo(() => {
    const list = Array.isArray(courses) ? courses : [];
    return list.filter((course) => {
      if (!course) return false;

      // 1. Search Query
      const q = (searchQuery || "").trim().toLowerCase();
      if (q) {
        const matchesName = (course.name || "").toLowerCase().includes(q);
        const matchesDesc = (course.description || "").toLowerCase().includes(q);
        const matchesProg = (course.programName || "").toLowerCase().includes(q);
        const matchesSchool = (course.school || "").toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesProg && !matchesSchool) return false;
      }

      // 2. Programme Filter
      if (selectedProgram && selectedProgram !== "All Programmes") {
        if ((course.programName || "").trim().toLowerCase() !== selectedProgram.trim().toLowerCase()) {
          return false;
        }
      }

      // 3. School Filter
      if (selectedSchool && selectedSchool !== "All Schools") {
        if (course.school && course.school.toLowerCase() !== selectedSchool.toLowerCase()) {
          return false;
        }
      }

      // 4. Year Filter
      if (selectedYear && selectedYear !== "All Years") {
        const targetYear = parseInt(selectedYear, 10);
        if (course.year && course.year !== targetYear) return false;
        if (!course.year && !String(course.name || "").includes(selectedYear)) return false;
      }

      // 5. Season Filter
      if (selectedSeason && selectedSeason !== "All Seasons") {
        if (course.season && course.season.toLowerCase() !== selectedSeason.toLowerCase()) {
          return false;
        }
        if (!course.season && !String(course.name || "").toLowerCase().includes(selectedSeason.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [courses, searchQuery, selectedProgram, selectedSchool, selectedYear, selectedSeason]);

  // Sync filtered count back to context
  useEffect(() => {
    setFilteredCount(filteredCourses.length);
  }, [filteredCourses.length, setFilteredCount]);

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
    <>
      <CoursesLeftSidebar />

      <div
        className={`min-h-screen pt-18 sm:pt-20 pb-16 transition-all duration-300 ease-in-out ${
          isSidebarOpened ? "lg:pl-64" : "pl-0"
        }`}
        style={{ backgroundColor: "var(--content-bg)" }}
      >
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-[#2FD9C4] text-[11px] font-mono font-bold tracking-wider uppercase mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Exam Curriculum</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-navy dark:text-white tracking-tight leading-tight">
            Explore All Nursing Courses
          </h1>
        </div>

        {/* Mobile Filter Bar - Visible on screens below lg where navbar filters are hidden in hamburger */}
        <div className="lg:hidden mb-6 p-2 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            Filter Curriculum:
          </div>
          <div className="overflow-x-auto pb-1">
            <CoursesNavbarFilters />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-3.5 sm:p-4 shadow-2xs animate-pulse space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-md" />
                </div>
                <div className="h-4.5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4">
            {filteredCourses.map((course) => {
              const isLpn = course.panelSlug === "lpn-nursing";
              const href = getCourseHref(course);

              return (
                <div
                  key={`${course.panelSlug}-${course.id}`}
                  className="group relative rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] hover:border-teal-500/70 dark:hover:border-teal-400/60 p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${
                          isLpn
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                        }`}
                      >
                        {course.programName}
                      </span>

                      {/* Year & Season Pill */}
                      {(course.year || course.season) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shrink-0">
                          {course.season && <span>{course.season}</span>}
                          {course.year && <span>{course.year}</span>}
                        </span>
                      )}
                    </div>

                    {/* Course Title */}
                    <h2 className="font-serif text-sm sm:text-[15px] font-bold text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors leading-snug line-clamp-1 mb-1">
                      {course.name}
                    </h2>

                    {/* Description (rendered only when provided by backend) */}
                    {course.description ? (
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                        {course.description}
                      </p>
                    ) : null}
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#0A2540] hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-2xs group-hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
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
    </>
  );
}
