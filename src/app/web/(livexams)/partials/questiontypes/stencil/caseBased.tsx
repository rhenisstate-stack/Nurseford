// src\app\web\(livexams)\rn-nursing\vista\exam\(layout)\partials\questiontypes\stencil\caseBased.tsx
'use client';

import { useState, useEffect, type ComponentType } from "react";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { QuestionPromptHeader } from "@/components/panel/exam/QuestionPromptHeader";
import { filterExhibitTabs, cleanTabTitle } from "@/lib/utils/exams/cleanExamText";

export interface InnerQuestionProps {
  q: StrataSessionQuestionFull;
  questionNumber?: number;
  mode?: string;
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
  hideQuestionHeader?: boolean;
}

interface Props {
  q: StrataSessionQuestionFull;
  questionNumber?: number;
  mode?: string;
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
  InnerQuestion: ComponentType<InnerQuestionProps>;
}

export const CaseBasedStencil = ({
  q,
  questionNumber,
  mode,
  examId,
  examGuidId,
  sectionId,
  sectionGuidId,
  InnerQuestion,
}: Props) => {

  // Matches commit 8345708 logic:
  // If entries tagged "CaseBasedData" exist, use them.
  // Otherwise fall back to "CaseStudyData" or general contents, sanitized via filterExhibitTabs.
  const caseContents = (() => {
    const raw = q.questionContents ?? [];
    const caseBased = raw.filter((c) => c.prerequisites === "CaseBasedData");
    const target = caseBased.length > 0 ? caseBased : raw;
    return filterExhibitTabs(target, q.questionText);
  })();

  const [activeTab, setActiveTab] = useState<number>(
    caseContents[0]?.id ?? 0
  );

  useEffect(() => {
    if (caseContents.length > 0 && !caseContents.some((c) => c.id === activeTab)) {
      setActiveTab(caseContents[0].id);
    }
  }, [caseContents, activeTab]);

  const activeContent = caseContents.find((c) => c.id === activeTab) || caseContents[0];
  const activeDesc = activeContent?.description && !/^(null|undefined)$/i.test(activeContent.description.trim())
    ? activeContent.description
    : "";

  return (
    <div className="p-0 space-y-3">
      {/* Question number + stem rendered ONCE with standard older system styling */}
      <QuestionPromptHeader
        questionNumber={questionNumber}
        questionText={q.questionText}
      />

      {/* Case passage / scenario tabs (Nurses' Notes, Vital Signs, etc.) */}
      {caseContents.length > 0 && (
        <div className="my-3">
          <div className="flex items-end overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-button]:hidden">
            {caseContents.map((c) => {
              const isActive = activeTab === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveTab(c.id)}
                  className={`px-4 py-2 text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-[#001326] border-t border-l border-r border-slate-300 dark:border-slate-600 rounded-t-md border-b-0"
                      : "font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-b border-slate-300 dark:border-slate-700 border-t-0 border-l-0 border-r-0 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800/20"
                  }`}
                >
                  {cleanTabTitle(c.title) || "Clinical Notes"}
                </button>
              );
            })}
            <div className="flex-1 border-b border-slate-300 dark:border-slate-700 self-stretch" />
          </div>
          {activeContent && (
            <div
              className="exhibit-content-body py-3 px-0.5 sm:px-1 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-button]:hidden"
              dangerouslySetInnerHTML={{ __html: activeDesc }}
            />
          )}
        </div>
      )}

      {/* Separation border line after exhibit and before meta */}
      {caseContents.length > 0 && (
        <div className="border-b border-slate-300 dark:border-slate-700 my-3" />
      )}

      {/* Meta Question below separation line and above Choices */}
      {q.metaQuestionText && q.metaQuestionText.toLowerCase().trim() !== "null" && (
        <div className="pt-1 pb-2 mb-2">
          <div
            className="text-base sm:text-lg text-blue-700 dark:text-blue-400 font-bold italic leading-snug"
            dangerouslySetInnerHTML={{ __html: q.metaQuestionText }}
          />
        </div>
      )}

      {/* Delegate the actual answer UI + its own toolbar to the underlying standalone component */}
      <InnerQuestion
        q={q}
        mode={mode}
        examId={examId}
        examGuidId={examGuidId}
        sectionId={sectionId}
        sectionGuidId={sectionGuidId}
        hideQuestionHeader
      />
    </div>
  );
};