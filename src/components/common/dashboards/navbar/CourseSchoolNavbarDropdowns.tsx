"use client";

import { useState, useRef, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePanelCourses, type PanelCourse } from "@/lib/data/panelCourses";
import { useNursingSchools } from "@/lib/data/nursingSchools";
import {
  BookOpen,
  School,
  ChevronDown,
  Check,
  Search,
  X,
  Filter,
  CreditCard,
} from "lucide-react";

export function CourseSchoolNavbarDropdowns() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Extract panel from pathname: /dashboards/[panelSlug]/...
  const panelSlug = useMemo(() => {
    const match = pathname?.match(/\/dashboards\/([^/]+)/);
    return match ? match[1] : "rn-nursing";
  }, [pathname]);

  // Extract course from pathname: /dashboards/[panel]/exams/[courseSlug]/[courseId]
  const currentPathCourseMatch = useMemo(() => {
    const match = pathname?.match(/\/dashboards\/[^/]+\/exams\/([^/]+)\/([^/]+)/);
    if (match) {
      return { slug: match[1], id: match[2] };
    }
    return null;
  }, [pathname]);

  const { courses, isLoading: coursesLoading } = usePanelCourses(panelSlug);
  const { schools } = useNursingSchools(panelSlug);

  // Active Course
  const activeCourse = useMemo(() => {
    if (currentPathCourseMatch) {
      const found = courses.find(
        (c) =>
          String(c.id) === currentPathCourseMatch.id ||
          c.slug === currentPathCourseMatch.slug
      );
      if (found) return found;
    }
    return courses[0] || null;
  }, [courses, currentPathCourseMatch]);

  // Active School
  const currentSchoolParam = searchParams?.get("school") || "all";
  const [selectedSchool, setSelectedSchool] = useState<string>(currentSchoolParam);

  useEffect(() => {
    setSelectedSchool(searchParams?.get("school") || "all");
  }, [searchParams]);

  useEffect(() => {
    const handleSchoolChange = (e: Event) => {
      const custom = e as CustomEvent<{ school: string }>;
      if (custom.detail?.school) {
        setSelectedSchool(custom.detail.school);
      }
    };
    window.addEventListener("nurseford-school-change", handleSchoolChange);
    return () => window.removeEventListener("nurseford-school-change", handleSchoolChange);
  }, []);

  // Dropdown open states
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);

  // Search filter inside dropdowns
  const [courseSearch, setCourseSearch] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");

  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close & ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCourseOpen(false);
      }
      if (
        schoolDropdownRef.current &&
        !schoolDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSchoolOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCourseOpen(false);
        setIsSchoolOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courses;
    const q = courseSearch.toLowerCase();
    return courses.filter((c) => c.name.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    if (!schoolSearch.trim()) return schools;
    const q = schoolSearch.toLowerCase();
    return schools.filter((s) => s.toLowerCase().includes(q));
  }, [schools, schoolSearch]);

  // Course selection handler
  const handleSelectCourse = (course: PanelCourse) => {
    setIsCourseOpen(false);
    setCourseSearch("");

    const targetUrl = new URL(
      `/dashboards/${panelSlug}/exams/${course.slug}/${course.id}`,
      window.location.origin
    );
    if (selectedSchool && selectedSchool !== "all") {
      targetUrl.searchParams.set("school", selectedSchool);
    }
    startTransition(() => {
      router.push(targetUrl.pathname + targetUrl.search);
    });
  };

  // School selection handler
  const handleSelectSchool = (school: string) => {
    setIsSchoolOpen(false);
    setSchoolSearch("");
    setSelectedSchool(school);

    const currentUrl = new URL(window.location.href);
    if (school === "all") {
      currentUrl.searchParams.delete("school");
    } else {
      currentUrl.searchParams.set("school", school);
    }

    // Dispatch custom event for real-time listener components
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nurseford-school-change", { detail: { school } })
      );
    }

    startTransition(() => {
      router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {/* ─── 1. COURSE DROPDOWN ─── */}
      <div className="relative" ref={courseDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsCourseOpen((prev) => !prev);
            setIsSchoolOpen(false);
          }}
          className={`group inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold
            border transition-all duration-150 select-none cursor-pointer
            ${
              isCourseOpen
                ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-[#2FD9C4] ring-2 ring-teal-500/20"
                : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:border-teal-500/50 hover:bg-slate-50 dark:hover:bg-slate-800"
            }
            shadow-2xs active:scale-[0.98]`}
          aria-haspopup="listbox"
          aria-expanded={isCourseOpen}
          title={`Course: ${activeCourse?.name || "Select Course"}`}
        >
          <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
          <span className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 shrink-0">
            Course<span className="hidden sm:inline">:</span>
          </span>
          <span className="hidden sm:inline font-normal text-slate-600 dark:text-slate-300 truncate max-w-[100px] md:max-w-[140px] lg:max-w-[180px]">
            {coursesLoading
              ? "..."
              : activeCourse?.name || "Select"}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
              isCourseOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isCourseOpen && (
          <div className="fixed inset-x-3 top-[60px] sm:absolute sm:inset-x-auto sm:left-0 sm:top-full mt-1.5 sm:w-80 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700/90 shadow-2xl z-[100] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Course
                </span>
                <span className="text-[10px] font-medium text-teal-600 dark:text-[#2FD9C4]">
                  {courses.length} Available
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                  autoFocus
                />
                {courseSearch && (
                  <button
                    onClick={() => setCourseSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto p-1.5 space-y-0.5">
              {filteredCourses.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No courses found matching &quot;{courseSearch}&quot;
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const isSelected =
                    activeCourse &&
                    (String(activeCourse.id) === String(course.id) ||
                      activeCourse.slug === course.slug);
                  return (
                    <button
                      key={`${course.id}-${course.slug}`}
                      type="button"
                      onClick={() => handleSelectCourse(course)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-[#2FD9C4] font-semibold"
                          : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            course.category === "exit"
                              ? "bg-amber-500"
                              : "bg-teal-500"
                          }`}
                        />
                        <span className="truncate">{course.name}</span>
                        {course.category === "exit" && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
                            Exit
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. SCHOOL DROPDOWN ─── */}
      <div className="relative" ref={schoolDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsSchoolOpen((prev) => !prev);
            setIsCourseOpen(false);
          }}
          className={`group inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold
            border transition-all duration-150 select-none cursor-pointer
            ${
              isSchoolOpen || (selectedSchool && selectedSchool !== "all")
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-sky-300 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800"
            }
            shadow-2xs active:scale-[0.98]`}
          aria-haspopup="listbox"
          aria-expanded={isSchoolOpen}
          title={`School: ${
            selectedSchool === "all" ? "All Schools" : selectedSchool
          }`}
        >
          <School className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
          <span className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 shrink-0">
            School<span className="hidden sm:inline">:</span>
          </span>
          <span className="hidden sm:inline font-normal text-slate-600 dark:text-slate-300 truncate max-w-[80px] md:max-w-[120px] lg:max-w-[150px]">
            {selectedSchool === "all" ? "All" : selectedSchool}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
              isSchoolOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isSchoolOpen && (
          <div className="fixed inset-x-3 top-[60px] sm:absolute sm:inset-x-auto sm:left-0 sm:top-full mt-1.5 sm:w-80 rounded-2xl bg-white dark:bg-[#15202B] border border-slate-200 dark:border-slate-700/90 shadow-2xl z-[100] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
              {/* All Schools Option */}
              <button
                type="button"
                onClick={() => handleSelectSchool("all")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  selectedSchool === "all"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-semibold"
                    : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>All Schools (Show Everything)</span>
                </div>
                {selectedSchool === "all" && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                )}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              {filteredSchools.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  {schoolSearch
                    ? `No schools found matching "${schoolSearch}"`
                    : "No specific schools found"}
                </div>
              ) : (
                filteredSchools.map((school) => {
                  const isSelected = selectedSchool === school;
                  return (
                    <button
                      key={school}
                      type="button"
                      onClick={() => handleSelectSchool(school)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-sky-300 font-semibold"
                          : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="truncate pr-2">{school}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. SUBSCRIPTION BUTTON ─── */}
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
