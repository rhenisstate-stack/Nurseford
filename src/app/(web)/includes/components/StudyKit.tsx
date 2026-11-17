"use client";

import Link from "next/link";
import {
  Zap,
  FileText,
  ArrowRight,
  Sparkles,
  BookMarked,
  CheckCircle2,
  Layers,
  RotateCw,
} from "lucide-react";

const subjects = [
  "Adult Health",
  "Child Health",
  "Med-Surg",
  "Fundamentals",
  "Pharmacology",
  "Maternal & Newborn",
  "Mental Health",
  "Critical Care",
  "Nutrition",
];

export default function StudyKit() {
  return (
    <section id="study-kit" className="py-8 md:py-10" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-coral/30 bg-coral/10 text-coral text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Nurseford Study Kit</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-navy dark:text-white tracking-tight leading-tight">
            FlashCards &amp; Study Notes
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-navy/65 dark:text-white/65 leading-relaxed">
            Two powerful study tools designed to help you retain more and study smarter across every nursing exam track.
          </p>
        </div>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-6">
          {/* Card 1: FlashCards */}
          <article className="rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 hover:border-coral/70 dark:hover:border-coral/60 bg-white dark:bg-[#1E293B] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div>
              {/* Header Icon + Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-coral/15 text-[#ea580c] dark:text-[#ff8a65] border border-coral/30">
                  <Zap className="w-6 h-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-coral/10 text-[#ea580c] dark:text-[#ff8a65] border border-coral/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Quick Recall</span>
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-navy dark:text-white mb-2 leading-snug">
                Interactive FlashCards
              </h3>

              <p className="text-xs sm:text-sm text-navy/65 dark:text-white/65 leading-relaxed mb-6">
                Short, high-impact clinical flashcards for RN Nursing, LPN Nursing, and Exit Exams — engineered for active recall, memory reinforcement, and quick drills between clinicals.
              </p>

              {/* Interactive Visual Preview Box */}
              <div className="rounded-xl border border-coral/30 bg-coral/5 dark:bg-coral/10 p-4 mb-6">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wide text-coral mb-2">
                  <span>Sample Recall Card</span>
                  <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <p className="text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Q: What are the cardinal signs of Digoxin Toxicity?
                </p>
                <p className="text-[11px] text-navy/70 dark:text-white/70 italic border-l-2 border-coral pl-2 mt-1">
                  A: Visual yellow-green halos, nausea/vomiting, and bradycardia. Always check apical pulse first!
                </p>
              </div>

              {/* Feature Highlights */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs text-navy/80 dark:text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-coral shrink-0" />
                  <span>Spaced-repetition drills for high-yield retention</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-navy/80 dark:text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-coral shrink-0" />
                  <span>100% mobile-friendly for studying on the go</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/10">
              <Link
                href="/auth/register"
                className="w-full inline-flex items-center justify-between px-5 py-3 rounded-xl font-bold text-xs sm:text-sm border border-[#ff6b35]/60 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 text-[#ea580c] dark:text-[#ff8a65] shadow-2xs active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>Start Free FlashCards</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>

          {/* Card 2: Study Notes */}
          <article className="rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 hover:border-blue-500/70 dark:hover:border-blue-400/60 bg-white dark:bg-[#1E293B] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div>
              {/* Header Icon + Badge */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                  <FileText className="w-6 h-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  <Layers className="w-3 h-3" />
                  <span>In-Depth Review</span>
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-navy dark:text-white mb-2 leading-snug">
                Clinical Study Notes
              </h3>

              <p className="text-xs sm:text-sm text-navy/65 dark:text-white/65 leading-relaxed mb-6">
                Detailed, organized, and curriculum-aligned notes covering RN, LPN, and Exit Exam topics — written by experienced nursing faculty for deep-dive concept mastery.
              </p>

              {/* Interactive Visual Preview Box */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 p-4 mb-6">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2">
                  <span>Structured Notes Outline</span>
                  <BookMarked className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Cardiac Assessment &amp; EKG Essentials
                </p>
                <p className="text-[11px] text-navy/70 dark:text-white/70 italic border-l-2 border-blue-500 pl-2 mt-1">
                  Clear step-by-step interpretation of sinus rhythm, arrhythmias, emergency pharmacology, and nursing priority interventions.
                </p>
              </div>

              {/* Feature Highlights */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs text-navy/80 dark:text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>High-yield summary tables and pathophysiology charts</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-navy/80 dark:text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Aligned with the latest NCLEX and Exit test blueprints</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/10">
              <Link
                href="/auth/register"
                className="w-full inline-flex items-center justify-between px-5 py-3 rounded-xl font-bold text-xs sm:text-sm border border-blue-600/60 bg-blue-600/10 hover:bg-blue-600/20 text-blue-800 dark:text-blue-300 shadow-2xs active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>Access Free Study Notes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>
        </div>

        {/* Subjects Cloud */}
        <div className="max-w-4xl mx-auto text-center pt-2">
          <p className="text-xs font-mono uppercase tracking-widest text-navy/50 dark:text-white/50 mb-3">
            Covering All Core Nursing Specialties
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {subjects.map((subj) => (
              <span
                key={subj}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-white/10 text-navy/70 dark:text-white/70 border border-slate-200 dark:border-white/10 shadow-2xs hover:border-teal-500/50 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                {subj}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
