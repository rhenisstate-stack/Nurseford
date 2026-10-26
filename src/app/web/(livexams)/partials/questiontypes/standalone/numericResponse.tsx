'use client';

import { useEffect, useState } from "react";
import type { StrataSessionQuestionFull }
  from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
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

export const NumericResponseQuestion = ({
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

  const correctValue = q.questionCorrectAnswers
    ?.map((ca) => ca.openEndedAnswer)
    .find(Boolean) ?? "";

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedValue = typeof saved?.answer === "string" ? saved.answer
    : typeof saved?.answer === "number" ? String(saved.answer)
      : "";

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedValue = (() => {
    const raw = q.savedUserAnswer?.userAnswerData;
    if (!raw) return "";
    return raw.trim();
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [value, setValue] = useState(shouldClear ? "" : (savedValue || persistedValue));

  useEffect(() => {
    if (savedValue && !value) {
      setValue(savedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedValue]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setValue("");
    const onPrior = () => setValue(persistedValue);
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
  }, [persistedValue]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const getState = (): "correct" | "wrong" | "idle" => {
    if (!showFeedback || !value) return "idle";
    return value.trim() === correctValue.trim() ? "correct" : "wrong";
  };

  const state = getState();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-") { setValue(raw); return; }
    const decimalMatch = raw.match(/^-?\d*\.?(\d*)$/);
    if (!decimalMatch) return;
    if ((decimalMatch[1] ?? "").length > 5) return;
    setValue(raw);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedNumericResponse" : "ActionNumericResponse", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: raw,
    });
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

      <div className="flex items-center gap-3">
        <div className="w-full md:w-56 relative">
          <input
            type="number"
            value={value}
            onChange={handleChange}
            placeholder="Enter a Number . . . (e.g. 3.14)"
            step="any"
            className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 transition
              ${state === "correct" ? "border-emerald-400 focus:ring-emerald-300 bg-emerald-50 text-emerald-800" : ""}
              ${state === "wrong" ? "border-red-400 focus:ring-red-300 bg-red-50 text-red-700" : ""}
              ${state === "idle" ? "border-gray-300 focus:ring-indigo-400 focus:border-indigo-400" : ""}
            `}
          />
          {state !== "idle" && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none
              ${state === "correct" ? "text-emerald-600" : "text-red-500"}`}>
              {state === "correct" ? "✓" : "✗"}
            </span>
          )}
        </div>
        {value && (
          <span className="text-xs text-gray-400 shrink-0">
            = <span className="font-mono font-semibold text-gray-600">{value}</span>
          </span>
        )}
      </div>

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};