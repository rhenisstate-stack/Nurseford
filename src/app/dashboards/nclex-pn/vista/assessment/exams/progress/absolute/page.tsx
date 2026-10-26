// src/app/dashboards/nclex-pn/vista/assessment/exams/progress/absolute/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useRelativeStrataAssessmentResults, StrataExamResultItem } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import SearchBar from "@/lib/utils/data/SearchBar";
import ImpelModal from "@/app/(web)/auth/modals/Impel";
import LoginModal from "@/app/(web)/auth/modals/Login";
import RegisterModal from "@/app/(web)/auth/modals/Register";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Filter,
  RotateCcw,
  ArrowRight,
  BarChart3,
  Gauge as GaugeIcon,
  Sun,
  Sunrise,
  Moon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const VISTA_PANEL = "nclex-pn";
const EXAMS_BASE = `/dashboards/${VISTA_PANEL}/vista/assessment/exams`;
const ABSOLUTE_EXAMS_OVERVIEW_ROUTE = `${EXAMS_BASE}/absolute/overview`;
const ABSOLUTE_REPORTS_ROUTE = `${EXAMS_BASE}/reports/relative`;
const DISTINCT_REPORTS_ROUTE = `${EXAMS_BASE}/reports/distinct`;
const GENERIC_EXAM_ROUTE = `/web/${VISTA_PANEL}/vista/exam/generic`;

