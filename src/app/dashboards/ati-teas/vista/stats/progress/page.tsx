"use client";

import Link from "next/link";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiBookOpen,
  FiArrowLeft,
  FiCalendar,
} from "react-icons/fi";
import { RotateCcw } from "lucide-react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useUserExamProgress } from "@/lib/hooks/nexus/strata/assessment/progress/useUserExamProgress";

const CURRENT_PANEL = "ati-teas";

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// STAT CARD (image 1.1)
// ─────────────────────────────────────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 flex items-center gap-3 shadow-xs">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold opacity-50 tracking-wider text-[var(--text-color)] truncate">
          {label}
        </p>
        <p className="text-base sm:text-lg font-bold text-[var(--text-color)] leading-tight truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// MINI SEMI-CIRCLE GAUGE (image 1.a)
// ─────────────────────────────────────────────────────────────────────────────────────────────────
function MiniSemiGauge({
  value,
  label,
  sublabel,
  color = "#4f46e5",
  trackColor = "currentColor",
}: {
  value: number;
  label: string;
  sublabel: string;
  color?: string;
  trackColor?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 38;
  const cx = 48;
  const cy = 46;
  const circumference = Math.PI * radius; // half circle ~ 119.38
  const filled = (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center min-w-[85px] sm:min-w-[105px]">
      <svg width="96" height="52" viewBox="0 0 96 52">
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={trackColor}
          className="text-slate-300/40 dark:text-slate-700/60"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="-mt-5 text-center">
        <div className="text-sm sm:text-base font-black text-[var(--text-color)]">
          {Math.round(clamped)}%
        </div>
      </div>
      <div className="mt-1 text-[9px] sm:text-[10px] font-bold text-[var(--text-color)] opacity-75 uppercase tracking-wide text-center whitespace-nowrap">
        {label}
      </div>
      <div className="text-[8px] sm:text-[9px] opacity-50 text-[var(--text-color)] text-center whitespace-nowrap">
        {sublabel}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────────────────────────
export default function ProgressStatsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading: userLoading } = useCurrentSystemUser();
  const progress = useUserExamProgress();
  const stats = progress;

  return (
    <main
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 md:p-4 space-y-5 w-full max-w-6xl mx-auto">
        <Link
          href={`/dashboards/${CURRENT_PANEL}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-60 hover:opacity-100 text-[var(--text-color)] transition-opacity"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Session expired notice if authenticated session has lapsed on the backend */}
        {user?.id === 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-amber-700 dark:text-amber-400">
                Your login session has expired on the server.
              </p>
              <p className="text-[11px] opacity-80 text-amber-800 dark:text-amber-300 mt-0.5">
                Please log in again to sync your latest exam scores, attempts, and overall progress.
              </p>
            </div>
            <Link
              href={`/dashboards/${CURRENT_PANEL}/auth/login`}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs text-center"
            >
              Sign In Again
            </Link>
          </div>
        )}

        {/* Current user header with Overall Performance Gauges (image 1.a) */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
          <div className="shrink-0">
            <h1 className="text-xl font-bold text-[var(--text-color)] flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-indigo-500" />
              My Progress
            </h1>
            <p className="text-xs opacity-60 text-[var(--text-color)] mt-1">
              {userLoading ? "Loading…" : `${user?.userName ?? "Guest"} · ${user?.email ?? ""}`}
            </p>
          </div>

          {/* OVERALL PERFORMANCE GAUGES (image 1.a) */}
          <div className="flex flex-col items-center lg:items-end gap-1.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-color)] opacity-60 flex items-center gap-1.5 self-center lg:self-start">
              <FiTarget className="w-3.5 h-3.5 text-indigo-500" /> Overall Performance
            </div>
            <div className="flex items-center justify-around sm:justify-end gap-3 sm:gap-6 flex-wrap">
              <MiniSemiGauge
                value={stats.averageScore}
                label="Average Score"
                sublabel={`Across ${stats.totalAttempts} ${stats.totalAttempts === 1 ? "attempt" : "attempts"}`}
                color="#4f46e5"
              />
              <MiniSemiGauge
                value={stats.passRate}
                label="Pass Rate"
                sublabel={`${stats.passedCount} of ${stats.totalAttempts} passed`}
                color="#16a34a"
              />
              <MiniSemiGauge
                value={stats.bestScore}
                label="Best Score"
                sublabel="Personal best"
                color="#d97706"
              />
            </div>
          </div>
        </div>

        {/* STATS GRID: Active, In Progress, Completed, Total time studied, Last attempt (image 1.1) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={<FiBookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            label="Exams Attempted"
            value={stats.attempted}
            tone="bg-indigo-500/15"
          />
          <StatCard
            icon={<FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            label="In Progress"
            value={stats.inProgress}
            tone="bg-blue-500/15"
          />
          <StatCard
            icon={<FiCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            label="Completed"
            value={stats.completed}
            tone="bg-emerald-500/15"
          />
          <StatCard
            icon={<FiClock className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            label="Total Time Studied"
            value={stats.totalTimeStudied}
            tone="bg-slate-500/15"
          />
          <StatCard
            icon={<FiCalendar className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            label="Last Attempt"
            value={stats.lastAttemptDate}
            tone="bg-slate-500/15"
          />
        </div>

        {/* MY EXAM COVERAGE & PROGRESS (image 2) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-color)]">My Exam Coverage &amp; Progress</h2>
              <p className="text-[11px] opacity-60 text-[var(--text-color)]">
                Tracking your personalized progress and percentage completed for each exam.
              </p>
            </div>
            {stats.recentActiveExams.length > 0 && (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                {stats.recentActiveExams.length} {stats.recentActiveExams.length === 1 ? "Exam" : "Exams"} Attempted
              </span>
            )}
          </div>

          {stats.recentActiveExams.length === 0 ? (
            <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-color)]">No Exam Activity Yet</h3>
              <p className="text-xs opacity-60 text-[var(--text-color)] max-w-md mx-auto">
                You haven&apos;t started any exams yet. Begin a practice exam from the dashboard to track your personal coverage, score trends, and learning mastery.
              </p>
              <Link
                href={`/dashboards/${CURRENT_PANEL}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
              >
                Explore Exams
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActiveExams.map((exam) => {
                return (
                  <div
                    key={exam.id}
                    className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-4 flex-wrap shadow-xs hover:border-[var(--text-color)]/30 transition-all"
                  >
                    {/* Left: Title + Badges + Subtitle */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-[var(--text-color)] truncate">
                          {exam.title}
                        </span>
                        {exam.subjectName && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                            {exam.subjectName}
                          </span>
                        )}
                        {exam.status === "InProgress" || exam.score == null ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                            InProgress
                          </span>
                        ) : (
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                              exam.passed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {exam.passed ? "Passed" : "Not Passed"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-color)] opacity-60 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Attempt {exam.attemptsUsed || 1}</span>
                        <span>•</span>
                        <span>{exam.attemptDate || "Today"}</span>
                        <span>•</span>
                        <span>{exam.timeTaken || "In Progress"}</span>
                      </div>
                    </div>

                    {/* Right: Score + View Exam Report / Resume Exam / Retake Exam */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-black text-sm sm:text-base text-[var(--text-color)]">
                        {exam.score != null ? `${exam.score}%` : "In Progress"}
                      </span>
                      {exam.status === "InProgress" || exam.score == null ? (
                        <Link
                          href={`/web/${CURRENT_PANEL}/vista/exam/generic?mode=Practice&identifier=${exam.guidId || exam.id}`}
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>Resume Exam</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            href={`/dashboards/${CURRENT_PANEL}/vista/assessment/exams/reports/distinct?identifier=${exam.guidId || exam.id}`}
                            className="rounded-xl border border-indigo-300 dark:border-indigo-700 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition cursor-pointer"
                          >
                            View Exam Report
                          </Link>
                          <Link
                            href={`/web/${CURRENT_PANEL}/vista/exam/generic?mode=Practice&identifier=${exam.guidId || exam.id}`}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <RotateCcw size={13} />
                            <span>Retake Exam</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}