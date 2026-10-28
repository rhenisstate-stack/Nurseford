// src\lib\contexts\web\assessment\theme\ExamThemeContext.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
} from "react";

export type ExamThemeTarget =
    | "global"
    | "upperNavbar"
    | "lowerNavbar"
    | "nonStickyNavbar"
    | "content"
    | "footer"
    | "leftSidebar"
    | "rightSidebar";

export type ExamThemeValue = "default" | "light" | "dark" | "custom" | "system";

export type ExamCustomColors = {
    upperNavbar:        string;
    lowerNavbar:        string;
    nonStickyNavbar:    string;
    content:            string;
    footer:             string;
    leftSidebar:        string;
    rightSidebar:       string;
    upperNavText:       string;
    lowerNavText:       string;
    nonStickyNavText:   string;
    contentText:        string;
    footerText:         string;
    leftSidebarText:    string;
    rightSidebarText:   string;
};

export const DEFAULT_EXAM_COLORS: ExamCustomColors = {
    upperNavbar:       "#faf9f6",
    lowerNavbar:       "#faf9f6",
    nonStickyNavbar:   "#faf9f6",
    content:           "#faf9f6",
    footer:            "#faf9f6",
    leftSidebar:       "#faf9f6",
    rightSidebar:      "#faf9f6",
    upperNavText:      "#000000",
    lowerNavText:      "#000000",
    nonStickyNavText:  "#000000",
    contentText:       "#000000",
    footerText:        "#000000",
    leftSidebarText:   "#000000",
    rightSidebarText:  "#000000",
};

const LIGHT_EXAM_COLORS: ExamCustomColors = {
    upperNavbar:       "#faf9f6",
    lowerNavbar:       "#faf9f6",
    nonStickyNavbar:   "#faf9f6",
    content:           "#faf9f6",
    footer:            "#faf9f6",
    leftSidebar:       "#faf9f6",
    rightSidebar:      "#faf9f6",
    upperNavText:      "#000000",
    lowerNavText:      "#000000",
    nonStickyNavText:  "#000000",
    contentText:       "#000000",
    footerText:        "#000000",
    leftSidebarText:   "#000000",
    rightSidebarText:  "#000000",
};

const DARK_EXAM_COLORS: ExamCustomColors = {
    upperNavbar:       "#000e1c",
    lowerNavbar:       "#001326",
    nonStickyNavbar:   "#001326",
    content:           "#001326",
    footer:            "#000e1c",
    leftSidebar:       "#001326",
    rightSidebar:      "#001326",
    upperNavText:      "#f1f5f9",
    lowerNavText:      "#cbd5e1",
    nonStickyNavText:  "#cbd5e1",
    contentText:       "#e2e8f0",
    footerText:        "#94a3b8",
    leftSidebarText:   "#cbd5e1",
    rightSidebarText:  "#cbd5e1",
};

export const EXAM_COLORS_STORAGE_KEY  = "examCustomColors";
export const EXAM_THEME_STORAGE_KEY   = "examTheme";

const CSS_VAR_MAP: Record<keyof ExamCustomColors, string> = {
    upperNavbar:       "--exam-upper-nav-bg",
    lowerNavbar:       "--exam-lower-nav-bg",
    nonStickyNavbar:   "--exam-non-sticky-nav-bg",
    content:           "--exam-content-bg",
    footer:            "--exam-footer-bg",
    leftSidebar:       "--exam-left-sidebar-bg",
    rightSidebar:      "--exam-right-sidebar-bg",
    upperNavText:      "--exam-upper-nav-text",
    lowerNavText:      "--exam-lower-nav-text",
    nonStickyNavText:  "--exam-non-sticky-nav-text",
    contentText:       "--exam-content-text",
    footerText:        "--exam-footer-text",
    leftSidebarText:   "--exam-left-sidebar-text",
    rightSidebarText:  "--exam-right-sidebar-text",
};

const defaultTheme: Record<ExamThemeTarget, ExamThemeValue> = {
    global:          "light",
    upperNavbar:     "light",
    lowerNavbar:     "light",
    nonStickyNavbar: "light",
    content:         "light",
    footer:          "light",
    leftSidebar:     "light",
    rightSidebar:    "light",
};

