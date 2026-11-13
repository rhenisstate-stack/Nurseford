// src\app\web\(livexams)\rn-nursing\vista\exam\results\page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import SearchBar from "@/lib/utils/data/SearchBar";
import parse from "html-react-parser";
import { useRef } from "react";
import { FiX } from "react-icons/fi";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  BadgeCheck,
  Layers,
  Calendar,
  History,
  Target,
  Star,
  DollarSign,
  GraduationCap,
  ListChecks,
  Timer,
  Percent,
  Award,
  BookOpen,
  Layers3,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  useDistinctStrataAssessmentResults,
  StrataExamResultItem,
  StrataExamDetail,
  StrataResultAnswer,
  StrataResultWrongQuestion,
} from "@/lib/hooks/nexus/strata/assessment/results/distinct/useDistinctStrataAssessmentResults";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import ImpelModal from "@/app/(web)/auth/modals/Impel";
import LoginModal from "@/app/(web)/auth/modals/Login";
import RegisterModal from "@/app/(web)/auth/modals/Register";
import ExamQuestionsReview from "@/components/common/dashboards/assessment/ExamQuestionsReview";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const VOID = "Void";

function formatDate(value?: string) {
  if (!value) return VOID;
  const d = new Date(value);
  if (isNaN(d.getTime())) return VOID;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value?: string) {
  if (!value) return VOID;
  const d = new Date(value);
  if (isNaN(d.getTime())) return VOID;
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(value?: number, currency?: string) {
  if (value === undefined || value === null) return null;
  if (value === 0) return "Free";
  return `${currency ?? "$"}${value}`;
}

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return VOID;
  return String(value);
}

function getVisiblePages(current: number, total: number, windowSize = 2) {
  const pages: (number | "ellipsis")[] = [];
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);

  pages.push(1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  if (total > 1) pages.push(total);

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BOX
// ─────────────────────────────────────────────────────────────────────────────

function StatusBox({
  children,
  leftWidth,
  rightWidth,
  navHeight,
}: {
  children: React.ReactNode;
  leftWidth: number | string;
  rightWidth: number | string;
  navHeight: number;
}) {
  return (
    <div
      className="flex items-start justify-center pt-24 transition-all duration-300 ease-in-out"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--exam-content-bg)",
        color: "var(--exam-content-text)",
      }}
    >
      <div className="px-6 py-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2.5">
        <Loader2 className="animate-spin text-teal-600" size={18} />
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE RING
// ─────────────────────────────────────────────────────────────────────────────

