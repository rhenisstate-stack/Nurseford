"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Palette, ChevronDown, X, Check } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import {
    useExamTheme,
    ExamCustomColors,
    ExamThemeTarget,
} from "@/lib/contexts/web/assessment/theme/ExamThemeContext";   // ← adjust path if needed

// ── Section labels shown in the picker ───────────────────────────────────────
type ColorTarget = keyof ExamCustomColors;

const COLOR_TARGETS: { value: ColorTarget; label: string }[] = [
    { value: "upperNavbar",  label: "Upper Navbar — Background" },
    { value: "upperNavText", label: "Upper Navbar — Text"       },
    { value: "lowerNavbar",  label: "Lower Navbar — Background" },
    { value: "lowerNavText", label: "Lower Navbar — Text"       },
    { value: "content",      label: "Content — Background"      },
    { value: "contentText",  label: "Content — Text"            },
    { value: "footer",       label: "Footer — Background"       },
    { value: "footerText",   label: "Footer — Text"             },
];

// Map color key → theme target (for per-section setTheme calls) 
const COLOR_TO_TARGET: Partial<Record<ColorTarget, ExamThemeTarget>> = {
    upperNavbar:  "upperNavbar",
    lowerNavbar:  "lowerNavbar",
    content:      "content",
    footer:       "footer",
};

