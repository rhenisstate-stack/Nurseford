"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";
import { isAllowedNursingCourse } from "@/lib/utils/exams/nursingProgramScope";

export interface CoursesFilterContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProgram: string;
  setSelectedProgram: (p: string) => void;
  selectedSchool: string;
  setSelectedSchool: (s: string) => void;
  selectedCourse: string;
  setSelectedCourse: (c: string) => void;
  selectedSubject: string;
  setSelectedSubject: (sub: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedSeason: string;
  setSelectedSeason: (s: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  dynamicPrograms: string[];
  setDynamicPrograms: (programs: string[]) => void;
  dynamicCourses: string[];
  setDynamicCourses: (courses: string[]) => void;
  dynamicSubjects: string[];
  setDynamicSubjects: (subjects: string[]) => void;
  dynamicYears: number[];
  setDynamicYears: (years: number[]) => void;
  dynamicSeasons: string[];
  setDynamicSeasons: (seasons: string[]) => void;
  totalCoursesCount: number;
  setTotalCoursesCount: (n: number) => void;
  filteredCount: number;
  setFilteredCount: (n: number) => void;
}

export const defaultCoursesFilterContext: CoursesFilterContextType = {
  searchQuery: "",
  setSearchQuery: () => {},
  selectedProgram: "All Programmes",
  setSelectedProgram: () => {},
  selectedSchool: "All Schools",
  setSelectedSchool: () => {},
  selectedCourse: "All Courses",
  setSelectedCourse: () => {},
  selectedSubject: "All Subjects",
  setSelectedSubject: () => {},
  selectedYear: "All Years",
  setSelectedYear: () => {},
  selectedSeason: "All Seasons",
  setSelectedSeason: () => {},
  clearAllFilters: () => {},
  hasActiveFilters: false,
  dynamicPrograms: [],
  setDynamicPrograms: () => {},
  dynamicCourses: [],
  setDynamicCourses: () => {},
  dynamicSubjects: [],
  setDynamicSubjects: () => {},
  dynamicYears: [],
  setDynamicYears: () => {},
  dynamicSeasons: [],
  setDynamicSeasons: () => {},
  totalCoursesCount: 0,
  setTotalCoursesCount: () => {},
  filteredCount: 0,
  setFilteredCount: () => {},
};

const CoursesFilterContext = createContext<CoursesFilterContextType>(defaultCoursesFilterContext);

interface RawCourseData {
  name?: string;
  title?: string;
  year?: string | number | null;
  season?: string | null;
  createdAt?: string | null;
  description?: string | null;
  panelHint?: string;
  programName?: string;
  segment?: string;
}

export function CoursesFilterProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams?.get("q") || "");
  const [selectedProgram, setSelectedProgram] = useState<string>(() => {
    return searchParams?.get("program") || "All Programmes";
  });
  const [selectedSchool, setSelectedSchoolState] = useState<string>(() => {
    const s = searchParams?.get("school");
    return s && s !== "all" ? s : "All Schools";
  });
  const [selectedCourse, setSelectedCourseState] = useState<string>(() => {
    const c = searchParams?.get("course");
    return c && c !== "all" ? c : "All Courses";
  });
  const [selectedSubject, setSelectedSubjectState] = useState<string>(() => {
    const sub = searchParams?.get("subject");
    return sub && sub !== "all" ? sub : "All Subjects";
  });
  const [selectedYear, setSelectedYearState] = useState<string>(() => {
    const y = searchParams?.get("year");
    return y && y !== "all" ? y : "All Years";
  });
  const [selectedSeason, setSelectedSeasonState] = useState<string>(() => {
    const s = searchParams?.get("season");
    return s && s !== "all" ? s : "All Seasons";
  });

  const [dynamicPrograms, setDynamicPrograms] = useState<string[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<string[]>([]);
  const [dynamicSubjects, setDynamicSubjects] = useState<string[]>([
    "Med-Surg / Adult Health",
    "Pharmacology",
    "Fundamentals of Nursing",
    "Maternal & Newborn Care",
    "Pediatrics & Child Health",
    "Mental Health & Psych",
    "Dosage Calculation",
    "Health Assessment",
    "Leadership & Management",
    "Community Health",
    "Critical Care",
    "Exit Exams & Capstone",
  ]);
  const [dynamicYears, setDynamicYears] = useState<number[]>([]);
  const [dynamicSeasons, setDynamicSeasons] = useState<string[]>([]);
  const [totalCoursesCount, setTotalCoursesCount] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  // Background fetch to populate dynamic options if not already loaded
  useEffect(() => {
    if (dynamicPrograms.length > 0 && dynamicYears.length > 0 && dynamicSeasons.length > 0) return;

    let cancelled = false;

    async function loadDynamicDefaults() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const rawList: RawCourseData[] = [];

        // Primary: fetch master courses catalog to extract real dynamic programs, years, seasons
        try {
          const masterRes = await fetch(
            "/api/nexus/strata/learning/course?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200",
            { cache: "no-store", signal: controller.signal }
          );
          if (masterRes.ok) {
            const masterData = (await masterRes.json().catch(() => ({}))) as {
              data?: { items?: RawCourseData[] } | RawCourseData[];
            };
            const items = Array.isArray(masterData?.data)
              ? masterData.data
              : Array.isArray(masterData?.data?.items)
              ? masterData.data.items
              : [];
            items.forEach((item) => {
              if (isAllowedNursingCourse(item, "all")) {
                rawList.push(item);
              }
            });
          }
        } catch {
          // fallback to dashboard endpoints below
        }

        if (rawList.length === 0) {
          const [rnRes, lpnRes] = await Promise.allSettled([
            fetch("/api/exams/rn-nursing/subjects", { cache: "no-store", signal: controller.signal }),
            fetch("/api/exams/lpn-nursing/subjects", { cache: "no-store", signal: controller.signal }),
          ]);

          if (rnRes.status === "fulfilled" && rnRes.value.ok) {
            const data = (await rnRes.value.json().catch(() => ({}))) as { subjects?: RawCourseData[] };
            (data?.subjects || []).forEach((s) => {
              if (isAllowedNursingCourse(s, "all")) {
                rawList.push({ ...s, panelHint: "rn-nursing" });
              }
            });
          }
          if (lpnRes.status === "fulfilled" && lpnRes.value.ok) {
            const data = (await lpnRes.value.json().catch(() => ({}))) as { subjects?: RawCourseData[] };
            (data?.subjects || []).forEach((s) => {
              if (isAllowedNursingCourse(s, "all")) {
                rawList.push({ ...s, panelHint: "lpn-nursing" });
              }
            });
          }
        }

        clearTimeout(timeoutId);

        if (cancelled || rawList.length === 0) return;

        const pSet = new Set<string>();
        const cSet = new Set<string>();
        const ySet = new Set<number>();
        const sSet = new Set<string>();

        rawList.forEach((c) => {
          const rawName = (c.name || c.title || "").trim();
          if (!rawName) return;
          if (!isAllowedNursingCourse(c, "all")) return;

          const name = rawName.replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify");
          cSet.add(name);

          const isLpn =
            c.panelHint === "lpn-nursing" ||
            /lpn|pn\b/i.test(name) ||
            /lpn|pn\b/i.test(c.programName || "") ||
            c.segment === "LPN_NURSING" ||
            c.segment === "LPN_EXIT";

          const isExit =
            /exit/i.test(name) ||
            /exit/i.test(c.programName || "") ||
            c.segment === "RN_EXIT" ||
            c.segment === "LPN_EXIT";

          const prog = isLpn
            ? isExit
              ? "LPN Exit Exams"
              : "LPN Nursing Exams"
            : isExit
            ? "RN Exit Exams"
            : "RN Nursing Exams";

          pSet.add(prog);

          const yr = extractExamYear(name, undefined, c.year ? Number(c.year) : undefined, c.createdAt ?? undefined);
          if (yr) ySet.add(yr);

          const sn = resolveExamSeason(c.season, name, c.description ?? undefined);
          if (sn) sSet.add(sn);
        });

        if (!cancelled) {
          if (pSet.size > 0) setDynamicPrograms(Array.from(pSet).sort((a, b) => a.localeCompare(b)));
          if (cSet.size > 0) setDynamicCourses(Array.from(cSet).sort((a, b) => a.localeCompare(b)));
          if (ySet.size > 0) setDynamicYears(Array.from(ySet).sort((a, b) => b - a));
          if (sSet.size > 0) {
            const seasonOrder = ["Fall", "Spring", "Summer", "Winter"];
            setDynamicSeasons(
              Array.from(sSet).sort((a, b) => {
                const idxA = seasonOrder.indexOf(a);
                const idxB = seasonOrder.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
              })
            );
          }
        }
      } catch (err) {
        console.error("[CoursesFilterProvider] Failed to load dynamic defaults:", err);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    loadDynamicDefaults();

    return () => {
      cancelled = true;
    };
  }, [dynamicPrograms.length, dynamicYears.length, dynamicSeasons.length]);

  // Event dispatchers and listeners for sync across dashboard components
  const setSelectedSchool = useCallback((s: string) => {
    setSelectedSchoolState(s);
    if (typeof window !== "undefined") {
      const val = s === "All Schools" ? "all" : s;
      window.dispatchEvent(new CustomEvent("nurseford-school-change", { detail: { school: val } }));
    }
  }, []);

  const setSelectedCourse = useCallback((c: string) => {
    setSelectedCourseState(c);
    if (typeof window !== "undefined") {
      const val = c === "All Courses" ? "all" : c;
      window.dispatchEvent(new CustomEvent("nurseford-course-change", { detail: { course: val } }));
    }
  }, []);

  const setSelectedSubject = useCallback((sub: string) => {
    setSelectedSubjectState(sub);
    if (typeof window !== "undefined") {
      const val = sub === "All Subjects" ? "all" : sub;
      window.dispatchEvent(new CustomEvent("nurseford-subject-change", { detail: { subject: val } }));
    }
  }, []);

  const setSelectedYear = useCallback((y: string) => {
    setSelectedYearState(y);
    if (typeof window !== "undefined") {
      const val = y === "All Years" ? "all" : y;
      window.dispatchEvent(new CustomEvent("nurseford-year-change", { detail: { year: val } }));
    }
  }, []);

  const setSelectedSeason = useCallback((s: string) => {
    setSelectedSeasonState(s);
    if (typeof window !== "undefined") {
      const val = s === "All Seasons" ? "all" : s;
      window.dispatchEvent(new CustomEvent("nurseford-season-change", { detail: { season: val } }));
    }
  }, []);

  // Listen to external changes from dashboard pages
  useEffect(() => {
    const handleSchoolChange = (e: Event) => {
      const custom = e as CustomEvent<{ school: string }>;
      if (custom.detail?.school !== undefined) {
        const val = custom.detail.school === "all" ? "All Schools" : custom.detail.school;
        setSelectedSchoolState(val);
      }
    };
    const handleCourseChange = (e: Event) => {
      const custom = e as CustomEvent<{ course: string }>;
      if (custom.detail?.course !== undefined) {
        const val = custom.detail.course === "all" ? "All Courses" : custom.detail.course;
        setSelectedCourseState(val);
      }
    };
    const handleSubjectChange = (e: Event) => {
      const custom = e as CustomEvent<{ subject: string }>;
      if (custom.detail?.subject !== undefined) {
        const val = custom.detail.subject === "all" ? "All Subjects" : custom.detail.subject;
        setSelectedSubjectState(val);
      }
    };
    const handleYearChange = (e: Event) => {
      const custom = e as CustomEvent<{ year: string }>;
      if (custom.detail?.year !== undefined) {
        const val = custom.detail.year === "all" ? "All Years" : custom.detail.year;
        setSelectedYearState(val);
      }
    };
    const handleSeasonChange = (e: Event) => {
      const custom = e as CustomEvent<{ season: string }>;
      if (custom.detail?.season !== undefined) {
        const val = custom.detail.season === "all" ? "All Seasons" : custom.detail.season;
        setSelectedSeasonState(val);
      }
    };
    const handleAvailableYears = (e: Event) => {
      const custom = e as CustomEvent<{ years: (number | string)[] }>;
      if (Array.isArray(custom.detail?.years) && custom.detail.years.length > 0) {
        const numericYears = custom.detail.years.map(Number).filter((y) => !isNaN(y) && y > 0);
        const unique = Array.from(new Set(numericYears)).sort((a, b) => b - a);
        if (unique.length > 0) setDynamicYears(unique);
      }
    };
    const handleAvailableSeasons = (e: Event) => {
      const custom = e as CustomEvent<{ seasons: string[] }>;
      if (Array.isArray(custom.detail?.seasons) && custom.detail.seasons.length > 0) {
        const seasonOrder = ["Fall", "Spring", "Summer", "Winter"];
        const unique = Array.from(new Set(custom.detail.seasons)).sort((a, b) => {
          const idxA = seasonOrder.indexOf(a);
          const idxB = seasonOrder.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        if (unique.length > 0) setDynamicSeasons(unique);
      }
    };

    window.addEventListener("nurseford-school-change", handleSchoolChange);
    window.addEventListener("nurseford-course-change", handleCourseChange);
    window.addEventListener("nurseford-subject-change", handleSubjectChange);
    window.addEventListener("nurseford-year-change", handleYearChange);
    window.addEventListener("nurseford-season-change", handleSeasonChange);
    window.addEventListener("nurseford-available-years-update", handleAvailableYears);
    window.addEventListener("nurseford-available-seasons-update", handleAvailableSeasons);

    return () => {
      window.removeEventListener("nurseford-school-change", handleSchoolChange);
      window.removeEventListener("nurseford-course-change", handleCourseChange);
      window.removeEventListener("nurseford-subject-change", handleSubjectChange);
      window.removeEventListener("nurseford-year-change", handleYearChange);
      window.removeEventListener("nurseford-season-change", handleSeasonChange);
      window.removeEventListener("nurseford-available-years-update", handleAvailableYears);
      window.removeEventListener("nurseford-available-seasons-update", handleAvailableSeasons);
    };
  }, []);

  // Synchronize state when URL search params change (e.g. navigation to /courses?program=...)
  useEffect(() => {
    if (!searchParams) return;

    const prog = searchParams.get("program");
    if (prog) {
      setSelectedProgram(prog);
    }

    const sch = searchParams.get("school");
    if (sch) {
      setSelectedSchoolState(sch === "all" ? "All Schools" : sch);
    }

    const crs = searchParams.get("course");
    if (crs) {
      setSelectedCourseState(crs === "all" ? "All Courses" : crs);
    }

    const sub = searchParams.get("subject");
    if (sub) {
      setSelectedSubjectState(sub === "all" ? "All Subjects" : sub);
    }

    const yr = searchParams.get("year");
    if (yr) {
      setSelectedYearState(yr === "all" ? "All Years" : yr);
    }

    const sn = searchParams.get("season");
    if (sn) {
      setSelectedSeasonState(sn === "all" ? "All Seasons" : sn);
    }

    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Sync state to URL on /courses or /subjects page without full page reload
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isCatalogPage =
      window.location.pathname.startsWith("/courses") ||
      window.location.pathname.startsWith("/subjects");
    if (!isCatalogPage) return;

    const url = new URL(window.location.href);

    if (searchQuery.trim()) url.searchParams.set("q", searchQuery.trim());
    else url.searchParams.delete("q");

    if (selectedProgram !== "All Programmes") url.searchParams.set("program", selectedProgram);
    else url.searchParams.delete("program");

    if (selectedSchool !== "All Schools" && selectedSchool !== "all") {
      url.searchParams.set("school", selectedSchool);
    } else {
      url.searchParams.delete("school");
    }

    if (selectedCourse !== "All Courses" && selectedCourse !== "all") {
      url.searchParams.set("course", selectedCourse);
    } else {
      url.searchParams.delete("course");
    }

    if (selectedSubject !== "All Subjects" && selectedSubject !== "all") {
      url.searchParams.set("subject", selectedSubject);
    } else {
      url.searchParams.delete("subject");
    }

    if (selectedYear !== "All Years" && selectedYear !== "all") {
      url.searchParams.set("year", selectedYear);
    } else {
      url.searchParams.delete("year");
    }

    if (selectedSeason !== "All Seasons" && selectedSeason !== "all") {
      url.searchParams.set("season", selectedSeason);
    } else {
      url.searchParams.delete("season");
    }

    if (url.pathname + url.search !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [searchQuery, selectedProgram, selectedSchool, selectedCourse, selectedSubject, selectedYear, selectedSeason]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(searchQuery.trim()) ||
      selectedProgram !== "All Programmes" ||
      (selectedSchool !== "All Schools" && selectedSchool !== "all") ||
      (selectedCourse !== "All Courses" && selectedCourse !== "all") ||
      (selectedSubject !== "All Subjects" && selectedSubject !== "all") ||
      (selectedYear !== "All Years" && selectedYear !== "all") ||
      (selectedSeason !== "All Seasons" && selectedSeason !== "all")
    );
  }, [searchQuery, selectedProgram, selectedSchool, selectedCourse, selectedSubject, selectedYear, selectedSeason]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedProgram("All Programmes");
    setSelectedSchoolState("All Schools");
    setSelectedCourseState("All Courses");
    setSelectedSubjectState("All Subjects");
    setSelectedYearState("All Years");
    setSelectedSeasonState("All Seasons");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nurseford-school-change", { detail: { school: "all" } }));
      window.dispatchEvent(new CustomEvent("nurseford-course-change", { detail: { course: "all" } }));
      window.dispatchEvent(new CustomEvent("nurseford-subject-change", { detail: { subject: "all" } }));
      window.dispatchEvent(new CustomEvent("nurseford-year-change", { detail: { year: "all" } }));
      window.dispatchEvent(new CustomEvent("nurseford-season-change", { detail: { season: "all" } }));
    }
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      selectedProgram,
      setSelectedProgram,
      selectedSchool,
      setSelectedSchool,
      selectedCourse,
      setSelectedCourse,
      selectedSubject,
      setSelectedSubject,
      selectedYear,
      setSelectedYear,
      selectedSeason,
      setSelectedSeason,
      clearAllFilters,
      hasActiveFilters,
      dynamicPrograms,
      setDynamicPrograms,
      dynamicCourses,
      setDynamicCourses,
      dynamicSubjects,
      setDynamicSubjects,
      dynamicYears,
      setDynamicYears,
      dynamicSeasons,
      setDynamicSeasons,
      totalCoursesCount,
      setTotalCoursesCount,
      filteredCount,
      setFilteredCount,
    }),
    [
      searchQuery,
      selectedProgram,
      selectedSchool,
      setSelectedSchool,
      selectedCourse,
      setSelectedCourse,
      selectedSubject,
      setSelectedSubject,
      selectedYear,
      setSelectedYear,
      selectedSeason,
      setSelectedSeason,
      clearAllFilters,
      hasActiveFilters,
      dynamicPrograms,
      dynamicCourses,
      dynamicSubjects,
      dynamicYears,
      dynamicSeasons,
      totalCoursesCount,
      filteredCount,
    ]
  );

  return (
    <CoursesFilterContext.Provider value={value}>
      {children}
    </CoursesFilterContext.Provider>
  );
}

export function useCoursesFilter() {
  const context = useContext(CoursesFilterContext);
  return context || defaultCoursesFilterContext;
}
