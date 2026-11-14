import { CourseSubjectsPage } from "@/components/common/dashboards/subjects/CourseSubjectsPage";

export default async function RnNursingHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ course?: string; track?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const isExit = sp?.track === "exit";
  const defaultSlug = isExit ? "exit-ati-exams-rn" : "ati-exams-rn";
  const defaultId = isExit ? "36" : "34";

  return (
    <CourseSubjectsPage
      panelSlug="rn-nursing"
      courseSlug={sp?.course || defaultSlug}
      courseId={defaultId}
      livePanelSlug="rn-nursing"
      showExamBuilder
    />
  );
}
