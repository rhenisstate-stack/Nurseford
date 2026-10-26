'use client';
import { cleanOptionText, isValidExamText, cleanExamText, resolveOptionDisplay } from "@/lib/utils/exams/cleanExamText";
// src\app\web\(nursing)\atiteas\vista\exam\(layout)\partials\questiontypes\singleChoice.tsx

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

// Question Identifier details passed from ...\vista\exam\(layout)\generic\page.tsx
export const SingleChoiceQuestion = ({
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

  // answer context (write-only from exam data's perspective) 
  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedOptionId = typeof saved?.answer === "number" ? saved.answer : null;

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedOptionId = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return null;
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      return typeof parsed?.optionId === "number" ? parsed.optionId : null;
    } catch {
      return null;
    }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [picked, setPicked] = useState<number | null>(
    shouldClear ? null : (savedOptionId ?? persistedOptionId)
  );
  // preload if context already has a saved answer when component mounts
  useEffect(() => {
    if (savedOptionId !== null && picked === null) {
      setPicked(savedOptionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedOptionId]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setPicked(null);
    const onPrior = () => setPicked(persistedOptionId);
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
  }, [persistedOptionId]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const handlePick = (optId: number) => {
    setPicked(optId);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedSingleChoice" : "ActionSingleChoice", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: optId,
    });
  };

  const getState = (optId: number): "correct" | "wrong" | "idle" => {
    if (!showFeedback || picked !== optId) return "idle";
    return correctIds.includes(optId) ? "correct" : "wrong";
  };

  return (
    <div className="pt-1 space-y-2">

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      <QuestionPromptHeader
        questionNumber={questionNumber}
        questionText={q.questionText}
        metaQuestionText={q.metaQuestionText}
        hideQuestionHeader={hideQuestionHeader}
      />

      <div className="mt-3 space-y-2">
        {q.questionOptions?.map((opt: StrataSessionQuestionOption) => {
          const isPicked = picked === opt.id;
          const state = getState(opt.id);
          const display = resolveOptionDisplay(opt, showFeedback);

          let rowColorClasses = "border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200";

          if (state === "correct") {
            rowColorClasses = "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-300";
          } else if (state === "wrong") {
            rowColorClasses = "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-1 ring-red-300";
          } else if (isPicked) {
            rowColorClasses = "border-blue-500/80 dark:border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500/20";
          }

          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-md border transition cursor-pointer select-none shadow-2xs ${rowColorClasses}`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={isPicked}
                className="w-4 h-4 cursor-pointer shrink-0 mt-0.5 accent-blue-600 dark:accent-blue-500"
                onChange={() => handlePick(opt.id)}
              />
              <span className="flex-1 text-sm sm:text-base font-normal leading-normal">
                {display.primaryText}
                {display.secondaryText && (
                  <span className="ml-1 text-xs opacity-75"> - ({display.secondaryText})</span>
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