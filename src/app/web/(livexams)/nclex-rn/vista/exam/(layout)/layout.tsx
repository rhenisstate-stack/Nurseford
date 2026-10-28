"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LiveStrataExamProvider } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";
import { LiveExamActionProvider } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";

function LiveExamLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const examIdentifier = searchParams.get("identifier") ?? "";
  const selectedMode   = searchParams.get("mode")       ?? "Exam";
  const selectedLayout = searchParams.get("layout")     ?? "Generic";

  const attemptParam = searchParams.get("attempt");
  const targetAttemptNumber = attemptParam !== null ? parseInt(attemptParam, 10) : null;

  const builderMode = (searchParams.get("builderMode") as "questions" | "exams" | null) ?? null;
  const questionCountParam = searchParams.get("questionCount");
  const questionCount = questionCountParam ? parseInt(questionCountParam, 10) : null;
  const examCountParam = searchParams.get("examCount");
  const examCount = examCountParam ? parseInt(examCountParam, 10) : null;
  const subCategories = searchParams.get("subCategories") ?? "";
  const customTitle = searchParams.get("customTitle") ?? null;

  return (
    <LiveStrataExamProvider
      examIdentifier={examIdentifier}
      selectedMode={selectedMode}
      selectedLayout={selectedLayout}
      targetAttemptNumber={Number.isNaN(targetAttemptNumber) ? null : targetAttemptNumber}
      builderMode={builderMode}
      questionCount={questionCount}
      examCount={examCount}
      subCategories={subCategories}
      customTitle={customTitle}
    >
      <LiveExamActionProvider key={examIdentifier || subCategories}>
        {children}
      </LiveExamActionProvider>
    </LiveStrataExamProvider>
  );
}

export default function LiveExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <LiveExamLayoutInner>{children}</LiveExamLayoutInner>
    </Suspense>
  );
}
