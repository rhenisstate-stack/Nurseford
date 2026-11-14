import { CourseSubjectsPage } from "@/components/common/dashboards/subjects/CourseSubjectsPage";

export default async function LpnNursingHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ course?: string; track?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const isExit = sp?.track === "exit";
  const defaultSlug = isExit ? "exit-ati-exams-lpn" : "ati-exams-lpn";
  const defaultId = isExit ? "23" : "21";

  return (
    <CourseSubjectsPage
      panelSlug="lpn-nursing"
      courseSlug={sp?.course || defaultSlug}
      courseId={defaultId}
      livePanelSlug="lpn-nursing"
      showExamBuilder
    />
  );
}
