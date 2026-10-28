"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, X, ShieldAlert } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  examTitle: string;
  totalQuestions: number;
  allowedQuestions: number;
  programSlug?: string;
}

export function ExamSubscriptionPaywallModal({
  open,
  onClose,
  examTitle,
  totalQuestions,
  allowedQuestions,
  programSlug = "rn-nursing",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const remainingQuestions = Math.max(0, totalQuestions - allowedQuestions);

  return (
    <div
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-[#0c1929] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} className="fill-amber-300" />
            <span>30% Free Preview Limit Reached</span>
          </div>

          <h2 className="text-lg font-bold leading-tight">
            Unlock Full Exam &amp; All Rationales
          </h2>
          <p className="text-xs text-blue-100 mt-1 line-clamp-1">
            {examTitle || "Exam Practice Session"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-700 dark:text-slate-200">
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-slate-900 dark:text-white">
                You&apos;ve completed {allowedQuestions} of {totalQuestions} questions (30% preview)
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">
                Subscribe now to unlock the remaining {remainingQuestions} questions, in-depth clinical rationales, and complete answers.
              </p>
            </div>
          </div>

          {/* Benefits list */}
          <div className="space-y-2 pt-1 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>Full access to all <strong>{totalQuestions} questions</strong> in this exam</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>Next-Gen clinical judgment exhibits &amp; case studies</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>Unlimited Computer Adaptive Testing (CAT) mock exams</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 space-y-2">
            <Link
              href={`/dashboards/${programSlug}/vista/subscriptions/items`}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-center"
            >
              <span>View Subscription Plans</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl border border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer text-center"
            >
              Review Completed Questions (1–{allowedQuestions})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamSubscriptionPaywallModal;
