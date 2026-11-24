"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import { useNominalStrataExams, type StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { ArrowLeft, BookOpen, Calendar, Check, ChevronLeft, ChevronRight, FileQuestion, Flame, GraduationCap, Loader2, Lock, Play, RefreshCw, School, Search, Sun, X } from "lucide-react";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
import { NclexCustomTestPopup } from "@/components/common/dashboards/nclex/NclexDashboardSections";
import { useRelativeStrataAssessmentResults } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import { useExamCourses, type DashboardCourse, type DashboardSubCategory } from "@/lib/hooks/home/useExamCourses";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";
import { resolveExamSchool } from "@/lib/utils/exams/resolveExamSchool";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";
import { registerSearchExams } from "@/lib/services/search/searchRegistry";
import { formatCourseDropdownName } from "@/lib/utils/exams/formatCourseDropdownName";
import { useExamAccessGuard } from "@/components/common/dashboards/modals/useExamAccessGuard";

const PER_PAGE = 100;

type LoadStatus = "idle" | "loading" | "ready" | "error";

/**
 * Full-page exam hierarchy for a single subject under a course, e.g. rendered
 * at /dashboards/{panel}/exams/{courseSlug}/{courseId}/exams/{subjectId}.
 *
 * Fetches the subject's exams via strata "Exam / NominalFetch" and renders each
 * card with Practice / Review / Exam mode buttons that launch the shared
 * live-panel exam player.
 */
interface SubjectExamsHierarchyCacheItem {
  exams: (StrataItem & { modes?: string[] })[];
  courseName?: string;
  subjectName?: string;
  showCustomTestButton?: boolean;
  hideSeason?: boolean;
}
type SubCategoryExtras = DashboardSubCategory & {
  examCount?: number;
  subCategories?: DashboardSubCategory[];
};

type ExamWithParentNames = StrataItem & {
  subjectName?: string;
  courseName?: string;
  school?: string | null;
  schoolName?: string | null;
  institution?: string | null;
  institutionName?: string | null;
};

interface ExamQuestionCountSource {
  questionsCount?: number | null;
  questionCount?: number | null;
  totalQuestions?: number | null;
  targetQuestions?: unknown;
  resources?: unknown;
}

const subjectExamsHierarchyClientCache = new Map<string, SubjectExamsHierarchyCacheItem>();

function extractExamQuestionCount(e: ExamQuestionCountSource): number {
  if (typeof e.questionsCount === "number" && e.questionsCount > 0) return e.questionsCount;
  if (typeof e.questionCount === "number" && e.questionCount > 0) return e.questionCount;
  if (typeof e.totalQuestions === "number" && e.totalQuestions > 0) return e.totalQuestions;
  if (e.targetQuestions) {
    try {
      const parsed = typeof e.targetQuestions === "string" ? JSON.parse(e.targetQuestions) : e.targetQuestions;
      if (typeof parsed?.total === "number" && parsed.total > 0) return parsed.total;
      if (Array.isArray(parsed?.ids) && parsed.ids.length > 0) return parsed.ids.length;
    } catch { }
  }
  if (e.resources) {
    try {
      const parsed = typeof e.resources === "string" ? JSON.parse(e.resources) : e.resources;
      if (typeof parsed?.question_count === "number" && parsed.question_count > 0) return parsed.question_count;
      if (typeof parsed?.questionCount === "number" && parsed.questionCount > 0) return parsed.questionCount;
    } catch { }
  }
  return 0;
}

const cleanSubjectStr = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const NEW_BADGE_DAYS = 14;
const isNewExam = (createdAt?: string | Date | null) => {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (isNaN(t)) return false;
  const age = Date.now() - t;
  return age >= 0 && age <= NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
};

