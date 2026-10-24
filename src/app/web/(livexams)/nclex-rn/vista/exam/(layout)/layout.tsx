// src\app\web\(nursing)\atiteas\vista\exam\(layout)\layout.tsx
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

  return (
    <LiveStrataExamProvider
      examIdentifier={examIdentifier}
      selectedMode={selectedMode}
      selectedLayout={selectedLayout}
      targetAttemptNumber={Number.isNaN(targetAttemptNumber) ? null : targetAttemptNumber}
    >
      <LiveExamActionProvider>
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