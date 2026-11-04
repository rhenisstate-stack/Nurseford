"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";

const ThemeModeToggle: React.FC = () => {
  const { theme, toggleGlobalTheme, setGlobalThemeMode } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = theme.global === "light";

  const handleToggle = () => {
    if (toggleGlobalTheme) {
      toggleGlobalTheme();
    } else {
      const nextMode = isLight ? "dark" : "light";
      setGlobalThemeMode(nextMode);
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        title="Toggle theme"
        suppressHydrationWarning
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--text-color)]/25 text-[var(--text-color)] transition-colors opacity-80"
      >
        <span className="w-[18px] h-[18px] inline-block" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      suppressHydrationWarning
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
