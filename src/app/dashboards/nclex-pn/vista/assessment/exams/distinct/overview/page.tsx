"use client";

import { useSearchParams } from "next/navigation";
import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default function StrataExamsPage() {
  const searchParams = useSearchParams();
  const identifier = searchParams?.get("identifier") || "";

  return (
    <SubjectExamsHierarchyPage
      panelSlug="nclex-pn"
      livePanelSlug="nclex-pn"
      panelLabel="NCLEX-PN"
      courseSlug="nclex-pn-practice-exams"
      courseId="1cb41630-1203-42ae-8844-92afa60eea9b"
      subjectId={identifier}
    />
  );
}
