"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { NclexCustomTestPopup } from "@/components/common/dashboards/nclex/NclexDashboardSections";
import { SubjectExamsPopup } from "@/components/common/dashboards/subjects/SubjectExamsPopup";
import { toSlug, type BackendSubject } from "@/lib/data/exam-subjects";
import { useExamCourses, type DashboardCourse } from "@/lib/hooks/home/useExamCourses";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Command,
  Flame,
  GraduationCap,
  RotateCcw,
  School,
  Sun,
} from "lucide-react";
import { registerSearchSubjects } from "@/lib/services/search/searchRegistry";
import { useNursingSchools } from "@/lib/data/nursingSchools";
import { formatCourseDropdownName, compareCourses } from "@/lib/utils/exams/formatCourseDropdownName";
import { compareSubjects } from "@/lib/utils/exams/formatSubjectOrder";

const cleanSubjectStr = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const courseSubjectsClientCache = new Map<
  string,
  { subjects: BackendSubject[]; courseName: string }
>();

export function CourseSubjectsPage({
  panelSlug,
  courseSlug,
  courseId,
  livePanelSlug,
  showExamBuilder = false,
}: {
  panelSlug: string;
  courseSlug: string;
  courseId: string;
  livePanelSlug?: string;
  showExamBuilder?: boolean;
}) {
  const { leftWidth } = useFlexPageClasp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSchool = searchParams?.get("school");
  const currentYear = searchParams?.get("year");
  const currentSeason = searchParams?.get("season");
  const currentSearch = searchParams?.get("q") || "";

  const [selectedSchool, setSelectedSchool] = useState<string>(() => currentSchool || "All Schools");
  const [selectedYear, setSelectedYear] = useState<string>(() => currentYear || "All Years");
  const [selectedSeason, setSelectedSeason] = useState<string>(() => currentSeason || "All Seasons");

  // Listen to navbar dropdown changes
  useEffect(() => {
    const handleSchoolChange = (e: Event) => {
      const custom = e as CustomEvent<{ school: string }>;
      if (custom.detail?.school !== undefined) {
        setSelectedSchool(custom.detail.school === "all" ? "All Schools" : custom.detail.school);
      }
    };
    const handleYearChange = (e: Event) => {
      const custom = e as CustomEvent<{ year: string }>;
      if (custom.detail?.year !== undefined) {
        setSelectedYear(custom.detail.year === "all" ? "All Years" : custom.detail.year);
      }
    };
    const handleSeasonChange = (e: Event) => {
      const custom = e as CustomEvent<{ season: string }>;
      if (custom.detail?.season !== undefined) {
        setSelectedSeason(custom.detail.season === "all" ? "All Seasons" : custom.detail.season);
      }
    };

    window.addEventListener("pubnurse-school-change", handleSchoolChange);
    window.addEventListener("pubnurse-year-change", handleYearChange);
    window.addEventListener("pubnurse-season-change", handleSeasonChange);

    return () => {
      window.removeEventListener("pubnurse-school-change", handleSchoolChange);
      window.removeEventListener("pubnurse-year-change", handleYearChange);
      window.removeEventListener("pubnurse-season-change", handleSeasonChange);
    };
  }, []);

  const cacheKey = `${panelSlug}:${courseId}`;
  const cached = courseSubjectsClientCache.get(cacheKey);

  const hasValidCached = Boolean(cached?.subjects && cached.subjects.length > 0);
  const [subjects, setSubjects] = useState<BackendSubject[]>(() => (hasValidCached ? (cached?.subjects ?? []) : []));
  const [dynamicCourseName, setDynamicCourseName] = useState<string>(() => cached?.courseName ?? "");
  const [isLoading, setIsLoading] = useState<boolean>(() => !hasValidCached);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedBuilderSubject, setSelectedBuilderSubject] = useState<BackendSubject | null>(null);
  const [activeSubject, setActiveSubject] = useState<BackendSubject | null>(null);

  const filteredSubjects = useMemo(() => {
    if (!currentSearch.trim()) return subjects;
    const q = currentSearch.toLowerCase().trim();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [subjects, currentSearch]);

  const normalizedExamType =
    panelSlug === "hesi-a2"
      ? "hesi-a2"
      : panelSlug === "ati-teas"
        ? "ati-teas"
        : panelSlug === "rn-nursing"
          ? "rn-nursing"
          : panelSlug === "lpn-nursing"
            ? "lpn-nursing"
            : panelSlug === "nclex-pn"
              ? "nclex-pn"
              : "nclex-rn";

  const { courses: dashboardCourses } = useExamCourses(normalizedExamType);

  const customCoursesForBuilder: DashboardCourse[] = useMemo(() => {
    return subjects.map((s, index) => {
      const sGuid = String(s.guidId || s.id).toLowerCase();
      const sTitle = cleanSubjectStr(s.name);
      const matched = dashboardCourses.find((c) => {
        const cGuid = String(c.backendSubjectGuid || c.guidId || "").toLowerCase();
        const cId = String(c.id).toLowerCase();
        if (cGuid && (cGuid === sGuid || cId === sGuid)) return true;
        const cTitle = cleanSubjectStr(c.title);
        return cTitle === sTitle || (sTitle && cTitle && (cTitle.includes(sTitle) || sTitle.includes(cTitle)));
      });

      const subs = (s.subCategories && s.subCategories.length > 0)
        ? s.subCategories
        : (matched?.subCategories && matched.subCategories.length > 0)
          ? matched.subCategories
          : [];

      const qCount =
        s.questionCount ||
        (subs.length > 0
          ? subs.reduce((a, b) => a + (b.questionCount || 0), 0)
          : 0) ||
        matched?.questionCount ||
        0;

      return {
        id: typeof s.id === "number" ? s.id : (Number(s.id) || index + 1),
        guidId: s.guidId || String(s.id),
        backendSubjectGuid: matched?.backendSubjectGuid || s.guidId || String(s.id),
        examType: panelSlug,
        title: s.name,
        category: "subject",
        questionCount: qCount,
        examCount: s.examCount ?? (subs.length || matched?.examCount || 0),
        doneCount: matched?.doneCount || 0,
        easyPct: matched?.easyPct || 33,
        mediumPct: matched?.mediumPct || 34,
        hardPct: matched?.hardPct || 33,
        order: index + 1,
        subCategories: subs,
        examList: subs,
      };
    });
  }, [subjects, panelSlug, dashboardCourses]);

  const activeCustomCourses = useMemo(() => {
    if (!selectedBuilderSubject) return customCoursesForBuilder;
    const match = customCoursesForBuilder.find(
      (c) => String(c.backendSubjectGuid || c.guidId || c.id) === String(selectedBuilderSubject.guidId || selectedBuilderSubject.id) ||
        cleanSubjectStr(c.title) === cleanSubjectStr(selectedBuilderSubject.name)
    );
    return match ? [match] : customCoursesForBuilder;
  }, [selectedBuilderSubject, customCoursesForBuilder]);

  useEffect(() => {
    if (subjects.length > 0) {
      registerSearchSubjects(
        panelSlug,
        courseSlug,
        courseId,
        dynamicCourseName || cached?.courseName || "",
        subjects
      );
    }
  }, [panelSlug, courseSlug, courseId, dynamicCourseName, cached?.courseName, subjects]);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    const loadSubjects = async () => {
      try {
        const res = await fetch(`/api/exams/${panelSlug}/subjects/${courseId}`, {
          headers: { ...renderSystemSessionHeaders() },
        });
        if (!res.ok) {
          throw new Error(`Failed to load subjects (Status ${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          const resolvedCourseName = data?.courseName || "";
          if (resolvedCourseName) {
            setDynamicCourseName(resolvedCourseName);
          }
          const list = Array.isArray(data?.subjects) ? data.subjects : [];
          const mapped = (list as BackendSubject[])
            .map((s) => ({
              ...s,
              slug: s.slug || toSlug(s.name),
            }))
            .sort((a, b) => compareSubjects(a.name, b.name));

          courseSubjectsClientCache.set(cacheKey, {
            subjects: mapped,
            courseName: resolvedCourseName || cached?.courseName || "",
          });

          registerSearchSubjects(panelSlug, courseSlug, courseId, resolvedCourseName || cached?.courseName || "", mapped);
          setSubjects(mapped);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[CourseSubjectsPage] Failed to load subjects:", err);
        if (!cancelled) {
          if (!courseSubjectsClientCache.has(cacheKey)) setSubjects([]);
          setIsLoading(false);
        }
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [panelSlug, courseSlug, courseId, cacheKey, cached?.courseName]);

  const rawCourseName =
    dynamicCourseName ||
    courseSlug
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
      .trim() ||
    `Course ${courseId}`;
  const courseName = formatCourseDropdownName(rawCourseName);

  const panelLabel =
    panelSlug === "rn-nursing"
      ? "RN Nursing"
      : panelSlug === "lpn-nursing"
        ? "LPN Nursing"
        : panelSlug === "hesi-a2"
          ? "HESI A2"
          : panelSlug === "ati-teas"
            ? "ATI TEAS"
            : panelSlug
                .split("-")
                .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
                .join(" ");

  const backHref = `/dashboards/${panelSlug}`;

  // ─── Filter Options & Handlers ───
  const { schools } = useNursingSchools(panelSlug);

  const availableSchools = useMemo(() => {
    const combined = Array.isArray(schools) ? schools : [];
    return Array.from(new Set(combined)).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [schools]);

  const availableYears = useMemo(() => {
    const cur = new Date().getFullYear();
    const list: string[] = [];
    for (let y = cur; y >= 2018; y--) {
      list.push(String(y));
    }
    return list;
  }, []);

  const availableSeasons = useMemo(() => ["Fall", "Spring", "Summer", "Winter"], []);

  const availableProgramOptions = useMemo(
    () => ["RN Nursing Exam", "LPN Nursing Exam", "RN Exit", "PN Exit"],
    []
  );

  const isExit = searchParams?.get("track") === "exit" || courseSlug?.includes("exit");

  const currentProgramDisplay = useMemo(() => {
    if (panelSlug === "lpn-nursing") return isExit ? "PN Exit" : "LPN Nursing Exam";
    if (panelSlug === "rn-nursing") return isExit ? "RN Exit" : "RN Nursing Exam";
    return panelLabel || "Programme";
  }, [panelSlug, isExit, panelLabel]);

  const selectedProgramValue = useMemo(() => {
    const found = availableProgramOptions.find(
      (p) =>
        p.toLowerCase() === currentProgramDisplay.toLowerCase() ||
        p.toLowerCase().replace(/\s+exams?$/i, "") === currentProgramDisplay.toLowerCase().replace(/\s+exams?$/i, "")
    );
    return found || "all";
  }, [availableProgramOptions, currentProgramDisplay]);

  const handleProgramChange = (prog: string) => {
    if (!prog || prog === "all" || prog === "All Programmes") {
      router.push("/subjects");
      return;
    }
    if (/pn.*exit|lpn.*exit/i.test(prog)) {
      router.push("/subjects?track=exit&panel=lpn-nursing");
    } else if (/lpn/i.test(prog)) {
      router.push("/subjects?panel=lpn-nursing");
    } else if (/rn.*exit/i.test(prog)) {
      router.push("/subjects?track=exit&panel=rn-nursing");
    } else if (/rn/i.test(prog)) {
      router.push("/subjects?panel=rn-nursing");
    } else if (/hesi/i.test(prog)) {
      router.push("/subjects?panel=hesi-a2");
    } else if (/teas/i.test(prog)) {
      router.push("/subjects?panel=ati-teas");
    } else if (/nclex.*rn/i.test(prog)) {
      router.push("/dashboards/nclex-rn/vista/assessment/exams/distinct/overview");
    } else if (/nclex.*pn/i.test(prog)) {
      router.push("/dashboards/nclex-pn/vista/assessment/exams/distinct/overview");
    } else {
      router.push(`/subjects?program=${encodeURIComponent(prog)}`);
    }
  };

  const availableCourseOptions = useMemo(() => {
    const list: { title: string; slug: string; id: string }[] = [];
    const seen = new Set<string>();

    const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // 1. Current course if present
    if (courseName && courseId) {
      const curSlug = courseSlug || makeSlug(courseName);
      list.push({ title: courseName, slug: curSlug, id: courseId });
      seen.add(courseName.toLowerCase());
      seen.add(curSlug.toLowerCase());
    }

    // 2. Dashboard courses
    if (Array.isArray(dashboardCourses)) {
      dashboardCourses.forEach((c) => {
        if (c.title && !seen.has(c.title.toLowerCase())) {
          const s = (c as any).slug || makeSlug(c.title);
          const cid = c.guidId || String(c.id);
          list.push({ title: c.title, slug: s, id: cid });
          seen.add(c.title.toLowerCase());
          seen.add(s.toLowerCase());
        }
      });
    }

    return list.sort((a, b) => compareCourses(a.title, b.title));
  }, [dashboardCourses, courseName, courseId, courseSlug]);

  const selectedCourseValue = useMemo(() => {
    const found = availableCourseOptions.find(
      (c) =>
        c.title.toLowerCase() === courseName.toLowerCase() ||
        c.slug.toLowerCase() === courseSlug.toLowerCase() ||
        c.id === courseId
    );
    return found ? found.title : (courseName || "all");
  }, [availableCourseOptions, courseName, courseSlug, courseId]);

  const handleCourseChange = (selectedTitle: string) => {
    if (!selectedTitle || selectedTitle === "all" || selectedTitle === "All Courses") {
      router.push("/subjects");
      return;
    }
    const found = availableCourseOptions.find(
      (c) => c.title.toLowerCase() === selectedTitle.toLowerCase()
    );
    if (found) {
      const qParams = new URLSearchParams(searchParams?.toString() || "");
      const targetUrl = `/dashboards/${panelSlug}/exams/${found.slug}/${found.id}${
        qParams.toString() ? `?${qParams.toString()}` : ""
      }`;
      router.push(targetUrl);
    }
  };

  const applySchool = (sch: string) => {
    const val = sch === "all" ? "All Schools" : sch;
    setSelectedSchool(val);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pubnurse-school-change", {
          detail: { school: sch },
        })
      );
      const currentUrl = new URL(window.location.href);
      if (sch === "all" || sch === "All Schools") currentUrl.searchParams.delete("school");
      else currentUrl.searchParams.set("school", sch);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  const applyYear = (yr: string) => {
    const val = yr === "all" ? "All Years" : yr;
    setSelectedYear(val);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pubnurse-year-change", {
          detail: { year: yr },
        })
      );
      const currentUrl = new URL(window.location.href);
      if (yr === "all" || yr === "All Years") currentUrl.searchParams.delete("year");
      else currentUrl.searchParams.set("year", yr);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  const applySeason = (sn: string) => {
    const val = sn === "all" ? "All Seasons" : sn;
    setSelectedSeason(val);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pubnurse-season-change", {
          detail: { season: sn },
        })
      );
      const currentUrl = new URL(window.location.href);
      if (sn === "all" || sn === "All Seasons") currentUrl.searchParams.delete("season");
      else currentUrl.searchParams.set("season", sn);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  const isProgramActive = selectedProgramValue !== "all" && selectedProgramValue !== "All Programmes";
  const hasAnyActiveFilter = isProgramActive;

  const handleResetFilters = () => {
    handleProgramChange("all");
  };

  const openSubjectExams = (card: BackendSubject) => {
    const identifier = card.guidId || card.id;
    if (showExamBuilder) {
      const qParams = new URLSearchParams();
      qParams.set("subjectName", card.name);

      const sch = selectedSchool !== "All Schools" && selectedSchool !== "all" ? selectedSchool : currentSchool;
      if (sch && sch !== "all" && sch !== "All Schools") {
        qParams.set("school", sch);
      }
      const yr = selectedYear !== "All Years" && selectedYear !== "all" ? selectedYear : currentYear;
      if (yr && yr !== "all" && yr !== "All Years") {
        qParams.set("year", yr);
      }
      const sn = selectedSeason !== "All Seasons" && selectedSeason !== "all" ? selectedSeason : currentSeason;
      if (sn && sn !== "all" && sn !== "All Seasons") {
        qParams.set("season", sn);
      }

      const examHref = `/dashboards/${panelSlug}/exams/${courseSlug}/${courseId}/exams/${identifier}?${qParams.toString()}`;
      router.push(examHref);
    } else {
      setActiveSubject(card);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col pt-14 pb-8 md:pb-12 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        backgroundColor: "var(--content-bg)",
        color: "var(--text-color)",
      }}
    >
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-5 w-full flex-1 flex flex-col">
        {/* Header: Breadcrumb & 5 Dropdown Filters */}
        <div className="flex flex-col gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 min-w-0 max-w-full overflow-hidden whitespace-nowrap">
            <Link
              href={backHref}
              className="hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            >
              {panelLabel}
            </Link>
            <span className="text-slate-400 dark:text-slate-600 shrink-0">/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate min-w-0">
              {courseName}
            </span>
          </div>

          {/* Programme Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Programme Filter */}
            <div className="relative inline-flex items-center">
              <GraduationCap className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedProgramValue}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none focus:outline-none max-w-[140px] sm:max-w-[160px] truncate shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                title="Programme"
              >
                <option value="all">Programme</option>
                {availableProgramOptions.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasAnyActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Subjects Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
          {filteredSubjects.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] px-5 py-12 text-center shadow-xs">
              <Command className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {currentSearch
                  ? `No subjects matching "${currentSearch}".`
                  : "No subjects available for this course yet — check back soon."}
              </p>
            </div>
          ) : (
            filteredSubjects.map((card) => {
              const qCount = card.questionCount || 0;
              const exCount = card.examCount || 0;
              const isMedSurg = /med|surg|adult\s*health/i.test(card.name);

              return (
                <button
                  key={`${card.id}-${card.slug}`}
                  type="button"
                  onClick={() => openSubjectExams(card)}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 hover:shadow-md flex flex-col justify-between min-h-[108px] p-3.5 sm:p-4 transition-all duration-200 shadow-2xs text-left cursor-pointer hover:-translate-y-0.5"
                >
                  {/* Card Title */}
                  <h3 className="font-semibold text-sm sm:text-[14px] text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                    {card.name.replace(/rhenis\s*/gi, "").trim()}
                  </h3>

                  {/* Bottom Row */}
                  <div className="w-full pt-2.5 mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      {exCount > 0 && (
                        <span className="font-bold text-teal-700 dark:text-[#2FD9C4]">
                          {exCount} exams
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 font-semibold transition-colors">
                      Practice
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {showExamBuilder && (
        <NclexCustomTestPopup
          isOpen={showBuilder}
          onClose={() => {
            setShowBuilder(false);
            setSelectedBuilderSubject(null);
          }}
          panelSlug={panelSlug}
          livePanelSlug={livePanelSlug}
          title={
            selectedBuilderSubject
              ? `${selectedBuilderSubject.name.toUpperCase()} EXAM BUILDER`
              : `${courseName.toUpperCase()} EXAM BUILDER`
          }
          builderMode="questions"
          customCourses={activeCustomCourses}
          examType={normalizedExamType}
        />
      )}

      {!showExamBuilder && (
        <SubjectExamsPopup
          isOpen={activeSubject !== null}
          onClose={() => setActiveSubject(null)}
          subject={activeSubject}
          panelSlug={panelSlug}
          livePanelSlug={livePanelSlug}
        />
      )}
    </div>
  );
}
