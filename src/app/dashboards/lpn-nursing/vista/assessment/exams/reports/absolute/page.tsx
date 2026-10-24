// src/app/dashboards/lpn-nursing/vista/assessment/exams/reports/absolute/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useAbsoluteStrataAssessmentResults, StrataExamResultItem } from "@/lib/hooks/nexus/strata/assessment/results/absolute/useAbsoluteStrataAssessmentResults";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import SearchBar from "@/lib/utils/data/SearchBar";
import ImpelModal from "@/app/(web)/auth/modals/Impel";
import LoginModal from "@/app/(web)/auth/modals/Login";
import RegisterModal from "@/app/(web)/auth/modals/Register";
import { FiX } from "react-icons/fi";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  Filter,
  Calendar,
  Percent,
  ListChecks,
  Clock,
  Target,
} from "lucide-react";

import Comparison from "./summary/Comparison";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const VISTA_PANEL = "lpn-nursing";
const EXAMS_BASE = `/dashboards/${VISTA_PANEL}/vista/assessment/exams`;
const ABSOLUTE_EXAMS_OVERVIEW_ROUTE = `${EXAMS_BASE}/absolute/overview`;
const GENERIC_EXAM_ROUTE = `/web/${VISTA_PANEL}/vista/exam/generic`;
const FULL_RESULTS_ROUTE = `${EXAMS_BASE}/reports/distinct`;

const VOID = "Void";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

interface ExamComparison {
  totalParticipants: number;
  higherCount: number;
  lowerCount: number;
  equalCount: number;
  averageScore: number;
  bestScore: number;
  lowestScore: number;
  medianScore: number;
  myRank: number;        // 1 = best score on this exam
  myPercentile: number;  // % of participants you scored higher than or equal to
  passRate: number;      // % of ALL participants (incl. you) who passed
  peersPassedCount: number;
  peersFailedCount: number;
  distinctSubjectsAttempted: number;
  peers: StrataExamResultItem[]; // raw peer rows, for the modal table
}

