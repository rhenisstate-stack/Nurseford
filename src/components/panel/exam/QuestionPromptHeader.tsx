"use client";

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

  let cleanQuestion = (questionText ?? "").trim();
  // Strip duplicate leading question numbers if already embedded in string (e.g. "1: ", "1. ", "Question 1: ")
  cleanQuestion = cleanQuestion.replace(/^(?:question\s*)?\d+[\.\:\)]\s*/i, "");
  // Strip embedded HTML table so static dummy tables never render in the prompt header
  cleanQuestion = cleanQuestion
    .replace(/<table[\s\S]*?<\/table>/gi, "")
    .replace(/(?:<p[^>]*>\s*(?:<br\s*\/?>)?\s*<\/p>\s*)+$/gi, "")
    .trim();

  return (
    <div className="space-y-1.5 mb-3.5">
      <div className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug flex items-start gap-1.5">
        {questionNumber != null && (
          <span className="font-bold text-slate-900 dark:text-white shrink-0">
            {questionNumber}:
          </span>
        )}
        <div
          className="flex-1 inline [&>p]:inline [&>p]:m-0 [&>p]:leading-snug"
          dangerouslySetInnerHTML={{ __html: cleanQuestion }}
        />
      </div>

      {metaQuestionText && metaQuestionText.toLowerCase().trim() !== "null" && (
        <div
          className="text-base sm:text-lg text-blue-700 dark:text-blue-400 font-bold italic pl-6 leading-snug"
          dangerouslySetInnerHTML={{ __html: metaQuestionText }}
        />
      )}
    </div>
  );
}
