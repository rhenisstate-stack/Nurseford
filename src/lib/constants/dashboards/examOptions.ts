// Shared exam / dashboard selections used across the web auth flows so users
// can pick which dashboard they want to be dropped into after login/register.

export interface ExamOption {
  value: string; // dashboard route slug: /dashboards/{value}
  label: string;
  segment: string; // stratum segment used by dashboard course grids
}

export const EXAM_OPTIONS: ExamOption[] = [
  { value: "rn-nursing", label: "RN Nursing Exam", segment: "RN_NURSING" },
  { value: "lpn-nursing", label: "LPN Nursing Exam", segment: "LPN_NURSING" },
];

export const EXAM_OPTION_MAP: Record<string, ExamOption> = Object.fromEntries(
  EXAM_OPTIONS.map((opt) => [opt.value, opt])
);

export function examDashboardHref(slug: string | null | undefined): string {
  const safe = slug && EXAM_OPTION_MAP[slug] ? slug : "";
  return safe ? `/dashboards/${safe}` : "/pages/entrance";
}