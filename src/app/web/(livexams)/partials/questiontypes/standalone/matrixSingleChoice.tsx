'use client';

import { useEffect, useState, useMemo } from "react";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { QuestionToolbar } from "../../components/QuestionToolbar";
import { QuestionPromptHeader } from "@/components/panel/exam/QuestionPromptHeader";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";
import { resolveQuestionMatrix } from "@/lib/utils/exams/matrixResolver";

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

export const MatrixSingleChoiceQuestion = ({
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

  const matrix = useMemo(() => resolveQuestionMatrix(q), [q]);

  const rowHeaders = matrix?.rowHeaders ?? [];
  const columnHeaders = matrix?.columnHeaders ?? [];
  const rowCount = matrix?.rowCount ?? rowHeaders.length;
  const columnCount = matrix?.columnCount ?? columnHeaders.length;
  const cellByPosition = matrix?.cellByPosition ?? new Map();
  const correctCellIds = matrix?.correctCellIds ?? [];

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedCellId = typeof saved?.answer === "number" ? saved.answer : null;

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedCellId = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return null;
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      return typeof parsed?.cellId === "number" ? parsed.cellId : null;
    } catch {
      return null;
    }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [picked, setPicked] = useState<number | null>(
    shouldClear ? null : (savedCellId ?? persistedCellId)
  );

  useEffect(() => {
    if (savedCellId !== null && picked === null) {
      setPicked(savedCellId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCellId]);

  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setPicked(null);
    const onPrior = () => setPicked(persistedCellId);
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
  }, [persistedCellId]);

  const handlePick = (cellId: number) => {
    setPicked(cellId);

    // only user-picked data goes to backend — q data is never mutated
    submitAnswer(hideQuestionHeader ? "ActionCaseBasedMatrixSingleChoice" : "ActionMatrixSingleChoice", {
      questionId: q.id,
      questionGuidId: q.guidId,
      examId,
      examGuidId,
      sectionId,
      sectionGuidId,
      answer: cellId,
    });
  };

  const getState = (cellId: number): "correct" | "wrong" | "selected" | "missed" | "idle" => {
    const isPicked = picked === cellId;
    const isCorrect = correctCellIds.includes(cellId);

    if (!showFeedback) return isPicked ? "selected" : "idle";

    if (isPicked && isCorrect) return "correct";
    if (isPicked && !isCorrect) return "wrong";
    if (!isPicked && isCorrect) return "missed";
    return "idle";
  };

  if (!matrix || rowHeaders.length === 0 || columnHeaders.length === 0) {
    return (
      <div className="pt-1 space-y-2">
        <QuestionPromptHeader
          questionNumber={questionNumber}
          questionText={q.questionText}
          metaQuestionText={q.metaQuestionText}
          hideQuestionHeader={hideQuestionHeader}
        />
        <div className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
          ⚠️ No matrix data available for this question.
        </div>
        <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
      </div>
    );
  }

  return (
    <div className="pt-1 space-y-3">
      <QuestionPromptHeader
        questionNumber={questionNumber}
        questionText={q.questionText}
        metaQuestionText={q.metaQuestionText}
        hideQuestionHeader={hideQuestionHeader}
      />

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

      <div className="w-full max-w-4xl overflow-x-auto border border-gray-200 dark:border-white/10 rounded-xl shadow-xs">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3.5 py-1.5 sm:py-2 text-left text-sm md:text-base font-bold text-slate-900 dark:text-white whitespace-nowrap">
                {matrix.topLeftCell || "Assessment / Findings"}
              </th>
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <th
                  key={colIdx}
                  className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-1.5 sm:py-2 text-center text-sm md:text-base font-bold text-slate-900 dark:text-white whitespace-nowrap"
                >
                  {columnHeaders[colIdx] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {Array.from({ length: rowCount }).map((_, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <th className="border-r border-b border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] px-3.5 py-1 sm:py-1.5 text-left text-[15px] md:text-[17px] font-bold text-slate-900 dark:text-white align-middle leading-tight">
                  {rowHeaders[rowIdx] ?? ""}
                </th>
                {Array.from({ length: columnCount }).map((_, colIdx) => {
                  const cell = cellByPosition.get(`${rowIdx}-${colIdx}`);

                  if (!cell) {
                    return (
                      <td key={colIdx} className="border-b border-gray-100 dark:border-white/5 px-2 py-1 sm:py-1.5 text-center align-middle" />
                    );
                  }

                  const state = getState(cell.id);
                  const isPicked = picked === cell.id;

                  return (
                    <td
                      key={colIdx}
                      onClick={() => handlePick(cell.id)}
                      className="border-b border-gray-100 dark:border-white/5 px-2 py-1 sm:py-1.5 text-center align-middle cursor-pointer hover:bg-teal-50/20 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div
                        role="radio"
                        aria-checked={isPicked}
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePick(cell.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handlePick(cell.id);
                          }
                        }}
                        className={`relative inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border cursor-pointer select-none transition-all mx-auto
                          ${isPicked ? "border-teal-600 bg-white dark:bg-white/10 ring-2 ring-teal-500/20" : "border-slate-400 dark:border-white/40 bg-white dark:bg-white/10 hover:border-teal-600"}
                          ${state === "correct" ? "!border-emerald-600 ring-2 !ring-emerald-500/20" : ""}
                          ${state === "wrong" ? "!border-red-500 ring-2 !ring-red-500/20" : ""}
                        `}
                      >
                        {isPicked && (
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${state === "correct" ? "bg-emerald-600" : state === "wrong" ? "bg-red-500" : "bg-teal-600"}`} />
                        )}
                        {cell.cellValue &&
                        !/^(null|undefined)$/i.test(cell.cellValue.trim()) &&
                        cell.cellValue.trim().toLowerCase() !== (columnHeaders[colIdx] ?? "").trim().toLowerCase() ? (
                          <span className="ml-5 text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {cell.cellValue}
                          </span>
                        ) : null}
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
