// src\app\web\(nursing)\atiteas\vista\exam\(layout)\glacial\layout.tsx
"use client";

import type { ReactNode } from "react";

import { LowerRibbonProvider } from "./partials/LowerRibbonContext";
import { NonStickyRibbonProvider } from "./partials/NonStickyRibbonContext";
import { FooterRibbonProvider } from "./partials/FooterRibbonContext";
import { ExamThemeProvider } from "@/lib/contexts/web/assessment/theme/ExamThemeContext";
import { ExamFontSizeProvider } from "@/lib/contexts/web/assessment/theme/ExamFontSizeContext";

import StickyNavBar from "./partials/StickyNavBar";
import NonStickyNavBar from "./partials/NonStickyNavBar";
import StickyFooter from "./partials/StickyFooter";

export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <LowerRibbonProvider>
      <NonStickyRibbonProvider>
        <FooterRibbonProvider>
          <ExamThemeProvider>
            <ExamFontSizeProvider>

              <div className="flex flex-col min-h-screen select-none">

                <StickyNavBar />
                <NonStickyNavBar />

                <main
                  className="flex-1 px-0 sm:px-0 lg:px-0 py-0 select-none"
                  style={{
                    backgroundColor: "var(--exam-content-bg)",
                    color: "var(--exam-content-text)",
                  }}
                >
                  {children}
                </main>

                <StickyFooter />

              </div>

            </ExamFontSizeProvider>
          </ExamThemeProvider>
        </FooterRibbonProvider>
      </NonStickyRibbonProvider>
    </LowerRibbonProvider>
  );
}