const VOID = "Void";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(value?: string) {
  if (!value) return VOID;
  const d = new Date(value);
  if (isNaN(d.getTime())) return VOID;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatShortDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDuration(seconds?: number) {
  if (!seconds) return VOID;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sunrise };
  if (hour < 18) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

// ─────────────────────────────────────────────────────────────────────────────
// SEMI-CIRCLE GAUGE
// ─────────────────────────────────────────────────────────────────────────────

function SemiGauge({
  value,
  label,
  sublabel,
  color = "#4f46e5",
  trackColor = "#e5e7eb",
}: {
  value: number; // 0-100
  label: string;
  sublabel: string;
  color?: string;
  trackColor?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const circumference = Math.PI * radius; // half circle
  const filled = (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={trackColor}
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="-mt-9 text-center">
        <div className="text-2xl font-black text-slate-800">{Math.round(clamped)}%</div>
      </div>
      <div className="mt-2 text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</div>
      <div className="text-[11px] text-slate-400">{sublabel}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTEMPT ROW (timeline list)
// ─────────────────────────────────────────────────────────────────────────────

function TimelineRow({
  attempt,
  onRetake,
  onViewReport,
}: {
  attempt: StrataExamResultItem;
  onRetake: (a: StrataExamResultItem) => void;
  onViewReport: (a: StrataExamResultItem) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm flex-wrap">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 truncate">{attempt.title ?? attempt.assessmentName ?? VOID}</span>
          {attempt.subjectName && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
              {attempt.subjectName}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${attempt.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {attempt.passed ? "Passed" : "Not Passed"}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Attempt {(attempt.attemptNumber ?? 0) + 1} · {formatDate(attempt.attemptedAt)} · {formatDuration(attempt.timeTaken)}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-black text-slate-700">{attempt.percentageScore ?? 0}%</span>
        <button
          onClick={() => onViewReport(attempt)}
          className="rounded-md border border-indigo-300 px-3 py-1.5 bg-green-100 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition"
        >
          View Exam Report
        </button>
        <button
          onClick={() => onRetake(attempt)}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center gap-1"
        >
          <RotateCcw size={12} /> Retake Exam
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ExamsProgressAbsolutePage() {
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
  const [perPage, setPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [passedFilter, setPassedFilter] = useState<"all" | "passed" | "failed">("all");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

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
    setExamResultSearch,
  } = useRelativeStrataAssessmentResults({
    page,
    perPage,
    sortColumn: "attemptedAt",
    sortDirection: "asc", // oldest → newest, ideal for trend chart + streaks
  });

  // The hook drives search server-side via examResultSearch — sync local
  // `search` state into it.
  useEffect(() => {
    setExamResultSearch(search);
  }, [search, setExamResultSearch]);

  // subjectFilter / passedFilter aren't server params on this hook, so apply
  // them client-side over the current page of results.
  const attempts = useMemo(() => {
    return rawResults.filter((a) => {
      if (passedFilter === "passed" && !a.passed) return false;
      if (passedFilter === "failed" && a.passed) return false;
      if (subjectFilter && a.subjectGuidId !== subjectFilter) return false;
      return true;
    });
  }, [rawResults, passedFilter, subjectFilter]);

  // This hook has no loading/error state — stubbed to preserve the render below.
  const loading = false;
  const error: string | null = null;

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const userDisplayName = user?.userName || user?.email || "there";

  const historyRef = useRef<HTMLDivElement>(null);

  // ── Derived aggregates ─────────────────────────────────────────────────
  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    attempts.forEach((a) => {
      if (a.subjectGuidId && a.subjectName) map.set(a.subjectGuidId, a.subjectName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [attempts]);

  const averageScore = useMemo(() => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((sum, a) => sum + (a.percentageScore ?? 0), 0) / attempts.length);
  }, [attempts]);

  const passRate = useMemo(() => {
    if (attempts.length === 0) return 0;
    return Math.round((attempts.filter((a) => a.passed).length / attempts.length) * 100);
  }, [attempts]);

  const bestScore = useMemo(
    () => (attempts.length ? Math.max(...attempts.map((a) => a.percentageScore ?? 0)) : 0),
    [attempts]
  );

  const trendData = useMemo(
    () =>
      attempts.map((a, index) => ({
        // "sequence" guarantees a unique x-position per attempt even when two
        // attempts share the same calendar day — prevents points collapsing.
        sequence: index + 1,
        date: formatShortDate(a.attemptedAt),
        fullDate: formatDate(a.attemptedAt),
        // Named exactly like the API field to avoid any ambiguity with the
        // raw "score" (marks) field also present on StrataExamResultItem.
        percentageScore: a.percentageScore ?? 0,
        passMark: a.passMark ?? 0,
        title: a.title ?? a.assessmentName ?? VOID,
        subjectName: a.subjectName ?? VOID,
        attemptNumber: (a.attemptNumber ?? 0) + 1,
        passed: a.passed ?? false,
      })),
    [attempts]
  );

  // Custom dot: green for passed attempts, red for not passed
  const TrendDot = (props: { cx?: number; cy?: number; payload?: { passed?: boolean } }) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={payload?.passed ? "#16a34a" : "#dc2626"}
        stroke="#fff"
        strokeWidth={1.5}
      />
    );
  };

  // Custom tooltip: shows attempt number, exam title, subject, date, score, pass status.
  // Reads payload[0].value (the exact number recharts plotted for dataKey="percentageScore")
  // as the source of truth, falling back to d.percentageScore only if value is absent —
  // this guarantees the tooltip text can never diverge from the plotted dot's height.
  function TrendTooltip({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value?: number;
      payload: {
        title: string;
        subjectName: string;
        attemptNumber: number;
        fullDate: string;
        percentageScore: number;
        passMark: number;
        passed: boolean;
      }
    }>;
  }) {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    const plottedScore = payload[0].value ?? d.percentageScore;
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-lg px-3 py-2 text-xs space-y-1 max-w-[220px]">
        <p className="font-black text-slate-800 truncate">{d.title}</p>
        {d.subjectName !== VOID && <p className="text-slate-400">{d.subjectName}</p>}
        <p className="font-bold text-indigo-600">Attempt Number {d.attemptNumber}</p>
        <p className="text-slate-500">{d.fullDate}</p>
        <p className="font-black text-slate-800">
          Score: {plottedScore}%{" "}
          <span className={d.passed ? "text-emerald-600" : "text-red-500"}>
            ({d.passed ? "Passed" : "Not Passed"})
          </span>
        </p>
        <p className="text-slate-400">Pass Mark: {d.passMark}%</p>
      </div>
    );
  }

  function SubjectTooltip({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        average: number;
        attempts: number;
        exams: number;
        questions: number;
      };
    }>;
  }) {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-lg px-3 py-2 text-xs space-y-1 max-w-[220px]">
        <p className="font-black text-slate-800 truncate">{d.name}</p>
        <p className="font-black text-slate-800">Average Score: {d.average}%</p>
        <p className="text-slate-500">Exams Taken: {d.exams}</p>
        <p className="text-slate-500">Total Attempts: {d.attempts}</p>
        <p className="text-slate-500">Questions Answered: {d.questions}</p>
      </div>
    );
  }

  const subjectAverages = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; examIds: Set<string>; questions: number }>();
    attempts.forEach((a) => {
      const key = a.subjectGuidId ?? "unknown";
      const name = a.subjectName ?? "Unassigned";
      if (!map.has(key)) map.set(key, { name, total: 0, count: 0, examIds: new Set(), questions: 0 });
      const entry = map.get(key)!;
      entry.total += a.percentageScore ?? 0;
      entry.count += 1;
      const examId = a.assessmentGuidId ?? a.examGuidId;
      if (examId) entry.examIds.add(examId);
      entry.questions += (a.totalCorrect ?? 0) + (a.totalWrong ?? 0);
    });
    return Array.from(map.values()).map((v) => ({
      name: v.name,
      average: Math.round(v.total / v.count),
      attempts: v.count,
      exams: v.examIds.size,
      questions: v.questions,
    }));
  }, [attempts]);

  const recentAttempts = useMemo(() => [...attempts].reverse().slice(0, perPage), [attempts, perPage]);

  // Derived from the real attempts data — the pass mark of the most recent
  // attempt in the (oldest→newest sorted) list. No hardcoded/guessed value.
  const currentPassMark = useMemo(() => {
    if (attempts.length === 0) return null;
    return attempts[attempts.length - 1].passMark ?? null;
  }, [attempts]);

  // Which edge indicator (left/right) of the Pass Mark line is currently hovered.
  const [passMarkHoverSide, setPassMarkHoverSide] = useState<"left" | "right" | null>(null);

  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{
    title: string;
    subjectName: string;
    percentageScore: number;
  } | null>(null);

  const [hoveredSubjectPoint, setHoveredSubjectPoint] = useState<{
    name: string;
    average: number;
  } | null>(null);

  // Renders a small hoverable marker at the left or right edge of the reference
  // line. Recharts calls this with viewBox = the line's pixel position, so we
  // can anchor the marker precisely at either end instead of dead-center.
  function PassMarkEdgeMarker({
    side,
    passMark,
  }: {
    side: "left" | "right";
  } & { passMark: number }) {
    const EdgeMarker = (props: { viewBox?: { x: number; y: number; width: number; height: number } }) => {
      const vb = props.viewBox;
      if (!vb) return <g />;
      const x = side === "left" ? vb.x + 6 : vb.x + vb.width - 6;
      const y = vb.y;
      const isHovered = passMarkHoverSide === side;

      return (
        <g
          onMouseEnter={() => setPassMarkHoverSide(side)}
          onMouseLeave={() => setPassMarkHoverSide((prev) => (prev === side ? null : prev))}
          style={{ cursor: "default" }}
        >
          {/* Larger invisible hit-area so hovering is easy */}
          <rect x={x - 14} y={y - 14} width={28} height={28} fill="transparent" />
          <circle cx={x} cy={y} r={4} fill="#94a3b8" stroke="#fff" strokeWidth={1.5} />

          {isHovered && (
            <g transform={`translate(${side === "left" ? x + 10 : x - 130}, ${y - 34})`}>
              <rect width={120} height={26} rx={6} fill="#1e293b" opacity={0.95} />
              <text x={8} y={17} fontSize={10} fontWeight={700} fill="#fff">
                Pass Mark: {passMark}%
              </text>
            </g>
          )}
        </g>
      );
    };
    EdgeMarker.displayName = `PassMarkEdgeMarker_${side}`;
    return EdgeMarker;
  }

  // Most recent attempt (attempts are sorted oldest → newest)
  const latestAttempt = attempts.length ? attempts[attempts.length - 1] : null;

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleRetake = (a: StrataExamResultItem) => {
    setModePopupTarget(a);
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

  const handleDistinctViewReport = (a: StrataExamResultItem) => {
    router.push(`${DISTINCT_REPORTS_ROUTE}?identifier=${a.examGuidId ?? a.examGuidId}`);
  };

  const handleChooseExam = () => {
    router.push(`${ABSOLUTE_EXAMS_OVERVIEW_ROUTE}`);
  };

  // ── Guards ──────────────────────────────────────────────────────────────
  if (userLoading) {
    return (
      <main style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }} className="flex items-center justify-center">
        <p className="font-bold animate-pulse text-slate-500">Loading Your Progress . . . ⚓</p>
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
            <h1 className="text-lg font-black text-indigo-900">Please Log In to View Your Progress ⚓</h1>
            <p className="text-sm text-slate-500">Your progress dashboard tracks every attempt across every exam.</p>
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
      className="py-16 px-4 pb-28 transition-all duration-300 ease-in-out overflow-x-hidden select-none"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--exam-content-bg)",
        color: "var(--exam-content-text)",
      }}
    >
      <div className="max-w-[90rem] mt-1 mx-auto space-y-6">

        {/* GREETING BAR */}
        <div className="flex items-center gap-3 mt-2 p-3 border border-indigo-300 rounded-2xl">
          <div className="w-10 h-10 rounded-full border bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <GreetingIcon size={18} />
          </div>

          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-3xl font-bold text-slate-700">
                {greeting.text} , {userDisplayName} .
              </p>
              <p className="text-xs text-pink-900">
                Here&apos;s the full breakdown of your exam attempt
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => latestAttempt && handleRetake(latestAttempt)}
                disabled={!latestAttempt}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-md font-bold text-white hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} /> Retake Exam
              </button>

              <button
                onClick={() =>
                  historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="rounded-lg bg-indigo-600 px-4 py-2 text-md font-bold text-white hover:bg-indigo-700 transition"
              >
                Explore Prior [ {attempts.length} ] Attempts
              </button>
            </div>

          </div>
        </div>

        {/* GAUGES */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-6 py-3">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <GaugeIcon size={14} /> Overall Performance
          </h2>
          <div className="flex flex-wrap justify-around gap-6">
            <SemiGauge value={averageScore} label="Average Score" sublabel={`Across ${attempts.length} attempts`} color="#4f46e5" />
            <SemiGauge value={passRate} label="Pass Rate" sublabel={`${attempts.filter((a) => a.passed).length} of ${attempts.length} passed`} color="#16a34a" />
            <SemiGauge value={bestScore} label="Best Score" sublabel="Personal best" color="#d97706" />
          </div>
        </div>

        {/* TREND CHART */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-3">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-2">
            <TrendingUp size={14} /> Score Trend Over Time
          </h2>
          <p className="text-xs font-semibold text-indigo-600 mb-3 h-4">
            {hoveredTrendPoint
              ? `${hoveredTrendPoint.subjectName !== VOID ? hoveredTrendPoint.subjectName + " — " : ""}${hoveredTrendPoint.title}: ${hoveredTrendPoint.percentageScore}%`
              : ""}
          </p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                onMouseMove={(state: unknown) => {
                  const p = (state as { activePayload?: Array<{ payload: typeof trendData[number] }> })
                    ?.activePayload?.[0]?.payload;
                  if (p) setHoveredTrendPoint(p);
                }}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="sequence"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Attempt Timeline", position: "insideBottom", offset: -3, fontSize: 10, fill: "#94a3b8" }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip content={<TrendTooltip />} />
                {currentPassMark !== null && (
                  <ReferenceLine
                    y={currentPassMark}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={PassMarkEdgeMarker({ side: "left", passMark: currentPassMark })}
                  />
                )}
                {currentPassMark !== null && (
                  <ReferenceLine
                    y={currentPassMark}
                    stroke="transparent"
                    label={PassMarkEdgeMarker({ side: "right", passMark: currentPassMark })}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="percentageScore"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={<TrendDot />}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No attempts yet — your trend will appear here once you take an exam ⚓</p>
          )}
        </div>

        {/* SUBJECT BREAKDOWN CHART */}
        {subjectAverages.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-6">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-2">
              <BarChart3 size={14} /> Average Score by Subject
            </h2>
            <p className="text-xs font-semibold text-indigo-600 mb-3 h-4">
              {hoveredSubjectPoint ? `${hoveredSubjectPoint.name}: ${hoveredSubjectPoint.average}%` : ""}
            </p>
            <ResponsiveContainer width="100%" height={Math.max(220, subjectAverages.length * 44)}>
              <BarChart
                data={subjectAverages}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
                onMouseMove={(state: unknown) => {
                  const p = (state as { activePayload?: Array<{ payload: typeof subjectAverages[number] }> })
                    ?.activePayload?.[0]?.payload;
                  if (p) setHoveredSubjectPoint(p);
                }}
                onMouseLeave={() => setHoveredSubjectPoint(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                <Tooltip content={<SubjectTooltip />} />
                <Legend />
                <Bar dataKey="average" fill="#4f46e5" radius={[0, 6, 6, 0]} name="Average Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* FILTERS + TIMELINE */}
        <div ref={historyRef} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Filter size={14} />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide">Attempt Timeline</h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {attempts.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <PerPageSelect value={perPage} onChange={(v) => { setPerPage(v); setPage(1); }} />

                <select
                  value={passedFilter}
                  onChange={(e) => setPassedFilter(e.target.value as "all" | "passed" | "failed")}
                  className="text-xs font-bold rounded-md border border-slate-300 px-2 py-1.5 bg-white text-slate-600"
                >
                  <option value="all">All Results</option>
                  <option value="passed">Passed Only</option>
                  <option value="failed">Not Passed Only</option>
                </select>

                {subjects.length > 0 && (
                  <select
                    value={subjectFilter ?? ""}
                    onChange={(e) => setSubjectFilter(e.target.value || null)}
                    className="text-xs font-bold rounded-md border border-slate-300 px-2 py-1.5 bg-white text-slate-600"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search exam titles . . ." />
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 text-center py-8 animate-pulse">Loading attempts . . . ⚓</p>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-8">{error}</p>
          ) : recentAttempts.length > 0 ? (
            <div className="space-y-2">
              {recentAttempts.map((a) => (
                <TimelineRow key={a.guidId} attempt={a} onRetake={handleRetake} onViewReport={handleDistinctViewReport} />
              ))}
            </div>
          ) : (
            <div className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
              <p className="text-sm font-semibold text-slate-500">No Attempts Found ⚓</p>
              <button onClick={handleChooseExam} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition">
                Choose an Exam to Get Started
              </button>
            </div>
          )}
        </div>

        {/* QUOTE */}
        <div className="w-full flex justify-center items-center py-4">
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
        className="fixed bottom-0 bg-green-100 border-t border-slate-200 px-4 py-3 z-20 transition-all duration-300 ease-in-out"
        style={{ left: leftWidth, right: rightWidth }}
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={() => router.push(ABSOLUTE_REPORTS_ROUTE)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-700 via-blue-800 to-yellow-700 hover:from-indigo-700 hover:to-purple-700 text-white text-md font-bold flex items-center justify-center gap-2 transition"
          >
            View All My Exam Reports <ArrowRight size={16} />
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