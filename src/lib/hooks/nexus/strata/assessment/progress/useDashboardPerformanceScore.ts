"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  useRelativeStrataAssessmentResults,
  type StrataProgramScope,
  type StrataExamResultItem,
} from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";

export type DashboardScope = StrataProgramScope;

export function inferDashboardScopeFromPath(pathname: string): DashboardScope {
  return "all";
}

export interface UseDashboardPerformanceScoreOptions {
  enabled?: boolean;
}

export function useDashboardPerformanceScore(
  scope: DashboardScope = "all",
  options?: UseDashboardPerformanceScoreOptions
) {
  const effectiveScope = scope ?? "all";
  const isEnabled = options?.enabled ?? true;

  const {
    filteredExamResults,
    isLoading,
    refetch,
  } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 200,
    programScope: effectiveScope,
    enabled: isEnabled,
  });

  const { averageScore, bestScore, totalAttempts, latestScore } = useMemo(() => {
    if (!filteredExamResults || filteredExamResults.length === 0) {
      return { averageScore: 0, bestScore: 0, totalAttempts: 0, latestScore: 0 };
    }

    // Deduplicate by exam identity, taking the latest attempt per unique exam across allowed programs
    const groupedResults = new Map<string, StrataExamResultItem>();

    filteredExamResults.forEach((res) => {
      const eid = res.examId ?? res.id;
      const guid = res.examGuidId ?? res.guidId;
      const key = guid || (eid != null ? String(eid) : String(res.id));
      const existing = groupedResults.get(key);
      if (!existing) {
        groupedResults.set(key, res);
      } else {
        const existingTs = new Date(existing.attemptedAt ?? existing.createdAt ?? 0).getTime() || 0;
        const currentTs = new Date(res.attemptedAt ?? res.createdAt ?? 0).getTime() || 0;
        const existingAttempt = existing.attemptNumber ?? 0;
        const currentAttempt = res.attemptNumber ?? 0;
        if (currentAttempt > existingAttempt || currentTs > existingTs) {
          groupedResults.set(key, res);
        }
      }
    });

    const validScores: number[] = [];
    groupedResults.forEach((res) => {
      const s = res.percentageScore ?? res.score;
      if (typeof s === "number" && !isNaN(s) && s >= 0) {
        validScores.push(s);
      }
    });

    if (validScores.length === 0) {
      return { averageScore: 0, bestScore: 0, totalAttempts: 0, latestScore: 0 };
    }

    const sum = validScores.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / validScores.length);
    const best = Math.round(Math.max(...validScores));
    const latest = Math.round(validScores[0]);

    return {
      averageScore: avg,
      bestScore: best,
      totalAttempts: filteredExamResults.length,
      latestScore: latest,
    };
  }, [filteredExamResults]);

  return {
    score: averageScore,
    averageScore,
    bestScore,
    latestScore,
    totalAttempts,
    isLoading,
    refetch,
  };
}
