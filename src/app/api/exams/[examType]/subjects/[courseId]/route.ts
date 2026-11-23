import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {
  toSlug,
  VALID_EXAM_TYPES,
  type BackendSubject,
} from "@/lib/data/exam-subjects";
import type { DashboardSubCategory } from "@/lib/hooks/home/useExamCourses";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";
import {
  COURSE_ID_ALIASES,
} from "@/lib/data/php-exam-counts";
import { formatCourseDropdownName } from "@/lib/utils/exams/formatCourseDropdownName";

const EXAM_SEGMENTS: Record<string, string> = {
  "ati-teas": "ATI_TEAS",
  "hesi-a2": "HESI_A2",
  "rn-nursing": "RN_NURSING",
  "lpn-nursing": "LPN_NURSING",
  "nclex-rn": "NCLEX_RN",
  "nclex-pn": "NCLEX_PN",
  "cna": "CNA",
  "ged": "GED",
  "accuplacer": "ACCUPLACER",
  "pre-nursing": "PRE_NURSING",
  "certification": "CERTIFICATION",
};

function toNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  const parsed = Number(val);
  return !isNaN(parsed) ? parsed : fallback;
}

type LooseRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function extractExamQuestionCount(e: LooseRecord): number {
  if (typeof e.questionsCount === "number" && e.questionsCount > 0) return e.questionsCount;
  if (typeof e.questionCount === "number" && e.questionCount > 0) return e.questionCount;
  if (typeof e.totalQuestions === "number" && e.totalQuestions > 0) return e.totalQuestions;
  if (typeof e.QuestionsCount === "number" && e.QuestionsCount > 0) return e.QuestionsCount;
  if (typeof e.TotalQuestions === "number" && e.TotalQuestions > 0) return e.TotalQuestions;
  const resField = e.resources || e.Resources;
  if (resField) {
    try {
      const parsed = typeof resField === "string" ? JSON.parse(resField) : resField;
      const count = Number(parsed?.question_count ?? parsed?.questionCount ?? parsed?.QuestionCount ?? 0);
      if (count > 0) return count;
    } catch { }
  }
  const tqField = e.targetQuestions || e.TargetQuestions;
  if (tqField) {
    try {
      const parsed = typeof tqField === "string" ? JSON.parse(tqField) : tqField;
      if (typeof parsed?.total === "number" && parsed.total > 0) return parsed.total;
      if (Array.isArray(parsed?.ids) && parsed.ids.length > 0) return parsed.ids.length;
    } catch { }
  }
  return 0;
}

const courseNameCache = new Map<string, string>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache to eliminate remote latency

const subjectNominalDataCache = new Map<
  string,
  {
    data: {
      examCount: number;
      questionCount: number;
      subCategories: DashboardSubCategory[];
    };
    timestamp: number;
  }
>();
const SUBJECT_NOMINAL_TTL_MS = 15 * 60 * 1000; // 15 minutes

const pendingCourseFetches = new Map<string, Promise<CourseSubjectsResponseData>>();

interface BackendSubjectItem {
  id?: number | string;
  guidId?: string;
  name?: string;
  description?: string;
  segment?: string;
  coursesCount?: number;
  unitsCount?: number;
  examsCount?: number;
  order?: number | string;
  rank?: number | string;
  position?: number | string;
  sortOrder?: number | string;
  displayOrder?: number | string;
}

function parseOrder(value: unknown, fallbackIndex: number): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 10000 + fallbackIndex;
}

interface CourseSubjectsResponseData {
  examType: string;
  courseId: string;
  courseName: string;
  segment: string | null;
  subjects: BackendSubject[];
}

