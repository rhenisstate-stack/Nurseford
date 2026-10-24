// src\app\web\(livexams)\ati-teas\vista\exam\(layout)\partials\questiontypes\stencil\caseBased.tsx
'use client';

import { useState, type ComponentType } from "react";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";

// Contract every standalone question-type component must satisfy to be pluggable
// into this stencil. hideQuestionHeader lets the inner component suppress its own
// number-badge + questionText, since the stencil renders that once itself, above
// the case passage tabs.
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

// Generic stencil for every StrataQuestionType.CaseBased* variant (19 total).
// Renders the shared case passage/scenario viewer (tabs + content) FIRST — exactly
// as the old CaseBasedQuestion component did — then delegates the actual
// answer-collection UI (and its own toolbar) to whichever standalone base
// component is passed in via InnerQuestion. This file is never used directly by
// the dispatcher — merged/CaseBasedDynamics.tsx is the linker that decides which
// InnerQuestion to hand this stencil, based on q.type.
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

  // Only entries tagged "CaseBasedData" are case passages and become tabs.
  const cases = (q.questionContents ?? []).filter(
    (c) => c.prerequisites === "CaseBasedData"
  );

  const [activeTab, setActiveTab] = useState<number>(cases[0]?.id ?? 0);
  const activeContent = cases.find((c) => c.id === activeTab);

  return (
    <div className="p-0 space-y-2">

      {/* Question number + stem — rendered ONCE here; InnerQuestion's own header is suppressed via hideQuestionHeader */}
      <div className="flex items-center gap-3">
        <div className="shrink-0 py-1 px-2 rounded
          bg-gradient-to-br from-yellow-800 to-blue-600 text-white
          flex items-center justify-center text-xs md:text-sm font-bold shadow-md">
          {questionNumber}
        </div>
        <div
          className="flex-1 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: q.questionText ?? "" }}
        />
      </div>

      {/* Case passage / scenario tabs — always shown first, before the answer control */}
      {cases.length > 0 && (
        <div className="rounded-lg border border-indigo-200 overflow-hidden">
          <div className="flex justify-between border-b border-indigo-200 bg-indigo-50 overflow-x-auto">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`flex-1 min-w-[80px] px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors
                  ${activeTab === c.id
                    ? "bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-100"
                  }`}
              >
                {c.title}
              </button>
            ))}
          </div>
          {activeContent && (
            <div
              className="p-3 bg-white text-sm text-gray-700 leading-relaxed max-h-52 overflow-y-auto prose prose-sm"
              dangerouslySetInnerHTML={{ __html: activeContent.description ?? "" }}
            />
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {q.metaQuestionText && q.metaQuestionText.trim().toLowerCase() !== "null" && (
        <div
          className="text-md p-2 text-green-900 bg-green-50 rounded-md"
          dangerouslySetInnerHTML={{ __html: q.metaQuestionText }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

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