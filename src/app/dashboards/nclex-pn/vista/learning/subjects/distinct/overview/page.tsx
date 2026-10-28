"use client";

import { useSearchParams } from "next/navigation";
import { CourseSubjectsPage } from "@/components/common/dashboards/subjects/CourseSubjectsPage";

export default function StrataSubjectsPage() {
  const searchParams = useSearchParams();
  const identifier = searchParams?.get("identifier") || "1cb41630-1203-42ae-8844-92afa60eea9b";

  return (
    <CourseSubjectsPage
      panelSlug="nclex-pn"
      courseSlug="nclex-pn-practice-exams"
      courseId={identifier}
      livePanelSlug="nclex-pn"
      showExamBuilder={true}
    />
  );
}