function computeExamComparison(
  examId: number | undefined,
  myScore: number,
  myPassed: boolean,
  othersAttempts: StrataExamResultItem[]
): ExamComparison | null {
  if (!examId) return null;

  const peers = othersAttempts.filter((o) => o.examId === examId);
  if (peers.length === 0) return null;

  const scores = peers.map((p) => p.percentageScore ?? 0);
  const allScores = [...scores, myScore].sort((a, b) => a - b);

  const higherCount = scores.filter((s) => s > myScore).length;
  const lowerCount = scores.filter((s) => s < myScore).length;
  const equalCount = scores.filter((s) => s === myScore).length;
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const bestScore = Math.max(...scores, myScore);
  const lowestScore = Math.min(...scores, myScore);

  const mid = Math.floor(allScores.length / 2);
  const medianScore =
    allScores.length % 2 === 0 ? (allScores[mid - 1] + allScores[mid]) / 2 : allScores[mid];

  const myRank = higherCount + 1; // 1-indexed
  const totalParticipants = peers.length + 1;
  const myPercentile = ((totalParticipants - myRank) / (totalParticipants - 1 || 1)) * 100;

  const peersPassedCount = peers.filter((p) => p.passed).length;
  const peersFailedCount = peers.length - peersPassedCount;
  const passRate = ((peersPassedCount + (myPassed ? 1 : 0)) / totalParticipants) * 100;

  const distinctSubjectsAttempted = new Set(peers.map((p) => p.subjectGuidId).filter(Boolean)).size;

  return {
    totalParticipants,
    higherCount,
    lowerCount,
    equalCount,
    averageScore,
    bestScore,
    lowestScore,
    medianScore,
    myRank,
    myPercentile,
    passRate,
    peersPassedCount,
    peersFailedCount,
    distinctSubjectsAttempted,
    peers,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

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
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(seconds?: number) {
  if (!seconds) return VOID;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Build and download a CSV from the currently filtered report list
function exportToCsv(rows: StrataExamResultItem[]) {
  const headers = ["Exam Title", "Subject", "Attempt #", "Date", "Score %", "Passed", "Correct", "Wrong", "Grade"];
  const lines = rows.map((r) =>
    [
      r.title ?? r.assessmentName ?? VOID,
      r.subjectName ?? VOID,
      String((r.attemptNumber ?? 0) + 1),
      formatDate(r.attemptedAt),
      String(r.percentageScore ?? 0),
      r.passed ? "Yes" : "No",
      String(r.totalCorrect ?? 0),
      String(r.totalWrong ?? 0),
      r.grade ?? VOID,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `exam-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI STAT
// ─────────────────────────────────────────────────────────────────────────────

function MiniStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
        <Icon size={13} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-xs font-black text-slate-700">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT CARD
// ─────────────────────────────────────────────────────────────────────────────

function ReportCard({
  report,
  expanded,
  onToggle,
  onRetake,
  onViewFull,
  comparison,
}: {
  report: StrataExamResultItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onRetake: (r: StrataExamResultItem) => void;
  onViewFull: (r: StrataExamResultItem) => void;
  comparison: ExamComparison | null;
}) {
  const score = report.percentageScore ?? 0;
  const passed = report.passed ?? false;
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Cycled by card position — same card always gets the same color on
  const CARD_BG_PALETTE = [
    "bg-green-100",
    "bg-sky-100",
    "bg-rose-100",
    "bg-amber-100",
    "bg-violet-100",
    "bg-teal-100",
    "bg-orange-100",
    "bg-cyan-100",
    "bg-fuchsia-100",
    "bg-lime-100",
    "bg-indigo-100",
    "bg-red-100",
  ];
  const [cardBg] = useState(
    () => CARD_BG_PALETTE[Math.floor(Math.random() * CARD_BG_PALETTE.length)]
  );
  return (
    <div className={`${cardBg} border border-slate-200 rounded-2xl shadow-sm overflow-hidden`}>
      <div className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
        <button onClick={onToggle} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-800 truncate">{report.title ?? report.assessmentName ?? VOID}</span>
            <span className={`text-md font-bold px-2 py-0.5 rounded-full ${passed ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {passed ? "Passed" : "Not Passed"}
            </span>
            {report.subjectName && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{report.subjectName}</span>
            )}
          </div>
          <p className="text-sm text-green-800 mt-0.5">
            Attempt {(report.attemptNumber ?? 0) + 1} ➖ {formatDateTime(report.attemptedAt)}
          </p>
        </button>

        {comparison && (
          <button
            onClick={() => setShowComparisonModal(true)}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 transition"
          >
            <span className="text-[11px] font-black text-indigo-700 border rounded bg-amber-400 p-2 uppercase tracking-wide">Open Comparison Table</span>
            <span className="text-xs font-bold text-indigo-500">
              You Rank Number{" "}
              <span className="font-black text-indigo-700">
                {comparison.myRank}
              </span>{" "}
              out of {" "}
              <span className="font-black text-indigo-700">
                {comparison.totalParticipants}
              </span>
            </span>

          </button>
        )}

        <button onClick={onToggle} className="flex flex-col items-end gap-1.5 flex-shrink-0 text-blue-600">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Your Score</span>
              <span className="text-xl font-black text-slate-800">{score}%</span>
            </div>
            <span className="text-md font-bold border rounded-2xl py-1 px-2 bg-yellow-300 text-black">Open to View More Details</span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </div>

          <span className="text-[10px] font-semibold text-slate-500">
            {report.totalCorrect ?? 0}/{report.questionsCount ?? report.totalAnswered ?? 0} correct
            {" · "}
            {passed ? "Passed" : "Not Passed"}
            {" · "}
            Attempted {formatDate(report.attemptedAt)}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">

          {comparison && (
            <div className="rounded-xl border border-indigo-100 bg-green-100 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-md font-black text-indigo-900 uppercase tracking-wide">
                  How You Compare on This Exam ⚓
                </p>
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className="text-[12px] font-bold px-2 py-1 border-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  View Full Comparison Table
                </button>
              </div>

              <p className="text-md text-slate-700">
                You rank number <span className="font-bold text-indigo-700">{comparison.myRank}</span> out of{" "}
                <span className="font-bold">{comparison.totalParticipants}</span> learners on this exam —
                that puts you in the top{" "}
                <span className="font-bold text-indigo-700">{(100 - comparison.myPercentile).toFixed(0)}%</span> —— {" "}
                <span className="font-bold text-red-800">{comparison.higherCount}</span> scored higher than you,{" "}
                <span className="font-bold text-emerald-700">{comparison.lowerCount}</span> scored lower, and{" "}
                <span className="font-bold text-slate-700">{comparison.equalCount}</span> tied your score.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <MiniStat icon={Percent} label="Class Average" value={`${comparison.averageScore.toFixed(1)}%`} />
                <MiniStat icon={Target} label="Top Score" value={`${comparison.bestScore}%`} />
                <MiniStat icon={XCircle} label="Lowest Score" value={`${comparison.lowestScore}%`} />
                <MiniStat icon={ListChecks} label="Median Score" value={`${comparison.medianScore.toFixed(1)}%`} />
                <MiniStat icon={CheckCircle2} label="Others Passed" value={`${comparison.peersPassedCount}`} />
                <MiniStat icon={XCircle} label="Others Failed" value={`${comparison.peersFailedCount}`} />
              </div>

              <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-indigo-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-indigo-600 transition-all duration-700"
                  style={{ width: `${Math.max(0, Math.min(100, comparison.passRate))}%` }}
                />
              </div>
              <p className="text-[12px] text-blue-800">
                Overall pass rate across everyone who has attempted this exam:{" "}
                <span className="font-bold text-indigo-700">{comparison.passRate.toFixed(1)}%</span>
              </p>

              <p className="text-[11px] text-slate-500 pt-1">
                Names and contact details of other learners are kept private. If you need special access
                to identify them, request it at{" "}
                <a
                  href="/dashboards/lpn-nursing/vista/pages/contact-us"
                  className="font-bold text-indigo-600 underline hover:text-indigo-800"
                >
                  Contact Us
                </a>.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-yellow-200 px-4 py-3 space-y-3">
            <p className="text-md font-black text-indigo-900 uppercase tracking-wide">
              Your Exam Attempt Breakdown ⚓
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat icon={ListChecks} label="Questions" value={String(report.questionsCount ?? report.totalAnswered ?? 0)} />
              <MiniStat icon={CheckCircle2} label="Correct" value={String(report.totalCorrect ?? 0)} />
              <MiniStat icon={XCircle} label="Incorrect" value={String(report.totalWrong ?? 0)} />
              <MiniStat icon={Percent} label="Pass Mark" value={`${report.passMark ?? 0}%`} />
              <MiniStat icon={Clock} label="Time Taken" value={formatDuration(report.timeTaken)} />
              <MiniStat icon={Calendar} label="Attempted" value={formatDate(report.attemptedAt)} />
              <MiniStat icon={Target} label="Grade" value={report.grade ?? VOID} />
            </div>

            <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${passed ? "bg-gradient-to-r from-emerald-300 to-emerald-600" : "bg-gradient-to-r from-red-300 to-red-600"}`}
                style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-2 pt-1">
            <button
              onClick={() => onViewFull(report)}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-300 border hover:bg-blue-200 text-black text-md font-bold px-4 py-2 transition"
            >
              <FileText size={13} /> View Full Report for This Exam
            </button>
            <button
              onClick={() => onRetake(report)}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-300 border hover:bg-green-200 text-black text-md font-bold px-4 py-2 transition"
            >
              <RotateCcw size={13} /> Retake This Exam
            </button>
          </div>
        </div>
      )}

      {/* Always mounted — independent of `expanded` entirely, so both trigger buttons (collapsed-row button + expanded-panel button) */}
      {comparison && (
        <Comparison
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          examTitle={report.title ?? report.assessmentName ?? VOID}
          myScore={score}
          peers={comparison.peers}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ExamsReportsAbsolutePage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: userLoading } = useCurrentSystemUser();

  // Auth flow — shown in place of the static "please log in" card when
  // the user is unauthenticated. `null` = fallback prompt shown (default on load);
  // clicking "Continue" advances to the Impel modal.
  const [authModalStep, setAuthModalStep] = useState<"impel" | "login" | "register" | null>(null);
  const [authLoginEmail, setAuthLoginEmail] = useState("");
  const [authLoginMessage, setAuthLoginMessage] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("attemptedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [passedFilter, setPassedFilter] = useState<"all" | "passed" | "failed">("all");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [expandedGuidId, setExpandedGuidId] = useState<string | null>(null);

  // Mode-selection popup — mirrors the results page's Retake/Open Attempt flow
  const [showModePopup, setShowModePopup] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [modePopupTarget, setModePopupTarget] = useState<StrataExamResultItem | null>(null);

  const examModes = ["Practice", "Exam", "Tutor", "Test", "Review", "Adaptive"];

  const examModeDescriptions: Record<string, string> = {
    Practice: "Low-pressure mode to build familiarity — no time limit, answers explained as you go.",
    Exam: "Full simulation of real exam conditions — timed, no hints, one continuous attempt.",
    Tutor: "Step-by-step guidance with explanations shown immediately after each question.",
    Test: "Timed assessment without explanations — mirrors formal testing conditions.",
    Review: "Revisit previously answered questions with full explanations and correct answers.",
    Adaptive: "Difficulty adjusts in real time based on your performance as you answer.",
  };

  const {
    filteredExamResults: rawResults,
    skewTotalPages: totalPages,
    setExamResultSearch,
  } = useAbsoluteStrataAssessmentResults({
    page,
    perPage,
    sortColumn: sortColumn as keyof StrataExamResultItem,
    sortDirection,
  });

  // The hook drives search server-side via examResultSearch — sync local
  // `search` state into it.
  useEffect(() => {
    setExamResultSearch(search);
  }, [search, setExamResultSearch]);

  // ⚠️ ASSUMPTION: adjust `user.id` to whatever field your
  // useCurrentSystemUser hook actually exposes as the numeric user id
  // (some setups use user.userId instead).
  const myUserId = user?.id as number | undefined;

  const myAttempts = useMemo(() => {
    return rawResults
      .filter((a) => a.userId === myUserId)
      .filter((a) => {
        if (passedFilter === "passed" && !a.passed) return false;
        if (passedFilter === "failed" && a.passed) return false;
        if (subjectFilter && a.subjectGuidId !== subjectFilter) return false;
        return true;
      })
      // Most recent attempts first
      .sort((a, b) => {
        const bTime = b.attemptedAt ? new Date(b.attemptedAt).getTime() : 0;
        const aTime = a.attemptedAt ? new Date(a.attemptedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [rawResults, myUserId, passedFilter, subjectFilter]);

  // Every attempt belonging to anyone else — used purely for aggregate
  // comparison stats. Never rendered with names/emails/phones attached.
  const othersAttempts = useMemo(
    () => rawResults.filter((a) => a.userId !== myUserId),
    [rawResults, myUserId]
  );

  // This hook has no loading/error state — stubbed to preserve the render below.
  const loading = false;
  const error: string | null = null;

  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    myAttempts.forEach((a) => {
      if (a.subjectGuidId && a.subjectName) map.set(a.subjectGuidId, a.subjectName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [myAttempts]);

  const passedCount = myAttempts.filter((a) => a.passed).length;

  const handleRetake = (r: StrataExamResultItem) => {
    setModePopupTarget(r);
    setShowModePopup(true);
  };

  const handleModeSelection = (mode: string) => {
    if (!modePopupTarget) return;
    const targetExamGuidId = modePopupTarget.examGuidId;
    if (!targetExamGuidId) return;

    sessionStorage.setItem(`exam_attempt_mode_${targetExamGuidId}`, "prior");
    sessionStorage.setItem(
      `exam_attempt_target_number_${targetExamGuidId}`,
      String(modePopupTarget.attemptNumber ?? 0)
    );

    router.push(`${GENERIC_EXAM_ROUTE}?mode=${encodeURIComponent(mode)}&identifier=${targetExamGuidId}`);
    setShowModePopup(false);
    setModePopupTarget(null);
  };

  const handleViewFull = (r: StrataExamResultItem) => {
    router.push(`${FULL_RESULTS_ROUTE}?identifier=${r.examGuidId}`);
  };

  const handleChooseExam = () => {
    router.push(`${ABSOLUTE_EXAMS_OVERVIEW_ROUTE}`);
  };

  if (userLoading) {
    return (
      <main style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }} className="flex items-center justify-center">
        <p className="font-bold animate-pulse text-slate-500">Loading Your Reports . . . ⚓</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="pt-16 flex items-center justify-center"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)`, backgroundColor: "var(--content-bg)", color: "var(--content-text)" }}
      >
        {authModalStep === null && (
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-lg px-8 py-10 text-center space-y-5">
            <h1 className="text-lg font-black text-indigo-900">Please Log In to View Your Reports ⚓</h1>
            <p className="text-sm text-slate-500">Every exam report you&apos;ve ever generated lives here.</p>
            <button
              onClick={() => setAuthModalStep("impel")}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-md font-bold transition"
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
          redirectPath={pathname}
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

  const randomQuote = VISTA_QUOTES[Math.floor(Math.random() * VISTA_QUOTES.length)];

  return (
    <main
      className="py-16 px-4 pb-28 print:py-4 print:pb-4 transition-all duration-300 ease-in-out overflow-x-hidden select-none"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--exam-content-bg)",
        color: "var(--exam-content-text)",
      }}
    >
      <div className="max-w-[90rem] mt-1 mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-6 py-5 flex flex-wrap items-center justify-between gap-4 print:shadow-none print:border-0">
          <div>
            <h1 className="text-xl font-black text-indigo-900">Your Detailed Comparison Exam Reports ⚓</h1>
            <p className="text-md text-blue-800 mt-1">
              <span className="font-black">{myAttempts.length}</span> Total Reports , {" "}
              <span className="font-black">{passedCount}</span> Passed ,  {" "}
              <span className="font-black">{myAttempts.length - passedCount}</span> Not Passed
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => exportToCsv(myAttempts)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-yellow-200 px-4 py-2 text-md font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-pink-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <Printer size={13} /> Print
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <PerPageSelect value={perPage} onChange={(v) => { setPerPage(v); setPage(1); }} />

            <select
              value={passedFilter}
              onChange={(e) => { setPassedFilter(e.target.value as "all" | "passed" | "failed"); setPage(1); }}
              className="text-xs font-bold rounded-md border border-slate-300 px-2 py-1.5 bg-white text-slate-600"
            >
              <option value="all">All Results</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Not Passed Only</option>
            </select>

            {subjects.length > 0 && (
              <select
                value={subjectFilter ?? ""}
                onChange={(e) => { setSubjectFilter(e.target.value || null); setPage(1); }}
                className="text-xs font-bold rounded-md border border-slate-300 px-2 py-1.5 bg-white text-slate-600"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            <select
              value={sortColumn}
              onChange={(e) => { setSortColumn(e.target.value); setPage(1); }}
              className="text-xs font-bold rounded-md border border-slate-300 px-2 py-1.5 bg-white text-slate-600"
            >
              <option value="attemptedAt">Sort: Date</option>
              <option value="percentageScore">Sort: Score</option>
              <option value="grade">Sort: Grade</option>
            </select>

            <button
              onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
              className="text-xs font-bold rounded-md border border-slate-300 px-2 py-1.5 bg-white text-slate-600"
            >
              {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>

          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search reports . . ." />
        </div>

        {/* REPORT LIST */}
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-12 animate-pulse">Loading reports . . . ⚓</p>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-12">{error}</p>
        ) : myAttempts.length > 0 ? (
          <div className="space-y-3">
            {myAttempts.map((r, idx) => (
              <ReportCard
                key={r.guidId}
                report={r}
                index={idx}
                expanded={expandedGuidId === r.guidId}
                onToggle={() => setExpandedGuidId((prev) => (prev === r.guidId ? null : r.guidId))}
                onRetake={handleRetake}
                onViewFull={handleViewFull}
                comparison={computeExamComparison(r.examId, r.percentageScore ?? 0, r.passed ?? false, othersAttempts)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
            <p className="text-sm font-semibold text-slate-500">No Reports Found ⚓</p>
            <button onClick={handleChooseExam} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition">
              Take Your First Exam
            </button>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 print:hidden">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md border text-xs font-bold disabled:opacity-40 bg-white text-slate-600"
            >
              Prior
            </button>
            <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-md border text-xs font-bold disabled:opacity-40 bg-white text-slate-600"
            >
              Next
            </button>
          </div>
        )}

        {/* QUOTE */}
        <div className="w-full flex justify-center items-center py-4 print:hidden">
          <div className="max-w-5xl w-full text-center px-6 py-4 rounded-2xl border backdrop-blur-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 shadow-lg">
            <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm">
              <span className="font-bold tracking-wide text-[var(--text-color)]">{randomQuote.quoteTitle}</span>
              <span className="opacity-70 text-[var(--text-color)]">— {randomQuote.quoteDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY ACTION BAR */}
      <div
        className="fixed bottom-0 bg-green-100 border-t border-slate-200 px-4 py-3 z-20 transition-all duration-300 ease-in-out print:hidden"
        style={{ left: leftWidth, right: rightWidth }}
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={() => router.push(`${EXAMS_BASE}/progress/absolute`)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-400 via-green-800 to-indigo-400 hover:from-indigo-700 hover:to-purple-700 text-white text-md font-bold flex items-center justify-center gap-2 transition"
          >
            View My Exam Progress <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* EXAM MODE POPUP */}
      {showModePopup && modePopupTarget && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3">

          {hoveredMode && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100000] w-[92%] max-w-md">
              <div className="relative rounded-xl border border-indigo-400 bg-white text-slate-700 shadow-2xl px-4 py-3 pr-9">
                <button
                  onClick={() => setHoveredMode(null)}
                  aria-label="Close"
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold hover:bg-slate-700 hover:text-white transition-all duration-200"
                >
                  ✕
                </button>
                <div className="text-xs font-bold uppercase tracking-wide text-indigo-500 mb-0.5">
                  {hoveredMode} Mode
                </div>
                <div className="text-sm leading-snug">
                  {examModeDescriptions[hoveredMode]}
                </div>
              </div>
            </div>
          )}

          <div className="relative w-full max-w-sm rounded-2xl border bg-white text-slate-700 shadow-2xl p-4 flex flex-col gap-3">

            <button
              onClick={() => { setShowModePopup(false); setModePopupTarget(null); }}
              aria-label="Close"
              className="
                absolute -top-5 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700
                bg-pink-200 text-black shadow-sm backdrop-blur-md transition-all duration-300 ease-out
                hover:scale-110 hover:border-red-500 hover:bg-black hover:text-red-600 hover:shadow-lg
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500
              "
            >
              <FiX className="h-7 w-7 stroke-[3.5]" />
            </button>

            <div className="text-center px-6">
              <h2 className="text-2xl font-bold leading-tight">
                {modePopupTarget.title ?? modePopupTarget.assessmentName ?? VOID}
              </h2>
              {modePopupTarget.description && (
                <p className="text-xs opacity-60 mt-1 whitespace-normal break-words">{modePopupTarget.description}</p>
              )}
              <p className="text-[11px] font-bold text-indigo-600 mt-2">
                Opening Attempt {(modePopupTarget.attemptNumber ?? 0) + 1} — {formatDate(modePopupTarget.attemptedAt)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {examModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeSelection(mode)}
                  onMouseEnter={() => setHoveredMode(mode)}
                  onMouseLeave={() => setHoveredMode(null)}
                  onFocus={() => setHoveredMode(mode)}
                  onBlur={() => setHoveredMode(null)}
                  className="
                    rounded-xl border px-3 py-4
                    flex flex-col items-center justify-center gap-1
                    transition-all duration-200
                    hover:scale-105
                    bg-gradient-to-r from-purple-100 to-green-50
                    hover:bg-indigo-600
                    hover:text-green-700
                    group
                  "
                >
                  <span className="text-lg font-bold">{mode} Mode</span>
                  <span className="text-sm opacity-60 group-hover:opacity-90">Click to Start</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setShowModePopup(false); setModePopupTarget(null); }}
              className="w-full py-2 rounded-xl border text-xs font-bold bg-gradient-to-r from-purple-200 to-green-200 text-black hover:opacity-80 transition-all"
            >
              Cancel &amp; Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────
