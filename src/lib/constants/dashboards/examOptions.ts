// Shared exam / dashboard selections used across the web auth flows so users
// can pick which dashboard they want to be dropped into after login/register.

export interface ExamOption {
  value: string; // dashboard route slug: /dashboards/{value}
  label: string;
  segment: string; // stratum segment used by dashboard course grids
}

export const EXAM_OPTIONS: ExamOption[] = [
  { value: "rn-nursing", label: "RN Nursing Exams", segment: "RN_NURSING" },
  { value: "rn-exit", label: "RN Exit Exams", segment: "RN_EXIT" },
  { value: "lpn-nursing", label: "LPN Nursing Exams", segment: "LPN_NURSING" },
  { value: "lpn-exit", label: "LPN Exit Exams", segment: "LPN_EXIT" },
];

export const EXAM_OPTION_MAP: Record<string, ExamOption> = Object.fromEntries(
  EXAM_OPTIONS.map((opt) => [opt.value, opt])
);

export function examDashboardHref(slug: string | null | undefined): string {
  const safe = slug && EXAM_OPTION_MAP[slug] ? slug : "";
  if (!safe) return "/pages/entrance";
  if (safe === "rn-nursing") return "/dashboards/rn-nursing?track=nursing";
  if (safe === "rn-exit") return "/dashboards/rn-nursing?track=exit";
  if (safe === "lpn-nursing") return "/dashboards/lpn-nursing?track=nursing";
  if (safe === "lpn-exit") return "/dashboards/lpn-nursing?track=exit";
  return `/dashboards/${safe}`;
}