const courseSubjectsResponseCache = new Map<string, { data: CourseSubjectsResponseData; timestamp: number }>();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examType: string; courseId: string }> }
) {
  const { examType, courseId } = await params;

  if (!(VALID_EXAM_TYPES as readonly string[]).includes(examType)) {
    return NextResponse.json(
      {
        error: `Unknown exam type '${examType}'. Valid types: ${VALID_EXAM_TYPES.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  // Check in-memory cache first
  const cacheKey = `${examType}:${courseId}`;
  const now = Date.now();
  const cachedCourse = courseSubjectsResponseCache.get(cacheKey);
  if (cachedCourse && now - cachedCourse.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedCourse.data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  const effectiveCourseId = COURSE_ID_ALIASES[courseId] || courseId;
  const segment = EXAM_SEGMENTS[examType] ?? null;

  // Forward the caller's session headers so the backend accepts the request.
  let castoLine = req.headers.get("x-casto-line");
  let castoBadge = req.headers.get("x-casto-badge");

  if (!castoBadge) {
    castoBadge = req.cookies.get("skew_blanc_session_badge")?.value || null;
  }
  if (!castoLine && castoBadge) {
    const rawLine = req.cookies.get("skew_blanc_session_line")?.value;
    if (rawLine) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawLine));
        castoLine = parsed[castoBadge] || Object.values(parsed)[0] || null;
      } catch {
        try {
          const parsed = JSON.parse(rawLine);
          castoLine = parsed[castoBadge] || Object.values(parsed)[0] || null;
        } catch {
          castoLine = rawLine;
        }
      }
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(await getSiteHeaders()),
  };
  if (castoLine) headers["x-casto-line"] = castoLine;
  if (castoBadge) headers["x-casto-badge"] = castoBadge;
  const authHeader = req.headers.get("authorization");
  if (authHeader) headers["authorization"] = authHeader;
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) headers["cookie"] = cookieHeader;

  // If effectiveCourseId is numeric, resolve its GUID from backend courses so .NET backend doesn't fail
  let courseGuid = effectiveCourseId.includes("-") ? effectiveCourseId : "";
  if (!courseGuid) {
    try {
      const coursesUrl = `${getBackendBaseUrl()}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200`;
      const cRes = await fetch(coursesUrl, { headers, cache: "no-store" });
      if (cRes.ok) {
        const cData = await cRes.json();
        const courses = cData.data?.items || [];
        const found = courses.find(
          (c: { id?: number | string; guidId?: string }) =>
            String(c.id) === effectiveCourseId || c.guidId === effectiveCourseId
        );
        if (found?.guidId) {
          courseGuid = found.guidId;
        }
        if (found?.name) {
          const formattedName = formatCourseDropdownName(found.name);
          courseNameCache.set(effectiveCourseId, formattedName);
          if (found.guidId) {
            courseNameCache.set(found.guidId, formattedName);
          }
        }
      }
    } catch (err) {
      console.warn(`[subjects route] Course GUID lookup failed for ${effectiveCourseId}:`, err);
    }
  }

  const queryIdentifier = courseGuid || effectiveCourseId;
  const query = new URLSearchParams({
    fetchtype: "distinct",
    identifier: queryIdentifier,
    dynamicPage: "1",
    dynamicPerPage: "100",
    dynamicSearch: "",
  });

  try {
    const url = `${getBackendBaseUrl()}/api/castoline/strata/learning/subjects/list/distinct?${query.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Backend responded ${res.status}`);
    }

    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as {
      data?: { items?: BackendSubjectItem[] };
    };

    let items = converted.data?.items ?? [];

    // Course 21 is "Comprehensive HESI A2 Exams". The backend database contains
    // misplaced "READING Comprehension" subjects under course 21 that belong to Course 16.
    if (examType === "hesi-a2" && (courseId === "21" || courseId === "22")) {
      const hasCompHesi = items.some((s) => /comprehensive hesi/i.test(s.name ?? ""));
      if (hasCompHesi) {
        items = items.filter((s) => !/reading comprehension/i.test(s.name ?? ""));
      }
    }

    // Clean name whitespace and punctuation
    items = items.map((item) => ({
      ...item,
      name: item.name ? item.name.trim().replace(/\s*\.+$/, "").trim() : item.name,
    }));

    // Deduplicate subjects by normalized name
    const seenNames = new Set<string>();
    items = items.filter((item) => {
      const norm = (item.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seenNames.has(norm)) return false;
      seenNames.add(norm);
      return true;
    });

    // Dynamic sorting by backend order/rank/position; if explicit order is present, respect it; otherwise sort chronologically if subjects contain years
    items.sort((a, b) => {
      const hasOrderA = (a.order !== undefined && a.order !== null) || (a.position !== undefined && a.position !== null) || (a.rank !== undefined && a.rank !== null);
      const hasOrderB = (b.order !== undefined && b.order !== null) || (b.position !== undefined && b.position !== null) || (b.rank !== undefined && b.rank !== null);
      if (hasOrderA || hasOrderB) {
        const oa = parseOrder(a.order ?? a.position ?? a.rank ?? a.sortOrder ?? a.displayOrder, 0);
        const ob = parseOrder(b.order ?? b.position ?? b.rank ?? b.sortOrder ?? b.displayOrder, 0);
        if (oa !== ob) return oa - ob;
      }

      const ya = Number(a.name?.match(/\b(202\d)\b/)?.[1] ?? 0);
      const yb = Number(b.name?.match(/\b(202\d)\b/)?.[1] ?? 0);
      if (ya && yb && ya !== yb) return ya - yb;
      return 0;
    });

    // Look up courseName dynamically from backend first, cache, then fallback
    let courseName = courseNameCache.get(effectiveCourseId) || "";
    if (!courseName) {
      try {
        const coursesUrl = `${getBackendBaseUrl()}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200`;
        const cRes = await fetch(coursesUrl, { headers, cache: "no-store" });
        if (cRes.ok) {
          const cData = await cRes.json();
          const courses = cData.data?.items || [];
          const found = courses.find(
            (c: { id?: number | string; guidId?: string }) =>
              String(c.id) === effectiveCourseId || c.guidId === effectiveCourseId
          );
          if (found?.name) {
            courseName = formatCourseDropdownName(found.name);
            courseNameCache.set(effectiveCourseId, courseName);
          }
        }
      } catch (err) {
        console.warn(`[subjects route] Course lookup failed:`, err);
      }
    }


    // Fetch true live exams and question count per subject directly from backend nominal endpoint (cached with SWR)
    const liveSubjectData = await Promise.all(
      items.map(async (c) => {
        const subGuid = c.guidId || (c as { GuidId?: string }).GuidId || (typeof c.id === "string" && c.id.includes("-") ? c.id : "");
        const subId = subGuid || c.id;
        if (!subId) return { examCount: 0, questionCount: 0, subCategories: [] };

        const cacheSubKey = String(subId);
        const cachedNominal = subjectNominalDataCache.get(cacheSubKey);
        if (cachedNominal && Date.now() - cachedNominal.timestamp < SUBJECT_NOMINAL_TTL_MS) {
          return cachedNominal.data;
        }

        try {
          const nominalUrl = `${getBackendBaseUrl()}/api/castoline/strata/assessment/exams/list/nominal?fetchtype=nominal&identifier=${subId}&dynamicLearningStrataName=subject&dynamicPage=1&dynamicPerPage=100&dynamicSortColumn=updatedAt&dynamicSortDirection=desc`;
          const res = await fetch(nominalUrl, {
            headers,
            cache: "no-store",
            signal: AbortSignal.timeout(4000),
          });
          if (res.ok) {
            const rawData = await res.json();
            const convertedData = convertBackendKeysToCamel(rawData) as LooseRecord;
            const rawItems: LooseRecord[] = convertedData?.data?.items || rawData?.data?.items || rawData?.Data?.Items || [];
            const examCount = convertedData?.data?.skewTotal ?? rawData?.data?.skewTotal ?? rawItems.length;

            const subCategories: DashboardSubCategory[] = rawItems.map((e, index) => {
              const qCount = extractExamQuestionCount(e);
              const examId = String(e.guidId || e.id || e.GuidId || e.Id);
              const examTitle = e.title || e.Title || "";
              return {
                id: examId,
                title: examTitle,
                questionCount: qCount,
                difficulty: e.difficulty || e.Difficulty || null,
                usedCount: 0,
                order: index + 1,
              };
            });

            const totalQuestions = subCategories.reduce((sum, sc) => sum + sc.questionCount, 0);

            const result = {
              examCount: Math.max(typeof examCount === "number" ? examCount : 0, subCategories.length),
              questionCount: totalQuestions,
              subCategories,
            };
            subjectNominalDataCache.set(cacheSubKey, { data: result, timestamp: Date.now() });
            return result;
          }
        } catch (err) {
          console.warn(`[subjects route] Failed to load exams for subject ${subId}:`, err);
        }
        const fallbackCount = toNumber(c.examsCount ?? c.unitsCount ?? 0, 0);
        return { examCount: fallbackCount, questionCount: 0, subCategories: [] };
      })
    );

    const subjects: BackendSubject[] = items.map((c, i) => {
      const name = (c.name?.trim() || "")
        .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
        .replace(/rhenis\s*/gi, "")
        .trim();
      const live = liveSubjectData[i] || { examCount: 0, questionCount: 0, subCategories: [] };
      const guid = c.guidId || (typeof c.id === "string" && c.id.includes("-") ? c.id : undefined);

      return {
        id: guid ?? c.id ?? "",
        guidId: guid,
        name,
        slug: toSlug(name),
        description: c.description || "",
        coursesCount: toNumber(c.coursesCount, 0),
        order: parseOrder(c.order ?? c.position ?? c.rank ?? c.sortOrder ?? c.displayOrder, i + 1),
        examCount: live.examCount,
        questionCount: live.questionCount,
        subCategories: live.subCategories,
      };
    });

    subjects.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

    // Return all subjects assigned to this course, with dynamic exam counts attached
    const finalSubjects = subjects.length > 0 ? subjects : [];

    const responseData: CourseSubjectsResponseData = {
      examType,
      courseId,
      courseName: formatCourseDropdownName(courseName),
      segment,
      subjects: finalSubjects,
    };
    courseSubjectsResponseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error(
      `❌ [/api/exams/${examType}/subjects/${courseId}] Backend fetch failed:`,
      err
    );
    if (cachedCourse) {
      return NextResponse.json(cachedCourse.data, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }
    return NextResponse.json({ examType, courseId, segment, subjects: [] });
  }
}