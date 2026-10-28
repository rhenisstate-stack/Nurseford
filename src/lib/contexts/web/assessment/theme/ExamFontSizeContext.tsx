// src\lib\contexts\web\assessment\theme\ExamFontSizeContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

export type ExamFontTarget =
  | "global"
  | "upperNavbar"
  | "lowerNavbar"
  | "nonStickyNavbar"
  | "content"
  | "footer"
  | "leftSidebar"
  | "rightSidebar";

export type FontSizePreset = "xs" | "sm" | "md" | "lg" | "xl" | "custom";

export type SectionFontSizes = {
  base: number; // px
  sm: number; // px
  lg: number; // px
  xl: number; // px
};

export type ExamFontSizes = {
  upperNavbar: SectionFontSizes;
  lowerNavbar: SectionFontSizes;
  nonStickyNavbar: SectionFontSizes;
  content: SectionFontSizes;
  footer: SectionFontSizes;
  leftSidebar: SectionFontSizes;
  rightSidebar: SectionFontSizes;
};

// ── Preset scales ─────────────────────────────────────────────────────────────
const buildScale = (base: number): SectionFontSizes => ({
  base,
  sm: Math.round(base * 0.8),
  lg: Math.round(base * 1.25),
  xl: Math.round(base * 1.5),
});

const PRESET_BASES: Record<Exclude<FontSizePreset, "custom">, number> = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
};

const buildExamSizes = (base: number): ExamFontSizes => ({
  upperNavbar: buildScale(base),
  lowerNavbar: buildScale(base),
  nonStickyNavbar: buildScale(base),
  content: buildScale(base + 1), // +1px for readability on exam body
  footer: buildScale(base),
  leftSidebar: buildScale(base),
  rightSidebar: buildScale(base),
});

export const DEFAULT_EXAM_FONT_SIZES: ExamFontSizes = buildExamSizes(PRESET_BASES.md);

export const EXAM_FONT_SIZES_KEY = "examFontSizes";
export const EXAM_FONT_PRESET_KEY = "examFontPreset";

// ── CSS variable map ──────────────────────────────────────────────────────────
const CSS_SECTION_PREFIX: Record<keyof ExamFontSizes, string> = {
  upperNavbar: "--exam-upper-nav-font",
  lowerNavbar: "--exam-lower-nav-font",
  nonStickyNavbar: "--exam-non-sticky-nav-font",
  content: "--exam-content-font",
  footer: "--exam-footer-font",
  leftSidebar: "--exam-left-sidebar-font",
  rightSidebar: "--exam-right-sidebar-font",
};

// ── Pure helper — no hooks, safe to call anywhere ─────────────────────────────
function applyFontCSS(root: HTMLElement, sizes: ExamFontSizes): void {
  (Object.keys(sizes) as Array<keyof ExamFontSizes>).forEach((section) => {
    const prefix = CSS_SECTION_PREFIX[section];
    const s = sizes[section];
    root.style.setProperty(`${prefix}-base`, `${s.base}px`);
    root.style.setProperty(`${prefix}-sm`, `${s.sm}px`);
    root.style.setProperty(`${prefix}-lg`, `${s.lg}px`);
    root.style.setProperty(`${prefix}-xl`, `${s.xl}px`);
  });
}

// ── Context shape ─────────────────────────────────────────────────────────────
interface ExamFontSizeContextType {
  /** Active preset (or "custom" when sizes were edited manually). */
  preset: FontSizePreset;
  /** Per-section sizes currently in effect. */
  fontSizes: ExamFontSizes;
  /** Apply one of the named presets to ALL sections at once. */
  applyPreset: (preset: Exclude<FontSizePreset, "custom">) => void;
  /** Override a specific section with partial sizes (sets preset to "custom"). */
  setSectionFontSizes: (section: keyof ExamFontSizes, sizes: Partial<SectionFontSizes>) => void;
  /** Reset everything back to the default "md" preset. */
  resetFontSizes: () => void;
  /** Scale a single section's base up or down by delta px (clamps 8–32 px). */
  scaleSection: (section: keyof ExamFontSizes, delta: number) => void;
  /** Scale ALL sections simultaneously — handy for accessibility toggles. */
  scaleGlobal: (delta: number) => void;
  /**
   * Apply a named mode to all sections at once (mirrors ExamThemeContext's
   * applyGlobalMode pattern so usage stays consistent).
   */
  applyGlobalMode: (mode: Exclude<FontSizePreset, "custom">) => void;
}

