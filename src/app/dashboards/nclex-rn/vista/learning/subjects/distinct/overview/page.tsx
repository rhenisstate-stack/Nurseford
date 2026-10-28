"use client";

import { useSearchParams } from "next/navigation";
import { CourseSubjectsPage } from "@/components/common/dashboards/subjects/CourseSubjectsPage";

export default function StrataSubjectsPage() {
  const searchParams = useSearchParams();
  const identifier = searchParams?.get("identifier") || "c05ca275-d7a1-402a-958f-642db853f2df";

  return (
    <CourseSubjectsPage
      panelSlug="nclex-rn"
      courseSlug="nclex-rn-practice-exams"
      courseId={identifier}
      livePanelSlug="nclex-rn"
      showExamBuilder={true}
    />
  );
}
