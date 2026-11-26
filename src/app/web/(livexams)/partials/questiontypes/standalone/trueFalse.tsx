'use client';

import { useEffect, useState } from "react";
import type {
  StrataSessionQuestionFull,
  StrataSessionQuestionOption,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { QuestionToolbar } from "../../components/QuestionToolbar";
import { QuestionPromptHeader } from "@/components/panel/exam/QuestionPromptHeader";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";
import { useClearOnEvent } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useClearLiveExamUserAnswers";

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

export const TrueFalseQuestion = ({
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
  const showFeedback = m === "review" || m === "preview" || m === "practice" || m === "tutor";

  const correctIds = q.questionCorrectAnswers
    ?.filter((ca) => ca.isCorrect)
    .map((ca) => ca.questionOptionId) ?? [];

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedOptionId = typeof saved?.answer === "number" ? saved.answer : null;

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedOptionId = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return null;
    try {
      const val = q.savedUserAnswer.userAnswerData.trim().toLowerCase();
      const match = q.questionOptions?.find(
        (o) => (o.answerContent ?? "").toLowerCase().trim() === val
      );
      return match?.id ?? null;
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

  useClearOnEvent(q.id, () => setPicked(null));

  const handlePick = (optId: number) => {
    setPicked(optId);

    const selectedOption = q.questionOptions?.find(o => o.id === optId);

    const isTrue =
      (selectedOption?.option ?? selectedOption?.answerContent ?? "")
        .toLowerCase()
        .trim() === "true";

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedTrueFalse" : "ActionTrueFalse", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: isTrue,
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

      <div className="mt-2 sm:mt-2.5 space-y-1 sm:space-y-1.5">
        {q.questionOptions?.map((opt: StrataSessionQuestionOption) => {
          const isPicked = picked === opt.id;
          const state = getState(opt.id);

          let rowColorClasses = "border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200";

          if (state === "correct") {
            rowColorClasses = "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-300";
          } else if (state === "wrong") {
            rowColorClasses = "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-1 ring-red-300";
          } else if (isPicked) {
            rowColorClasses = "border-teal-500/80 dark:border-teal-400/60 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100/60 dark:hover:bg-teal-900/40 text-teal-950 dark:text-teal-100 ring-1 ring-teal-500/20";
          }

          return (
            <label
              key={opt.id}
              className={`flex items-start gap-2.5 sm:gap-3 px-3 py-1 sm:px-3.5 sm:py-1 rounded-md border transition cursor-pointer select-none shadow-2xs ${rowColorClasses}`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt.id}
                checked={isPicked}
                className="w-4 h-4 cursor-pointer shrink-0 mt-0.5 accent-teal-600 dark:accent-teal-500"
                onChange={() => handlePick(opt.id)}
              />
              <span className="flex-1 text-sm sm:text-base font-normal leading-snug">
                {opt.answerContent || opt.option}
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