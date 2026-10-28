"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";

const THEME_COMPONENTS = [
  "navbar",
  "leftSidebar",
  "rightSidebar",
  "content",
  "footer",
] as const;

const ThemeModeToggle: React.FC = () => {
  const { theme, toggleGlobalTheme, setGlobalThemeMode } = useThemeContext();

  const isLight = theme.global === "light";

  const handleToggle = () => {
    if (toggleGlobalTheme) {
      toggleGlobalTheme();
    } else {
      const nextMode = isLight ? "dark" : "light";
      setGlobalThemeMode(nextMode);
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--text-color)]/25 text-[var(--text-color)] hover:bg-[var(--text-color)]/10 transition-colors"
    >
      {isLight ? (
        <Moon className="w-[18px] h-[18px]" />
      ) : (
        <Sun className="w-[18px] h-[18px]" />
      )}
    </button>
  );
};

export default ThemeModeToggle;
