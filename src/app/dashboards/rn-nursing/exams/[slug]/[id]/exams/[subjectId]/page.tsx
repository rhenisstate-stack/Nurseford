import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default async function RnNursingSubjectExamsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string; subjectId: string }>;
}) {
  const { slug, id, subjectId } = await params;
  return (
    <SubjectExamsHierarchyPage
      panelSlug="rn-nursing"
      livePanelSlug="rn-nursing"
      panelLabel="RN NURSING"
      courseSlug={slug}
      courseId={id}
      subjectId={subjectId}
    />
  );
}