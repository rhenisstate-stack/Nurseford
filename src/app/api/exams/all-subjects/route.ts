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

// In-memory cache for fast repeated responses (TTL: 10 minutes)
let cachedSubjects: UnifiedSubject[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

function categorizeSubject(name: string): { category: string; isMedSurg: boolean } {
  const s = (name || "").toLowerCase();
  if (/med.*surg|adult\s*health/i.test(s)) {
    return { category: "Med-Surg / Adult Health", isMedSurg: true };
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
  const now = Date.now();
  if (cachedSubjects && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      subjects: cachedSubjects,
      total: cachedSubjects.length,
      cached: true,
    });
  }

  const origin = req.nextUrl.origin || "http://localhost:3001";
  const reqHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) reqHeaders["cookie"] = cookieHeader;

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

    // 2. Fetch all course subjects in parallel with Promise.allSettled
    const results = await Promise.allSettled(
      tasks.map(async ({ panel, course }) => {
        const courseId = String(course.guidId || course.id || "");
        if (!courseId) return null;

        const subsRes = await fetch(`${origin}/api/exams/${panel}/subjects/${courseId}`, {
          headers: reqHeaders,
          cache: "no-store",
        }).catch(() => null);

        if (!subsRes || !subsRes.ok) return null;
        const subsData = await subsRes.json().catch(() => ({}));
        return { panel, course, subsData };
      })
    );

    const aggregated: UnifiedSubject[] = [];

    for (const res of results) {
      if (res.status !== "fulfilled" || !res.value) continue;
      const { panel, course, subsData } = res.value;
      const subjectsList = Array.isArray(subsData?.subjects) ? subsData.subjects : [];
      const resolvedCourseName = (subsData?.courseName || course.name || "Nursing Course")
        .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
        .replace(/rhenis\s*/gi, "")
        .trim();
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

    // Sort: ALL Med-Surg subjects FIRST (sorted by question count descending),
    // followed by other subjects grouped alphabetically by category
    aggregated.sort((a, b) => {
      if (a.isMedSurg && !b.isMedSurg) return -1;
      if (!a.isMedSurg && b.isMedSurg) return 1;
      if (a.isMedSurg && b.isMedSurg) {
        return (b.questionCount || 0) - (a.questionCount || 0);
      }
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return (b.questionCount || 0) - (a.questionCount || 0);
    });

    cachedSubjects = aggregated;
    cacheTimestamp = now;

    return NextResponse.json({
      success: true,
      subjects: aggregated,
      total: aggregated.length,
    });
  } catch (err: any) {
    console.error("[all-subjects] Error aggregating subjects:", err);
    return NextResponse.json(
      { success: false, error: err.message, subjects: [] },
      { status: 500 }
    );
  }
}