const ExamFontSizeContext = createContext<ExamFontSizeContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
export const ExamFontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [preset, setPreset] = useState<FontSizePreset>("md");
  const [fontSizes, setFontSizes] = useState<ExamFontSizes>(DEFAULT_EXAM_FONT_SIZES);
  const hasHydrated = useRef(false);

  // ── Single effect: hydrate from localStorage AND apply CSS vars atomically ──
  useEffect(() => {
    const root = document.documentElement;

    if (!hasHydrated.current) {
      hasHydrated.current = true;
      try {
        const storedPreset = localStorage.getItem(EXAM_FONT_PRESET_KEY) as FontSizePreset | null;
        const storedSizes = localStorage.getItem(EXAM_FONT_SIZES_KEY);

        if (storedPreset || storedSizes) {
          const parsedSizes: ExamFontSizes | null = storedSizes
            ? JSON.parse(storedSizes)
            : null;

          // Merge with defaults so any newly-added sections are never undefined
          const sizesToUse: ExamFontSizes = parsedSizes
            ? { ...DEFAULT_EXAM_FONT_SIZES, ...parsedSizes }
            : DEFAULT_EXAM_FONT_SIZES;
          const presetToUse = storedPreset ?? "md";

         // Apply CSS vars immediately — before state triggers a re-render
          applyFontCSS(root, sizesToUse);

          if (storedPreset) setPreset(presetToUse as FontSizePreset);
          if (parsedSizes) setFontSizes(sizesToUse);  // ← sizesToUse, not parsedSizes
          return;
        }
      } catch { /* SSR / private mode — fall through to defaults */ }
    }

    // Normal (non-hydration) runs: state already correct, just sync CSS + storage
    applyFontCSS(root, fontSizes);
    try {
      localStorage.setItem(EXAM_FONT_SIZES_KEY, JSON.stringify(fontSizes));
      localStorage.setItem(EXAM_FONT_PRESET_KEY, preset);
    } catch { /* noop */ }

  }, [fontSizes, preset]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const applyPreset = (p: Exclude<FontSizePreset, "custom">) => {
    setPreset(p);
    setFontSizes(buildExamSizes(PRESET_BASES[p]));
  };

  const setSectionFontSizes = (
    section: keyof ExamFontSizes,
    sizes: Partial<SectionFontSizes>,
  ) => {
    setPreset("custom");
    setFontSizes((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...sizes },
    }));
  };

  const resetFontSizes = () => {
    setPreset("md");
    setFontSizes(DEFAULT_EXAM_FONT_SIZES);
    try {
      localStorage.removeItem(EXAM_FONT_SIZES_KEY);
      localStorage.removeItem(EXAM_FONT_PRESET_KEY);
    } catch { /* noop */ }
  };

  const clampBase = (v: number) => Math.min(32, Math.max(8, v));

  const scaleSection = (section: keyof ExamFontSizes, delta: number) => {
    setPreset("custom");
    setFontSizes((prev) => {
      const newBase = clampBase(prev[section].base + delta);
      return { ...prev, [section]: buildScale(newBase) };
    });
  };

  const scaleGlobal = (delta: number) => {
    setPreset("custom");
    setFontSizes((prev) => {
      const updated = {} as ExamFontSizes;
      (Object.keys(prev) as Array<keyof ExamFontSizes>).forEach((s) => {
        const newBase = clampBase(prev[s].base + delta);
        updated[s] = buildScale(newBase);
      });
      return updated;
    });
  };

  // mirrors ExamThemeContext.applyGlobalMode API shape
  const applyGlobalMode = (mode: Exclude<FontSizePreset, "custom">) => applyPreset(mode);

  return (
    <ExamFontSizeContext.Provider
      value={{
        preset,
        fontSizes,
        applyPreset,
        setSectionFontSizes,
        resetFontSizes,
        scaleSection,
        scaleGlobal,
        applyGlobalMode,
      }}
    >
      {children}
    </ExamFontSizeContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export const useExamFontSize = (): ExamFontSizeContextType => {
  const ctx = useContext(ExamFontSizeContext);
  if (!ctx) throw new Error("useExamFontSize must be used within <ExamFontSizeProvider>");
  return ctx;
};

// ── Convenience: resolve the CSS variable name for a section/scale pair ──────
export const examFontVar = (
  section: keyof ExamFontSizes,
  scale: keyof SectionFontSizes = "base",
): string => `var(${CSS_SECTION_PREFIX[section]}-${scale})`;