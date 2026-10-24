import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default async function LpnNursingSubjectExamsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string; subjectId: string }>;
}) {
  const { slug, id, subjectId } = await params;
  return (
    <SubjectExamsHierarchyPage
      panelSlug="lpn-nursing"
      livePanelSlug="lpn-nursing"
      panelLabel="LPN NURSING"
      courseSlug={slug}
      courseId={id}
      subjectId={subjectId}
    />
  );
}