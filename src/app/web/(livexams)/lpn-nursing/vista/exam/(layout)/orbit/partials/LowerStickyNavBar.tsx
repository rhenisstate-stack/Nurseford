"use client";

import React, { useEffect, useState } from "react";
import { CustomMiniCalculator } from "@/components/panel/exam/tools/CustomMiniCalculator";
import {
    Calculator, StickyNote, ZoomIn, ZoomOut,
    Palette, BarChart2, Focus,
    BookOpen, X, Check, Sun, Moon, Minus,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useLowerRibbon } from "./LowerRibbonContext";
import {
    useExamTheme,
    ExamCustomColors,
    ExamThemeTarget,
} from "@/lib/contexts/web/assessment/theme/ExamThemeContext";
import {
    useExamFontSize,
    ExamFontSizes,
} from "@/lib/contexts/web/assessment/theme/ExamFontSizeContext";
import { Type } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// MODAL SHELL
// ─────────────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
    open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{title}</span>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all group">
                        <X size={15} className="group-hover:rotate-90 transition-transform duration-200" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRATCH PAD
// ─────────────────────────────────────────────────────────────────────────────
function ScratchPad() {
    const STORAGE_KEY = "exam_scratchpad";
    const [notes, setNotes] = useState("");
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { setNotes(saved); setCharCount(saved.length); } } catch { }
    }, []);

    const save = (val: string) => {
        setNotes(val);
        setCharCount(val.length);
        try { localStorage.setItem(STORAGE_KEY, val); } catch { }
    };

    return (
        <div className="space-y-3">
            <textarea
                value={notes}
                onChange={e => save(e.target.value)}
                placeholder="Temporary Jot Anything Here ;  Auto Saved . . . 🖋️"
                rows={10}
                className="w-full text-sm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 resize-none placeholder:text-amber-300 dark:placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>{charCount} Chars · Auto-Saved ⚓</span>
                <button onClick={() => save("")} className="text-red-400 hover:text-red-600 font-semibold transition-colors">Clear Contents</button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// READING RULER  — a horizontal bar that follows the mouse vertically
// ─────────────────────────────────────────────────────────────────────────────
function ReadingRuler({ active }: { active: boolean }) {
    const [y, setY] = useState(0);
    const lineHeight = 28; // px — tweak to match your content line-height

    useEffect(() => {
        if (!active) return;
        const onMove = (e: MouseEvent) => setY(e.clientY);
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [active]);

    if (!active) return null;

    const top = y - lineHeight / 2;
    const bottom = y + lineHeight / 2;

    return (
        <>
            {/* Dim above */}
            <div
                className="fixed inset-x-0 top-0 z-[8888] pointer-events-none"
                style={{
                    height: `${top}px`,
                    background: "rgba(0,0,0,0.35)",
                }}
            />
            {/* Clear window — exact ruler line */}
            <div
                className="fixed inset-x-0 z-[8888] pointer-events-none"
                style={{
                    top: `${top}px`,
                    height: `${lineHeight}px`,
                    background: "rgba(99,102,241,0.08)",
                    borderTop: "1.5px solid rgba(99,102,241,0.7)",
                    borderBottom: "1.5px solid rgba(99,102,241,0.7)",
                    boxShadow: "0 0 0 1px rgba(99,102,241,0.15)",
                }}
            />
            {/* Dim below */}
            <div
                className="fixed inset-x-0 bottom-0 z-[8888] pointer-events-none"
                style={{
                    top: `${bottom}px`,
                    background: "rgba(0,0,0,0.35)",
                }}
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS LENS — square spotlight that dims everything outside
// ─────────────────────────────────────────────────────────────────────────────
function FocusLens({ active }: { active: boolean }) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const size = 220; // square size in px — tweak freely

    useEffect(() => {
        if (!active) return;
        const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [active]);

    if (!active) return null;

    return (
        <div
            style={{
                position: "fixed",
                left: pos.x - size / 2,
                top: pos.y - size / 2,
                width: size,
                height: size,
                pointerEvents: "none",
                zIndex: 8889,
                borderRadius: "10px",
                border: "2px solid rgba(99,102,241,0.75)",
                boxShadow: `
                    0 0 0 9999px rgba(0,0,0,0.42),
                    inset 0 0 0 1px rgba(255,255,255,0.08),
                    0 4px 24px rgba(99,102,241,0.25)
                `,
            }}
        />
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// THEME MODAL
// ─────────────────────────────────────────────────────────────────────────────
type ColorTarget = keyof ExamCustomColors;
const COLOR_TARGETS: { value: ColorTarget; label: string }[] = [
    { value: "upperNavbar", label: "Upper Navbar — BG" },
    { value: "upperNavText", label: "Upper Navbar — Text" },
    { value: "lowerNavbar", label: "Lower Navbar — BG" },
    { value: "lowerNavText", label: "Lower Navbar — Text" },
    { value: "nonStickyNavbar", label: "Non-Sticky Nav — BG" },
    { value: "nonStickyNavText", label: "Non-Sticky Nav — Text" },
    { value: "leftSidebar", label: "Left Sidebar — BG" },
    { value: "leftSidebarText", label: "Left Sidebar — Text" },
    { value: "rightSidebar", label: "Right Sidebar — BG" },
    { value: "rightSidebarText", label: "Right Sidebar — Text" },
    { value: "content", label: "Content — BG" },
    { value: "contentText", label: "Content — Text" },
    { value: "footer", label: "Footer — BG" },
    { value: "footerText", label: "Footer — Text" },
];
const COLOR_TO_TARGET: Partial<Record<ColorTarget, ExamThemeTarget>> = {
    upperNavbar: "upperNavbar",
    lowerNavbar: "lowerNavbar",
    nonStickyNavbar: "nonStickyNavbar",
    leftSidebar: "leftSidebar",
    rightSidebar: "rightSidebar",
    content: "content",
    footer: "footer",
};

function ThemeModalContent() {
    const { theme, effectiveColors, setTheme, setCustomColors, resetCustomColors, applyGlobalMode } = useExamTheme();
    const [colorTarget, setColorTarget] = useState<ColorTarget>("upperNavbar");
    const activeMode = theme.global;

    const handleColor = (hex: string) => {
        setCustomColors({ [colorTarget]: hex });
        const st = COLOR_TO_TARGET[colorTarget];
        if (st) setTheme(st, "custom");
        setTheme("global", "custom");
    };

    return (
        <div className="space-y-5" style={{ fontSize: "var(--exam-content-font-base)" }}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Global Preset</p>
                <div className="grid grid-cols-4 gap-2">
                    {(["default", "light", "dark", "custom"] as const).map(m => (
                        <button key={m} onClick={() => applyGlobalMode(m)}
                            className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-xs font-bold transition-all active:scale-95 ${m === activeMode ? "bg-blue-50 dark:bg-blue-900/40 border-blue-400 text-blue-700 dark:text-blue-300" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-300"}`}>
                            {m === "light" && <Sun size="1em" />}
                            {m === "dark" && <Moon size="1em" />}
                            {m === "default" && <span className="text-base">🎨</span>}
                            {m === "custom" && <Palette size="1em" className="text-purple-500" />}
                            <span className="capitalize text-[10px]">{m}</span>
                            {m === activeMode && <Check size={10} className="text-blue-500" />}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Per-Section Colors</p>
                <div className="grid grid-cols-4 gap-1.5">
                    {COLOR_TARGETS.map(({ value, label }) => (
                        <button key={value} title={label} onClick={() => setColorTarget(value)}
                            className={`h-8 rounded-lg border-2 transition-all ${colorTarget === value ? "border-blue-500 scale-110 shadow-md" : "border-transparent hover:border-slate-400"}`}
                            style={{ backgroundColor: effectiveColors[value] }} />
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                    Editing : <span className="font-semibold text-slate-600 dark:text-slate-300">{COLOR_TARGETS.find(t => t.value === colorTarget)?.label}</span>
                </p>
            </div>
            <HexColorPicker color={effectiveColors[colorTarget]} onChange={handleColor} style={{ width: "100%", height: "140px" }} />
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border border-slate-200 flex-shrink-0" style={{ backgroundColor: effectiveColors[colorTarget] }} />
                <input type="text" value={effectiveColors[colorTarget]} onChange={e => handleColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <button onClick={() => { resetCustomColors(); applyGlobalMode("default"); }}
                className="w-full py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-300 hover:text-red-500 transition-all">
                Reset to Defaults
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FONT SIZE MODAL
// ─────────────────────────────────────────────────────────────────────────────
const FONT_SECTIONS: { key: keyof ExamFontSizes; label: string }[] = [
    { key: "upperNavbar", label: "Upper Navbar" },
    { key: "lowerNavbar", label: "Lower Navbar" },
    { key: "nonStickyNavbar", label: "Non-Sticky Navbar" },
    { key: "leftSidebar", label: "Left Sidebar" },
    { key: "rightSidebar", label: "Right Sidebar" },
    { key: "content", label: "Content" },
    { key: "footer", label: "Footer" },
];
const FONT_PRESETS = ["xs", "sm", "md", "lg", "xl"] as const;

function FontModalContent() {
    const { preset, fontSizes, applyPreset, scaleSection, resetFontSizes } = useExamFontSize();
    return (
        <div className="space-y-5" style={{ fontSize: "var(--exam-content-font-base)" }}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Global Preset</p>
                <div className="grid grid-cols-5 gap-1.5">
                    {FONT_PRESETS.map((p) => (
                        <button key={p} onClick={() => applyPreset(p)}
                            className={`py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${preset === p ? "bg-blue-50 dark:bg-blue-900/40 border-blue-400 text-blue-700 dark:text-blue-300" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300"}`}>
                            {p.toUpperCase()}
                            {preset === p && <span className="block text-[8px] text-blue-400 mt-0.5">active</span>}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Per-Section Size</p>
                <div className="space-y-2">
                    {FONT_SECTIONS.map(({ key, label }) => {
                        const sizes = fontSizes[key];
                        return (
                            <div key={key} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">sm {sizes.sm}px · base {sizes.base}px · lg {sizes.lg}px · xl {sizes.xl}px</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button onClick={() => scaleSection(key, -1)} className="w-7 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition active:scale-95 text-slate-600 dark:text-slate-300"><ZoomOut size={11} /></button>
                                    <span className="text-[11px] font-black font-mono text-slate-700 dark:text-slate-200 w-8 text-center">{sizes.base}px</span>
                                    <button onClick={() => scaleSection(key, +1)} className="w-7 h-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition active:scale-95 text-slate-600 dark:text-slate-300"><ZoomIn size={11} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button onClick={resetFontSizes} className="w-full py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-300 hover:text-red-500 transition-all">Reset to Defaults</button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIDENCE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ConfidenceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [level, setLevel] = useState<number | null>(null);
    const levels = [
        { v: 1, label: "Guessing", desc: "You are mostly unsure", color: "bg-red-500", emoji: "🤔" },
        { v: 2, label: "Unsure", desc: "Some confidence but doubtful", color: "bg-orange-500", emoji: "😐" },
        { v: 3, label: "Fairly Sure", desc: "You think the answer is correct", color: "bg-yellow-500", emoji: "🙂" },
        { v: 4, label: "Very Confident", desc: "You are highly confident", color: "bg-emerald-500", emoji: "😎" },
    ];

    const handleSelect = (v: number) => {
        setLevel(v);
        try { localStorage.setItem("exam_confidence_level", String(v)); } catch { }
        setTimeout(() => onClose(), 300);
    };

    return (
        <Modal open={open} onClose={onClose} title="Confidence Meter">
            <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Rate how confident you are with your current answer.</p>
                <div className="space-y-2">
                    {levels.map((l) => (
                        <button key={l.v} onClick={() => handleSelect(l.v)}
                            className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${level === l.v ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}>
                            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center text-lg ${l.color}`}>{l.emoji}</div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-bold text-slate-800 dark:text-white">{l.label}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{l.desc}</div>
                            </div>
                            {level === l.v && <Check size={18} className="text-blue-500" />}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FONT SIZE CONTROL  (inline ribbon widget)
// ─────────────────────────────────────────────────────────────────────────────
function FontSizeControl() {
    const { scaleGlobal, fontSizes } = useExamFontSize();
    const displaySize = fontSizes.content.base;

    return (
        <div className="flex items-center justify-center gap-1 py-0.5 px-2 rounded-lg border bg-gradient-to-br from-green-200 via-blue-100 to-slate-300 border-purple-600 text-black shadow-sm hover:shadow-md transition-all duration-150 active:scale-95 hover:border-red-400 hover:from-green-300 hover:via-amber-100 hover:to-green-300 flex-shrink-0 min-w-fit max-w-fit overflow-hidden">
            <button onClick={() => scaleGlobal(-1)} className="flex items-center justify-center rounded-md transition-all active:scale-95 hover:bg-white/40 shrink-0"
                style={{ width: "calc(var(--exam-lower-nav-font-base) * 1.6)", height: "calc(var(--exam-lower-nav-font-base) * 1.6)" }}>
                <ZoomOut style={{ width: "calc(var(--exam-lower-nav-font-sm) * 0.95)", height: "calc(var(--exam-lower-nav-font-sm) * 0.95)" }} />
            </button>
            <div className="flex flex-col items-center leading-none px-0.5 shrink-0">
                <span className="font-black text-black font-mono" style={{ fontSize: "var(--exam-lower-nav-font-sm)" }}>{displaySize}px</span>
                <span className="uppercase tracking-wide text-black/70 font-bold" style={{ fontSize: "calc(var(--exam-lower-nav-font-sm) * 0.72)" }}>size</span>
            </div>
            <button onClick={() => scaleGlobal(+1)} className="flex items-center justify-center rounded-md transition-all active:scale-95 hover:bg-white/40 shrink-0"
                style={{ width: "calc(var(--exam-lower-nav-font-base) * 1.6)", height: "calc(var(--exam-lower-nav-font-base) * 1.6)" }}>
                <ZoomIn style={{ width: "calc(var(--exam-lower-nav-font-sm) * 0.95)", height: "calc(var(--exam-lower-nav-font-sm) * 0.95)" }} />
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICON BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function IconBtn({ icon, label, active, onClick, accent, className = "" }: {
    icon: React.ReactNode; label: string; active?: boolean;
    onClick: () => void; accent?: string; className?: string;
}) {
    return (
        <button onClick={onClick} title={label}
            className={`flex items-center justify-center gap-1 py-0.5 px-2 rounded-lg border transition-all duration-150 active:scale-95 flex-none w-auto min-w-fit shrink-0 ${active ? `${accent ?? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-600 dark:text-blue-400"}` : "bg-gradient-to-br from-green-200 via-blue-100 to-slate-300 border-purple-600 text-black shadow-sm hover:shadow-md hover:border-red-400 hover:text-black hover:from-green-300 hover:via-amber-100 hover:to-green-300"} ${className}`}
            style={{ fontSize: "var(--exam-lower-nav-font-sm)" }}>
            <span className="flex items-center justify-center shrink-0 leading-none">{icon}</span>
            <span className="font-bold uppercase tracking-wide whitespace-nowrap hidden sm:block" style={{ fontSize: "calc(var(--exam-lower-nav-font-sm) * 0.78)" }}>{label}</span>
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function LowerStickyNavBar({
    questionsAnswered = 0,
    totalQuestions = 0,
}: {
    questionsAnswered?: number;
    totalQuestions?: number;
}) {
    const { isOpen } = useLowerRibbon();

    const [calcOpen, setCalcOpen] = useState(false);
    const [padOpen, setPadOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [refOpen, setRefOpen] = useState(false);
    const [confidenceOpen, setConfidenceOpen] = useState(false);
    const [fontOpen, setFontOpen] = useState(false);

    // ── Reading Ruler — actually works, follows mouse ──────────────────────────
    const [rulerActive, setRulerActive] = useState(false);
    const [focusActive, setFocusActive] = useState(false);

    if (!isOpen) return null;

    const completion = totalQuestions > 0 ? Math.round(questionsAnswered / totalQuestions * 100) : 0;

    return (
        <>
            {/* Reading Ruler overlay */}
            <ReadingRuler active={rulerActive} />
            <FocusLens active={focusActive} />

            {/* Ribbon */}
            <div
                style={{ backgroundColor: "var(--exam-lower-nav-bg)", color: "var(--exam-lower-nav-text)", fontSize: "var(--exam-lower-nav-font-base)" }}
                className="w-full sticky top-[var(--upper-nav-height,56px)] z-40 border-b border-border-var(--exam-lower-nav-text) shadow-sm backdrop-blur-md transition-colors duration-300 px-2 sm:px-4 py-0.5"
            >
                <div className="flex items-center justify-between gap-1 w-full overflow-x-auto overflow-y-hidden scrollbar-hide whitespace-nowrap">

                    {/* Calculator */}
                    <IconBtn icon={<Calculator />} label="Calculator" active={calcOpen} onClick={() => setCalcOpen(true)} />

                    {/* Scratch Pad */}
                    <IconBtn icon={<StickyNote />} label="Scratch Pad" active={padOpen} onClick={() => setPadOpen(true)}
                        accent="bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600 dark:text-amber-400" />

                    {/* Font Size inline control - hidden on phones */}
                    <div className="hidden md:flex items-center justify-center flex-none shrink-0 px-1">
                        <FontSizeControl />
                    </div>

                    {/* Reading Ruler — WORKS: follows mouse */}
                    <IconBtn icon={<Minus />} label="Ruler" active={rulerActive}
                        onClick={() => setRulerActive(v => !v)}
                        accent="bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-600"
                        className="hidden sm:flex" />

                    {/* Focus Lens */}
                    <IconBtn icon={<Focus />} label="Focus" active={focusActive}
                        onClick={() => setFocusActive(v => !v)}
                        accent="bg-violet-50 dark:bg-violet-950/40 border-violet-300 text-violet-600"
                        className="hidden sm:flex" />

                    {/* Confidence — TABLET+ */}
                    <IconBtn className="hidden md:flex" icon={<BarChart2 />} label="Confidence"
                        active={confidenceOpen} onClick={() => setConfidenceOpen(true)}
                        accent="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600" />

                    {/* Reference */}
                    <IconBtn icon={<BookOpen />} label="Reference" onClick={() => setRefOpen(true)}
                        accent="bg-teal-50 dark:bg-teal-950/40 border-teal-300 text-teal-600" />

                    {/* Stats */}
                    <IconBtn icon={<BarChart2 />} label="Statistics" onClick={() => setStatsOpen(true)}
                        accent="bg-sky-50 dark:bg-sky-950/40 border-sky-300 text-sky-600" />

                    {/* Fonts */}
                    <IconBtn icon={<Type />} label="Fonts" active={fontOpen} onClick={() => setFontOpen(true)}
                        accent="bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-600" />

                    {/* Theme */}
                    <IconBtn icon={<Palette />} label="Theme" active={themeOpen} onClick={() => setThemeOpen(true)}
                        accent="bg-purple-50 dark:bg-purple-950/40 border-purple-300 text-purple-600" />

                </div>
            </div>

            {/* MODALS */}
            <Modal open={calcOpen} onClose={() => setCalcOpen(false)} title="Calculator">
                <CustomMiniCalculator />
            </Modal>

            <Modal open={padOpen} onClose={() => setPadOpen(false)} title="Scratch Pad">
                <ScratchPad />
            </Modal>

            <Modal open={fontOpen} onClose={() => setFontOpen(false)} title="Font Sizes">
                <FontModalContent />
            </Modal>

            <Modal open={themeOpen} onClose={() => setThemeOpen(false)} title="Exam Theme">
                <ThemeModalContent />
            </Modal>

            <ConfidenceModal open={confidenceOpen} onClose={() => setConfidenceOpen(false)} />

            {/* Stats */}
            <Modal open={statsOpen} onClose={() => setStatsOpen(false)} title="Session Stats">
                <div className="space-y-3">
                    <StatRow label="Total Questions" value={`${totalQuestions}`} />
                    <StatRow label="Answered" value={`${questionsAnswered} / ${totalQuestions}`} />
                    <StatRow label="Remaining" value={`${Math.max(0, totalQuestions - questionsAnswered)}`} />
                    <StatRow label="Completion" value={`${completion}%`} />

                    {/* Progress bar */}
                    <div className="pt-1">
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${completion}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 text-center">{completion}% Complete</p>
                    </div>

                    <p className="text-[10px] text-slate-400 pt-1">Updates live as you answer questions ⚓</p>
                </div>
            </Modal>

            {/* Reference */}
            <Modal open={refOpen} onClose={() => setRefOpen(false)} title="Quick Reference">
                <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                    <p>Your reference sheet content goes here.</p>
                    <p className="text-[10px] text-slate-400">Wire up to your reference data source.</p>
                </div>
            </Modal>
        </>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
            <span className="text-sm font-black text-slate-800 dark:text-white">{value}</span>
        </div>
    );
}