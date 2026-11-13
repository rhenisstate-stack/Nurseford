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
  difficulty,
  status,
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
  difficulty?: string | null;
  status?: string | null;
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
    difficulty,
    status,
  });

  // Notify listeners when exam metadata is loaded without storing progress in browser storage
  useEffect(() => {
    if (!examSession?.exam || typeof window === "undefined") return;
    const exam = examSession.exam;
    const guidId = exam.guidId || examIdentifier;
    const id = exam.id;
    const title = exam.title;
    const subjectName = exam.subjectName || exam.assessmentName;

    try {
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