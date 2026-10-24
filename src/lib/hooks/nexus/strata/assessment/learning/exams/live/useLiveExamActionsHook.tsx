// src/lib/hooks/dashboards/strata/assessment/learning/exams/live/useLiveExamActionsHook.tsx
'use client';

import { useCallback, useState } from "react";

import {
  examService,
  ExamServiceResponse,
  SubmitAnswerPayload,
  ExamUxPayload,
} from "@/lib/services/nexus/strata/examService";

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type LiveAnswerSubmissionType =
  // Standalone question types
  | "ActionSingleChoice"
  | "ActionMultipleSelect"
  | "ActionTrueFalse"
  | "ActionNumericResponse"
  | "ActionMatching"
  | "ActionOrderingNumber"
  | "ActionOrderingItem"
  | "ActionOrderingDragDrop"
  | "ActionDynamicImage"
  | "ActionMultipleImage"
  | "ActionBlankSelect"
  | "ActionBlankFill"
  | "ActionHotspot"
  | "ActionOpenEnded"
  | "ActionHighLight"
  | "ActionAudioBased"
  | "ActionVideoBased"
  | "ActionMatrixSingleChoice"
  | "ActionMatrixMultipleSelect"

  // Case-based question types
  | "ActionCaseBased"
  | "ActionCaseBasedSingleChoice"
  | "ActionCaseBasedMultipleSelect"
  | "ActionCaseBasedTrueFalse"
  | "ActionCaseBasedNumericResponse"
  | "ActionCaseBasedMatching"
  | "ActionCaseBasedOrderingNumber"
  | "ActionCaseBasedOrderingItem"
  | "ActionCaseBasedOrderingDragDrop"
  | "ActionCaseBasedDynamicImage"
  | "ActionCaseBasedMultipleImage"
  | "ActionCaseBasedBlankSelect"
  | "ActionCaseBasedBlankFill"
  | "ActionCaseBasedHotspot"
  | "ActionCaseBasedOpenEnded"
  | "ActionCaseBasedMatrixSingleChoice"
  | "ActionCaseBasedMatrixMultipleSelect"
  | "ActionCaseBasedHighLight"
  | "ActionCaseBasedAudioBased"
  | "ActionCaseBasedVideoBased";

export type LiveToolSubmissionType =
  | "ActionExamFlag"
  | "ActionExamBookmark"
  | "ActionExamStar"
  | "ActionExamPin"
  | "ActionExamFeedback"
  | "ActionQuestionFlag"
  | "ActionQuestionBookmark"
  | "ActionQuestionStar"
  | "ActionQuestionPin"
  | "ActionQuestionFeedback";

export interface ExamActionPayload {
  examId?: number;
  examGuidId?: string;

  sectionId?: number;
  sectionGuidId?: string;

  questionId?: number;
  questionGuidId?: string;

  actionValue?: string | boolean | number;
  actionContent?: string;
  value?: string | boolean | number;
}

export interface ExamLifecyclePayload {
  examId?: number;
  examGuidId?: string;
  reason?: string;
  status?: string;
  residualDuration?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export const useLiveExamActionsHook = () => {

  // ─────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // INTERNAL EXECUTOR
  // ─────────────────────────────────────────────────────────────

  const execute = useCallback(
    async <T,>(
      callback: () => Promise<ExamServiceResponse<T>>
    ) => {

      try {

        setLoading(true);
        setError(null);
        setSuccess(null);

        const result = await callback();

        if (result?.error) {
          throw new Error(result.error);
        }

        setSuccess(result?.message ?? "Success");

        return result;

      } catch (err: unknown) {

        console.error(
          "❌ [useLiveExamActionsHook]",
          err
        );

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown Error");
        }

        return {
          error:
            err instanceof Error
              ? err.message
              : "Unknown Error",
        };

      } finally {

        setLoading(false);

      }
    },
    []
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // ANSWERS
  // ─────────────────────────────────────────────────────────────────────────────

  const submitAnswer = useCallback(
    async (
      submissionType: LiveAnswerSubmissionType,
      payload: SubmitAnswerPayload
    ) => {

      return execute(() =>
        examService.submitAnswer(
          submissionType as never,
          payload
        )
      );

    },
    [execute]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOLS
  // ─────────────────────────────────────────────────────────────────────────────

  const submitTool = useCallback(
    async (
      submissionType: LiveToolSubmissionType,
      payload: ExamActionPayload
    ) => {
      return execute(() =>
        examService.submitTool(submissionType as never, payload as never)
      );
    },
    [execute]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────────

  const saveResidualDuration = useCallback(
    async (payload: ExamLifecyclePayload) => {
      // Bypasses execute() — fully independent, never collides with pause/resume
      try {
        return await examService.saveResidualDuration(payload);
      } catch (err) {
        console.error("❌ [saveResidualDuration]", err);
        return { error: err instanceof Error ? err.message : "Duration Save Error" };
      }
    },
    []
  );

  const pauseExam = useCallback(
    async (
      payload: ExamLifecyclePayload
    ) => {

      return execute(() =>
        examService.pauseExam(payload)
      );

    },
    [execute]
  );

  const resumeExam = useCallback(
    async (
      payload: ExamLifecyclePayload
    ) => {

      return execute(() =>
        examService.resumeExam(payload)
      );

    },
    [execute]
  );

  const terminateExam = useCallback(
    async (
      payload: ExamLifecyclePayload
    ) => {

      return execute(() =>
        examService.terminateExam(payload)
      );

    },
    [execute]
  );

  const submitExam = useCallback(
    async (
      payload: ExamLifecyclePayload
    ) => {

      return execute(() =>
        examService.submitExam(payload)
      );

    },
    [execute]
  );


  // ─────────────────────────────────────────────────────────────────────────────
  // UX
  // ─────────────────────────────────────────────────────────────────────────────

  const updateLayout = useCallback(
    async (
      payload: ExamUxPayload
    ) => {

      return execute(() =>
        examService.updateLayout(payload)
      );

    },
    [execute]
  );

  const updateTheme = useCallback(
    async (
      payload: ExamUxPayload
    ) => {

      return execute(() =>
        examService.updateTheme(payload)
      );

    },
    [execute]
  );

  const updateMode = useCallback(
    async (
      payload: ExamUxPayload
    ) => {

      return execute(() =>
        examService.updateMode(payload)
      );

    },
    [execute]
  );

  const updateStatus = useCallback(
    async (
      payload: ExamUxPayload
    ) => {

      return execute(() =>
        examService.updateStatus(payload)
      );

    },
    [execute]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────────

  return {

    // state
    loading,
    error,
    success,

    // answers
    submitAnswer,

    // tools
    submitTool,

    // lifecycle
    saveResidualDuration,
    pauseExam,
    resumeExam,
    terminateExam,
    submitExam,

    // ux
    updateLayout,
    updateTheme,
    updateMode,
    updateStatus,
  };
};

// ───────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────