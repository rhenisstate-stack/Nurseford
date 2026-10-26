import { CourseSubjectsPage } from "@/components/common/dashboards/subjects/CourseSubjectsPage";

export default async function NclexPnCourseSubjectsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return (
    <CourseSubjectsPage
      panelSlug="nclex-pn"
      courseSlug={slug}
      courseId={id}
      livePanelSlug="nclex-pn"
      showExamBuilder
    />
  );
}
