"use client";

import { cleanPromptHtml } from "@/lib/utils/exams/cleanExamText";

interface QuestionPromptHeaderProps {
  questionNumber?: number;
  questionText?: string;
  metaQuestionText?: string;
  hideQuestionHeader?: boolean;
}

export function QuestionPromptHeader({
  questionNumber,
  questionText,
  metaQuestionText,
  hideQuestionHeader,
}: QuestionPromptHeaderProps) {
  if (hideQuestionHeader) return null;

  const cleanQuestion = cleanPromptHtml(questionText, true);
  const cleanMeta = cleanPromptHtml(metaQuestionText, false);
  const showMeta = Boolean(cleanMeta && cleanMeta.toLowerCase().trim() !== "null");

  return (
    <div
      className="space-y-1 mb-1.5"
      style={{ fontFamily: "'Calibre', 'Calibri', Candara, 'Segoe UI', Arial, sans-serif" }}
    >
      <div className="exam-title-heading font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug flex items-start gap-1.5">
        {questionNumber != null && (
          <span className="font-bold text-slate-900 dark:text-white shrink-0">
            {questionNumber}:
          </span>
        )}
        <div
          className="flex-1 inline [&>p]:inline [&>p]:m-0 [&>p]:leading-snug [&_*]:!text-inherit [&_*]:!font-inherit [&_*]:!leading-snug [&_*]:!font-bold font-bold"
          dangerouslySetInnerHTML={{ __html: cleanQuestion }}
        />
      </div>

      {showMeta && (
        <div
          className="exam-title-heading text-base sm:text-lg text-slate-900 dark:text-white font-bold pl-6 leading-snug [&_*]:!text-inherit [&_*]:!font-inherit [&_*]:!leading-snug"
          dangerouslySetInnerHTML={{ __html: cleanMeta }}
        />
      )}
    </div>
  );
}
