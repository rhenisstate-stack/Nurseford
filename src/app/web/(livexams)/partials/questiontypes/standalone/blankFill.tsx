'use client';

import { useEffect, useState } from "react";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
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

interface BlankMeta {
  blankIndex: number;
  blankTag: string;
  blankLabel: string;
  correctAnswer: string;
}

export const BlankFillQuestion = ({
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

  const sentenceOption = (q.questionOptions ?? []).find(
    (o) => o.label === "blank-fill-sentence" || (o.answerContent ?? "").includes("[blank")
  );
  const sentence = sentenceOption?.answerContent ?? q.questionText ?? "";

  const blanks: BlankMeta[] = (q.questionCorrectAnswers ?? [])
    .filter((ca) => ca.validationRules)
    .map((ca) => {
      const r = JSON.parse(ca.validationRules ?? "{}") as {
        blank_label?: string;
        blank_index?: number;
      };
      const idx = r.blank_index ?? 0;
      const label = r.blank_label ?? `blank${idx + 1}`;
      return {
        blankIndex: idx,
        blankTag: `[${label}]`,
        blankLabel: label,
        correctAnswer: ca.openEndedAnswer ?? "",
      };
    })
    .sort((a, b) => a.blankIndex - b.blankIndex);

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedValues = (
    saved?.answer && typeof saved.answer === "object" && !Array.isArray(saved.answer)
      ? saved.answer
      : {}
  ) as Record<string, string>;

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedValues: Record<string, string> = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return {};
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      if (!Array.isArray(parsed)) return {};
      // backend key is "blank1"/"blank2" — strip "blank" prefix to get label
      return Object.fromEntries(
        parsed.map((item: { blank: string; value: string }) => [
          item.blank,   // e.g. "blank1"
          item.value,
        ])
      );
    } catch { return {}; }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [values, setValues] = useState<Record<string, string>>(
    () => {
      if (shouldClear) return Object.fromEntries(blanks.map((b) => [b.blankLabel, ""]));
      if (Object.keys(savedValues).length > 0) return savedValues;
      if (Object.keys(persistedValues).length > 0) return persistedValues;
      return Object.fromEntries(blanks.map((b) => [b.blankLabel, ""]));
    }
  );

  useEffect(() => {
    if (saved?.answer && Object.keys(savedValues).length > 0) {
      setValues(savedValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.answer]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const emptyValues = Object.fromEntries(blanks.map((b) => [b.blankLabel, ""]));
    const onFresh = () => setValues(emptyValues);
    const onPrior = () => setValues(
      Object.keys(persistedValues).length > 0 ? persistedValues : emptyValues
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

  const setValue = (blankLabel: string, val: string) => {
    const next = {
      ...values,
      [blankLabel]: val,
    };

    setValues(next);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedBlankFill" : "ActionBlankFill", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: next,
    });
  };

  const getState = (blank: BlankMeta): "correct" | "wrong" | "idle" => {
    if (!showFeedback) return "idle";
    const userVal = (values[blank.blankLabel] ?? "").trim();
    if (!userVal) return "idle";
    return userVal.toLowerCase() === blank.correctAnswer.trim().toLowerCase()
      ? "correct"
      : "wrong";
  };

  type Part = { type: "text"; value: string } | { type: "blank"; blank: BlankMeta };

  const parts: Part[] = (() => {
    const tagPattern = blanks
      .map((b) => b.blankTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    if (!tagPattern) return [{ type: "text", value: sentence }];
    const regex = new RegExp(`(${tagPattern})`, "gi");
    const segments = sentence.split(regex);
    return segments.map((seg): Part => {
      const matchedBlank = blanks.find(
        (b) => b.blankTag.toLowerCase() === seg.toLowerCase()
      );
      return matchedBlank
        ? { type: "blank", blank: matchedBlank }
        : { type: "text", value: seg };
    });
  })();

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

      <div className="leading-loose text-sm md:text-base p-1">
        {parts.map((part, i) => {
          if (part.type === "text") return <span key={i}>{part.value}</span>;
          const { blank } = part;
          const state = getState(blank);
          return (
            <span key={i} className="inline-flex items-center gap-1 mx-1 align-middle">
              <span className="relative inline-flex items-center">
                <input
                  type="text"
                  value={values[blank.blankLabel] ?? ""}
                  onChange={(e) => setValue(blank.blankLabel, e.target.value)}
                  placeholder={blank.blankLabel}
                  className={`inline-block border-b-2 border-t-0 border-l-0 border-r-0 rounded-none
                    bg-transparent px-1 py-0.5 text-sm font-medium w-24 md:w-32
                    focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-300
                    ${state === "correct" ? "border-emerald-500 text-emerald-700" : ""}
                    ${state === "wrong" ? "border-red-400   text-red-600" : ""}
                    ${state === "idle" ? "border-gray-400  text-gray-800" : ""}
                  `}
                />
                {state !== "idle" && (
                  <span className={`text-[10px] font-bold ml-0.5
                    ${state === "correct" ? "text-emerald-600" : "text-red-500"}`}>
                    {state === "correct" ? "✓" : "✗"}
                  </span>
                )}
              </span>
              {showFeedback && state === "wrong" && (
                <span className="text-[10px] text-emerald-700 font-semibold whitespace-nowrap">
                  → {blank.correctAnswer}
                </span>
              )}
              {showFeedback && state === "idle" && blank.correctAnswer && (
                <span className="text-[10px] text-amber-600 font-semibold whitespace-nowrap">
                  → {blank.correctAnswer}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {!parts.some((p) => p.type === "blank") && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={values["blank1"] ?? values["answer"] ?? Object.values(values)[0] ?? ""}
            onChange={(e) => setValue("blank1", e.target.value)}
            placeholder="Type your answer here..."
            className="w-full max-w-md rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#001326] px-3 py-2 text-sm sm:text-base text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-2xs"
          />
          {showFeedback && q.questionCorrectAnswers?.[0]?.openEndedAnswer && (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              Correct Answer: {q.questionCorrectAnswers[0].openEndedAnswer}
            </div>
          )}
        </div>
      )}

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};