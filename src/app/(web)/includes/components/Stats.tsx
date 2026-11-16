"use client";

import { Users, Award, BookOpen, FileCheck } from "lucide-react";

const stats = [
  {
    value: "31,000+",
    label: "Empowered Students",
    subtext: "Active learners nationwide",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    border: "border-blue-500/20",
  },
  {
    value: "94%",
    label: "Verified Pass Rate",
    subtext: "Proven first-attempt success",
    icon: Award,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/20",
  },
  {
    value: "Flash Cards",
    label: "Rapid Concept Recall",
    subtext: "High-yield clinical drills",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/20",
  },
  {
    value: "Free Notes",
    label: "Essential Study Guides",
    subtext: "Quick-reference summaries",
    icon: FileCheck,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10 dark:bg-teal-500/15",
    border: "border-teal-500/20",
  },
];

const trackItems = [...stats, ...stats];

export default function Stats() {
  return (
    <section className="relative mt-8 sm:mt-10 overflow-hidden py-2">
      <style>{`
        @keyframes scrollCards {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll-cards {
          animation: scrollCards 32s linear infinite;
        }
        .group:hover .animate-scroll-cards {
          animation-play-state: paused;
        }
      `}</style>

      {/* Gradient edge fades for smooth entry and exit */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[var(--content-bg,#ffffff)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[var(--content-bg,#ffffff)] to-transparent" />

      <div className="group flex w-max">
        {/* Track 1 */}
        <div className="flex gap-4 pr-4 shrink-0 animate-scroll-cards">
          {trackItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={`track1-${i}`}
                className={`w-[240px] sm:w-[270px] shrink-0 rounded-2xl border ${stat.border} dark:border-slate-700/80 bg-white dark:bg-[#1E293B] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 select-none`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#ff6b35] dark:text-[#ff8a65]">
                    {stat.value}
                  </span>
                  <span className={`p-2 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-navy dark:text-white leading-snug">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-navy/60 dark:text-white/60 mt-0.5 leading-tight">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Track 2 (Duplicate for seamless continuous loop) */}
        <div className="flex gap-4 pr-4 shrink-0 animate-scroll-cards" aria-hidden="true">
          {trackItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={`track2-${i}`}
                className={`w-[240px] sm:w-[270px] shrink-0 rounded-2xl border ${stat.border} dark:border-slate-700/80 bg-white dark:bg-[#1E293B] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 select-none`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#ff6b35] dark:text-[#ff8a65]">
                    {stat.value}
                  </span>
                  <span className={`p-2 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-navy dark:text-white leading-snug">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-navy/60 dark:text-white/60 mt-0.5 leading-tight">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
