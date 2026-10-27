// src\lib\contexts\dashboards\assessment\LiveStrataExamContext.tsx
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
} from "react";

import { useLiveStrataExam } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import type { StrataExamSessionResponse } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";

// ─────────────────────────────────────────────────────────────
// CONTEXT TYPE
// ─────────────────────────────────────────────────────────────

interface LiveStrataExamContextType {
  examSession: StrataExamSessionResponse | null;
  loading: boolean;
  error: string | null;

  examIdentifier: string;
}

// ─────────────────────────────────────────────────────────────

const LiveStrataExamContext =
  createContext<LiveStrataExamContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────

export function LiveStrataExamProvider({
  examIdentifier,
  selectedMode,
  selectedLayout,
  targetAttemptNumber,
  builderMode,
  questionCount,
  examCount,
  subCategories,
  customTitle,
  children,
}: {
  examIdentifier: string;
  selectedMode?: string;
  selectedLayout?: string;
  targetAttemptNumber?: number | null;
  builderMode?: "questions" | "exams" | null;
  questionCount?: number | null;
  examCount?: number | null;
  subCategories?: string | null;
  customTitle?: string | null;
  children: React.ReactNode;
}) {
  const {
    examSession,
    loading,
    error,
  } = useLiveStrataExam({
    examIdentifier,
    selectedMode,
    selectedLayout,
    targetAttemptNumber,
    builderMode,
    questionCount,
    examCount,
    subCategories,
    customTitle,
  });

  // Synchronize exam title and in-progress metadata across storage so all dashboards and progress pages know the exam name
  useEffect(() => {
    if (!examSession?.exam || typeof window === "undefined") return;
    const exam = examSession.exam;
    const guidId = exam.guidId || examIdentifier;
    const id = exam.id;
    const title = exam.title;
    const subjectName = exam.subjectName || exam.assessmentName;
    const courseName = exam.courseName;
    const questionsCount = exam.questionsCount || 0;

    const examPayload = JSON.stringify({
      id,
      guidId,
      title,
      assessmentName: exam.assessmentName,
      subjectName,
      courseName,
      questionsCount,
      startedAt: new Date().toISOString(),
    });

    try {
      if (guidId) {
        localStorage.setItem(`exam_in_progress_${guidId}`, examPayload);
        sessionStorage.setItem(`exam_in_progress_${guidId}`, examPayload);
        if (title) {
          localStorage.setItem(`exam_title_${guidId}`, title);
          sessionStorage.setItem(`exam_title_${guidId}`, title);
        }
      }
      if (id) {
        localStorage.setItem(`exam_in_progress_${id}`, examPayload);
        sessionStorage.setItem(`exam_in_progress_${id}`, examPayload);
        if (title) {
          localStorage.setItem(`exam_title_${id}`, title);
          sessionStorage.setItem(`exam_title_${id}`, title);
        }
      }
      window.dispatchEvent(
        new CustomEvent("exam:progress:sync", {
          detail: { guidId, id, title, subjectName },
        })
      );
    } catch {}
  }, [examSession?.exam, examIdentifier]);

  const value = useMemo(
    () => ({
      examSession,
      loading,
      error,
      examIdentifier,
    }),
    [examSession, loading, error, examIdentifier]
  );

  return (
    <LiveStrataExamContext.Provider value={value}>
      {children}
    </LiveStrataExamContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export function useLiveStrataExamContext() {
  const ctx = useContext(LiveStrataExamContext);

  if (!ctx) {
    throw new Error(
      "useLiveStrataExamContext must be used inside LiveStrataExamProvider"
    );
  }

  return ctx;
}