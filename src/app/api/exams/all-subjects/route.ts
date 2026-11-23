import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

import { toSlug, type BackendSubject } from "@/lib/data/exam-subjects";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";
import { resolveExamSchool } from "@/lib/utils/exams/resolveExamSchool";
import { formatCourseDropdownName } from "@/lib/utils/exams/formatCourseDropdownName";

export interface UnifiedSubject {
  id: string | number;
  guidId?: string;
  name: string;
  slug: string;
  category: string;
  isMedSurg: boolean;
  questionCount: number;
  examCount: number;
  panelSlug: "rn-nursing" | "lpn-nursing";
  programName: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  school?: string;
  year?: number;
  season?: string;
  description?: string;
  targetHref: string;
}

// Global in-memory cache surviving HMR reloads (TTL: 30 minutes)
const globalCache = globalThis as unknown as {
  __allSubjectsCache?: UnifiedSubject[];
  __allSubjectsTimestamp?: number;
  __allSubjectsRefreshPromise?: Promise<void> | null;
};
const CACHE_TTL_MS = 30 * 60 * 1000;

function categorizeSubject(name: string): { category: string; isMedSurg: boolean } {
  const s = (name || "").toLowerCase();
  if (/med.*surg/i.test(s)) {
    return { category: "Med-Surg / Adult Health", isMedSurg: true };
  }
  if (/adult\s*health/i.test(s)) {
    return { category: "Med-Surg / Adult Health", isMedSurg: false };
  }
  if (/pharm/i.test(s)) {
    return { category: "Pharmacology", isMedSurg: false };
  }
  if (/fundamental/i.test(s)) {
    return { category: "Fundamentals of Nursing", isMedSurg: false };
  }
  if (/maternal|newborn|obstetric/i.test(s)) {
    return { category: "Maternal & Newborn Care", isMedSurg: false };
  }
  if (/pediatric|child|peds/i.test(s)) {
    return { category: "Pediatrics & Child Health", isMedSurg: false };
  }
  if (/mental|psych/i.test(s)) {
    return { category: "Mental Health & Psych", isMedSurg: false };
  }
  if (/dosage|calc/i.test(s)) {
    return { category: "Dosage Calculation", isMedSurg: false };
  }
  if (/health\s*assessment|assessment/i.test(s)) {
    return { category: "Health Assessment", isMedSurg: false };
  }
  if (/leadership|management/i.test(s)) {
    return { category: "Leadership & Management", isMedSurg: false };
  }
  if (/community/i.test(s)) {
    return { category: "Community Health", isMedSurg: false };
  }
  if (/nutrition/i.test(s)) {
    return { category: "Nutrition", isMedSurg: false };
  }
  if (/critical\s*care/i.test(s)) {
    return { category: "Critical Care", isMedSurg: false };
  }
  if (/exit|capstone/i.test(s)) {
    return { category: "Exit Exams & Capstone", isMedSurg: false };
  }
  return { category: "General Clinical", isMedSurg: false };
}

