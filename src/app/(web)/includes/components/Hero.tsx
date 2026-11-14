"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  BookOpen,
  BookOpenCheck,
  TrendingUp,
  BarChart3,
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

const practiceExams = [
  {
    label: "RN Nursing Exams",
    subtitle: "Registered Nurse Q-Bank",
    href: "/dashboards/rn-nursing",
    icon: BookOpenCheck,
    bgClass: "bg-teal/15",
    colorClass: "text-teal-light",
  },
  {
    label: "LPN Nursing Exams",
    subtitle: "Practical Nurse Q-Bank",
    href: "/dashboards/lpn-nursing",
    icon: BookOpenCheck,
    bgClass: "bg-sage/15",
    colorClass: "text-sage-light",
  },
  {
    label: "RN Exit Exams",
    subtitle: "Comprehensive Exit Practice",
    href: "/dashboards/rn-nursing",
    icon: BarChart3,
    bgClass: "bg-coral/15",
    colorClass: "text-coral",
  },
  {
    label: "LPN Exit Exams",
    subtitle: "Practical Nurse Exit Practice",
    href: "/dashboards/lpn-nursing",
    icon: BarChart3,
    bgClass: "bg-coral/15",
    colorClass: "text-coral",
  },
];

const quickLinks = [
  {
    category: "Nursing Q-Bank",
    description: "Comprehensive question banks for nursing students.",
    icon: BookOpen,
    iconBg: "bg-[#E8F1FC] dark:bg-blue-500/20",
    iconColor: "text-[#2B73D6] dark:text-blue-300",
    links: [
      { label: "RN Nursing Exams", href: "/dashboards/rn-nursing" },
      { label: "LPN Nursing Exams", href: "/dashboards/lpn-nursing" },
      { label: "RN Exit Exams", href: "/dashboards/rn-nursing" },
      { label: "LPN Exit Exams", href: "/dashboards/lpn-nursing" },
    ],
  },
  
];

