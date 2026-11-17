"use client";

import Link from "next/link";
import {
  Compass,
  BookOpenCheck,
  PlayCircle,
  BarChart3,
  Trophy,
  ArrowRight,
  Route,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Assess Your Needs",
    description:
      "We begin by understanding your specific goals and knowledge level, tailoring resources for RN Nursing, LPN Nursing, and RN/LPN Exit Exams.",
    icon: Compass,
    accentColor: "teal",
    badgeBg: "bg-teal-500/15 text-teal-700 dark:text-[#2FD9C4] border-teal-500/30",
    link: undefined,
  },
  {
    number: "02",
    title: "Choose the Right Materials",
    description:
      "Select from our extensive library of practice exams, study notes, and guides covering RN & LPN core courses, Exit Exams, and Capstone reviews across Med-Surg, Pediatrics, Pharmacology, and much more.",
    icon: BookOpenCheck,
    accentColor: "blue",
    badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    link: {
      label: "View Subscription Plans",
      href: "/dashboards/rn-nursing/vista/subscriptions/items",
    },
  },
  {
    number: "03",
    title: "Practice and Review",
    description:
      "Test yourself with our realistic practice exams, and review detailed explanations to improve and gain confidence.",
    icon: PlayCircle,
    accentColor: "coral",
    badgeBg: "bg-[#ff6b35]/15 text-[#ea580c] dark:text-[#ff8a65] border-[#ff6b35]/30",
    link: {
      label: "Take a Free Practice Test",
      href: "/dashboards/rn-nursing",
    },
  },
  {
    number: "04",
    title: "Track Your Progress",
    description:
      "Monitor improvements with performance tracking, helping you know when you're ready for the actual exams.",
    icon: BarChart3,
    accentColor: "emerald",
    badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    link: {
      label: "Access Your Dashboard",
      href: "/dashboards/rn-nursing",
    },
  },
  {
    number: "05",
    title: "Ace Your Exams",
    description:
      "With proper preparation, ace your exams and move closer to your nursing career goals. We're with you all the way!",
    icon: Trophy,
    accentColor: "amber",
    badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    link: undefined,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-8 md:py-10" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-[#2FD9C4] text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <Route className="w-3.5 h-3.5" />
            <span>How We Help You Succeed</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-navy dark:text-white tracking-tight leading-tight">
            From Fundamentals to Exit Exams
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-navy/65 dark:text-white/65 leading-relaxed">
            A proven five-step path that takes you from baseline to exam day with confidence.
          </p>
        </div>

        {/* Steps Grid / Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;
            return (
              <div
                key={step.number}
                className={`relative rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
                  isLast ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div>
                  {/* Top Row: Step Number + Icon Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-navy/20 dark:text-white/20 group-hover:text-teal-600/40 dark:group-hover:text-teal-400/40 transition-colors">
                      {step.number}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl border ${step.badgeBg} group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-serif text-xl font-bold text-navy dark:text-white mb-2 leading-snug">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-navy/65 dark:text-white/65 leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                {/* Optional Action Link or Milestone Tag */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 mt-2">
                  {step.link ? (
                    <Link
                      href={step.link.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-[#2FD9C4] hover:underline group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>{step.link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-navy/40 dark:text-white/40">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{step.number === "01" ? "Initial Assessment" : "Goal Achieved"}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
