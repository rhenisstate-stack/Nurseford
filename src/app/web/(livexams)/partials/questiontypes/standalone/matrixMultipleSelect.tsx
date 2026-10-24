// src\app\web\(livexams)\ati-teas\vista\exam\(layout)\partials\questiontypes\standalone\matrixMultipleSelect.tsx
'use client';

import { useEffect, useState } from "react";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
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

export const MatrixMultipleSelectQuestion = ({
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

  const matrix = q.questionMatrices?.[0] ?? null;

  // "CellDataAbsent" = grid of bare choice controls, headers carry all the meaning.
  // null / "CellDataPresent" / anything else = existing behaviour.
  const cellDataAbsent = matrix?.instructions === "CellDataAbsent";

  // Placeholder text saved when cell data was OFF ("Row n / Column n") counts as no cell data
  const isPlaceholderValue = (v: string | null | undefined, rowIdx: number, colIdx: number) =>
    (v ?? "").trim() === `Row ${rowIdx + 1} / Column ${colIdx + 1}`;

  const rowHeaders: string[] = (() => {
    if (!matrix?.rowHeaders) return [];
    try {
      const parsed = JSON.parse(matrix.rowHeaders);
      return Array.isArray(parsed) ? parsed.map((h) => String(h ?? "")) : [];
    } catch {
      return [];
    }
  })();

  const columnHeaders: string[] = (() => {
    if (!matrix?.columnHeaders) return [];
    try {
      const parsed = JSON.parse(matrix.columnHeaders);
      return Array.isArray(parsed) ? parsed.map((h) => String(h ?? "")) : [];
    } catch {
      return [];
    }
  })();

  const rowCount = matrix?.rowCount ?? rowHeaders.length;
  const columnCount = matrix?.columnCount ?? columnHeaders.length;

  // rowIndex-colIndex -> cell, for quick lookup while rendering the grid
  const cellByPosition = new Map<string, typeof matrix extends null ? never : NonNullable<typeof matrix>["cells"][number]>();
  (matrix?.cells ?? []).forEach((cell) => {
    cellByPosition.set(`${cell.rowIndex}-${cell.columnIndex}`, cell);
  });

  const correctCellIds = (matrix?.cells ?? [])
    .filter((c) => c.isCorrect)
    .map((c) => c.id);

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

  const toggle = (cellId: number) => {
    const next = new Set(picked);
    if (next.has(cellId)) {
      next.delete(cellId);
    } else {
      next.add(cellId);
    }
    setPicked(next);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedMatrixMultipleSelect" : "ActionMatrixMultipleSelect", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: Array.from(next),
    });
  };

  const getState = (cellId: number): "correct" | "wrong" | "selected" | "missed" | "idle" => {
    const isPicked = picked.has(cellId);
    const isCorrect = correctCellIds.includes(cellId);

    if (!showFeedback) return isPicked ? "selected" : "idle";

    if (isPicked && isCorrect) return "correct";
    if (isPicked && !isCorrect) return "wrong";
    if (!isPicked && isCorrect) return "missed";
    return "idle";
  };

  if (!matrix) {
    return (
      <div className="pt-1 space-y-2">

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {!hideQuestionHeader && (
          <div className="flex items-center gap-3">
            <div className="shrink-0 py-1 px-2 rounded
            bg-gradient-to-br from-yellow-800 to-green-600 text-white
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

        {!hideQuestionHeader && q.metaQuestionText && (
          <div
            className="text-sm px-2 text-gray-500 italic"
            dangerouslySetInnerHTML={{ __html: q.metaQuestionText }}
          />
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
          ⚠️ No matrix data available for this question.
        </div>
        <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
      </div>
    );
  }

  return (
    <div className="pt-1 space-y-2">

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {!hideQuestionHeader && (
        <div className="flex items-center gap-3">
          <div className="shrink-0 py-1 px-2 rounded
            bg-gradient-to-br from-yellow-800 to-blue-600 text-white
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

      {(matrix.title || matrix.description) && (
        <div className="space-y-0.5 text-center">
          {matrix.title && (
            <div className="font-semibold text-gray-800 text-sm md:text-base">{matrix.title}</div>
          )}
          {matrix.description && (
            <div className="text-xs md:text-sm text-gray-500">{matrix.description}</div>
          )}
        </div>
      )}

      <div className="overflow-x-auto max-w-5xl overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                {matrix.topLeftCell ?? ""}
              </th>
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <th
                  key={colIdx}
                  className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-600 whitespace-nowrap"
                >
                  {columnHeaders[colIdx] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                <th className="border-r border-b border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap align-top">
                  {rowHeaders[rowIdx] ?? ""}
                </th>
                {Array.from({ length: columnCount }).map((_, colIdx) => {
                  const cell = cellByPosition.get(`${rowIdx}-${colIdx}`);
                  const placeholderOnly = !!cell && isPlaceholderValue(cell.cellValue, rowIdx, colIdx);
                  const showBare = cellDataAbsent || placeholderOnly;
                  const hasContent = !!cell && cell.cellValue != null && cell.cellValue !== "" && !placeholderOnly;

                  if (!cell || (!showBare && !hasContent)) {
                    // Blank cell — nothing to show, nothing to select
                    return (
                      <td key={colIdx} className="border-b border-gray-100 px-3 py-2 align-top" />
                    );
                  }

                  const state = getState(cell.id);
                  const isPicked = picked.has(cell.id);

                  return (
                    <td key={colIdx} className="border-b border-gray-100 px-2 py-2 align-top">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggle(cell.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(cell.id);
                          }
                        }}
                        aria-label={`${rowHeaders[rowIdx] ?? ""} / ${columnHeaders[colIdx] ?? ""}`}
                        className={`relative rounded-md border-2 px-3 py-2 cursor-pointer select-none transition
                          ${showBare ? "flex items-center justify-center min-w-[3rem] min-h-[2.5rem]" : ""}
                          ${state === "idle" ? "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50" : ""}
                          ${state === "selected" ? "border-indigo-400 bg-indigo-50" : ""}
                          ${state === "correct" ? "border-emerald-400 bg-emerald-50" : ""}
                          ${state === "wrong" ? "border-red-400 bg-red-50" : ""}
                          ${state === "missed" ? "border-dashed border-amber-400 bg-amber-50" : ""}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isPicked}
                          onChange={() => toggle(cell.id)}
                          onClick={(e) => e.stopPropagation()}
                          className={showBare
                            ? "w-4 h-4 cursor-pointer"
                            : "absolute top-1 right-1 w-3.5 h-3.5 cursor-pointer"}
                        />
                        {!showBare && (
                          <span className="block pr-4 text-xs md:text-sm text-gray-800">
                            {cell.cellValue}
                          </span>
                        )}

                        {state === "correct" && (
                          <span className="absolute -top-1.5 -left-1.5 text-[10px] font-bold text-emerald-600 bg-white rounded-full">✓</span>
                        )}
                        {state === "wrong" && (
                          <span className="absolute -top-1.5 -left-1.5 text-[10px] font-bold text-red-500 bg-white rounded-full">✗</span>
                        )}
                        {state === "missed" && (
                          <span className="absolute -top-1.5 -left-1.5 text-[10px] font-bold text-amber-600 bg-white rounded-full">•</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};