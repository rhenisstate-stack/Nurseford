// src\app\web\(nursing)\atiteas\vista\exam\(layout)\partials\questiontypes\openEnded.tsx
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

// Question Identifier details passed from ...\vista\exam\(layout)\generic\page.tsx
export const OpenEndedQuestion = ({
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

  // Model answer lives on the correct-answer row's OpenEndedAnswer field — there is no
  // "option" to mark correct/wrong against, so feedback here just surfaces the model answer.
  const modelAnswer = q.questionCorrectAnswers?.find((ca) => ca.isCorrect)?.openEndedAnswer ?? null;

  // answer context (write-only from exam data's perspective)
  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedText = typeof saved?.answer === "string" ? saved.answer : null;

  // Auto-populate from backend savedUserAnswer if provided else just display blank
  const persistedText = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return "";
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      return typeof parsed?.text === "string" ? parsed.text : "";
    } catch {
      return q.savedUserAnswer.userAnswerData;
    }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [text, setText] = useState<string>(
    shouldClear ? "" : (savedText ?? persistedText)
  );

  // preload if context already has a saved answer when component mounts
  useEffect(() => {
    if (savedText !== null && text === "") {
      setText(savedText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedText]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setText("");
    const onPrior = () => setText(persistedText);
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
  }, [persistedText]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const handleChange = (value: string) => {
    setText(value);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedOpenEnded" : "ActionOpenEnded", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: value,
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

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        disabled={showFeedback}
        rows={5}
        placeholder="Type your answer here..."
        className="w-full border rounded-md px-3 py-2 text-sm leading-relaxed resize-y
          border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 outline-none
          disabled:bg-gray-50 disabled:text-gray-600"
      />

      {showFeedback && modelAnswer && (
        <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-md px-3 py-2 text-sm">
          <span className="font-bold text-xs uppercase tracking-wide block mb-1">Model Answer</span>
          <div dangerouslySetInnerHTML={{ __html: modelAnswer }} />
        </div>
      )}

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};