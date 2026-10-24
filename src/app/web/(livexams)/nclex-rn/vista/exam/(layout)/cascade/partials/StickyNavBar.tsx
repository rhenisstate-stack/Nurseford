"use client";

import { useLiveStrataExamContext } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";

import UpperStickyNavBar from "./UpperStickyNavBar";
import LowerStickyNavBar from "./LowerStickyNavBar";

// ── Inner component — needs to be inside the providers to access contexts ──────
function NavBarsWithLiveData() {
  const { examSession } = useLiveStrataExamContext();
  const { getAnswer } = useLiveExamActionContext();

  const allQuestions = (examSession?.sections ?? []).flatMap((s) => s.questions ?? []);
  const totalQuestions = allQuestions.length || (examSession?.exam?.questionsCount ?? 0);

  const answeredCount = allQuestions.filter((q) => {
    const ctxAnswer = getAnswer(q.id);
    return ctxAnswer != null || q.savedUserAnswer != null;
  }).length;

  return (
    <>
      <UpperStickyNavBar />
      <LowerStickyNavBar
        questionsAnswered={answeredCount}
        totalQuestions={totalQuestions}
      />
    </>
  );
}

// No props — all data comes from context ─────────────────────────────────────
export default function StickyNavBar() {
  return (
    <div className="sticky top-0 z-[1000] w-full overflow-visible select-none"
      style={{ backgroundColor: "var(--exam-upper-nav-bg)" }}>
      <NavBarsWithLiveData />
    </div>
  );
}