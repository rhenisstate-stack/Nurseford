'use client';

import { useState, useMemo, useEffect } from "react";
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

export const MatchingQuestion = ({
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

    const allMatchingPairs: StrataSessionQuestionOption[] = useMemo(
        () =>
            (q.questionOptions ?? [])
                .slice()
                .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
        [q.questionOptions]
    );

    const descriptionPool: string[] = useMemo(() => {
        const raw = (q.questionOptions ?? [])
            .map((o) => o.description)
            .filter((d): d is string => Boolean(d));
        const arr = [...raw];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [q.questionOptions]);

    const { getAnswer, submitAnswer } = useLiveExamActionContext();

    const saved = getAnswer(q.id);
    const savedSelections = (
        saved?.answer && typeof saved.answer === "object" && !Array.isArray(saved.answer)
            ? saved.answer
            : {}
    ) as Record<number, string>;


    // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
    const persistedSelections: Record<number, string> = (() => {
        if (!q.savedUserAnswer?.userAnswerData) return {};
        try {
            const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
            if (typeof parsed !== "object" || Array.isArray(parsed)) return {};
            return Object.fromEntries(
                Object.entries(parsed).map(([k, v]) => [
                    Number(k),
                    (v as { selectedMatch?: string })?.selectedMatch ?? "",
                ])
            );
        } catch { return {}; }
    })();

    const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
    const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
    const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
    const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

    const [selections, setSelections] = useState<Record<number, string>>(
        () => shouldClear ? {} : (Object.keys(savedSelections).length > 0 ? savedSelections : persistedSelections)
    );

    useEffect(() => {
        if (saved?.answer && Object.keys(selections).length === 0) {
            setSelections(savedSelections);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saved?.answer]);

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    // NEW ATTEMPT GUARD
    useEffect(() => {
        const onFresh = () => setSelections({});
        const onPrior = () => setSelections(persistedSelections);
        window.addEventListener("exam:attempt:fresh", onFresh);
        window.addEventListener("exam:attempt:prior", onPrior);
        return () => {
            window.removeEventListener("exam:attempt:fresh", onFresh);
            window.removeEventListener("exam:attempt:prior", onPrior);
        };
    }, [persistedSelections]);

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

    const handleSelect = (optId: number, value: string) => {
        const next = { ...selections, [optId]: value };
        setSelections(next);

        // only user-picked data goes to backend — q data is never mutated
        submitAnswer(hideQuestionHeader ? "ActionCaseBasedMatching" : "ActionMatching", {
            questionId: q.id,
            questionGuidId: q.guidId,
            examId,
            examGuidId,
            sectionId,
            sectionGuidId,
            answer: next,
        });
    };

    const getRowState = (opt: StrataSessionQuestionOption): "correct" | "wrong" | "idle" => {
        if (!showFeedback) return "idle";
        const chosen = selections[opt.id];
        if (!chosen) return "idle";
        const correctAnswer = q.questionCorrectAnswers?.find(
            (ca) => ca.questionOptionId === opt.id
        );
        if (!correctAnswer) return "idle";
        let expectedMatch: string | null = null;
        if (correctAnswer.validationRules) {
            try {
                const parsed = JSON.parse(correctAnswer.validationRules);
                expectedMatch = parsed?.match ?? null;
            } catch { /**/ }
        }
        expectedMatch = expectedMatch ?? correctAnswer.openEndedAnswer ?? opt.description ?? null;
        return chosen === expectedMatch ? "correct" : "wrong";
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

            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                <span>Term</span>
                <span />
                <span>Match</span>
            </div>

            <div className="space-y-2">
                {allMatchingPairs.map((opt: StrataSessionQuestionOption) => {
                    const state = getRowState(opt);
                    return (
                        <div
                            key={opt.id}
                            className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg px-2 py-1.5 transition
                                ${state === "correct" ? "bg-emerald-50 ring-1 ring-emerald-300" : ""}
                                ${state === "wrong" ? "bg-red-50 ring-1 ring-red-300" : ""}
                                ${state === "idle" ? "bg-gray-50" : ""}
                            `}
                        >
                            <span className="text-sm font-medium text-gray-800 leading-snug">
                                {opt.answerContent}
                            </span>
                            <span className="text-gray-300 text-base select-none">→</span>
                            <div className="relative">
                                <select
                                    value={selections[opt.id] ?? ""}
                                    onChange={(e) => handleSelect(opt.id, e.target.value)}
                                    className={`w-full border rounded-md px-2 py-1.5 text-sm bg-white appearance-none
                                        focus:outline-none focus:ring-2
                                        ${state === "correct" ? "border-emerald-400 focus:ring-emerald-300 text-emerald-800" : ""}
                                        ${state === "wrong" ? "border-red-400 focus:ring-red-300 text-red-700" : ""}
                                        ${state === "idle" ? "border-gray-300 focus:ring-indigo-300 text-gray-700" : ""}
                                    `}
                                >
                                    <option value=""> Select Match </option>
                                    {descriptionPool.map((d, i) => (
                                        <option key={i} value={d}>{d}</option>
                                    ))}
                                </select>
                                {state !== "idle" && (
                                    <span className={`absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none
                                        ${state === "correct" ? "text-emerald-600" : "text-red-500"}
                                    `}>
                                        {state === "correct" ? "✓" : "✗"}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
        </div>
    );
};