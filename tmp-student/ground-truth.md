===== NCLEX-RN dispatcher :: src/app/dashboards/nclex-rn/page.tsx (215 lines) =====
  84:   const [popupDefaultMode, setPopupDefaultMode] = useState<NclexAction>("custom");
  85: 
  86:   const handleAction = (action: NclexAction) => {
  87:     if (action === "practice") {
  88:       router.push(`/dashboards/nclex-rn/vista/assessment/exams/distinct/overview`);
  89:       return;
  90:     }
  91:     if (action === "readiness") {
  92:       router.push(`/dashboards/nclex-rn/practice/examinations/${NCLEX_PRACTICE_CONFIG["nclex-rn"].readiness.domainsGroupId}`);
  93:       return;
  94:     }
  95:     setPopupDefaultMode(action);
  96:     setPopupOpen(true);
  97:   };
  98: 
  99:   const handleCourseCustomTest = () => {
 100:     setPopupDefaultMode("custom");

===== NCLEX-PN dispatcher :: src/app/dashboards/nclex-pn/page.tsx (215 lines) =====
  84:   const [popupDefaultMode, setPopupDefaultMode] = useState<NclexAction>("custom");
  85: 
  86:   const handleAction = (action: NclexAction) => {
  87:     if (action === "practice") {
  88:       router.push(`/dashboards/nclex-pn/vista/assessment/exams/distinct/overview`);
  89:       return;
  90:     }
  91:     if (action === "readiness") {
  92:       router.push(`/dashboards/nclex-pn/practice/examinations/${NCLEX_PRACTICE_CONFIG["nclex-pn"].readiness.domainsGroupId}`);
  93:       return;
  94:     }
  95:     setPopupDefaultMode(action);
  96:     setPopupOpen(true);
  97:   };
  98: 
  99:   const handleCourseCustomTest = () => {
 100:     setPopupDefaultMode("custom");

===== Domains landing (nclex-rn) 1151 lines — key wiring =====
   5: import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
   6: import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
  35: const BASE_CHILD_ROUTE = `/web/${VISTA_STRATA_PANEL}/vista/${VISTA_CHILD_STRATA}`;
  61: const examStrataIdentifier = searchParams.get("identifier");
 122: } = useNominalStrataExams({
 171: const handleCardClick = (row: StrataItem) => {
 181: const identifier = selectedExam.guidId ?? selectedExam.id;
 183: router.push(
 184: `${BASE_CHILD_ROUTE}/${layout}?mode=${encodeURIComponent(mode)}&identifier=${identifier}`
 360: pathname: `${BASE_TOGGLE_ROUTE}/distinct/outline`,
 362: ? { identifier: examStrataIdentifier }
 631: onClick={() => handleCardClick(strataName)}

===== NCLEX practice config :: src/lib/config/nclex-practice.ts (22 lines) =====
   1: export type NclexExamType = "nclex-rn" | "nclex-pn";
   2: 
   3: export interface NclexPracticeGroup {
   4:   domainsGroupId: string;
   5:   label: string;
   6: }
   7: 
   8: // Real backend assessment groups on the .NET backend (108.61.9.189:8008):
   9: //   group 8 = "RN Nursing Exams GROUP"  (1285 exams) — NCLEX-RN curriculum
  10: //   group 5 = "LPN Nursing Exams GROUP" (361 exams)  — NCLEX-PN curriculum
  11: // The previous ids 27/28/30 pointed at domain-group ids that return 0 domains.
  12: export const NCLEX_PRACTICE_CONFIG: Record<NclexExamType, { practice: NclexPracticeGroup; readiness: NclexPracticeGroup }> = {
  13:   "nclex-rn": {
  14:     practice: { domainsGroupId: "8", label: "NCLEX-RN Practice Exams" },
  15:     readiness: { domainsGroupId: "8", label: "NCLEX-RN Readiness Assessment Test (RAT)" },
  16:   },
  17:   "nclex-pn": {
  18:     practice: { domainsGroupId: "5", label: "NCLEX-PN Practice Exams" },
  19:     readiness: { domainsGroupId: "5", label: "NCLEX-PN Readiness Assessment Test (RAT)" },
  20:   },
  21: };
  22: 
