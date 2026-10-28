"use client";

import Link from "next/link";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { APP_TITLE } from "@/lib/config/config";
import {
  Target,
  Compass,
  Heart,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const CURRENT_PANEL = "rn-nursing";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: Target,
    title: "Focused Prep",
    description:
      "Every resource is built around real exam blueprints, so your study time actually maps to what you'll be tested on.",
  },
  {
    icon: ShieldCheck,
    title: "Trustworthy Content",
    description:
      "Notes, questions, and exams are reviewed for accuracy so you can study with confidence, not second-guessing.",
  },
  {
    icon: Heart,
    title: "Student First",
    description:
      "We build for the nursing student juggling shifts, clinicals, and life — not just for a checklist of features.",
  },
  {
    icon: Sparkles,
    title: "Always Improving",
    description:
      "The platform evolves with feedback from real students and educators, one release at a time.",
  },
];

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function AboutUsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

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
      <div className="p-3 md:p-4 space-y-6 w-full max-w-7xl mx-auto">

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--text-color)]/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl px-6 py-3 md:px-10 md:py-3 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 mb-4">
            <Compass className="w-6 h-6 text-indigo-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-color)]">
            About {APP_TITLE}
          </h1>
          <p className="mt-3 text-sm md:text-base opacity-70 text-[var(--text-color)] max-w-2xl mx-auto">
            We&apos;re building the study companion we wished existed — a single
            place for nursing students to learn, practice, and walk into exam
            day prepared. ⚓
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Story */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-6 py-6 md:px-8 md:py-7 space-y-3">
          <h2 className="text-lg font-bold text-[var(--text-color)]">Our Story</h2>
          <p className="text-sm leading-relaxed opacity-75 text-[var(--text-color)]">
            {APP_TITLE} started with a simple frustration: nursing exam prep
            was scattered across a dozen apps, PDFs, and outdated question
            banks. We set out to bring notes, resource categories, practice
            exams, and progress tracking into one focused workspace — built
            for TEAS 7 Prep, HESI A2, RN, LPN, and beyond.
          </p>
          <p className="text-sm leading-relaxed opacity-75 text-[var(--text-color)]">
            Today, that same idea drives everything we ship: less friction,
            more clarity, and content you can actually trust when it matters
            most.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Values Grid */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-color)] mb-3">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-5 py-5 space-y-2 hover:shadow-md hover:border-[var(--text-color)]/30 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-indigo-500" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text-color)]">
                    {value.title}
                  </h3>
                  <p className="text-xs opacity-65 text-[var(--text-color)] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Team blurb */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-color)]">
                Built by a small, focused team
              </h3>
              <p className="text-xs opacity-65 text-[var(--text-color)]">
                We read every piece of feedback that comes through.
              </p>
            </div>
          </div>

          <Link
            href={`/dashboards/${CURRENT_PANEL}/vista/pages/contact-us`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform duration-200 shrink-0"
          >
            Get in Touch
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────