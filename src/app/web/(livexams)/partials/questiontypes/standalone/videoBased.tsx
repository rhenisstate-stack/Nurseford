// src\app\web\(livexams)\ati-teas\vista\exam\(layout)\partials\questiontypes\standalone\videoBased.tsx
'use client';

// TODO: build out real VideoBased question UI (StrataQuestionType.VideoBased).
// Placeholder only — exists so imports in merged/CaseBasedDynamics.tsx and the
// dispatcher resolve and the app compiles.

import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";

interface Props {
  q: StrataSessionQuestionFull;
  questionNumber?: number;
  mode?: string;
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
  hideQuestionHeader?: boolean;
}

export const VideoBasedQuestion = ({ q, questionNumber, hideQuestionHeader }: Props) => (
  <div className="p-3 space-y-2">
    {!hideQuestionHeader && (
      <div className="flex items-baseline gap-2 font-medium">
        <span className="text-xs font-bold text-indigo-100 shrink-0">Q - {questionNumber}</span>
        <span dangerouslySetInnerHTML={{ __html: q.questionText ?? "" }} />
      </div>
    )}
    <div className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
      🚧 VideoBased question UI not yet implemented.
    </div>
  </div>
);