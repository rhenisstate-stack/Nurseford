'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
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

export const DynamicImageQuestion = ({
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
  const savedPicked = Array.isArray(saved?.answer)
    ? new Set(saved.answer as number[])
    : new Set<number>();

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedPicked: Set<number> = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return new Set();
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.map((item: { optionId: number }) => item.optionId));
    } catch { return new Set(); }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [picked, setPicked] = useState<Set<number>>(
    () => shouldClear ? new Set() : (savedPicked.size > 0 ? savedPicked : persistedPicked)
  );

  useEffect(() => {
    if (savedPicked.size > 0 && picked.size === 0) {
      setPicked(savedPicked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.answer]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setPicked(new Set());
    const onPrior = () => setPicked(persistedPicked);
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
  }, [persistedPicked]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const toggle = (optId: number) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(optId)) next.delete(optId);
      else next.add(optId);

      // only user-picked data goes to backend — q data is never mutated
      submitAnswer(hideQuestionHeader ? "ActionCaseBasedDynamicImage" : "ActionDynamicImage", {
        questionId: q.id,
        questionGuidId: q.guidId,
        examId,
        examGuidId,
        sectionId,
        sectionGuidId,
        answer: Array.from(next),
      });

      return next;
    });
  };

  const getState = (optId: number): "correct" | "wrong" | "idle" => {
    if (!showFeedback || !picked.has(optId)) return "idle";
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

      {q.questionMedias?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {q.questionMedias.map((media) => (
            <div
              key={media.id}
              className="relative w-full aspect-video bg-gray-100 rounded overflow-hidden border"
            >
              <Image
                src={`/api/media/${media.mediaPath}`}
                alt="question media"
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      )}

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
                {opt.answerContent}
                {opt.description && (
                  <span className="ml-1 text-xs text-gray-500">— {opt.description}</span>
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