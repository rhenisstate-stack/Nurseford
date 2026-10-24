// src\app\web\(nursing)\atiteas\vista\exam\(layout)\partials\components\QuestionToolbar.tsx
'use client';

import { useState } from "react";
import ImageViewer from "./ImageViewer";
import Image from "next/image";
import type {
    StrataSessionQuestionFull,
    StrataSessionCorrectAnswer,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { Star, Pin, Bookmark, Flag, X, MessageSquare }
    from "lucide-react"; import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";


// Strips HTML tags from rich-text fields (openEndedAnswer, etc.) so raw markup never renders or leaks onto screen — displays plain readable text only.
function stripHtml(html: string): string {
    if (typeof window === "undefined") {
        return html.replace(/<[^>]*>/g, "").trim();
    }
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
}

type CorrectAnswerItem = { answer: string; description?: string };

type MatrixType = NonNullable<StrataSessionQuestionFull["questionMatrices"]>[number];

// Answers are rendered with dangerouslySetInnerHTML, so escape header/cell text.
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function parseHeaders(raw?: string | null): string[] {
    try {
        const parsed = JSON.parse(raw ?? "[]");
        return Array.isArray(parsed) ? parsed.map((h) => String(h ?? "")) : [];
    } catch {
        return [];
    }
}

// One line per row:  Row Header → [ Cell Value ]
// Rows with several correct cells (multiple select) are joined on one line.
function buildMatrixAnswers(matrix?: MatrixType | null): CorrectAnswerItem[] {
    if (!matrix) return [];

    const rowHeaders = parseHeaders(matrix.rowHeaders);
    const columnHeaders = parseHeaders(matrix.columnHeaders);
    const byRow = new Map<number, string[]>();

    const absent = matrix.instructions === "CellDataAbsent";

    (matrix.cells ?? [])
        .filter((c) => c.isCorrect && (absent || (c.cellValue != null && c.cellValue !== "")))
        .forEach((c) => {
            const colLabel = columnHeaders[c.columnIndex] ?? `Col ${c.columnIndex + 1}`;
            const cellValue = absent ? colLabel : String(c.cellValue);

            // Cell value equals the column header in your payload, so show it once.
            const text =
                cellValue === colLabel
                    ? `<strong>[ ${escapeHtml(cellValue)} ]</strong>`
                    : `<em>${escapeHtml(colLabel)}</em> <strong>[ ${escapeHtml(cellValue)} ]</strong>`;

            byRow.set(c.rowIndex, [...(byRow.get(c.rowIndex) ?? []), text]);
        });

    return Array.from(byRow.entries())
        .sort(([a], [b]) => a - b)
        .map(([rowIndex, parts]) => ({
            answer: `<em>${escapeHtml(rowHeaders[rowIndex] ?? `Row ${rowIndex + 1}`)}</em> → ${parts.join(", ")}`,
        }));
}


// Correct cells for the standalone matrix types. In "CellDataAbsent" mode cells have
// no text, so the row and column headers identify the answer.
function buildMatrixCellAnswers(matrix?: MatrixType | null): CorrectAnswerItem[] {
    if (!matrix) return [];

    const absent = matrix.instructions === "CellDataAbsent";
    const rowHeaders = parseHeaders(matrix.rowHeaders);
    const columnHeaders = parseHeaders(matrix.columnHeaders);

    return (matrix.cells ?? [])
        .filter((c) => c.isCorrect && (absent || (c.cellValue != null && c.cellValue !== "")))
        .map((c) => {
            const rowLabel = escapeHtml(rowHeaders[c.rowIndex] ?? `Row ${c.rowIndex + 1}`);
            const colLabel = escapeHtml(columnHeaders[c.columnIndex] ?? `Col ${c.columnIndex + 1}`);
            return {
                answer: absent
                    ? `<em>${rowLabel}</em> → <strong>[ ${colLabel} ]</strong>`
                    : `<em>${rowLabel}</em> → <em>${colLabel}</em> : <strong>[ ${escapeHtml(String(c.cellValue))} ]</strong>`,
                description: c.explanation ?? undefined,
            };
        });
}

interface Props {
    q: StrataSessionQuestionFull;
    mode?: string;  // "practice" | "exam" | "test" | "review" | "tutor"
    examId: number;
    examGuidId: string;
    sectionId: number;
    sectionGuidId: string;
}

function QuestionFeedbackButton({
    q, examId, examGuidId, sectionId, sectionGuidId, submitTool, initialText, initialRating, hasExisting
}: {
    q: StrataSessionQuestionFull;
    examId: number;
    examGuidId: string;
    sectionId: number;
    sectionGuidId: string;
    submitTool: ReturnType<typeof useLiveExamActionContext>["submitTool"];
    initialText?: string;
    initialRating?: number;
    hasExisting?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(initialText ?? "");
    const [rating, setRating] = useState(initialRating ?? 88);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        await submitTool("ActionQuestionFeedback", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: String(rating),
            actionContent: text,
        });
        setSubmitted(true);
        setText("");
        setTimeout(() => { setOpen(false); setSubmitted(false); }, 1200);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Question Feedback"
                className={`p-1.5 rounded-md border transition ${(submitted || hasExisting)
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "border-gray-300 text-gray-400 hover:border-indigo-500 hover:text-indigo-500"
                    }`}
            >
                <MessageSquare size={14} />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 text-sm">Question Feedback</h3>
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>

                        {submitted ? (
                            <div className="text-center py-4 text-emerald-600 font-semibold text-sm">
                                ✓ Feedback Submitted — Thank You!
                            </div>
                        ) : (
                            <>
                                <textarea
                                    rows={3}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Share your feedback about this question..."
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Rate this Question — <span className="text-indigo-600 font-bold">{rating}%</span>
                                    </label>
                                    <input
                                        type="range" min={0} max={100} value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        className="w-full accent-indigo-600"
                                    />
                                </div>
                                <div className="flex justify-between gap-2">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-1.5 text-sm border bg-green-200 border-gray-300 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel &amp; Close
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!text.trim()}
                                        className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}


//  What each mode shows ─
// practice  → all (hint + correct answer + star + pin + bookmark + flag)
// exam      → star + pin + bookmark + flag only
// test      → hint + star + pin + bookmark + flag  (no correct answer)
// review    → correct answer + star + pin + bookmark + flag (no hint)
// tutor     → hint + correct answer + star + pin + bookmark  (no flag)
const broadcastAction = (questionId: number, kind: "star" | "pin" | "bookmark" | "flag", value: boolean) =>
    window.dispatchEvent(new CustomEvent("exam:question:action", { detail: { questionId, kind, value } }));

export function QuestionToolbar({ q, mode, examId, examGuidId, sectionId, sectionGuidId }: Props) {

    const m = (mode ?? "").toLowerCase().trim();
    console.log("🧪 QuestionToolbar mode received:", mode, "→ normalized:", m);

    const canShowHint = m === "practice" || m === "test" || m === "tutor";
    const canShowCorrectAnswer = m === "practice" || m === "review" || m === "tutor";
    const canShowFlag = m !== "tutor";

    const { submitTool } = useLiveExamActionContext();

    //  Accordion state ─
    const [showHint, setShowHint] = useState(false);
    const [showCorrect, setShowCorrect] = useState(m === "review"); // REVIEW mode shows correct answer by default

    //  Icon toggle state — hydrated from backend questionActions ─
    const parsedQuestionActions = (q.questionActions ?? []).map(a => {
        try { return { ...a, _parsed: JSON.parse(a.actionContent ?? "{}") }; }
        catch { return { ...a, _parsed: {} }; }
    });

    const existingStar = parsedQuestionActions.find(a => a._parsed.Star !== undefined);
    const existingPin = parsedQuestionActions.find(a => a._parsed.Pin !== undefined);
    const existingBookmark = parsedQuestionActions.find(a => a._parsed.Bookmark !== undefined);
    const existingFlag = parsedQuestionActions.find(a => a._parsed.Flag !== undefined);
    const existingFeedback = parsedQuestionActions.find(a => a._parsed.Feedback !== undefined);

    const [starred, setStarred] = useState(!!(existingStar?._parsed.Star));
    const [pinned, setPinned] = useState(!!(existingPin?._parsed.Pin));
    const [bookmarked, setBookmarked] = useState(!!(existingBookmark?._parsed.Bookmark));
    const [flagged, setFlagged] = useState(!!(existingFlag?._parsed.Flag));

    //  Flag modal
    const [flagModal, setFlagModal] = useState(false);
    const [flagReason, setFlagReason] = useState<string>(() => {
        const flag = existingFlag?._parsed.Flag;
        if (typeof flag === "object" && flag !== null) {
            return (flag as { ActionContent?: string }).ActionContent ?? "";
        }
        if (typeof existingFlag?._parsed.Reason === "string") return existingFlag._parsed.Reason;
        if (typeof existingFlag?._parsed.Comment === "string") return existingFlag._parsed.Comment;
        return "";
    });


    //  Derive hint ─
    const hint: string | null =
        q.questionCorrectAnswers
            ?.map((ca: StrataSessionCorrectAnswer) => ca.hint)
            .find(Boolean) ?? null;

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    // Derive correct answers ─────────────────────────────────────────────────
    const qType = (q.type ?? "").toLowerCase().trim();

    const correctAnswers: CorrectAnswerItem[] = (() => {
        switch (qType) {

            case "singlechoice": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.answerContent ?? opt?.option ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "truefalse": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.option ?? opt?.answerContent ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "multipleselect": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.answerContent ?? opt?.option ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "text":
            case "": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.description ?? null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "openended": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.openEndedAnswer ? stripHtml(ca.openEndedAnswer) : null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "numericresponse": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.openEndedAnswer ?? null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "matching": {
                return (q.questionOptions ?? [])
                    .map((opt) => {

                        const correctAnswer = q.questionCorrectAnswers?.find((ca) => ca.questionOptionId === opt.id);
                        let correctMatch: string | null = null;
                        if (correctAnswer?.validationRules) {
                            try {
                                const parsed = JSON.parse(correctAnswer.validationRules); correctMatch = parsed?.match ?? null;
                            } catch {
                                // If parsing fails, we can fallback to other fields or just show the option without a match
                            }
                        }

                        correctMatch = correctMatch ?? correctAnswer?.openEndedAnswer ?? null;
                        return {
                            answer: `${opt.answerContent} ➜ ${correctMatch ?? "[ No Matching Pair ]"}`,
                        };
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "orderingnumber": {

                const rawOrder =
                    q.questionCorrectAnswers?.[0]?.correctOrder ?? "";
                const orderedIds = rawOrder.split(",").map(id => Number(id.trim())).filter(id => !isNaN(id));
                return orderedIds
                    .map((id, index) => {
                        const opt = q.questionOptions.find(o => o.id === id);
                        if (!opt) return null;
                        return {
                            answer: `${index + 1}. ${opt.answerContent}`,
                            description: opt.description ?? undefined,
                        };
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "orderingitem": {
                const rawOrder = q.questionCorrectAnswers?.[0]?.correctOrder ?? "";
                const orderedIds = rawOrder.split(",").map(id => Number(id.trim())).filter(id => !isNaN(id));
                return orderedIds
                    .map((id, index) => {
                        const opt = q.questionOptions.find(o => o.id === id);
                        if (!opt) return null;

                        return {
                            answer: `${index + 1}. ${opt.answerContent}`,
                            description: opt.description ?? undefined,
                        };
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "orderingdragdrop": {
                const rawOrder = q.questionCorrectAnswers?.[0]?.correctOrder ?? "";
                const orderedIds = rawOrder.split(",").map(id => Number(id.trim())).filter(id => !isNaN(id));
                return orderedIds
                    .map((id, index) => {
                        const opt = q.questionOptions.find(o => o.id === id);
                        if (!opt) return null;
                        return {
                            answer: `${index + 1}. ${opt.answerContent}`,
                            description: opt.description ?? undefined,
                        };
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "blankselect":
            case "casebasedblankselect": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const r = JSON.parse(ca.validationRules ?? "{}") as {
                            blank_number?: string;
                            blank_index?: number;
                        };
                        const blankNum = r.blank_number ?? String((r.blank_index ?? 0) + 1);
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.answerContent ?? opt?.option ?? ca.description ?? null;
                        return answer
                            ? { answer: `blank ${blankNum}: ${answer}`, description: opt?.description ?? ca.description ?? undefined }
                            : null;
                    })
                    .sort((a, b) => {
                        const numA = parseInt(a?.answer?.match(/\d+/)?.[0] ?? "0");
                        const numB = parseInt(b?.answer?.match(/\d+/)?.[0] ?? "0");
                        return numA - numB;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "blankfill": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const r = JSON.parse(ca.validationRules ?? "{}") as {
                            blank_label?: string;
                            blank_index?: number;
                        };
                        const idx = r.blank_index ?? 0;
                        const label = r.blank_label ?? `blank${idx + 1}`;
                        const answer = ca.openEndedAnswer ?? null;
                        return answer
                            ? { answer: `${label}: ${answer}`, description: ca.description ?? undefined }
                            : null;
                    })
                    .sort((a, b) => {
                        const numA = parseInt(a?.answer?.match(/\d+/)?.[0] ?? "0");
                        const numB = parseInt(b?.answer?.match(/\d+/)?.[0] ?? "0");
                        return numA - numB;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "hotspot": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const label = opt?.answerContent ?? null;
                        const description = ca.description ?? opt?.description ?? null;
                        return label
                            ? { answer: `Marker ${label}`, description: description ?? undefined }
                            : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "dynamicimage": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.answerContent ?? opt?.option ?? ca.description ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "multipleimage": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const media = q.questionMedias?.find(
                            (med) =>
                                med.id === ca.questionMediaId ||
                                (opt?.link && med.mediaPath === opt.link)
                        );

                        const label =
                            opt?.description ??
                            opt?.answerContent ??
                            (media?.mediaPath
                                ? media.mediaPath.split("/").pop()
                                : null) ??
                            ca.description ??
                            null;

                        const imageUrl = media?.mediaPath
                            ? `/api/media/${media.mediaPath}`
                            : null;

                        // Store both imageUrl and caption as JSON so the renderer can use both
                        const description = imageUrl
                            ? JSON.stringify({ imageUrl, caption: opt?.description ?? null })
                            : undefined;

                        return label ? { answer: label, description } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "highlight": {
                const passage = q.questionContents?.[0]?.title ?? "";

                const correctOptionIds = q.questionCorrectAnswers
                    .filter((ca) => ca.isCorrect && ca.questionOptionId != null)
                    .map((ca) => ca.questionOptionId);

                const optionByLabel = new Map<string, typeof q.questionOptions[number]>();
                (q.questionOptions ?? []).forEach((opt) => {
                    if (opt.label != null) optionByLabel.set(String(opt.label), opt);
                });

                const regex = /\[\[\[(\d+)\]([\s\S]*?)\]\]/g;
                const results: CorrectAnswerItem[] = [];
                let match: RegExpExecArray | null;

                while ((match = regex.exec(passage)) !== null) {
                    const label = match[1];
                    const text = match[2].trim();
                    const opt = optionByLabel.get(label);

                    if (opt && correctOptionIds.includes(opt.id) && text) {
                        results.push({ answer: text });
                    }
                }

                return results;
            }

            case "matrixsinglechoice":
            case "matrixmultipleselect": {
                return buildMatrixCellAnswers(q.questionMatrices?.[0]);
            }

            case "casebasedmultipleselect": {
                return q.questionCorrectAnswers
                    .filter((ca) => ca.isCorrect && ca.questionOptionId != null)
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.answerContent ?? opt?.option ?? null;
                        return answer
                            ? {
                                answer,
                                description: opt?.description ?? ca.description ?? undefined,
                            }
                            : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "casebasedmatrixsinglechoice":
            case "casebasedmatrixmultipleselect": {
                return buildMatrixAnswers(q.questionMatrices?.[0]);
            }

            default: {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.openEndedAnswer ?? ca.description ?? null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }
        }
    })();

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

    const handleStar = async () => {
        const next = !starred;
        setStarred(next);
        broadcastAction(q.id, "star", next);
        await submitTool("ActionQuestionStar", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: String(next),
        });
    };

    const handlePin = async () => {
        const next = !pinned;
        setPinned(next);
        broadcastAction(q.id, "pin", next);
        await submitTool("ActionQuestionPin", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: String(next),
        });
    };

    const handleBookmark = async () => {
        const next = !bookmarked;
        setBookmarked(next);
        broadcastAction(q.id, "bookmark", next);
        await submitTool("ActionQuestionBookmark", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: String(next),
        });
    };

    const handleFlagSubmit = async () => {
        if (!flagReason.trim()) return;
        await submitTool("ActionQuestionFlag", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: "true",
            actionContent: flagReason,
        });
        setFlagged(true);
        broadcastAction(q.id, "flag", true);
        setFlagModal(false);
        setFlagReason("");
    };

    return (

        // BORDER LINE
        <div className="mt-4 border-t border-dashed pt-3 space-y-2">

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/*  ROW: action buttons  */}
            <div className="flex items-center justify-end gap-2 flex-wrap">

                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                {/* Show Hint */}
                {canShowHint && hint && (
                    <button
                        onClick={() => { setShowHint((v) => !v); setShowCorrect(false); }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-400 hover:bg-green-500 text-black transition"
                    >
                        <>
                            <span className="hidden sm:inline">
                                {showHint ? "Hide Hint" : "Show Hint"}
                            </span>

                            <span className="sm:hidden">
                                {showHint ? "Hide" : "Hint"}
                            </span>
                        </>
                    </button>
                )}
                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                {/* Show Correct Answer */}
                {canShowCorrectAnswer && correctAnswers.length > 0 && (
                    <button
                        onClick={() => { setShowCorrect((v) => !v); setShowHint(false); }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-purple-700 text-white transition"
                    >
                        <>
                            <span className="hidden sm:inline">
                                {showCorrect ? "Hide Answer" : "Show Correct Answer"}
                            </span>

                            <span className="sm:hidden">
                                {showCorrect ? "Hide" : "Answer"}
                            </span>
                        </>
                    </button>
                )}
                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                {/* Divider */}
                <div className="w-px h-5 bg-red-500 mx-1" />

                {/* Question Feedback */}
                <QuestionFeedbackButton
                    q={q}
                    examId={examId}
                    examGuidId={examGuidId}
                    sectionId={sectionId}
                    sectionGuidId={sectionGuidId}
                    submitTool={submitTool}
                    initialText={
                        typeof existingFeedback?._parsed.Feedback === "string"
                            ? existingFeedback._parsed.Feedback
                            : typeof existingFeedback?._parsed.Feedback === "object" && existingFeedback._parsed.Feedback !== null
                                ? (existingFeedback._parsed.Feedback as { ActionContent?: string }).ActionContent ?? ""
                                : ""
                    }
                    initialRating={
                        typeof existingFeedback?._parsed.Feedback === "object" && existingFeedback._parsed.Feedback !== null
                            ? Number(
                                (existingFeedback._parsed.Feedback as { ActionValue?: string; Value?: string; value?: string }).ActionValue
                                ?? (existingFeedback._parsed.Feedback as { Value?: string }).Value
                                ?? (existingFeedback._parsed.Feedback as { value?: string }).value
                                ?? 88
                            )
                            : existingFeedback?._parsed.Rating ?? existingFeedback?._parsed.rating ?? 88
                    }
                    hasExisting={!!existingFeedback} />

                {/* Star */}
                <button
                    onClick={handleStar}
                    title="Star"
                    className={`p-1.5 rounded-md border transition ${starred
                        ? "bg-yellow-400 border-yellow-400 text-white"
                        : "border-gray-300 text-gray-400 hover:border-yellow-400 hover:text-yellow-400"
                        }`}
                >
                    <Star size={14} />
                </button>
                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                {/* Pin */}
                <button
                    onClick={handlePin}
                    title="Pin"
                    className={`p-1.5 rounded-md border transition ${pinned
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500"
                        }`}
                >
                    <Pin size={14} />
                </button>
                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                {/* Bookmark */}
                <button
                    onClick={handleBookmark}
                    title="Bookmark"
                    className={`p-1.5 rounded-md border transition ${bookmarked
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500"
                        }`}
                >
                    <Bookmark size={14} />
                </button>
                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                {/* Flag */}
                {canShowFlag && (
                    <button
                        onClick={() => setFlagModal(true)}
                        title="Flag"
                        className={`p-1.5 rounded-md border transition ${flagged
                            ? "bg-red-500 border-red-500 text-white"
                            : "border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500"
                            }`}
                    >
                        <Flag size={14} />
                    </button>
                )}

            </div>
            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/*  HINT ACCORDION  */}
            {showHint && hint && (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                    <span className="font-semibold">Clue 🪝:  </span>
                    {hint}
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/*  CORRECT ANSWER ACCORDION  */}
            {showCorrect && correctAnswers.length > 0 && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-900 space-y-3"
                    style={{ fontSize: "var(--exam-content-font-base)" }}>

                    {/* Label */}
                    <div className="font-bold">
                        {qType === "matching" && "Correct Pairs"}
                        {qType === "orderingnumber" && "Correct Order"}
                        {qType === "orderingitem" && "Correct Sequence"}
                        {qType === "orderingdragdrop" && "Correct Order"}
                        {qType === "openended" && "Model/Reference Answer"}
                        {qType === "shortanswer" && "Expected Answer"}
                        {qType === "numericresponse" && "Correct Value"}
                        {qType === "hotspot" && "Correct Region"}
                        {qType === "blankfill" && "Correct Fill"}
                        {(qType === "blankselect" || qType === "casebasedblankselect") && "Correct Selection"}
                        {qType === "highlight" && "Correct Highlight(s)"}
                        {qType === "matrixsinglechoice" && "Correct Cell"}
                        {qType === "matrixmultipleselect" && "Correct Cells"}
                        {qType === "casebasedmatrixsinglechoice" && "Correct Cell"}
                        {qType === "casebasedmatrixmultipleselect" && "Correct Cells"}
                        {!["matching", "orderingnumber", "orderingitem", "orderingdragdrop", "openended",
                            "numericresponse", "hotspot", "blankfill", "blankselect", "casebasedblankselect", "highlight",
                            "matrixsinglechoice", "matrixmultipleselect",
                            "casebasedmatrixsinglechoice", "casebasedmatrixmultipleselect",
                        ].includes(qType) && "Correct Answer"}
                    </div>

                    {/* Correct answer values */}
                    <ul className="list-disc list-inside space-y-1">
                        {correctAnswers.map((item, i) => (
                            <li key={i}>
                                <span dangerouslySetInnerHTML={{ __html: item.answer }} />
                                {item.description && qType !== "multipleimage" && (
                                    <span className="ml-1 text-xs text-emerald-700">
                                        {/* - - ({item.description}) */}
                                    </span>
                                )}
                                {item.description && qType === "multipleimage" && (() => {
                                    const { imageUrl, caption } = JSON.parse(item.description);
                                    return (
                                        <div className="mt-1 space-y-1">
                                            <div className="relative w-40 h-24 rounded border border-emerald-200 overflow-hidden bg-gray-50">
                                                <Image
                                                    src={imageUrl}
                                                    alt={item.answer}
                                                    fill
                                                    sizes="160px"
                                                    className="object-contain"
                                                />
                                            </div>
                                            {caption && (
                                                <span className="text-xs text-emerald-700"> ({caption})</span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </li>
                        ))}
                    </ul>

                    {/* Seperator border line  */}
                    <div className="h-px w-full bg-gradient-to-r from-green-500 via-purple-500 to-green-500 opacity-20" />

                    {/* Description — shown if any correctAnswer has a description (deduplicated rationale text) */}
                    {q.questionCorrectAnswers.some((ca) => ca.description) && (
                        <div className="space-y-1">
                            <div className="font-bold text-emerald-800">Rationale</div>
                            {Array.from(
                                new Map(
                                    q.questionCorrectAnswers
                                        .filter((ca) => ca.description)
                                        .map((ca) => [ca.description, ca])  // key by description text — deduplicates identical entries
                                ).values()
                            ).map((ca, i) => (
                                <div
                                    key={i}
                                    className="text-emerald-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: ca.description! }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Seperator border line  */}
                    <div className="h-px w-full bg-gradient-to-r from-green-500 via-purple-500 to-green-500 opacity-20" />
                    {/* Explanation images — shown if any correctAnswer has an explanationImage */}
                    {q.questionCorrectAnswers.some((ca) => ca.explanationImage && ca.explanationImage !== "NULL") && (
                        <div className="space-y-2">
                            <div className="font-bold text-emerald-800">Depiction</div>
                            <div className="flex flex-wrap gap-2">
                                {q.questionCorrectAnswers
                                    .filter((ca) => ca.explanationImage && ca.explanationImage !== "NULL")
                                    .map((ca, i) => (
                                        <ImageViewer
                                            key={i}
                                            src={`/api/media/${ca.explanationImage?.replace(/^\/+/, "")}`}
                                            alt={`Portrait ${i + 1}`}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/*  FLAG MODAL  */}
            {flagModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-gradient-to-b from-green-100 via-purple-100 to-green-50 rounded-xl shadow-xl w-full max-w-sm mx-4 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Flag This Question</h3>
                            <button
                                onClick={() => setFlagModal(false)}
                                className="text-black hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <textarea
                            rows={3}
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            placeholder="Reason For Flagging . . . 🖋️"
                            className="w-full border-2 border-red-800 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-800"
                        />

                        <div className="flex justify-between gap-2">
                            <button
                                onClick={() => setFlagModal(false)}
                                className="px-4 py-1.5 text-sm border bg-cyan-100 border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel &amp; Close
                            </button>
                            <button
                                onClick={handleFlagSubmit}
                                disabled={!flagReason.trim()}
                                className="px-4 py-1.5 text-sm bg-red-800 text-black rounded-lg hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Submit & Flag
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            <div className="border-b border-dashed " />

        </div>
    );
}


















