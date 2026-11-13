import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

import {
  fetchExamBreakdown,
  fetchMultipleExamsBreakdown,
  type ExamQuestionBreakdown,
} from "@/lib/services/exams/questionsBreakdownService";

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
  const breakdowns = await fetchMultipleExamsBreakdown(examIds, sessionHeaders, 3);

  const examsRecord: Record<string, ExamQuestionBreakdown> = {};
  let totalAll = 0;
  let totalEasy = 0;
  let totalMed = 0;
  let totalHard = 0;

  for (const b of breakdowns) {
    examsRecord[b.examId] = b;
    const anyB = b as ExamQuestionBreakdown & { guidId?: string; numericId?: number | string };
    if (anyB.guidId) examsRecord[anyB.guidId] = b;
    if (anyB.numericId) examsRecord[String(anyB.numericId)] = b;
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
  const breakdowns = await fetchMultipleExamsBreakdown(examIds, sessionHeaders, 3);

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
