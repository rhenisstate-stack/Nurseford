"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import {
  useRelativeStrataAssessmentResults,
  type StrataExamResultItem,
} from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import type { NursingProgramScope } from "@/lib/utils/exams/nursingProgramScope";

export interface RecentExamActivity {
  id: number;
  guidId?: string;
  title: string;
  status: string;
  questionsCount: number;
  questionsAnswered: number;
  coveragePercent: number;
  percentage?: number;
  attemptsUsed: number;
  attemptsAllowed: number;
  residualDuration?: number;
  score?: number;
  passed?: boolean;
  subjectName?: string;
  attemptDate?: string;
  timeTaken?: string;
  sortTimestamp?: number;
}

export interface ExamProgressStats {
  totalExams: number;
  attempted: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalQuestionsAvailable: number;
  totalQuestionsCovered: number;
  coveragePercent: number;
  completionPercent: number;
  averageScore: number;
  passRate: number;
  passedCount: number;
  totalAttempts: number;
  bestScore: number;
  totalTimeStudied: string;
  lastAttemptDate: string;
  recentActiveExams: RecentExamActivity[];
  allExams: StrataItem[];
  isLoading: boolean;
  refetch: () => void;
}

export interface ResolvedExamMeta {
  title?: string;
  assessmentName?: string;
  subjectName?: string;
  courseName?: string;
  questionsCount?: number;
}

type ExamWithNames = StrataItem & { subjectName?: string; courseName?: string };

type ResultProgressExtras = { questionsAnswered?: number; totalAnswered?: number };

