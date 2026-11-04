import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { getGuestPreviewToken } from "@/app/api/nexus/strata/assessment/exam/route";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";

export interface ExamQuestionBreakdown {
  examId: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  uncategorized: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
  questionIds: (number | string)[];
}

export interface QuestionsBreakdownResponse {
  exams: Record<string, ExamQuestionBreakdown>;
  summary: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    easyPct: number;
    mediumPct: number;
    hardPct: number;
  };
}

// In-memory cache for 5 minutes per exam breakdown
interface CacheEntry {
  breakdown: ExamQuestionBreakdown;
  timestamp: number;
}
const breakdownCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function normalizeDiff(val: unknown): "easy" | "medium" | "hard" | null {
  if (val === null || val === undefined) return null;
  const s = String(val).toLowerCase().trim();
  if (s === "easy" || s === "beginner" || s === "1" || s === "foundation") return "easy";
  if (s === "medium" || s === "moderate" || s === "intermediate" || s === "2") return "medium";
  if (s === "hard" || s === "difficult" || s === "advanced" || s === "3") return "hard";
  return null;
}

export async function fetchExamBreakdown(
  examId: string,
  sessionHeaders: Record<string, string>
): Promise<ExamQuestionBreakdown> {
  const cached = breakdownCache.get(examId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.breakdown;
  }

  const backendBaseUrl = getBackendBaseUrl();
  const query = new URLSearchParams({
    fetchtype: "live",
    identifier: examId,
    dynamicPage: "1",
    dynamicPerPage: "500",
  });

  const url = `${backendBaseUrl}/api/castoline/strata/assessment/exams/list/live?${query.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
        ...sessionHeaders,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[questions-breakdown] Failed to fetch live exam ${examId}: HTTP ${res.status}`);
      return {
        examId,
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        uncategorized: 0,
        easyPct: 0,
        mediumPct: 0,
        hardPct: 0,
        questionIds: [],
      };
    }

    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as any;
    const session = converted?.data?.exam || converted?.data || converted?.exam || {};
    const sections: any[] = session?.sections || [];
    const questions: any[] = sections.flatMap((sec) => sec.questions || []);

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let uncategorizedCount = 0;
    const questionIds: (number | string)[] = [];

    for (const q of questions) {
      const qId = q.id ?? q.guidId;
      if (qId) questionIds.push(qId);

      const rawDiff =
        q.difficulty ??
        q.difficultyLevel ??
        q.difficulty_level ??
        q.level ??
        q.grade;

      const norm = normalizeDiff(rawDiff);
      if (norm === "easy") easyCount++;
      else if (norm === "medium") mediumCount++;
      else if (norm === "hard") hardCount++;
      else uncategorizedCount++;
    }

    const total = questions.length;
    const categorized = easyCount + mediumCount + hardCount;

    const breakdown: ExamQuestionBreakdown = {
      examId,
      total,
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
      uncategorized: uncategorizedCount,
      easyPct: categorized > 0 ? Math.round((easyCount / categorized) * 100) : 0,
      mediumPct: categorized > 0 ? Math.round((mediumCount / categorized) * 100) : 0,
      hardPct: categorized > 0 ? Math.round((hardCount / categorized) * 100) : 0,
      questionIds,
    };

    breakdownCache.set(examId, { breakdown, timestamp: Date.now() });
    return breakdown;
  } catch (err) {
    console.error(`[questions-breakdown] Exception fetching exam ${examId}:`, err);
    return {
      examId,
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      uncategorized: 0,
      easyPct: 0,
      mediumPct: 0,
      hardPct: 0,
      questionIds: [],
    };
  }
}

async function resolveSessionHeaders(req: NextRequest): Promise<Record<string, string>> {
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

  if (!castoLine) {
    const guestAuth = await getGuestPreviewToken();
    if (guestAuth) {
      castoLine = guestAuth.line;
      if (!castoBadge) castoBadge = guestAuth.badge;
    }
  }

  const headers: Record<string, string> = {};
  if (castoLine) headers["x-casto-line"] = castoLine;
  if (castoBadge) headers["x-casto-badge"] = castoBadge;
  return headers;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("examIds") || searchParams.get("ids") || "";
  const examIds = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (examIds.length === 0) {
    return NextResponse.json({
      exams: {},
      summary: { total: 0, easy: 0, medium: 0, hard: 0, easyPct: 0, mediumPct: 0, hardPct: 0 },
    });
  }

  const sessionHeaders = await resolveSessionHeaders(req);
  const breakdowns = await Promise.all(
    examIds.map((id) => fetchExamBreakdown(id, sessionHeaders))
  );

  const examsRecord: Record<string, ExamQuestionBreakdown> = {};
  let totalAll = 0;
  let totalEasy = 0;
  let totalMed = 0;
  let totalHard = 0;

  for (const b of breakdowns) {
    examsRecord[b.examId] = b;
    totalAll += b.total;
    totalEasy += b.easy;
    totalMed += b.medium;
    totalHard += b.hard;
  }

  const categorized = totalEasy + totalMed + totalHard;
  const summary = {
    total: totalAll,
    easy: totalEasy,
    medium: totalMed,
    hard: totalHard,
    easyPct: categorized > 0 ? Math.round((totalEasy / categorized) * 100) : 0,
    mediumPct: categorized > 0 ? Math.round((totalMed / categorized) * 100) : 0,
    hardPct: categorized > 0 ? Math.round((totalHard / categorized) * 100) : 0,
  };

  return NextResponse.json({
    exams: examsRecord,
    summary,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const rawIds = Array.isArray(body.examIds) ? body.examIds : [];
  const examIds = rawIds.map((s: unknown) => String(s).trim()).filter(Boolean);

  if (examIds.length === 0) {
    return NextResponse.json({
      exams: {},
      summary: { total: 0, easy: 0, medium: 0, hard: 0, easyPct: 0, mediumPct: 0, hardPct: 0 },
    });
  }

  const sessionHeaders = await resolveSessionHeaders(req);
  const breakdowns = await Promise.all(
    examIds.map((id: string) => fetchExamBreakdown(id, sessionHeaders))
  );

  const examsRecord: Record<string, ExamQuestionBreakdown> = {};
  let totalAll = 0;
  let totalEasy = 0;
  let totalMed = 0;
  let totalHard = 0;

  for (const b of breakdowns) {
    examsRecord[b.examId] = b;
    totalAll += b.total;
    totalEasy += b.easy;
    totalMed += b.medium;
    totalHard += b.hard;
  }

  const categorized = totalEasy + totalMed + totalHard;
  const summary = {
    total: totalAll,
    easy: totalEasy,
    medium: totalMed,
    hard: totalHard,
    easyPct: categorized > 0 ? Math.round((totalEasy / categorized) * 100) : 0,
    mediumPct: categorized > 0 ? Math.round((totalMed / categorized) * 100) : 0,
    hardPct: categorized > 0 ? Math.round((totalHard / categorized) * 100) : 0,
  };

  return NextResponse.json({
    exams: examsRecord,
    summary,
  });
}
