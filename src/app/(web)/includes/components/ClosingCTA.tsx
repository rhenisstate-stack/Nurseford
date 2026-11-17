"use client";

import Link from "next/link";
import PulseLine from "./PulseLine";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ClosingCTA() {
  return (
    <section className="py-8 md:py-10" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        <PulseLine variant="divider" className="mb-6 sm:mb-8" />

        <div className="max-w-4xl mx-auto rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#F5F9FF] via-white to-[#ECF4FF] dark:bg-none dark:bg-[#15273e] p-6 sm:p-8 md:p-10 text-center shadow-lg relative overflow-hidden">
          {/* Subtle background ambient orb */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-coral/10 blur-3xl pointer-events-none" />

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-coral/30 bg-coral/10 text-[#ea580c] dark:text-[#ff8a65] text-xs font-mono font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Begin?</span>
          </div>

          {/* Headline */}
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-navy dark:text-white tracking-tight leading-tight mb-4">
            Your Nursing Career Starts Here
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-navy/70 dark:text-white/70 leading-relaxed max-w-xl mx-auto mb-8">
            Join thousands of nursing students preparing for their exams with Nurseford.
            Start with a free account — no credit card required.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold border border-[#ff6b35]/80 dark:border-[#ff6b35]/60 bg-[#ff6b35]/15 dark:bg-[#ff6b35]/20 hover:bg-[#ff6b35]/25 dark:hover:bg-[#ff6b35]/30 text-[#ea580c] dark:text-[#ff8a65] shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#exams"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-bold border border-slate-300 dark:border-white/20 bg-white/80 dark:bg-white/10 hover:border-teal-500/60 hover:text-teal-700 dark:hover:text-[#2FD9C4] text-slate-700 dark:text-slate-100 shadow-xs active:scale-[0.98] transition-all duration-200"
            >
              Explore 4 Exam Tracks
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs font-medium text-navy/60 dark:text-white/60 pt-2 border-t border-slate-200/60 dark:border-white/10">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>No Credit Card Required</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Instant Dashboard Access</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-[#2FD9C4]" />
              <span>Verified NCLEX &amp; Exit Standards</span>
            </span>
          </div>
        </div>

        <PulseLine variant="divider" className="mt-10 sm:mt-14" />
      </div>
    </section>
  );
}
