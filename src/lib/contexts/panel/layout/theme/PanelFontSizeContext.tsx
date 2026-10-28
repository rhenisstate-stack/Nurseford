// src\lib\contexts\panel\layout\theme\PanelFontSizeContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type PanelFontTarget =
  | "global"
  | "navbar"
  | "leftSidebar"
  | "rightSidebar"
  | "content"
  | "footer";

export type FontSizePreset = "xs" | "sm" | "md" | "lg" | "xl" | "custom";

export type SectionFontSizes = {
  base: number; // px
  sm:   number; // px
  lg:   number; // px
  xl:   number; // px
};

export type PanelFontSizes = {
  navbar:       SectionFontSizes;
  leftSidebar:  SectionFontSizes;
  rightSidebar: SectionFontSizes;
  content:      SectionFontSizes;
  footer:       SectionFontSizes;
};

// ── Preset scales ─────────────────────────────────────────────────────────────
const buildScale = (base: number): SectionFontSizes => ({
  base,
  sm:  Math.round(base * 0.8),   // 80 %
  lg:  Math.round(base * 1.25),  // 125 %
  xl:  Math.round(base * 1.5),   // 150 %
});

const PRESET_BASES: Record<Exclude<FontSizePreset, "custom">, number> = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
};

const buildPanelSizes = (base: number): PanelFontSizes => ({
  navbar:       buildScale(base),
  leftSidebar:  buildScale(base),
  rightSidebar: buildScale(base),
  content:      buildScale(base),
  footer:       buildScale(base),
});

export const DEFAULT_PANEL_FONT_SIZES: PanelFontSizes = buildPanelSizes(PRESET_BASES.md);

export const PANEL_FONT_SIZES_KEY = "panelFontSizes";
export const PANEL_FONT_PRESET_KEY = "panelFontPreset";

// ── CSS variable map ──────────────────────────────────────────────────────────
// Section → CSS variable prefix.  e.g. --panel-content-font-base
const CSS_SECTION_PREFIX: Record<keyof PanelFontSizes, string> = {
  navbar:       "--panel-navbar-font",
  leftSidebar:  "--panel-left-sidebar-font",
  rightSidebar: "--panel-right-sidebar-font",
  content:      "--panel-content-font",
  footer:       "--panel-footer-font",
};

// ── Context shape ─────────────────────────────────────────────────────────────
interface PanelFontSizeContextType {
  /** Active preset (or "custom" when sizes were edited manually). */
  preset: FontSizePreset;
  /** Per-section sizes currently in effect. */
  fontSizes: PanelFontSizes;
  /** Apply one of the named presets to ALL sections at once. */
  applyPreset: (preset: Exclude<FontSizePreset, "custom">) => void;
  /** Override specific sections with specific sizes (sets preset to "custom"). */
  setSectionFontSizes: (section: keyof PanelFontSizes, sizes: Partial<SectionFontSizes>) => void;
  /** Reset everything back to the default "md" preset. */
  resetFontSizes: () => void;
  /** Scale a single section's base up or down by delta px (clamps 8–32 px). */
  scaleSection: (section: keyof PanelFontSizes, delta: number) => void;
  /** Scale ALL sections simultaneously. */
  scaleGlobal: (delta: number) => void;
}

const PanelFontSizeContext = createContext<PanelFontSizeContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
export const PanelFontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [preset, setPreset]       = useState<FontSizePreset>("md");
  const [fontSizes, setFontSizes] = useState<PanelFontSizes>(DEFAULT_PANEL_FONT_SIZES);

  // ── Hydrate from localStorage ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedPreset = localStorage.getItem(PANEL_FONT_PRESET_KEY) as FontSizePreset | null;
      const storedSizes  = localStorage.getItem(PANEL_FONT_SIZES_KEY);
      if (storedPreset) setPreset(storedPreset);
      if (storedSizes)  setFontSizes(JSON.parse(storedSizes));
    } catch { /* SSR / private mode */ }
  }, []);

  // ── Apply CSS variables whenever sizes change ─────────────────────────────
  useEffect(() => {
    const root = document.documentElement;

    (Object.keys(fontSizes) as Array<keyof PanelFontSizes>).forEach((section) => {
      const prefix = CSS_SECTION_PREFIX[section];
      const sizes  = fontSizes[section];
      root.style.setProperty(`${prefix}-base`, `${sizes.base}px`);
      root.style.setProperty(`${prefix}-sm`,   `${sizes.sm}px`);
      root.style.setProperty(`${prefix}-lg`,   `${sizes.lg}px`);
      root.style.setProperty(`${prefix}-xl`,   `${sizes.xl}px`);
    });

    try {
      localStorage.setItem(PANEL_FONT_SIZES_KEY,  JSON.stringify(fontSizes));
      localStorage.setItem(PANEL_FONT_PRESET_KEY, preset);
    } catch { /* noop */ }
  }, [fontSizes, preset]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const applyPreset = (p: Exclude<FontSizePreset, "custom">) => {
    setPreset(p);
    setFontSizes(buildPanelSizes(PRESET_BASES[p]));
  };

  const setSectionFontSizes = (
    section: keyof PanelFontSizes,
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
    setFontSizes(DEFAULT_PANEL_FONT_SIZES);
    try {
      localStorage.removeItem(PANEL_FONT_SIZES_KEY);
      localStorage.removeItem(PANEL_FONT_PRESET_KEY);
    } catch { /* noop */ }
  };

  const clampBase = (v: number) => Math.min(32, Math.max(8, v));

  const scaleSection = (section: keyof PanelFontSizes, delta: number) => {
    setPreset("custom");
    setFontSizes((prev) => {
      const newBase = clampBase(prev[section].base + delta);
      return { ...prev, [section]: buildScale(newBase) };
    });
  };

  const scaleGlobal = (delta: number) => {
    setPreset("custom");
    setFontSizes((prev) => {
      const updated = {} as PanelFontSizes;
      (Object.keys(prev) as Array<keyof PanelFontSizes>).forEach((s) => {
        const newBase = clampBase(prev[s].base + delta);
        updated[s] = buildScale(newBase);
      });
      return updated;
    });
  };

  return (
    <PanelFontSizeContext.Provider
      value={{
        preset,
        fontSizes,
        applyPreset,
        setSectionFontSizes,
        resetFontSizes,
        scaleSection,
        scaleGlobal,
      }}
    >
      {children}
    </PanelFontSizeContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export const usePanelFontSize = (): PanelFontSizeContextType => {
  const ctx = useContext(PanelFontSizeContext);
  if (!ctx) throw new Error("usePanelFontSize must be used within <PanelFontSizeProvider>");
  return ctx;
};

// ── Convenience: resolve the CSS variable name for a section/scale pair ──────
export const panelFontVar = (
  section: keyof PanelFontSizes,
  scale: keyof SectionFontSizes = "base",
): string => `var(${CSS_SECTION_PREFIX[section]}-${scale})`;