"use client";
import { cleanOptionText, isValidExamText, cleanExamText, filterExhibitTabs } from "@/lib/utils/exams/cleanExamText";
import { resolveQuestionMatrix } from "@/lib/utils/exams/matrixResolver";

import { useMemo } from "react";
import ImageViewer from "./ImageViewer";
import { CheckCircle2, Pin, X, FileText } from "lucide-react";
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
    if (qType === "blankselect" || qType === "casebaseddropdown") {
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
      qType === "blankfill" ||
      qType === "casebasedblankfill" ||
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
    if (qType === "matching" || qType === "casebasedmatching") {
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
      qType === "orderingnumber" ||
      qType === "orderingitem" ||
      qType === "orderingdragdrop" ||
      qType === "casebaseddynamicdraganddrop" ||
      qType === "casebaseddistinctdraganddrop" ||
      qType === "casebasedstratifieddraganddrop" ||
      qType === "casebasedorderingnumber" ||
      qType === "casebasedorderingitem" ||
      qType === "casebasedorderingdragdrop"
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
    if (qType === "casebasedhighlight" || qType === "highlight") {
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
    if (qType === "hotspot" || qType === "casebasedhotspot") {
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
    <div className="w-full rounded-2xl bg-white dark:bg-[#001326] border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 sm:p-5 text-slate-800 dark:text-slate-100 space-y-3.5 my-3 transition-all">
      {/* ── EMPTY DATA NOTICE (No fake hardcoded fallback) ── */}
      {!hasAnyData && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          No answer key or clinical rationale recorded in the backend database for this question.
        </div>
      )}

      {/* ── 1. VERIFIED CORRECT ANSWER(S) ── */}
      {formattedAnswers.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
            VERIFIED CORRECT ANSWER(S)
          </div>

          <div className="space-y-1.5">
            {formattedAnswers.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-emerald-300/80 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.label ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 font-bold text-xs sm:text-sm shrink-0 border border-emerald-300 dark:border-emerald-500/30">
                      {item.label}
                    </span>
                  ) : null}
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate sm:whitespace-normal">
                    {item.value}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-600 text-white shrink-0 shadow-2xs">
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
          <div className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
            📖 CLINICAL RATIONALE &amp; ANALYSIS
          </div>

          <div className="exhibit-content-body rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
            {rationales.map((rationale, idx) => (
              <div
                key={idx}
                className="space-y-1.5 whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{ __html: rationale }}
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
          <div className="flex flex-wrap gap-4">
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
  );
}