// ── Pure helper — no hooks, safe to call anywhere ────────────────────────────
function applyCSS(
    root: HTMLElement,
    theme: Record<ExamThemeTarget, ExamThemeValue>,
    effectiveColors: ExamCustomColors,
) {
    const isDark = theme.global === "dark";
    if (isDark) {
        root.classList.remove("light");
        root.classList.add("dark");
        if (typeof document !== "undefined" && document.body) {
            document.body.dataset.theme = "dark";
        }
        root.style.setProperty("--content-bg", "#000f25");
        root.style.setProperty("--text-color", "#e2e8f0");
    } else {
        root.classList.remove("dark");
        root.classList.add("light");
        if (typeof document !== "undefined" && document.body) {
            document.body.dataset.theme = "light";
        }
        root.style.setProperty("--background", "#faf9f6");
        root.style.setProperty("--content-bg", "#faf9f6");
        root.style.setProperty("--text-color", "#0f172a");
    }

    const resolveGlobal = (): ExamCustomColors => {
        switch (theme.global) {
            case "dark":   return DARK_EXAM_COLORS;
            case "custom": return effectiveColors;
            case "light":
            case "default":
            default:       return LIGHT_EXAM_COLORS;
        }
    };

    const base = resolveGlobal();

    const sections: Array<{
        target:  ExamThemeTarget;
        bgKey:   keyof ExamCustomColors;
        textKey: keyof ExamCustomColors;
    }> = [
        { target: "upperNavbar",     bgKey: "upperNavbar",     textKey: "upperNavText"      },
        { target: "lowerNavbar",     bgKey: "lowerNavbar",     textKey: "lowerNavText"      },
        { target: "nonStickyNavbar", bgKey: "nonStickyNavbar", textKey: "nonStickyNavText"  },
        { target: "content",         bgKey: "content",         textKey: "contentText"       },
        { target: "footer",          bgKey: "footer",          textKey: "footerText"        },
        { target: "leftSidebar",     bgKey: "leftSidebar",     textKey: "leftSidebarText"   },
        { target: "rightSidebar",    bgKey: "rightSidebar",    textKey: "rightSidebarText"  },
    ];

    for (const { target, bgKey, textKey } of sections) {
        const st = theme[target];
        let bg:   string;
        let text: string;

        if (st === "light") {
            bg = LIGHT_EXAM_COLORS[bgKey]; text = LIGHT_EXAM_COLORS[textKey];
        } else if (st === "dark") {
            bg = DARK_EXAM_COLORS[bgKey];  text = DARK_EXAM_COLORS[textKey];
        } else if (st === "custom") {
            bg = effectiveColors[bgKey];   text = effectiveColors[textKey];
        } else {
            bg = base[bgKey]; text = base[textKey];
        }

        root.style.setProperty(CSS_VAR_MAP[bgKey],   bg);
        root.style.setProperty(CSS_VAR_MAP[textKey], text);
    }
}

interface ExamThemeContextType {
    theme:             Record<ExamThemeTarget, ExamThemeValue>;
    customColors:      ExamCustomColors | null;
    effectiveColors:   ExamCustomColors;
    setTheme:          (target: ExamThemeTarget, value: ExamThemeValue) => void;
    setCustomColors:   (colors: Partial<ExamCustomColors>) => void;
    resetCustomColors: () => void;
    applyGlobalMode:   (mode: "default" | "light" | "dark" | "custom") => void;
    toggleTheme:       () => void;
    isDark:            boolean;
}

const ExamThemeContext = createContext<ExamThemeContextType | undefined>(undefined);

