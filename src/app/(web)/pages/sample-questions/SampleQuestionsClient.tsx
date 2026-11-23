"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
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
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

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
      {/* ─── Control Bar: Live Score & Practice Stats ─── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15273e] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Total Questions:{" "}
            <strong className="text-slate-900 dark:text-white font-bold">
              {totalQuestions}
            </strong>
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

      {/* ─── Question Cards List ─── */}
      <div className="space-y-5">
        {questions.map((item, idx) => (
          <SampleQuestionCard
            key={item.id}
            item={item}
            index={idx}
            selectedAnswer={userAnswers[item.id] ?? null}
            onSelectAnswer={(optIdx) => handleSelectAnswer(item.id, optIdx)}
          />
        ))}
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
            Start RN Practice
          </Link>
          <Link
            href="/dashboards/lpn-nursing"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition"
          >
            Start LPN Practice
          </Link>
          <Link
            href="/subjects"
            className="rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm px-5 py-2.5 transition flex items-center gap-1.5"
          >
            <span>Explore All Subjects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
