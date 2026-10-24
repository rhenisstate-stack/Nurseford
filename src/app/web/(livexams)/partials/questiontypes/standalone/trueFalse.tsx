'use client';

import { useEffect, useState } from "react";
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
  const showFeedback = m === "review" || m === "tutor";

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

      {!hideQuestionHeader && (
        <div className="flex items-center gap-3">
          <div className="shrink-0 py-1 px-2 rounded
            bg-gradient-to-br from-yellow-800 to-rose-600 text-white
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

      <div className="flex gap-3">
        {q.questionOptions?.map((opt: StrataSessionQuestionOption) => {
          const state = getState(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-center gap-2 cursor-pointer border rounded px-4 py-2 text-sm transition
                ${state === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300" : ""}
                ${state === "wrong" ? "border-red-400 bg-red-50 text-red-700 ring-1 ring-red-300" : ""}
                ${state === "idle" ? "hover:bg-green-300" : ""}
              `}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt.id}
                checked={picked === opt.id}
                className="w-4 h-4 md:w-5 md:h-5 cursor-pointer shrink-0"
                onChange={() => handlePick(opt.id)}
              />
              <span>
                {opt.answerContent || opt.option}
                {opt.description && (
                  <span className="ml-1 text-xs"> - - ({opt.description})</span>
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