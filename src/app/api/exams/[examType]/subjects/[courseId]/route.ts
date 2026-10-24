import { NextRequest, NextResponse } from "next/server";
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
  PHP_COURSE_NAMES,
} from "@/lib/data/php-exam-counts";

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

const courseNameCache = new Map<string, string>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

interface BackendSubjectItem {
  id?: number | string;
  guidId?: string;
  name?: string;
  description?: string;
  segment?: string;
  unitsCount?: number;
  examsCount?: number;
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

  if (!VALID_EXAM_TYPES.includes(examType)) {
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
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  const effectiveCourseId = COURSE_ID_ALIASES[courseId] || courseId;
  const segment = EXAM_SEGMENTS[examType] ?? null;

  // Forward the caller's session headers so the backend accepts the request.
  const castoLine = req.headers.get("x-casto-line");
  const castoBadge = req.headers.get("x-casto-badge");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(await getSiteHeaders()),
  };
  if (castoLine) headers["x-casto-line"] = castoLine;
  if (castoBadge) headers["x-casto-badge"] = castoBadge;

  // If effectiveCourseId is numeric, resolve its GUID from backend courses so .NET backend doesn't fail
  let courseGuid = effectiveCourseId.includes("-") ? effectiveCourseId : "";
  if (!courseGuid) {
    try {
      const coursesUrl = `${getBackendBaseUrl()}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200`;
      const cRes = await fetch(coursesUrl, { headers, next: { revalidate: 300 } });
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
          courseNameCache.set(effectiveCourseId, found.name);
          if (found.guidId) {
            courseNameCache.set(found.guidId, found.name);
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
    dynamicSortColumn: "name",
    dynamicSortDirection: "asc",
  });

  try {
    const url = `${getBackendBaseUrl()}/api/castoline/strata/learning/subjects/list/distinct?${query.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      next: { revalidate: 300 },
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

    // Sort chronologically if subjects contain years (2023, 2024, 2025, 2026)
    items.sort((a, b) => {
      const ya = Number(a.name?.match(/\b(202\d)\b/)?.[1] ?? 0);
      const yb = Number(b.name?.match(/\b(202\d)\b/)?.[1] ?? 0);
      if (ya && yb && ya !== yb) return ya - yb;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });

    // Look up courseName dynamically from backend first, cache, then fallback
    let courseName = courseNameCache.get(effectiveCourseId) || "";
    if (!courseName) {
      try {
        const coursesUrl = `${getBackendBaseUrl()}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200`;
        const cRes = await fetch(coursesUrl, { headers, next: { revalidate: 300 } });
        if (cRes.ok) {
          const cData = await cRes.json();
          const courses = cData.data?.items || [];
          const found = courses.find(
            (c: { id?: number | string; guidId?: string }) =>
              String(c.id) === effectiveCourseId || c.guidId === effectiveCourseId
          );
          if (found?.name) {
            courseName = found.name;
            courseNameCache.set(effectiveCourseId, courseName);
          }
        }
      } catch (err) {
        console.warn(`[subjects route] Course lookup failed:`, err);
      }
    }
    if (!courseName) {
      courseName = PHP_COURSE_NAMES[courseId] || PHP_COURSE_NAMES[effectiveCourseId] || "";
    }

    // Fetch true live exam count per subject directly from backend nominal endpoint
    const liveCounts = await Promise.all(
      items.map(async (c) => {
        const subId = c.guidId ?? c.id;
        if (!subId) return 0;
        try {
          const nominalCountUrl = `${getBackendBaseUrl()}/api/castoline/strata/assessment/exams/list/nominal?fetchtype=nominal&identifier=${subId}&dynamicLearningStrataName=subject&dynamicPage=1&dynamicPerPage=1`;
          const res = await fetch(nominalCountUrl, { headers, next: { revalidate: 300 } });
          if (res.ok) {
            const data = await res.json();
            const count = data.data?.skewTotal ?? data.data?.totalItems ?? (data.data?.items || []).length;
            if (typeof count === "number" && count > 0) {
              return count;
            }
          }
        } catch {
          // No exams found for this subject in backend
        }
        return 0;
      })
    );

    const subjects: BackendSubject[] = items.map((c, i) => {
      const name = c.name?.trim() || `Subject ${i + 1}`;
      const examCount = liveCounts[i] || 0;
      const subCategories: DashboardSubCategory[] = [];

      const questionCount = subCategories.reduce((sum, sc) => sum + sc.questionCount, 0);
      const guid = c.guidId || (typeof c.id === "string" && c.id.includes("-") ? c.id : undefined);

      return {
        id: guid ?? c.id ?? name,
        guidId: guid,
        name,
        slug: toSlug(name),
        description: c.description,
        examCount,
        questionCount,
        subCategories,
      };
    });

    // Return all subjects assigned to this course, with dynamic exam counts attached
    const finalSubjects = subjects.length > 0 ? subjects : [];

    const responseData: CourseSubjectsResponseData = {
      examType,
      courseId,
      courseName,
      segment,
      subjects: finalSubjects,
    };
    courseSubjectsResponseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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