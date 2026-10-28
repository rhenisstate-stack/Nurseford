'use client';

import { useEffect, useState } from "react";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { QuestionToolbar } from "../../components/QuestionToolbar";
import { QuestionPromptHeader } from "@/components/panel/exam/QuestionPromptHeader";
import { cleanOptionText } from "@/lib/utils/exams/cleanExamText";
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

export const BlankSelectQuestion = ({
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

  // The sentence template is the content tagged "BlankSelectData". In a
  // case-based question, [0] is a case, so never rely on position.
  const sentence =
    (q.questionContents ?? []).find((c) => c.prerequisites === "BlankSelectData")?.title ??
    q.questionContents?.[0]?.title ??
    "";

  const correctByBlank = new Map<string, number[]>();
  (q.questionCorrectAnswers ?? []).forEach((ca) => {
    const r = JSON.parse(ca.validationRules ?? "{}") as { blank_number?: string };
    const bn = r.blank_number ?? "1";
    if (!correctByBlank.has(bn)) correctByBlank.set(bn, []);
    correctByBlank.get(bn)!.push(ca.questionOptionId!);
  });

  // "Blank1" / "Blank2" → "1" / "2". The blank an option belongs to lives in
  // `data`; `order` is only the option's position inside that blank.
  const getBlankNumber = (opt: { data?: string | null }) => {
    const m = String(opt.data ?? "").match(/(\d+)/);
    return m ? m[1] : "1";
  };

  const groups = Array.from(
    (q.questionOptions ?? []).reduce((map, opt) => {
      const blank = getBlankNumber(opt);
      if (!map.has(blank)) map.set(blank, []);
      map.get(blank)!.push(opt);
      return map;
    }, new Map<string, NonNullable<typeof q.questionOptions>>())
  )
    .map(([blank, opts]) => [
      blank,
      [...opts].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
    ] as const)
    .sort(([a], [b]) => Number(a) - Number(b));

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedSelected = (
    saved?.answer && typeof saved.answer === "object" && !Array.isArray(saved.answer)
      ? saved.answer
      : {}
  ) as Record<string, number | null>;

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedSelected: Record<string, number | null> = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return {};
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      if (!Array.isArray(parsed)) return {};
      return Object.fromEntries(
        parsed.map((item: { blank: string; optionId: number }) => [
          item.blank,
          item.optionId,
        ])
      );
    } catch { return {}; }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [selected, setSelected] = useState<Record<string, number | null>>(
    () => {
      if (shouldClear) return Object.fromEntries(groups.map(([blank]) => [blank, null]));
      if (Object.keys(savedSelected).length > 0) return savedSelected;
      if (Object.keys(persistedSelected).length > 0) return persistedSelected;
      return Object.fromEntries(groups.map(([blank]) => [blank, null]));
    }
  );

  useEffect(() => {
    if (saved?.answer && Object.keys(savedSelected).length > 0) {
      setSelected(savedSelected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.answer]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const emptySelected = Object.fromEntries(groups.map(([blank]) => [blank, null]));
    const onFresh = () => setSelected(emptySelected);
    const onPrior = () => setSelected(
      Object.keys(persistedSelected).length > 0 ? persistedSelected : emptySelected
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

  const handleSelect = (blankNumber: string, optId: number | null) => {
    const next = { ...selected, [blankNumber]: optId };
    setSelected(next);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedBlankSelect" : "ActionBlankSelect", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: next,
    });
  };

  const getState = (blankNumber: string): "correct" | "wrong" | "idle" => {
    if (!showFeedback) return "idle";
    const sel = selected[blankNumber];
    if (sel == null) return "idle";
    return correctByBlank.get(blankNumber)?.includes(sel) ? "correct" : "wrong";
  };

  type Part = { type: "text"; value: string } | { type: "blank"; blankNumber: string };

  const parts: Part[] = (() => {
    if (!sentence) return [];
    const regex = /(\[blank\d+\])/gi;
    const segments = sentence.split(regex);
    return segments.map((seg): Part => {
      const match = seg.match(/^\[blank(\d+)\]$/i);
      if (match) return { type: "blank", blankNumber: match[1] };
      return { type: "text", value: seg };
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

      {!hideQuestionHeader &&
        q.metaQuestionText &&
        q.metaQuestionText.trim().toLowerCase() !== "null" && (
          <div
            className="text-sm px-2 text-gray-500 italic"
            dangerouslySetInnerHTML={{ __html: q.metaQuestionText }}
          />
        )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {parts.length > 0 ? (
        <div className="leading-loose text-sm md:text-base">
          {parts.map((part, i) => {
            if (part.type === "text") return <span key={i}>{part.value}</span>;
            const { blankNumber } = part;
            const opts = groups.find(([g]) => g === blankNumber)?.[1] ?? [];
            const state = getState(blankNumber);
            const selId = selected[blankNumber];
            const correctOptId = correctByBlank.get(blankNumber)?.[0];
            const correctOpt = opts.find((o) => o.id === correctOptId);
            return (
              <span key={i} className="inline-flex items-center gap-1 mx-1 align-middle">
                <select
                  value={selId ?? ""}
                  onChange={(e) =>
                    handleSelect(blankNumber, e.target.value ? Number(e.target.value) : null)
                  }
                  className={`inline-block border rounded-md px-2 py-0.5 text-sm shadow-sm
                    focus:outline-none focus:ring-2 transition
                    ${state === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-800 focus:ring-emerald-300" : ""}
                    ${state === "wrong" ? "border-red-400   bg-red-50   text-red-700   focus:ring-red-300" : ""}
                    ${state === "idle" ? "border-gray-300  bg-white    text-gray-700   focus:ring-indigo-400" : ""}
                  `}
                >
                  <option value="">Blank {blankNumber} Select</option>
                  {opts.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.answerContent}</option>
                  ))}
                </select>
                {state !== "idle" && (
                  <span className={`text-[10px] font-bold
                    ${state === "correct" ? "text-emerald-600" : "text-red-500"}`}>
                    {state === "correct" ? "✓" : "✗"}
                  </span>
                )}
                {showFeedback && state === "wrong" && correctOpt && (
                  <span className="text-[10px] text-emerald-700 font-semibold whitespace-nowrap">
                    → {correctOpt.answerContent}
                  </span>
                )}
                {showFeedback && state === "idle" && correctOpt && (
                  <span className="text-[10px] text-amber-600 font-semibold whitespace-nowrap">
                    → {correctOpt.answerContent}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(([blankNumber, opts]) => {
            const state = getState(blankNumber);
            const selId = selected[blankNumber];
            const correctOptId = correctByBlank.get(blankNumber)?.[0];
            const correctOpt = opts?.find((o) => o.id === correctOptId);
            return (
              <div key={blankNumber} className="flex items-center gap-2 flex-wrap">
                <span className="shrink-0 text-[11px] font-semibold text-indigo-500 uppercase tracking-wide w-16 text-right">
                  blank {blankNumber}
                </span>
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                  <select
                    value={selId ?? ""}
                    onChange={(e) =>
                      handleSelect(blankNumber, e.target.value ? Number(e.target.value) : null)
                    }
                    className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm
                      focus:outline-none focus:ring-2 transition
                      ${state === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-800 focus:ring-emerald-300" : ""}
                      ${state === "wrong" ? "border-red-400   bg-red-50   text-red-700   focus:ring-red-300" : ""}
                      ${state === "idle" ? "border-gray-300  bg-white    text-gray-700   focus:ring-indigo-400" : ""}
                    `}
                  >
                    <option value="">— select —</option>
                    {opts!.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.answerContent}</option>
                    ))}
                  </select>
                  {state !== "idle" && (
                    <span className={`absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none
                      ${state === "correct" ? "text-emerald-600" : "text-red-500"}`}>
                      {state === "correct" ? "✓" : "✗"}
                    </span>
                  )}
                </div>
                {showFeedback && state === "wrong" && correctOpt && (
                  <span className="text-xs text-emerald-700 font-semibold shrink-0">
                    → {correctOpt.answerContent}
                  </span>
                )}
                {showFeedback && state === "idle" && correctOpt && (
                  <span className="text-xs text-amber-600 font-semibold shrink-0">
                    → {correctOpt.answerContent}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};