// ─────────────────────────────────────────────────────────────────────────────
const ExamThemeDropdown: React.FC = () => {
    const [isOpen,          setIsOpen]          = useState(false);
    const [pickerOpen,      setPickerOpen]       = useState(false);
    const [colorTarget,     setColorTarget]      = useState<ColorTarget>("upperNavbar");

    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        theme, effectiveColors,
        setTheme, setCustomColors, resetCustomColors, applyGlobalMode,
    } = useExamTheme();

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Mode selection (global presets)
    const handleGlobalMode = (mode: "default" | "light" | "dark" | "custom") => {
        if (mode === "custom") {
            applyGlobalMode("custom");
            setPickerOpen(true);
        } else {
            applyGlobalMode(mode);
        }
        setIsOpen(false);
    };

    // Color picker change
    const handleColorChange = (hex: string) => {
        setCustomColors({ [colorTarget]: hex });
        // Mark the owning section as "custom"
        const sectionTarget = COLOR_TO_TARGET[colorTarget];
        if (sectionTarget) setTheme(sectionTarget, "custom");
        setTheme("global", "custom");
    };

    // Reset
    const handleReset = () => {
        resetCustomColors();
        applyGlobalMode("default");
        setPickerOpen(false);
        setIsOpen(false);
    };

    // Active mode label
    const activeMode = theme.global;

    const ModeIcon = activeMode === "dark"
        ? Moon
        : activeMode === "light"
            ? Sun
            : Palette;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="relative flex-shrink-0" ref={dropdownRef}>

            {/* Trigger button */}
            <button
                onClick={() => { setIsOpen(v => !v); setPickerOpen(false); }}
                title="Exam Theme"
                className="
                    flex items-center gap-1.5 px-2.5 py-1.5
                    bg-white dark:bg-slate-700
                    border border-slate-200 dark:border-slate-600
                    hover:border-blue-400 hover:text-blue-600
                    text-slate-500 dark:text-slate-300
                    text-xs font-semibold rounded-xl
                    transition-all duration-150 active:scale-95
                "
            >
                <ModeIcon size={14} className={activeMode === "custom" ? "text-purple-500" : ""} />
                <span className="hidden sm:inline capitalize">{activeMode}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mode dropdown */}
            {isOpen && (
                <div className="
                    absolute bottom-full left-0 mb-2
                    w-44
                    bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-600
                    rounded-xl shadow-xl py-1.5
                    z-[9999]
                ">
                    {(["default", "light", "dark", "custom"] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => handleGlobalMode(mode)}
                            className={`
                                flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium
                                transition-colors
                                ${mode === activeMode
                                    ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}
                            `}
                        >
                            {mode === "light"   && <Sun    size={13} />}
                            {mode === "dark"    && <Moon   size={13} />}
                            {mode === "custom"  && <Palette size={13} className="text-purple-500" />}
                            {mode === "default" && <Palette size={13} className="text-blue-500"   />}
                            <span className="capitalize">{mode}</span>
                            {mode === activeMode && <Check size={12} className="ml-auto" />}
                        </button>
                    ))}

                    {/* Open picker without changing mode */}
                    <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                        <button
                            onClick={() => { setPickerOpen(v => !v); setIsOpen(false); }}
                            className="
                                flex items-center gap-2 w-full text-left px-3 py-2
                                text-xs font-medium text-purple-600 dark:text-purple-400
                                hover:bg-purple-50 dark:hover:bg-purple-900/30
                                transition-colors
                            "
                        >
                            <Palette size={13} />
                            Custom Colors…
                        </button>
                    </div>
                </div>
            )}

            {/* Color picker panel */}
            {pickerOpen && (
                <div className="
                    fixed inset-0 flex items-center justify-center z-[9999]
                    bg-black/20 backdrop-blur-sm
                ">
                    <div className="
                        relative
                        bg-white dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700
                        rounded-2xl shadow-2xl
                        p-5 w-[300px]
                        text-center
                    ">
                        {/* Close */}
                        <button
                            onClick={() => setPickerOpen(false)}
                            className="
                                absolute top-3 right-3
                                p-1.5 rounded-full
                                border border-slate-200 dark:border-slate-600
                                hover:bg-red-50 hover:border-red-300
                                transition-all
                                group
                            "
                        >
                            <X size={14} className="text-slate-400 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-200" />
                        </button>

                        <h2 className="text-sm font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                            Exam Theme Palette
                        </h2>

                        {/* Section selector */}
                        <div className="mb-4 text-left">
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                                Target Section
                            </label>
                            <select
                                value={colorTarget}
                                onChange={e => setColorTarget(e.target.value as ColorTarget)}
                                className="
                                    w-full p-2 text-xs
                                    border border-slate-200 dark:border-slate-600
                                    rounded-lg
                                    bg-slate-50 dark:bg-slate-700
                                    text-slate-800 dark:text-slate-200
                                    focus:outline-none focus:ring-2 focus:ring-blue-400
                                "
                            >
                                {COLOR_TARGETS.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Color preview row */}
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-600 flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: effectiveColors[colorTarget] }}
                            />
                            <input
                                type="text"
                                value={effectiveColors[colorTarget]}
                                onChange={e => handleColorChange(e.target.value)}
                                className="
                                    flex-1 p-1.5 text-xs font-mono
                                    border border-slate-200 dark:border-slate-600
                                    rounded-lg
                                    bg-white dark:bg-slate-700
                                    text-slate-800 dark:text-slate-200
                                    focus:outline-none focus:ring-2 focus:ring-blue-400
                                "
                            />
                        </div>

                        {/* Hex picker */}
                        <div className="flex justify-center mb-4">
                            <HexColorPicker
                                color={effectiveColors[colorTarget]}
                                onChange={handleColorChange}
                                style={{ width: "100%", height: "160px" }}
                            />
                        </div>

                        {/* Live preview strip */}
                        <div className="grid grid-cols-4 gap-1 mb-4">
                            {COLOR_TARGETS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    title={label}
                                    onClick={() => setColorTarget(value)}
                                    className={`
                                        h-6 rounded-md border-2 transition-all
                                        ${colorTarget === value ? "border-blue-500 scale-110" : "border-transparent hover:border-slate-400"}
                                    `}
                                    style={{ backgroundColor: effectiveColors[value] }}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <button
                            onClick={() => setPickerOpen(false)}
                            className="
                                w-full py-2 mb-2 text-xs font-bold rounded-xl
                                bg-blue-600 hover:bg-blue-700
                                text-white
                                transition-all active:scale-95
                            "
                        >
                            Apply &amp; Close
                        </button>

                        <button
                            onClick={handleReset}
                            className="
                                w-full py-1.5 text-xs font-semibold rounded-xl
                                border border-slate-200 dark:border-slate-600
                                text-slate-500 dark:text-slate-400
                                hover:border-red-300 hover:text-red-500
                                transition-all active:scale-95
                            "
                        >
                            Reset to Defaults
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamThemeDropdown;