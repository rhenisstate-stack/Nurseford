import { CourseSubjectsPage } from "@/components/common/dashboards/subjects/CourseSubjectsPage";

export default async function CourseSubjectsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return (
    <CourseSubjectsPage
      panelSlug="rn-nursing"
      courseSlug={slug}
      courseId={id}
      livePanelSlug="rn-nursing"
      showExamBuilder
    />
  );
}