export function isGuid(str?: string | number | null): boolean {
  if (!str) return false;
  const s = String(str).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function formatDate(value?: string): string {
  if (!value) return "Void";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Void";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "Void";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function useUserExamProgress(
  scope: NursingProgramScope = "all"
): ExamProgressStats {
  const {
    filteredExams,
    skewTotal: catalogExamTotal,
    isLoading: examsLoading,
    refetch: refetchExams,
  } = useNominalStrataExams({
    parentIdentifier: "",
    page: 1,
    perPage: 250,
    allowEmptyParent: true,
    programScope: scope,
    sliceMerged: false,
  });

  const {
    filteredExamResults,
    isLoading: resultsLoading,
    refetch: refetchResults,
  } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 200,
    sortColumn: null,
    sortDirection: "desc",
    programScope: scope,
  });

  const refetch = useCallback(() => {
    refetchExams();
    refetchResults();
  }, [refetchExams, refetchResults]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = () => {
      refetch();
    };
    window.addEventListener("focus", handleSync);
    window.addEventListener("pageshow", handleSync);
    window.addEventListener("exam:progress:sync", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("pageshow", handleSync);
      window.removeEventListener("exam:progress:sync", handleSync);
    };
  }, [refetch]);

  const progress = useMemo(() => {
    const activeList: RecentExamActivity[] = [];
    const processedExamIds = new Set<number>();
    const processedExamGuids = new Set<string>();

    let attempted = 0;
    let completed = 0;
    let inProgress = 0;
    let totalQuestionsCovered = 0;
    let totalUserQuestionsInAttemptedExams = 0;
    let totalQuestionsAvailable = 0;

    const allKnownExams: ExamWithNames[] = [...filteredExams];

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PRIMARY SOURCE: filteredExamResults (server per-user attempt records)
    // Deduplicate by exam identity while keeping latest result & attempt total.
    // ─────────────────────────────────────────────────────────────────────────
    const groupedResults = new Map<
      string,
      { latest: StrataExamResultItem; rowCount: number }
    >();

    filteredExamResults.forEach((res) => {
      const eid = res.examId ?? res.id;
      const guid = res.examGuidId ?? res.guidId;
      const key = guid || (eid != null ? String(eid) : String(res.id));
      const existing = groupedResults.get(key);
      if (!existing) {
        groupedResults.set(key, { latest: res, rowCount: 1 });
      } else {
        const existingTs = new Date(existing.latest.attemptedAt ?? existing.latest.createdAt ?? 0).getTime() || 0;
        const currentTs = new Date(res.attemptedAt ?? res.createdAt ?? 0).getTime() || 0;
        const existingAttempt = existing.latest.attemptNumber ?? 0;
        const currentAttempt = res.attemptNumber ?? 0;
        const newer = currentAttempt > existingAttempt || currentTs > existingTs ? res : existing.latest;
        groupedResults.set(key, { latest: newer, rowCount: existing.rowCount + 1 });
      }
    });

    groupedResults.forEach(({ latest: res, rowCount }) => {
      const eid = res.examId ?? res.id;
      const guid = res.examGuidId ?? res.guidId;

      if (eid) processedExamIds.add(eid);
      if (guid) processedExamGuids.add(guid);

      const matchingExam = allKnownExams.find(
        (e) => (eid && e.id === eid) || (guid && e.guidId === guid)
      );

      const resolvedScore = res.percentageScore ?? res.score;
      const passMark = res.passMark ?? matchingExam?.passMark ?? 75;
      const hasAwardedScore = resolvedScore != null;
      const isExplicitCompleted = res.status === "Completed" || res.status === "Finished";
      const isCompleted = hasAwardedScore || isExplicitCompleted;

      attempted += 1;
      if (isCompleted) {
        completed += 1;
      } else {
        inProgress += 1;
      }

      const qCount = res.questionsCount ?? matchingExam?.questionsCount ?? 36;
      const resExtras = res as unknown as ResultProgressExtras;
      const rawAnswered = resExtras.questionsAnswered ?? resExtras.totalAnswered;
      const questionsAnswered =
        rawAnswered ??
        (isCompleted ? qCount : Math.max(1, Math.round(qCount * ((resolvedScore ?? 10) / 100))));
      totalQuestionsAvailable += qCount;
      totalUserQuestionsInAttemptedExams += qCount;
      totalQuestionsCovered += questionsAnswered;

      const covPct =
        qCount > 0 ? Math.min(100, Math.round((questionsAnswered / qCount) * 100)) : 100;

      const candidateTitle =
        res.title ??
        res.assessmentName ??
        matchingExam?.title;

      const safeTitle =
        candidateTitle && !isGuid(candidateTitle)
          ? candidateTitle
          : res.subjectName && !isGuid(res.subjectName)
            ? `${res.subjectName} Exam`
            : eid && !isGuid(eid)
              ? `Exam #${eid}`
              : "Completed Exam";

      const rawTs = res.attemptedAt ?? res.createdAt;
      const sortTimestamp = rawTs ? new Date(rawTs).getTime() || 0 : 0;

      activeList.push({
        id: eid,
        guidId: guid,
        title: safeTitle,
        status: isCompleted ? "Completed" : "InProgress",
        questionsCount: qCount,
        questionsAnswered,
        coveragePercent: covPct,
        attemptsUsed: Math.max(rowCount, res.attemptNumber ?? 1, 1),
        attemptsAllowed: res.attemptsAllowed ?? matchingExam?.attemptsAllowed ?? 1,
        score: resolvedScore,
        passed: isCompleted && (res.passed === true || (hasAwardedScore && resolvedScore >= passMark)),
        subjectName:
          res.subjectName ??
          matchingExam?.subjectName ??
          res.courseName ??
          matchingExam?.courseName ??
          "Examinations",
        attemptDate: formatDate(rawTs),
        timeTaken: formatDuration(res.timeTaken),
        sortTimestamp,
      });
    });

    // Include remaining unattempted catalog exams in available question pool;
    // exclude examActions from attempt/progress counts so only submitted results count.
    allKnownExams.forEach((exam) => {
      const qCount = exam.questionsCount ?? 0;
      if (!processedExamIds.has(exam.id) && !processedExamGuids.has(exam.guidId)) {
        totalQuestionsAvailable += qCount;
      }
    });

    activeList.sort((a, b) => {
      if (a.status === "InProgress" && b.status !== "InProgress") return -1;
      if (b.status === "InProgress" && a.status !== "InProgress") return 1;
      return (b.sortTimestamp ?? 0) - (a.sortTimestamp ?? 0);
    });

    const totalExams = Math.max(catalogExamTotal || filteredExams.length, attempted);
    const notStarted = Math.max(0, totalExams - attempted);

    const coveragePercent =
      totalUserQuestionsInAttemptedExams > 0
        ? Math.min(100, Math.round((totalQuestionsCovered / totalUserQuestionsInAttemptedExams) * 100))
        : 0;

    const completionPercent =
      attempted > 0 ? Math.round((completed / attempted) * 100) : 0;

    const scores: number[] = [];
    activeList.forEach((e) => {
      if (typeof e.score === "number") scores.push(e.score);
    });

    const averageScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const bestScore =
      scores.length > 0 ? Math.round(Math.max(...scores)) : 0;

    const totalAttempts =
      activeList.reduce((acc, e) => acc + (e.attemptsUsed || 1), 0);

    const passedCount = activeList.filter((e) => e.passed === true).length;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

    const totalTimeSeconds = filteredExamResults.reduce((s, a) => s + (a.timeTaken ?? 0), 0);
    const totalTimeStudied = formatDuration(totalTimeSeconds);

    let latestTimestamp: number | null = null;
    filteredExamResults.forEach((r) => {
      const ts = r.attemptedAt || r.createdAt;
      if (ts) {
        const t = new Date(ts).getTime();
        if (!isNaN(t) && (!latestTimestamp || t > latestTimestamp)) latestTimestamp = t;
      }
    });
    const lastAttemptDate = latestTimestamp
      ? formatDate(new Date(latestTimestamp).toISOString())
      : "Void";

    return {
      totalExams,
      attempted,
      completed,
      inProgress,
      notStarted,
      totalQuestionsAvailable,
      totalQuestionsCovered,
      coveragePercent,
      completionPercent,
      averageScore,
      passRate,
      passedCount,
      totalAttempts,
      bestScore,
      totalTimeStudied,
      lastAttemptDate,
      recentActiveExams: activeList,
    };
  }, [filteredExams, catalogExamTotal, filteredExamResults]);

  return {
    ...progress,
    allExams: filteredExams,
    isLoading: examsLoading || resultsLoading,
    refetch,
  };
}
