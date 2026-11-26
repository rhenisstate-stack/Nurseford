"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Zap,
  Activity,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Clock,
  BookOpen,
  Lock,
  Unlock,
  Play,
  Pause,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  CreditCard,
  Target,
  LayoutDashboard,
  FileCheck2,
  User,
  Moon,
} from "lucide-react";

export type ShowcaseStep = "homepage" | "dashboard" | "subscription" | "exam";
export type ProgramTrack = "RN" | "LPN";

interface CursorState {
  x: number; // percentage from left
  y: number; // percentage from top
  clicking: boolean;
  visible: boolean;
}

export default function HeroVisualShowcase() {
  const [currentStep, setCurrentStep] = useState<ShowcaseStep>("homepage");
  const [activeTrack, setActiveTrack] = useState<ProgramTrack>("RN");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [cursor, setCursor] = useState<CursorState>({ x: 60, y: 40, clicking: false, visible: true });
  const [examAnswered, setExamAnswered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dynamic browser URL bar text
  const currentUrl =
    currentStep === "homepage"
      ? "pubnurse.com"
      : currentStep === "dashboard"
      ? `pubnurse.com/dashboards/${activeTrack.toLowerCase()}-nursing`
      : currentStep === "subscription"
      ? `pubnurse.com/dashboards/${activeTrack.toLowerCase()}-nursing/subscription`
      : `pubnurse.com/dashboards/${activeTrack.toLowerCase()}-nursing/vista/exam/14`;

  // Main automated flow sequencing
  useEffect(() => {
    if (!isAutoPlaying) return;

    let stepTimer: NodeJS.Timeout;
    let cursorTimer: NodeJS.Timeout;
    let clickTimer: NodeJS.Timeout;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: HOMEPAGE WITH "START PRACTICE" DROPDOWN (~4.0s)
    // ─────────────────────────────────────────────────────────────────────────
    if (currentStep === "homepage") {
      setDropdownOpen(false);
      setExamAnswered(false);

      // 1. Cursor moves to "Start Practice" button
      cursorTimer = setTimeout(() => {
        setCursor({ x: 22, y: 46, clicking: false, visible: true });
      }, 700);

      // 2. Click "Start Practice" -> Opens dropdown
      clickTimer = setTimeout(() => {
        setCursor({ x: 22, y: 46, clicking: true, visible: true });
        setDropdownOpen(true);
      }, 1400);

      // 3. Move cursor down onto "RN Nursing Subjects" (or "LPN Nursing Subjects")
      const dropTimer = setTimeout(() => {
        setCursor({
          x: 28,
          y: activeTrack === "RN" ? 64 : 76,
          clicking: false,
          visible: true,
        });
      }, 2100);

      // 4. Click the track option with teal ripple
      const dropClickTimer = setTimeout(() => {
        setCursor({
          x: 28,
          y: activeTrack === "RN" ? 64 : 76,
          clicking: true,
          visible: true,
        });
      }, 2900);

      // 5. Navigate to Dashboard (Step 2)
      stepTimer = setTimeout(() => {
        setCursor((prev) => ({ ...prev, clicking: false, visible: false }));
        setDropdownOpen(false);
        setCurrentStep("dashboard");
      }, 3700);

      return () => {
        clearTimeout(stepTimer);
        clearTimeout(cursorTimer);
        clearTimeout(clickTimer);
        clearTimeout(dropTimer);
        clearTimeout(dropClickTimer);
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: NURSING DASHBOARD (Shows Stats, Clicks "Start Practice") (~3.6s)
    // ─────────────────────────────────────────────────────────────────────────
    if (currentStep === "dashboard") {
      // 1. Move cursor onto "Start Practice Drill" in dashboard
      cursorTimer = setTimeout(() => {
        setCursor({ x: 62, y: 74, clicking: false, visible: true });
      }, 600);

      // 2. Click "Start Practice Drill"
      clickTimer = setTimeout(() => {
        setCursor({ x: 62, y: 74, clicking: true, visible: true });
      }, 1700);

      // 3. Move to Subscription Verification (Step 3)
      stepTimer = setTimeout(() => {
        setCursor((prev) => ({ ...prev, clicking: false, visible: false }));
        setCurrentStep("subscription");
      }, 3100);

      return () => {
        clearTimeout(stepTimer);
        clearTimeout(cursorTimer);
        clearTimeout(clickTimer);
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: SUBSCRIPTION & PRACTICE PASS GATE (~3.0s)
    // ─────────────────────────────────────────────────────────────────────────
    if (currentStep === "subscription") {
      // 1. Cursor moves to "Enter Exam Room →"
      cursorTimer = setTimeout(() => {
        setCursor({ x: 50, y: 74, clicking: false, visible: true });
      }, 500);

      // 2. Click "Enter Exam Room →"
      clickTimer = setTimeout(() => {
        setCursor({ x: 50, y: 74, clicking: true, visible: true });
      }, 1500);

      // 3. Transition to Exam Room (Step 4)
      stepTimer = setTimeout(() => {
        setCursor((prev) => ({ ...prev, clicking: false, visible: false }));
        setCurrentStep("exam");
      }, 2700);

      return () => {
        clearTimeout(stepTimer);
        clearTimeout(cursorTimer);
        clearTimeout(clickTimer);
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: LIVE CLINICAL EXAM ROOM (~5.2s)
    // ─────────────────────────────────────────────────────────────────────────
    if (currentStep === "exam") {
      setExamAnswered(false);

      // 1. Cursor moves to Option B
      cursorTimer = setTimeout(() => {
        setCursor({ x: 48, y: 60, clicking: false, visible: true });
      }, 700);

      // 2. Click Option B
      clickTimer = setTimeout(() => {
        setCursor({ x: 48, y: 60, clicking: true, visible: true });
        setExamAnswered(true);
      }, 1800);

      // 3. Complete and loop to other track homepage
      stepTimer = setTimeout(() => {
        setCursor((prev) => ({ ...prev, clicking: false, visible: false }));
        setActiveTrack((prev) => (prev === "RN" ? "LPN" : "RN"));
        setCurrentStep("homepage");
      }, 5000);

      return () => {
        clearTimeout(stepTimer);
        clearTimeout(cursorTimer);
        clearTimeout(clickTimer);
      };
    }

    return () => clearTimeout(stepTimer);
  }, [currentStep, activeTrack, isAutoPlaying]);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl border border-slate-300/80 dark:border-slate-800 bg-white dark:bg-[#071326] select-none flex flex-col justify-between">
      
      {/* ── Sleek Browser Window Header ── */}
      <div className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
        {/* Mac-style Window Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
        </div>

        {/* Real Browser Address Bar */}
        <div className="flex-1 max-w-xs sm:max-w-sm mx-auto flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-md bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate shadow-2xs">
          <Lock className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="truncate">{currentUrl}</span>
        </div>

        {/* Live Simulation Indicator */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-[9px] font-bold uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="hidden sm:inline">Live Demo</span>
        </div>
      </div>

      {/* ── Main Browser Viewport ── */}
      <div className="relative flex-1 p-3 sm:p-4 bg-slate-50/60 dark:bg-[#0b1528] overflow-hidden flex flex-col justify-center">

        {/* ═════════════════════════════════════════════════════════════════════
            VIEW 1: EXACT REAL HOMEPAGE WITH "START PRACTICE" DROPDOWN OPEN
            ═════════════════════════════════════════════════════════════════════ */}
        {currentStep === "homepage" && (
          <div className="relative w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-sm text-left space-y-1.5 animate-in fade-in duration-300">
            {/* Real PubNurse Navbar (Exact layout from user screenshot) */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 font-bold text-navy dark:text-white">
                  <div className="w-4 h-4 rounded bg-teal-600 flex items-center justify-center text-white text-[8px] font-black">
                    PN
                  </div>
                  <span className="text-xs font-black tracking-tight">PubNurse</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[8.5px] ml-1">
                  <span>Nursing School ▼</span>
                  <span>Exit Exams ▼</span>
                  <span>Resources ▼</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[8.5px]">
                <span className="px-2 py-0.5 rounded-md border border-teal-600/30 text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1">
                  <CreditCard className="w-2.5 h-2.5" />
                  Subscription
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#0A2540] text-white font-bold">
                  Register
                </span>
              </div>
            </div>

            {/* Real Homepage Hero Copy */}
            <div className="space-y-0.5">
              <h1 className="font-serif text-xs sm:text-sm md:text-base font-extrabold text-navy dark:text-white leading-tight">
                Prepare with confidence<span className="text-amber-500">.</span>
                <br />
                Begin your nursing career<span className="text-amber-500">.</span>
              </h1>

              <p className="text-[8.5px] sm:text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">
                Expertly curated question banks, study notes, and practice tests for every stage of your nursing journey.
              </p>
            </div>

            {/* Real Action Buttons & Open Dropdown */}
            <div className="relative pt-0.5">
              <div className="flex items-center gap-2">
                {/* Start Practice Button */}
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold text-white transition-all ${
                    cursor.clicking && !dropdownOpen
                      ? "bg-[#06182a] scale-95 ring-2 ring-teal-400"
                      : "bg-[#0A2540] shadow-sm"
                  }`}
                >
                  <span>Start Practice</span>
                  {dropdownOpen ? (
                    <ChevronUp className="w-3 h-3 text-white" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-white" />
                  )}
                </button>

                {/* Track My Progress Button */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <span>Track My Progress</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Exact "CHOOSE PRACTICE TRACK" Dropdown from user screenshot */}
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 max-w-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                  <div className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-0.5">
                    CHOOSE PRACTICE TRACK
                  </div>

                  {/* Option 1: RN Nursing Subjects */}
                  <div
                    className={`flex items-center gap-1.5 p-1 rounded-lg transition-all ${
                      activeTrack === "RN" && cursor.clicking
                        ? "bg-emerald-500/30 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-400/50 scale-[0.98]"
                        : "hover:bg-emerald-500/15 active:bg-emerald-500/30 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-emerald-900 dark:text-emerald-200">
                          RN Nursing Subjects
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 block truncate">
                        Explore RN clinical courses &amp; exams
                      </span>
                    </div>
                  </div>

                  {/* Option 2: LPN Nursing Subjects */}
                  <div
                    className={`flex items-center gap-1.5 p-1 rounded-lg transition-all ${
                      activeTrack === "LPN" && cursor.clicking
                        ? "bg-emerald-500/30 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-400/50 scale-[0.98]"
                        : "hover:bg-emerald-500/15 active:bg-emerald-500/30 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-emerald-900 dark:text-emerald-200">
                          LPN Nursing Subjects
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 block truncate">
                        Explore LPN clinical courses &amp; exams
                      </span>
                    </div>
                  </div>

                  {/* Option 3: All Subjects */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-purple-700 dark:text-purple-400">
                          All Subjects
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 block truncate">
                        Combined view across RN &amp; LPN tracks
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Background Path Section ("Your path to nursing success") */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                <GraduationCap className="w-3 h-3 text-amber-500" />
                <span>Your path to nursing success</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[8.5px] font-bold uppercase">
                <div className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span>RN Nursing Exams</span>
                  <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                </div>
                <div className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span>LPN Nursing Exams</span>
                  <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            VIEW 2: REAL NURSING DASHBOARD (Clean stats, Q-bank card, Start Practice)
            ═════════════════════════════════════════════════════════════════════ */}
        {currentStep === "dashboard" && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 shadow-sm text-left flex gap-3 animate-in fade-in duration-300">
            {/* Real Left Sidebar Preview */}
            <div className="w-24 sm:w-28 border-r border-slate-100 dark:border-slate-800 pr-2 shrink-0 space-y-1 text-[8.5px]">
              <div className="font-extrabold text-[10px] text-teal-600 dark:text-teal-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                PubNurse
              </div>
              <div className="font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-1 py-0.5 rounded">
                My Dashboard
              </div>
              <div className="text-slate-600 dark:text-slate-400 px-1 py-0.5">My Progress</div>
              <div className="text-slate-400 px-1 py-0.5">My Reports</div>
              <div className="text-slate-400 px-1 py-0.5">Subscriptions</div>
              <div className="text-slate-400 px-1 py-0.5">Settings</div>
            </div>

            {/* Dashboard Main Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs sm:text-sm font-extrabold text-navy dark:text-white leading-tight">
                    {activeTrack} Nursing Dashboard
                  </h2>
                  <p className="text-[9px] text-slate-400">Learner: machokombo (machokombo@gmail.com)</p>
                </div>
              </div>

              {/* 3 Real Metric Cards */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60">
                  <div className="text-[8px] font-bold text-slate-500 uppercase">Average</div>
                  <div className="text-xs font-black text-teal-700 dark:text-teal-400">22%</div>
                </div>
                <div className="p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60">
                  <div className="text-[8px] font-bold text-slate-500 uppercase">Pass Rate</div>
                  <div className="text-xs font-black text-blue-700 dark:text-blue-400">12%</div>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
                  <div className="text-[8px] font-bold text-slate-500 uppercase">Completed</div>
                  <div className="text-xs font-black text-amber-700 dark:text-amber-400">16 Exams</div>
                </div>
              </div>

              {/* Course Practice Card */}
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-navy dark:text-white">
                    Pharmacology &amp; Parenteral Therapies
                  </div>
                  <div className="text-[8.5px] text-slate-500 dark:text-slate-400">
                    NextGen Clinical Practice • 75 Questions
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
                  Ready
                </span>
              </div>

              {/* Start Practice Drill Button */}
              <button
                type="button"
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-sky-700 text-white font-bold text-[10.5px] shadow-sm transition-transform duration-200 ${
                  cursor.clicking ? "scale-95 ring-2 ring-teal-400" : ""
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>Start Practice Drill (Exam #14)</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 animate-bounce-x" />
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            VIEW 3: SUBSCRIPTION ACCESS PASS
            ═════════════════════════════════════════════════════════════════════ */}
        {currentStep === "subscription" && (
          <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-md text-left space-y-2.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-navy dark:text-white">
                  {activeTrack} Comprehensive Practice Pass
                </h3>
                <p className="text-[9.5px] text-slate-400">PubNurse 1-Click Practice Verification</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Access Verified ✓
              </span>
            </div>

            <div className="space-y-1 py-1 text-[10px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Full access to 75+ Timed Clinical Practice Questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Instant Clinical Rationales &amp; Priority Actions</span>
              </div>
            </div>

            <button
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm transition-transform duration-200 ${
                cursor.clicking ? "scale-95 ring-2 ring-emerald-400" : ""
              }`}
            >
              <span>Subscription Active — Launch Exam Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            VIEW 4: LIVE CLINICAL EXAM ROOM
            ═════════════════════════════════════════════════════════════════════ */}
        {currentStep === "exam" && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 shadow-sm text-left space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-[10px] font-bold text-teal-700 dark:text-teal-400 pb-1 border-b border-slate-100 dark:border-slate-800">
              <span>{activeTrack} Clinical Exam #14 • Pharmacology</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">Q #14 / 75 • ⏱ 48:15</span>
            </div>

            <p className="text-xs font-semibold text-navy dark:text-white leading-snug">
              Client prescribed Digoxin has an apical pulse of 52 bpm. Prioritize nursing action:
            </p>

            <div className="space-y-1.5 text-[10.5px]">
              <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-slate-300 text-[9px] flex items-center justify-center">A</span>
                <span>Administer prescribed dose and re-check vitals in 4 hours.</span>
              </div>

              <div
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  examAnswered
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center shrink-0 mt-0.5 ${
                      examAnswered ? "bg-emerald-600 text-white font-bold" : "border border-slate-300"
                    }`}
                  >
                    {examAnswered ? "✓" : "B"}
                  </span>
                  <div>
                    <div className="font-semibold leading-tight">
                      Withhold dose, assess for toxicity, and verify serum potassium.
                    </div>
                    {examAnswered && (
                      <div className="text-[9.5px] text-emerald-700 dark:text-emerald-300 mt-1 animate-in fade-in duration-300">
                        <strong>Clinical Rationale:</strong> Hypokalemia potentiates digoxin toxicity; apical pulse &lt; 60 requires withholding.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Exam Footer */}
            <div className="flex items-center justify-between text-[9.5px] pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {examAnswered ? "Correct Answer • Priority Action Validated" : "Awaiting Selection..."}
              </span>
              <span className="text-navy dark:text-white font-bold flex items-center gap-1">
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

      </div>

      {/* ── Realistic Animated Glowing Mouse Cursor & Click Ripple ── */}
      {cursor.visible && (
        <div
          className="absolute z-40 pointer-events-none transition-all duration-700 ease-out"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            transform: "translate(-30%, -20%)",
          }}
        >
          {cursor.clicking && (
            <span className="absolute -inset-3 rounded-full bg-teal-400/40 border-2 border-teal-500 animate-ping pointer-events-none" />
          )}

          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            className={`drop-shadow-[0_2px_8px_rgba(13,148,136,0.6)] transition-transform ${
              cursor.clicking ? "scale-90" : "scale-100"
            }`}
          >
            <polygon
              points="3,3 3,19 8,15 12,22 15,20 11,13 18,13"
              fill="#0d9488"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* ── Bottom Stepper Controls & Looper ── */}
      <div className="bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0 text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            aria-label={isAutoPlaying ? "Pause simulation" : "Play simulation"}
            className="p-1 rounded bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition cursor-pointer"
          >
            {isAutoPlaying ? <Pause className="w-3 h-3 text-slate-600 dark:text-slate-300" /> : <Play className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
          </button>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1 text-[9px] font-bold">
            <button
              type="button"
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStep("homepage");
              }}
              className={`px-1.5 py-0.5 rounded transition ${
                currentStep === "homepage" ? "bg-teal-600 text-white shadow-xs" : "hover:text-teal-600"
              }`}
            >
              1. Homepage
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStep("dashboard");
              }}
              className={`px-1.5 py-0.5 rounded transition ${
                currentStep === "dashboard" ? "bg-teal-600 text-white shadow-xs" : "hover:text-teal-600"
              }`}
            >
              2. Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStep("subscription");
              }}
              className={`px-1.5 py-0.5 rounded transition ${
                currentStep === "subscription" ? "bg-teal-600 text-white shadow-xs" : "hover:text-teal-600"
              }`}
            >
              3. Pass
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentStep("exam");
              }}
              className={`px-1.5 py-0.5 rounded transition ${
                currentStep === "exam" ? "bg-teal-600 text-white shadow-xs" : "hover:text-teal-600"
              }`}
            >
              4. Exam
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400">
          <RotateCcw className={`w-2.5 h-2.5 text-teal-600 dark:text-teal-400 ${isAutoPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
          <span>Looping {activeTrack} Track</span>
        </div>
      </div>

    </div>
  );
}
