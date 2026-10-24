// Shared exam / dashboard selections used across the web auth flows so users
// can pick which dashboard they want to be dropped into after login/register.

export interface ExamOption {
  value: string; // dashboard route slug: /dashboards/{value}
  label: string;
  segment: string; // stratum segment used by dashboard course grids
}

export const EXAM_OPTIONS: ExamOption[] = [
  { value: "ati-teas", label: "TEAS 7 PREP", segment: "ATI_TEAS" },
  { value: "hesi-a2", label: "HESI A2 PREP", segment: "HESI_A2" },
  { value: "nclex-rn", label: "NCLEX-RN", segment: "NCLEX_RN" },
  { value: "nclex-pn", label: "NCLEX-PN", segment: "NCLEX_PN" },
  { value: "rn-nursing", label: "RN Nursing", segment: "RN_NURSING" },
  { value: "lpn-nursing", label: "LPN Nursing", segment: "LPN_NURSING" },
];

export const EXAM_OPTION_MAP: Record<string, ExamOption> = Object.fromEntries(
  EXAM_OPTIONS.map((opt) => [opt.value, opt])
);

export function examDashboardHref(slug: string | null | undefined): string {
  const safe = slug && EXAM_OPTION_MAP[slug] ? slug : "";
  return safe ? `/dashboards/${safe}` : "/pages/entrance";
}