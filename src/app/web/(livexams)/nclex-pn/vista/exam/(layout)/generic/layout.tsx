"use client";

import type { ReactNode } from "react";

import { LowerRibbonProvider } from "./partials/LowerRibbonContext";
import { NonStickyRibbonProvider } from "./partials/NonStickyRibbonContext";
import { FooterRibbonProvider } from "./partials/FooterRibbonContext";
import { ExamThemeProvider } from "@/lib/contexts/web/assessment/theme/ExamThemeContext";
import { ExamFontSizeProvider } from "@/lib/contexts/web/assessment/theme/ExamFontSizeContext";

export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <LowerRibbonProvider>
      <NonStickyRibbonProvider>
        <FooterRibbonProvider>
          <ExamThemeProvider>
            <ExamFontSizeProvider>
              <div
                data-exam-page="true"
                className="min-h-screen select-none bg-slate-50 dark:bg-[#071321] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200"
              >
                {children}
              </div>
            </ExamFontSizeProvider>
          </ExamThemeProvider>
        </FooterRibbonProvider>
      </NonStickyRibbonProvider>
    </LowerRibbonProvider>
  );
}