export function SubjectExamsHierarchyPage({
  panelSlug,
  livePanelSlug,
  panelLabel,
  courseSlug,
  courseId,
  subjectId,
}: {
  panelSlug: string;
  livePanelSlug: string;
  panelLabel: string;
  courseSlug: string;
  courseId: string;
  subjectId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectName = searchParams?.get("subjectName") ?? "";
  const mergedIdsParam = searchParams?.get("mergedIds") ?? "";
  const { leftWidth } = useFlexPageClasp();

  const targetSubjectIds = useMemo(() => {
    if (mergedIdsParam) {
      const ids = mergedIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) return Array.from(new Set(ids));
    }
    return [subjectId];
  }, [mergedIdsParam, subjectId]);

  const isMerged = targetSubjectIds.length > 1;
  const cacheKey = `${panelSlug}:${courseId}:${targetSubjectIds.slice().sort().join("_")}`;
  const cached = subjectExamsHierarchyClientCache.get(cacheKey);

  const [exams, setExams] = useState<(StrataItem & { modes?: string[] })[]>(() => cached?.exams ?? []);
  const [dynamicCourseName, setDynamicCourseName] = useState<string>(() => cached?.courseName ?? "");
  const [dynamicSubjectName, setDynamicSubjectName] = useState<string>(() => cached?.subjectName ?? "");
  const [showCustomTest, setShowCustomTest] = useState(() => cached?.showCustomTestButton ?? false);
  const [hideSeason, setHideSeason] = useState(() => cached?.hideSeason ?? false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [status, setStatus] = useState<LoadStatus>(() => (cached?.exams?.length ? "ready" : "idle"));
  const [currentPage, setCurrentPage] = useState(1);

  // Client-side search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(
    () => searchParams?.get("course") || "all"
  );
  const currentCourseRef = useRef<string>(selectedCourseFilter);
  currentCourseRef.current = selectedCourseFilter;
  const handleCourseChangeRef = useRef<((selectedTitle: string) => Promise<void> | void) | undefined>(undefined);

  const [selectedYear, setSelectedYear] = useState<string>(
    () => searchParams?.get("year") || "all"
  );
  const [selectedSeason, setSelectedSeason] = useState<string>(
    () => searchParams?.get("season") || "all"
  );
  const [selectedSchool, setSelectedSchool] = useState<string>(
    () => searchParams?.get("school") || "all"
  );

  useEffect(() => {
    const c = searchParams?.get("course");
    const nextCourse = c && c !== "all" ? c : "all";
    setSelectedCourseFilter(nextCourse);
    currentCourseRef.current = nextCourse;

    const s = searchParams?.get("school");
    setSelectedSchool(s && s !== "all" ? s : "all");

    const y = searchParams?.get("year");
    setSelectedYear(y && y !== "all" ? y : "all");

    const sn = searchParams?.get("season");
    setSelectedSeason(sn && sn !== "all" ? sn : "all");
  }, [searchParams]);

  useEffect(() => {
    const handleCourseChangeEvt = (e: Event) => {
      const custom = e as CustomEvent<{ course: string }>;
      if (custom.detail?.course !== undefined) {
        const nextCourse = custom.detail.course;
        if (currentCourseRef.current.toLowerCase() !== nextCourse.toLowerCase()) {
          currentCourseRef.current = nextCourse;
          setSelectedCourseFilter(nextCourse);
          handleCourseChangeRef.current?.(nextCourse);
        }
      }
    };
    const handleSchoolChange = (e: Event) => {
      const custom = e as CustomEvent<{ school: string }>;
      if (custom.detail?.school !== undefined) {
        setSelectedSchool(custom.detail.school);
      }
    };
    const handleYearChange = (e: Event) => {
      const custom = e as CustomEvent<{ year: string }>;
      if (custom.detail?.year !== undefined) {
        setSelectedYear(custom.detail.year);
      }
    };
    const handleSeasonChange = (e: Event) => {
      const custom = e as CustomEvent<{ season: string }>;
      if (custom.detail?.season !== undefined) {
        setSelectedSeason(custom.detail.season);
      }
    };

    window.addEventListener("nurseford-course-change", handleCourseChangeEvt);
    window.addEventListener("nurseford-school-change", handleSchoolChange);
    window.addEventListener("nurseford-year-change", handleYearChange);
    window.addEventListener("nurseford-season-change", handleSeasonChange);

    return () => {
      window.removeEventListener("nurseford-course-change", handleCourseChangeEvt);
      window.removeEventListener("nurseford-school-change", handleSchoolChange);
      window.removeEventListener("nurseford-year-change", handleYearChange);
      window.removeEventListener("nurseford-season-change", handleSeasonChange);
    };
  }, []);

  const applyCourse = (crs: string) => {
    currentCourseRef.current = crs;
    setSelectedCourseFilter(crs);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nurseford-course-change", { detail: { course: crs } }));
      const currentUrl = new URL(window.location.href);
      if (crs === "all" || crs === "All Courses") currentUrl.searchParams.delete("course");
      else currentUrl.searchParams.set("course", crs);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  const applyYear = (yr: string) => {
    setSelectedYear(yr);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nurseford-year-change", { detail: { year: yr } }));
      const currentUrl = new URL(window.location.href);
      if (yr === "all") currentUrl.searchParams.delete("year");
      else currentUrl.searchParams.set("year", yr);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  const applySeason = (sn: string) => {
    setSelectedSeason(sn);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nurseford-season-change", { detail: { season: sn } }));
      const currentUrl = new URL(window.location.href);
      if (sn === "all") currentUrl.searchParams.delete("season");
      else currentUrl.searchParams.set("season", sn);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

  const applySchool = (sch: string) => {
    setSelectedSchool(sch);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nurseford-school-change", { detail: { school: sch } }));
      const currentUrl = new URL(window.location.href);
      if (sch === "all") currentUrl.searchParams.delete("school");
      else currentUrl.searchParams.set("school", sch);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  };

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

  // ─── Access guard ───
  const { programs } = useRelativeStrataPrograms();
  const { guard, modal: accessModal } = useExamAccessGuard(panelSlug, panelLabel);
  const openBuilder = () => guard(true, () => setIsBuilderOpen(true));

  const matchingDashboardCourse = useMemo(() => {
    if (!dashboardCourses || dashboardCourses.length === 0) return null;
    const targetSubId = String(subjectId).trim().toLowerCase();
    const targetTitle = cleanSubjectStr(dynamicSubjectName || subjectName);

    // 1. Direct match on top-level course
    const direct = dashboardCourses.find((c) => {
      const cGuid = String(c.backendSubjectGuid || c.guidId || "").toLowerCase();
      const cId = String(c.id).toLowerCase();
      if (cGuid && (cGuid === targetSubId || cId === targetSubId)) return true;
      const cTitle = cleanSubjectStr(c.title);
      if (targetTitle && cTitle) {
        if (cTitle === targetTitle) return true;
        if (cTitle.includes(targetTitle) || targetTitle.includes(cTitle)) return true;
      }
      return false;
    });
    if (direct) return direct;

    // 2. Search inside subCategories of all courses
    for (const c of dashboardCourses) {
      for (const sc of c.subCategories || []) {
        const scId = String(sc.id).toLowerCase();
        const scTitle = cleanSubjectStr(sc.title);
        const matchesId = scId === targetSubId;
        const matchesTitle = targetTitle && scTitle && (scTitle === targetTitle || scTitle.includes(targetTitle) || targetTitle.includes(scTitle));
        if (matchesId || matchesTitle) {
          return {
            id: Number(sc.id) || c.id,
            guidId: String(sc.id),
            backendSubjectGuid: String(sc.id),
            examType: c.examType,
            title: sc.title,
            category: c.category,
            questionCount: sc.questionCount,
            examCount: (sc as SubCategoryExtras).examCount ?? 0,
            doneCount: sc.usedCount ?? 0,
            easyPct: c.easyPct,
            mediumPct: c.mediumPct,
            hardPct: c.hardPct,
            order: sc.order,
            subCategories: (sc as SubCategoryExtras).subCategories || [],
          };
        }
      }
    }

    return null;
  }, [dashboardCourses, subjectId, dynamicSubjectName, subjectName]);

  useEffect(() => {
    if (exams.length > 0) {
      registerSearchExams(
        panelSlug,
        subjectId,
        dynamicSubjectName || cached?.subjectName || subjectName,
        exams
      );
    }
  }, [panelSlug, subjectId, dynamicSubjectName, cached?.subjectName, subjectName, exams]);

  const formattedUpdateDate = useMemo(() => {
    let latest: Date | null = null;
    for (const e of exams) {
      const dt = e.updatedAt || e.createdAt;
      if (dt) {
        const d = new Date(dt);
        if (!isNaN(d.getTime()) && (!latest || d > latest)) {
          latest = d;
        }
      }
    }
    if (latest) {
      return latest.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    }
    return getPreviousDayFormatted();
  }, [exams]);

  const { filteredExamResults: allResults } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 200,
    sortColumn: null,
    sortDirection: "asc",
  });

  const { filteredExams: nominalExams } = useNominalStrataExams({
    parentIdentifier: subjectId,
    dynamicLearningStrataName: "subject",
    page: 1,
    perPage: 100,
    allowEmptyParent: false,
  });

  const completedExamIds = useMemo(() => {
    const completedSet = new Set<string>();

    allResults.forEach((r) => {
      const hasScore = r.percentageScore != null || r.score != null;
      const isCompleted =
        hasScore ||
        r.status === "Completed" ||
        r.status === "Finished";

      if (isCompleted) {
        if (r.examGuidId) completedSet.add(r.examGuidId);
        if (r.examId) completedSet.add(String(r.examId));
      }
    });

    nominalExams.forEach((ne) => {
      const actions = ne.examActions ?? [];
      const hasCompleted = actions.some((a) => a.status === "Completed" || a.status === "Finished");
      if (hasCompleted) {
        if (ne.guidId) completedSet.add(ne.guidId);
        if (ne.id) completedSet.add(String(ne.id));
      }
    });

    return completedSet;
  }, [allResults, nominalExams]);

  const getCourseTitleForSubId = useCallback(
    (sId: string): string => {
      if (!sId || !Array.isArray(dashboardCourses)) return "";
      for (const c of dashboardCourses) {
        if (
          c.subCategories?.some(
            (sc) =>
              String(sc.id) === String(sId) ||
              (Boolean((sc as any).guidId) && String((sc as any).guidId) === String(sId))
          )
        ) {
          return c.title;
        }
      }
      return "";
    },
    [dashboardCourses]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [subjectId]);

  useEffect(() => {
    if (!subjectId) return;

    let cancelled = false;
    if (!subjectExamsHierarchyClientCache.has(cacheKey)) {
      setStatus("loading");
      setExams([]);
    }
    setSearchQuery("");
    const initialSchool = searchParams?.get("school") || "all";
    const initialYear = searchParams?.get("year") || "all";
    const initialSeason = searchParams?.get("season") || "all";
    setSelectedYear(initialYear);
    setSelectedSeason(initialSeason);
    setSelectedSchool(initialSchool);

    const loadExams = async () => {
      try {
        // Fetch nominal exams across all targetSubjectIds (supports single or merged subjects)
        const fetchExamsForSubject = async (subId: string): Promise<StrataItem[]> => {
          const courseForSub = getCourseTitleForSubId(subId);
          const result = await strataService<{
            items?: StrataItem[];
            skewTotal?: number;
            skewTotalPages?: number;
          }>("Exam", "NominalFetch", {
            identifier: subId,
            dynamicPage: 1,
            dynamicPerPage: PER_PAGE,
            dynamicSearch: "",
            dynamicSortColumn: "updatedAt",
            dynamicSortDirection: "desc",
            dynamicLearningStrataName: "subject",
          });

          if (result?.error) {
            console.warn(`[SubjectExamsHierarchyPage] Error fetching exams for ${subId}:`, result.error);
            return [];
          }

          const items = [...(result?.data?.items ?? [])];
          const totalPages = result?.data?.skewTotalPages ?? 1;

          if (totalPages > 1 && items.length < (result?.data?.skewTotal ?? 0)) {
            const remainingPagePromises = [];
            for (let p = 2; p <= totalPages; p++) {
              remainingPagePromises.push(
                strataService<{ items?: StrataItem[] }>("Exam", "NominalFetch", {
                  identifier: subId,
                  dynamicPage: p,
                  dynamicPerPage: PER_PAGE,
                  dynamicSearch: "",
                  dynamicSortColumn: "updatedAt",
                  dynamicSortDirection: "desc",
                  dynamicLearningStrataName: "subject",
                })
              );
            }
            const additionalResults = await Promise.allSettled(remainingPagePromises);
            for (const res of additionalResults) {
              if (res.status === "fulfilled" && res.value?.data?.items) {
                items.push(...res.value.data.items);
              }
            }
          }

          items.forEach((item: any) => {
            if (!item.courseName && courseForSub) {
              item.courseName = courseForSub;
            }
            if (!item.subjectGuidId) {
              item.subjectGuidId = subId;
            }
          });

          return items;
        };

        const allResults = await Promise.all(targetSubjectIds.map(fetchExamsForSubject));
        if (cancelled) return;

        const rawItems = allResults.flat();

        // Deduplicate in case overlapping items occur across pages or courses
        const seenExamIds = new Set<string>();
        const uniqueItems = rawItems.filter((e) => {
          const key = String(e.guidId || e.id);
          if (seenExamIds.has(key)) return false;
          seenExamIds.add(key);
          return true;
        });

        const currentCached = subjectExamsHierarchyClientCache.get(cacheKey);
        const firstItem = rawItems[0] as ExamWithParentNames | undefined;
        const rawSubName = subjectName || firstItem?.subjectName || currentCached?.subjectName || "Examinations";
        const resolvedSubName = rawSubName
          .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
          .replace(/rhenis\s*/gi, "")
          .trim();
        const resolvedCourseName = isMerged
          ? "RN Nursing Subjects"
          : (firstItem?.courseName || currentCached?.courseName || "")
              .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
              .replace(/rhenis\s*/gi, "")
              .trim();

        const sortedExams = [...uniqueItems].sort((a, b) => {
          const yrB = extractExamYear(b.title, resolvedSubName, b.year, b.createdAt) ?? 0;
          const yrA = extractExamYear(a.title, resolvedSubName, a.year, a.createdAt) ?? 0;
          if (yrB !== yrA) return yrB - yrA;

          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;

          return (Number(b.id) || 0) - (Number(a.id) || 0);
        });

        subjectExamsHierarchyClientCache.set(cacheKey, {
          exams: sortedExams,
          courseName: resolvedCourseName,
          subjectName: resolvedSubName,
          showCustomTestButton: false,
          hideSeason: false,
        });

        if (resolvedSubName) setDynamicSubjectName(resolvedSubName);
        if (resolvedCourseName) setDynamicCourseName(resolvedCourseName);
        setExams(sortedExams);
        registerSearchExams(panelSlug, subjectId, resolvedSubName, sortedExams);
        setStatus("ready");
      } catch (err) {
        console.error("[SubjectExamsHierarchyPage] Failed to load exams:", err);
        if (!cancelled) setStatus("error");
      }
    };

    loadExams();

    return () => {
      cancelled = true;
    };
  }, [panelSlug, courseId, subjectId, subjectName, cacheKey, searchParams, targetSubjectIds, isMerged]);

  const launchExam = (examTarget: (StrataItem & { modes?: string[] }) | string, mode: string) => {
    const idToUse = typeof examTarget === "string" ? examTarget : (examTarget.guidId ?? String(examTarget.id));
    router.push(`/web/${livePanelSlug}/vista/exam/generic?mode=${mode}&identifier=${idToUse}`);
  };

  const startExam = (examTarget: (StrataItem & { modes?: string[] }) | string, mode: string) => {
    const gateTarget =
      typeof examTarget === "string"
        ? exams.find((e) => e.guidId === examTarget || String(e.id) === examTarget)
        : examTarget;
    guard(gateTarget?.accessType !== "Public", () => launchExam(examTarget, mode));
  };

  const rawCourseName =
    dynamicCourseName ||
    courseSlug
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
      .trim() ||
    `Course ${courseId}`;
  const courseName = isMerged ? "RN Nursing Subjects" : formatCourseDropdownName(rawCourseName);

  const currentSubjectTitle = dynamicSubjectName || subjectName || "Examinations";
  const backHref = isMerged ? "/subjects" : `/dashboards/${panelSlug}/exams/${courseSlug}/${courseId}`;

  const customCoursesForBuilder: DashboardCourse[] = useMemo(() => {
    const subCategoriesMap = new Map<string, DashboardSubCategory>();

    if (matchingDashboardCourse?.subCategories?.length) {
      for (const sc of matchingDashboardCourse.subCategories) {
        subCategoriesMap.set(sc.id, sc);
        subCategoriesMap.set(cleanSubjectStr(sc.title), sc);
      }
    }

    const mappedFromExams: DashboardSubCategory[] = exams.map((e, index) => {
      const keyId = String(e.guidId || e.id);
      const titleKey = cleanSubjectStr(e.title);
      const matched = subCategoriesMap.get(keyId) || subCategoriesMap.get(titleKey);

      const qCount =
        matched?.questionCount && matched.questionCount > 0
          ? matched.questionCount
          : e.questionsCount && e.questionsCount > 0
            ? e.questionsCount
            : extractExamQuestionCount(e);

      return {
        id: keyId,
        title: e.title,
        questionCount: qCount,
        usedCount: matched?.usedCount ?? 0,
        order: index + 1,
        difficulty: matched?.difficulty ?? e.difficulty ?? null,
        easyCount: matched?.easyCount,
        mediumCount: matched?.mediumCount,
        hardCount: matched?.hardCount,
      };
    });

    let finalSubs: DashboardSubCategory[] = [];
    if (mappedFromExams.length > 0) {
      finalSubs = [...mappedFromExams];
      if (matchingDashboardCourse?.subCategories?.length) {
        const existingIds = new Set(finalSubs.map((s) => s.id));
        const existingTitles = new Set(finalSubs.map((s) => cleanSubjectStr(s.title)));
        for (const sc of matchingDashboardCourse.subCategories) {
          if (!existingIds.has(sc.id) && !existingTitles.has(cleanSubjectStr(sc.title))) {
            finalSubs.push(sc);
          }
        }
      }
    } else {
      finalSubs = matchingDashboardCourse?.subCategories || [];
    }

    const totalQuestions = finalSubs.reduce((sum, sc) => sum + sc.questionCount, 0);

    let easyTotal = 0;
    let medTotal = 0;
    let hardTotal = 0;
    for (const sc of finalSubs) {
      if (sc.easyCount) easyTotal += sc.easyCount;
      if (sc.mediumCount) medTotal += sc.mediumCount;
      if (sc.hardCount) hardTotal += sc.hardCount;
    }
    const catTotal = easyTotal + medTotal + hardTotal;
    const easyPct = catTotal > 0 ? Math.round((easyTotal / catTotal) * 100) : (matchingDashboardCourse?.easyPct ?? 33);
    const mediumPct = catTotal > 0 ? Math.round((medTotal / catTotal) * 100) : (matchingDashboardCourse?.mediumPct ?? 34);
    const hardPct = catTotal > 0 ? Math.round((hardTotal / catTotal) * 100) : (matchingDashboardCourse?.hardPct ?? 33);

    return [
      {
        id: Number(subjectId) || matchingDashboardCourse?.id || 1,
        guidId: String(subjectId),
        backendSubjectGuid: matchingDashboardCourse?.backendSubjectGuid || String(subjectId),
        examType: panelSlug,
        title: currentSubjectTitle || matchingDashboardCourse?.title || "Examinations",
        category: "subject",
        questionCount: totalQuestions || matchingDashboardCourse?.questionCount || 0,
        examCount: finalSubs.length,
        doneCount: matchingDashboardCourse?.doneCount || 0,
        easyPct,
        mediumPct,
        hardPct,
        order: 1,
        subCategories: finalSubs,
      },
    ];
  }, [matchingDashboardCourse, exams, subjectId, panelSlug, currentSubjectTitle]);

  // Unique years dynamically fetched from exams for this subject
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    exams.forEach((e) => {
      const yr = extractExamYear(e.title, currentSubjectTitle, e.year);
      if (yr) years.add(String(yr));
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [exams, currentSubjectTitle]);

  // Split availableYears into vertical columns of up to 3 items each
  const yearColumns = useMemo(() => {
    const cols: string[][] = [];
    for (let i = 0; i < availableYears.length; i += 3) {
      cols.push(availableYears.slice(i, i + 3));
    }
    return cols;
  }, [availableYears]);

  const availableSeasons = useMemo(() => {
    const seasons = new Set<string>();
    exams.forEach((e) => {
      const resolved = resolveExamSeason(e.season, e.title, e.description);
      if (resolved) seasons.add(resolved);
      else if (e.season) seasons.add(e.season);
    });
    const order = ["Fall", "Spring", "Summer", "Winter"];
    return Array.from(seasons).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [exams]);

  const availableSchools = useMemo(() => {
    const schools = new Set<string>();
    const effectiveCourseName = dynamicCourseName || courseSlug;
    exams.forEach((e) => {
      const examWithCourse = {
        ...(e as ExamWithParentNames),
        courseName: (e as ExamWithParentNames).courseName || effectiveCourseName,
      };
      const resolved = resolveExamSchool(examWithCourse);
      if (resolved) schools.add(resolved);
    });
    return Array.from(schools).sort((a, b) => a.localeCompare(b));
  }, [exams, dynamicCourseName, courseSlug]);

  // Programme filter options
  const availableProgramOptions = useMemo(() => {
    const defaultPrograms = [
      "RN Nursing Exam",
      "LPN Nursing Exam",
      "RN Exit",
      "PN Exit",
    ];
    const set = new Set<string>(defaultPrograms);
    if (Array.isArray(programs)) {
      programs.forEach((p) => {
        if (p?.name) set.add(p.name);
      });
    }
    return Array.from(set);
  }, [programs]);

  const currentProgramDisplay = useMemo(() => {
    if (panelSlug === "lpn-nursing") return "LPN Nursing Exam";
    if (panelSlug === "rn-nursing") return "RN Nursing Exam";
    return panelLabel || "Programme";
  }, [panelSlug, panelLabel]);

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
      router.push("/dashboards/lpn-nursing?track=exit");
    } else if (/lpn/i.test(prog)) {
      router.push("/dashboards/lpn-nursing");
    } else if (/rn.*exit/i.test(prog)) {
      router.push("/dashboards/rn-nursing?track=exit");
    } else if (/rn/i.test(prog)) {
      router.push("/dashboards/rn-nursing");
    } else {
      router.push(`/subjects?program=${encodeURIComponent(prog)}`);
    }
  };

  // Course filter options
  const availableCourseOptions = useMemo(() => {
    const list: { title: string; slug: string; id: string }[] = [];
    const seen = new Set<string>();

    const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // 1. Include courses present in the loaded exams (crucial for merged subjects!)
    exams.forEach((e) => {
      const cn = (e as ExamWithParentNames).courseName;
      if (cn && !seen.has(cn.toLowerCase())) {
        const s = toSlug(cn);
        list.push({ title: cn, slug: s, id: s });
        seen.add(cn.toLowerCase());
        seen.add(s.toLowerCase());
      }
    });

    // 2. Include current route course if single-course
    if (courseName && courseId && !isMerged) {
      const curSlug = courseSlug || toSlug(courseName);
      if (!seen.has(courseName.toLowerCase())) {
        list.push({ title: courseName, slug: curSlug, id: courseId });
        seen.add(courseName.toLowerCase());
        seen.add(curSlug.toLowerCase());
      }
    }

    // 3. Include dashboard courses so user can select any course
    if (Array.isArray(dashboardCourses)) {
      dashboardCourses.forEach((c) => {
        if (c.title && !seen.has(c.title.toLowerCase())) {
          const s = toSlug(c.title);
          const cid = c.guidId || String(c.id);
          list.push({ title: c.title, slug: s, id: cid });
          seen.add(c.title.toLowerCase());
          seen.add(s.toLowerCase());
        }
      });
    }

    return list;
  }, [dashboardCourses, courseName, courseId, courseSlug, exams, isMerged]);

  const selectedCourseValue = useMemo(() => {
    if (selectedCourseFilter && selectedCourseFilter !== "all" && selectedCourseFilter !== "All Courses") {
      return selectedCourseFilter;
    }
    if (isMerged) return "all";
    return courseName || "all";
  }, [selectedCourseFilter, isMerged, courseName]);

  const handleCourseChange = async (selectedTitle: string) => {
    // 1. If selecting "All Courses" or "all":
    if (!selectedTitle || selectedTitle === "all" || selectedTitle === "All Courses") {
      applyCourse("all");
      return;
    }

    const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // 2. If on a merged subject (exams from all courses are loaded in memory),
    // filter in-place immediately without navigating away!
    if (isMerged) {
      applyCourse(selectedTitle);
      return;
    }

    // 3. If on a single course and selecting current course:
    if (courseName && courseName.toLowerCase() === selectedTitle.toLowerCase()) {
      applyCourse(selectedTitle);
      return;
    }

    // 4. Try finding the SAME subject in the selected course to stay at the Exam Level!
    const found = availableCourseOptions.find(
      (c) => c.title.toLowerCase() === selectedTitle.toLowerCase()
    );

    const normalizeForCourseMatch = (s?: string) =>
      (s || "")
        .toLowerCase()
        .replace(/\b(rn|lpn|exams?)\b/gi, "")
        .replace(/[^a-z0-9]/g, "");

    const targetClean = normalizeForCourseMatch(dynamicSubjectName || subjectName || currentSubjectTitle);

    // Check dashboardCourses in-memory
    const foundCourse = dashboardCourses?.find(
      (c) =>
        c.title.toLowerCase() === selectedTitle.toLowerCase() ||
        (found && (c.guidId === found.id || String(c.id) === found.id))
    );

    if (foundCourse && Array.isArray(foundCourse.subCategories)) {
      const matchingSub = foundCourse.subCategories.find((sc) => {
        const scClean = normalizeForCourseMatch(sc.title);
        return (
          scClean === targetClean ||
          scClean.includes(targetClean) ||
          targetClean.includes(scClean) ||
          (scClean.includes("pediatric") && targetClean.includes("pediatric")) ||
          (scClean.includes("maternal") && targetClean.includes("maternal")) ||
          (scClean.includes("mental") && targetClean.includes("mental"))
        );
      });

      if (matchingSub) {
        const cSlug = (foundCourse as any).slug || toSlug(foundCourse.title);
        const cId = foundCourse.guidId || String(foundCourse.id);
        router.push(
          `/dashboards/${panelSlug}/exams/${cSlug}/${cId}/exams/${matchingSub.id}?subjectName=${encodeURIComponent(
            matchingSub.title
          )}`
        );
        return;
      }
    }

    // Fallback: fetch subjects for this course from API to find matching subject
    if (found?.id) {
      try {
        const res = await fetch(`/api/exams/${panelSlug}/subjects/${found.id}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const subs: any[] = Array.isArray(data?.subjects) ? data.subjects : [];
          const matched = subs.find((s) => {
            const sClean = normalizeForCourseMatch(s.name || s.title);
            return (
              sClean === targetClean ||
              sClean.includes(targetClean) ||
              targetClean.includes(sClean) ||
              (sClean.includes("pediatric") && targetClean.includes("pediatric")) ||
              (sClean.includes("maternal") && targetClean.includes("maternal")) ||
              (sClean.includes("mental") && targetClean.includes("mental"))
            );
          });
          if (matched) {
            const subId = matched.guidId || String(matched.id);
            router.push(
              `/dashboards/${panelSlug}/exams/${found.slug}/${found.id}/exams/${subId}?subjectName=${encodeURIComponent(
                matched.name || matched.title
              )}`
            );
            return;
          }
        }
      } catch (e) {
        console.warn("[SubjectExamsHierarchyPage] Fallback subject lookup error:", e);
      }
    }

    // If matching subject doesn't exist under that course, filter in-place so user is never redirected away
    applyCourse(selectedTitle);
  };
  handleCourseChangeRef.current = handleCourseChange;

  // Synchronize dynamically resolved subject courses, schools, years, and seasons with the global Navbar dropdowns
  useEffect(() => {
    if (typeof window !== "undefined" && availableCourseOptions.length > 0) {
      window.dispatchEvent(
        new CustomEvent("nurseford-available-courses-update", {
          detail: { courses: availableCourseOptions.map((c) => c.title) },
        })
      );
    }
  }, [availableCourseOptions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nurseford-available-schools-update", {
          detail: { schools: availableSchools },
        })
      );
    }
  }, [availableSchools]);

  useEffect(() => {
    if (typeof window !== "undefined" && availableYears.length > 0) {
      window.dispatchEvent(
        new CustomEvent("nurseford-available-years-update", {
          detail: { years: availableYears },
        })
      );
    }
  }, [availableYears]);

  useEffect(() => {
    if (typeof window !== "undefined" && availableSeasons.length > 0) {
      window.dispatchEvent(
        new CustomEvent("nurseford-available-seasons-update", {
          detail: { seasons: availableSeasons },
        })
      );
    }
  }, [availableSeasons]);

  // Answer on-demand requests from Navbar when it mounts or re-renders
  useEffect(() => {
    const handleRequest = () => {
      if (typeof window !== "undefined") {
        if (availableCourseOptions.length > 0) {
          window.dispatchEvent(
            new CustomEvent("nurseford-available-courses-update", {
              detail: { courses: availableCourseOptions.map((c) => c.title) },
            })
          );
        }
        window.dispatchEvent(
          new CustomEvent("nurseford-available-schools-update", {
            detail: { schools: availableSchools },
          })
        );
        if (availableYears.length > 0) {
          window.dispatchEvent(
            new CustomEvent("nurseford-available-years-update", {
              detail: { years: availableYears },
            })
          );
        }
        if (availableSeasons.length > 0) {
          window.dispatchEvent(
            new CustomEvent("nurseford-available-seasons-update", {
              detail: { seasons: availableSeasons },
            })
          );
        }
      }
    };
    window.addEventListener("nurseford-request-available-schools", handleRequest);
    return () => {
      window.removeEventListener("nurseford-request-available-schools", handleRequest);
    };
  }, [availableSchools, availableYears, availableSeasons, availableCourseOptions]);

  // Auto-reset school filter to 'all' if the selected school doesn't exist under this subject's exams
  useEffect(() => {
    if (
      selectedSchool !== "all" &&
      availableSchools.length > 0 &&
      !availableSchools.includes(selectedSchool)
    ) {
      setSelectedSchool("all");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nurseford-school-change", { detail: { school: "all" } })
        );
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("school");
        window.history.replaceState({}, "", currentUrl.toString());
      }
    }
  }, [availableSchools, selectedSchool]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const yrNum = extractExamYear(exam.title, currentSubjectTitle, exam.year);
      const examYr = yrNum ? String(yrNum) : "";
      const examSeason = resolveExamSeason(exam.season, exam.title, exam.description) || exam.season;
      const examSchool = resolveExamSchool({
        ...(exam as ExamWithParentNames),
        courseName: (exam as ExamWithParentNames).courseName || dynamicCourseName || courseSlug,
      });
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = exam.title?.toLowerCase().includes(q);
        const matchYear = examYr ? examYr.includes(q) : false;
        const matchSeason = examSeason ? examSeason.toLowerCase().includes(q) : false;
        const matchSchool = examSchool ? examSchool.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchYear && !matchSeason && !matchSchool) return false;
      }
      if (selectedYear !== "all") {
        if (examYr !== selectedYear) return false;
      }
      if (selectedSeason !== "all") {
        if (!examSeason || examSeason.toLowerCase() !== selectedSeason.toLowerCase()) return false;
      }
      if (selectedSchool !== "all") {
        if (!examSchool || examSchool.toLowerCase() !== selectedSchool.toLowerCase()) return false;
      }

      // Course filter check
      if (selectedCourseFilter && selectedCourseFilter !== "all" && selectedCourseFilter !== "All Courses") {
        const examCourse = (
          (exam as ExamWithParentNames).courseName ||
          getCourseTitleForSubId(String((exam as any).subjectGuidId || (exam as any).subjectId || "")) ||
          ""
        ).toLowerCase();
        const target = selectedCourseFilter.toLowerCase().trim();
        const examTitle = (exam.title || "").toLowerCase();
        const examDesc = (exam.description || "").toLowerCase();

        const matchesCourse =
          examCourse.includes(target) ||
          examTitle.includes(target) ||
          examDesc.includes(target) ||
          ((target.includes("a-t") || target.includes("ati")) && (examCourse.includes("a-t") || examTitle.includes("a-t") || examCourse.includes("ati") || examTitle.includes("ati"))) ||
          ((target.includes("h-s") || target.includes("hesi")) && (examCourse.includes("h-s") || examTitle.includes("h-s") || examCourse.includes("hesi") || examTitle.includes("hesi"))) ||
          ((target.includes("exemplify") || target.includes("rhem")) &&
            (examCourse.includes("exemplify") || examCourse.includes("rhem") || examTitle.includes("exemplify") || examTitle.includes("rhem"))) ||
          (target.includes("general") && (examCourse.includes("general") || examTitle.includes("general")));

        if (!matchesCourse) return false;
      }

      return true;
    }).sort((a, b) => {
      const yrB = extractExamYear(b.title, currentSubjectTitle, b.year, b.createdAt) ?? 0;
      const yrA = extractExamYear(a.title, currentSubjectTitle, a.year, a.createdAt) ?? 0;
      if (yrB !== yrA) return yrB - yrA;

      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;

      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [
    exams,
    searchQuery,
    selectedCourseFilter,
    selectedYear,
    selectedSeason,
    selectedSchool,
    currentSubjectTitle,
    dynamicCourseName,
    courseSlug,
    getCourseTitleForSubId,
  ]);

  const [perPage, setPerPage] = useState<number>(100);

  // Reset pagination to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourseFilter, selectedYear, selectedSeason, selectedSchool, perPage]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / perPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedExams = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filteredExams.slice(start, start + perPage);
  }, [filteredExams, safePage, perPage]);

  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(filteredExams.length, startIndex + perPage);

  const getVisiblePages = (current: number, total: number, windowSize = 2) => {
    const pages: (number | "ellipsis")[] = [];
    const start = Math.max(2, current - windowSize);
    const end = Math.min(total - 1, current + windowSize);

    pages.push(1);
    if (start > 2) pages.push("ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("ellipsis");
    if (total > 1) pages.push(total);

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="p-3 md:p-5 lg:p-6 space-y-3.5 sm:space-y-4 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Top Breadcrumb & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-slate-600 dark:text-white/70 min-w-0 max-w-full overflow-hidden whitespace-nowrap">
            <Link
              href={`/dashboards/${panelSlug}`}
              className="hover:text-slate-950 dark:hover:text-white transition-colors font-medium shrink-0"
            >
              {panelLabel}
            </Link>
            <span className="text-slate-400 dark:text-white/40 font-normal shrink-0">/</span>
            <Link
              href={backHref}
              className="hover:text-slate-950 dark:hover:text-white transition-colors font-medium shrink-0 max-w-[130px] sm:max-w-none truncate"
              title={courseName}
            >
              {courseName}
            </Link>
            <span className="text-slate-400 dark:text-white/40 font-normal shrink-0">/</span>
            <span
              className="text-slate-950 dark:text-white font-semibold truncate min-w-0"
              title={currentSubjectTitle}
            >
              {currentSubjectTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to</span> {courseName}
            </Link>
          </div>
        </div>

        {/* Filter Toolbar (Pill style matching subjects catalog) */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {/* Programme Filter */}
          <div className="relative inline-flex items-center">
            <GraduationCap className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedProgramValue}
              onChange={(e) => handleProgramChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none focus:outline-none max-w-[140px] sm:max-w-[160px] truncate shadow-2xs"
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

          {/* Course Filter */}
          <div className="relative inline-flex items-center">
            <BookOpen className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedCourseValue}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none focus:outline-none max-w-[140px] sm:max-w-[180px] truncate shadow-2xs"
              title={selectedCourseValue !== "all" ? `Course: ${formatCourseDropdownName(selectedCourseValue)}` : "Course"}
            >
              <option value="all">Course</option>
              {availableCourseOptions.map((c) => (
                <option key={c.title} value={c.title}>
                  {formatCourseDropdownName(c.title)}
                </option>
              ))}
            </select>
          </div>

          {/* School Filter */}
          {availableSchools.length > 0 && (
            <div className="relative inline-flex items-center">
              <School className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedSchool}
                onChange={(e) => applySchool(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none focus:outline-none max-w-[160px] truncate shadow-2xs"
              >
                <option value="all">All Schools</option>
                {availableSchools.map((sch) => (
                  <option key={sch} value={sch}>{sch}</option>
                ))}
              </select>
            </div>
          )}

          {/* Year Filter */}
          {availableYears.length > 0 && (
            <div className="relative inline-flex items-center">
              <Calendar className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedYear}
                onChange={(e) => applyYear(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none focus:outline-none shadow-2xs"
              >
                <option value="all">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          )}

          {/* Season Filter */}
          {!hideSeason && availableSeasons.length > 0 && (
            <div className="relative inline-flex items-center">
              <Sun className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedSeason}
                onChange={(e) => applySeason(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none focus:outline-none shadow-2xs"
              >
                <option value="all">All Seasons</option>
                {availableSeasons.map((sn) => (
                  <option key={sn} value={sn}>{sn}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters */}
          {(selectedYear !== "all" || selectedSeason !== "all" || selectedSchool !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                applyYear("all");
                applySeason("all");
                applySchool("all");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Exam Cards */}
        {status === "loading" || status === "idle" ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--card-bg,#15273e)] px-5 py-12 space-y-3 shadow-md">
            <Loader2 className="w-6 h-6 text-teal-600 dark:text-[#2FD9C4] animate-spin" />
            <p className="text-sm text-slate-600 dark:text-white/50 font-medium">Loading exams…</p>
          </div>
        ) : status === "error" ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-50 dark:bg-red-950/20 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Couldn&rsquo;t load exams right now.
            </p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--card-bg,#15273e)] px-5 py-10 text-center shadow-md">
            <FileQuestion className="w-10 h-10 text-slate-400 dark:text-white/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-white/60">
              {exams.length === 0 ? "No exams available yet — check back soon." : "No exams match your filters."}
            </p>
          </div>
        ) : (
          <>
            {/* Pagination summary row & Per Page selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-600 dark:text-white/60">
              <div>
                Showing <span className="font-bold text-slate-900 dark:text-white">{startIndex + 1}</span>–<span className="font-bold text-slate-900 dark:text-white">{endIndex}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredExams.length}</span> exams
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Per page:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-medium text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={50} className="dark:bg-[#15273e]">50</option>
                  <option value={100} className="dark:bg-[#15273e]">100</option>
                  <option value={200} className="dark:bg-[#15273e]">200</option>
                  <option value={500} className="dark:bg-[#15273e]">All</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {paginatedExams.map((exam) => {
                const examId = exam.guidId ?? String(exam.id);
                const hasFreeAccess = exam.accessType === "Free";
                const allowedModes = exam.modes || ["Practice", "Review", "Exam"];

                const examIdStr = String(exam.id ?? "");
                const examGuid = exam.guidId ? String(exam.guidId) : "";
                const examTitleKey = exam.title ? exam.title.trim().toLowerCase() : "";

                const nominalMatch = nominalExams.find(
                  (ne) =>
                    (examGuid && (ne.guidId === examGuid || String(ne.id) === examGuid)) ||
                    (examIdStr && (String(ne.id) === examIdStr || ne.guidId === examIdStr)) ||
                    (examTitleKey && ne.title && ne.title.trim().toLowerCase() === examTitleKey)
                );

                const actions = exam.examActions?.length
                  ? exam.examActions
                  : (nominalMatch?.examActions ?? []);
                const hasCompletedAction = actions.some((a) => a.status === "Completed" || a.status === "Finished");
                const hasResultCompleted =
                  (examGuid ? completedExamIds.has(examGuid) : false) ||
                  (examIdStr ? completedExamIds.has(examIdStr) : false) ||
                  (examId ? completedExamIds.has(String(examId)) : false) ||
                  exam.status === "Completed";
                const isCompleted = hasCompletedAction || hasResultCompleted;
                const showNew = isNewExam(exam.createdAt);

                const matchingSub = matchingDashboardCourse?.subCategories?.find(
                  (sc) =>
                    sc.id === examGuid ||
                    sc.id === examIdStr ||
                    sc.id === examId ||
                    cleanSubjectStr(sc.title) === cleanSubjectStr(exam.title)
                );
                const resolvedQCount =
                  exam.questionsCount && exam.questionsCount > 0
                    ? exam.questionsCount
                    : matchingSub?.questionCount && matchingSub.questionCount > 0
                      ? matchingSub.questionCount
                      : extractExamQuestionCount(exam);

                const examYr = extractExamYear(exam.title, currentSubjectTitle, exam.year);
                const resolvedSeason = resolveExamSeason(exam.season, exam.title, exam.description) || exam.season;

                return (
                  <div
                    key={examId}
                    className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 hover:shadow-md flex flex-col justify-between p-3 sm:p-3.5 transition-all duration-200 shadow-2xs text-left"
                  >
                    {showNew && (
                      <span className="absolute -top-2 right-4 z-10 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-2xs">
                        New
                      </span>
                    )}

                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                        {resolvedSeason ? `${resolvedSeason} ` : ""}{examYr ? `${examYr}` : courseName}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 ml-auto">
                          <Check className="w-2.5 h-2.5" />
                          Done
                        </span>
                      ) : hasFreeAccess ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 ml-auto">
                          Free
                        </span>
                      ) : null}
                    </div>

                    {/* Card Title */}
                    <h3 className="font-semibold sm:font-bold text-xs sm:text-sm text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                      {(exam.title || "").replace(/rhenis\s*/gi, "").trim()}
                    </h3>

                    {/* Bottom Row */}
                    <div className="w-full pt-2 mt-2 flex items-center justify-end border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 ml-auto">
                        {allowedModes.includes("Practice") && (
                          <button
                            type="button"
                            onClick={() => startExam(exam, "Practice")}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-teal-200/90 dark:border-teal-700/60 bg-teal-50/80 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 hover:border-teal-300 shadow-2xs transition-all cursor-pointer"
                            title="Practice Mode (Immediate Feedback)"
                          >
                            Practice
                          </button>
                        )}
                        {allowedModes.includes("Exam") && (
                          <button
                            type="button"
                            onClick={() => startExam(exam, "Exam")}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-blue-200/90 dark:border-blue-700/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-300 shadow-2xs transition-all cursor-pointer"
                            title="Exam Mode (Simulation)"
                          >
                            Exam
                          </button>
                        )}
                        {allowedModes.includes("Review") && (
                          <button
                            type="button"
                            onClick={() => startExam(exam, "Review")}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-purple-200/90 dark:border-purple-700/60 bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-300 shadow-2xs transition-all cursor-pointer"
                            title="Review Mode (Study)"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="text-xs text-slate-600 dark:text-white/60">
                  Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {getVisiblePages(currentPage, totalPages).map((p, i) =>
                      p === "ellipsis" ? (
                        <span key={`ell-${i}`} className="px-2 text-xs text-slate-400 select-none">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePageChange(p)}
                          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-[0.96] ${p === currentPage
                            ? "border border-teal-500/80 dark:border-teal-400/60 bg-teal-500/25 dark:bg-teal-500/30 text-teal-800 dark:text-teal-300 shadow-2xs"
                            : "border border-slate-300/80 dark:border-white/15 bg-white/60 dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10"
                            }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {accessModal}

      <NclexCustomTestPopup
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        panelSlug={panelSlug}
        livePanelSlug={livePanelSlug}
        title={`${currentSubjectTitle.toUpperCase()} EXAM BUILDER`}
        builderMode="questions"
        customCourses={customCoursesForBuilder}
        examType={normalizedExamType}
        initialCategory="subject"
      />
    </div>
  );
}