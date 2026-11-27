"use client";
import { cleanOptionText, isValidExamText, cleanExamText, filterExhibitTabs, formatExhibitHtml } from "@/lib/utils/exams/cleanExamText";
import { resolveQuestionMatrix } from "@/lib/utils/exams/matrixResolver";

import { useMemo, useContext } from "react";
import ImageViewer from "./ImageViewer";
import { CheckCircle2, Pin, X, FileText, Lock } from "lucide-react";
import { LiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";
import type {
  StrataSessionQuestionFull,
  StrataSessionQuestionOption,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";

interface ExamCorrectAnswerViewProps {
  question: StrataSessionQuestionFull;
  mode?: string;
  onClose?: () => void;
}

function isValidImagePath(p?: string | null): boolean {
  if (!p || typeof p !== "string") return false;
  const clean = p.trim().toLowerCase();
  if (
    clean === "" ||
    clean === "null" ||
    clean === "none" ||
    clean === "undefined" ||
    clean === "false" ||
    clean === "n/a"
  ) {
    return false;
  }
  return /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(clean);
}

function isCleanValidText(text?: string | null): boolean {
  if (!isValidExamText(text)) return false;
  const clean = (text ?? "").trim().toLowerCase();
  return clean !== "null" && clean !== "none" && clean !== "undefined" && clean !== "n/a";
}

function getOptionText(opt: StrataSessionQuestionOption): string {
  let val = "";
  if (
    opt.option &&
    (/^[A-Z]$/i.test(opt.option.trim()) || /^Option\s+[A-Z]$/i.test(opt.option.trim()))
  ) {
    val = opt.answerContent || opt.description || opt.option || "";
  } else {
    val = opt.answerContent || opt.option || opt.description || "";
  }
  const cleaned = cleanOptionText(val);
  return cleaned.replace(/^[A-Z][\.\)\:\-]\s+/i, "").trim();
}

export function ExamCorrectAnswerView({
  question,
  mode,
  onClose,
}: ExamCorrectAnswerViewProps) {
  const q = question;
  const qType = (q.type ?? "").toLowerCase().trim();

  // 1. Identify correct options
  const correctOptionIds = useMemo(() => {
    const ids = new Set<number>();
    const options = q.questionOptions ?? [];

    (q.questionCorrectAnswers ?? []).forEach((ca) => {
      const isNotFalse =
        ca.isCorrect !== false &&
        (ca.isCorrect as unknown) !== 0 &&
        (ca.isCorrect as unknown) !== "0" &&
        (ca.isCorrect as unknown) !== "false";

      if (isNotFalse && ca.questionOptionId != null) {
        ids.add(ca.questionOptionId);
      }

      // If ca.questionOptionId is missing, check if openEndedAnswer specifies option letter (e.g. "B")
      if (!ca.questionOptionId && ca.openEndedAnswer) {
        const trimmed = ca.openEndedAnswer.trim();
        if (/^[A-Z]$/i.test(trimmed)) {
          const letterIdx = trimmed.toUpperCase().charCodeAt(0) - 65;
          if (options[letterIdx]) {
            ids.add(options[letterIdx].id);
          }
        }
      }
    });

    options.forEach((opt) => {
      const text = `${opt.option ?? ""} ${opt.answerContent ?? ""}`.toLowerCase();
      if (
        (opt as unknown as { isCorrect?: boolean }).isCorrect ||
        text.includes("(correct)") ||
        text.includes("is the correct answer")
      ) {
        ids.add(opt.id);
      }
      // Also check if any correct answer's openEndedAnswer matches option text
      (q.questionCorrectAnswers ?? []).forEach((ca) => {
        if (
          ca.openEndedAnswer &&
          (ca.openEndedAnswer.trim() === opt.answerContent?.trim() ||
            ca.openEndedAnswer.trim() === opt.option?.trim())
        ) {
          ids.add(opt.id);
        }
      });
    });

    return ids;
  }, [q]);

  // 2. Identify formatted correct answer list directly from backend records
  const formattedAnswers = useMemo(() => {
    const items: { label?: string; value: string }[] = [];
    const options = q.questionOptions ?? [];
    const cas = q.questionCorrectAnswers ?? [];

    // Blank Select / Dropdowns
    if (qType.includes("blankselect") || qType.includes("dropdown")) {
      const sortedCas = cas.slice().sort((a, b) => {
        const numA = parseInt(a.validationRules?.match(/\d+/)?.[0] ?? "0", 10);
        const numB = parseInt(b.validationRules?.match(/\d+/)?.[0] ?? "0", 10);
        return numA - numB;
      });

      sortedCas.forEach((ca, idx) => {
        let blankNum = String(idx + 1);
        if (ca.validationRules) {
          try {
            const r = JSON.parse(ca.validationRules);
            if (r.blank_number) blankNum = String(r.blank_number);
            else if (r.blank_index != null) blankNum = String(Number(r.blank_index) + 1);
          } catch {
            // fallback
          }
        }
        const opt = options.find((o) => o.id === ca.questionOptionId);
        const val =
          opt?.answerContent || opt?.option || ca.description || ca.openEndedAnswer || "";
        if (isCleanValidText(val)) {
          items.push({
            label: `Blank ${blankNum}`,
            value: val,
          });
        }
      });
      if (items.length > 0) return items;
    }

    // Blank Fill / Numeric Response / Essay
    if (
      qType.includes("blankfill") ||
      qType === "numericresponse" ||
      qType === "essay" ||
      qType === "openended"
    ) {
      cas.forEach((ca, idx) => {
        let label = `Blank ${idx + 1}`;
        if (ca.validationRules) {
          try {
            const r = JSON.parse(ca.validationRules);
            if (r.blank_label) label = r.blank_label;
            else if (r.blank_index != null) label = `Blank ${Number(r.blank_index) + 1}`;
          } catch {
            // fallback
          }
        }
        const val = ca.openEndedAnswer || ca.description || "";
        if (isCleanValidText(val)) {
          items.push({
            label,
            value: val,
          });
        }
      });
      if (items.length > 0) return items;
    }

    // Matching questions
    if (qType.includes("matching")) {
      options.forEach((opt) => {
        const ca = cas.find((c) => c.questionOptionId === opt.id);
        let correctMatch: string | null = null;
        if (ca?.validationRules) {
          try {
            const parsed = JSON.parse(ca.validationRules);
            correctMatch = parsed?.match ?? null;
          } catch {
            // fallback
          }
        }
        correctMatch = correctMatch ?? ca?.openEndedAnswer ?? ca?.description ?? null;
        if (isCleanValidText(correctMatch)) {
          items.push({
            label: opt.answerContent || opt.option,
            value: correctMatch!,
          });
        }
      });
      if (items.length > 0) return items;
    }

    // Ordering questions
    if (
      qType.includes("ordering") ||
      qType.includes("dragdrop") ||
      qType.includes("draganddrop")
    ) {
      const rawOrder = cas[0]?.correctOrder ?? "";
      const orderedIds = rawOrder
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));

      if (orderedIds.length > 0) {
        orderedIds.forEach((id, index) => {
          const opt = options.find((o) => o.id === id);
          if (opt) {
            items.push({
              label: `Step ${index + 1}`,
              value: opt.answerContent || opt.option || "",
            });
          }
        });
        if (items.length > 0) return items;
      }

      const sortedCas = cas.slice().sort((a, b) => Number(a.correctOrder ?? 0) - Number(b.correctOrder ?? 0));
      sortedCas.forEach((ca, idx) => {
        const opt = options.find((o) => o.id === ca.questionOptionId);
        const val = opt?.answerContent || opt?.option || ca.description || "";
        if (isCleanValidText(val)) {
          items.push({
            label: `Step ${idx + 1}`,
            value: val,
          });
        }
      });
      if (items.length > 0) return items;
    }

    // Tabular Matrix questions
    if (qType.includes("matrix")) {
      const resolvedMatrix = resolveQuestionMatrix(q);
      if (resolvedMatrix && resolvedMatrix.rowHeaders.length > 0) {
        const rows = resolvedMatrix.rowHeaders;
        const cols = resolvedMatrix.columnHeaders;
        rows.forEach((rowName, rIdx) => {
          const correctCells = resolvedMatrix.cells.filter(
            (cell) =>
              cell.rowIndex === rIdx &&
              (cell.isCorrect ||
                resolvedMatrix.correctCellIds.includes(cell.id) ||
                cas.some((c) => c.questionMatrixCellId === cell.id))
          );
          if (correctCells.length > 0) {
            const colNames = correctCells
              .map((c) => cols[c.columnIndex])
              .filter(Boolean)
              .join(", ");
            if (colNames) {
              items.push({
                label: rowName,
                value: colNames,
              });
            }
          }
        });
      }
      if (items.length > 0) return items;
    }

    // Highlight questions
    if (qType.includes("highlight")) {
      cas.forEach((ca, idx) => {
        const val = ca.correctHighlight || ca.openEndedAnswer || ca.description || "";
        if (isCleanValidText(val)) {
          items.push({
            label: `Correct Finding ${idx + 1}`,
            value: val,
          });
        }
      });
      if (items.length > 0) return items;
    }

    // Hotspot questions
    if (qType.includes("hotspot")) {
      cas.forEach((ca, idx) => {
        const opt = options.find((o) => o.id === ca.questionOptionId);
        const val = opt?.answerContent || ca.correctHotspot || ca.description || "Target Marker";
        items.push({
          label: `Location ${idx + 1}`,
          value: val,
        });
      });
      if (items.length > 0) return items;
    }

    // Single choice / Multiple select / True-False / Case-based choices (STANDARD)
    if (options.length > 0 && correctOptionIds.size > 0) {
      options
        .filter((opt) => correctOptionIds.has(opt.id))
        .forEach((opt) => {
          const text = getOptionText(opt);
          if (isCleanValidText(text)) {
            items.push({
              value: text,
            });
          }
        });
      if (items.length > 0) return items;
    }

    // Direct fallback from questionCorrectAnswers without synthesis
    cas.forEach((ca) => {
      const opt = options.find((o) => o.id === ca.questionOptionId);
      const val =
        opt?.answerContent ||
        opt?.option ||
        ca.openEndedAnswer ||
        ca.description ||
        (ca as unknown as { answer?: string }).answer ||
        "";
      const cleanVal = cleanOptionText(val).replace(/^[A-Z][\.\)\:\-]\s+/i, "").trim();
      if (isCleanValidText(cleanVal)) {
        items.push({
          value: cleanVal,
        });
      }
    });

    return items;
  }, [q, qType, correctOptionIds]);

  // ── ANSWER & RATIONALE LOCK / BLUR STATE ────────────────────────────────────
  const liveActionCtx = useContext(LiveExamActionContext);

  const isMatrix = useMemo(() => qType.toLowerCase().includes("matrix"), [qType]);

  // Expected number of answers strictly derived from the question's actual structure
  const expectedCount = useMemo(() => {
    // 1. Matrix Questions: strictly the number of rows in the matrix
    if (isMatrix) {
      const resolvedMatrix = resolveQuestionMatrix(q);
      const rows = resolvedMatrix?.rowHeaders?.length || resolvedMatrix?.rowCount;
      if (rows && rows > 0) return rows;
      if (resolvedMatrix?.correctCellIds?.length) return resolvedMatrix.correctCellIds.length;
    }

    // 2. Explicit question prompt count, e.g. "Select 4 findings" or "Select 3"
    const text = `${q.questionText ?? ""} ${q.metaQuestionText ?? ""}`;
    const match = text.match(/select\s+(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > 0) return n;
    }

    // 3. Genuine backend formatted answers count (SATA, dropdowns, ordering, matching, etc.)
    if (formattedAnswers.length > 0) {
      return formattedAnswers.length;
    }

    // 4. From correctOptionIds
    if (correctOptionIds.size > 0) {
      return correctOptionIds.size;
    }

    return 1;
  }, [q, isMatrix, formattedAnswers.length, correctOptionIds.size]);

  // Current answer state from live action context or persisted answer
  const studentAnswer = useMemo(() => {
    const answers = liveActionCtx?.answers;
    if (answers) {
      if (answers[q.id] && answers[q.id].answer !== undefined) {
        return answers[q.id].answer;
      }
      if (q.guidId) {
        const byGuid = Object.values(answers).find((a) => a.questionGuidId === q.guidId);
        if (byGuid && byGuid.answer !== undefined) {
          return byGuid.answer;
        }
      }
    }

    if (typeof window !== "undefined") {
      const examGuid = (q as any).examGuidId || "";
      const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuid}`) === "fresh";
      if (isFresh) return null;
    }

    if (q.savedUserAnswer?.userAnswerData) {
      try {
        const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
        if (typeof parsed?.optionId === "number") return parsed.optionId;
        if (typeof parsed?.cellId === "number") return parsed.cellId;
        if (Array.isArray(parsed)) return parsed;
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  }, [liveActionCtx?.answers, q]);

  // Count how many valid non-empty options the student has actually chosen
  const chosenCount = useMemo(() => {
    if (Array.isArray(studentAnswer)) {
      return studentAnswer.filter((v) => {
        if (v === null || v === undefined || v === "") return false;
        if (typeof v === "object") {
          if ("optionId" in v) return (v as any).optionId !== null && (v as any).optionId !== undefined && (v as any).optionId !== "";
          if ("cellId" in v) return (v as any).cellId !== null && (v as any).cellId !== undefined && (v as any).cellId !== "";
          if ("mediaId" in v) return (v as any).mediaId !== null && (v as any).mediaId !== undefined && (v as any).mediaId !== "";
          return Object.values(v).some((val) => val !== null && val !== undefined && val !== "");
        }
        return true;
      }).length;
    }
    if (studentAnswer instanceof Set) {
      return studentAnswer.size;
    }
    if (typeof studentAnswer === "object" && studentAnswer !== null) {
      return Object.values(studentAnswer).filter((v) => {
        if (v === null || v === undefined || v === "") return false;
        if (typeof v === "object" && "optionId" in (v as any)) {
          return (v as any).optionId !== null && (v as any).optionId !== undefined && (v as any).optionId !== "";
        }
        return true;
      }).length;
    }
    if (studentAnswer !== null && studentAnswer !== undefined && studentAnswer !== "") {
      return 1;
    }
    return 0;
  }, [studentAnswer]);

  // In preview/review mode blur the answer and rationale until the student answers all required parts
  const isAnswerRevealed = useMemo(() => {
    return chosenCount >= expectedCount;
  }, [chosenCount, expectedCount]);

  // 3. Collect genuine clinical rationales from backend without hardcoded sentences
  const rationales = useMemo(() => {
    const list: string[] = [];

    // From questionCorrectAnswers description
    (q.questionCorrectAnswers ?? []).forEach((ca) => {
      if (isCleanValidText(ca.description)) {
        list.push(ca.description!.trim());
      }
    });

    // From question's main description
    if (isCleanValidText(q.description)) {
      list.push(q.description!.trim());
    }

    // From correct option's explanation
    (q.questionOptions ?? []).forEach((opt) => {
      if (correctOptionIds.has(opt.id) && isCleanValidText(opt.explanation)) {
        list.push(opt.explanation!.trim());
      }
    });

    // Deduplicate identical or near-identical texts
    const unique: string[] = [];
    list.forEach((item) => {
      const clean = item.replace(/\s+/g, " ").trim().toLowerCase();
      if (!unique.some((u) => u.replace(/\s+/g, " ").trim().toLowerCase() === clean)) {
        unique.push(item);
      }
    });

    return unique;
  }, [q, correctOptionIds]);

  // 4. Explanation images (filtered for genuine image files only)
  const explanationImages = useMemo(() => {
    const imgs: { url: string; caption?: string }[] = [];

    (q.questionCorrectAnswers ?? []).forEach((ca) => {
      if (isValidImagePath(ca.explanationImage)) {
        imgs.push({
          url: `/api/media/${ca.explanationImage!.replace(/^\/+/, "")}`,
          caption: "Clinical Reference Diagram",
        });
      }
    });

    (q.questionMedias ?? []).forEach((med) => {
      if (isValidImagePath(med.mediaPath)) {
        imgs.push({
          url: `/api/media/${med.mediaPath.replace(/^\/+/, "")}`,
          caption: isCleanValidText(med.description) ? med.description : "Question Reference Image",
        });
      }
    });

    return imgs;
  }, [q]);

  // 5. Patient Case Study Exhibits - matches commit 8345708
  const exhibits = useMemo(() => {
    const raw = q.questionContents ?? [];
    const caseBased = raw.filter((c) => c.prerequisites === "CaseBasedData");
    const target = caseBased.length > 0 ? caseBased : raw;
    return filterExhibitTabs(target, q.questionText);
  }, [q]);

  const hasAnyData = formattedAnswers.length > 0 || rationales.length > 0 || exhibits.length > 0;

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-[#001326] border border-slate-200 dark:border-slate-800 shadow-sm p-3 sm:p-4 text-slate-800 dark:text-slate-100 my-2.5 transition-all overflow-hidden">
      
      {/* ── 0. BLUR LOCK NOTICE BANNER (Visible until student answers, or reaches expected count) ── */}
      {!isAnswerRevealed && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-medium">
            <Lock className="w-4 h-4 text-teal-600 dark:text-[#2FD9C4] shrink-0" />
            <span>
              {isMatrix ? (
                <>
                  Please complete all <strong className="font-bold text-teal-700 dark:text-[#2FD9C4]">{expectedCount} rows</strong> above to unlock the verified answer and clinical rationale.
                </>
              ) : qType.includes("blank") || qType.includes("dropdown") ? (
                <>
                  Please complete all <strong className="font-bold text-teal-700 dark:text-[#2FD9C4]">{expectedCount} blanks</strong> above to unlock the verified answer and clinical rationale.
                </>
              ) : qType.includes("matching") ? (
                <>
                  Please match all <strong className="font-bold text-teal-700 dark:text-[#2FD9C4]">{expectedCount} items</strong> above to unlock the verified answer and clinical rationale.
                </>
              ) : qType.includes("ordering") || qType.includes("dragdrop") ? (
                <>
                  Please place all <strong className="font-bold text-teal-700 dark:text-[#2FD9C4]">{expectedCount} steps</strong> in order above to unlock the verified answer and clinical rationale.
                </>
              ) : expectedCount > 1 ? (
                <>
                  Please select <strong className="font-bold text-teal-700 dark:text-[#2FD9C4]">{expectedCount} options</strong> above to unlock the answer and clinical rationale.
                </>
              ) : (
                "Please select your answer above to unlock the verified answer and clinical rationale."
              )}
            </span>
          </div>

          {expectedCount > 1 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-300/60 shrink-0">
              <span>{chosenCount} of {expectedCount} answered</span>
              {chosenCount < expectedCount && (
                <span className="opacity-75">({expectedCount - chosenCount} more needed)</span>
              )}
            </span>
          )}
        </div>
      )}

      {/* ── CONTENT CONTAINER ── */}
      <div className="space-y-3">
        {/* ── EMPTY DATA NOTICE (No fake hardcoded fallback) ── */}
        {!hasAnyData && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            No answer key or clinical rationale recorded in the backend database for this question.
          </div>
        )}

        {/* ── 1. VERIFIED CORRECT ANSWER(S) ── */}
        {formattedAnswers.length > 0 && (
          <div className="space-y-1.5">
            <div className="exam-title-heading text-base sm:text-lg font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase flex items-center justify-between gap-1.5">
              <span>VERIFIED CORRECT ANSWER(S)</span>
              {!isAnswerRevealed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 normal-case">
                  <Lock className="w-3 h-3" /> (blurred until answered)
                </span>
              )}
            </div>

            <div
              className={`space-y-1.5 transition-all duration-300 ${
                !isAnswerRevealed ? "filter blur-md select-none pointer-events-none opacity-30" : ""
              }`}
            >
              {formattedAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className="correct-answer-item rounded-lg border border-emerald-300/80 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 px-3 py-1 sm:px-3.5 sm:py-1.5 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.label ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 font-bold shrink-0 border border-emerald-300 dark:border-emerald-500/30">
                        {item.label}
                      </span>
                    ) : null}
                    <span className="font-bold text-slate-900 dark:text-white truncate sm:whitespace-normal">
                      {item.value}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-600 text-white shrink-0 shadow-2xs">
                    ✓ Correct
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. CLINICAL RATIONALE & ANALYSIS (Strictly backend descriptions, zero fake sentences) ── */}
        {rationales.length > 0 && (
          <div className="space-y-1.5">
            <div className="exam-title-heading text-base sm:text-lg font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase flex items-center justify-between gap-1.5">
              <span>📖 CLINICAL RATIONALE &amp; ANALYSIS</span>
              {!isAnswerRevealed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 normal-case">
                  <Lock className="w-3 h-3" /> (blurred until answered)
                </span>
              )}
            </div>

            <div
              className={`clinical-rationale-body exhibit-content-body rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3.5 text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5 transition-all duration-300 ${
                !isAnswerRevealed ? "filter blur-md select-none pointer-events-none opacity-30" : ""
              }`}
            >
              {rationales.map((rationale, idx) => (
                <div
                  key={idx}
                  className="space-y-1.5 leading-relaxed [&_p]:my-1.5 [&_p]:leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: formatExhibitHtml(rationale) }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 3. Visual Reference / Diagram (only rendered if valid diagrams exist) ── */}
        {explanationImages.length > 0 && (
          <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Reference Diagrams
            </div>
            <div
              className={`flex flex-wrap gap-4 transition-all duration-300 ${
                !isAnswerRevealed ? "filter blur-md select-none pointer-events-none opacity-30" : ""
              }`}
            >
              {explanationImages.map((img, i) => (
                <div key={i} className="space-y-1">
                  <ImageViewer src={img.url} alt={img.caption || `Diagram ${i + 1}`} />
                  {img.caption && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-xs">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
