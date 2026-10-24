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

  return (
    <LiveStrataExamProvider
      examIdentifier={examIdentifier}
      selectedMode={selectedMode}
      selectedLayout={selectedLayout}
    >
      <LiveExamActionProvider key={examIdentifier}>
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