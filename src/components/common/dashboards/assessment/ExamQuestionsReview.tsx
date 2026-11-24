"use client";

import React, { useState, useEffect, useMemo } from "react";
import parse from "html-react-parser";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  X,
  Lightbulb,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import type {
  StrataExamSessionResponse,
  StrataSessionQuestionFull,
  StrataSessionQuestionOption,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import type {
  StrataResultAnswer,
  StrataResultWrongQuestion,
} from "@/lib/hooks/nexus/strata/assessment/results/distinct/useDistinctStrataAssessmentResults";

// ─────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface ExamQuestionsReviewProps {
  examGuidId: string;
  answers?: StrataResultAnswer[];
  wrongQuestionRefs?: StrataResultWrongQuestion[];
  totalQuestions?: number;
  totalCorrect?: number;
  totalWrong?: number;
}

// Extended question type with section name attached
type QuestionWithSection = StrataSessionQuestionFull & {
  _sectionName?: string;
  _questionIndex?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: PARSE USER ANSWER DATA TO IDENTIFIERS
// ─────────────────────────────────────────────────────────────────────────────

function parseUserPicks(userAnswerData?: string | null): (number | string)[] {
  if (!userAnswerData) return [];
  const rawStr = String(userAnswerData).trim().toLowerCase();
  if (
    rawStr === "" ||
    rawStr === "null" ||
    rawStr === "undefined" ||
    rawStr === "void" ||
    rawStr === "{}" ||
    rawStr === "[]"
  ) {
    return [];
  }

  try {
    const parsed =
      typeof userAnswerData === "string"
        ? JSON.parse(userAnswerData)
        : userAnswerData;

    if (parsed === null || parsed === undefined) return [];

    if (typeof parsed === "number") return [parsed];
    if (typeof parsed === "string") {
      const lower = parsed.trim().toLowerCase();
      if (lower === "null" || lower === "undefined" || lower === "") return [];
      const num = Number(parsed);
      return isNaN(num) ? [parsed] : [num];
    }
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) =>
          typeof item === "object" && item
            ? item.optionId ?? item.id ?? item.value ?? item
            : item
        )
        .filter((v) => v !== null && v !== undefined && String(v).toLowerCase() !== "null");
    }
    if (typeof parsed === "object" && parsed !== null) {
      if (parsed.answer !== undefined && parsed.answer !== null) {
        if (Array.isArray(parsed.answer)) {
          return parsed.answer.filter((v: any) => v !== null && v !== undefined && String(v).toLowerCase() !== "null");
        }
        if (String(parsed.answer).toLowerCase() !== "null") return [parsed.answer];
      }
      if (parsed.optionId !== undefined && parsed.optionId !== null) return [parsed.optionId];
      if (parsed.id !== undefined && parsed.id !== null) return [parsed.id];
      if (parsed.value !== undefined && parsed.value !== null && String(parsed.value).toLowerCase() !== "null") return [parsed.value];
      if (parsed.answerContent !== undefined && parsed.answerContent !== null && String(parsed.answerContent).toLowerCase() !== "null") return [parsed.answerContent];
      if (parsed.optionText !== undefined && parsed.optionText !== null && String(parsed.optionText).toLowerCase() !== "null") return [parsed.optionText];
    }
  } catch {
    const trimmed = String(userAnswerData).trim();
    if (trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") return [];
    const num = Number(trimmed);
    if (!isNaN(num)) return [num];
    return [trimmed];
  }
  return [];
}

// Helper to filter out null/empty text
function isCleanText(val?: string | null): boolean {
  if (!val) return false;
  const stripped = String(val).replace(/<[^>]*>/g, "").trim().toLowerCase();
  return (
    stripped !== "" &&
    stripped !== "null" &&
    stripped !== "undefined" &&
    stripped !== "void" &&
    stripped !== "none"
  );
}

