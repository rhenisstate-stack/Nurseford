'use client';

import { useEffect, useState, useRef } from "react";
import { GripVertical } from "lucide-react";
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

export const OrderingItemQuestion = ({
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

  const correctOrderIds: number[] = (() => {
    const raw = q.questionCorrectAnswers?.[0]?.correctOrder ?? "";
    return raw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  })();

  const shuffleArray = (arr: StrataSessionQuestionOption[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initial = (() => {
    const shuffled = shuffleArray(q.questionOptions ?? []);
    const isCorrectInitially =
      shuffled.length === correctOrderIds.length &&
      shuffled.every((item, index) => item.id === correctOrderIds[index]);
    if (isCorrectInitially && shuffled.length > 1) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
  })();

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedOrder = Array.isArray(saved?.answer) ? (saved.answer as number[]) : null;

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedOrder: number[] | null = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return null;
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      if (!Array.isArray(parsed)) return null;
      return parsed
        .slice()
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
        .map((item: { optionId: number }) => item.optionId);
    } catch { return null; }
  })();

  const resolveInitial = (): StrataSessionQuestionOption[] => {
    const order = savedOrder ?? persistedOrder;
    if (!order) return initial;
    const map = Object.fromEntries((q.questionOptions ?? []).map((o) => [o.id, o]));
    const restored = order.map((id) => map[id]).filter(Boolean) as StrataSessionQuestionOption[];
    return restored.length === initial.length ? restored : initial;
  };

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [items, setItems] = useState<StrataSessionQuestionOption[]>(
    () => shouldClear ? initial : resolveInitial()
  );

  useEffect(() => {
    const order = savedOrder ?? persistedOrder;
    if (order && order.length > 0) {
      const map = Object.fromEntries((q.questionOptions ?? []).map((o) => [o.id, o]));
      const restored = order.map((id) => map[id]).filter(Boolean) as StrataSessionQuestionOption[];
      if (restored.length === initial.length) setItems(restored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.answer]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setItems(initial);
    const onPrior = () => {
      if (persistedOrder && persistedOrder.length > 0) {
        const map = Object.fromEntries((q.questionOptions ?? []).map((o) => [o.id, o]));
        const restored = persistedOrder.map((id) => map[id]).filter(Boolean) as StrataSessionQuestionOption[];
        if (restored.length === initial.length) setItems(restored);
      } else {
        setItems(initial);
      }
    };
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // ── Drag state ──────────────────────────────────────────────────────────
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const onDragStart = (index: number) => { dragIndex.current = index; };
  const onDragEnter = (index: number) => { dragOverIndex.current = index; };

  const onDragEnd = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from === null || to === null || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    dragIndex.current = null;
    dragOverIndex.current = null;

    submitAnswer("ActionOrderingItem", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: next.map((o) => o.id),
    });
  };

  // ── Touch drag state ────────────────────────────────────────────────────
  const touchStartY = useRef<number>(0);
  const touchDragIndex = useRef<number | null>(null);

  const onTouchStart = (index: number, e: React.TouchEvent) => {
    touchDragIndex.current = index;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - touchStartY.current;
    const steps = Math.round(diff / 56);
    const from = touchDragIndex.current;
    if (from === null || steps === 0) return;
    const to = Math.max(0, Math.min(items.length - 1, from + steps));
    if (from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    touchDragIndex.current = null;

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedOrderingItem" : "ActionOrderingItem", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: next.map((o) => o.id),
    });
  };

  const getState = (opt: StrataSessionQuestionOption, position: number): "correct" | "wrong" | "idle" => {
    if (!showFeedback) return "idle";
    return correctOrderIds[position] === opt.id ? "correct" : "wrong";
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

      <p className="text-xs text-gray-500 italic">
        Drag the items into the correct order. Item 1 is first.
      </p>

      <div className="space-y-2">
        {items.map((opt, index) => {
          const state = getState(opt, index);
          return (
            <div
              key={opt.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragEnter={() => onDragEnter(index)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onTouchStart={(e) => onTouchStart(index, e)}
              onTouchEnd={onTouchEnd}
              className={`flex items-center gap-3 border rounded-md px-3 py-2 cursor-grab active:cursor-grabbing transition select-none
                ${state === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300" : ""}
                ${state === "wrong" ? "border-red-400 bg-red-50 text-red-700 ring-1 ring-red-300" : ""}
                ${state === "idle" ? "border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50" : ""}
              `}
            >
              <span className="shrink-0 w-6 h-6 flex items-center justify-center
                rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                {index + 1}
              </span>
              <GripVertical size={16} className="shrink-0 text-gray-400" />
              <span className="flex-1 text-sm">
                {opt.answerContent || opt.option}
                {opt.description && (
                  <span className="ml-1 text-xs text-gray-500"> - - ({opt.description})</span>
                )}
              </span>
              {state === "correct" && <span className="text-xs font-bold text-emerald-600 shrink-0">✓</span>}
              {state === "wrong" && <span className="text-xs font-bold text-red-500 shrink-0">✗</span>}
            </div>
          );
        })}
      </div>

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};