import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default async function AtiTeasSubjectExamsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string; subjectId: string }>;
}) {
  const { slug, id, subjectId } = await params;
  return (
    <SubjectExamsHierarchyPage
      panelSlug="ati-teas"
      livePanelSlug="ati-teas"
      panelLabel="TEAS 7 Prep"
      courseSlug={slug}
      courseId={id}
      subjectId={subjectId}
    />
  );
}