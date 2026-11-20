"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Stethoscope,
  School,
  Calendar,
  Sun,
  Flame,
  GraduationCap,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useCoursesFilter } from "@/lib/contexts/courses/CoursesFilterContext";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { setAvailableSchools } from "@/lib/data/nursingSchools";
import CoursesNavbarFilters from "@/app/(web)/includes/navbar/CoursesNavbarFilters";
import CoursesLeftSidebar from "@/app/(web)/includes/sidebar/CoursesLeftSidebar";
import { formatCourseDropdownName } from "@/lib/utils/exams/formatCourseDropdownName";
import {
  getProgramRank,
  formatProgramDropdownName,
  matchesProgram,
} from "@/lib/utils/exams/formatProgramDropdownName";
import type { UnifiedSubject } from "@/app/api/exams/all-subjects/route";

export default function SubjectsCatalogView() {
  const { isOpened: isSidebarOpened } = useLeftSidebar();

  const {
    searchQuery,
    setSearchQuery,
    selectedProgram,
    setSelectedProgram,
    selectedCourse,
    selectedSchool,
    selectedYear,
    selectedSeason,
    clearAllFilters,
    hasActiveFilters,
    setDynamicPrograms,
    setDynamicCourses,
    setDynamicYears,
    setDynamicSeasons,
    setTotalCoursesCount,
    setFilteredCount,
  } = useCoursesFilter();

  const [subjects, setSubjects] = useState<UnifiedSubject[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("nurseford_unified_subjects_v4");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((s: UnifiedSubject) => ({
              ...s,
              courseName: (s.courseName || "")
                .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
                .replace(/rhenis\s*/gi, "")
                .trim(),
              name: (s.name || "").replace(/rhenis\s*/gi, "").trim(),
              programName: formatProgramDropdownName(s.programName),
            }));
          }
        }
      } catch {}
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("nurseford_unified_subjects_v3");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });

  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Toggle button state between RN Nursing Subjects and LPN
  const [activeTrack, setActiveTrack] = useState<"rn" | "lpn" | "all">("rn");

  // Sync active track if programme filter is selected
  useEffect(() => {
    if (selectedProgram && selectedProgram !== "All Programmes") {
      if (/lpn|pn/i.test(selectedProgram)) {
        setActiveTrack("lpn");
      } else if (/rn/i.test(selectedProgram)) {
        setActiveTrack("rn");
      }
    }
  }, [selectedProgram]);

  // Fetch unified subjects from parallel API route
  useEffect(() => {
    isMountedRef.current = true;

    async function loadSubjects() {
      if (subjects.length === 0) {
        setIsLoading(true);
      }
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch("/api/exams/all-subjects", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to load subjects (Status ${res.status})`);
        }

        const data = await res.json().catch(() => ({}));
        const rawList: UnifiedSubject[] = Array.isArray(data?.subjects) ? data.subjects : [];
        const list: UnifiedSubject[] = rawList.map((s) => ({
          ...s,
          courseName: (s.courseName || "")
            .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
            .replace(/rhenis\s*/gi, "")
            .trim(),
          name: (s.name || "").replace(/rhenis\s*/gi, "").trim(),
          programName: formatProgramDropdownName(s.programName),
        }));

        if (isMountedRef.current && list.length > 0) {
          setSubjects(list);
          setTotalCoursesCount(list.length);

          try {
            sessionStorage.setItem("nurseford_unified_subjects_v4", JSON.stringify(list));
          } catch {}

          // Populate dynamic options
          const pSet = new Set<string>();
          const cSet = new Set<string>();
          const ySet = new Set<number>();
          const snSet = new Set<string>();
          const schSet = new Set<string>();

          list.forEach((sub) => {
            if (sub.programName) pSet.add(formatProgramDropdownName(sub.programName));
            if (sub.courseName) cSet.add(sub.courseName.replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify"));
            if (sub.year) ySet.add(sub.year);
            if (sub.season) snSet.add(sub.season);
            if (sub.school) schSet.add(sub.school);
          });

          if (pSet.size > 0) {
            setDynamicPrograms(
              Array.from(pSet).sort((a, b) => {
                const rankA = getProgramRank(a);
                const rankB = getProgramRank(b);
                if (rankA !== rankB) return rankA - rankB;
                return a.localeCompare(b);
              })
            );
          }
          if (cSet.size > 0) setDynamicCourses(Array.from(cSet).sort((a, b) => a.localeCompare(b)));
          if (ySet.size > 0) setDynamicYears(Array.from(ySet).sort((a, b) => b - a));
          if (snSet.size > 0) {
            const seasonOrder = ["Fall", "Spring", "Summer", "Winter"];
            setDynamicSeasons(
              Array.from(snSet).sort((a, b) => {
                const idxA = seasonOrder.indexOf(a);
                const idxB = seasonOrder.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
              })
            );
          }
          if (schSet.size > 0) {
            setAvailableSchools(Array.from(schSet).sort((a, b) => a.localeCompare(b)));
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          console.warn("[SubjectsCatalogView] Fetch was aborted or timed out.");
        } else {
          console.error("[SubjectsCatalogView] Error loading subjects:", err);
        }
        if (isMountedRef.current && subjects.length === 0) {
          setError(
            err?.name === "AbortError"
              ? "Loading subjects timed out. Please click retry below to refresh."
              : err.message || "Failed to load subjects. Please check your connection and retry."
          );
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    loadSubjects();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter subjects based on active filters
  const filteredSubjects = useMemo(() => {
    const list = Array.isArray(subjects) ? subjects : [];
    return list.filter((sub) => {
      if (!sub) return false;

      // 1. Live Search
      const q = (searchQuery || "").trim().toLowerCase();
      if (q) {
        const matchesName = (sub.name || "").toLowerCase().includes(q);
        const matchesCat = (sub.category || "").toLowerCase().includes(q);
        const matchesCourse = (sub.courseName || "").toLowerCase().includes(q);
        const matchesProg = (sub.programName || "").toLowerCase().includes(q);
        const matchesSchool = (sub.school || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesCourse && !matchesProg && !matchesSchool) {
          return false;
        }
      }

      // 2. Programme Filter
      if (selectedProgram && selectedProgram !== "All Programmes") {
        if (!matchesProgram(sub.programName, selectedProgram)) {
          return false;
        }
      }

      // 3. Course Filter
      if (selectedCourse && selectedCourse !== "All Courses") {
        if ((sub.courseName || "").trim().toLowerCase() !== selectedCourse.trim().toLowerCase()) {
          return false;
        }
      }

      // 4. School Filter
      if (selectedSchool && selectedSchool !== "All Schools") {
        if (sub.school && sub.school.toLowerCase() !== selectedSchool.toLowerCase()) {
          return false;
        }
      }

      // 5. Year Filter
      if (selectedYear && selectedYear !== "All Years") {
        const targetYear = parseInt(selectedYear, 10);
        if (sub.year && sub.year !== targetYear) return false;
        if (!sub.year && !String(sub.name || "").includes(selectedYear)) return false;
      }

      // 6. Season Filter
      if (selectedSeason && selectedSeason !== "All Seasons") {
        if (sub.season && sub.season.toLowerCase() !== selectedSeason.toLowerCase()) {
          return false;
        }
        if (!sub.season && !String(sub.name || "").toLowerCase().includes(selectedSeason.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [subjects, searchQuery, selectedProgram, selectedCourse, selectedSchool, selectedYear, selectedSeason]);

  // Partition subjects into RN Nursing, LPN Nursing, and Exit Exam tracks
  // When no specific course filter is active, merge subjects belonging to the same clinical specialty
  // into a single card (e.g. Med-Surg 4 course cards merged into 1 card with all 339 exams).
  const { rnSubjects, lpnSubjects, rnExitSubjects, lpnExitSubjects } = useMemo(() => {
    const isCourseFiltered = Boolean(selectedCourse && selectedCourse !== "All Courses" && selectedCourse !== "all");

    const rawRn: UnifiedSubject[] = [];
    const rawLpn: UnifiedSubject[] = [];
    const rnExit: UnifiedSubject[] = [];
    const lpnExit: UnifiedSubject[] = [];

    filteredSubjects.forEach((sub) => {
      const isExit =
        /exit/i.test(sub.programName || "") ||
        /exit/i.test(sub.courseName || "") ||
        /exit/i.test(sub.name || "");

      if (isExit) {
        if (sub.panelSlug === "lpn-nursing" || /lpn|pn/i.test(sub.programName)) {
          lpnExit.push(sub);
        } else {
          rnExit.push(sub);
        }
      } else if (sub.panelSlug === "lpn-nursing" || /lpn|pn/i.test(sub.programName)) {
        rawLpn.push(sub);
      } else {
        rawRn.push(sub);
      }
    });

    function getCanonicalSubjectInfo(name: string): { key: string; name: string; category: string; isMedSurg: boolean } {
      const n = (name || "").toLowerCase().trim();
      if (/(?:med[\s\-]*surg|medical[\s\-]*surgical)/i.test(n)) {
        return { key: "med-surg", name: "Med-Surg Nursing", category: "Med-Surg / Adult Health", isMedSurg: true };
      }
      if (/adult\s*health/i.test(n)) {
        return { key: "adult-health", name: "Adult Health Nursing", category: "Med-Surg / Adult Health", isMedSurg: true };
      }
      if (/pharm(?:acol)?/i.test(n)) {
        return { key: "pharmacology", name: "Pharmacology Nursing", category: "Pharmacology", isMedSurg: false };
      }
      if (/fundament|foundation/i.test(n)) {
        return { key: "fundamentals", name: "Fundamentals of Nursing", category: "Fundamentals of Nursing", isMedSurg: false };
      }
      if (/(?:matern|newborn|obstetric|perinatal)/i.test(n)) {
        return { key: "maternal-newborn", name: "Maternal & Newborn Care", category: "Maternal & Newborn Care", isMedSurg: false };
      }
      if (/(?:pediatric|peds|child)/i.test(n)) {
        return { key: "pediatrics", name: "Pediatrics & Child Health", category: "Pediatrics & Child Health", isMedSurg: false };
      }
      if (/(?:mental|psych)/i.test(n)) {
        return { key: "mental-health", name: "Mental Health & Psychiatric Nursing", category: "Mental Health & Psych", isMedSurg: false };
      }
      if (/(?:dosage|calc(?:ulat)?)/i.test(n)) {
        return { key: "dosage-calc", name: "Dosage Calculation", category: "Dosage Calculation", isMedSurg: false };
      }
      if (/(?:health\s*assessment|physical\s*assessment|\bassessment\b)/i.test(n)) {
        return { key: "health-assessment", name: "Health Assessment", category: "Health Assessment", isMedSurg: false };
      }
      if (/(?:leadership|management)/i.test(n)) {
        return { key: "leadership", name: "Leadership & Management", category: "Leadership & Management", isMedSurg: false };
      }
      if (/(?:community|public\s*health)/i.test(n)) {
        return { key: "community-health", name: "Community Health Nursing", category: "Community Health", isMedSurg: false };
      }
      if (/nutrition/i.test(n)) {
        return { key: "nutrition", name: "Nutrition in Nursing", category: "Nutrition", isMedSurg: false };
      }
      if (/(?:critical\s*care|intensive\s*care|emergency|icu)/i.test(n)) {
        return { key: "critical-care", name: "Critical Care Nursing", category: "Critical Care", isMedSurg: false };
      }
      if (/(?:pathophysiol|pathology)/i.test(n)) {
        return { key: "pathophysiology", name: "Pathophysiology", category: "Pathophysiology", isMedSurg: false };
      }
      if (/(?:anatom|physiol)/i.test(n)) {
        return { key: "anatomy-physiology", name: "Anatomy & Physiology", category: "General Clinical", isMedSurg: false };
      }
      if (/concept/i.test(n)) {
        return { key: "concept-based", name: "Concept-Based Clinical Nursing", category: "General Clinical", isMedSurg: false };
      }
      if (/(?:capstone|comprehensive\s*clinical)/i.test(n)) {
        return { key: "capstone", name: "Comprehensive Capstone Nursing", category: "General Clinical", isMedSurg: false };
      }
      if (/(?:gerontol|geriatric)/i.test(n)) {
        return { key: "gerontology", name: "Gerontological Nursing", category: "General Clinical", isMedSurg: false };
      }
      if (/h[\s\-]*s.*exit|hesi.*exit/i.test(n)) {
        return {
          key: "hs-exit",
          name: /lpn|pn/i.test(n) ? "H-S Exit Exams (PN)" : "H-S Exit Exams (RN)",
          category: "Exit Exams & Capstone",
          isMedSurg: false,
        };
      }
      if (/predictor|a[\s\-]*t.*exit|ati.*exit/i.test(n)) {
        return {
          key: "at-predictor",
          name: /lpn|pn/i.test(n) ? "A-T Comprehensive Predictor Exams (PN)" : "A-T Comprehensive Predictor Exams (RN)",
          category: "Exit Exams & Capstone",
          isMedSurg: false,
        };
      }
      if (/exit/i.test(n)) {
        return {
          key: "general-exit",
          name: /lpn|pn/i.test(n) ? "Comprehensive Exit Exams (PN)" : "Comprehensive Exit Exams (RN)",
          category: "Exit Exams & Capstone",
          isMedSurg: false,
        };
      }
      const cleanName = name
        .replace(/rhenis\s*/gi, "")
        .replace(/\s*\((?:general\s*)?(?:rn|lpn)\)/i, "")
        .replace(/-?(?:rn|lpn)$/i, "")
        .trim();
      return { key: cleanName.toLowerCase(), name: cleanName, category: "General Clinical", isMedSurg: false };
    }

    function mergeSubjectsAcrossCourses(list: UnifiedSubject[]): UnifiedSubject[] {
      const groups = new Map<string, UnifiedSubject[]>();

      list.forEach((sub) => {
        const info = getCanonicalSubjectInfo(sub.name);
        const groupKey = `${sub.panelSlug}:::${info.key}`;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(sub);
      });

      const merged: UnifiedSubject[] = [];

      groups.forEach((subs) => {
        if (subs.length === 1) {
          merged.push(subs[0]);
          return;
        }

        // Sort so the subject with the largest exam count is primary
        subs.sort((a, b) => (b.examCount || 0) - (a.examCount || 0));
        const primary = subs[0];

        const totalQuestions = subs.reduce((sum, s) => sum + (s.questionCount || 0), 0);
        const totalExams = subs.reduce((sum, s) => sum + (s.examCount || 0), 0);
        const mergedIds = Array.from(new Set(subs.map((s) => String(s.id || s.guidId || "")))).filter(Boolean);

        const info = getCanonicalSubjectInfo(primary.name);

        const targetHref = `/dashboards/${primary.panelSlug}/exams/${primary.courseSlug}/${primary.courseId}/exams/${primary.id}?subjectName=${encodeURIComponent(
          info.name
        )}&mergedIds=${mergedIds.join(",")}`;

        const schools = Array.from(new Set(subs.map((s) => s.school).filter(Boolean)));
        const years = Array.from(new Set(subs.map((s) => s.year).filter((y): y is number => typeof y === "number")));
        const seasons = Array.from(new Set(subs.map((s) => s.season).filter(Boolean)));

        const isExitGroup =
          info.category === "Exit Exams & Capstone" ||
          info.key.includes("exit") ||
          info.key.includes("predictor");

        const courseBadge = isExitGroup
          ? `All Years (${subs.length} Combined)`
          : `All Courses (${subs.length} Combined)`;

        merged.push({
          ...primary,
          id: `merged_${primary.panelSlug}_${info.key}`,
          name: info.name,
          category: info.category,
          isMedSurg: info.isMedSurg,
          questionCount: totalQuestions,
          examCount: totalExams,
          courseName: courseBadge,
          school: schools.length === 1 ? schools[0] : undefined,
          year: years.length === 1 ? years[0] : undefined,
          season: seasons.length === 1 ? seasons[0] : undefined,
          targetHref,
        });
      });

      // Sort: Med-Surg first, then by exam count descending
      return merged.sort((a, b) => {
        if (a.isMedSurg && !b.isMedSurg) return -1;
        if (!a.isMedSurg && b.isMedSurg) return 1;
        return (b.examCount || 0) - (a.examCount || 0);
      });
    }

    const rn = isCourseFiltered ? rawRn : mergeSubjectsAcrossCourses(rawRn);
    const lpn = isCourseFiltered ? rawLpn : mergeSubjectsAcrossCourses(rawLpn);
    const rnExitMerged = isCourseFiltered ? rnExit : mergeSubjectsAcrossCourses(rnExit);
    const lpnExitMerged = isCourseFiltered ? lpnExit : mergeSubjectsAcrossCourses(lpnExit);

    return {
      rnSubjects: rn,
      lpnSubjects: lpn,
      rnExitSubjects: rnExitMerged,
      lpnExitSubjects: lpnExitMerged,
    };
  }, [filteredSubjects, selectedCourse]);

  // Sync current visible cards count to filter context
  const totalVisibleCards = useMemo(() => {
    if (activeTrack === "rn") return rnSubjects.length + rnExitSubjects.length;
    if (activeTrack === "lpn") return lpnSubjects.length + lpnExitSubjects.length;
    return rnSubjects.length + rnExitSubjects.length + lpnSubjects.length + lpnExitSubjects.length;
  }, [activeTrack, rnSubjects.length, rnExitSubjects.length, lpnSubjects.length, lpnExitSubjects.length]);

  useEffect(() => {
    setFilteredCount(totalVisibleCards);
  }, [totalVisibleCards, setFilteredCount]);

  // Render a clean, compact subject card
  const renderSubjectCard = (sub: UnifiedSubject) => (
    <Link
      key={sub.id + sub.courseId}
      href={sub.targetHref}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-3 sm:p-3.5 hover:border-teal-500/80 hover:shadow-xs transition-all duration-150 hover:-translate-y-0.5 min-h-[96px]"
    >
      <div>
        <h3 className="font-serif text-sm sm:text-[14px] font-semibold text-navy dark:text-white group-hover:text-teal-600 dark:group-hover:text-[#2FD9C4] transition-colors leading-snug line-clamp-2">
          {sub.name.replace(/rhenis\s*/gi, "").trim()}
        </h3>

        {/* Metadata: School, Year, Season */}
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {sub.school && (
            <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
              <School className="w-3 h-3 text-blue-500" />
              <span>{sub.school}</span>
            </span>
          )}
          {sub.year && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>{sub.year}</span>
            </span>
          )}
          {sub.season && (
            <span className="inline-flex items-center gap-1">
              <Sun className="w-3 h-3 text-purple-500" />
              <span>{sub.season}</span>
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {sub.examCount > 0 && (
            <span className="font-bold text-teal-700 dark:text-[#2FD9C4]">
              {sub.examCount} exams
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-[#2FD9C4] transition-all">
          <span>Practice</span>
        </span>
      </div>
    </Link>
  );

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
          
          {/* ────────────────────────────────────────────────────────────────────────────────
              CURRICULUM FILTERS (Programme, Course, School, Year, Season, Reset)
          ────────────────────────────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap mb-4 sm:mb-6">
            <CoursesNavbarFilters />
          </div>

          {/* ────────────────────────────────────────────────────────────────────────────────
              UNIFIED HEADER BAR: Track Title (Left) + Track Switcher Buttons (Right)
          ────────────────────────────────────────────────────────────────────────────────── */}
          {!isLoading && !error && filteredSubjects.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
              {/* Left: Active Track Title & Count */}
              <div className="flex items-center gap-2.5">
                {activeTrack === "rn" && (
                  <>
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-[#2FD9C4]" />
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                      RN Nursing Subjects
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-[#2FD9C4]">
                      {rnSubjects.length + rnExitSubjects.length} subjects
                    </span>
                  </>
                )}
                {activeTrack === "lpn" && (
                  <>
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-sky-400" />
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                      LPN Nursing Subjects
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-sky-300">
                      {lpnSubjects.length + lpnExitSubjects.length} subjects
                    </span>
                  </>
                )}
                {activeTrack === "all" && (
                  <>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                      All Nursing Subjects
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                      {totalVisibleCards} subjects
                    </span>
                  </>
                )}
              </div>

              {/* Right: Track Toggle Buttons */}
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTrack("rn")}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTrack === "rn"
                      ? "bg-white dark:bg-[#0A2540] text-teal-700 dark:text-[#2FD9C4] shadow-xs border border-teal-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>RN Nursing Subjects</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTrack === "rn"
                        ? "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-[#2FD9C4]"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {rnSubjects.length + rnExitSubjects.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTrack("lpn")}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTrack === "lpn"
                      ? "bg-white dark:bg-[#0A2540] text-blue-700 dark:text-sky-300 shadow-xs border border-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>LPN Nursing Subjects</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTrack === "lpn"
                        ? "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-sky-300"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {lpnSubjects.length + lpnExitSubjects.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTrack("all")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTrack === "all"
                      ? "bg-white dark:bg-[#0A2540] text-purple-700 dark:text-purple-300 shadow-xs border border-purple-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Both</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-4.5 animate-pulse space-y-3"
                >
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
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
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Retry Loading Subjects
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredSubjects.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-10 sm:p-14 text-center max-w-xl mx-auto space-y-4">
              <Stethoscope className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-navy dark:text-white">No subjects match your active filters</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Try resetting your programme, course, school, or term filters to view all subjects.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0A2540] hover:bg-teal-700 text-white transition shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Show All Subjects</span>
              </button>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────────────────────
              DIRECT SUBJECTS DISPLAY (RN Nursing, LPN Nursing, and Exit Simulators)
          ────────────────────────────────────────────────────────────────────────────────── */}
          {!isLoading && !error && filteredSubjects.length > 0 && (
            <div className="space-y-6 sm:space-y-8">
              
              {/* === RN TRACK VIEW === */}
              {activeTrack === "rn" && (
                <>
                  {rnSubjects.length === 0 && rnExitSubjects.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-8 text-center max-w-lg mx-auto space-y-3">
                      <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
                      <h3 className="font-bold text-navy dark:text-white">No RN Subjects Match Current Filters</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Try switching to LPN Nursing Subjects or resetting your active filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTrack("lpn")}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer"
                      >
                        Switch to LPN Nursing ({lpnSubjects.length + lpnExitSubjects.length})
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* RN Core Subjects */}
                      {rnSubjects.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                          {rnSubjects.map(renderSubjectCard)}
                        </div>
                      )}

                      {/* RN Exit Simulators */}
                      {rnExitSubjects.length > 0 && (
                        <section className="space-y-4 pt-4 sm:pt-6">
                          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                              RN Exit Exam Simulators
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                            {rnExitSubjects.map(renderSubjectCard)}
                          </div>
                        </section>
                      )}
                    </>
                  )}
                </>
              )}

              {/* === LPN TRACK VIEW === */}
              {activeTrack === "lpn" && (
                <>
                  {lpnSubjects.length === 0 && lpnExitSubjects.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-8 text-center max-w-lg mx-auto space-y-3">
                      <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
                      <h3 className="font-bold text-navy dark:text-white">No LPN Subjects Match Current Filters</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Try switching to RN Nursing Subjects or resetting your active filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTrack("rn")}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer"
                      >
                        Switch to RN Nursing ({rnSubjects.length + rnExitSubjects.length})
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* LPN Core Subjects */}
                      {lpnSubjects.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                          {lpnSubjects.map(renderSubjectCard)}
                        </div>
                      )}

                      {/* LPN Exit Simulators */}
                      {lpnExitSubjects.length > 0 && (
                        <section className="space-y-4 pt-4 sm:pt-6">
                          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                              LPN Exit Exam Simulators
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                            {lpnExitSubjects.map(renderSubjectCard)}
                          </div>
                        </section>
                      )}
                    </>
                  )}
                </>
              )}

              {/* === ALL TRACKS VIEW (VIEW BOTH) === */}
              {activeTrack === "all" && (
                <>
                  {/* 1. RN NURSING SUBJECTS */}
                  {rnSubjects.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-teal-600 dark:text-[#2FD9C4]" />
                          <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                            RN Nursing Subjects
                          </h2>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-[#2FD9C4]">
                          {rnSubjects.length} {rnSubjects.length === 1 ? "subject" : "subjects"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                        {rnSubjects.map(renderSubjectCard)}
                      </div>
                    </section>
                  )}

                  {/* 2. LPN NURSING SUBJECTS */}
                  {lpnSubjects.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                          <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                            LPN Nursing Subjects
                          </h2>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-sky-300">
                          {lpnSubjects.length} {lpnSubjects.length === 1 ? "subject" : "subjects"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                        {lpnSubjects.map(renderSubjectCard)}
                      </div>
                    </section>
                  )}

                  {/* 3. EXIT EXAM SUBJECTS */}
                  {(rnExitSubjects.length > 0 || lpnExitSubjects.length > 0) && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                          Exit Exam Simulators
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                        {[...rnExitSubjects, ...lpnExitSubjects].map(renderSubjectCard)}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
