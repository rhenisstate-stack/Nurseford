import { CourseSubjectsPage } from "@/components/common/dashboards/subjects/CourseSubjectsPage";

export default async function NclexRnCourseSubjectsRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return (
    <CourseSubjectsPage
      panelSlug="nclex-rn"
      courseSlug={slug}
      courseId={id}
      livePanelSlug="nclex-rn"
      showExamBuilder
    />
  );
}
