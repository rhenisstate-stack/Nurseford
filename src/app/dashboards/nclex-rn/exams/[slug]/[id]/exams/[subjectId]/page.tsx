import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default async function NclexRnSubjectExamsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string; subjectId: string }>;
}) {
  const { slug, id, subjectId } = await params;
  return (
    <SubjectExamsHierarchyPage
      panelSlug="nclex-rn"
      livePanelSlug="nclex-rn"
      panelLabel="NCLEX-RN"
      courseSlug={slug}
      courseId={id}
      subjectId={subjectId}
    />
  );
}