export default function Hero() {
  const [openPracticeDropdown, setOpenPracticeDropdown] = useState(false);
  const [openProgressDropdown, setOpenProgressDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const progressDropdownRef = useRef<HTMLDivElement>(null);

  const { user, authenticated, loading } = useCurrentSystemUser();
  const signedIn = !loading && authenticated && !!user;
  const userName = (user?.userName ?? "").trim();
  const progress = useUserExamProgress();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenPracticeDropdown(false);
      }
      if (progressDropdownRef.current && !progressDropdownRef.current.contains(e.target as Node)) {
        setOpenProgressDropdown(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenPracticeDropdown(false);
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
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 pt-[76px] sm:pt-[84px] md:pt-[92px] pb-12 md:pb-16">
        
        {/* Two-Column on Desktop (lg+), Video-Behind-Text on Mobile (<lg) */}
        <div className="relative overflow-visible rounded-3xl lg:rounded-none p-6 sm:p-10 lg:p-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center mb-14 md:mb-18">
          
          {/* Mobile-Only Background Video (< lg) */}
          <div className="absolute inset-0 z-0 lg:hidden pointer-events-none overflow-hidden rounded-3xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/images/home-bg/home-bg-light.jpg"
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
              {/* Start Free Practice Dropdown */}
              <div className="relative inline-block text-left z-50" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setOpenPracticeDropdown((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm sm:text-base font-semibold bg-[#0A2540] hover:bg-[#06182a] dark:bg-[#1E3A8A] dark:hover:bg-[#1d4ed8] text-white shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  aria-expanded={openPracticeDropdown}
                  aria-haspopup="true"
                >
                  <span>Start Free Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {openPracticeDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border dark:border-white/15 bg-white dark:bg-[#001326] p-2 sm:p-2.5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-[100] animate-in fade-in zoom-in-95 duration-150">
                    <div className="space-y-1">
                      {practiceExams.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href + item.label}
                            href={item.href}
                            onClick={() => setOpenPracticeDropdown(false)}
                            className="flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl hover:bg-[#EEF3FE] dark:hover:bg-white/10 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${item.bgClass} ${item.colorClass} shrink-0 group-hover:scale-105 transition-transform`}
                              >
                                <ItemIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
                              </span>
                              <div className="flex flex-col min-w-0 text-left">
                                <span className="font-semibold text-xs sm:text-sm text-navy dark:text-white truncate">
                                  {item.label}
                                </span>
                                <span className="text-[10px] sm:text-xs text-navy/50 dark:text-white/50 truncate">
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-navy/40 dark:text-white/40 group-hover:text-navy dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

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
                poster="/images/home-bg/home-bg-light.jpg"
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
        <div className="pt-6 sm:pt-10">
          {/* Eyebrow Header Graphic */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-10 sm:w-16 bg-amber-600/40" />
            <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
            <span className="h-px w-10 sm:w-16 bg-amber-600/40" />
          </div>

          {/* Section Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-navy dark:text-white tracking-tight mb-3">
            Your path to nursing success
          </h2>

          {/* Section Subtitle */}
          <p className="text-sm md:text-base text-navy/70 dark:text-white/70 max-w-2xl mx-auto text-center mb-8 sm:mb-10">
            Choose the exam that fits your goals and get the focused practice, study resources, and support you need.
          </p>

          {/* Cards Container: Centered */}
          <div className={`grid gap-6 mx-auto ${quickLinks.length === 1 ? "max-w-xl grid-cols-1" : "max-w-4xl grid-cols-1 md:grid-cols-2"}`}>
            {quickLinks.map((group) => {
              const Icon = group.icon;
              return (
                <div
                  key={group.category}
                  className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <span
                        className={`inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-full ${group.iconBg} ${group.iconColor}`}
                      >
                        <Icon className="w-6 h-6" strokeWidth={1.75} />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-navy dark:text-white leading-tight">
                          {group.category}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy/60 dark:text-white/60 leading-relaxed mt-1">
                          {group.description}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/10 my-4" />
                  </div>

                  <div className="flex flex-col">
                    {group.links.map((link, idx) => (
                      <div key={link.href + link.label}>
                        {idx > 0 && <div className="border-t border-slate-100 dark:border-white/5" />}
                        <Link
                          href={link.href}
                          className="flex items-center justify-between py-3 group hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-navy/90 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {link.label}
                          </span>
                          <ArrowRight
                            className="w-4 h-4 text-navy/40 dark:text-white/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-2"
                            strokeWidth={2}
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Strip */}
          <div className="mt-12 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#2C3749] p-4 sm:p-6 md:p-8 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-border-light mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 md:w-5 md:h-5 text-navy/60 dark:text-white/60">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12.5l2.5 2.5L16 9.5" />
                  </svg>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-navy dark:text-white mb-0.5 leading-tight">
                  High-Quality Questions
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/50 dark:text-white/50">
                  Up-to-date and exam-focused content you can trust.
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-border-light mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 md:w-5 md:h-5 text-navy/60 dark:text-white/60">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-navy dark:text-white mb-0.5 leading-tight">
                  Timed Practice Tests
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/50 dark:text-white/50">
                  Simulate real exam conditions.
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-border-light mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 md:w-5 md:h-5 text-navy/60 dark:text-white/60">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 14v2M12 11v5M15 8v8" />
                  </svg>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-navy dark:text-white mb-0.5 leading-tight">
                  Track Your Progress
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/50 dark:text-white/50">
                  Monitor performance and improve smarter.
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-border-light mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 md:w-5 md:h-5 text-navy/60 dark:text-white/60">
                    <circle cx="12" cy="12" r="9" />
                    <rect x="9.5" y="8" width="5" height="8" rx="1" />
                    <path d="M11.5 14.5h1" />
                  </svg>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-navy dark:text-white mb-0.5 leading-tight">
                  Study Anywhere
                </span>
                <span className="text-[11px] sm:text-xs leading-snug text-navy/50 dark:text-white/50">
                  Access on any device, anytime.
                </span>
              </div>
            </div>
          </div>

          <Stats />

          <div className="mt-14 md:mt-20">
            <PulseLine showWaypoints variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