// Helper to filter out null/empty options
function isValidOption(opt: StrataSessionQuestionOption): boolean {
  return isCleanText(opt.answerContent) || isCleanText(opt.option);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ExamQuestionsReview({
  examGuidId,
  answers = [],
  wrongQuestionRefs = [],
  totalQuestions: initialTotalQuestions,
  totalCorrect: initialTotalCorrect,
  totalWrong: initialTotalWrong,
}: ExamQuestionsReviewProps) {
  const [questions, setQuestions] = useState<QuestionWithSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Display Preferences
  // 1. By default, DO NOT show rationale (per user request: "filter to not show rationale")
  const [showRationale, setShowRationale] = useState(false);

  // 2. By default, HIDE null / unanswered answers (per user request: "filter to not show null answers")
  const [hideNullAnswers, setHideNullAnswers] = useState(true);

  // Filter tabs: "all" | "correct" | "incorrect" | "unanswered"
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unanswered">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAll, setExpandedAll] = useState(true);
  const [collapsedIds, setCollapsedIds] = useState<Set<number | string>>(new Set());

  // ───────────────────────────────────────────────────────────────────────────
  // FETCH ALL QUESTIONS FOR THIS EXAM
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!examGuidId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchAllQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await strataService<StrataExamSessionResponse>(
          "Exam",
          "LiveFetch",
          {
            identifier: examGuidId,
            dynamicExamMode: "Review",
            dynamicPage: 1,
            dynamicPerPage: 500,
          }
        );

        const session = res?.data?.exam
          ? res.data
          : (res as unknown as StrataExamSessionResponse)?.exam
          ? (res as unknown as StrataExamSessionResponse)
          : null;

        if (!isMounted) return;

        if (session?.sections && session.sections.length > 0) {
          let globalIndex = 0;
          const allQuestions: QuestionWithSection[] = [];

          session.sections.forEach((sec) => {
            (sec.questions ?? []).forEach((q) => {
              globalIndex++;
              allQuestions.push({
                ...q,
                _sectionName: sec.name || `Section ${sec.id}`,
                _questionIndex: globalIndex,
              });
            });
          });

          setQuestions(allQuestions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("[ExamQuestionsReview] Error fetching questions:", err);
        setError("Unable to load full question review from server.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllQuestions();

    return () => {
      isMounted = false;
    };
  }, [examGuidId]);

  // ───────────────────────────────────────────────────────────────────────────
  // MAP OF USER ANSWERS
  // ───────────────────────────────────────────────────────────────────────────

  const answersByQuestionId = useMemo(() => {
    const map = new Map<number | string, StrataResultAnswer>();
    (answers ?? []).forEach((a) => {
      if (a.questionId !== undefined && a.questionId !== null) {
        map.set(a.questionId, a);
        map.set(String(a.questionId), a);
      }
    });
    return map;
  }, [answers]);

  const wrongQuestionRefsMap = useMemo(() => {
    const map = new Map<string, StrataResultWrongQuestion>();
    (wrongQuestionRefs ?? []).forEach((wq) => {
      if (wq.questionGuidId) map.set(wq.questionGuidId, wq);
      if (wq.questionId !== undefined) map.set(String(wq.questionId), wq);
    });
    return map;
  }, [wrongQuestionRefs]);

  // ───────────────────────────────────────────────────────────────────────────
  // QUESTION CLASSIFICATION & EVALUATION
  // ───────────────────────────────────────────────────────────────────────────

  const evaluatedQuestions = useMemo(() => {
    return questions.map((q) => {
      const answer =
        answersByQuestionId.get(q.id) || answersByQuestionId.get(q.guidId);
      const wrongRef =
        wrongQuestionRefsMap.get(q.guidId) || wrongQuestionRefsMap.get(String(q.id));

      const rawVal = answer?.userAnswerData ?? wrongRef?.userAnswerData ?? null;
      const isNullString = rawVal !== null && String(rawVal).trim().toLowerCase() === "null";
      const userRawAnswer = isNullString ? null : rawVal;

      const userPicks = parseUserPicks(userRawAnswer);
      const userPicksSet = new Set(userPicks);

      // Determine correct option IDs
      const correctOptionIds = new Set<number>(
        (q.questionCorrectAnswers ?? [])
          .filter((ca) => ca.isCorrect !== false && ca.questionOptionId)
          .map((ca) => ca.questionOptionId as number)
      );

      // Filter options so null/empty answer options are never included
      const cleanOptions = (q.questionOptions ?? []).filter(isValidOption);

      // Status calculation
      let status: "correct" | "incorrect" | "unanswered" = "unanswered";

      if (answer?.isCorrect === true) {
        status = "correct";
      } else if (answer?.isCorrect === false || wrongRef) {
        status = "incorrect";
      } else if (userPicks.length > 0) {
        // Evaluate from picks
        if (correctOptionIds.size > 0) {
          const pickedCorrectly =
            Array.from(userPicksSet).every((p) =>
              typeof p === "number" ? correctOptionIds.has(p) : false
            ) &&
            Array.from(correctOptionIds).every((cid) => userPicksSet.has(cid));
          status = pickedCorrectly ? "correct" : "incorrect";
        } else {
          status = "unanswered";
        }
      } else {
        status = "unanswered";
      }

      // Has user submitted a valid non-null answer
      const hasValidAnswer = status !== "unanswered" && (userPicks.length > 0 || answer?.isCorrect !== undefined);

      // Clinical rationale / explanation
      const explanation =
        q.questionCorrectAnswers?.find((ca) => ca.description)?.description ||
        q.questionCorrectAnswers?.[0]?.description ||
        q.description ||
        q.instructions ||
        q.questionOptions?.find((o) => o.explanation)?.explanation ||
        null;

      return {
        ...q,
        questionOptions: cleanOptions,
        userRawAnswer,
        userPicks,
        userPicksSet,
        correctOptionIds,
        status,
        hasValidAnswer,
        explanation,
      };
    });
  }, [questions, answersByQuestionId, wrongQuestionRefsMap]);

  // ───────────────────────────────────────────────────────────────────────────
  // METRICS
  // ───────────────────────────────────────────────────────────────────────────

  const totalCount = evaluatedQuestions.length || initialTotalQuestions || 0;
  const correctCount =
    evaluatedQuestions.filter((q) => q.status === "correct").length ||
    initialTotalCorrect ||
    0;
  const incorrectCount =
    evaluatedQuestions.filter((q) => q.status === "incorrect").length ||
    initialTotalWrong ||
    (wrongQuestionRefs?.length ?? 0);
  const unansweredCount =
    evaluatedQuestions.filter((q) => q.status === "unanswered").length;
  const answeredCount = evaluatedQuestions.filter((q) => q.hasValidAnswer).length;

  // ───────────────────────────────────────────────────────────────────────────
  // FILTERED QUESTIONS
  // ───────────────────────────────────────────────────────────────────────────

  const filteredQuestions = useMemo(() => {
    return evaluatedQuestions.filter((q) => {
      // 1. Null answers filter: if hideNullAnswers is true, exclude unanswered / null questions
      if (hideNullAnswers && !q.hasValidAnswer) {
        return false;
      }

      // 2. Filter tab selection
      if (filter === "correct" && q.status !== "correct") return false;
      if (filter === "incorrect" && q.status !== "incorrect") return false;
      if (filter === "unanswered" && q.status !== "unanswered") return false;

      // 3. Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const textMatch = (q.questionText || "").toLowerCase().includes(term);
        const sectionMatch = (q._sectionName || "").toLowerCase().includes(term);
        const optionsMatch = (q.questionOptions || []).some((o) =>
          (o.answerContent || o.option || "").toLowerCase().includes(term)
        );
        return textMatch || sectionMatch || optionsMatch;
      }

      return true;
    });
  }, [evaluatedQuestions, hideNullAnswers, filter, searchTerm]);

  const toggleCollapse = (id: number | string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (expandedAll) {
      setCollapsedIds(new Set(evaluatedQuestions.map((q) => q.id || q.guidId)));
      setExpandedAll(false);
    } else {
      setCollapsedIds(new Set());
      setExpandedAll(true);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              <FileQuestion size={18} />
            </div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Exam Questions Review
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your answered questions with green for correct picks and red for incorrect picks.
          </p>
        </div>

        {/* CONTROLS (FILTERS, TOGGLES & SEARCH) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search question, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 w-44 sm:w-56"
            />
          </div>

          {/* TOGGLE HIDE NULL ANSWERS */}
          <button
            type="button"
            onClick={() => setHideNullAnswers((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              hideNullAnswers
                ? "bg-[#0A2540] border-[#0A2540] text-white shadow-xs"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}
            title={hideNullAnswers ? "Currently filtering out questions with null / unanswered answers" : "Showing all questions including null answers"}
          >
            <Filter size={12} />
            {hideNullAnswers ? "Null Answers Filtered" : "Show Null Answers"}
          </button>

          {/* TOGGLE RATIONALE (OFF BY DEFAULT) */}
          <button
            type="button"
            onClick={() => setShowRationale((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              showRationale
                ? "bg-teal-600 border-teal-600 text-white shadow-xs"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}
            title={showRationale ? "Clinical rationale is visible" : "Clinical rationale is hidden"}
          >
            {showRationale ? <EyeOff size={13} /> : <Eye size={13} />}
            {showRationale ? "Hide Rationale" : "Show Rationale"}
          </button>

          {/* EXPAND / COLLAPSE ALL */}
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
          >
            {expandedAll ? (
              <>
                <ChevronUp size={13} /> Collapse All
              </>
            ) : (
              <>
                <ChevronDown size={13} /> Expand All
              </>
            )}
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
            filter === "all"
              ? "bg-[#0A2540] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Filter size={12} />
          {hideNullAnswers ? `Answered (${answeredCount})` : `All (${totalCount})`}
        </button>

        <button
          type="button"
          onClick={() => setFilter("correct")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
            filter === "correct"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/40"
          }`}
        >
          <CheckCircle2 size={13} />
          Correct ({correctCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("incorrect")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
            filter === "incorrect"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40"
          }`}
        >
          <XCircle size={13} />
          Incorrect ({incorrectCount})
        </button>

        {!hideNullAnswers && unansweredCount > 0 && (
          <button
            type="button"
            onClick={() => setFilter("unanswered")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
              filter === "unanswered"
                ? "bg-slate-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <HelpCircle size={13} />
            Unanswered ({unansweredCount})
          </button>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Fetching complete question set and correct answers...
          </p>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && questions.length === 0 && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs">
          <p className="font-bold">{error}</p>
          <p className="mt-1">
            Displaying available questions from exam submission records below:
          </p>
        </div>
      )}

      {/* FALLBACK IF API RETURNED EMPTY QUESTIONS LIST BUT WRONG QUESTIONS EXIST */}
      {!loading && questions.length === 0 && wrongQuestionRefs.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Reviewing {wrongQuestionRefs.length} Incorrect Questions
          </div>
          {wrongQuestionRefs.map((wq, idx) => {
            let parsedAnswerText: string | null = null;
            if (wq.userAnswerData) {
              try {
                const parsed = JSON.parse(wq.userAnswerData);
                const val = parsed.answerContent || parsed.optionText || parsed.value;
                if (val && String(val).toLowerCase() !== "null") parsedAnswerText = String(val);
              } catch {
                if (wq.userAnswerData && wq.userAnswerData.toLowerCase() !== "null") {
                  parsedAnswerText = wq.userAnswerData;
                }
              }
            }

            return (
              <div
                key={wq.questionGuidId || idx}
                className="border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 uppercase">
                    {wq.sectionName || `Question ${idx + 1}`}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                    <XCircle size={12} /> Incorrect
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {wq.questionText ? parse(wq.questionText) : "Question prompt unavailable"}
                </div>
                {parsedAnswerText && (
                  <div className="p-2.5 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-semibold">
                    ✗ Your Answer: {parsedAnswerText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QUESTIONS LIST */}
      {!loading && filteredQuestions.length > 0 && (
        <div className="space-y-5">
          {filteredQuestions.map((q) => {
            const isCollapsed = collapsedIds.has(q.id || q.guidId);
            const isCorrect = q.status === "correct";

            return (
              <div
                key={q.id || q.guidId}
                data-question-type="true"
                style={{ fontFamily: "'Calibre', 'Calibri', Candara, 'Segoe UI', Arial, sans-serif" }}
                className={`question-type-root border rounded-xl transition-all duration-200 overflow-hidden ${
                  isCorrect
                    ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/15 dark:bg-emerald-950/10"
                    : q.status === "incorrect"
                    ? "border-red-300 dark:border-red-800/60 bg-red-50/15 dark:bg-red-950/10"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40"
                }`}
              >
                {/* QUESTION ACCORDION / HEADER */}
                <div
                  onClick={() => toggleCollapse(q.id || q.guidId)}
                  className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0A2540] text-white">
                        Question {q._questionIndex ?? q.id}
                      </span>

                      {isCleanText(q._sectionName) && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Layers size={11} />
                          {q._sectionName}
                        </span>
                      )}

                      {/* STATUS BADGE */}
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 size={13} className="text-emerald-700 dark:text-emerald-400" />
                          Correct
                        </span>
                      )}

                      {q.status === "incorrect" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                          <XCircle size={13} className="text-red-600 dark:text-red-400" />
                          Incorrect
                        </span>
                      )}

                      {q.status === "unanswered" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                          <HelpCircle size={13} className="text-slate-400" />
                          Unanswered
                        </span>
                      )}
                    </div>

                    {/* QUESTION PROMPT SNIPPET IN HEADER */}
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 pt-0.5">
                      {q.questionText ? parse(q.questionText) : "Question Text"}
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-1 shrink-0">
                    {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </div>
                </div>

                {/* QUESTION BODY (COLLAPSIBLE) */}
                {!isCollapsed && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                    {/* META / STEM EXTRA INFO */}
                    {isCleanText(q.metaQuestionText) && (
                      <div className="text-xs text-slate-500 italic border-l-2 border-teal-500 pl-2.5 py-0.5">
                        {parse(q.metaQuestionText!)}
                      </div>
                    )}

                    {/* OPTIONS REVIEW */}
                    {q.questionOptions && q.questionOptions.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Options & Answer Key:
                        </div>
                        {q.questionOptions.map((opt: StrataSessionQuestionOption, optIdx: number) => {
                          const optionLetter = String.fromCharCode(65 + optIdx);
                          const isOptionCorrect = q.correctOptionIds.has(opt.id);
                          const isUserPick =
                            q.userPicksSet.has(opt.id) ||
                            q.userPicksSet.has(String(opt.id)) ||
                            (opt.option && q.userPicksSet.has(opt.option)) ||
                            (opt.answerContent && q.userPicksSet.has(opt.answerContent));

                          // Formatting classes
                          let rowClasses =
                            "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300";
                          let letterClasses =
                            "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
                          let fontClass = "text-slate-700 dark:text-slate-300";

                          if (isOptionCorrect && isUserPick) {
                            // User selected this and it's correct (Emerald Accent)
                            rowClasses =
                              "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500 shadow-2xs";
                            letterClasses =
                              "border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold";
                            fontClass = "font-semibold text-slate-900 dark:text-white";
                          } else if (isOptionCorrect && !isUserPick) {
                            // Correct answer key, but user did not select it (Teal Accent)
                            rowClasses =
                              "border-teal-200 dark:border-teal-900/60 bg-teal-50/20 dark:bg-teal-950/20 border-l-4 border-l-teal-500 shadow-2xs";
                            letterClasses =
                              "border-teal-300 dark:border-teal-700 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold";
                            fontClass = "font-semibold text-slate-900 dark:text-white";
                          } else if (isUserPick && !isOptionCorrect) {
                            // User selected this and it's incorrect (Rose Accent)
                            rowClasses =
                              "border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 border-l-4 border-l-rose-500 shadow-2xs";
                            letterClasses =
                              "border-rose-300 dark:border-rose-700 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold";
                            fontClass = "font-medium text-slate-900 dark:text-white";
                          }

                          const contentToRender = opt.answerContent || opt.option || "";

                          return (
                            <div
                              key={opt.id}
                              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition ${rowClasses}`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <span className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 border transition-colors ${letterClasses}`}>
                                  {optionLetter}
                                </span>
                                <div className={`text-sm ${fontClass} pt-0.5 leading-snug`}>
                                  {parse(contentToRender)}
                                  {showRationale && isCleanText(opt.explanation) && (
                                    <div className="text-xs opacity-80 mt-1.5 font-normal text-slate-600 dark:text-slate-400">
                                      {opt.explanation}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                {/* USER CORRECT PICK */}
                                {isOptionCorrect && isUserPick && (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                                    <Check size={13} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                                    Your Correct Answer
                                  </span>
                                )}

                                {/* CORRECT ANSWER KEY (NOT SELECTED BY USER) */}
                                {isOptionCorrect && !isUserPick && (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-700 shadow-2xs">
                                    <Check size={13} className="text-teal-600 dark:text-teal-400 stroke-[3]" />
                                    Correct Answer
                                  </span>
                                )}

                                {/* USER WRONG PICK */}
                                {isUserPick && !isOptionCorrect && (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700 shadow-2xs">
                                    <X size={13} className="text-rose-600 dark:text-rose-400 stroke-[3]" />
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // NON-MULTIPLE-CHOICE FALLBACK (Open ended, numeric, fill-in-the-blank, etc.)
                      <div className="space-y-2.5 mt-2">
                        {/* USER'S SUBMITTED ANSWER */}
                        {q.userRawAnswer && (
                          <div className={`flex items-center justify-between p-3.5 rounded-xl border transition shadow-2xs ${
                            isCorrect
                              ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500"
                              : "border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 border-l-4 border-l-rose-500"
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${
                                isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"
                              }`}>
                                {isCorrect ? "✓ Your Answer (Correct):" : "✕ Your Answer (Incorrect):"}
                              </span>
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {(() => {
                                  try {
                                    const parsed = JSON.parse(q.userRawAnswer);
                                    const val = parsed.answerContent || parsed.value || parsed.optionText;
                                    if (val && String(val).toLowerCase() !== "null") return String(val);
                                  } catch {}
                                  const raw = String(q.userRawAnswer).trim();
                                  if (raw && raw.toLowerCase() !== "null" && raw.toLowerCase() !== "undefined") {
                                    return raw;
                                  }
                                  return "";
                                })()}
                              </span>
                            </div>
                            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                              isCorrect
                                ? "text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700"
                                : "text-rose-800 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700"
                            }`}>
                              {isCorrect ? <Check size={13} className="stroke-[3]" /> : <X size={13} className="stroke-[3]" />}
                              {isCorrect ? "Your Correct Answer" : "Your Answer"}
                            </span>
                          </div>
                        )}

                        {/* EXPECTED CORRECT ANSWER KEY (IF AVAILABLE IN QUESTION DATA) */}
                        {(() => {
                          const correctKey =
                            q.questionCorrectAnswers?.find((ca) => isCleanText(ca.openEndedAnswer))?.openEndedAnswer ||
                            q.questionCorrectAnswers?.find((ca) => isCleanText(ca.description))?.description ||
                            q.questionCorrectAnswers?.find((ca) => isCleanText(ca.hint))?.hint ||
                            null;

                          if (!correctKey) return null;

                          return (
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/20 dark:bg-teal-950/20 border-l-4 border-l-teal-500 shadow-2xs">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                                  ✓ Correct Answer Key:
                                </span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  {correctKey}
                                </span>
                              </div>
                              <span className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-700 shadow-2xs">
                                <Check size={13} className="text-teal-600 dark:text-teal-400 stroke-[3]" />
                                Correct Answer
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* CLINICAL RATIONALE & EXPLANATION BOX (ONLY WHEN SHOW RATIONALE IS ENABLED) */}
                    {showRationale && isCleanText(q.explanation) && (
                      <div className="mt-4 p-4 rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-50/40 dark:bg-slate-800/60 text-xs">
                        <div className="font-bold text-teal-900 dark:text-teal-300 mb-1.5 flex items-center gap-1.5">
                          <Lightbulb size={14} className="text-teal-600 dark:text-teal-400" />
                          Clinical Rationale & Explanation
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                          {parse(q.explanation!)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* NO MATCHES SEARCH EMPTY STATE */}
      {!loading && filteredQuestions.length === 0 && evaluatedQuestions.length > 0 && (
        <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded-xl">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No questions match current filters {searchTerm ? `or "${searchTerm}"` : ""}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
              setHideNullAnswers(false);
            }}
            className="text-xs font-bold text-teal-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
