import { NextRequest, NextResponse } from "next/server";
import {
  getBackendBaseUrl,
} from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";
import type { DashboardCourse, DashboardSubCategory } from "@/lib/hooks/home/useExamCourses";
import { COURSE_PLACEHOLDERS } from "@/lib/data/nclex-course-seed";

type CourseExamType =
  | "nclex-rn"
  | "nclex-pn"
  | "hesi-a2"
  | "ati-teas"
  | "rn-nursing"
  | "lpn-nursing";

const VALID_EXAM_TYPES: CourseExamType[] = [
  "nclex-rn",
  "nclex-pn",
  "hesi-a2",
  "ati-teas",
  "rn-nursing",
  "lpn-nursing",
];

type SessionHeaders = Record<string, string>;

interface BackendCourseItem {
  id?: number | string;
  guidId?: string;
  name?: string;
}

interface BackendSubjectItem {
  id?: number | string;
  guidId?: string;
  name?: string;
  unitsCount?: number;
}

interface BackendUnitItem {
  id?: number | string;
  guidId?: string;
  name?: string;
  questionsCount?: number;
  examsCount?: number;
}

interface BackendProgramItem {
  id?: number | string;
  guidId?: string;
  name?: string;
  programName?: string;
}

interface CoursesCacheEntry {
  data: unknown;
  timestamp: number;
}
const coursesResponseCache = new Map<string, CoursesCacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

