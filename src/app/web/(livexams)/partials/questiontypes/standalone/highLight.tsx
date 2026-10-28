// src\app\web\(livexams)\ati-teas\vista\exam\(layout)\partials\questiontypes\standalone\highLight.tsx
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

type Part =
  | { type: "text"; value: string }
  | { type: "highlight"; label: string; value: string; optionId: number | null };

type HighlightState = "idle" | "selected" | "correct" | "wrong" | "missed";

export const HighLightQuestion = ({
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

  const passage = q.questionContents?.[0]?.title ?? "";

  // marker label ("1","2","3"...) -> matching questionOption
  const optionByLabel = new Map<string, StrataSessionQuestionOption>();
  (q.questionOptions ?? []).forEach((opt) => {
    if (opt.label != null) optionByLabel.set(String(opt.label), opt);
  });

  const correctIds = (q.questionCorrectAnswers ?? [])
    .filter((ca) => ca.isCorrect)
    .map((ca) => ca.questionOptionId)
    .filter((id): id is number => typeof id === "number");

  // Parse "...[[[3] highlighted text]]..." into plain text + highlight-candidate parts,
  const parts: Part[] = (() => {
    if (!passage) return [];
    const regex = /\[\[\[(\d+)\]([\s\S]*?)\]\]/g;
    const result: Part[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(passage)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: "text", value: passage.slice(lastIndex, match.index) });
      }
      const label = match[1];
      const text = match[2];
      const opt = optionByLabel.get(label);
      result.push({ type: "highlight", label, value: text, optionId: opt?.id ?? null });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < passage.length) {
      result.push({ type: "text", value: passage.slice(lastIndex) });
    }
    return result;
  })();

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
    () => (shouldClear ? new Set() : new Set(savedIds.length > 0 ? savedIds : persistedIds))
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

  const toggle = (optionId: number | null) => {
    if (optionId == null) return; // marker didn't resolve to a real option — not selectable

    const next = new Set(picked);
    if (next.has(optionId)) {
      next.delete(optionId);
    } else {
      next.add(optionId);
    }
    setPicked(next);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedHighLight" : "ActionHighLight", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: Array.from(next),
    });
  };

  const getState = (optionId: number | null): HighlightState => {
    if (optionId == null) return "idle";
    const isPicked = picked.has(optionId);
    const isCorrect = correctIds.includes(optionId);

    if (!showFeedback) return isPicked ? "selected" : "idle";

    if (isPicked && isCorrect) return "correct";
    if (isPicked && !isCorrect) return "wrong";
    if (!isPicked && isCorrect) return "missed";
    return "idle";
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

      <div className="leading-loose text-sm md:text-base bg-white border border-gray-200 rounded-lg p-4">
        {parts.length > 0 ? (
          parts.map((part, i) => {
            if (part.type === "text") return <span key={i}>{part.value}</span>;

            const state = getState(part.optionId);
            const clickable = part.optionId != null;

            return (
              <span
                key={i}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => toggle(part.optionId) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(part.optionId);
                      }
                    }
                    : undefined
                }
                className={`rounded px-0.5 transition select-none
                  ${clickable ? "cursor-pointer" : ""}
                  ${state === "idle" ? "bg-yellow-100 hover:bg-pink-300 text-gray-900" : ""}
                  ${state === "selected" ? "bg-emerald-200 text-emerald-900" : ""}
                  ${state === "correct" ? "bg-emerald-200 text-emerald-900 ring-1 ring-emerald-400" : ""}
                  ${state === "wrong" ? "bg-red-200 text-red-800 ring-1 ring-red-400" : ""}
                  ${state === "missed" ? "border-2 border-dashed border-amber-400 bg-amber-50 text-amber-800" : ""}
                `}
              >
                {(state === "correct" || state === "selected") && (
                  <span className="mr-0.5 text-emerald-700 font-bold text-[10px]">✓</span>
                )}
                {state === "wrong" && (
                  <span className="mr-0.5 text-red-600 font-bold text-[10px]">✗</span>
                )}
                {state === "missed" && (
                  <span className="mr-0.5 text-amber-600 font-bold text-[10px]">•</span>
                )}
                {part.value}
              </span>
            );
          })
        ) : (
          <span className="text-gray-500 italic">No passage available.</span>
        )}
      </div>

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};