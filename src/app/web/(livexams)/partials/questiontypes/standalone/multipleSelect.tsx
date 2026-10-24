'use client';

import { useState, useEffect } from "react";
import type {
  StrataSessionQuestionFull,
  StrataSessionQuestionOption,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { QuestionToolbar } from "../../components/QuestionToolbar";
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

export const MultipleSelectQuestion = ({
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

  const correctIds = q.questionCorrectAnswers
    ?.filter((ca) => ca.isCorrect)
    .map((ca) => ca.questionOptionId) ?? [];

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedIds: number[] = Array.isArray(saved?.answer) ? (saved.answer as number[]) : [];

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedIds: number[] = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return [];
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === "number") : [];
    } catch {
      return [];
    }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [picked, setPicked] = useState<Set<number>>(
    () => shouldClear ? new Set() : new Set(savedIds.length > 0 ? savedIds : persistedIds)
  );

  useEffect(() => {
    if (savedIds.length > 0 && picked.size === 0) {
      setPicked(new Set(savedIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setPicked(new Set());
    const onPrior = () => setPicked(new Set(persistedIds));
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
  }, [persistedIds]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const toggle = (optId: number) => {
    const next = new Set(picked);
    if (next.has(optId)) {
      next.delete(optId);
    } else {
      next.add(optId);
    }
    setPicked(next);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedMultipleSelect" : "ActionMultipleSelect", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: Array.from(next),
    });
  };

  const getState = (optId: number): "correct" | "wrong" | "idle" => {
    if (!showFeedback || !picked.has(optId)) return "idle";
    return correctIds.includes(optId) ? "correct" : "wrong";
  };

  return (
    <div className="pt-1 space-y-2">

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {!hideQuestionHeader && (
        <div className="flex items-center gap-3">
          <div className="shrink-0 py-1 px-2 rounded
            bg-gradient-to-br from-yellow-800 to-red-600 text-white
            flex items-center justify-center text-xs md:text-sm font-bold shadow-md">
            {questionNumber}
          </div>
          <div
            className="flex-1 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: q.questionText ?? "" }}
          />
        </div>
      )}

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

      <div className="space-y-1">
        {q.questionOptions?.map((opt: StrataSessionQuestionOption) => {
          const state = getState(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-2 cursor-pointer border rounded-md px-2 py-1.5 transition
                ${state === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300" : ""}
                ${state === "wrong" ? "border-red-400 bg-red-50 text-red-700 ring-1 ring-red-300" : ""}
                ${state === "idle" ? "border-transparent hover:border-indigo-200 hover:bg-indigo-50" : ""}
              `}
            >
              <input
                type="checkbox"
                name={`q-${q.id}`}
                checked={picked.has(opt.id)}
                className="w-4 h-4 md:w-5 md:h-5 cursor-pointer shrink-0 mt-0.5"
                onChange={() => toggle(opt.id)}
              />
              <span className="flex-1">
                {opt.answerContent || opt.option}
                {opt.description && (
                  <span className="ml-1 text-xs">
                    {/* - - ({opt.description}) */}
                  </span>
                )}
              </span>
              {state === "correct" && <span className="text-xs font-bold text-emerald-600 shrink-0">✓</span>}
              {state === "wrong" && <span className="text-xs font-bold text-red-500 shrink-0">✗</span>}
            </label>
          );
        })}
      </div>

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />

    </div>
  );
};