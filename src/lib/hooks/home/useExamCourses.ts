"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/api/api";

export interface DashboardSubCategory {
  id: string;
  title: string;
  questionCount: number;
  usedCount: number;
  order: number;
}

export interface DashboardCourse {
  id: number;
  guidId?: string;
  backendSubjectGuid?: string;
  examType: string;
  title: string;
  category: "subject" | "clientNeed";
  questionCount: number;
  examCount: number;
  doneCount: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
  order: number;
  subCategories: DashboardSubCategory[];
}

export interface ExamBuilderStats {
  totalDomains: number;
  totalExams: number;
  totalQuestions: number;
}

export type CourseFetchStatus = "loading" | "ready" | "error";

const clientExamCoursesCache = new Map<
  string,
  { courses: DashboardCourse[]; examBuilder?: ExamBuilderStats }
>();

export const useExamCourses = (examType: string) => {
  const cached = clientExamCoursesCache.get(examType);

  const [courses, setCourses] = useState<DashboardCourse[]>(() => cached?.courses ?? []);
  const [status, setStatus] = useState<CourseFetchStatus>(() => (cached ? "ready" : "loading"));
  const [error, setError] = useState<string | null>(null);
  const [examBuilderStats, setExamBuilderStats] = useState<ExamBuilderStats | null>(
    () => cached?.examBuilder ?? null
  );

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground && !clientExamCoursesCache.has(examType)) {
      setStatus("loading");
    }
    setError(null);
    try {
      const result = await apiFetch<{
        examType: string;
        count: number;
        courses: DashboardCourse[];
        examBuilder?: ExamBuilderStats;
      }>(`/api/courses?examType=${encodeURIComponent(examType)}`);

      const fetchedCourses = result?.courses ?? [];
      const fetchedStats = result?.examBuilder ?? null;

      clientExamCoursesCache.set(examType, {
        courses: fetchedCourses,
        examBuilder: fetchedStats ?? undefined,
      });

      setCourses(fetchedCourses);
      setExamBuilderStats(fetchedStats);
      setStatus("ready");
    } catch (err) {
      console.error(`❌ [useExamCourses] Failed to fetch courses for ${examType}:`, err);
      if (!clientExamCoursesCache.has(examType)) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
        setStatus("error");
      }
    }
  }, [examType]);

  useEffect(() => {
    const hasCache = clientExamCoursesCache.has(examType);
    load(hasCache);
  }, [load, examType]);

  return { courses, status, error, examBuilderStats, reload: () => load(false) };
};
