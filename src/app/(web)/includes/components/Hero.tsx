"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Clock,
  Smartphone,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  User,
} from "lucide-react";
import PulseLine from "./PulseLine";
import Stats from "./Stats";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useUserExamProgress } from "@/lib/hooks/nexus/strata/assessment/progress/useUserExamProgress";
import UserAccountDropdown from "@/components/common/user/UserAccountDropdown";

const pathButtons = [
  { label: "RN Nursing Exams", href: "/dashboards/rn-nursing" },
  { label: "LPN Nursing Exams", href: "/dashboards/lpn-nursing" },
  { label: "RN Exit Exams", href: "/dashboards/rn-nursing?track=exit" },
  { label: "LPN Exit Exams", href: "/dashboards/lpn-nursing?track=exit" },
];

export default function Hero() {
  const [openProgressDropdown, setOpenProgressDropdown] = useState(false);
  const progressDropdownRef = useRef<HTMLDivElement>(null);

  const { user, authenticated, loading } = useCurrentSystemUser();
  const signedIn = !loading && authenticated && !!user;
  const userName = (user?.userName ?? "").trim();
  const progress = useUserExamProgress();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (progressDropdownRef.current && !progressDropdownRef.current.contains(e.target as Node)) {
        setOpenProgressDropdown(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenProgressDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 pt-[76px] sm:pt-[84px] md:pt-[92px] pb-4 sm:pb-6">
        
        {/* Two-Column on Desktop (lg+), Video-Behind-Text on Mobile (<lg) */}
        <div className="relative overflow-visible rounded-3xl lg:rounded-none p-6 sm:p-10 lg:p-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center mb-6 sm:mb-8 md:mb-10">
          
          {/* Mobile-Only Background Video (< lg) */}
          <div className="absolute inset-0 z-0 lg:hidden pointer-events-none overflow-hidden rounded-3xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center scale-105"
            >
              <source src="/images/home-bg/vid_hp/gemini_generated_video_4a7f1909.mp4" type="video/mp4" />
              <source src="/videos/hero-books.mp4" type="video/mp4" />
            </video>

            {/* Readability Frost Overlay for Mobile (reduced opacity by 10% to reveal video) */}
            <div className="absolute inset-0 bg-white/75 dark:bg-[#0b1329]/80 backdrop-blur-[1.5px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-white/60 dark:from-[#0b1329]/85 dark:via-transparent dark:to-[#0b1329]/60" />
          </div>

          {/* Left Column (Text & CTAs) */}
          <div className="relative z-10 lg:col-span-7 xl:col-span-6 text-left">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <span className="w-8 h-[2px] bg-amber-600/70 dark:bg-amber-400/70" />
              <span className="font-mono text-xs font-bold tracking-widest uppercase text-teal-700 dark:text-teal-300">
                NURSING EXAM PREPARATION
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-2xl sm:text-2xl md:text-3xl lg:text-[1rem] xl:text-[2.45rem] font-semibold leading-[1.15] tracking-tight text-navy dark:text-white mb-4 sm:mb-5">
              Prepare with confidence<span className="text-amber-500 font-normal">.</span>
              <br />
              Begin your nursing career<span className="text-amber-500 font-normal">.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-navy/70 dark:text-white/70 font-normal leading-relaxed max-w-xl mb-6 sm:mb-8">
              Expertly curated question banks, study notes, and practice tests for every stage of your nursing journey.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Start Free Practice - Direct Link to Courses Page */}
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm sm:text-base font-semibold bg-[#0A2540] hover:bg-[#06182a] dark:bg-[#1E3A8A] dark:hover:bg-[#1d4ed8] text-white shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <span>Start Free Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Track My Progress Dropdown */}
              <div className="relative inline-block text-left z-40" ref={progressDropdownRef}>
                <button
                  type="button"
                  onClick={() => setOpenProgressDropdown((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm sm:text-base font-semibold border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-navy dark:text-white shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  aria-expanded={openProgressDropdown}
                  aria-haspopup="true"
                >
                  <span>Track My Progress</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {openProgressDropdown && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-border dark:border-white/15 bg-white dark:bg-[#001326] p-4 sm:p-5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10 mb-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-navy dark:text-white block leading-tight">
                            {signedIn ? userName || "Student" : "Guest Mode"}
                          </span>
                          <span className="text-[10px] text-navy/50 dark:text-white/50">
                            {signedIn ? "Live Session Progress" : "Local Browser Storage"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Real-Time
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-3.5">
                      <div className="rounded-xl bg-blue-500/10 dark:bg-blue-500/15 p-2.5">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300 block">
                          Total Exams
                        </span>
                        <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                          {progress.totalExams}
                        </span>
                      </div>
                      <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 p-2.5">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300 block">
                          Completed
                        </span>
                        <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                          {progress.completed}
                        </span>
                      </div>
                      <div className="rounded-xl bg-purple-500/10 dark:bg-purple-500/15 p-2.5">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-purple-700 dark:text-purple-300 block">
                          Coverage
                        </span>
                        <span className="text-base font-bold text-purple-700 dark:text-purple-300">
                          {progress.coveragePercent}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-navy/70 dark:text-white/70 mb-1">
                          <span>Question Coverage</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {progress.coveragePercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progress.coveragePercent))}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-navy/70 dark:text-white/70 mb-1">
                          <span>Exam Completion</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {progress.completionPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progress.completionPercent))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/dashboards/rn-nursing/vista/stats/progress"
                      onClick={() => setOpenProgressDropdown(false)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-600/40 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98]"
                    >
                      <span>View Full Progress Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Video Card (>= lg) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6 relative z-10">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-lg bg-slate-900 group">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700 group-hover:scale-105"
              >
                <source src="/images/home-bg/vid_hp/gemini_generated_video_4a7f1909.mp4" type="video/mp4" />
                <source src="/videos/hero-books.mp4" type="video/mp4" />
              </video>

              {/* Subtle ambient gradient overlay for clinical depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Section Below Hero: Your path to nursing success */}
        <div className="pt-1 sm:pt-2">
          {/* Eyebrow Header Graphic */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-px w-8 sm:w-12 bg-amber-600/40" />
            <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            <span className="h-px w-8 sm:w-12 bg-amber-600/40" />
          </div>

          {/* Section Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-navy dark:text-white tracking-tight mb-2">
            Your path to nursing success
          </h2>

          {/* Section Subtitle */}
          <p className="text-sm md:text-base text-navy/70 dark:text-white/70 max-w-2xl mx-auto text-center mb-4 sm:mb-5">
            Choose the exam that fits your goals and get the focused practice, study resources, and support you need.
          </p>

          {/* Horizontal Buttons: Each as a standalone button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-3.5 max-w-5xl mx-auto w-full">
            {pathButtons.map((btn) => (
              <Link
                key={btn.label}
                href={btn.href}
                className="group flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] shadow-2xs hover:shadow-md hover:border-teal-500/70 dark:hover:border-teal-400/60 active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <span className="text-xs sm:text-[13px] font-bold tracking-wider uppercase text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                  {btn.label}
                </span>
                <ArrowRight
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0 ml-1.5"
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>

          {/* Feature Strip */}
          <div className="mt-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-5 sm:p-7 md:p-8 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
              <div className="flex flex-col items-center text-center group">
                <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 mb-2.5 group-hover:scale-105 transition-transform duration-200">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-navy dark:text-white mb-0.5 leading-tight">
                  Exam-Caliber Questions
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/60 dark:text-white/60">
                  Current, board-standard practice with deep clinical rationales.
                </span>
              </div>
              <div className="flex flex-col items-center text-center group">
                <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 mb-2.5 group-hover:scale-105 transition-transform duration-200">
                  <Clock className="w-5 h-5" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-navy dark:text-white mb-0.5 leading-tight">
                  Authentic Test Simulation
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/60 dark:text-white/60">
                  Build pacing and endurance under realistic testing conditions.
                </span>
              </div>
              <div className="flex flex-col items-center text-center group">
                <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-coral/10 dark:bg-coral/15 border border-coral/30 text-[#ff6b35] dark:text-[#ff8a65] mb-2.5 group-hover:scale-105 transition-transform duration-200">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-navy dark:text-white mb-0.5 leading-tight">
                  Live Score Diagnostics
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/60 dark:text-white/60">
                  Pinpoint weak clinical areas and target score growth faster.
                </span>
              </div>
              <div className="flex flex-col items-center text-center group">
                <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-2.5 group-hover:scale-105 transition-transform duration-200">
                  <Smartphone className="w-5 h-5" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-navy dark:text-white mb-0.5 leading-tight">
                  Study On Any Device
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/60 dark:text-white/60">
                  Seamless responsive access on mobile, tablet, and desktop.
                </span>
              </div>
            </div>
          </div>

          <Stats />

          <div className="mt-8 sm:mt-10">
            <PulseLine showWaypoints variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
