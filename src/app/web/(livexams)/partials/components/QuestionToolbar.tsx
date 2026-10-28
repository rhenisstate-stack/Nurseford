'use client';
import { cleanOptionText, isValidExamText, cleanExamText } from "@/lib/utils/exams/cleanExamText";
// src\app\web\(nursing)\atiteas\vista\exam\(layout)\partials\components\QuestionToolbar.tsx

import { useState, useEffect, useCallback } from "react";
import type {
    StrataSessionQuestionFull,
    StrataSessionCorrectAnswer,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { Star, Pin, Bookmark, Flag, X, MessageSquare, Lightbulb }
    from "lucide-react";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";
import { ExamCorrectAnswerView } from "./ExamCorrectAnswerView";

interface Props {
    q: StrataSessionQuestionFull;
    mode?: string;  // "practice" | "exam" | "test" | "review" | "tutor"
    examId: number;
    examGuidId: string;
    sectionId: number;
    sectionGuidId: string;
}

export function QuestionFeedbackButton({
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
    const hint: string | null = (() => {
        for (const ca of q.questionCorrectAnswers ?? []) {
            if (ca.hint && isValidExamText(ca.hint) && ca.hint.trim().toLowerCase() !== "null") return ca.hint.trim();
        }
        const rootHint = (q as unknown as { hint?: string }).hint;
        if (rootHint && isValidExamText(rootHint) && rootHint.trim().toLowerCase() !== "null") return rootHint.trim();
        return null;
    })();

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    // Derive correct answers ─────────────────────────────────────────────────
    const qType = (q.type ?? "").toLowerCase().trim();

    type CorrectAnswerItem = { answer: string; description?: string };

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

            case "multipleselect":
            case "checkbox":
            case "checkboxes": {
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
                        const answer = ca.openEndedAnswer ?? null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "shortanswer": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.openEndedAnswer ?? ca.description ?? null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "essay": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.openEndedAnswer ?? null;
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

            case "blankselect": {
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

            case "tabularmatrix": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.description ?? null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "casebased": {
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

            case "casebaseddropdown": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.option ?? opt?.answerContent ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "casebasedhighlight": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const answer = ca.openEndedAnswer ?? ca.description ?? null;
                        return answer ? { answer } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "casebasedcheckbox": {
                return q.questionCorrectAnswers
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt?.answerContent ?? opt?.option ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "casebaseddynamicdraganddrop": {
                return q.questionCorrectAnswers
                    .slice()
                    .sort((a, b) => Number(a.correctOrder ?? 0) - Number(b.correctOrder ?? 0))
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt ? `${opt.option} → ${opt.answerContent}` : ca.description ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "casebaseddistinctdraganddrop": {
                return q.questionCorrectAnswers
                    .slice()
                    .sort((a, b) => Number(a.correctOrder ?? 0) - Number(b.correctOrder ?? 0))
                    .map((ca) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const answer = opt ? `${opt.option} → ${opt.answerContent}` : ca.description ?? null;
                        return answer ? { answer, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
            }

            case "casebasedstratifieddraganddrop": {
                return q.questionCorrectAnswers
                    .slice()
                    .sort((a, b) => Number(a.correctOrder ?? 0) - Number(b.correctOrder ?? 0))
                    .map((ca, i) => {
                        const opt = q.questionOptions.find((o) => o.id === ca.questionOptionId);
                        const label = opt?.option ?? opt?.answerContent ?? ca.description ?? null;
                        return label ? { answer: `${i + 1}. ${label}`, description: opt?.description ?? undefined } : null;
                    })
                    .filter(Boolean) as CorrectAnswerItem[];
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

    const handleStar = useCallback(async () => {
        const next = !starred;
        setStarred(next);
        await submitTool("ActionQuestionStar", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: String(next),
        });
    }, [starred, submitTool, examId, examGuidId, sectionId, sectionGuidId, q.id, q.guidId]);

    const handlePin = useCallback(async () => {
        const next = !pinned;
        setPinned(next);
        await submitTool("ActionQuestionPin", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: String(next),
        });
    }, [pinned, submitTool, examId, examGuidId, sectionId, sectionGuidId, q.id, q.guidId]);

    const handleBookmark = useCallback(async () => {
        const next = !bookmarked;
        setBookmarked(next);
        await submitTool("ActionQuestionBookmark", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: String(next),
        });
    }, [bookmarked, submitTool, examId, examGuidId, sectionId, sectionGuidId, q.id, q.guidId]);

    const handleFlagSubmit = async () => {
        if (!flagReason.trim()) return;
        await submitTool("ActionQuestionFlag", {
            examId, examGuidId, sectionId, sectionGuidId,
            questionId: q.id, questionGuidId: q.guidId,
            actionValue: "true",
            actionContent: flagReason,
        });
        setFlagged(true);
        setFlagModal(false);
        setFlagReason("");
    };

    // Keep action states updated when question changes
    useEffect(() => {
        const actions = (q.questionActions ?? []).map(a => {
            try { return { ...a, _parsed: JSON.parse(a.actionContent ?? "{}") }; }
            catch { return { ...a, _parsed: {} }; }
        });
        const star = actions.find(a => a._parsed.Star !== undefined);
        const pin = actions.find(a => a._parsed.Pin !== undefined);
        const bmark = actions.find(a => a._parsed.Bookmark !== undefined);
        const flag = actions.find(a => a._parsed.Flag !== undefined);

        setStarred(!!star?._parsed.Star);
        setPinned(!!pin?._parsed.Pin);
        setBookmarked(!!bmark?._parsed.Bookmark);
        setFlagged(!!flag?._parsed.Flag);
    }, [q.id, q.questionActions]);

    // Broadcast toolbar state to sticky footer
    useEffect(() => {
        window.dispatchEvent(new CustomEvent("exam:toolbar:state", {
            detail: {
                questionId: q.id,
                starred,
                pinned,
                bookmarked,
                flagged,
                canShowFlag,
            }
        }));
    }, [q.id, starred, pinned, bookmarked, flagged, canShowFlag]);

    // Listen to mobile sticky footer actions
    useEffect(() => {
        const onStar = () => { void handleStar(); };
        const onPin = () => { void handlePin(); };
        const onBookmark = () => { void handleBookmark(); };
        const onFlag = () => { setFlagModal(true); };

        window.addEventListener("exam:star", onStar);
        window.addEventListener("exam:pin", onPin);
        window.addEventListener("exam:bookmark", onBookmark);
        window.addEventListener("exam:flag", onFlag);

        return () => {
            window.removeEventListener("exam:star", onStar);
            window.removeEventListener("exam:pin", onPin);
            window.removeEventListener("exam:bookmark", onBookmark);
            window.removeEventListener("exam:flag", onFlag);
        };
    }, [handleStar, handlePin, handleBookmark]);

    return (

        // BORDER LINE
        <div className="mt-4 border-t border-slate-200 pt-3 space-y-3">

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/* ROW: action buttons */}
            <div data-no-font-scale className="flex items-center justify-between min-h-[38px] gap-1 sm:gap-2 pt-1 w-full flex-nowrap sm:flex-wrap">
                {/* 1. Left: Previous */}
                <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("exam:prev"))}
                    className="order-1 px-2.5 sm:px-4 py-1.5 rounded-md border border-[#800000]/60 dark:border-rose-500/60 text-[#800000] dark:text-rose-300 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/70 dark:hover:bg-rose-900/40 font-semibold text-xs sm:text-sm transition flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 active:scale-[0.98] whitespace-nowrap"
                >
                    ← Previous
                </button>

                {/* 2. Middle: Hint, Show Correct Answer, and (on sm+ only) Star, Pin, Bookmark, Flag */}
                <div className="order-2 flex items-center justify-center gap-1 sm:gap-2 flex-nowrap sm:flex-wrap sm:mx-auto">
                    {/* Show Hint */}
                    {canShowHint && hint && (
                        <button
                            type="button"
                            onClick={() => { setShowHint((v) => !v); setShowCorrect(false); }}
                            className={`px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md border transition shadow-2xs cursor-pointer shrink-0 whitespace-nowrap ${
                                showHint
                                    ? "border-amber-500 text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/50 ring-1 ring-amber-500/40"
                                    : "border-amber-500/80 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-900/40"
                            }`}
                        >
                            <span className="sm:hidden">{showHint ? "Hide Hint" : "Hint"}</span>
                            <span className="hidden sm:inline">{showHint ? "Hide Hint" : "Show Hint"}</span>
                        </button>
                    )}

                    {/* Show Correct Answer */}
                    {canShowCorrectAnswer && (
                        <button
                            type="button"
                            onClick={() => { setShowCorrect((v) => !v); setShowHint(false); }}
                            className={`px-2 sm:px-3.5 py-1.5 text-[11px] sm:text-sm font-semibold rounded-md border transition shadow-2xs cursor-pointer shrink-0 whitespace-nowrap ${
                                showCorrect
                                    ? "border-emerald-500 text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 ring-1 ring-emerald-500/40"
                                    : "border-emerald-500/80 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40"
                            }`}
                        >
                            <span className="sm:hidden">{showCorrect ? "Hide Answer" : "Show Correct Answer"}</span>
                            <span className="hidden sm:inline">{showCorrect ? "Hide Answer" : "Show Correct Answer"}</span>
                        </button>
                    )}

                    {/* Star (Hidden on mobile phones, shown on tablets & computer) */}
                    <button
                        type="button"
                        onClick={handleStar}
                        title="Star"
                        className={`hidden sm:inline-flex p-1.5 rounded-md border transition cursor-pointer shadow-2xs ${starred
                            ? "bg-amber-400 border-amber-400 text-white"
                            : "border-blue-300 dark:border-blue-700/60 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 bg-transparent"
                            }`}
                    >
                        <Star size={14} className={starred ? "fill-current" : ""} />
                    </button>

                    {/* Pin (Hidden on mobile phones, shown on tablets & computer) */}
                    <button
                        type="button"
                        onClick={handlePin}
                        title="Pin"
                        className={`hidden sm:inline-flex p-1.5 rounded-md border transition cursor-pointer shadow-2xs ${pinned
                            ? "bg-green-600 border-green-600 text-white"
                            : "border-blue-300 dark:border-blue-700/60 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 bg-transparent"
                            }`}
                    >
                        <Pin size={14} className={pinned ? "fill-current" : ""} />
                    </button>

                    {/* Bookmark (Hidden on mobile phones, shown on tablets & computer) */}
                    <button
                        type="button"
                        onClick={handleBookmark}
                        title="Bookmark"
                        className={`hidden sm:inline-flex p-1.5 rounded-md border transition cursor-pointer shadow-2xs ${bookmarked
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-blue-300 dark:border-blue-700/60 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 bg-transparent"
                            }`}
                    >
                        <Bookmark size={14} className={bookmarked ? "fill-current" : ""} />
                    </button>

                    {/* Flag (Hidden on mobile phones, shown on tablets & computer) */}
                    {canShowFlag && (
                        <button
                            type="button"
                            onClick={() => setFlagModal(true)}
                            title="Flag"
                            className={`hidden sm:inline-flex p-1.5 rounded-md border transition cursor-pointer shadow-2xs ${flagged
                                ? "bg-red-600 border-red-600 text-white"
                                : "border-red-300 dark:border-red-500/60 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
                                }`}
                        >
                            <Flag size={14} className={flagged ? "fill-current" : ""} />
                        </button>
                    )}
                </div>

                {/* 3. Right: Next */}
                <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("exam:next"))}
                    className="order-3 px-2.5 sm:px-4 py-1.5 rounded-md border border-blue-500/80 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 font-semibold text-xs sm:text-sm transition flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 active:scale-[0.98] whitespace-nowrap"
                >
                    Next →
                </button>
            </div>

            {/* ── HINT BOX (Clue 💡 banner matching reference) ── */}
            {showHint && hint && (
                <div className="w-full rounded-md bg-[#fffbeb] dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-3 sm:p-4 text-xs sm:text-sm text-amber-950 dark:text-amber-100 flex items-start justify-between gap-3 shadow-2xs mt-3 animate-in fade-in duration-200">
                    <div className="leading-relaxed">
                        <span className="font-bold text-amber-800 dark:text-amber-300">Clue 💡 : </span>
                        <span dangerouslySetInnerHTML={{ __html: hint }} />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowHint(false)}
                        className="text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-white shrink-0 p-0.5 rounded cursor-pointer"
                        title="Hide Clue"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* ── CORRECT ANSWER ACCORDION ── */}
            {showCorrect && (
                <div className="w-full pt-1 animate-in fade-in duration-200">
                    <ExamCorrectAnswerView question={q} mode={mode} onClose={() => setShowCorrect(false)} />
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


















