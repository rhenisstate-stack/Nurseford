import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default async function HesiA2SubjectExamsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string; subjectId: string }>;
}) {
  const { slug, id, subjectId } = await params;
  return (
    <SubjectExamsHierarchyPage
      panelSlug="hesi-a2"
      livePanelSlug="hesi-a2"
      panelLabel="HESI A2"
      courseSlug={slug}
      courseId={id}
      subjectId={subjectId}
    />
  );
}