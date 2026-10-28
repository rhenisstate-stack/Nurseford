"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  BookOpen,
  BookOpenCheck,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  ChevronRight,
  ChevronDown,
  User,
  Calendar,
} from "lucide-react";
import PulseLine from "./PulseLine";
import Stats from "./Stats";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useUserExamProgress } from "@/lib/hooks/nexus/strata/assessment/progress/useUserExamProgress";
import { getPreviousDayFormatted } from "@/lib/utils/exams/examDateUtils";
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
    subtitle: "ATI & HESI Exit Exams",
    href: "/dashboards/rn-nursing/exams/exit-ati-exams-rn/36",
    icon: TrendingUp,
    bgClass: "bg-coral/15",
    colorClass: "text-coral",
  },
  {
    label: "LPN Exit Exams",
    subtitle: "ATI & HESI Exit Exams",
    href: "/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23",
    icon: BarChart3,
    bgClass: "bg-blue/15",
    colorClass: "text-blue-light",
  },
];

const quickLinks = [
  {
    category: "RN / LPN Nursing & Exit Exams",
    description: "Comprehensive question banks and exit exam assessments for RN & LPN nursing students.",
    icon: BookOpen,
    iconBg: "bg-sage/15",
    iconColor: "text-sage-light",
    accentColor: "text-sage-light",
    accentBg: "bg-sage-light",
    links: [
      { label: "RN Nursing Exams", href: "/dashboards/rn-nursing", linkIcon: BookOpenCheck },
      { label: "LPN Nursing Exams", href: "/dashboards/lpn-nursing", linkIcon: BookOpenCheck },
      { label: "RN Exit Exams", href: "/dashboards/rn-nursing/exams/exit-ati-exams-rn/36", linkIcon: TrendingUp },
      { label: "LPN Exit Exams", href: "/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23", linkIcon: BarChart3 },
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
    <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--content-bg)' }}>

      {/* Mobile-only decorative stethoscope */}
      {/* <Image
        src="/stethoscope.jpg"
        alt=""
        width={300}
        height={400}
        className="absolute top-8 -right-10 w-[200px] md:hidden object-contain opacity-[0.15] pointer-events-none mix-blend-multiply"
      /> */}
      <div className="mx-auto w-full max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 pt-[68px] sm:pt-[72px] md:pt-[72px] pb-10 md:pb-16">
        {/* Hero intro */}
        <div className="relative mb-6 sm:mb-8 z-30">
          {/* Large Expansive Hero Background Graphic (Desktop only) */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-[45%] lg:w-[48%] xl:w-[50%] pointer-events-none select-none z-0 overflow-hidden">
            <div className="relative w-full h-full [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_100%)]">
              {/* Dark mode hero image */}
              <Image
                src="/images/home-bg/home-bg.png"
                alt="Nursing student"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 50vw"
                className="hidden dark:block show-on-dark object-contain object-bottom scale-105 origin-bottom dark:mix-blend-lighten"
              />
              {/* Light mode hero image */}
              <Image
                src="/images/home-bg/home-bg-light.jpg"
                alt="Nursing student"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 50vw"
                className="block dark:hidden show-on-light object-contain object-bottom scale-105 origin-bottom"
              />
            </div>
            {/* Soft fade back to content bg on the left side of the image */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--content-bg)] to-transparent" />
          </div>

          <div className="relative z-10 text-left max-w-2xl lg:max-w-3xl pt-2 pb-4 md:py-4">
            <div className="flex justify-start mb-2 sm:mb-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm tracking-widest uppercase text-coral">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-green bg-transparent">
                  <GraduationCap className="w-4 h-4 text-green" strokeWidth={2} />
                </span>
                Nursing Exam Prep
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-[3.25rem] font-semibold leading-tight tracking-tight text-black dark:text-white mb-3 sm:mb-4">
              Pass Your Nursing Exams
              <span className="text-coral">.</span>
              <br />
              Start Your Career
              <span className="text-coral">.</span>
            </h1>
            <p className="text-[14px] sm:text-[16px] md:text-[18px] text-black dark:text-white font-medium leading-relaxed max-w-2xl mb-4 sm:mb-5">
              Question banks, study notes, and timed practice tests for RN &amp; LPN nursing exams and exit exams — all in one place.
            </p>

            {/* Last Updated */}
            <p className="flex items-center justify-start gap-1.5 text-xs md:text-sm text-black/80 dark:text-white/80 font-medium tracking-wide mb-4 sm:mb-5">
              <Calendar className="w-3.5 h-3.5" />
              Exams last updated on{" "}
              <span suppressHydrationWarning className="text-green font-semibold">
                {getPreviousDayFormatted()}
              </span>
            </p>

            <div className="flex flex-row items-center justify-start gap-2.5 sm:gap-4 md:gap-6">
              <div className="relative inline-block text-left z-40" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setOpenPracticeDropdown((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors whitespace-nowrap cursor-pointer shadow-sm select-none"
                  aria-expanded={openPracticeDropdown}
                  aria-haspopup="true"
                >
                  <BookOpen className="w-3.5 h-3.5 md:w-5 md:h-5" strokeWidth={2} />
                  <span>Start Free Practice</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-200 ${
                      openPracticeDropdown ? "rotate-180" : ""
                    }`}
                    strokeWidth={2.5}
                  />
                </button>

                {openPracticeDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border dark:border-white/15 bg-white dark:bg-[#001326] p-2 sm:p-2.5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="space-y-1">
                      {practiceExams.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
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
                                <span className="text-xs sm:text-sm font-normal text-navy dark:text-white group-hover:text-coral transition-colors truncate">
                                  {item.label}
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-light text-navy/60 dark:text-white/60 truncate">
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-navy/40 dark:text-white/40 group-hover:text-coral group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative inline-block text-left z-40" ref={progressDropdownRef}>
                {signedIn ? (
                  <button
                    type="button"
                    onClick={() => setOpenProgressDropdown((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold text-[#0c1929] bg-sage hover:bg-sage-light transition-colors whitespace-nowrap cursor-pointer shadow-sm select-none"
                    aria-expanded={openProgressDropdown}
                    aria-haspopup="true"
                  >
                    <BarChart3 className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-800 dark:text-emerald-950" strokeWidth={2.2} />
                    <span>Track My Progress</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-200 ${
                        openProgressDropdown ? "rotate-180" : ""
                      }`}
                      strokeWidth={2.5}
                    />
                  </button>
                ) : (
                  <Link
                    href="/auth/login?redirect=/dashboards/rn-nursing/vista/stats/progress"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold text-[#0c1929] bg-sage hover:bg-sage-light transition-colors whitespace-nowrap shadow-sm select-none"
                  >
                    <BarChart3 className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-800 dark:text-emerald-950" strokeWidth={2.2} />
                    <span>Track My Progress</span>
                  </Link>
                )}

                {signedIn && openProgressDropdown && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-border dark:border-white/15 bg-white dark:bg-[#001326] p-4 sm:p-5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-border dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-navy dark:text-white leading-tight">
                            Track My Progress
                          </h3>
                          <p className="text-[11px] text-navy/60 dark:text-white/60 truncate max-w-[190px]">
                            {userName ? `${userName}` : user?.email ?? "Study Tracker"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboards/rn-nursing/vista/stats/progress"
                        onClick={() => setOpenProgressDropdown(false)}
                        className="text-[11px] font-semibold text-coral hover:text-coral-hover hover:underline"
                      >
                        Details →
                      </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 my-3.5">
                      <div className="rounded-xl bg-[#EEF3FE] dark:bg-white/5 p-2.5">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-navy/60 dark:text-white/60 block">
                          Total Exams
                        </span>
                        <span className="text-base font-bold text-navy dark:text-white">
                          {progress.totalExams}
                        </span>
                      </div>
                      <div className="rounded-xl bg-blue-500/10 dark:bg-blue-500/15 p-2.5">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300 block">
                          In Progress
                        </span>
                        <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                          {progress.inProgress}
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

                    {/* Progress Bars */}
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

                    {/* Recent Active Exams */}
                    {progress.recentActiveExams.length > 0 ? (
                      <div className="mb-3.5 border-t border-border dark:border-white/10 pt-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-navy/50 dark:text-white/50 block mb-1.5">
                          Active Activity
                        </span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {progress.recentActiveExams.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#EEF3FE]/60 dark:bg-white/5"
                            >
                              <span className="truncate max-w-[180px] font-medium text-navy dark:text-white">
                                {item.title}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  item.status === "Completed"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3.5 text-center py-2 text-xs text-navy/50 dark:text-white/50 border-t border-border dark:border-white/10 pt-2">
                        No active exam sessions yet. Pick a program to get started!
                      </div>
                    )}

                    {/* Action link */}
                    <Link
                      href="/dashboards/rn-nursing/vista/stats/progress"
                      onClick={() => setOpenProgressDropdown(false)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-coral hover:bg-coral-hover text-[#0c1929] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>View Full Progress Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Quick-access exam navigation — compact card centered in the middle of the page */}
          <div className="mt-6 flex justify-center w-full relative z-10">
            <div className="w-full max-w-[270px] sm:max-w-[285px]">
              {quickLinks.map((group) => {
                const Icon = group.icon;
                return (
                  <div
                    key={group.category}
                    className="rounded-xl md:rounded-2xl border border-black/50 dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full ${group.iconBg} ${group.iconColor}`}
                      >
                        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.75} />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[9px] sm:text-[11px] font-black dark:font-bold uppercase leading-tight ${group.accentColor}`}>
                          {group.category}
                        </span>
                        <span className={`block w-6 h-0.5 sm:w-7 ${group.accentBg} rounded-full mt-0.5 mb-0.5`} />
                        <p className="text-[9px] sm:text-[10px] leading-snug font-semibold text-slate-800 dark:font-normal dark:text-slate-400">
                          {group.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      {group.links.map((link) => {
                        const LinkIcon = link.linkIcon;
                        return (
                          <Link
                            key={link.href + link.label}
                            href={link.href}
                            className="flex items-center justify-between w-full px-2.5 py-1.5 sm:py-2 rounded-lg bg-[#2FD9C4] hover:bg-[#28c4b0] border border-[#2FD9C4]/40 shadow-sm transition-all group active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-md bg-[#08111F]/15 text-[#08111F] shrink-0">
                                <LinkIcon className="w-2.5 h-2.5 text-[#08111F]" strokeWidth={2} />
                              </span>
                              <span className="text-xs font-semibold text-[#08111F] leading-none tracking-tight truncate">
                                {link.label}
                              </span>
                            </div>
                            <ChevronRight
                              className="w-3 h-3 text-[#08111F]/75 group-hover:text-[#08111F] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                              strokeWidth={2}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature strip */}
          <div className="mt-8 rounded-xl border border-black/50 dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] p-3 sm:p-5 md:p-8 xl:p-10 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 xl:gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 rounded-full border border-border-light mb-1 sm:mb-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-navy/40">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12.5l2.5 2.5L16 9.5" />
                  </svg>
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm xl:text-base font-semibold text-navy mb-0.5 sm:mb-1 leading-tight">
                  High-Quality Questions
                </span>
                <span className="hidden sm:inline text-[11px] md:text-xs xl:text-sm leading-snug text-navy/50">
                  Up-to-date and exam-focused content you can trust.
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 rounded-full border border-border-light mb-1 sm:mb-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-navy/40">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm xl:text-base font-semibold text-navy mb-0.5 sm:mb-1 leading-tight">
                  Timed Practice Tests
                </span>
                <span className="hidden sm:inline text-[11px] md:text-xs xl:text-sm leading-snug text-navy/50">
                  Simulate real exam conditions.
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 rounded-full border border-border-light mb-1 sm:mb-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-navy/40">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 14v2M12 11v5M15 8v8" />
                  </svg>
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm xl:text-base font-semibold text-navy mb-0.5 sm:mb-1 leading-tight">
                  Track Your Progress
                </span>
                <span className="hidden sm:inline text-[11px] md:text-xs xl:text-sm leading-snug text-navy/50">
                  Monitor performance and improve smarter.
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 rounded-full border border-border-light mb-1 sm:mb-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-navy/40">
                    <circle cx="12" cy="12" r="9" />
                    <rect x="9.5" y="8" width="5" height="8" rx="1" />
                    <path d="M11.5 14.5h1" />
                  </svg>
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm xl:text-base font-semibold text-navy mb-0.5 sm:mb-1 leading-tight">
                  Study Anywhere
                </span>
                <span className="hidden sm:inline text-[11px] md:text-xs xl:text-sm leading-snug text-navy/50">
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
    </section>
  );
}
