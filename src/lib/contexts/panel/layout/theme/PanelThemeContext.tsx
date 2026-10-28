"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

export type ThemeTarget = "global" | "navbar" | "leftSidebar" | "rightSidebar" | "content" | "footer";
export type ThemeValue = "default" | "light" | "dark" | "custom" | "system";

export type CustomColors = {
  navbar: string;
  leftSidebar: string;
  rightSidebar: string;
  content: string;
  footer: string;
  text: string;
};

// Default Dashboard Colors — concentrated midnight navy matching background images
export const DEFAULT_THEME_COLORS: CustomColors = {
  navbar: "#000f25",
  leftSidebar: "#000f25",
  rightSidebar: "#000f25",
  content: "#000f25",
  footer: "#000f25",
  text: "#e2e8f0",
};

export const USER_CUSTOM_COLORS_KEY = "userCustomColors";

interface ThemeContextType {
  theme: Record<ThemeTarget, ThemeValue>;
  customColors: CustomColors | null;
  setTheme: (target: ThemeTarget, value: ThemeValue) => void;
  setCustomColors: (colors: Partial<CustomColors>) => void;
  resetCustomColors: () => void;
  toggleTheme: (target: ThemeTarget) => void;
  setGlobalThemeMode: (mode: "light" | "dark") => void;
  toggleGlobalTheme: () => void;
}

const defaultTheme: Record<ThemeTarget, ThemeValue> = {
  global: "dark",
  navbar: "dark",
  leftSidebar: "dark",
  rightSidebar: "dark",
  content: "dark",
  footer: "dark",
};

