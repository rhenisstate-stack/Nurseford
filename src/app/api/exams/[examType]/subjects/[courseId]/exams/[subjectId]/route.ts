import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";
import {
  COURSE_ID_ALIASES,
} from "@/lib/data/php-exam-counts";

import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";

interface BackendExam {
  id: number;
  guidId: string;
  title: string;
  description?: string;
  duration?: number;
  year?: number;
  season?: string;
  questionsCount?: number;
  sectionsCount?: number;
  accessType?: string;
  status?: string;
  modes?: string[];
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
  created_at?: string;
  examActions?: unknown[];
  actions?: unknown[];
}

const subjectExamsResponseCache = new Map<string, { data: unknown; timestamp: number }>();
const courseNameCache = new Map<string, string>();
const subjectNameCache = new Map<string, string>();
const CACHE_TTL_MS = 0;

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      examType: string;
      courseId: string;
      subjectId: string;
    }>;
  }
) {
  const { examType, courseId, subjectId } = await params;
  const searchParams = req.nextUrl.searchParams;
  let subjectName = searchParams.get("subjectName") || "";
  const dynamicSearch = searchParams.get("search") || "";

  const effectiveCourseId = COURSE_ID_ALIASES[courseId] || courseId;
  const effectiveSubjectId = subjectId;

  const castoLine = req.headers.get("x-casto-line");
  const castoBadge = req.headers.get("x-casto-badge");
  const authHeader = req.headers.get("authorization");
  const cookieHeader = req.headers.get("cookie");

  // In-memory cache check (only when unauthenticated, to avoid caching user-specific action statuses)
  const isAuthRequest = Boolean(castoLine || authHeader || cookieHeader);
  const cacheKey = `${examType}:${effectiveCourseId}:${effectiveSubjectId}:${subjectName}:${dynamicSearch}`;
  const now = Date.now();
  if (!isAuthRequest) {
    const cachedResponse = subjectExamsResponseCache.get(cacheKey);
    if (cachedResponse && now - cachedResponse.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedResponse.data, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(await getSiteHeaders()),
  };
  if (castoLine) headers["x-casto-line"] = castoLine;
  if (castoBadge) headers["x-casto-badge"] = castoBadge;
  if (authHeader) headers["authorization"] = authHeader;
  if (cookieHeader) headers["cookie"] = cookieHeader;

  const baseUrl = getBackendBaseUrl();

  // If effectiveCourseId is numeric, resolve its GUID
  let resolvedCourseGuid = effectiveCourseId.includes("-") ? effectiveCourseId : "";
  if (!resolvedCourseGuid) {
    try {
      const coursesUrl = `${baseUrl}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200`;
      const cRes = await fetch(coursesUrl, { headers, cache: "no-store" });
      if (cRes.ok) {
        const cData = await cRes.json();
        const courses = cData.data?.items || cData.Data?.Items || [];
        const found = courses.find(
          (c: { id?: number | string; guidId?: string; Id?: number | string }) =>
            String(c.id ?? c.Id) === effectiveCourseId || c.guidId === effectiveCourseId
        );
        if (found?.guidId) {
          resolvedCourseGuid = found.guidId;
        }
        if (found?.name || found?.Name) {
          courseNameCache.set(effectiveCourseId, found.name || found.Name);
        }
      }
    } catch {
      // fallback
    }
  }

  // 1. Direct nominal fetch if exams are directly linked to this subject in backend
  try {
    const candidateSubjectIds = [effectiveSubjectId];

    // If effectiveSubjectId is numeric, resolve its GUID from backend subjects so .NET backend doesn't fail
    if (!effectiveSubjectId.includes("-")) {
      try {
        const queryCourseId = resolvedCourseGuid || effectiveCourseId;
        const subsUrl = `${baseUrl}/api/castoline/strata/learning/subjects/list/distinct?fetchtype=distinct&identifier=${queryCourseId}&dynamicPage=1&dynamicPerPage=100`;
        const sRes = await fetch(subsUrl, { headers, cache: "no-store" });
        if (sRes.ok) {
          const sData = await sRes.json();
          const subs = sData.data?.items || sData.Data?.Items || [];
          const foundSub = subs.find(
            (s: { id?: number | string; guidId?: string; name?: string; Id?: number | string; GuidId?: string; Name?: string }) =>
              String(s.id ?? s.Id) === effectiveSubjectId ||
              (subjectName && (s.name || s.Name)?.trim().toLowerCase() === subjectName.trim().toLowerCase())
          );
          const subGuid = foundSub?.guidId || foundSub?.GuidId;
          if (subGuid && !candidateSubjectIds.includes(subGuid)) {
            candidateSubjectIds.unshift(subGuid);
          }
          if (foundSub?.name && !subjectName) {
            subjectName = foundSub.name;
          }
        }
      } catch (err) {
        console.warn("[exams route] Failed to resolve subject GUID:", err);
      }
    }

    let items: (BackendExam & { subjectName?: string })[] = [];
    for (const targetSubId of candidateSubjectIds) {
      const nominalUrl = `${baseUrl}/api/castoline/strata/assessment/exams/list/nominal?fetchtype=nominal&identifier=${targetSubId}&dynamicLearningStrataName=subject&dynamicPage=1&dynamicPerPage=500&dynamicSortColumn=updatedAt&dynamicSortDirection=desc`;
      const nominalRes = await fetch(nominalUrl, { headers, cache: "no-store" });
      if (nominalRes.ok) {
        const nominalData = await nominalRes.json();
        const rawItems = nominalData.data?.items || nominalData.Data?.Items || [];
        const converted = convertBackendKeysToCamel({ items: rawItems }) as {
          items?: (BackendExam & { subjectName?: string })[];
        };
        const fetchedItems = converted.items || [];
        if (fetchedItems.length > 0) {
          items = fetchedItems;
          break;
        }
      }
    }

    // Resolve course name dynamically from backend first, cache, then fallback
    let courseName = courseNameCache.get(effectiveCourseId) || "";
    if (!courseName) {
      try {
        const coursesUrl = `${baseUrl}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200`;
        const cRes = await fetch(coursesUrl, { headers, cache: "no-store" });
        if (cRes.ok) {
          const cData = await cRes.json();
          const courses = cData.data?.items || cData.Data?.Items || [];
          const found = courses.find(
            (c: { id?: number | string; guidId?: string; Id?: number | string }) =>
              String(c.id ?? c.Id) === effectiveCourseId || c.guidId === effectiveCourseId
          );
          if (found?.name || found?.Name) {
            courseName = found.name || found.Name;
            courseNameCache.set(effectiveCourseId, courseName);
          }
        }
      } catch (err) {
        console.warn(`[exams route] Course lookup failed:`, err);
      }
    }


    const resolvedSubjectName = subjectName || items[0]?.subjectName || "";

    // If backend returns empty exams for this subject, faithfully return 0 exams (e.g. admin cleared exams)
    if (items.length === 0) {
      const emptyPayload = {
        examType,
        courseId,
        courseName,
        subjectId: effectiveSubjectId,
        subjectName: resolvedSubjectName,
        exams: [],
        count: 0,
        showCustomTestButton: false,
        hideDuration: false,
        hideSeason: false,
      };
      subjectExamsResponseCache.set(cacheKey, { data: emptyPayload, timestamp: now });
      return NextResponse.json(emptyPayload, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    let processedItems = items;
    if (dynamicSearch) {
      const q = dynamicSearch.toLowerCase();
      processedItems = processedItems.filter((e) => (e.title || "").toLowerCase().includes(q));
    }

    const exams = processedItems.map((e) => ({
      id: e.guidId || e.id,
      guidId: e.guidId,
      title: e.title,
      description: e.description,
      duration: e.duration ?? null,
      season: resolveExamSeason(e.season, e.title, e.description) || e.season || null,
      year: extractExamYear(
        e.title,
        resolvedSubjectName || subjectName,
        e.year ?? (e as unknown as { examYear?: number; exam_year?: number }).examYear ?? (e as unknown as { examYear?: number; exam_year?: number }).exam_year
      ),
      questionsCount: Number(e.questionsCount ?? 0),
      accessType: e.accessType ?? "Restricted",
      status: e.status ?? "Active",
      modes: e.modes || [],
      examActions: e.examActions || e.actions || [],
      updatedAt: e.updatedAt || e.updated_at || e.createdAt || e.created_at || null,
      createdAt: e.createdAt || e.created_at || null,
    }));

    // Sort exams dynamically: newest exam year first (e.g. 2026 before 2019), then by last updated timestamp
    exams.sort((a, b) => {
      const yrB = (b.year ?? extractExamYear(b.title, resolvedSubjectName)) ?? 0;
      const yrA = (a.year ?? extractExamYear(a.title, resolvedSubjectName)) ?? 0;
      if (yrB !== yrA) return yrB - yrA;

      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;

      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    const resultPayload = {
      examType,
      courseId,
      courseName,
      subjectId: effectiveSubjectId,
      subjectName: resolvedSubjectName,
      exams,
      count: exams.length,
      showCustomTestButton: false,
      hideDuration: false,
      hideSeason: false,
    };

    if (!isAuthRequest) {
      subjectExamsResponseCache.set(cacheKey, { data: resultPayload, timestamp: now });
    }

    return NextResponse.json(resultPayload, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error(`❌ [/api/exams/${examType}/.../exams] Error:`, err);
    return NextResponse.json({
      examType,
      courseId: effectiveCourseId,
      subjectId: effectiveSubjectId,
      exams: [],
      count: 0,
    });
  }
}