export const ExamThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState]               = useState<Record<ExamThemeTarget, ExamThemeValue>>(defaultTheme);
    const [customColors, setCustomColorsState] = useState<ExamCustomColors | null>(null);
    const hasHydrated                          = useRef(false);

    const effectiveColors: ExamCustomColors = customColors ?? DEFAULT_EXAM_COLORS;

    useEffect(() => {
        const root = document.documentElement;

        if (!hasHydrated.current) {
            hasHydrated.current = true;
            try {
                const storedTheme  = localStorage.getItem(EXAM_THEME_STORAGE_KEY);
                const storedColors = localStorage.getItem(EXAM_COLORS_STORAGE_KEY);

                let themeToUse = defaultTheme;
                if (storedTheme) {
                    const parsed = JSON.parse(storedTheme);
                    if (parsed && typeof parsed === "object") {
                        themeToUse = parsed;
                    }
                }

                const parsedColors: ExamCustomColors | null =
                    storedColors ? JSON.parse(storedColors) : null;
                const colorsToUse = parsedColors ?? DEFAULT_EXAM_COLORS;

                applyCSS(root, themeToUse, colorsToUse);

                if (storedTheme) setThemeState(themeToUse);
                if (parsedColors) setCustomColorsState(parsedColors);
                return;
            } catch { /* SSR / private mode */ }
        }

        // Normal (non-hydration) runs
        applyCSS(root, theme, effectiveColors);
        try {
            localStorage.setItem(EXAM_THEME_STORAGE_KEY, JSON.stringify(theme));
        } catch { /* noop */ }

    }, [theme, customColors, effectiveColors]);

    // Clean up when unmounting so leaving the exam page restores the global dashboard theme
    useEffect(() => {
        const handleSync = () => {
            try {
                const storedTheme = localStorage.getItem(EXAM_THEME_STORAGE_KEY);
                if (storedTheme) {
                    const parsed = JSON.parse(storedTheme);
                    if (parsed?.global) {
                        setThemeState(parsed);
                    }
                }
            } catch { /* noop */ }
        };

        window.addEventListener("themechange", handleSync);
        window.addEventListener("storage", handleSync);

        return () => {
            window.removeEventListener("themechange", handleSync);
            window.removeEventListener("storage", handleSync);
            try {
                const storedTheme = localStorage.getItem("theme");
                const parsed = storedTheme ? JSON.parse(storedTheme) : null;
                const effective = parsed?.global === "light" ? "light" : "dark";
                const root = document.documentElement;
                root.classList.remove("light", "dark");
                root.classList.add(effective);
                if (document.body) {
                    document.body.dataset.theme = effective;
                }
                if (effective === "dark") {
                    root.style.setProperty("--card-bg", "#15273e");
                    root.style.setProperty("--card-border", "rgba(255, 255, 255, 0.1)");
                    root.style.setProperty("--content-bg", "#000f25");
                    root.style.setProperty("--navbar-bg", "#000f25");
                    root.style.setProperty("--text-color", "#e2e8f0");
                } else {
                    root.style.setProperty("--card-bg", "#EEF3FE");
                    root.style.setProperty("--card-border", "rgba(0, 0, 0, 0.5)");
                    root.style.setProperty("--background", "#faf9f6");
                    root.style.setProperty("--content-bg", "#faf9f6");
                    root.style.setProperty("--navbar-bg", "#faf9f6");
                    root.style.setProperty("--text-color", "#0f172a");
                }
                window.dispatchEvent(new Event("themechange"));
            } catch { /* noop */ }
        };
    }, []);

    const setTheme = (target: ExamThemeTarget, value: ExamThemeValue) =>
        setThemeState(prev => ({ ...prev, [target]: value }));

    const setCustomColors = (colors: Partial<ExamCustomColors>) => {
        setCustomColorsState(prev => {
            const updated = { ...(prev ?? DEFAULT_EXAM_COLORS), ...colors };
            try { localStorage.setItem(EXAM_COLORS_STORAGE_KEY, JSON.stringify(updated)); } catch { /* noop */ }
            return updated;
        });
    };

    const resetCustomColors = () => {
        try { localStorage.removeItem(EXAM_COLORS_STORAGE_KEY); } catch { /* noop */ }
        setCustomColorsState(null);
    };

    const applyGlobalMode = (mode: "default" | "light" | "dark" | "custom") => {
        const targetMode = mode === "default" ? "light" : mode;
        const updated: Record<ExamThemeTarget, ExamThemeValue> = {
            global:          targetMode,
            upperNavbar:     targetMode,
            lowerNavbar:     targetMode,
            nonStickyNavbar: targetMode,
            content:         targetMode,
            footer:          targetMode,
            leftSidebar:     targetMode,
            rightSidebar:    targetMode,
        };
        setThemeState(updated);
        try {
            localStorage.setItem(EXAM_THEME_STORAGE_KEY, JSON.stringify(updated));
            window.dispatchEvent(new Event("themechange"));
        } catch { /* noop */ }
    };

    const isDark = theme.global === "dark";

    const toggleTheme = () => {
        const next = isDark ? "light" : "dark";
        applyGlobalMode(next);
    };

    return (
        <ExamThemeContext.Provider value={{
            theme, customColors, effectiveColors,
            setTheme, setCustomColors, resetCustomColors, applyGlobalMode,
            toggleTheme, isDark,
        }}>
            {children}
        </ExamThemeContext.Provider>
    );
};

export const useExamTheme = (): ExamThemeContextType => {
    const ctx = useContext(ExamThemeContext);
    if (!ctx) throw new Error("useExamTheme must be used within <ExamThemeProvider>");
    return ctx;
};