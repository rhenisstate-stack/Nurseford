'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import type {
  StrataSessionQuestionFull,
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

export const MultipleImageQuestion = ({
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

  const correctMediaIds = q.questionCorrectAnswers
    ?.filter((ca) => ca.isCorrect)
    .map((ca) => ca.questionMediaId) ?? [];

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
      return new Set(parsed.map((item: { mediaId: number }) => item.mediaId));
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

  const toggle = (mediaId: number) => {
    setPicked((prev) => {
      const next = new Set(prev);

      if (next.has(mediaId))
        next.delete(mediaId);
      else
        next.add(mediaId);

      // only user-picked data goes to backend — q data is never mutated
      submitAnswer(hideQuestionHeader ? "ActionCaseBasedMultipleImage" : "ActionMultipleImage", {
        questionId: q.id,
        questionGuidId: q.guidId,
        examId,
        examGuidId,
        sectionId,
        sectionGuidId,
        answer: Array.from(next), // MEDIA IDS
      });

      return next;
    });
  };

  const getState = (
    mediaId: number
  ): "correct" | "wrong" | "missed" | "idle" => {

    if (!showFeedback)
      return "idle";

    const isCorrect =
      correctMediaIds.includes(mediaId);

    if (picked.has(mediaId))
      return isCorrect
        ? "correct"
        : "wrong";

    if (isCorrect)
      return "missed";

    return "idle";
  };

  const ringClass: Record<string, string> = {
    correct: "ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50/30",
    wrong: "ring-2 ring-red-400 border-red-400 bg-red-50/30",
    missed: "ring-2 ring-amber-400 border-amber-400 bg-amber-50/30",
    idle: "border-gray-200 hover:border-indigo-300 hover:ring-1 hover:ring-indigo-200",
  };

  const badgeClass: Record<string, string> = {
    correct: "bg-emerald-500 text-white",
    wrong: "bg-red-500 text-white",
    missed: "bg-amber-400 text-white",
    idle: "hidden",
  };

  const badgeLabel: Record<string, string> = {
    correct: "✓",
    wrong: "✗",
    missed: "!",
    idle: "",
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

      <p className="text-[11px] text-gray-400 italic">
        Select all correct images
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {(q.questionMedias ?? []).map((media) => {

          const state = getState(media.id);

          const isSelected =
            picked.has(media.id);

          return (
            <button
              key={media.id}
              type="button"
              onClick={() => toggle(media.id)}
              className={`relative group rounded-lg border-2 overflow-hidden transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
            ${ringClass[state]}
          `}
            >
              <div className="relative w-full aspect-video bg-gray-100">

                <Image
                  src={`/api/media/${media.mediaPath}`}
                  alt={`media-${media.id}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`object-contain transition-opacity duration-200
                ${state === "wrong"
                      ? "opacity-60"
                      : "opacity-100"
                    }
              `}
                />

                {isSelected && state === "idle" && (
                  <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
                )}

                {(isSelected || state === "missed") && (
                  <span
                    className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full
                  flex items-center justify-center text-[10px] font-bold shadow
                  ${showFeedback
                        ? badgeClass[state]
                        : "bg-indigo-500 text-white"
                      }
                `}
                  >
                    {showFeedback
                      ? badgeLabel[state]
                      : "✓"}
                  </span>
                )}

              </div>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            Correct
          </span>

          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            Incorrect
          </span>

          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            Missed
          </span>
        </div>
      )}

      <QuestionToolbar
        q={q}
        mode={mode}
        examId={examId}
        examGuidId={examGuidId}
        sectionId={sectionId}
        sectionGuidId={sectionGuidId}
      />
    </div>
  );
}