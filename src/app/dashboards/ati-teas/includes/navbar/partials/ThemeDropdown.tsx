"use client";

import { Sun, Moon, ChevronDown, Palette, X, Check } from "lucide-react";
import {
  useThemeContext,
  CustomColors,
  DEFAULT_THEME_COLORS,
} from "@/lib/contexts/panel/layout/theme/PanelThemeContext";

import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";


const ThemeDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColorTarget, setCurrentColorTarget] = useState<keyof CustomColors>("navbar");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    theme,
    customColors,
    setTheme,
    setCustomColors,
    resetCustomColors,
  } = useThemeContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: "default" | "light" | "dark" | "custom") => {
    const components = ["navbar", "leftSidebar", "rightSidebar", "content", "footer"] as const;

    if (newTheme === "custom") {
      components.forEach((c) => setTheme(c, "custom"));
      setTheme("global", "custom");
      setShowColorPicker(true);
    }

    else if (newTheme === "default") {
      components.forEach((c) => setTheme(c, "default"));
      setTheme("global", "default");
    }

    else {
      // light | dark
      components.forEach((c) => setTheme(c, newTheme));
      setTheme("global", newTheme);
      // DO NOT touch customColors
    }

    setIsOpen(false);
  };


  const handleColorChange = (color: string) => {
    setCustomColors({ [currentColorTarget]: color });
    if (currentColorTarget !== "text") {
      setTheme(currentColorTarget as Exclude<keyof CustomColors, "text">, "custom");
    }
  };

  const handleResetCustomColors = () => {
    const components = ["navbar", "leftSidebar", "rightSidebar", "content", "footer"] as const;

    resetCustomColors();

    components.forEach((c) => setTheme(c, "default"));
    setTheme("global", "default");

    setShowColorPicker(false);
    setIsOpen(false);
  };

  const getActiveThemeMode = () => {
    if (theme.global === "custom") return "custom";
    if (theme.global === "default") return "default";
    if (theme.global === "dark") return "dark";
    if (theme.global === "light") return "light";
    return theme.global;
  };

  const activeMode = getActiveThemeMode();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-[var(--text-color)] hover:bg-[var(--text-color)]/10 rounded-lg transition"
      >
        {activeMode === "dark" ? (
          <Moon className="w-5 h-5" />
        ) : activeMode === "light" ? (
          <Sun className="w-5 h-5" />
        ) : activeMode === "default" ? (
          <Palette className="w-5 h-5 text-blue-500" />
        ) : (
          <Palette className="w-5 h-5" />
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--leftSidebar-bg)] text-[var(--text-color)] rounded-md shadow-lg py-1 z-50 border border-[var(--text-color)]/15 select-none">
          {["default", "light", "dark", "custom"].map((mode) => (
            <button
              key={mode}
              onClick={() => handleThemeChange(mode as "default" | "light" | "dark" | "custom")}
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                mode === activeMode
                  ? "bg-[var(--text-color)]/15 text-[var(--text-color)]"
                  : "text-[var(--text-color)] opacity-75 hover:text-[var(--text-color)] hover:bg-[var(--text-color)]/10"
                }`}
            >
              {mode === "light" && <Sun className="w-4 h-4 mr-2" />}
              {mode === "dark" && <Moon className="w-4 h-4 mr-2" />}
              {mode === "custom" && <Palette className="w-4 h-4 mr-2" />}
              {mode === "default" && <Palette className="w-4 h-4 mr-2 text-blue-500" />}
              {mode[0].toUpperCase() + mode.slice(1)}
              {mode === activeMode && <Check className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
      )}

      {showColorPicker && (
        <div className="fixed inset-0 flex items-center justify-center z-50 select-none">
          <div
            className="
            bg-gray-300
            dark:bg-gradient-to-br from-green-400 via-amber-200/90 to-yellow-400/90
            p-3
            rounded-xl
            shadow-2xl
            w-[300px]
            backdrop-blur-lg

            border-2
            border-black
            text-center
          "
          >

            <div className="flex justify-between items-center mb-2">
              <h2 className="text-md font-semibold text-center w-full tracking-wide">
                Custom Theme Palette
              </h2>

              <button
                onClick={() => setShowColorPicker(false)}
                className="
                  group
                  absolute right-3 top-3
                  p-1.5
                  rounded-full
                  border
                  border-cyan-400
                  bg-yellow-200
                  backdrop-blur-md
                  shadow-[0_0_10px_rgba(34,211,238,0.35)]
                  transition-all
                  duration-300
                  hover:border-cyan-300
                  hover:shadow-[0_0_16px_rgba(34,211,238,0.7)]
                  hover:scale-110
                  active:scale-95
                "
                aria-label="Close color picker"
              >
                <X
                  className="
                    w-5 h-5
                    text-indigo-600
                    transition
                    duration-300
                    group-hover:text-red-700
                    group-hover:rotate-90
                  "
                />
              </button>
            </div>

            <div className="mb-2">
              <label className="block text-xs font-medium mb-1 opacity-80">
                Select Target Component
              </label>
              <select
                value={currentColorTarget}
                onChange={(e) => setCurrentColorTarget(e.target.value as keyof CustomColors)}
                className="
                  w-full
                  p-1.5
                  text-s
                  border-2
                rounded-lg
                  bg-yellow-300
                  text-black
                  border-black
                  focus:ring-2 focus:ring-cyan-400
                "
              >
                <option value="navbar">Navigation Bar</option>
                <option value="leftSidebar">Left Sidebar</option>
                <option value="rightSidebar">Right Sidebar</option>
                <option value="content">Body Content</option>
                <option value="footer">Footer Section</option>
                <option value="text">Text Color</option>
              </select>


            </div>
            <hr className="my-3 border-gray-200 dark:border-gray-700" />

            <div className="mb-2 flex justify-center">
              <HexColorPicker
                color={(customColors ?? DEFAULT_THEME_COLORS)[currentColorTarget]}
                onChange={handleColorChange}
                className="w-full h-40 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded border border-white/40"
                style={{ backgroundColor: (customColors ?? DEFAULT_THEME_COLORS)[currentColorTarget] }}
              />
              <input
                type="text"
                value={(customColors ?? DEFAULT_THEME_COLORS)[currentColorTarget]}
                onChange={(e) => handleColorChange(e.target.value)}
                className="
                  flex-1
                  p-1.5
                  text-xs
                  border
                  rounded-lg
                  bg-white/80
                  text-black
                  border-gray-300
                  focus:ring-2 focus:ring-cyan-400
                "
              />
            </div>

            <button
              onClick={() => setShowColorPicker(false)}
              className="
                w-full
                py-1.5
                text-xs
                font-semibold
                rounded-lg
                border
                border-cyan-400
                bg-gradient-to-r from-cyan-200 to-blue-00
                text-black
                shadow-[0_0_12px_rgba(34,211,238,0.4)]
                transition-all
                duration-300
                hover:shadow-[0_0_20px_rgba(34,211,238,0.8)]
                hover:scale-[1.02]
                active:scale-95
              "
            >
              Apply &amp; Close 🏌️‍♂️
            </button>

            <hr className="my-3 border-gray-200 dark:border-gray-700" />

            <button
              onClick={handleResetCustomColors}
              className="
               w-full
                py-1.5
                text-xs
                font-semibold
                rounded-lg
                border
                border-cyan-400
                bg-gradient-to-r from-cyan-200 to-blue-00
                text-black
                shadow-[0_0_12px_rgba(34,211,238,0.4)]
                transition-all
                duration-300
                hover:shadow-[0_0_20px_rgba(34,211,238,0.8)]
                hover:scale-[1.02]
                active:scale-95
            "
            >
              Reset Custom Theme to Default
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default ThemeDropdown;
