"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  useRelativeStrataAssessmentResults,
  type StrataProgramScope,
} from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";

export type DashboardScope = StrataProgramScope;

export function inferDashboardScopeFromPath(pathname: string): DashboardScope {
  const p = pathname.toLowerCase();
  if (p.includes("lpn-nursing")) return "lpn-nursing";
  if (p.includes("rn-nursing")) return "rn-nursing";
  if (p.includes("nclex-pn")) return "nclex-pn";
  if (p.includes("nclex-rn")) return "nclex-rn";
  if (p.includes("hesi-a2") || p.includes("hesi")) return "hesi-a2";
  return "all";
}

export interface UseDashboardPerformanceScoreOptions {
  enabled?: boolean;
}

export function useDashboardPerformanceScore(
  scope?: DashboardScope,
  options?: UseDashboardPerformanceScoreOptions
) {
  const pathname = usePathname() || "";
  const effectiveScope = scope ?? inferDashboardScopeFromPath(pathname);
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

    const validScores = filteredExamResults
      .map((a) => a.percentageScore ?? a.score)
      .filter((s): s is number => typeof s === "number" && !isNaN(s) && s >= 0);

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
      totalAttempts: validScores.length,
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