function getSystemTheme(): ThemeValue {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function applyThemeToDocument(
  theme: Record<ThemeTarget, ThemeValue>,
  customColors: CustomColors | null
) {
  if (typeof document === "undefined") return;
  if (typeof window !== "undefined" && (window.location.pathname || "").includes("/vista/exam")) {
    return;
  }
  const root = document.documentElement;
  const effectiveColors: CustomColors = customColors ?? DEFAULT_THEME_COLORS;

  const effectiveTheme =
    theme.global === "system"
      ? getSystemTheme()
      : theme.global === "light"
        ? "light"
        : "dark";

  // Apply global theme classes
  root.classList.remove("light", "dark");
  root.classList.add(effectiveTheme);
  if (document.body) {
    document.body.dataset.theme = effectiveTheme;
  }

  const lightColors: Record<keyof CustomColors, string> = {
    navbar: "#ffffff",
    leftSidebar: "#f8fafc",
    rightSidebar: "#f1f5f9",
    content: "#f8fafc",
    footer: "#f1f5f9",
    text: "#0f172a",
  };

  const darkColors: Record<keyof CustomColors, string> = {
    navbar: "#000f25",
    leftSidebar: "#000f25",
    rightSidebar: "#000f25",
    content: "#000f25",
    footer: "#000f25",
    text: "#e2e8f0",
  };

  const components: (keyof CustomColors)[] = ["navbar", "leftSidebar", "rightSidebar", "content", "footer"];
  for (const key of components) {
    const componentTheme =
      theme.global === "default"
        ? "default"
        : theme[key as ThemeTarget] === "system"
          ? effectiveTheme
          : theme[key as ThemeTarget];

    if (componentTheme === "default") {
      root.style.setProperty(`--${key}-bg`, effectiveTheme === "light" ? lightColors[key] : DEFAULT_THEME_COLORS[key]);
    } else if (componentTheme === "custom") {
      root.style.setProperty(`--${key}-bg`, effectiveColors[key]);
    } else if (componentTheme === "light") {
      root.style.setProperty(`--${key}-bg`, lightColors[key]);
    } else if (componentTheme === "dark") {
      root.style.setProperty(`--${key}-bg`, darkColors[key]);
    }
  }

  // Set distinct elevated card background and border
  root.style.setProperty("--card-bg", effectiveTheme === "light" ? "#EEF3FE" : "#15273e");
  root.style.setProperty("--card-border", effectiveTheme === "light" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.1)");

  // Apply global text color
  root.style.setProperty(
    "--text-color",
    theme.global === "custom"
      ? effectiveColors.text
      : effectiveTheme === "light"
        ? "#0f172a"
        : DEFAULT_THEME_COLORS.text
  );
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  const [theme, setThemeState] = useState<Record<ThemeTarget, ThemeValue>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("theme");
        if (stored) return JSON.parse(stored);
      } catch { /* noop */ }
    }
    return defaultTheme;
  });

  const [customColors, setCustomColorsState] = useState<CustomColors | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(USER_CUSTOM_COLORS_KEY);
        if (stored) return JSON.parse(stored);
      } catch { /* noop */ }
    }
    return null;
  });

  // Apply theme immediately on mount, on state changes, and on route changes
  useEffect(() => {
    if (!pathname?.includes("/vista/exam")) {
      applyThemeToDocument(theme, customColors);
      try {
        localStorage.setItem("theme", JSON.stringify(theme));
      } catch { /* noop */ }
    }
  }, [pathname, theme, customColors]);

  // Synchronize across storage, themechange, popstate, and bfcache pageshow events
  useEffect(() => {
    const handleSync = () => {
      if (typeof window !== "undefined" && (window.location.pathname || "").includes("/vista/exam")) {
        return;
      }
      try {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) {
          const parsed = JSON.parse(storedTheme);
          if (parsed && JSON.stringify(parsed) !== JSON.stringify(theme)) {
            setThemeState(parsed);
            applyThemeToDocument(parsed, customColors);
            return;
          }
        }
      } catch { /* noop */ }
      applyThemeToDocument(theme, customColors);
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("themechange", handleSync);
    window.addEventListener("popstate", handleSync);
    window.addEventListener("pageshow", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("themechange", handleSync);
      window.removeEventListener("popstate", handleSync);
      window.removeEventListener("pageshow", handleSync);
    };
  }, [theme, customColors]);

  const setTheme = useCallback((target: ThemeTarget, value: ThemeValue) => {
    setThemeState((prev) => {
      const updated = { ...prev, [target]: value };
      applyThemeToDocument(updated, customColors);
      try {
        localStorage.setItem("theme", JSON.stringify(updated));
        window.dispatchEvent(new Event("themechange"));
      } catch { /* noop */ }
      return updated;
    });
  }, [customColors]);

  const setGlobalThemeMode = useCallback((mode: "light" | "dark") => {
    const updated: Record<ThemeTarget, ThemeValue> = {
      global: mode,
      navbar: mode,
      leftSidebar: mode,
      rightSidebar: mode,
      content: mode,
      footer: mode,
    };
    setThemeState(updated);
    applyThemeToDocument(updated, customColors);
    try {
      localStorage.setItem("theme", JSON.stringify(updated));
      window.dispatchEvent(new Event("themechange"));
    } catch { /* noop */ }
  }, [customColors]);

  const toggleGlobalTheme = useCallback(() => {
    const isCurrentLight =
      theme.global === "light" ||
      (theme.global === "system" && getSystemTheme() === "light");
    const nextMode = isCurrentLight ? "dark" : "light";
    setGlobalThemeMode(nextMode);
  }, [theme.global, setGlobalThemeMode]);

  const setCustomColors = useCallback((colors: Partial<CustomColors>) => {
    setCustomColorsState((prev) => {
      const updated = { ...(prev ?? DEFAULT_THEME_COLORS), ...colors };
      try {
        localStorage.setItem(USER_CUSTOM_COLORS_KEY, JSON.stringify(updated));
      } catch { /* noop */ }
      applyThemeToDocument(theme, updated);
      return updated;
    });
  }, [theme]);

  const resetCustomColors = useCallback(() => {
    try {
      localStorage.removeItem(USER_CUSTOM_COLORS_KEY);
    } catch { /* noop */ }
    setCustomColorsState(null);
    applyThemeToDocument(theme, null);
  }, [theme]);

  const toggleTheme = useCallback((target: ThemeTarget) => {
    if (target === "global") {
      toggleGlobalTheme();
      return;
    }
    const current = theme[target];
    const next = current === "dark" ? "light" : current === "light" ? "dark" : getSystemTheme();
    setTheme(target, next);
  }, [theme, toggleGlobalTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        customColors,
        setTheme,
        setCustomColors,
        resetCustomColors,
        toggleTheme,
        setGlobalThemeMode,
        toggleGlobalTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeContext must be used within ThemeProvider");
  return context;
};
