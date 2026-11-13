"use client";

import { useState } from "react";
import type { SampleQuestion } from "@/lib/data/sample-questions";

export default function SampleQuestionCard({
  item,
  index,
}: {
  item: SampleQuestion;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <article className="rounded-2xl border border-black/15 dark:border-white/10 bg-paper p-6 shadow-xs">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-coral/15 px-2.5 py-0.5 text-coral">
          Question {index + 1}
        </span>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-navy/70">
          {item.track}
        </span>
        <span className="text-navy/60">{item.subject}</span>
      </div>

      <h2 className="text-base md:text-lg font-semibold text-navy leading-snug mb-4">
        {item.question}
      </h2>

      <div className="space-y-2">
        {item.options.map((opt, idx) => {
          const isCorrect = idx === item.correctIndex;
          const isSelected = idx === selected;

          let style =
            "border-border bg-transparent text-navy hover:border-coral/60";
          if (answered && isCorrect) {
            style =
              "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
          } else if (answered && isSelected && !isCorrect) {
            style =
              "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(idx)}
              className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm transition ${style}`}
            >
              <span className="font-mono font-bold mr-2">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Native <details> keeps the rationale in initial SSR HTML for SEO */}
      <details
        open={answered}
        className="mt-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] p-4"
      >
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-navy/70 select-none">
          Answer &amp; Clinical Rationale
        </summary>
        <p className="mt-2 text-sm text-navy/80 leading-relaxed">
          <strong className="text-emerald-600 dark:text-emerald-400">
            Correct Answer: {String.fromCharCode(65 + item.correctIndex)}
          </strong>{" "}
          — {item.rationale}
        </p>
      </details>
    </article>
  );
}
