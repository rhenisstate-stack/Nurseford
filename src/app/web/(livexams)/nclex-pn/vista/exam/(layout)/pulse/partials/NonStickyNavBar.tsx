// src\app\web\(nursing)\atiteas\vista\exam\(layout)\generic\partials\NonStickyNavBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useNonStickyRibbon } from "./NonStickyRibbonContext";
import { useLiveStrataExamContext } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";
import { Plus, Minus, RotateCcw, RefreshCw } from "lucide-react";
import {
  LayoutList,
  X,
  Info,
  Settings,
  MessageSquare,
  Pause,
  SquarePower,
  Share2,
  Copy,
  Check,
  Type,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import {
  useExamTheme,
  ExamCustomColors,
  ExamThemeTarget,
} from "@/lib/contexts/web/assessment/theme/ExamThemeContext";
import {
  useExamFontSize,
  ExamFontSizes,
} from "@/lib/contexts/web/assessment/theme/ExamFontSizeContext";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

type ColorTarget = keyof ExamCustomColors;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// MENU NAVIGATOR  — fixed version
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────


interface NavQuestion {
  index: number;
  type: string;
  sectionName: string;
  questionId: number; // needed to look up resumeAnswers
}

function MenuNavigator({ onClose }: { onClose: () => void }) {
  const { examSession } = useLiveStrataExamContext();
  const [goInput, setGoInput] = useState("");
  const [goError, setGoError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Derive flat questions (always fresh from context)
  let _qi = 0;
  const questions: NavQuestion[] = (examSession?.sections ?? []).flatMap(
    (section: { name?: string; questions?: { id: number; type?: string }[] }) =>
      (section.questions ?? []).map((q: { id: number; type?: string }) => ({
        index: ++_qi,
        type: q.type ?? "",
        sectionName: section.name ?? "",
        questionId: q.id,
      }))
  );

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Answered set (from resumeAnswers keyed by questionId)
  const answeredIds = new Set<number>(
    Object.keys(examSession?.resumeAnswers ?? {}).map(Number)
  );

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Current position — listen to exam:state broadcasts
  const [currentIndex, setCurrentIndex] = useState(1);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail.currentIndex === "number") {
        setCurrentIndex(detail.currentIndex + 1); // convert 0-based → 1-based
      }
    };
    window.addEventListener("exam:state", handler);
    // Request the current state immediately
    setTimeout(
      () => window.dispatchEvent(new CustomEvent("exam:state:request")),
      0
    );
    return () => window.removeEventListener("exam:state", handler);
  }, []);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Auto-scroll active button into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector(
      "[data-active='true']"
    ) as HTMLElement | null;
    active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentIndex]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Smooth close helper 
  const smoothClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200); // matches animate-out duration
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Jump: dispatch exam:jump — page.tsx MUST listen for this (see fix below)
  const jump = (oneBasedIdx: number) => {
    window.dispatchEvent(
      new CustomEvent("exam:jump", { detail: { index: oneBasedIdx - 1 } })
    );
    smoothClose();
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Go-to-question handler
  const handleGo = () => {
    const n = parseInt(goInput, 10);
    if (!n || n < 1 || n > questions.length) {
      setGoError(true);
      setTimeout(() => setGoError(false), 800);
      return;
    }
    jump(n);
  };

  const total = questions.length;
  const answeredCount = questions.filter((q) =>
    answeredIds.has(q.questionId)
  ).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className={isClosing ? "animate-out fade-out zoom-out-95 duration-200" : ""}>
      {/* HEADER */}
      <div className="bg-slate-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
        <h2 className="text-base font-semibold">Question Navigator</h2>
        <button
          onClick={smoothClose}
          className="bg-red-500 hover:bg-red-600 rounded-lg p-1.5 transition"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-3 bg-gray-100">
        <div className="grid grid-cols-[90px_1fr] gap-3">

          {/* LEFT — scrollable question list */}
          <div
            ref={listRef}
            className="bg-blue-100 rounded-lg p-2 h-72 overflow-y-auto space-y-1"
          >
            {questions.length === 0 ? (
              <div className="text-xs text-center text-gray-400 mt-8">
                Loading . . .
              </div>
            ) : (
              questions.map((q) => {
                const isActive = q.index === currentIndex;
                const isAnswered = answeredIds.has(q.questionId);
                return (
                  <button
                    key={q.index}
                    data-active={isActive}
                    onClick={() => jump(q.index)}
                    title={q.type || "Question"}
                    className={`
                        w-full py-1 rounded text-sm font-semibold transition-all
                        ${isActive
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                        : isAnswered
                          ? "bg-purple-700 text-white hover:bg-purple-800"
                          : "bg-white hover:bg-blue-200 text-gray-700"
                      }
                      `}
                  >
                    {q.index}
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">

            {/* INDICATORS */}
            <div className="bg-white rounded-lg shadow border p-3">
              <div className="bg-gray-500 text-white text-center rounded py-1 text-xs font-semibold mb-3">
                Quick Indicators
              </div>
              <div className="space-y-2 text-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-purple-700 rounded flex-shrink-0" />
                    <span className="text-xs">Answered</span>
                  </div>
                  <span className="text-xs font-bold text-purple-700">
                    {answeredCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-white border border-gray-300 rounded flex-shrink-0" />
                    <span className="text-xs">Unanswered</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {unansweredCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-indigo-600 rounded flex-shrink-0" />
                    <span className="text-xs">Current</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {currentIndex}
                  </span>
                </div>
              </div>
            </div>

            {/* GO TO QUESTION */}
            <div className="bg-blue-200 rounded-lg shadow p-3 flex-1 text-emerald-900">
              <div className="text-center text-sm font-bold mb-3">
                Jump &amp;  Go to Question
              </div>
              <input
                type="number"
                min={1}
                max={total}          // ← enforces browser-level max
                value={goInput}
                onChange={(e) => {
                  // Clamp on change so you can never type beyond total
                  const raw = e.target.value;
                  if (raw === "") { setGoInput(""); return; }
                  const n = Math.min(Math.max(1, parseInt(raw, 10)), total);
                  setGoInput(String(n));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleGo()}
                placeholder={`1 – ${total}`}
                className={`
                    w-full bg-white rounded-lg border px-3 py-2 font-bold text-sm text-center outline-none mb-3 transition
                    ${goError ? "border-red-500 bg-red-50" : "border-transparent"}
                  `}
              />
              <button
                onClick={handleGo}
                className="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2 text-sm font-semibold transition"
              >
                Click to Submit &amp; Go !
              </button>

              {/* Mini progress */}
              <div className="mt-3 w-full h-1.5 rounded-full bg-white/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width:
                      total > 0
                        ? `${(currentIndex / total) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <div className="text-center text-xs text-gray-600 mt-2">
                {currentIndex} of {total} — Wish You All the Best ⚓
              </div>
            </div>

          </div>
        </div>

        <div className="border-t mt-3 pt-2 text-center text-xs text-gray-500">
          Click a Question Number To Navigate - {" "}
          <span className="text-purple-700 font-semibold">Purple = Answered</span>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// SETTINGS MODAL CONTENT  — Theme + Fonts, wired to existing contexts
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const COLOR_TARGETS_CONFIG: { value: ColorTarget; label: string }[] = [
  { value: "upperNavbar", label: "Upper nav — BG" },
  { value: "upperNavText", label: "Upper nav — text" },
  { value: "lowerNavbar", label: "Lower nav — BG" },
  { value: "lowerNavText", label: "Lower nav — text" },
  { value: "nonStickyNavbar", label: "Non-sticky nav — BG" },
  { value: "nonStickyNavText", label: "Non-sticky nav — text" },
  { value: "content", label: "Content — BG" },
  { value: "contentText", label: "Content — text" },
  { value: "footer", label: "Footer — BG" },
  { value: "footerText", label: "Footer — text" },
  { value: "leftSidebar", label: "Left sidebar — BG" },
  { value: "leftSidebarText", label: "Left sidebar — text" },
  { value: "rightSidebar", label: "Right sidebar — BG" },
  { value: "rightSidebarText", label: "Right sidebar — text" },
];

const FONT_SECTION_KEYS: { key: keyof ExamFontSizes; label: string }[] = [
  { key: "upperNavbar", label: "Upper nav" },
  { key: "lowerNavbar", label: "Lower nav" },
  { key: "nonStickyNavbar", label: "Non-sticky nav" },
  { key: "content", label: "Content" },
  { key: "footer", label: "Footer" },
  { key: "leftSidebar", label: "Left sidebar" },
  { key: "rightSidebar", label: "Right sidebar" },
];

const FONT_PRESET_LIST = ["xs", "sm", "md", "lg", "xl"] as const;

type SettingsTab = "fonts" | "theme";

function SettingsModalContent() {
  const [tab, setTab] = useState<SettingsTab>("fonts");
  const { preset, fontSizes, applyPreset, scaleSection, resetFontSizes } = useExamFontSize();
  const { theme, effectiveColors, setTheme, setCustomColors, resetCustomColors, applyGlobalMode } = useExamTheme();
  const [colorTarget, setColorTarget] = useState<ColorTarget>("upperNavbar");
  const [hue, setHue] = useState(0);
  const [lum, setLum] = useState(96);

  const hslToHex = (h: number, s: number, l: number): string => {
    const sl = s / 100; const ll = l / 100;
    const a = sl * Math.min(ll, 1 - ll);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  };

  const syncSliders = (hex: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    const [h, , l] = hexToHsl(hex);
    setHue(h); setLum(l);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { syncSliders(effectiveColors[colorTarget]); }, [colorTarget]);

  const derivedHex = hslToHex(hue, 70, lum);

  const applyDerivedColor = () => {
    setCustomColors({ [colorTarget]: derivedHex });
    const st: Partial<Record<ColorTarget, ExamThemeTarget>> = {
      upperNavbar: "upperNavbar",
      lowerNavbar: "lowerNavbar",
      nonStickyNavbar: "nonStickyNavbar",
      content: "content",
      footer: "footer",
      leftSidebar: "leftSidebar",
      rightSidebar: "rightSidebar",
    };
    const target = st[colorTarget];
    if (target) setTheme(target, "custom");
    setTheme("global", "custom");
  };

  const lumGradient = `linear-gradient(to right,hsl(${hue},70%,10%),hsl(${hue},70%,50%),hsl(${hue},70%,95%))`;

  return (
    <div className="bg-white dark:bg-slate-500 w-full">
      {/* TABS — full width, 50/50 */}
      <div className="flex w-full border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {(["fonts", "theme"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all capitalize border-b-2
                ${tab === t
                ? "border-violet-500 text-violet-200 dark:text-violet-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            {t === "fonts" ? <Type size={12} /> : <Palette size={12} />}
            {t === "fonts" ? "Fonts" : "Theme"}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3 max-h-[65vh] overflow-y-auto">

        {/* ── FONTS TAB ── */}
        {tab === "fonts" && (
          <>
            {/* Global preset */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-green-200 mb-1.5">Global Preset</p>
              <div className="grid grid-cols-5 gap-1">
                {FONT_PRESET_LIST.map((p) => (
                  <button key={p} onClick={() => applyPreset(p)}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all active:scale-95
                        ${preset === p
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-white hover:border-violet-400"}`}>
                    {p.toUpperCase()}
                    {preset === p && <span className="block text-[7px] text-violet-200 mt-0.5">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Per-section */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-green-200 mb-1.5">Per Section</p>
              <div className="space-y-1">
                {FONT_SECTION_KEYS.map(({ key, label }) => {
                  const sz = fontSizes[key] ?? { sm: 0, base: 0, lg: 0, xl: 0 };
                  return (
                    <div key={key}
                      className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-wide text-slate-500 dark:text-green-300 leading-none">{label}</p>
                        <p className="text-[8px] text-red-400 font-mono mt-0.5">{sz.sm}·{sz.base}·{sz.lg}px</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => scaleSection(key, -1)}
                          className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-violet-400 flex items-center justify-center transition active:scale-90">
                          <Minus size={9} />
                        </button>
                        <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-200 w-8 text-center">{sz.base}px</span>
                        <button onClick={() => scaleSection(key, +1)}
                          className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-900 hover:bg-violet-100 dark:hover:bg-red-800 flex items-center justify-center transition active:scale-90">
                          <Plus size={9} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={resetFontSizes}
              className="w-full py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-200 text-green-200 hover:border-red-300 hover:text-red-500 transition-all flex items-center justify-center gap-1.5">
              <RotateCcw size={10} /> Set Default &amp; Reset Fonts
            </button>
          </>
        )}

        {/* ── THEME TAB ── */}
        {tab === "theme" && (
          <>
            {/* Global mode */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-green-200 mb-1.5">Global Mode</p>
              <div className="grid grid-cols-4 gap-1">
                {(["default", "light", "dark", "custom"] as const).map((m) => (
                  <button key={m} onClick={() => applyGlobalMode(m)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[9px] font-bold transition-all active:scale-95
                        ${theme.global === m
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-red-300 text-green-200 hover:border-violet-400"}`}>
                    {m === "light" && <Sun size={12} />}
                    {m === "dark" && <Moon size={12} />}
                    {m === "default" && <Palette size={12} />}
                    {m === "custom" && <Palette size={12} className={theme.global === m ? "text-violet-200" : "text-violet-400"} />}
                    <span className="capitalize">{m}</span>
                    {theme.global === m && <Check size={8} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Section color swatches */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1.5">Section Colors</p>
              <div className="grid grid-cols-4 gap-1 mb-1">
                {COLOR_TARGETS_CONFIG.map(({ value, label }) => (
                  <button key={value} title={label} onClick={() => setColorTarget(value)}
                    className={`h-7 rounded-md border-2 transition-all ${colorTarget === value ? "border-violet-500 scale-110 shadow-md" : "border-transparent hover:border-slate-400"}`}
                    style={{ backgroundColor: effectiveColors[value] }} />
                ))}
              </div>
              <p className="text-[9px] text-slate-400 text-center">
                Editing: <span className="font-bold text-slate-600 dark:text-slate-300">
                  {COLOR_TARGETS_CONFIG.find(t => t.value === colorTarget)?.label}
                </span>
              </p>
            </div>

            {/* Hue slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] text-yellow-200 uppercase tracking-wider font-bold">Hue</p>
                <span className="text-[9px] font-mono text-slate-500">{hue}°</span>
              </div>
              <input type="range" min={0} max={360} value={hue}
                onChange={e => setHue(+e.target.value)}
                className="w-full h-3 rounded-lg cursor-pointer outline-none"
                style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)", WebkitAppearance: "none" }} />
            </div>

            {/* Lightness slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] text-pink-200 uppercase tracking-wider font-bold">Lightness</p>
                <span className="text-[9px] font-mono text-slate-500">{lum}%</span>
              </div>
              <input type="range" min={10} max={95} value={lum}
                onChange={e => setLum(+e.target.value)}
                className="w-full h-3 rounded-lg cursor-pointer outline-none"
                style={{ background: lumGradient, WebkitAppearance: "none" }} />
            </div>

            {/* Preview + apply */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-slate-200 flex-shrink-0 shadow-sm" style={{ backgroundColor: derivedHex }} />
              <code className="flex-1 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 font-mono truncate">{derivedHex}</code>
              <button onClick={applyDerivedColor}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold rounded-lg transition active:scale-95 whitespace-nowrap">
                <Check size={10} /> Apply
              </button>
            </div>

            <button onClick={() => { resetCustomColors(); applyGlobalMode("default"); }}
              className="w-full py-1.5 text-[10px] font-semibold rounded-lg border border-slate-200 dark:border-green-200 text-green-200 hover:border-red-300 hover:text-red-500 transition-all flex items-center justify-center gap-1.5">
              <RotateCcw size={10} /> Default &amp; Reset theme
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function NonStickyNavBar() {
  const [activeModal, setActiveModal] = useState<
    | null
    | "layout"
    | "menu"
    | "settings"
    | "feedback"
    | "details"
    | "pause"
    | "end"
    | "share"
  >(null);

  const [copied, setCopied] = useState(false);
  const { isOpen } = useNonStickyRibbon();

  const { examSession } = useLiveStrataExamContext();

  const existingExamFeedback = examSession?.examActions?.find(
    (a: { actionContent?: string; actionType?: string }) => {
      try { return !!JSON.parse(a.actionContent ?? "{}").Feedback; } catch { return false; }
    }
  );
  const parsedExamFeedbackContent = (() => {
    try { return JSON.parse(existingExamFeedback?.actionContent ?? "{}"); } catch { return {}; }
  })();
  const feedbackRaw = parsedExamFeedbackContent.Feedback;
  const rawFeedbackText: string =
    typeof feedbackRaw === "string"
      ? feedbackRaw
      : typeof feedbackRaw === "object" && feedbackRaw !== null
        ? (feedbackRaw as { ActionContent?: string }).ActionContent ?? ""
        : "";
  const rawFeedbackRating: number =
    typeof feedbackRaw === "object" && feedbackRaw !== null
      ? Number(
        (feedbackRaw as { ActionValue?: string; Value?: string; value?: string }).ActionValue
        ?? (feedbackRaw as { Value?: string }).Value
        ?? (feedbackRaw as { value?: string }).value
        ?? 88
      )
      : 88;
  const feedbackCategoryMatch = rawFeedbackText.match(/^\[(.+?)\]\s*/);
  const [feedbackText, setFeedbackText] = useState(rawFeedbackText.replace(/^\[.*?\]\s*/, ""));
  const [feedbackRating, setFeedbackRating] = useState(rawFeedbackRating);
  const [feedbackCategory, setFeedbackCategory] = useState(feedbackCategoryMatch?.[1] ?? "General Suggestion");

  useEffect(() => {
    if (!existingExamFeedback) return;
    setFeedbackText(rawFeedbackText.replace(/^\[.*?\]\s*/, ""));
    setFeedbackRating(rawFeedbackRating);
    setFeedbackCategory(rawFeedbackText.match(/^\[(.+?)\]\s*/)?.[1] ?? "General Suggestion");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingExamFeedback?.actionContent]);


  const [currentIndex, setCurrentIndex] = useState(0); // 0-based, mirrors page.tsx
  const sessionRow = examSession?.examActions?.[0];
  const initialStatus = sessionRow?.status ?? null;
  const [isPaused, setIsPaused] = useState(initialStatus === "Paused");
  const [isCancelled, setIsCancelled] = useState(initialStatus === "Cancelled");

  // Listen to exam:state so we always know which question is active
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail.currentIndex === "number") setCurrentIndex(detail.currentIndex);
    };
    window.addEventListener("exam:state", handler);
    setTimeout(() => window.dispatchEvent(new CustomEvent("exam:state:request")), 0);
    return () => window.removeEventListener("exam:state", handler);
  }, []);

  // Sync paused/cancelled state from examSession on load
  useEffect(() => {
    const row = examSession?.examActions?.[0];
    if (!row) return;
    setIsPaused(row.status === "Paused");
    setIsCancelled(row.status === "Cancelled");
  }, [examSession]);

  // Open resume modal when user clicks page while paused
  // Open resume modal when user clicks page while paused
  useEffect(() => {
    const onIntercept = () => {
      if (isPaused) setActiveModal("pause");
    };
    window.addEventListener("exam:paused:intercept", onIntercept);
    return () => window.removeEventListener("exam:paused:intercept", onIntercept);
  }, [isPaused]);

  // Open resume modal when triggered from UpperStickyNavBar banners
  useEffect(() => {
    const onOpenResume = () => {
      setIsPaused(true); // ensure modal shows the Resume view, not Pause view
      setActiveModal("pause");
    };
    window.addEventListener("exam:open:resume:modal", onOpenResume);
    return () => window.removeEventListener("exam:open:resume:modal", onOpenResume);
  }, []);

  // Build share URL — inject ?question=<guidId> of the active question
  const { pauseExam, resumeExam, submitExam, submitTool } = useLiveExamActionContext();


  const activeQuestionGuid = (() => {
    if (!examSession) return null;
    let i = 0;
    for (const section of examSession.sections ?? []) {
      for (const q of section.questions ?? []) {
        if (i === currentIndex) return q.guidId;
        i++;
      }
    }
    return null;
  })();

  const currentUrl = (() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search); // preserve existing params
    if (activeQuestionGuid) {
      params.set("target", activeQuestionGuid);              // inject or replace question
    } else {
      params.delete("target");
    }
    const base = window.location.href.split("?")[0];
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  })();


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(currentUrl);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* NAVBAR */}
      <div
        className="w-full border-b px-2 md:px-4 py-1 flex items-center justify-between gap-1 md:gap-3 text-[10px] md:text-sm lg:text-base transition-colors duration-300"
        style={{
          backgroundColor: "var(--exam-non-sticky-nav-bg)",
          color: "var(--exam-non-sticky-nav-text)",
          fontSize: "var(--exam-non-sticky-nav-font-base)",
        }}
      >
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* LEFT ACTIONS */}
        <div className="flex items-center gap-1 md:gap-2 min-w-0">
          <button
            onClick={() => setActiveModal("layout")}
            className="h-7 md:h-8 lg:h-9 px-2 md:px-3 bg-yellow-300 border border-blue-500 text-blue-600 hover:bg-green-200 rounded-md text-[10px] md:text-sm lg:text-base flex items-center justify-center gap-1 md:gap-2 transition whitespace-nowrap"
          >
            <LayoutList className="hidden md:inline-flex" size={16} />
            SWITCH LAYOUT
          </button>

          <button
            onClick={() => setActiveModal("menu")}
            className="h-7 md:h-8 lg:h-9 px-2 md:px-3 bg-indigo-600 hover:bg-green-700 text-white rounded-md text-[10px] md:text-sm lg:text-base flex items-center gap-1 md:gap-2 justify-center transition whitespace-nowrap"
          >
            <LayoutList size={12} className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" />
            Menu
          </button>

          <button
            onClick={() => setActiveModal("share")}
            className="hidden md:inline-flex h-8 lg:h-9 px-3 bg-yellow-300 border border-blue-500 text-blue-800 hover:bg-pink-500 rounded-md text-sm lg:text-base items-center justify-center  gap-1 md:gap-2 transition whitespace-nowrap"
          >
            <Share2 size={12} className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" />
            Share
          </button>

          {/* ATTEMPT COUNTER */}
          {(() => {
            const row = examSession?.examActions?.find(
              (a: { status?: string; attemptCount?: number }) =>
                a.status === "Paused" || (a.attemptCount ?? 0) > 0
            );
            const used = row?.attemptCount ?? 0;
            const allowed = examSession?.exam?.attemptsAllowed ?? 0;
            if (allowed === 0) return null;
            const remaining = Math.max(0, allowed - used);
            const pct = Math.round((used / allowed) * 100);
            const isExhausted = remaining === 0;
            const isWarning = remaining === 1 && allowed > 1;
            return (
              <div
                title={`${remaining} Remaining Attempts · ${used} of ${allowed} Attempts Used`}
                className={`
                    flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-full border text-[10px] font-bold transition whitespace-nowrap cursor-default                    ${isExhausted
                    ? "bg-red-100 border-red-400 text-red-700"
                    : isWarning
                      ? "bg-amber-100 border-amber-400 text-amber-700"
                      : "bg-white border-blue-300 text-blue-700"
                  }
                  `}
              >
                {/* Mini arc */}
                <svg width="18" height="18" viewBox="0 0 36 36" className="-rotate-90 flex-shrink-0 hidden md:block">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={isExhausted ? "#ef4444" : isWarning ? "#f59e0b" : "#3b82f6"}
                    strokeWidth="4"
                    strokeDasharray={`${pct * 0.879} ${87.9 - pct * 0.879}`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Mobile compact */}
                <span className="md:hidden flex items-center gap-0.5">
                  <RefreshCw size={9} />
                  {isExhausted ? "0" : `${used}/${allowed}`}
                </span>
                {/* Desktop full */}
                <span className="hidden md:inline">
                  {isExhausted ? (
                    "No Attempts Left"
                  ) : (
                    <>
                      Used <strong>{used}</strong> of <strong>{allowed}</strong> Attempts
                    </>
                  )}
                </span>
              </div>
            );
          })()}

        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveModal("settings")}
            className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 bg-indigo-800 hover:bg-green-700 text-white rounded-md flex items-center justify-center transition"
          >
            <Settings
              size={12}
              className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]"
            />
          </button>

          <button
            onClick={() => setActiveModal("feedback")}
            className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 bg-green-700 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition"
          >
            <MessageSquare
              size={12}
              className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]"
            />
          </button>

          <button
            onClick={() => setActiveModal("details")}
            className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 bg-gray-500 hover:bg-yellow-600 text-white rounded-md flex items-center justify-center transition"
          >
            <Info
              size={12}
              className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]"
            />
          </button>

          <button
            onClick={() => setActiveModal("pause")}
            className={`h-7 w-7 md:h-8 md:w-auto md:px-3 lg:h-9 text-white rounded-md flex items-center justify-center md:justify-center gap-0 md:gap-2 transition ${isPaused ? "bg-red-800 hover:bg-emerald-700 animate-pulse" : "bg-yellow-900 hover:bg-indigo-800"
              }`}
          >
            <Pause size={12} className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" />
            <span className="hidden md:inline text-xs md:text-sm lg:text-base">
              {isPaused ? "Exam Paused" : "Pause"}
            </span>
          </button>

          <button
            onClick={() => setActiveModal("end")}
            className="h-7 w-7 md:h-8 md:w-auto md:px-3 lg:h-9 bg-pink-700 hover:bg-gray-800 text-white rounded-md flex items-center justify-center md:justify-center gap-0 md:gap-2 transition"
          >
            <SquarePower
              size={12}
              className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]"
            />
            <span className="hidden md:inline text-xs md:text-sm lg:text-base">
              End
            </span>
          </button>


        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* ── PAUSED / CANCELLED STATUS BANNER ─────────────────────────────── */}
      {/* {(isPaused || isCancelled) && (
        <div
          className={`w-full px-3 py-0.5 flex items-center justify-between gap-3 text-xs font-semibold border-b transition-colors duration-300 ${
            isCancelled
              ? "bg-red-700 text-white border-red-900"
              : "bg-yellow-500 text-black border-yellow-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span>{isCancelled ? "🚫" : "⏸️"}</span>
            <span>
              {isCancelled
                ? "This Exam Session Has Been Ended / Cancelled — You Cannot Continue ⚓"
                : "Exam is Currently Paused — Click Resume to Continue ⚓"}
            </span>
          </div>
          <button
            onClick={() => setActiveModal("pause")}
            className="flex-shrink-0 px-3 py-0.5 bg-black/20 hover:bg-black/40 rounded-lg text-xs font-bold transition whitespace-nowrap"
          >
            ▶ Resume Exam
          </button>
        </div>
      )} */}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {/* OVERLAY */}
      {activeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3">
          <div
            className="
              relative
                w-full
                max-w-sm sm:max-w-md
                max-h-[92vh]
                overflow-y-auto
                rounded-xl
                shadow-2xl
                border
                bg-white
                animate-in fade-in zoom-in-95 duration-200
              "
          >

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            {/* SWITCH LAYOUT */}
            {activeModal === "layout" && (() => {
              const layouts = [
                {
                  id: "generic",
                  name: "Generic",
                  icon: "📄",
                  desc: "One question per page",
                  color: "from-blue-500 to-indigo-500",
                  border: "border-blue-300",
                  bg: "bg-blue-50",
                },
                {
                  id: "glacial",
                  name: "Glacial",
                  icon: "🌊",
                  desc: "All questions, smooth scroll",
                  color: "from-cyan-500 to-blue-400",
                  border: "border-cyan-300",
                  bg: "bg-cyan-50",
                },
                {
                  id: "cascade",
                  name: "Cascade",
                  icon: "🪜",
                  desc: "Step-by-step progression",
                  color: "from-violet-500 to-purple-500",
                  border: "border-violet-300",
                  bg: "bg-violet-50",
                },
                {
                  id: "pulse",
                  name: "Pulse",
                  icon: "⚡",
                  desc: "Adaptive after each answer",
                  color: "from-orange-500 to-red-500",
                  border: "border-orange-300",
                  bg: "bg-orange-50",
                },
                {
                  id: "classic",
                  name: "Classic",
                  icon: "📚",
                  desc: "Grouped by sections",
                  color: "from-emerald-500 to-teal-500",
                  border: "border-emerald-300",
                  bg: "bg-emerald-50",
                },
                {
                  id: "atlas",
                  name: "Atlas",
                  icon: "🗺️",
                  desc: "Question + resources split",
                  color: "from-yellow-500 to-amber-500",
                  border: "border-yellow-300",
                  bg: "bg-yellow-50",
                },
                {
                  id: "orbit",
                  name: "Orbit",
                  icon: "🪐",
                  desc: "Navigate by subject clusters",
                  color: "from-pink-500 to-rose-500",
                  border: "border-pink-300",
                  bg: "bg-pink-50",
                },
                {
                  id: "zen",
                  name: "Zen",
                  icon: "🧘",
                  desc: "Distraction-free fullscreen",
                  color: "from-slate-600 to-slate-800",
                  border: "border-slate-300",
                  bg: "bg-slate-50",
                },
              ];

              const currentLayout = (() => {
                if (typeof window === "undefined") return "generic";
                const parts = window.location.pathname.split("/");
                const examIdx = parts.findIndex(p => p === "exam");
                return examIdx !== -1 ? (parts[examIdx + 1] ?? "generic") : "generic";
              })();

              const switchLayout = (id: string) => {
                if (id === currentLayout) { setActiveModal(null); return; }
                const parts = window.location.pathname.split("/");
                const examIdx = parts.findIndex(p => p === "exam");
                if (examIdx !== -1) parts[examIdx + 1] = id;
                window.location.href = parts.join("/") + window.location.search;
              };

              return (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-3 py-2 flex items-center justify-between rounded-t-xl">
                    <div>
                      <h2 className="text-xs font-black">Switch Exam Layout</h2>
                      <p className="text-[9px] text-blue-200">Active: <span className="font-bold text-white capitalize">{currentLayout}</span></p>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="bg-white/20 hover:bg-red-500 rounded-md p-1 transition">
                      <X size={12} />
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 space-y-2">
                    {/* 2×4 Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {layouts.map((l) => {
                        const isCurrent = l.id === currentLayout;
                        return (
                          <button
                            key={l.id}
                            onClick={() => switchLayout(l.id)}
                            title={l.desc}
                            className={`
                                    relative flex items-center gap-2.5 text-left
                                    rounded-lg border px-2.5 py-2
                                    transition-all duration-150 active:scale-95
                                    ${isCurrent
                                ? `${l.border} ${l.bg} ring-1 ring-offset-1 ring-blue-400 shadow-sm`
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                              }
                                `}
                          >
                            {/* Active dot */}
                            {isCurrent && (
                              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}

                            {/* Icon pill */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base bg-gradient-to-br ${l.color} shadow-sm flex-shrink-0`}>
                              {l.icon}
                            </div>

                            {/* Text */}
                            <div className="min-w-0">
                              <p className={`text-[11px] font-black leading-none ${isCurrent ? "text-blue-700" : "text-slate-800"}`}>
                                {l.name}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                                {l.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Warning */}
                    <p className="text-[9px] text-amber-600 text-center bg-amber-50 border border-green-200 rounded-lg py-1.5 px-2">
                      ⚠️ Switching Reloads the Page — Progress is auto-saved ⚓
                    </p>

                    {/* Cancel */}
                    <button
                      onClick={() => setActiveModal(null)}
                      className="w-full py-1.5 rounded-lg border bg-amber-300 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 text-[10px] font-bold transition-all"
                    >
                      Cancel — Stay on Current Layout
                    </button>
                  </div>
                </>
              );
            })()}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/* MENU / QUESTION NAVIGATOR */}
            {activeModal === "menu" && (
              <MenuNavigator onClose={() => setActiveModal(null)} />
            )}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/* SETTINGS */}
            {activeModal === "settings" && (
              <>
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 flex items-center justify-between rounded-t-xl">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <Settings size={14} /> Theme &amp; Font Settings
                  </h2>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="bg-white/20 hover:bg-red-500 rounded-lg p-1.5 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
                <SettingsModalContent />
              </>
            )}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            {/* FEEDBACK */}
            {activeModal === "feedback" && (
              <>
                <div className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                  <h2 className="text-base font-semibold">Submit Exam Feedback</h2>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="border border-red-400 text-red-400 hover:bg-red-500 hover:text-white rounded-lg p-1.5 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-blue-50 p-4 space-y-4 text-black">
                  <div>
                    <label className="text-sm font-medium block mb-1">Your Feedback &amp; Suggestions</label>
                    <textarea
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share Your Thoughts About This Exam . . . ✒️"
                      className="w-full rounded-lg border p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Rate the Exam — <span className="text-indigo-600 font-bold">{feedbackRating}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={feedbackRating}
                        onChange={(e) => setFeedbackRating(Number(e.target.value))}
                        className="flex-1 accent-indigo-600"
                      />
                      <div className="bg-white rounded-lg px-3 py-1.5 text-sm border min-w-[48px] text-center font-bold text-indigo-600">
                        {feedbackRating}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="flex-1 rounded-lg border-2 border-blue-300 px-3 py-2 text-sm outline-none"
                    >
                      <option>General Suggestion</option>
                      <option>Exam State Issue</option>
                      <option>Exam Question Issue</option>
                      <option>Exam Content Issue</option>
                      <option>Technical Problem</option>
                      <option>Logical Problem</option>
                    </select>
                    <button
                      onClick={async () => {
                        if (!examSession?.exam?.id || !examSession?.exam?.guidId) return;
                        await submitTool("ActionExamFeedback", {
                          examId: examSession.exam.id,
                          examGuidId: examSession.exam.guidId,
                          actionValue: String(feedbackRating),
                          actionContent: `[${feedbackCategory}] ${feedbackText}`,
                        });
                        setFeedbackText("");
                        setFeedbackRating(88);
                        setFeedbackCategory("General Suggestion");
                        setActiveModal(null);
                      }}
                      className="px-5 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-600 hover:text-white transition whitespace-nowrap font-semibold"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/* DETAILS */}
            {activeModal === "details" && (() => {
              const exam = examSession?.exam;
              const allQ = (examSession?.sections ?? []).flatMap(
                (s: { questions?: { savedUserAnswer?: unknown }[] }) => s.questions ?? []
              );
              const total = allQ.length || exam?.questionsCount || 0;
              const rows = [
                ["Title", exam?.title ?? "—"],
                ["Identifier", exam?.guidId ?? "—"],
                ["Mode", exam?.selectedMode ?? "—"],
                ["Layout", exam?.selectedLayout ?? "—"],
                ["Total Questions", String(total)],
                ["Duration", exam?.duration ? `${exam.duration} min` : "—"],
                ["Difficulty", exam?.difficulty ?? "—"],
                ["Assessment", exam?.assessmentName ?? "—"],
                ["Status", exam?.status ?? "—"],
                ["Sections", String(examSession?.sections?.length ?? 0)],
              ];
              return (
                <>
                  <div className="bg-yellow-500 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                    <h2 className="text-base font-semibold">Exam Details</h2>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="bg-red-500 hover:bg-red-600 rounded-lg p-1.5 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-4 bg-yellow-50 space-y-2 text-sm max-h-[60vh] overflow-y-auto">
                    {rows.map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 border-b border-yellow-100 pb-2 last:border-0">
                        <span className="font-semibold text-gray-700 shrink-0">{label}</span>
                        <span className="text-gray-600 text-right break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/* PAUSE */}
            {activeModal === "pause" && (
              <>
                {isPaused || isCancelled ? (
                  /* ── FUTURISTIC RESUME VIEW ── */
                  <div className="relative bg-slate-800 rounded-xl overflow-hidden">
                    {/* Top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                    {/* Background radial */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_65%)] pointer-events-none" />

                    {/* Header */}
                    <div className="relative flex items-center justify-between px-5 py-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">
                          {isCancelled ? "Session Ended" : "Session Paused"}
                        </span>
                      </div>
                      <button onClick={() => setActiveModal(null)}
                        className="w-7 h-7 rounded-lg bg-red-700 hover:bg-red-900 text-black hover:text-red-400 flex items-center justify-center transition">
                        <X size={13} />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="relative px-5 py-7 text-center">
                      {/* Animated ring icon */}
                      <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5 mx-auto">
                        <div className="absolute inset-0 rounded-full border border-emerald-100 animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="absolute inset-0 rounded-full border border-red-100 animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="relative w-1 h-30 rounded-full bg-gradient-to-br from-emerald-200 to-yellow-300 border border-emerald-200 flex items-center justify-center">
                          <span className="text-6xl">{isCancelled ? "🚫" : "⏸️"}</span>
                        </div>
                      </div>

                      <h3 className="text-white text-base font-black mb-1">
                        {isCancelled ? "Exam Was Ended" : "Exam Is Paused"}
                      </h3>
                      <p className="text-slate-400 text-xs mb-6 leading-relaxed max-w-xs mx-auto">
                        {isCancelled
                          ? "Your session was terminated. Resume to restore full access and continue your exam."
                          : "Your timer is frozen and navigation is locked. Resume to unlock the exam and restart your countdown."}
                      </p>

                      {/* Primary CTA */}
                      <button
                        onClick={async () => {
                          if (!examSession?.exam?.id || !examSession?.exam?.guidId) return;
                          await resumeExam({
                            examId: examSession.exam.id!,
                            examGuidId: examSession.exam.guidId!,
                            reason: "User Resumed Exam ⚓",
                            status: "Resumed",
                          });
                          setIsPaused(false);
                          setIsCancelled(false);
                          window.dispatchEvent(new CustomEvent("exam:resume"));
                          setActiveModal(null);
                        }}
                        className="w-full relative overflow-hidden group px-5 py-3 mb-2.5 bg-gradient-to-r from-indigo-300 via-yellow-300 to-green-300 hover:from-pink-300 hover:via-green-300 hover:to-blue-300 text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] transition-all duration-300 active:scale-95"
                      >
                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center justify-center gap-2">
                          <span>▶</span> Resume Exam Session
                        </span>
                      </button>

                      {/* Secondary */}
                      <button
                        onClick={() => setActiveModal(null)}
                        className="w-full px-4 py-2 border border-white hover:border-slate-600 text-red-600 hover:text-black hover:bg-amber-400 rounded-xl text-xs font-medium transition-all"
                      >
                        {isCancelled ? "Cancel & Close Modal" : "Stay Paused — Close Modal"}
                      </button>

                      {/* Footer note */}
                      <div className="mt-5 pt-4 border-t border-green-100">
                        <p className="text-white text-[10px] tracking-widest uppercase">⚓ Your Progress is Saved</p>
                      </div>
                    </div>

                    {/* Bottom glow line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                  </div>
                ) : (
                  /* ── PAUSE CONFIRMATION VIEW ── */
                  <>
                    <div className="bg-gray-700 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                      <h2 className="text-base font-semibold">Pause Exam</h2>
                      <button onClick={() => setActiveModal(null)} className="bg-red-500 hover:bg-red-600 rounded-lg p-1.5 transition">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-5 bg-gray-100 text-center">
                      <div className="text-sm font-semibold mb-2">Are you sure you want to pause the exam?</div>
                      <p className="text-xs text-gray-500 mb-5">
                        Your timer will stop. You can still read questions but cannot interact until you resume.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={async () => {
                            if (!examSession?.exam?.id || !examSession?.exam?.guidId) return;
                            await pauseExam({
                              examId: examSession.exam.id!,
                              examGuidId: examSession.exam.guidId!,
                              reason: "User paused exam",
                              status: "Paused",
                            });
                            setIsPaused(true);
                            window.dispatchEvent(new CustomEvent("exam:paused"));
                            setActiveModal(null);
                          }}
                          className="px-4 py-2 bg-gray-700 hover:bg-black text-white rounded-lg text-sm font-semibold transition"
                        >
                          Pause Exam
                        </button>
                        <button onClick={() => setActiveModal(null)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/* END */}
            {activeModal === "end" && (() => {
              const allQ = (examSession?.sections ?? []).flatMap(
                (s: { questions?: { savedUserAnswer?: unknown }[] }) => s.questions ?? []
              );
              const totalQ = allQ.length || examSession?.exam?.questionsCount || 0;
              const answeredQ = allQ.filter(
                (q: { savedUserAnswer?: unknown }) => q.savedUserAnswer != null
              ).length;
              const remainingQ = Math.max(0, totalQ - answeredQ);
              const pctDone = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

              return (
                <>
                  <div className="bg-yellow-400 text-black px-4 py-3 flex items-center justify-between rounded-t-xl">
                    <h2 className="text-base font-semibold">Kindly Confirm to End Exam</h2>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="bg-black/30 hover:bg-black/50 rounded-lg p-1.5 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-5 bg-red-50">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-white rounded-lg p-2 text-center border border-red-100">
                        <div className="text-lg font-black text-indigo-600">{totalQ}</div>
                        <div className="text-[10px] text-gray-500">Total</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-red-100">
                        <div className="text-lg font-black text-emerald-600">{answeredQ}</div>
                        <div className="text-[10px] text-gray-500">Answered</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-red-100">
                        <div className="text-lg font-black text-red-500">{remainingQ}</div>
                        <div className="text-[10px] text-gray-500">Remaining</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>Completion</span>
                        <span className="font-bold text-indigo-600">{pctDone}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-400 to-indigo-800 transition-all"
                          style={{ width: `${pctDone}%` }}
                        />
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-4 text-xs text-orange-700 font-medium text-center">
                      ⚠️ This Will be Counted as an Exam Attempt and Cannot be UnDone 📌
                      {remainingQ > 0 && <span className="block mt-0.5 text-red-600 font-bold">You still Have {remainingQ} Unanswered Question{remainingQ > 1 ? "s" : ""} 🪝</span>}
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={async () => {
                          if (!examSession?.exam?.id || !examSession?.exam?.guidId) return;
                          sessionStorage.removeItem(`exam_position_${examSession.exam.guidId}`);
                          sessionStorage.removeItem(`dynamic_live_exam_current_question_position_${examSession.exam.guidId}`);
                          await submitExam({
                            examId: examSession.exam.id!,
                            examGuidId: examSession.exam.guidId!,
                            reason: "User Ended Exam Early ⚓",
                            status: "Cancelled",
                          });
                          setActiveModal(null);
                          window.history.back();
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-black rounded-lg text-sm font-semibold transition"
                      >
                        Cancel &amp; Terminate
                      </button>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="px-4 py-2 bg-green-300 text-black hover:bg-gray-300 rounded-lg text-sm font-semibold transition"
                      >
                        Continue Exam
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
            {/* SHARE */}
            {activeModal === "share" && (
              <>
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <Share2 size={16} /> Share Exam
                  </h2>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="bg-red-500 hover:bg-red-600 rounded-lg p-1.5 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 bg-gray-50 space-y-4">

                  {/* Active question badge */}
                  {activeQuestionGuid && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                      <span className="text-xs text-indigo-700 font-medium">
                        Sharing Link To{" "}
                        <span className="font-bold">Question {currentIndex + 1}</span>
                        {" "} — Recipient Will Land Directly on This Question ⚓
                      </span>
                    </div>
                  )}

                  {/* URL row */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Shareable URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={currentUrl}
                        className="flex-1 bg-white border rounded-lg px-3 py-2 text-xs text-gray-600 outline-none truncate"
                      />
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${copied
                          ? "bg-green-600 text-white"
                          : "bg-gray-800 hover:bg-black text-white"
                          }`}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Share buttons */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      Share via
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </button>

                      <button
                        onClick={async () => {
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                url: currentUrl,
                                title: `${document.title} — Question ${currentIndex + 1}`,
                              });
                            } catch { /* ignore */ }
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        <Share2 size={16} />
                        More Options
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

          </div>
        </div>
      )}
    </>
  );
}