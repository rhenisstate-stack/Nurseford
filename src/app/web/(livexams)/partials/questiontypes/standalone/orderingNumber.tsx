'use client';

import { useEffect, useState } from "react";
import type {
  StrataSessionQuestionFull,
  StrataSessionQuestionOption,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { QuestionToolbar } from "../../components/QuestionToolbar";
import { QuestionPromptHeader } from "@/components/panel/exam/QuestionPromptHeader";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";

interface Props {
  q: StrataSessionQuestionFull;
  questionNumber?: number;
  mode?: string;
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
  hideQuestionHeader?: boolean;
}

export const OrderingNumberQuestion = ({
  q,
  questionNumber,
  mode,
  examId,
  examGuidId,
  sectionId,
  sectionGuidId,
  hideQuestionHeader,
}: Props) => {

  const m = (mode ?? "").toLowerCase().trim();
  const showFeedback = m === "review" || m === "tutor";

  const correctOrderIds: number[] = (() => {
    const raw = q.questionCorrectAnswers?.[0]?.correctOrder ?? "";
    return raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  })();

  const [displayOptions] = useState(() =>
    (q.questionOptions ?? []).slice().sort(() => Math.random() - 0.5)
  );

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedAssignments = (
    saved?.answer && typeof saved.answer === "object" && !Array.isArray(saved.answer)
      ? saved.answer
      : {}
  ) as Record<number, string>;

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedAssignments: Record<number, string> = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return {};
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      if (!Array.isArray(parsed)) return {};
      return Object.fromEntries(
        parsed.map((item: { optionId: number; order: number }) => [
          item.optionId,
          String(item.order),
        ])
      );
    } catch { return {}; }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [assignments, setAssignments] = useState<Record<number, string>>(
    () => {
      if (shouldClear) return Object.fromEntries(displayOptions.map((opt) => [opt.id, ""]));
      if (Object.keys(savedAssignments).length > 0) return savedAssignments;
      if (Object.keys(persistedAssignments).length > 0) return persistedAssignments;
      return Object.fromEntries(displayOptions.map((opt) => [opt.id, ""]));
    }
  );

  useEffect(() => {
    if (saved?.answer && Object.keys(savedAssignments).length > 0) {
      setAssignments(savedAssignments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.answer]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const emptyAssignments = Object.fromEntries(displayOptions.map((opt) => [opt.id, ""]));
    const onFresh = () => setAssignments(emptyAssignments);
    const onPrior = () => setAssignments(
      Object.keys(persistedAssignments).length > 0 ? persistedAssignments : emptyAssignments
    );
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const assign = (optId: number, value: string) => {
    if (value !== "") {
      const n = parseInt(value, 10);
      if (isNaN(n) || n < 1 || n > maxPosition) return;
    }
    const next = { ...assignments, [optId]: value };
    setAssignments(next);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedOrderingNumber" : "ActionOrderingNumber", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: next,
    });
  };

  const getState = (opt: StrataSessionQuestionOption): "correct" | "wrong" | "idle" => {
    if (!showFeedback) return "idle";
    const assigned = parseInt(assignments[opt.id] ?? "", 10);
    if (isNaN(assigned)) return "idle";
    return correctOrderIds[assigned - 1] === opt.id ? "correct" : "wrong";
  };

  const maxPosition = displayOptions.length;

  return (
    <div className="pt-1 space-y-2">

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      <QuestionPromptHeader
        questionNumber={questionNumber}
        questionText={q.questionText}
        metaQuestionText={q.metaQuestionText}
        hideQuestionHeader={hideQuestionHeader}
      />
{/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {!hideQuestionHeader &&
        q.metaQuestionText &&
        q.metaQuestionText.trim().toLowerCase() !== "null" && (
          <div
            className="text-sm px-2 text-gray-500 italic"
            dangerouslySetInnerHTML={{ __html: q.metaQuestionText }}
          />
        )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      <p className="text-xs text-gray-500 italic">
        Assign a position number (1 – {maxPosition}) to each item to indicate the correct order.
      </p>

      <div className="space-y-2">
        {displayOptions.map((opt) => {
          const state = getState(opt);
          return (
            <div
              key={opt.id}
              className={`flex items-center gap-3 border rounded-md px-3 py-2 transition
                ${state === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300" : ""}
                ${state === "wrong" ? "border-red-400 bg-red-50 text-red-700 ring-1 ring-red-300" : ""}
                ${state === "idle" ? "border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50" : ""}
              `}
            >
              <input
                type="number"
                min={1}
                max={maxPosition}
                value={assignments[opt.id]}
                onChange={(e) => assign(opt.id, e.target.value)}
                placeholder={`1 - ${maxPosition}`}
                title={`Enter a Number from 1 to ${maxPosition}`}
                className="w-24 md:w-28 shrink-0 border border-gray-300 rounded px-2 py-1 text-sm text-center
                placeholder:placeholder:text-xs
                focus:outline-none focus:ring-2 focus:ring-indigo-400
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="flex-1 text-sm">
                {opt.answerContent || opt.option}
                {opt.description && (
                  <span className="ml-1 text-xs text-gray-500"> - - ({opt.description})</span>
                )}
              </span>
              {state === "correct" && <span className="text-xs font-bold text-emerald-600 shrink-0">✓</span>}
              {state === "wrong" && <span className="text-xs font-bold text-red-500 shrink-0">✗</span>}
            </div>
          );
        })}
      </div>

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};