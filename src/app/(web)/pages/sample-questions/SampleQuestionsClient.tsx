"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { SampleQuestion } from "@/lib/data/sample-questions";
import SampleQuestionCard from "./SampleQuestionCard";

export default function SampleQuestionsClient({
  questions,
}: {
  questions: SampleQuestion[];
}) {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  const trackOptions = ["all", "RN Nursing", "LPN Nursing", "Exit Exam"];

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (selectedTrack === "all" || q.track === selectedTrack) {
        set.add(q.subject);
      }
    });
    return ["all", ...Array.from(set).sort()];
  }, [questions, selectedTrack]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedTrack !== "all" && q.track !== selectedTrack) return false;
      if (selectedSubject !== "all" && q.subject !== selectedSubject) return false;
      return true;
    });
  }, [questions, selectedTrack, selectedSubject]);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const resetAllAnswers = () => {
    setUserAnswers({});
  };

  // Score statistics
  const totalQuestions = questions.length;
  const answeredIds = Object.keys(userAnswers);
  const totalAnswered = answeredIds.length;
  const correctCount = answeredIds.reduce((count, qId) => {
    const q = questions.find((item) => item.id === qId);
    if (q && userAnswers[qId] === q.correctIndex) {
      return count + 1;
    }
    return count;
  }, 0);

  const scorePercentage =
    totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ─── Control Bar: Filters & Live Score Counter ─── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15273e] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Track Selection Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <span>Track:</span>
            </span>
            {trackOptions.map((trk) => {
              const label =
                trk === "all"
                  ? `All Tracks (${questions.length})`
                  : trk === "Exit Exam"
                  ? `Exit Exams (${questions.filter((q) => q.track === "Exit Exam").length})`
                  : `${trk} (${questions.filter((q) => q.track === trk).length})`;
              const isActive = selectedTrack === trk;
              return (
                <button
                  key={trk}
                  type="button"
                  onClick={() => {
                    setSelectedTrack(trk);
                    setSelectedSubject("all");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                    isActive
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Subject:
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer appearance-none focus:outline-none max-w-[190px] truncate shadow-2xs"
            >
              <option value="all">All Subjects</option>
              {availableSubjects
                .filter((s) => s !== "all")
                .map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Live Score & Practice Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Showing:{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                {filteredQuestions.length}
              </strong>{" "}
              questions
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Answered:{" "}
              <strong className="text-slate-900 dark:text-white font-bold">
                {totalAnswered} / {totalQuestions}
              </strong>
            </span>
            {totalAnswered > 0 && (
              <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Score: {correctCount} / {totalAnswered} ({scorePercentage}%)
                </span>
              </span>
            )}
          </div>

          {totalAnswered > 0 && (
            <button
              type="button"
              onClick={resetAllAnswers}
              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Answers</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Question Cards List ─── */}
      <div className="space-y-5">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            No questions match the current filters.
          </div>
        ) : (
          filteredQuestions.map((item, idx) => (
            <SampleQuestionCard
              key={item.id}
              item={item}
              index={idx}
              selectedAnswer={userAnswers[item.id] ?? null}
              onSelectAnswer={(optIdx) => handleSelectAnswer(item.id, optIdx)}
            />
          ))
        )}
      </div>

      {/* ─── Full Practice Call To Action ─── */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-50/50 via-teal-500/5 to-emerald-500/10 dark:from-[#0E2838] dark:to-[#0A2234] p-6 sm:p-8 text-center shadow-xs">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-800 dark:text-[#2FD9C4] bg-teal-100/70 dark:bg-teal-950/80 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full Board-Standard Preparation</span>
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Ready for Comprehensive Practice Exams?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-6">
          Practice thousands of board-style questions across RN Nursing, LPN Nursing, and Exit Exam simulations with next-generation clinical judgment rationales, timed testing, and performance analytics.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboards/rn-nursing"
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition"
          >
            Launch RN Dashboard
          </Link>
          <Link
            href="/dashboards/lpn-nursing"
            className="rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm px-5 py-2.5 shadow-2xs transition"
          >
            Launch LPN Dashboard
          </Link>
          <Link
            href="/dashboards/rn-nursing/vista/subscriptions/items"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition"
          >
            Explore Subscription Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