function ScoreRing({ percentage, passed }: { percentage: number; passed: boolean }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
        <circle
          cx="18" cy="18" r="15.9" fill="none"
          stroke={passed ? "#059669" : "#e11d48"}
          strokeWidth="2.5"
          strokeDasharray={`${clamped} ${100 - clamped}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{Math.round(clamped)}%</span>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${
          passed
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
        }`}>
          {passed ? "PASSED" : "NOT PASSED"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDER / PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

function StatSlider({
  label,
  value,
  displayValue: dv,
  gradient = "from-teal-500 to-teal-700",
  markerAt,
}: {
  label: string;
  value: number;
  displayValue: string;
  gradient?: string;
  markerAt?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
        <span className="text-xs font-black text-slate-800 dark:text-slate-100">{dv}</span>
      </div>
      <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
          style={{ width: `${clamped}%` }}
        />
        {markerAt !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-700 dark:bg-slate-300"
            style={{ left: `${Math.max(0, Math.min(100, markerAt))}%` }}
            title={`Pass mark: ${markerAt}%`}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD (grid tile)
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "slate",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  tone?: "slate" | "emerald" | "red" | "indigo" | "amber";
}) {
  const toneMap: Record<string, { bg: string; text: string }> = {
    slate: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-600 dark:text-emerald-400" },
    red: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-600 dark:text-rose-400" },
    indigo: { bg: "bg-blue-50 dark:bg-blue-950/50", text: "text-[#0A2540] dark:text-blue-300" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-600 dark:text-amber-400" },
  };

  const style = toneMap[tone] || toneMap.slate;

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-3.5 shadow-2xs hover:shadow-xs transition flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg} ${style.text}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-base font-black text-slate-800 dark:text-slate-100 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION BREAKDOWN ROW
// ─────────────────────────────────────────────────────────────────────────────

interface SectionRowData {
  guidId: string;
  name?: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

function SectionRow({ section }: { section: SectionRowData }) {
  const percentage = section.totalQuestions > 0
    ? Math.round((section.correctCount / section.totalQuestions) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 rounded-xl px-5 py-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{section.name ?? VOID}</span>
        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{percentage}%</span>
      </div>

      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <CheckCircle2 size={13} /> {section.correctCount} Correct
        </span>
        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
          <XCircle size={13} /> {section.incorrectCount} Incorrect
        </span>
        {section.unansweredCount > 0 && (
          <span className="text-slate-400 font-medium">
            {section.unansweredCount} Unanswered
          </span>
        )}
        <span className="text-slate-400 font-medium ml-auto">
          {section.totalQuestions} questions
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WRONG QUESTION CARD
// ─────────────────────────────────────────────────────────────────────────────

function WrongQuestionCard({ q }: { q: StrataResultWrongQuestion }) {
  return (
    <div className="bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-900/60 rounded-xl px-4 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
          {q.sectionName ?? "Section"}
        </span>
        {q.scoreWeight !== undefined && (
          <span className="text-[11px] font-semibold text-slate-400">
            Weight {q.scoreWeight}
          </span>
        )}
      </div>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
        {q.questionText ? parse(q.questionText) : "Question unavailable"}
      </div>
      {q.userAnswerData && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your answer:{" "}
          <span className="text-rose-700 dark:text-rose-300 font-bold">
            {(() => {
              try {
                const answer = JSON.parse(q.userAnswerData);

                return (
                  answer.answerContent ??
                  answer.optionText ??
                  answer.value ??
                  q.userAnswerData
                );
              } catch {
                return q.userAnswerData;
              }
            })()}
          </span>
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAST ATTEMPT ROW
// ─────────────────────────────────────────────────────────────────────────────

function AttemptRow({
  attempt,
  isCurrent,
  onOpenAttempt,
}: {
  attempt: StrataExamResultItem;
  isCurrent: boolean;
  onOpenAttempt: (attempt: StrataExamResultItem) => void;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-4 py-3 border text-sm transition ${
        isCurrent
          ? "border-teal-500/80 bg-teal-50/50 dark:bg-teal-950/20 shadow-2xs"
          : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="font-bold text-slate-800 dark:text-slate-100">
          Attempt {(attempt.attemptNumber ?? 0) + 1}
        </span>
        <span className="text-slate-400 text-xs">·</span>
        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
          {formatDateTime(attempt.attemptedAt)}
        </span>
        {isCurrent && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0A2540] text-white">
            CURRENT
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 self-end sm:self-auto">
        <span className="font-bold text-slate-800 dark:text-slate-100">{attempt.percentageScore ?? 0}%</span>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            attempt.passed
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {attempt.passed ? "Passed" : "Not Passed"}
        </span>
        <button
          type="button"
          onClick={() => onOpenAttempt(attempt)}
          className="rounded-lg bg-[#0A2540] hover:bg-[#081B2E] px-3 py-1.5 text-xs font-bold text-white transition shadow-2xs"
        >
          Open Attempt
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE EXAM RESULTS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function DistinctExamResultsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const identifier = searchParams.get("identifier");
  console.log("[LiveExamResultsPage] identifier:", identifier);

  const [resultsPage, setResultsPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState<keyof StrataExamResultItem | null>("attemptedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showExamDetail, setShowExamDetail] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);

  const [showModePopup, setShowModePopup] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [modePopupTarget, setModePopupTarget] = useState<StrataExamResultItem | null>(null);

  // Auth flow — shown in place of the static "please log in" card when
  // the user is unauthenticated. `null` = fully dismissed (fallback prompt shown).
  const [authModalStep, setAuthModalStep] = useState<"impel" | "login" | "register" | null>(null);
  const [authLoginEmail, setAuthLoginEmail] = useState("");
  const [authLoginMessage, setAuthLoginMessage] = useState("");

  const examModes = ["Practice", "Exam", "Tutor", "Test", "Review", "Adaptive"];

  const examModeDescriptions: Record<string, string> = {
    Practice: "Low-pressure mode to build familiarity — no time limit, answers explained as you go.",
    Exam: "Full simulation of real exam conditions — timed, no hints, one continuous attempt.",
    Tutor: "Step-by-step guidance with explanations shown immediately after each question.",
    Test: "Timed assessment without explanations — mirrors formal testing conditions.",
    Review: "Revisit previously answered questions with full explanations and correct answers.",
    Adaptive: "Difficulty adjusts in real time based on your performance as you answer.",
  };

  const handleModeSelection = (mode: string) => {
    if (!exam) return;

    const targetAttempt = modePopupTarget;
    const targetExamGuidId = targetAttempt?.examGuidId ?? exam.examGuidId;

    if (!targetExamGuidId) return;

    // Tell the live exam page which attempt's answers to preload —
    // read by the sessionStorage effect in generic/page.tsx on mount.
    if (targetAttempt) {
      sessionStorage.setItem(`exam_attempt_mode_${targetExamGuidId}`, "prior");
      sessionStorage.setItem(
        `exam_attempt_target_number_${targetExamGuidId}`,
        String(targetAttempt.attemptNumber ?? 0)
      );
    }

    const attemptParam =
      targetAttempt?.attemptNumber !== undefined && targetAttempt?.attemptNumber !== null
        ? `&attempt=${targetAttempt.attemptNumber}`
        : "";

    const scoreParam =
      targetAttempt?.percentageScore !== undefined && targetAttempt?.percentageScore !== null
        ? `&score=${targetAttempt.percentageScore}`
        : "";

    const passedParam =
      targetAttempt?.passed !== undefined && targetAttempt?.passed !== null
        ? `&passed=${targetAttempt.passed}`
        : "";

    const passMarkParam =
      exam?.passMark !== undefined && exam?.passMark !== null
        ? `&passmark=${exam.passMark}`
        : "";

    router.push(
      `/web/rn-nursing/vista/exam/generic?mode=${encodeURIComponent(mode)}&identifier=${targetExamGuidId}${attemptParam}${scoreParam}${passedParam}${passMarkParam}`
    );
    setShowModePopup(false);
    setModePopupTarget(null);
  };

  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const historyRef = useRef<HTMLDivElement>(null);

  // NOTE: assumes useCurrentSystemUser exposes an `isLoading` flag while it
  // resolves the session. If your hook names it differently (e.g. `loading`),
  // rename this destructure to match — otherwise this page will fall back to
  // treating "still loading" as "logged out" again.
  const { user, loading: userLoading } = useCurrentSystemUser();

  // PRIMARY — fixed, always the latest attempt (page 1 / perPage 1 / sorted
  // most-recent-first, no search). Completely immune to the Attempt History
  // search/sort/pagination controls below — this is what drives the hero
  // card, stat grid, exam detail, and wrong-questions review.
  const {
    filteredExamResults: primaryExams,
  } = useDistinctStrataAssessmentResults({
    parentIdentifier: identifier ?? "",
    page: 1,
    perPage: 1,
    sortColumn: "attemptedAt",
    sortDirection: "desc",
  });

  // HISTORY — separate, user-controlled instance (search/sort/pagination).
  // Only ever feeds the "Explore Attempt History" section further down —
  // it can legitimately return zero results without affecting anything else.
  const {
    filteredExamResults: historyExams,
    skewTotal,
    skewTotalPages,
    examResultSearch,
    setExamResultSearch,
  } = useDistinctStrataAssessmentResults({
    parentIdentifier: identifier ?? "",
    page: resultsPage,
    perPage: resultsPerPage,
    sortColumn,
    sortDirection,
  });

  const exam = primaryExams[0];
  const examDetail: StrataExamDetail | null = exam?.examDetail ?? null;
  const error: string | null = null;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  // ───────────────────────────────────────────────────────────────────────
  // GUARD 1 — session still resolving → always "Loading", never "log in"
  // ───────────────────────────────────────────────────────────────────────

  if (userLoading) {
    return (
      <StatusBox leftWidth={leftWidth} rightWidth={rightWidth} navHeight={navHeight}>
        Loading Exam Results...
      </StatusBox>
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GUARD 2 — backend confirmed: no session — show auth modals
  // ───────────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <main
        className="pt-16 flex items-center justify-center transition-all duration-300 ease-in-out overflow-x-hidden"
        style={{
          marginLeft: leftWidth,
          marginRight: rightWidth,
          minHeight: `calc(100vh - ${navHeight}px)`,
          backgroundColor: "var(--content-bg)",
          color: "var(--content-text)",
        }}
      >
        {/* Fallback prompt — shown only if the person dismisses every modal */}
        {authModalStep === null && (
          <div className="max-w-md w-full bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-lg px-8 py-10 text-center space-y-5">
            <h1 className="text-xl font-black text-[#0A2540] dark:text-white">
              Please Log In to View Your Results
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You need an account to see this exam&apos;s results.
            </p>
            <button
              onClick={() => setAuthModalStep("impel")}
              className="w-full py-3 rounded-xl bg-[#0A2540] hover:bg-[#081B2E] text-white text-sm font-bold transition shadow-sm"
            >
              Click Here to Log In / Register
            </button>
          </div>
        )}

        <ImpelModal
          isOpen={authModalStep === "impel"}
          onClose={() => setAuthModalStep(null)}
          onChooseLogin={() => setAuthModalStep("login")}
          onChooseRegister={() => setAuthModalStep("register")}
        />

        <LoginModal
          isOpen={authModalStep === "login"}
          onClose={() => setAuthModalStep(null)}
          onSwitchToRegister={() => setAuthModalStep("register")}
          initialEmail={authLoginEmail}
          initialMessage={authLoginMessage}
          redirectPath={currentUrl}
        />

        <RegisterModal
          isOpen={authModalStep === "register"}
          onClose={() => setAuthModalStep(null)}
          onSwitchToLogin={(email, message) => {
            setAuthLoginEmail(email);
            setAuthLoginMessage(message);
            setAuthModalStep("login");
          }}
        />
      </main>
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GUARD 3 — data errors / exam still loading
  // ───────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <StatusBox leftWidth={leftWidth} rightWidth={rightWidth} navHeight={navHeight}>
        {error}
      </StatusBox>
    );
  }
  if (!exam) {
    return (
      <StatusBox leftWidth={leftWidth} rightWidth={rightWidth} navHeight={navHeight}>
        Loading Exam Results...
      </StatusBox>
    );
  }
  // ───────────────────────────────────────────────────────────────────────
  // DERIVED VALUES
  // ───────────────────────────────────────────────────────────────────────

  const scorePercentage = exam.percentageScore ?? 0;
  const passed = exam.passed ?? false;
  const totalQuestions = exam.questionsCount ?? exam.totalAnswered ?? 0;
  const correctCount = exam.totalCorrect ?? 0;
  const incorrectCount = exam.totalWrong ?? 0;
  const answeredCount = exam.totalAnswered ?? correctCount + incorrectCount;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const attemptDisplayNumber = (exam.attemptNumber ?? 0) + 1;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const gpa =
    historyExams.length > 0
      ? Math.round(
        historyExams.reduce(
          (total, exam) => total + (exam.percentageScore ?? 0),
          0
        ) / historyExams.length
      )
      : scorePercentage;
  const highestScore =
    historyExams.length > 0
      ? Math.max(...historyExams.map(x => x.percentageScore ?? 0))
      : scorePercentage;

  const lowestScore =
    historyExams.length > 0
      ? Math.min(...historyExams.map(x => x.percentageScore ?? 0))
      : scorePercentage;

  const passedAttempts = historyExams.filter(x => x.passed).length;

  const failedAttempts = historyExams.length - passedAttempts;
  const completion = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const sectionRows: SectionRowData[] = Object.values(
    (exam.answers ?? []).reduce<Record<number, SectionRowData>>((acc, answer: StrataResultAnswer) => {
      const key = answer.sectionId ?? -1;
      if (!acc[key]) {
        acc[key] = {
          guidId: String(key),
          name: `Section ${key}`,
          totalQuestions: 0,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: 0,
        };
      }
      acc[key].totalQuestions += 1;
      if (answer.isCorrect) {
        acc[key].correctCount += 1;
      } else {
        acc[key].incorrectCount += 1;
      }
      return acc;
    }, {})
  );

  const hierarchy = [
    { label: "Assessment", value: exam.assessmentName, level: "assessment", identifier: exam.assessmentGuidId },
    { label: "Program", value: exam.programName, level: "program", identifier: exam.programGuidId },
    { label: "Course", value: exam.courseName, level: "course", identifier: exam.courseGuidId },
    { label: "Subject", value: exam.subjectName, level: "subject", identifier: exam.subjectGuidId },
    { label: "Unit", value: exam.unitName, level: "unit", identifier: exam.unitGuidId },
    { label: "Lesson", value: exam.lessonName, level: "lesson", identifier: exam.lessonGuidId },
    { label: "Topic", value: exam.topicName, level: "topic", identifier: exam.topicGuidId },
    { label: "Concept", value: exam.conceptName, level: "concept", identifier: exam.conceptGuidId },
    { label: "Fact", value: exam.factName, level: "fact", identifier: exam.factGuidId },
  ].filter((h) => h.value && h.identifier);

  const priceLabel = examDetail?.isFree
    ? "Free"
    : formatCurrency(examDetail?.price, examDetail?.currency);

  const otherAttempts = historyExams.filter((r) => r.guidId !== exam.guidId);

  // ───────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────

  return (
    <main
      className="py-16 px-4 transition-all duration-300 ease-in-out overflow-x-hidden select-none"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--exam-content-bg)",
        color: "var(--exam-content-text)",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-28 px-2 sm:px-4">

        {/* HEADER / HERO CARD */}
        <div className={`bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${
          passed ? "border-t-4 border-t-emerald-500" : "border-t-4 border-t-rose-500"
        }`}>
          <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-[#0A2540] dark:text-white tracking-tight">
                  {displayValue(exam.title)}
                </h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  passed
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                }`}>
                  {passed ? "Passed" : "Not Passed"}
                </span>
              </div>
              {exam.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  {displayValue(exam.description)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {otherAttempts.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    historyRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold px-3.5 py-2 transition shadow-2xs"
                >
                  Prior Attempts ({otherAttempts.length})
                </button>
              )}
              <Link
                href={`/dashboards/rn-nursing/vista/stats/progress`}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 transition shadow-2xs whitespace-nowrap"
              >
                View My Progress
              </Link>
            </div>
          </div>

          {/* Clean Meta badges */}
          <div className="px-6 py-3 flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            {exam.duration && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Timer size={13} className="text-teal-600" /> {exam.duration} min
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ListChecks size={13} className="text-teal-600" /> {totalQuestions} Questions
            </span>
            {exam.passMark !== undefined && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target size={13} className="text-teal-600" /> Pass Mark: {exam.passMark}%
              </span>
            )}
            {exam.difficulty && exam.difficulty !== VOID && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Award size={13} className="text-amber-500" /> Difficulty: {displayValue(exam.difficulty)}
              </span>
            )}
            {exam.level && exam.level !== VOID && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                Level: {displayValue(exam.level)}
              </span>
            )}
            {exam.year && String(exam.year) !== VOID && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                Year: {displayValue(exam.year)}
              </span>
            )}
            {examDetail?.isFeatured && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                ★ Featured
              </span>
            )}
          </div>

          {/* Ring + core numbers */}
          <div className="px-6 py-6 flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing percentage={scorePercentage} passed={passed} />

            <div className="flex-1 w-full space-y-4">
              <StatSlider
                label="Score vs Pass Mark"
                value={scorePercentage}
                displayValue={`${scorePercentage}% (Needed: ${exam.passMark ?? 0}%)`}
                gradient={passed ? "from-emerald-400 to-emerald-600" : "from-rose-400 to-rose-600"}
                markerAt={exam.passMark ?? 0}
              />

              <StatSlider
                label="Overall GPA"
                value={gpa}
                displayValue={`${gpa}% Average across ${historyExams.length} attempt${historyExams.length === 1 ? "" : "s"}`}
                gradient="from-teal-400 to-blue-600"
              />

              <StatSlider
                label="Accuracy"
                value={accuracy}
                displayValue={`${accuracy}%`}
                gradient="from-cyan-400 to-blue-600"
              />

              <StatSlider
                label="Completion"
                value={completion}
                displayValue={`Answered ${answeredCount} of ${totalQuestions} Questions`}
                gradient="from-slate-400 to-slate-600"
              />
            </div>
          </div>
        </div>

        {/* STAT CARD GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard icon={Target} label="Exam Pass Mark" value={`${displayValue(exam.passMark)}%`} tone="indigo" />
          <StatCard icon={ListChecks} label="Total Questions" value={displayValue(totalQuestions)} tone="slate" />
          <StatCard icon={CheckCircle2} label="Correct Answers" value={displayValue(correctCount)} tone="emerald" />
          <StatCard icon={XCircle} label="Incorrect Answers" value={displayValue(incorrectCount)} tone="red" />
          <StatCard icon={Layers3} label="Unanswered Questions" value={displayValue(unansweredCount)} tone="slate" />
          <StatCard icon={GraduationCap} label="Your Grade" value={displayValue(exam.grade)} tone="amber" />
          <StatCard icon={Timer} label="Duration Allowed" value={exam.duration ? `${exam.duration} min` : VOID} tone="slate" />
          <StatCard icon={Calendar} label="Attempted At" value={formatDateTime(exam.attemptedAt)} tone="slate" />
          <StatCard icon={History} label="Attempt Number" value={`${attemptDisplayNumber}${exam.attemptsAllowed ? ` of ${exam.attemptsAllowed}` : ""}`} tone="indigo" />
          <StatCard icon={Star} label="Exam Rating" value={`${displayValue(exam.rating)}%`} tone="amber" />
          <StatCard icon={Percent} label="Total Score" value={`${displayValue(exam.score)}`} tone="indigo" />
          <StatCard icon={Award} label="Overall GPA" value={`${gpa}%`} tone="emerald" />
          <StatCard icon={Star} label="Highest Score" value={`${highestScore}%`} tone="emerald" />
          <StatCard icon={Target} label="Lowest Score" value={`${lowestScore}%`} tone="red" />
          <StatCard icon={CheckCircle2} label="Passed Attempts" value={`${passedAttempts}`} tone="emerald" />
          <StatCard icon={XCircle} label="Failed Attempts" value={`${failedAttempts}`} tone="red" />
        </div>

        {/* EXAM DETAIL CARD */}
        {examDetail && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowExamDetail((prev) => !prev)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <BadgeCheck size={14} /> Exam Details
              </h2>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${showExamDetail ? "rotate-180" : ""}`}
              />
            </button>

            {showExamDetail && (
              <div className="px-6 pb-5 space-y-4 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs">
                  <div className="flex flex-col"><span className="text-slate-400">Scoring Type</span><span className="font-semibold text-slate-600">{displayValue(examDetail.scoringType)}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Price</span><span className="font-semibold text-slate-600 flex items-center gap-1"><DollarSign size={11} />{priceLabel ?? VOID}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Discount</span><span className="font-semibold text-slate-600">{examDetail.discount ? `${examDetail.discount}%` : VOID}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Timed</span><span className="font-semibold text-slate-600">{examDetail.isTimed ? `Yes${examDetail.timeLimitPerQuestion ? ` (${examDetail.timeLimitPerQuestion}s/question)` : ""}` : "No"}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Shuffled</span><span className="font-semibold text-slate-600">{examDetail.shuffleQuestions ? "Yes" : "No"}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Review Allowed</span><span className="font-semibold text-slate-600">{examDetail.allowReview ? "Yes" : "No"}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Results Shown Immediately</span><span className="font-semibold text-slate-600">{examDetail.showResultsImmediately ? "Yes" : "No"}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Certificate</span><span className="font-semibold text-slate-600 flex items-center gap-1"><Award size={11} />{examDetail.hasCertificate ? "Yes" : "No"}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Published</span><span className="font-semibold text-slate-600">{formatDate(examDetail.publishedAt)}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Valid From</span><span className="font-semibold text-slate-600">{formatDate(exam.validFrom)}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Valid Until</span><span className="font-semibold text-slate-600">{formatDate(exam.validUntil)}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400">Reviewed At</span><span className="font-semibold text-slate-600">{formatDate(exam.reviewedAt)}</span></div>
                </div>

                {(examDetail.instructions || examDetail.objectives || examDetail.prerequisites || examDetail.resources) && (
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                    {examDetail.instructions && <p><span className="font-semibold text-slate-600">Instructions: </span>{examDetail.instructions}</p>}
                    {examDetail.objectives && <p><span className="font-semibold text-slate-600">Objectives: </span>{examDetail.objectives}</p>}
                    {examDetail.prerequisites && <p><span className="font-semibold text-slate-600">Prerequisites: </span>{examDetail.prerequisites}</p>}
                    {examDetail.resources && <p><span className="font-semibold text-slate-600">Resources: </span>{examDetail.resources}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LEARNING HIERARCHY CARD */}
        {hierarchy.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowHierarchy((prev) => !prev)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <BookOpen size={14} /> Learning Hierarchy
              </h2>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${showHierarchy ? "rotate-180" : ""}`}
              />
            </button>

            {showHierarchy && (
              <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs">
                  {hierarchy.map((h) => (
                    <div key={h.level} className="flex flex-col min-w-0">
                      <span className="text-slate-400">{h.label}</span>
                      <Link
                        href={`/dashboards/rn-nursing/vista/assessment/exams/distinct/overview?level=${h.level}&identifier=${h.identifier}`}
                        className="font-semibold text-slate-600 hover:text-indigo-600 hover:underline transition truncate"
                      >
                        {h.value}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* SECTIONS BREAKDOWN */}
        {sectionRows.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide px-1 flex items-center gap-2">
              <Layers size={14} /> Section Breakdown
            </h2>
            {sectionRows.map((section) => (
              <SectionRow key={section.guidId} section={section} />
            ))}
          </div>
        )}

        {/* COMPLETE QUESTIONS REVIEW */}
        <ExamQuestionsReview
          examGuidId={exam.examGuidId || identifier || ""}
          answers={exam.answers}
          wrongQuestionRefs={exam.wrongQuestionRefs}
          totalQuestions={totalQuestions}
          totalCorrect={exam.totalCorrect}
          totalWrong={exam.totalWrong}
        />

        <div className="my-6 border-t border-slate-200/80 dark:border-slate-800" />

        {/* ATTEMPT HISTORY */}
        <div ref={historyRef} className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <History size={16} className="text-teal-600" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Attempt History
            </h2>
          </div>

          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Top Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500">
                  Showing <strong>{historyExams.length}</strong> of <strong>{skewTotal}</strong> attempts
                </span>
              </div>

              <div className="flex items-center gap-2">
                <SearchBar
                  value={examResultSearch}
                  onChange={(v) => {
                    setExamResultSearch(v);
                    setResultsPage(1);
                  }}
                  placeholder="Search attempts..."
                />

                <select
                  value={sortColumn ?? ""}
                  onChange={(e) => {
                    setSortColumn((e.target.value || null) as keyof StrataExamResultItem | null);
                    setResultsPage(1);
                  }}
                  className="text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="attemptedAt">Sort: Attempt Date</option>
                  <option value="attemptNumber">Sort: Attempt Number</option>
                  <option value="percentageScore">Sort: Score</option>
                  <option value="grade">Sort: Grade</option>
                  <option value="passed">Sort: Passed</option>
                  <option value="timeTaken">Sort: Time Taken</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    setResultsPage(1);
                  }}
                  className="text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                  title="Toggle sort direction"
                >
                  {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
                </button>
              </div>
            </div>

            {/* Table / List */}
            {otherAttempts.length > 0 ? (
              <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <div className="space-y-2.5 p-3">
                  <AttemptRow
                    attempt={exam}
                    isCurrent
                    onOpenAttempt={(a) => {
                      setModePopupTarget(a);
                      setShowModePopup(true);
                    }}
                  />
                  {otherAttempts.map((r) => (
                    <AttemptRow
                      key={r.guidId}
                      attempt={r}
                      isCurrent={false}
                      onOpenAttempt={(a) => {
                        setModePopupTarget(a);
                        setShowModePopup(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : examResultSearch ? (
              <div className="w-full rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No attempts match &ldquo;{examResultSearch}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => { setExamResultSearch(""); setResultsPage(1); }}
                  className="mt-2 text-xs font-bold text-teal-600 hover:underline"
                >
                  Clear Search
                </button>
              </div>
            ) : null}

            {/* Bottom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <PerPageSelect
                  value={resultsPerPage}
                  onChange={(v) => {
                    setResultsPerPage(v);
                    setResultsPage(1);
                  }}
                />
              </div>

              {skewTotalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={resultsPage === 1}
                    onClick={() => setResultsPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Prior
                  </button>

                  {getVisiblePages(resultsPage, skewTotalPages).map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-sm opacity-60 select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setResultsPage(p)}
                        className={`px-3 py-1 rounded-lg border text-xs font-bold transition ${p === resultsPage
                          ? "bg-[#0A2540] border-[#0A2540] text-white shadow-2xs"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    disabled={resultsPage === skewTotalPages}
                    onClick={() => setResultsPage((p) => Math.min(skewTotalPages, p + 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STICKY ACTION BAR */}
      <div
        className="fixed bottom-0 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-6 py-3.5 z-20 transition-all duration-300 ease-in-out shadow-lg"
        style={{ left: leftWidth, right: rightWidth }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboards/rn-nursing/vista/assessment/exams/distinct/overview?level=subject${exam.subjectGuidId ? `&identifier=${exam.subjectGuidId}` : ""}`
              )
            }
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition shadow-2xs"
          >
            <ArrowLeft size={16} /> Choose a Different Exam
          </button>
          <button
            type="button"
            onClick={() => { setModePopupTarget(null); setShowModePopup(true); }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0A2540] hover:bg-[#081B2E] text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <RotateCcw size={16} /> Retake This Exam
          </button>
        </div>
      </div>

      {/* EXAM MODE POPUP */}
      {showModePopup && exam && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 shadow-2xl p-6 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => { setShowModePopup(false); setModePopupTarget(null); }}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div className="text-center pr-6">
              <h2 className="text-xl font-black text-[#0A2540] dark:text-white leading-tight">
                {displayValue(exam.title)}
              </h2>
              {exam.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{displayValue(exam.description)}</p>
              )}
              {modePopupTarget && (
                <p className="text-xs font-bold text-teal-600 mt-2">
                  Opening Attempt {(modePopupTarget.attemptNumber ?? 0) + 1} — {formatDateTime(modePopupTarget.attemptedAt)}
                </p>
              )}
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              Select Exam Mode
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {examModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeSelection(mode)}
                  onMouseEnter={() => setHoveredMode(mode)}
                  onMouseLeave={() => setHoveredMode(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 p-3.5 flex flex-col items-center justify-center gap-1 transition group"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                    {mode} Mode
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-teal-600">
                    Click to Start
                  </span>
                </button>
              ))}
            </div>

            {hoveredMode && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-teal-700 dark:text-teal-400 block mb-0.5">{hoveredMode} Mode:</span>
                {examModeDescriptions[hoveredMode]}
              </div>
            )}

            <button
              type="button"
              onClick={() => { setShowModePopup(false); setModePopupTarget(null); }}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Cancel &amp; Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
