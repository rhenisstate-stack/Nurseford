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

export const OrderingDragDropQuestion = ({
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

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedOrder = Array.isArray(saved?.answer) ? (saved.answer as number[]) : null;

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

  // left = unplaced pool, right = placed/ordered answers
  const resolveInitialSplit = (): { left: StrataSessionQuestionOption[]; right: StrataSessionQuestionOption[] } => {
    const order = savedOrder ?? persistedOrder;
    const allOptions = q.questionOptions ?? [];
    if (!order || order.length === 0) {
      return { left: shuffleArray(allOptions), right: [] };
    }
    const map = Object.fromEntries(allOptions.map((o) => [o.id, o]));
    const right = order.map((id) => map[id]).filter(Boolean) as StrataSessionQuestionOption[];
    const rightIds = new Set(order);
    const left = allOptions.filter((o) => !rightIds.has(o.id));
    return { left, right };
  };

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [leftItems, setLeftItems] = useState<StrataSessionQuestionOption[]>(
    () => shouldClear ? shuffleArray(q.questionOptions ?? []) : resolveInitialSplit().left
  );
  const [rightItems, setRightItems] = useState<StrataSessionQuestionOption[]>(
    () => shouldClear ? [] : resolveInitialSplit().right
  );

  useEffect(() => {
    const order = savedOrder ?? persistedOrder;
    if (order && order.length > 0) {
      const allOptions = q.questionOptions ?? [];
      const map = Object.fromEntries(allOptions.map((o) => [o.id, o]));
      const right = order.map((id) => map[id]).filter(Boolean) as StrataSessionQuestionOption[];
      const rightIds = new Set(order);
      const left = allOptions.filter((o) => !rightIds.has(o.id));
      setLeftItems(left);
      setRightItems(right);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.answer]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const allOptions = q.questionOptions ?? [];
    const onFresh = () => {
      setLeftItems(shuffleArray(allOptions));
      setRightItems([]);
    };
    const onPrior = () => {
      if (persistedOrder && persistedOrder.length > 0) {
        const map = Object.fromEntries(allOptions.map((o) => [o.id, o]));
        const right = persistedOrder.map((id) => map[id]).filter(Boolean) as StrataSessionQuestionOption[];
        const rightIds = new Set(persistedOrder);
        const left = allOptions.filter((o) => !rightIds.has(o.id));
        setLeftItems(left);
        setRightItems(right);
      } else {
        setLeftItems(shuffleArray(allOptions));
        setRightItems([]);
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
  // source: "left" | "right", index in that list
  const dragSource = useRef<{ side: "left" | "right"; index: number } | null>(null);
  const dragOverRight = useRef<number | null>(null); // drop position on right column

  const onDragStartLeft = (index: number) => {
    dragSource.current = { side: "left", index };
  };

  const onDragStartRight = (index: number) => {
    dragSource.current = { side: "right", index };
  };

  const onDragEnterRight = (index: number) => {
    dragOverRight.current = index;
  };

  const onDragEnterLeft = () => {
    dragOverRight.current = null;
  };

  const submitRight = (next: StrataSessionQuestionOption[]) => {

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedOrderingDragDrop" : "ActionOrderingDragDrop", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: next.map((o) => o.id),
    });
  };

  const onDropRight = (e: React.DragEvent) => {
    e.preventDefault();
    const src = dragSource.current;
    if (!src) return;

    const insertAt = dragOverRight.current ?? rightItems.length;

    if (src.side === "left") {
      // Move from left to right
      const item = leftItems[src.index];
      const newLeft = leftItems.filter((_, i) => i !== src.index);
      const newRight = [...rightItems];
      newRight.splice(insertAt, 0, item);
      setLeftItems(newLeft);
      setRightItems(newRight);
      submitRight(newRight);
    } else {
      // Reorder within right
      const newRight = [...rightItems];
      const [moved] = newRight.splice(src.index, 1);
      const toIndex = src.index < insertAt ? insertAt - 1 : insertAt;
      newRight.splice(toIndex, 0, moved);
      setRightItems(newRight);
      submitRight(newRight);
    }

    dragSource.current = null;
    dragOverRight.current = null;
  };

  const onDropLeft = (e: React.DragEvent) => {
    e.preventDefault();
    const src = dragSource.current;
    if (!src || src.side === "left") return;

    // Return item from right back to left
    const item = rightItems[src.index];
    const newRight = rightItems.filter((_, i) => i !== src.index);
    setLeftItems((prev) => [...prev, item]);
    setRightItems(newRight);
    submitRight(newRight);

    dragSource.current = null;
    dragOverRight.current = null;
  };

  // ── Touch support ────────────────────────────────────────────────────────
  const touchSrc = useRef<{ side: "left" | "right"; index: number } | null>(null);
  const touchStartY = useRef<number>(0);

  const onTouchStartLeft = (index: number, e: React.TouchEvent) => {
    touchSrc.current = { side: "left", index };
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchStartRight = (index: number, e: React.TouchEvent) => {
    touchSrc.current = { side: "right", index };
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEndRight = (e: React.TouchEvent) => {
    const src = touchSrc.current;
    if (!src) return;
    const steps = Math.round((e.changedTouches[0].clientY - touchStartY.current) / 56);

    if (src.side === "left") {
      // Move from left to right at estimated position
      const item = leftItems[src.index];
      const newLeft = leftItems.filter((_, i) => i !== src.index);
      const insertAt = Math.max(0, Math.min(rightItems.length, rightItems.length + steps));
      const newRight = [...rightItems];
      newRight.splice(insertAt, 0, item);
      setLeftItems(newLeft);
      setRightItems(newRight);
      submitRight(newRight);
    } else {
      // Reorder right
      if (steps === 0) return;
      const to = Math.max(0, Math.min(rightItems.length - 1, src.index + steps));
      if (src.index === to) return;
      const newRight = [...rightItems];
      const [moved] = newRight.splice(src.index, 1);
      newRight.splice(to, 0, moved);
      setRightItems(newRight);
      submitRight(newRight);
    }
    touchSrc.current = null;
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

      <div className="grid grid-cols-2 gap-3">

        {/* LEFT COLUMN — unplaced pool */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropLeft}
          onDragEnter={onDragEnterLeft}
          className="min-h-[120px] space-y-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-2"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Items</p>
          {leftItems.length === 0 && (
            <p className="text-xs text-gray-300 italic text-center pt-4">All items placed</p>
          )}
          {leftItems.map((opt, index) => (
            <div
              key={opt.id}
              draggable
              onDragStart={() => onDragStartLeft(index)}
              onDragOver={(e) => e.preventDefault()}
              onTouchStart={(e) => onTouchStartLeft(index, e)}
              onTouchEnd={onTouchEndRight}
              className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-grab active:cursor-grabbing select-none
                border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition"
            >
              <GripVertical size={14} className="shrink-0 text-gray-400" />
              <span className="flex-1 text-sm text-gray-700">
                {opt.answerContent || opt.option}
                {opt.description && (
                  <span className="ml-1 text-xs text-gray-400"> - - ({opt.description})</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN — ordered drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropRight}
          className="min-h-[120px] space-y-2 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-2"
        >
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">Your Order</p>
          {rightItems.length === 0 && (
            <p className="text-xs text-indigo-300 italic text-center pt-4">Drop items here</p>
          )}
          {rightItems.map((opt, index) => {
            const state = getState(opt, index);
            return (
              <div
                key={opt.id}
                draggable
                onDragStart={() => onDragStartRight(index)}
                onDragEnter={() => onDragEnterRight(index)}
                onDragOver={(e) => e.preventDefault()}
                onTouchStart={(e) => onTouchStartRight(index, e)}
                onTouchEnd={onTouchEndRight}
                className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-grab active:cursor-grabbing select-none transition
                  ${state === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300" : ""}
                  ${state === "wrong" ? "border-red-400 bg-red-50 text-red-700 ring-1 ring-red-300" : ""}
                  ${state === "idle" ? "border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50" : ""}
                `}
              >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center
                  rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {index + 1}
                </span>
                <GripVertical size={14} className="shrink-0 text-gray-400" />
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

      </div>

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};