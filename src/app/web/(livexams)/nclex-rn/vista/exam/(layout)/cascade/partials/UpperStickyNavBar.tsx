// src\app\web\(nursing)\atiteas\vista\exam\(layout)\glacial\partials\UpperStickyNavBar.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { APP_NAME } from "@/lib/config/config";
import Image from "next/image";
import Link from "next/link";
import { Bot, User, Mail, Phone, ShieldCheck, ChevronDown, LayoutGrid } from "lucide-react";
import { useLiveStrataExamContext } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";
import { useLowerRibbon } from "./LowerRibbonContext";
import { useFooterRibbon } from "./FooterRibbonContext";
import { useNonStickyRibbon } from "./NonStickyRibbonContext";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";

export default function UpperStickyNavBar() {
    const { user } = useCurrentSystemUser();
    const { examSession } = useLiveStrataExamContext();
    const { isOpen: lowerOpen, toggle: toggleLower } = useLowerRibbon();
    const { isOpen: footerOpen, toggle: toggleFooter } = useFooterRibbon();
    const { isOpen: nonStickyOpen, toggle: toggleNonSticky } = useNonStickyRibbon();
    const { saveResidualDuration, submitExam, secondsLeft, setSecondsLeft, submitStatus } = useLiveExamActionContext();

    const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const userName = user?.userName?.trim() || "User";
    const examTitle = examSession?.exam?.title ?? "Untitled Exam";
    const totalQuestions = examSession?.exam?.questionsCount ?? 0;

    const allQuestions = (examSession?.sections ?? []).flatMap((s) => s.questions ?? []);
    const totalFromSections = allQuestions.length;
    const effectiveTotal = totalFromSections > 0 ? totalFromSections : totalQuestions;

    // Seed from backend savedUserAnswer on load, then track locally via context answers
    const { getAnswer } = useLiveExamActionContext();

    const answeredCount = allQuestions.filter((q) => {
        // Check context first (live updates), fall back to backend savedUserAnswer
        const ctxAnswer = getAnswer(q.id);
        return ctxAnswer != null || q.savedUserAnswer != null;
    }).length;

    const questionsRemaining = Math.max(0, effectiveTotal - answeredCount);

    const examMode = (examSession?.exam?.selectedMode ?? "").toLowerCase().trim();
    const isStrictMode = examMode === "exam" || examMode === "test";
    const totalSeconds = (examSession?.exam?.duration ?? 0) * 60;

    // Resolve start: backend residual → else full duration
    const examActions = examSession?.examActions ?? [];
    const latestAction = examActions[examActions.length - 1];
    const backendResidualSeconds = latestAction?.residualDuration
        ? Math.round(latestAction.residualDuration * 60)
        : null;

    // ── Timer ──────────────────────────────────────────────────────────────────
    const [timeWarning, setTimeWarning] = useState(false);
    const [timeUp, setTimeUp] = useState(false);

    // Seed secondsLeft from backend residual on mount / exam change
    useEffect(() => {
        if (totalSeconds <= 0) return;
        const startFrom = backendResidualSeconds ?? totalSeconds;
        setSecondsLeft(startFrom);
        setTimeWarning(false);
        setTimeUp(false);
    }, [totalSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

    // Countdown tick — pauses when exam:paused fires, resumes on exam:resume
    const [examPaused, setExamPaused] = useState(false);
    const [isCancelled, setIsCancelled] = useState(
        examSession?.examActions?.[0]?.status === "Cancelled"
    );
    const [cancelWarningCountdown, setCancelWarningCountdown] = useState<number | null>(null);
    const cancelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);



    useEffect(() => {
        const onPaused = () => setExamPaused(true);
        const onResume = () => { setExamPaused(false); setIsCancelled(false); };
        window.addEventListener("exam:paused", onPaused);
        window.addEventListener("exam:resume", onResume);
        return () => {
            window.removeEventListener("exam:paused", onPaused);
            window.removeEventListener("exam:resume", onResume);
        };
    }, []);

    // Sync cancelled state from examSession
    useEffect(() => {
        const row = examSession?.examActions?.[0];
        if (!row) return;
        setIsCancelled(row.status === "Cancelled");
        if (row.status === "Paused") setExamPaused(true);
    }, [examSession]);

    // Aggressive cancelled warning — 10s delay → 20s countdown → force exit → repeat
    useEffect(() => {
        if (!isCancelled) {
            if (cancelIntervalRef.current) { clearInterval(cancelIntervalRef.current); cancelIntervalRef.current = null; }
            if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
            setCancelWarningCountdown(null);
            return;
        }

        const startCountdown = () => {
            if (countdownIntervalRef.current) return;
            let count = 20;
            setCancelWarningCountdown(count);
            countdownIntervalRef.current = setInterval(() => {
                count--;
                if (count <= 0) {
                    clearInterval(countdownIntervalRef.current!);
                    countdownIntervalRef.current = null;
                    setCancelWarningCountdown(null);
                    window.history.back();
                } else {
                    setCancelWarningCountdown(count);
                }
            }, 1000);
        };

        const firstTimeout = setTimeout(startCountdown, 10000);
        cancelIntervalRef.current = setInterval(() => {
            if (!countdownIntervalRef.current) startCountdown();
        }, 10000);

        return () => {
            clearTimeout(firstTimeout);
            if (cancelIntervalRef.current) { clearInterval(cancelIntervalRef.current); cancelIntervalRef.current = null; }
            if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
        };
    }, [isCancelled]);

    useEffect(() => {
        if (totalSeconds <= 0) return;
        if (timeUp) return;
        if (examPaused || isCancelled) return; // ← frozen while paused or cancelled

        const warningThreshold = Math.floor(totalSeconds * 0.2);

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                const next = prev - 1;
                if (next <= warningThreshold) setTimeWarning(true);
                if (next <= 0) {
                    clearInterval(interval);
                    setTimeUp(true);
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [totalSeconds, timeUp, timeWarning, setSecondsLeft, examPaused, isCancelled]);

    // Auto-submit on time up (strict modes only)
    useEffect(() => {
        if (!timeUp || !isStrictMode) return;
        const examId = examSession?.exam?.id ?? 0;
        const examGuidId = examSession?.exam?.guidId ?? "";
        if (!examId || !examGuidId) return;
        submitExam({ examId, examGuidId, reason: "Time up — Auto Submitted ⚓" });
    }, [timeUp, isStrictMode]); // eslint-disable-line react-hooks/exhaustive-deps

    // Save residual on page hide / unload
    const examId = examSession?.exam?.id ?? 0;
    const examGuidId = examSession?.exam?.guidId ?? "";

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

    const secondsLeftRef = useRef(secondsLeft);
    useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);

    useEffect(() => {
        if (!examId || !examGuidId) return;

        const saveResidual = () => {
            saveResidualDuration({
                examId,
                examGuidId,
                residualDuration: parseFloat((secondsLeftRef.current / 60).toFixed(4)),
                reason: "Periodic Residual Duration Autosave Every (2-Minute Interval)",
                status: "true",
            });
        };

        // Periodic save every 2 minutes — easy on the server
        const periodicTimer = setInterval(saveResidual, 2 * 60 * 1000);

        //  On tab hide / page unload — save immediately 
        let hideTimer: ReturnType<typeof setTimeout> | null = null;

        const onVisibility = () => {
            if (document.visibilityState === "hidden") {
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(saveResidual, 300);
            } else {
                if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
            }
        };

        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("beforeunload", saveResidual);

        return () => {
            clearInterval(periodicTimer);
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("beforeunload", saveResidual);
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, [examId, examGuidId, saveResidualDuration]);

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

    const formatCountdown = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return [h > 0 ? `${h}h` : null, `${String(m).padStart(2, "0")}m`, `${String(s).padStart(2, "0")}s`]
            .filter(Boolean).join(" ");
    };

    const [isLightLogoBroken, setIsLightLogoBroken] = useState(false);
    const [isDarkLogoBroken, setIsDarkLogoBroken] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);

    const role = user?.roles?.length ? [...user.roles].sort((a, b) => b.rank - a.rank)[0]?.name : "Guest";
    const isActive = user?.accesses?.[0]?.isActive ?? false;
    const email = user?.emails?.find(e => e.isPrimary)?.email ?? user?.email ?? "—";
    const phone = user?.phones?.find(p => p.isPrimary)?.phoneNumber ?? "—";

    // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    return (
        <>
            <header
                id="glacial-upper-nav"
                style={{ backgroundColor: "var(--exam-upper-nav-bg)", fontSize: "var(--exam-upper-nav-font-sm)", color: "var(--exam-upper-nav-text)" }}
                className="w-full sticky top-0 z-50 backdrop-blur-md border-b border-var(--exam-upper-nav-text) shadow-sm overflow-visible transition-colors duration-300"
            >
                <div className="flex items-center justify-between px-3 sm:px-5 py-1 gap-3 overflow-visible">
                    {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                    {/* LEFT */}
                    <div className="flex-1 min-w-0">
                        <Link
                            href="/"
                            className="
                        flex items-baseline gap-2 shrink-0
                    "
                        >
                            {/* Light logo */}
                            <Image
                                src={isLightLogoBroken ? "/logo/logo-dark.png" : "/logo/logo.png"}
                                alt="Logo"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="
                            h-[1em] sm:h-[1.35em]
                            w-auto
                            object-contain
                            dark:hidden
                            relative top-[0.02em]
                        "
                                onError={() => setIsLightLogoBroken(true)}
                            />

                            {/* Dark logo */}
                            <Image
                                src={isDarkLogoBroken ? "/logo/logo.png" : "/logo/logo-dark.png"}
                                alt="Logo Dark"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="
                            h-[1em] sm:h-[1.35em]
                            w-auto
                            object-contain
                            hidden dark:block
                            relative top-[0.02em]
                        "
                                onError={() => setIsDarkLogoBroken(true)}
                            />

                            {/* App Name */}
                            <span
                                style={{ fontSize: "var(--exam-upper-nav-font-base)" }}
                                className="font-bold whitespace-nowrap leading-none"
                            >
                                {APP_NAME}
                            </span>
                        </Link>

                        <div className="flex items-center gap-3 mt-0.5">
                            <span style={{ fontSize: "var(--exam-upper-nav-font-base)" }} className="truncate max-w-[140px] font-bold sm:max-w-xs">{examTitle}</span>
                            <span className="hidden lg:inline" style={{ fontSize: "var(--exam-upper-nav-font-base)" }}>🟢</span>
                            <span className="hidden sm:inline" style={{ fontSize: "var(--exam-upper-nav-font-base)" }}> {totalQuestions} Questions </span>
                        </div>
                    </div>
                    {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                    {/* CENTER */}
                    <div className="flex items-center gap-2 flex-shrink-0">

                        {/* ── MOBILE: single ⚙ icon that expands to all 3 ── */}
                        <div className="relative sm:hidden">
                            <button
                                onClick={() => setMobileToolsOpen(v => !v)}
                                style={{ fontSize: "var(--exam-upper-nav-font-sm)" }}
                                className="relative overflow-hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-95"
                            >
                                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                                <LayoutGrid size={14} className="relative z-10" />
                            </button>

                            {mobileToolsOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-[9998]"
                                        onClick={() => setMobileToolsOpen(false)}
                                    />
                                    {/* Dropdown */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[9999] flex flex-col gap-2 bg-slate-950 border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[160px]">
                                        <button
                                            onClick={() => { setAiModalOpen(true); setMobileToolsOpen(false); }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold"
                                        >
                                            <Bot size={13} /> AI Tutor
                                        </button>
                                        <button
                                            onClick={() => { toggleLower(); setMobileToolsOpen(false); }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold"
                                        >
                                            <ChevronDown size={13} className={lowerOpen ? "rotate-180" : ""} /> Exam Tools
                                        </button>
                                        <div className="border-t border-white/10 pt-2 space-y-1.5">
                                            <p className="text-[9px] uppercase tracking-widest text-white/40 px-1">Layouts</p>
                                            <button
                                                onClick={() => { toggleFooter(); setMobileToolsOpen(false); }}
                                                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10"
                                            >
                                                <span>Bottom Footer</span>
                                                <span className={`w-2 h-2 rounded-full ${footerOpen ? "bg-cyan-400" : "bg-white/20"}`} />
                                            </button>
                                            <button
                                                onClick={() => { toggleNonSticky(); setMobileToolsOpen(false); }}
                                                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10"
                                            >
                                                <span>More Options</span>
                                                <span className={`w-2 h-2 rounded-full ${nonStickyOpen ? "bg-violet-400" : "bg-white/20"}`} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── DESKTOP: original 3 buttons ── */}
                        <div className="relative group hidden sm:block">
                            <button onClick={() => setAiModalOpen(true)} style={{ fontSize: "var(--exam-upper-nav-font-sm)" }}
                                className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95">
                                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                                <Bot size={14} className="relative z-10" />
                                <span className="relative z-10">AI Tutor</span>
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-[9999]">
                                Quick AI Assistant
                            </div>
                        </div>

                        <div className="relative group hidden sm:block">
                            <button onClick={toggleLower} style={{ fontSize: "var(--exam-upper-nav-font-sm)" }}
                                className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95">
                                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                                <ChevronDown size={14} className={`relative z-10 transition-transform duration-300 ${lowerOpen ? "rotate-180" : ""}`} />
                                <span className="relative z-10">Exam Tools</span>
                                <span className="relative z-10 hidden md:block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[9999]">
                                <div className="relative">
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                    <div className="bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap font-medium">Ready Exam Tools</div>
                                </div>
                            </div>
                        </div>

                        <div className="relative group hidden sm:block">
                            <button style={{ fontSize: "var(--exam-upper-nav-font-sm)" }}
                                className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95">
                                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <LayoutGrid size={14} className="relative z-10" />
                                <span className="relative z-10">Layouts</span>
                                <span className="relative z-10 hidden md:block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-auto z-[9999] w-48">
                                <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)] p-3 text-xs space-y-2 overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_60%)] pointer-events-none" />
                                    <div className="relative flex items-center justify-between px-2 pb-1 border-b border-white/10">
                                        <span className="text-[10px] uppercase tracking-widest text-white/60">System Controls</span>
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_cyan]" />
                                    </div>
                                    <div className="relative flex items-center justify-between px-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 transition">
                                        <span className="whitespace-nowrap truncate font-medium">Bottom Footer</span>
                                        <button onClick={toggleFooter} className={`relative w-11 h-6 flex items-center rounded-full transition ${footerOpen ? "bg-cyan-500/40" : "bg-white/10"} shadow-inner`}>
                                            <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${footerOpen ? "translate-x-5 bg-cyan-300 shadow-[0_0_10px_cyan]" : ""}`} />
                                        </button>
                                    </div>
                                    <div className="relative flex items-center justify-between px-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-400/40 transition">
                                        <span className="whitespace-nowrap truncate font-medium">More Options</span>
                                        <button onClick={toggleNonSticky} className={`relative w-11 h-6 flex items-center rounded-full transition ${nonStickyOpen ? "bg-violet-500/40" : "bg-white/10"} shadow-inner`}>
                                            <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${nonStickyOpen ? "translate-x-5 bg-violet-300 shadow-[0_0_10px_violet]" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                    {/* RIGHT */}
                    <div className="flex-1 min-w-0 flex flex-col items-end gap-0.5 overflow-visible">
                        <div
                            ref={wrapperRef}
                            className="relative inline-block"
                            onMouseEnter={() => setProfileOpen(true)}
                            onMouseLeave={() => setProfileOpen(false)}
                        >
                            <button
                                onClick={() => setProfileOpen((v) => !v)}
                                style={{
                                    color: "inherit",
                                    fontSize: "var(--exam-upper-nav-font-base)",
                                }}
                                className="
                                flex items-center gap-1.5
                                font-bold
                                hover:opacity-70
                                transition-opacity
                                truncate
                                max-w-[90px] sm:max-w-[160px]
                            "
                            >
                                <div
                                    className="
                                    w-5 h-5 rounded-full
                                    bg-blue-100
                                    flex items-center justify-center
                                    text-blue-600
                                    flex-shrink-0
                                    text-[10px]
                                    font-black
                                "
                                >
                                    {userName[0]?.toUpperCase()}
                                </div>

                                <span className="truncate">{userName}</span>
                            </button>

                            {profileOpen && (
                                <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-xl rounded-xl p-4 text-left z-[9999] max-sm:fixed max-sm:right-2 max-sm:left-2 max-sm:top-14 max-sm:w-auto">
                                    {/* Change this title color here */}
                                    <p className="text-xs font-black text-slate-800 dark:text-white mb-3 text-center uppercase tracking-widest">
                                        My Account ⚓
                                    </p>

                                    {/* Change the overall row text color here */}
                                    <div className="space-y-2.5 text-xs text-white dark:text-white">
                                        <Row icon={<User size={12} />} label="Role" value={role} />

                                        <Row
                                            icon={<ShieldCheck size={12} />}
                                            label="Status"
                                            value={
                                                <span
                                                    className={`font-semibold ${isActive
                                                        ? "text-emerald-300"
                                                        : "text-red-400"
                                                        }`}
                                                >
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            }
                                        />

                                        <Row
                                            icon={<Mail size={12} />}
                                            label="Email"
                                            value={email}
                                            breakAll
                                        />

                                        <Row
                                            icon={<Phone size={12} />}
                                            label="Phone"
                                            value={phone}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Remaining Questions + Time */}
                        <div
                            style={{ fontSize: "var(--exam-upper-nav-font-sm)" }}
                            className="flex items-center gap-3 opacity-80"
                        >
                            <span className="font-semibold">
                                <span className="sm:hidden">Left : </span>
                                <span className="hidden sm:inline">Remaining : </span>
                                <span className="text-blue-600">{questionsRemaining}</span>
                            </span>

                            {submitStatus !== "idle" && (
                                <span className={`text-[10px] font-semibold ${submitStatus === "saving" ? "text-slate-400" : submitStatus === "saved" ? "text-emerald-600" : "text-red-500"}`}>
                                    {submitStatus === "saving" ? "↻ Saving" : submitStatus === "saved" ? "✓ Saved" : "✕ Error"}
                                </span>
                            )}

                            <span className="opacity-30">|</span>

                            <span className={`font-semibold whitespace-nowrap transition-colors ${timeUp
                                ? "text-red-700 animate-pulse font-black"
                                : timeWarning
                                    ? "text-orange-500 animate-pulse"
                                    : "text-red-600"
                                }`}>
                                ⏳ {timeUp ? "Time's Up!" : formatCountdown(secondsLeft)}
                            </span>
                        </div>
                    </div>

                    {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                </div>

                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
                {/* AI ASSISTANT MODAL */}
                {aiModalOpen && (
                    <div
                        className="
                        fixed inset-0 z-[10000]
                        flex items-start justify-center
                        bg-slate-950/60 backdrop-blur-md
                        px-4 pt-6 sm:pt-10
                        animate-in fade-in duration-300
                    "
                        onClick={() => setAiModalOpen(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="
                            relative
                            w-full max-w-4xl
                            h-[92vh] sm:h-[85vh]
                            rounded-3xl
                            border border-white/20
                            bg-white/95 dark:bg-slate-900/95
                            backdrop-blur-2xl
                            shadow-[0_30px_80px_rgba(0,0,0,0.45)]
                            overflow-hidden
                            animate-in slide-in-from-top-12 zoom-in-95
                            duration-500
                            flex flex-col
                        "
                        >
                            {/* Decorative Glow */}
                            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-cyan-500/20 blur-3xl pointer-events-none" />

                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-slate-200/70 dark:border-slate-700/70 shrink-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div
                                            className="
                                w-14 h-14 rounded-2xl
                                bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500
                                text-white
                                flex items-center justify-center
                                shadow-lg shadow-blue-500/30
                                shrink-0
                            "
                                        >
                                            <Bot size={28} />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                                AI Assistant
                                            </h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                                                Ask anything about this exam and get instant guidance.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setAiModalOpen(false)}
                                        className="
                            w-10 h-10 rounded-xl
                            flex items-center justify-center
                            hover:bg-slate-100 dark:hover:bg-slate-800
                            text-slate-500 hover:text-slate-700 dark:hover:text-white
                            transition-all
                            shrink-0
                        "
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="relative flex-1 overflow-hidden flex flex-col">
                                {/* Suggested Features */}
                                <div className="px-6 pt-6 pb-4 shrink-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button className="text-left p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 hover:scale-[1.01] transition-all">
                                            <div className="text-2xl mb-2">💡</div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                                Explain Concept
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Break down difficult nursing topics.
                                            </p>
                                        </button>

                                        <button className="text-left p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 hover:scale-[1.01] transition-all">
                                            <div className="text-2xl mb-2">📝</div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                                Give Me a Hint
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Get guidance without spoilers.
                                            </p>
                                        </button>

                                        <button className="text-left p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 hover:scale-[1.01] transition-all">
                                            <div className="text-2xl mb-2">📚</div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                                Summarize Topic
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Quick review notes and mnemonics.
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Container */}
                                <div className="flex-1 overflow-y-auto px-6 pb-6">
                                    {/* Welcome Message */}
                                    <div className="max-w-3xl mx-auto">
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shrink-0">
                                                <Bot size={18} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="inline-block rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-800 px-4 py-3 shadow-sm">
                                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                                        Hello! I can explain concepts, provide hints,
                                                        summarize topics, and answer questions about
                                                        your current exam.
                                                    </p>
                                                </div>

                                                <p className="text-[11px] text-slate-400 mt-2 ml-1">
                                                    AI Assistant • Ready to help
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="relative px-6 py-5 border-t border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shrink-0">
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <div
                                            className="
                                            flex items-end gap-3
                                            rounded-2xl
                                            border border-slate-200 dark:border-slate-700
                                            bg-slate-50 dark:bg-slate-800/80
                                            px-4 py-3
                                            shadow-inner
                                            focus-within:ring-2
                                            focus-within:ring-blue-500/30
                                            focus-within:border-blue-400
                                            transition-all
                                        "
                                        >
                                            <textarea
                                                rows={1}
                                                placeholder="Ask a question about this exam..."
                                                className="
                                    w-full resize-none bg-transparent outline-none
                                    text-sm text-slate-800 dark:text-slate-100
                                    placeholder:text-slate-400
                                    max-h-40
                                "
                                            />

                                            <button
                                                className="
                                                w-10 h-10 rounded-xl
                                                bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500
                                                hover:from-violet-700 hover:via-blue-700 hover:to-cyan-600
                                                text-white
                                                flex items-center justify-center
                                                shadow-lg shadow-blue-500/20
                                                transition-all duration-300
                                                hover:scale-105
                                                active:scale-95
                                                shrink-0
                                            "
                                            >
                                                ➤
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-slate-400 mt-2 px-1">
                                            Press Enter to send • Shift + Enter for a new line
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

                {examPaused && !isCancelled && (
                    <div className="w-full flex items-center justify-between gap-3 px-3 py-0.5 animate-pulse bg-gradient-to-r from-green-700 via-black to-green-700 text-white text-xs font-black">
                        <span>⚓ Exam Paused ⚪ Resume to Continue ⚓</span>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("exam:open:resume:modal"))}
                            className="flex-shrink-0 px-3 py-0.5 bg-white/20 hover:bg-white/40 rounded-lg text-xs font-bold transition whitespace-nowrap"
                        >
                            ▶ Resume Exam
                        </button>
                    </div>
                )}

                {isCancelled && (
                    <div className="w-full flex items-center justify-between gap-3 px-3 py-0.5 bg-red-700 border-t border-red-900 text-white text-xs font-black">
                        <span>🚫 This Exam Session Was Cancelled — Ended ⚓</span>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("exam:open:resume:modal"))}
                            className="flex-shrink-0 px-3 py-0.5 bg-white/20 hover:bg-white/40 rounded-lg text-xs font-bold transition whitespace-nowrap"
                        >
                            ▶ Resume Exam
                        </button>
                    </div>
                )}

                {timeWarning && !timeUp && (
                    <div className={`w-full text-center text-xs font-semibold py-1 px-3 transition-colors ${isStrictMode
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-700"
                        }`}>
                        ⚠️ {isStrictMode ? "Warning" : "Heads up"} — Less than 20% of Exam Time Remaining ⚓
                    </div>
                )}
                {timeUp && isStrictMode && (
                    <div className="w-full text-center text-xs font-black py-1 px-3 bg-red-600 text-white animate-pulse">
                        ⛔ Time is up — Exam is Being Auto Submitted
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            </header>

            {/*  CANCELLED AGGRESSIVE SHUTDOWN OVERLAY  */}
            {isCancelled && cancelWarningCountdown !== null && (
                <div className="fixed inset-0 z-[10200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute -inset-3 rounded-3xl bg-red-500/20 blur-2xl animate-pulse pointer-events-none" />
                        <div className="relative bg-slate-950 border border-red-500/40 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.25)]">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                            {/* Header */}
                            <div className="px-5 py-3 bg-gradient-to-r from-red-950/80 to-slate-950 border-b border-red-900/40 flex items-center gap-3">
                                <span className="text-xl animate-pulse">🚫</span>
                                <div>
                                    <p className="text-red-400 text-[11px] font-black uppercase tracking-widest">Your Session Was Terminated</p>
                                    <p className="text-red-500/60 text-[10px]">Exam Access Has Been Revoked ⚓</p>
                                </div>
                            </div>
                            {/* Body */}
                            <div className="px-5 py-6 text-center">
                                {/* Countdown ring */}
                                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4 mx-auto">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="7" />
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#ef4444" strokeWidth="7"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(cancelWarningCountdown / 20) * 263.9} 263.9`}
                                            style={{ transition: "stroke-dasharray 0.9s linear" }}
                                        />
                                    </svg>
                                    <div>
                                        <div className="text-red-400 text-3xl font-black tabular-nums leading-none">{cancelWarningCountdown}</div>
                                        <div className="text-red-600 text-[9px] uppercase tracking-widest">sec</div>
                                    </div>
                                </div>
                                <p className="text-white text-sm font-black mb-1">Closing Automatically</p>
                                <p className="text-slate-400 text-xs mb-5 leading-relaxed">
                                    Exam Closes in <span className="text-red-400 font-bold">{cancelWarningCountdown}s</span>.{" "}
                                    Resume now to Cancel ShutDown ⚓
                                </p>
                                <button
                                    onClick={() => {
                                        if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
                                        if (cancelIntervalRef.current) { clearInterval(cancelIntervalRef.current); cancelIntervalRef.current = null; }
                                        setCancelWarningCountdown(null);
                                        window.dispatchEvent(new CustomEvent("exam:open:resume:modal"));
                                    }}
                                    className="w-full relative overflow-hidden group px-5 py-3 mb-2.5 bg-gradient-to-r from-green-300 via-yellow-500 to-indigo-300 hover:from-indigo-300 hover:via-white hover:to-green-300 text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all duration-300 active:scale-95"
                                >
                                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative">▶ Resume Exam — Cancel Shutdown</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
                                        if (cancelIntervalRef.current) { clearInterval(cancelIntervalRef.current); cancelIntervalRef.current = null; }
                                        window.history.back();
                                    }}
                                    className="w-full px-4 py-2 border border-red-300 hover:border-red-800 text-white hover:text-red-500 rounded-xl text-xs font-medium transition-all"
                                >
                                    Exit Exam Now
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function Row({ icon, label, value, breakAll }: { icon: React.ReactNode; label: string; value: React.ReactNode; breakAll?: boolean }) {
    return (
        <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 text-slate-400">{icon}</span>
            <div className={breakAll ? "break-all" : ""}>
                <span className="font-semibold text-slate-500">{label}: </span>{value}
            </div>
        </div>
    );
}