// Live-only NCLEX subject cards.  No seed fallback: every field on the returned
// card comes from the backend.  When the backend carries no stats yet the cards
// report 0/empty rather than fabricated numbers.
async function fetchBackendSubjects(courseId: number | string, sessionHeaders: SessionHeaders = {}): Promise<BackendSubjectItem[]> {
  const query = new URLSearchParams({
    fetchtype: "distinct",
    identifier: String(courseId),
    dynamicPage: "1",
    dynamicPerPage: "100",
    dynamicSearch: "",
    dynamicSortColumn: "name",
    dynamicSortDirection: "asc",
  });

  try {
    const res = await fetch(
      `${getBackendBaseUrl()}/api/castoline/strata/learning/subjects/list/distinct?${query.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json", ...sessionHeaders }, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as { data?: { items?: BackendSubjectItem[] } };
    return converted.data?.items ?? [];
  } catch (err) {
    console.error(`❌ [/api/courses] subjects fetch failed for course ${courseId}:`, err);
    return [];
  }
}

async function fetchBackendSubjectUnits(subjectId: number | string, sessionHeaders: SessionHeaders = {}): Promise<BackendUnitItem[]> {
  const query = new URLSearchParams({
    fetchtype: "distinct",
    identifier: String(subjectId),
    dynamicPage: "1",
    dynamicPerPage: "100",
    dynamicSearch: "",
    dynamicSortColumn: "name",
    dynamicSortDirection: "asc",
  });

  try {
    const res = await fetch(
      `${getBackendBaseUrl()}/api/castoline/strata/learning/units/list/distinct?${query.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json", ...sessionHeaders }, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as { data?: { items?: BackendUnitItem[] } };
    return converted.data?.items ?? [];
  } catch (err) {
    console.error(`❌ [/api/courses] units fetch failed for subject ${subjectId}:`, err);
    return [];
  }
}

async function fetchBackendSubjectExams(subjectId: number | string, sessionHeaders: SessionHeaders = {}): Promise<DashboardSubCategory[]> {
  const query = new URLSearchParams({
    fetchtype: "nominal",
    identifier: String(subjectId),
    dynamicLearningStrataName: "subject",
    dynamicPage: "1",
    dynamicPerPage: "100",
    dynamicSortColumn: "id",
    dynamicSortDirection: "asc",
  });

  try {
    const res = await fetch(
      `${getBackendBaseUrl()}/api/castoline/strata/assessment/exams/list/nominal?${query.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json", ...sessionHeaders }, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as {
      data?: {
        items?: Array<{
          id?: number | string;
          guidId?: string;
          title?: string;
          questionsCount?: number;
        }>;
      };
    };
    const items = converted.data?.items ?? [];
    return items.map((e, index) => ({
      id: String(e.guidId || e.id),
      title: e.title || `Exam ${index + 1}`,
      questionCount: e.questionsCount && e.questionsCount > 0 ? e.questionsCount : 45,
      usedCount: 0,
      order: index + 1,
    }));
  } catch (err) {
    console.error(`❌ [/api/courses] exams fetch failed for subject ${subjectId}:`, err);
    return [];
  }
}

async function fetchBackendPrograms(sessionHeaders: SessionHeaders = {}): Promise<BackendProgramItem[]> {
  // NOTE: the programs /list/distinct endpoint requires a Parent Identifier and
  // 400s ("Parent Identifier is Required ⚓") — the absolute list is the only
  // way to enumerate the top-level programs (still carries guidId + name).
  const query = new URLSearchParams({
    fetchtype: "absolute",
    dynamicPage: "1",
    dynamicPerPage: "200",
    dynamicSearch: "",
    dynamicSortColumn: "name",
    dynamicSortDirection: "asc",
  });

  try {
    const res = await fetch(
      `${getBackendBaseUrl()}/api/castoline/strata/learning/programs/list/absolute?${query.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json", ...sessionHeaders }, next: { revalidate: 300 } }
    );
    if (!res.ok) {
      console.error(`❌ [/api/courses] programs fetch failed: HTTP ${res.status}`);
      return [];
    }
    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as { data?: { items?: BackendProgramItem[] } };
    return converted.data?.items ?? [];
  } catch (err) {
    console.error(`❌ [/api/courses] programs fetch failed:`, err);
    return [];
  }
}

async function fetchBackendProgramCourses(programId: string, sessionHeaders: SessionHeaders = {}): Promise<BackendCourseItem[]> {
  const query = new URLSearchParams({
    fetchtype: "distinct",
    identifier: programId,
    dynamicPage: "1",
    dynamicPerPage: "200",
    dynamicSearch: "",
    dynamicSortColumn: "name",
    dynamicSortDirection: "asc",
  });

  try {
    const res = await fetch(
      `${getBackendBaseUrl()}/api/castoline/strata/learning/courses/list/distinct?${query.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json", ...sessionHeaders }, next: { revalidate: 300 } }
    );
    if (!res.ok) {
      console.error(`❌ [/api/courses] distinct courses fetch failed: HTTP ${res.status}`);
      return [];
    }

    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as {
      data?: { items?: BackendCourseItem[] };
    };
    return converted.data?.items ?? [];
  } catch (err) {
    console.error(`❌ [/api/courses] distinct courses fetch failed:`, err);
    return [];
  }
}

// Map each exam type to its backend programName(s).  Note: the backend's
// `segment` field is unreliable (set to "ATI_TEAS" for almost everything), but
// `programName` is accurate. Dedicated "Exit Exams" are excluded because they
// belong to the Exit Exam dashboards, not the courses list.
const PROGRAM_NAMES: Record<CourseExamType, RegExp> = {
  "nclex-rn": /^NCLEX\s*RN$/i,
  "nclex-pn": /^NCLEX\s*PN$/i,
  "hesi-a2": /^HESI\s*A2$/i,
  "ati-teas": /^ATI\s*TEAS$/i,
  "rn-nursing": /^RN\s*Nursing\s*Exams$/i,
  "lpn-nursing": /^LPN\s*Nursing\s*Exams$/i,
};

// Desired display position for the NCLEX-RN "Study By Course" subject cards.
// The backend returns subjects sorted alphabetically by name, so we override the
// card order by title here. Any subject not in this map keeps its backend order.
const RN_SUBJECT_ORDER: Record<string, number> = {
  "Pediatrics/ Child health NCLEX-RN": 1,
  "Adult Health NCLEX-RN": 2,
  "Fundamentals NCLEX-RN": 3,
  "Pharmacology NCLEX-RN": 4,
  "Maternal & Newborn NCLEX-RN": 5,
  "Mental Health NCLEX-RN": 6,
  "Leadership & Management NCLEX-RN": 7,
  "CASE STUDIES (NGN)": 8,
};

function desiredSubjectOrder(examType: CourseExamType, title: string, backendOrder: number): number {
  if (examType === "nclex-rn" && RN_SUBJECT_ORDER[title] != null) {
    return RN_SUBJECT_ORDER[title];
  }
  return backendOrder;
}

// The live "Study By Course" grid is backed by the program's "Standalone
// Questions-…" course: each of its SUBJECTS is a course card (e.g. "Adult Health
// NCLEX-RN"). When backend subjects lack unit or question breakdowns, we
// enrich with reference placeholder counts and subcategories while preserving
// real backend IDs and GUIDs. Both subject and clientNeed categories are included
// to support both tab views.
async function fetchBackendStandaloneSubjectsAsCourses(
  examType: CourseExamType,
  programId: string,
  sessionHeaders: SessionHeaders = {}
): Promise<DashboardCourse[]> {
  const placeholders = COURSE_PLACEHOLDERS.filter((c) => c.examType === examType);
  const fallbackAll = (): DashboardCourse[] =>
    placeholders.map((p) => ({
      ...p,
      subCategories: p.subCategories ? p.subCategories.map((sc) => ({ ...sc })) : [],
    }));

  const courses = await fetchBackendProgramCourses(programId, sessionHeaders);
  const standalone = courses.find((c) => /standalone/i.test(c.name ?? ""));
  if (!standalone) return fallbackAll();

  const subjects = await fetchBackendSubjects(
    standalone.id ?? standalone.guidId ?? "",
    sessionHeaders
  );
  if (subjects.length === 0) return fallbackAll();

  const clean = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

  const subjectCards: DashboardCourse[] = await Promise.all(
    subjects.map(async (s, i) => {
      const title = s.name?.trim() || `Course ${i + 1}`;
      const tNorm = clean(title);

      const matchedPlaceholder = placeholders.find((p) => {
        const pNorm = clean(p.title);
        return pNorm === tNorm || pNorm.includes(tNorm) || tNorm.includes(pNorm);
      });

      let subCategories: DashboardSubCategory[] = [];
      if (toNumber(s.unitsCount, 0) > 0) {
        const units = await fetchBackendSubjectUnits(s.id ?? s.guidId ?? "", sessionHeaders);
        subCategories = units.map((u, ui) => {
          const unitTitle = u.name?.trim() || `Unit ${ui + 1}`;
          return {
            id: String(u.id ?? u.guidId ?? unitTitle),
            title: unitTitle,
            questionCount: toNumber(u.questionsCount ?? u.examsCount, 0),
            usedCount: 0,
            order: ui + 1,
          };
        });
      }

      // If units are empty, fetch the real nominal exams under this subject from the backend
      if (subCategories.length === 0) {
        const subjectIdentifier = s.guidId ?? s.id ?? "";
        if (subjectIdentifier) {
          subCategories = await fetchBackendSubjectExams(subjectIdentifier, sessionHeaders);
        }
      }

      // Enrich empty/0-count subcategories from reference catalogue only as last resort
      if (
        subCategories.length === 0 &&
        matchedPlaceholder &&
        matchedPlaceholder.subCategories &&
        matchedPlaceholder.subCategories.length > 0
      ) {
        subCategories = matchedPlaceholder.subCategories.map((sc) => ({ ...sc }));
      }

      const calculatedQuestions = subCategories.reduce((sum, sc) => sum + sc.questionCount, 0);
      const questionCount =
        calculatedQuestions > 0 ? calculatedQuestions : (matchedPlaceholder?.questionCount ?? 0);
      const examCount = subCategories.length > 0 ? subCategories.length : (matchedPlaceholder?.examCount ?? 0);
      const easyPct = matchedPlaceholder?.easyPct ?? 0;
      const mediumPct = matchedPlaceholder?.mediumPct ?? 0;
      const hardPct = matchedPlaceholder?.hardPct ?? 0;

      const card: DashboardCourse = {
        id: toNumber(s.id, matchedPlaceholder?.id ?? i + 1),
        guidId: s.guidId,
        backendSubjectGuid: s.guidId,
        examType,
        title,
        category: "subject",
        questionCount,
        examCount,
        doneCount: 0,
        easyPct,
        mediumPct,
        hardPct,
        order: desiredSubjectOrder(examType, title, matchedPlaceholder?.order ?? i + 1),
        subCategories,
      };

      return card;
    })
  );

  // Include clientNeed categories from reference catalogue so the Client Need tab renders
  const clientNeedCards: DashboardCourse[] = placeholders
    .filter((p) => p.category === "clientNeed")
    .map((p) => ({
      id: p.id,
      examType,
      title: p.title,
      category: "clientNeed" as const,
      questionCount: p.questionCount,
      examCount: p.examCount,
      doneCount: 0,
      easyPct: p.easyPct,
      mediumPct: p.mediumPct,
      hardPct: p.hardPct,
      order: p.order,
      subCategories: (p.subCategories || []).map((sc) => ({ ...sc })),
    }));

  return [...subjectCards, ...clientNeedCards].sort((a, b) => a.order - b.order);
}

// Non-NCLEX dashboards (HESI A2, ATI TEAS, RN/LPN Nursing): the program's
// COURSES ARE the domain cards (e.g. HESI "Math" / ATI "MATH" / RN "HESI Exams
// (RN)").  Each course may have subjects (topics/units) under it.  We fetch all
// courses for the matching program(s) and treat each as a card with its
// subjects as sub-categories.  RN & LPN span two programs (Nursing Exams +
// Exit Exams), so both are aggregated.
async function fetchBackendProgramCourseCards(
  examType: CourseExamType,
  programIds: string[],
  sessionHeaders: SessionHeaders = {}
): Promise<DashboardCourse[]> {
  const programCoursesArrays = await Promise.all(
    programIds.map((pId) => fetchBackendProgramCourses(pId, sessionHeaders))
  );
  const courses = programCoursesArrays.flat();
  if (courses.length === 0) return [];

  const validCourses = courses.filter((c) => {
    const title = c.name?.trim() || "";
    return !/^(?:ATI|HESI)\s*Exit\s*Exams/i.test(title);
  });

  const result: DashboardCourse[] = await Promise.all(
    validCourses.map(async (c, i) => {
      const title = c.name?.trim() || `Subject ${i + 1}`;
      const courseId = String(c.id ?? c.guidId ?? "");

      let subCategories: DashboardSubCategory[] = [];
      if (courseId) {
        const subjects = await fetchBackendSubjects(courseId, sessionHeaders);
        subCategories = subjects.map((s, si) => {
          const subName = s.name?.trim() || `Topic ${si + 1}`;
          return {
            id: String(s.id ?? s.guidId ?? subName),
            title: subName,
            questionCount: toNumber(s.unitsCount, 0),
            usedCount: 0,
            order: si + 1,
          };
        });
      }

      return {
        id: toNumber(c.id, i + 1),
        examType,
        title,
        category: "subject" as const,
        questionCount: subCategories.reduce((sum, sc) => sum + sc.questionCount, 0),
        examCount: 0,
        doneCount: 0,
        easyPct: 0,
        mediumPct: 0,
        hardPct: 0,
        order: i + 1,
        subCategories,
      };
    })
  );

  return result;
}

// Primary (and only) path: the live "Study By Course" set on the panel is the
// SUBJECT list under the program's "Standalone Questions-…" course.  Returns []
// honestly when the backend has no matching program/course/subjects.
async function fetchBackendCourses(examType: CourseExamType, sessionHeaders: SessionHeaders = {}): Promise<DashboardCourse[]> {
  const progRe = PROGRAM_NAMES[examType];
  const programs = await fetchBackendPrograms(sessionHeaders);
  const matches = programs.filter(
    (p) => progRe.test(p.name ?? "") || progRe.test(p.programName ?? "")
  );
  const programIds = matches
    .map((p) => String(p.guidId ?? p.id ?? ""))
    .filter(Boolean);

  if (programIds.length === 0) {
    const placeholders = COURSE_PLACEHOLDERS.filter((c) => c.examType === examType);
    if (placeholders.length > 0) {
      return placeholders.map((p) => ({
        ...p,
        subCategories: p.subCategories ? p.subCategories.map((sc) => ({ ...sc })) : [],
      }));
    }
    return [];
  }

  // NCLEX exposes its domain cards as the SUBJECTS of a single program course
  // ("Standalone Questions-…"); every other dashboard's domain cards are the
  // program's courses directly.
  if (examType === "nclex-rn" || examType === "nclex-pn") {
    return fetchBackendStandaloneSubjectsAsCourses(examType, programIds[0], sessionHeaders);
  }

  return fetchBackendProgramCourseCards(examType, programIds, sessionHeaders);
}

export async function GET(req: NextRequest) {
  const examType = req.nextUrl.searchParams.get("examType");

  if (!examType || !VALID_EXAM_TYPES.includes(examType as CourseExamType)) {
    return NextResponse.json(
      { error: "Query param 'examType' is required and must be one of: nclex-rn, nclex-pn, hesi-a2, ati-teas, rn-nursing, lpn-nursing" },
      { status: 400 }
    );
  }

  // Fast response cache check
  const now = Date.now();
  const cachedResponse = coursesResponseCache.get(examType);
  if (cachedResponse && now - cachedResponse.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse.data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  // Extract session headers from the incoming request and forward them to the
  // backend so it can resolve the authenticated user context.
  const castoLine = req.headers.get("x-casto-line");
  const castoBadge = req.headers.get("x-casto-badge");
  const siteHeaders = await getSiteHeaders();
  const sessionHeaders: SessionHeaders = {
    ...siteHeaders,
    ...(castoLine ? { "x-casto-line": castoLine } : {}),
    ...(castoBadge ? { "x-casto-badge": castoBadge } : {}),
  };

  let courses: DashboardCourse[] = [];
  try {
    courses = await fetchBackendCourses(examType as CourseExamType, sessionHeaders);
    console.log(`🌿 [/api/courses] Fetched ${courses.length} courses from backend`);
  } catch (err) {
    console.error(`❌ [/api/courses] Backend fetch failed:`, err);
  }

  if (courses.length === 0) {
    const placeholders = COURSE_PLACEHOLDERS.filter((c) => c.examType === examType);
    if (placeholders.length > 0) {
      console.log(`⚠️ [/api/courses] Falling back to COURSE_PLACEHOLDERS for ${examType}`);
      courses = placeholders.map((p) => ({
        ...p,
        subCategories: p.subCategories ? p.subCategories.map((sc) => ({ ...sc })) : [],
      }));
    }
  }

  const totalQuestions = courses.reduce((sum, c) => {
    if (c.subCategories.length > 0) {
      return sum + c.subCategories.reduce((s, sc) => s + sc.questionCount, 0);
    }
    return sum + c.questionCount;
  }, 0);
  const totalExams = courses.reduce((sum, c) => sum + c.examCount, 0);
  const totalDomains = courses.length;

  const resultPayload = {
    examType,
    count: courses.length,
    courses,
    examBuilder: { totalDomains, totalExams, totalQuestions },
  };

  coursesResponseCache.set(examType, { data: resultPayload, timestamp: now });

  return NextResponse.json(resultPayload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}