export async function GET(req: NextRequest) {
  const forceRefresh = req.nextUrl.searchParams.get("forceRefresh") === "true";
  const now = Date.now();

  let cachedSubjects = globalCache.__allSubjectsCache ?? null;
  let cacheTimestamp = globalCache.__allSubjectsTimestamp ?? 0;

  // Invalidate cache if it contains broken/incomplete counts (e.g. less than 40% of subjects having counts)
  const hasIncompleteCounts =
    cachedSubjects &&
    cachedSubjects.length > 0 &&
    cachedSubjects.filter((s) => (s.examCount || 0) > 0).length < cachedSubjects.length * 0.4;
  if (hasIncompleteCounts) {
    globalCache.__allSubjectsCache = undefined;
    globalCache.__allSubjectsTimestamp = 0;
    cachedSubjects = null;
    cacheTimestamp = 0;
  }

  // 1. Fresh cache: return immediately in < 1ms
  if (!forceRefresh && cachedSubjects && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        success: true,
        subjects: cachedSubjects,
        total: cachedSubjects.length,
        cached: true,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }

  const origin = req.nextUrl.origin || "http://localhost:3001";
  const reqHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) reqHeaders["cookie"] = cookieHeader;
  const castoLine = req.headers.get("x-casto-line");
  const castoBadge = req.headers.get("x-casto-badge");
  const authHeader = req.headers.get("authorization");
  if (castoLine) reqHeaders["x-casto-line"] = castoLine;
  if (castoBadge) reqHeaders["x-casto-badge"] = castoBadge;
  if (authHeader) reqHeaders["authorization"] = authHeader;

  // 2. Stale cache: return stale immediately so user is never blocked, refresh in background
  if (!forceRefresh && cachedSubjects && cachedSubjects.length > 0) {
    if (!globalCache.__allSubjectsRefreshPromise) {
      globalCache.__allSubjectsRefreshPromise = (async () => {
        try {
          const fresh = await fetch(`${origin}/api/exams/all-subjects?forceRefresh=true`, {
            headers: reqHeaders,
            cache: "no-store",
          }).then((r) => (r.ok ? r.json() : null));
          if (Array.isArray(fresh?.subjects) && fresh.subjects.length > 0) {
            globalCache.__allSubjectsCache = fresh.subjects;
            globalCache.__allSubjectsTimestamp = Date.now();
          }
        } catch {
          // background refresh failure ignored
        } finally {
          globalCache.__allSubjectsRefreshPromise = null;
        }
      })();
    }

    return NextResponse.json(
      {
        success: true,
        subjects: cachedSubjects,
        total: cachedSubjects.length,
        cached: true,
        stale: true,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }

  try {
    // 1. Fetch courses in parallel across both RN and LPN panels
    const [rnCoursesRes, lpnCoursesRes] = await Promise.all([
      fetch(`${origin}/api/exams/rn-nursing/subjects`, { headers: reqHeaders, cache: "no-store" }).catch(() => null),
      fetch(`${origin}/api/exams/lpn-nursing/subjects`, { headers: reqHeaders, cache: "no-store" }).catch(() => null),
    ]);

    const rnCoursesData = rnCoursesRes?.ok ? await rnCoursesRes.json().catch(() => ({})) : {};
    const lpnCoursesData = lpnCoursesRes?.ok ? await lpnCoursesRes.json().catch(() => ({})) : {};

    const rnCourses = Array.isArray(rnCoursesData?.subjects) ? rnCoursesData.subjects : [];
    const lpnCourses = Array.isArray(lpnCoursesData?.subjects) ? lpnCoursesData.subjects : [];

    interface Task {
      panel: "rn-nursing" | "lpn-nursing";
      course: any;
    }

    const tasks: Task[] = [
      ...rnCourses.map((c: any) => ({ panel: "rn-nursing" as const, course: c })),
      ...lpnCourses.map((c: any) => ({ panel: "lpn-nursing" as const, course: c })),
    ];

    // 2. Fetch all course subjects with controlled concurrency (batches of 2 courses)
    const results: Array<PromiseSettledResult<{ panel: "rn-nursing" | "lpn-nursing"; course: any; subsData: any } | null>> = [];
    const COURSE_BATCH = 2;
    for (let i = 0; i < tasks.length; i += COURSE_BATCH) {
      const chunk = tasks.slice(i, i + COURSE_BATCH);
      const chunkResults = await Promise.allSettled(
        chunk.map(async ({ panel, course }) => {
          const courseId = String(course.guidId || course.id || "");
          if (!courseId) return null;

          const subsRes = await fetch(`${origin}/api/exams/${panel}/subjects/${courseId}?forceRefresh=true`, {
            headers: reqHeaders,
            cache: "no-store",
          }).catch(() => null);

          if (!subsRes || !subsRes.ok) return null;
          const subsData = await subsRes.json().catch(() => ({}));
          return { panel, course, subsData };
        })
      );
      results.push(...chunkResults);
    }

    const aggregated: UnifiedSubject[] = [];

    for (const res of results) {
      if (res.status !== "fulfilled" || !res.value) continue;
      const { panel, course, subsData } = res.value;
      const subjectsList = Array.isArray(subsData?.subjects) ? subsData.subjects : [];
      const resolvedCourseName = formatCourseDropdownName(
        subsData?.courseName || course.name || "Nursing Course"
      );
      const courseSlug = course.slug || toSlug(resolvedCourseName);
      const courseId = String(course.guidId || course.id || "");

      for (const sub of subjectsList) {
        const subId = String(sub.guidId || sub.id || "");
        const subName = (sub.name || "")
          .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
          .replace(/rhenis\s*/gi, "")
          .trim();
        if (!subName) continue;

        const { category, isMedSurg } = categorizeSubject(subName);
        const isExit =
          /exit/i.test(resolvedCourseName) ||
          /exit/i.test(subName) ||
          sub.segment === "RN_EXIT" ||
          sub.segment === "LPN_EXIT";

        const programName =
          panel === "lpn-nursing"
            ? isExit
              ? "PN Exit"
              : "LPN Nursing Exam"
            : isExit
            ? "RN Exit"
            : "RN Nursing Exam";

        const subSlug = sub.slug || toSlug(subName);
        const targetHref = `/dashboards/${panel}/exams/${courseSlug}/${courseId}/exams/${subId}?subjectName=${encodeURIComponent(
          subName
        )}`;

        const year = extractExamYear(subName, undefined, sub.year, sub.createdAt);
        const season = resolveExamSeason(sub.season, subName, sub.description);
        const school =
          resolveExamSchool({
            title: subName,
            description: sub.description,
            school: sub.school,
            schoolName: sub.schoolName,
            institution: sub.institution,
            institutionName: sub.institutionName,
          }) || undefined;

        aggregated.push({
          id: subId,
          guidId: sub.guidId,
          name: subName,
          slug: subSlug,
          category,
          isMedSurg,
          questionCount: Number(sub.questionCount || 0),
          examCount: Number(sub.examCount || 0),
          panelSlug: panel,
          programName,
          courseId,
          courseName: resolvedCourseName,
          courseSlug,
          school,
          year: year ?? undefined,
          season: season ?? undefined,
          description: sub.description,
          targetHref,
        });
      }
    }

    // Dynamic Sort: Purely by dynamic exam count descending, then by question count descending
    aggregated.sort((a, b) => {
      const examDiff = (b.examCount || 0) - (a.examCount || 0);
      if (examDiff !== 0) return examDiff;
      return (b.questionCount || 0) - (a.questionCount || 0);
    });

    const validCount = aggregated.filter((s) => s.examCount > 0).length;
    if (validCount > 10) {
      globalCache.__allSubjectsCache = aggregated;
      globalCache.__allSubjectsTimestamp = now;
    }

    return NextResponse.json(
      {
        success: true,
        subjects: aggregated,
        total: aggregated.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    console.error("[all-subjects] Error aggregating subjects:", err);
    return NextResponse.json(
      { success: false, error: err.message, subjects: [] },
      { status: 500 }
    );
  }
}
