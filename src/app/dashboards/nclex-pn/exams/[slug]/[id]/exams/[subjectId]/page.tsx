import { SubjectExamsHierarchyPage } from "@/components/common/dashboards/subjects/SubjectExamsHierarchyPage";

export default async function NclexPnSubjectExamsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string; subjectId: string }>;
}) {
  const { slug, id, subjectId } = await params;
  return (
    <SubjectExamsHierarchyPage
      panelSlug="nclex-pn"
      livePanelSlug="nclex-pn"
      panelLabel="NCLEX-PN"
      courseSlug={slug}
      courseId={id}
      subjectId={subjectId}
    />
  );
}
