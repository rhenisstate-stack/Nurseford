"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import type { SampleQuestion } from "@/lib/data/sample-questions";

export default function SampleQuestionCard({
  item,
  index,
  selectedAnswer,
  onSelectAnswer,
}: {
  item: SampleQuestion;
  index: number;
  selectedAnswer?: number | null;
  onSelectAnswer?: (idx: number) => void;
}) {
  const [internalSelected, setInternalSelected] = useState<number | null>(null);

  const selected = selectedAnswer !== undefined ? selectedAnswer : internalSelected;
  const answered = selected !== null;

  const handleSelect = (idx: number) => {
    if (onSelectAnswer) {
      onSelectAnswer(idx);
    } else {
      setInternalSelected(idx);
    }
  };

  const difficultyColors = {
    Easy: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-500/30",
    Hard: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-500/30",
  };

  return (
    <article className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-xs transition-all">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-500/20 px-2.5 py-0.5 text-teal-800 dark:text-[#2FD9C4] font-bold">
            Question {index + 1}
          </span>
          <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-slate-700 dark:text-slate-300">
            {item.track}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {item.subject}
          </span>
        </div>

        {item.difficulty && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              difficultyColors[item.difficulty] || difficultyColors.Medium
            }`}
          >
            {item.difficulty}
          </span>
        )}
      </div>

      <h3 className="text-base sm:text-[17px] font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
        {item.question}
      </h3>

      <div className="space-y-2.5">
        {item.options.map((opt, idx) => {
          const isCorrect = idx === item.correctIndex;
          const isSelected = idx === selected;

          let style =
            "border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 hover:border-teal-500/60 hover:bg-teal-50/20 dark:hover:bg-slate-800";
          
          if (answered && isCorrect) {
            style =
              "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/30";
          } else if (answered && isSelected && !isCorrect) {
            style =
              "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500/30";
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all flex items-start gap-3 cursor-pointer ${style}`}
            >
              <span className="font-mono font-bold shrink-0 mt-0.5">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span className="flex-1">{opt}</span>

              {answered && isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              {answered && isSelected && !isCorrect && (
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Native <details> ensures rich snippet text and clinical rationale remain in SSR HTML */}
      <details
        open={answered}
        className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 transition-all"
      >
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 select-none flex items-center justify-between">
          <span>Answer &amp; Clinical Rationale</span>
          <span className="text-[11px] font-normal normal-case text-slate-400">
            {answered ? "Detailed rationale" : "Click to reveal answer"}
          </span>
        </summary>
        <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
          <p>
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
              Correct Answer: {String.fromCharCode(65 + item.correctIndex)}
            </strong>{" "}
            — {item.options[item.correctIndex]}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {item.rationale}
          </p>
        </div>
      </details>
    </article>
  );
}
