"use client";

import { useSearchParams } from "next/navigation";
import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default function StrataExamsPage() {
  const searchParams = useSearchParams();
  const identifier = searchParams?.get("identifier") || "";

  return (
    <SubjectExamsHierarchyPage
      panelSlug="nclex-rn"
      livePanelSlug="nclex-rn"
      panelLabel="NCLEX-RN"
      courseSlug="nclex-rn-practice-exams"
      courseId="c05ca275-d7a1-402a-958f-642db853f2df"
      subjectId={identifier}
    />
  );
}
