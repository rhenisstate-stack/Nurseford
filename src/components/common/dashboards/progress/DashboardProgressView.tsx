"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  ArrowLeft,
  Calendar,
  RotateCcw,
  Timer,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Flame,
} from "lucide-react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useUserExamProgress } from "@/lib/hooks/nexus/strata/assessment/progress/useUserExamProgress";

interface DashboardProgressViewProps {
  currentPanel: string;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// COMPACT STAT METRIC CARD
// ─────────────────────────────────────────────────────────────────────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
  sublabel,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  accentColor: "indigo" | "teal" | "emerald" | "amber" | "blue" | "slate";
}) {
  const colorMap = {
    indigo: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60",
    teal: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/60",
    emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60",
    amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60",
    blue: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60",
  };

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-3 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border ${colorMap[accentColor]}`}
        >
          {icon}
        </div>
        {sublabel && (
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {sublabel}
          </span>
        )}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate mb-0.5">
          {label}
        </p>
        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// COMPACT CIRCULAR PROGRESS GAUGE
// ─────────────────────────────────────────────────────────────────────────────────────────────────
function CircularProgressGauge({
  value,
  label,
  sublabel,
  color,
  trackColor = "rgba(148, 163, 184, 0.18)",
}: {
  value: number;
  label: string;
  sublabel: string;
  color: string;
  trackColor?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center min-w-[80px] sm:min-w-[90px] p-1.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none">
            {clamped}%
          </span>
        </div>
      </div>

      <div className="mt-1 text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-center whitespace-nowrap">
        {label}
      </div>
      <div className="text-[8px] font-medium text-slate-500 dark:text-slate-400 text-center whitespace-nowrap mt-0.5">
        {sublabel}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD PROGRESS VIEW (COMPACT)
// ─────────────────────────────────────────────────────────────────────────────────────────────────
export default function DashboardProgressView({ currentPanel }: DashboardProgressViewProps) {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading: userLoading } = useCurrentSystemUser();
  const progress = useUserExamProgress();
  const stats = progress;

  const displayName = user?.userName || user?.name || "Learner";
  const displayEmail = user?.email || "";

  return (
    <main
      className="pt-12 pb-10 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 sm:p-4 space-y-4 w-full max-w-5xl mx-auto">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboards/${currentPanel}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Live Sync
            </span>
          </div>
        </div>

        {/* Session expired notice if session lapsed */}
        {user?.id === 0 && (
          <div className="rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300 text-xs">
                  Your login session has expired
                </p>
                <p className="text-[10px] text-amber-700/90 dark:text-amber-400/90">
                  Sign in again to synchronize your latest mock exam scores, attempts, and overall progress.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboards/${currentPanel}/auth/login`}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs text-center cursor-pointer"
            >
              Sign In Again
            </Link>
          </div>
        )}

        {/* HERO CARD: User Info + Overall Performance Gauges (Compact) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-4 sm:p-5 shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Header */}
            <div className="space-y-1.5 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60">
                <BarChart3 className="w-3 h-3 text-teal-600" />
                Performance Analytics
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>My Progress &amp; Coverage</span>
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userLoading ? (
                  "Loading user profile..."
                ) : (
                  <>
                    Learner:{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {displayName}
                    </span>{" "}
                    {displayEmail && <span className="opacity-75">({displayEmail})</span>}
                  </>
                )}
              </p>

              {/* Progress Summary Pill */}
              <div className="pt-0.5 flex items-center gap-2.5">
                <div className="flex-1 max-w-[180px] h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, stats.completionPercent || 0)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {Math.round(stats.completionPercent || 0)}% Completed
                </span>
              </div>
            </div>

            {/* Right Overall Performance Gauges */}
            <div className="flex flex-col items-start lg:items-end gap-1.5 shrink-0">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Target className="w-3 h-3 text-teal-600" /> Overall Metrics
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <CircularProgressGauge
                  value={stats.averageScore}
                  label="Average"
                  sublabel={`${stats.totalAttempts} ${stats.totalAttempts === 1 ? "try" : "tries"}`}
                  color="#0d9488"
                />
                <CircularProgressGauge
                  value={stats.passRate}
                  label="Pass Rate"
                  sublabel={`${stats.passedCount} passed`}
                  color="#2563eb"
                />
                <CircularProgressGauge
                  value={stats.bestScore}
                  label="Best"
                  sublabel="Personal top"
                  color="#d97706"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STATS METRIC GRID (Compact) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <MetricCard
            icon={<BookOpen className="w-4 h-4" />}
            label="Attempted"
            value={stats.attempted}
            sublabel="Exams"
            accentColor="teal"
          />
          <MetricCard
            icon={<Clock className="w-4 h-4" />}
            label="In Progress"
            value={stats.inProgress}
            sublabel="Active"
            accentColor="blue"
          />
          <MetricCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Completed"
            value={stats.completed}
            sublabel="Finished"
            accentColor="emerald"
          />
          <MetricCard
            icon={<Timer className="w-4 h-4" />}
            label="Time Studied"
            value={stats.totalTimeStudied || "0m"}
            sublabel="Total"
            accentColor="indigo"
          />
          <MetricCard
            icon={<Calendar className="w-4 h-4" />}
            label="Last Attempt"
            value={stats.lastAttemptDate || "None"}
            sublabel="Recent"
            accentColor="slate"
          />
        </div>

        {/* EXAM COVERAGE & PROGRESS ACTIVITY LIST (Compact) */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-4 sm:p-5 shadow-xs space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-teal-600" />
                Exam Coverage &amp; Recent Activity
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Detailed history of your latest quiz attempts and completion scores.
              </p>
            </div>

            {stats.recentActiveExams.length > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60">
                {stats.recentActiveExams.length} {stats.recentActiveExams.length === 1 ? "Exam" : "Exams"} Logged
              </span>
            )}
          </div>

          {/* Exam List or Empty State */}
          {stats.recentActiveExams.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  No Exam Activity Yet
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  You haven&apos;t started any exams yet. Begin a practice or timed exam to track your personal coverage and learning mastery.
                </p>
              </div>
              <Link
                href={`/dashboards/${currentPanel}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <span>Browse Available Exams</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentActiveExams.map((exam) => {
                const isOngoing = exam.status === "InProgress" || exam.score == null;

                return (
                  <div
                    key={exam.id}
                    className="group rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-teal-500/50 hover:shadow-2xs p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all"
                  >
                    {/* Left: Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {exam.title}
                        </span>

                        {exam.subjectName && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-600">
                            {exam.subjectName}
                          </span>
                        )}

                        {isOngoing ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                            In Progress
                          </span>
                        ) : (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              exam.passed
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                            }`}
                          >
                            {exam.passed ? "Passed" : "Not Passed"}
                          </span>
                        )}
                      </div>

                      {/* Meta Subtitle */}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>Attempt {exam.attemptsUsed || 1}</span>
                        <span>•</span>
                        <span>{exam.attemptDate || "Today"}</span>
                        <span>•</span>
                        <span>{exam.timeTaken || "In Progress"}</span>
                      </div>
                    </div>

                    {/* Right: Score + Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <div className="text-right mr-1">
                        <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-semibold">
                          Score
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {exam.score != null ? `${exam.score}%` : "In Progress"}
                        </span>
                      </div>

                      {isOngoing ? (
                        <Link
                          href={`/web/${currentPanel}/vista/exam/generic?mode=Practice&identifier=${exam.guidId || exam.id}`}
                          className="rounded-lg bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resume</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboards/${currentPanel}/vista/assessment/exams/reports/distinct?identifier=${exam.guidId || exam.id}`}
                            className="rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer shadow-2xs"
                          >
                            Report
                          </Link>
                          <Link
                            href={`/web/${currentPanel}/vista/exam/generic?mode=Practice&identifier=${exam.guidId || exam.id}`}
                            className="rounded-lg bg-teal-600 hover:bg-teal-700 px-2.5 py-1.5 text-xs font-semibold text-white transition flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retake</span>
                          </Link>
                        </div>
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
