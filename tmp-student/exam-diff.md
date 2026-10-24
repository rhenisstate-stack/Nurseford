ATI lines: 1151  |  RN lines: 1151
──── ATI constants (lines 1-45) ────
   1: "use client";
   2: 
   3: import { useState, useEffect } from "react";
   4: import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
   5: import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
   6: import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
   7: import SearchBar from "@/lib/utils/data/SearchBar";
   8: import PerPageSelect from "@/lib/utils/data/PerPageSelect";
   9: import { useRouter, useSearchParams } from "next/navigation";
  10: import { APP_TITLE } from "@/lib/config/config";
  11: import Link from "next/link";
  12: import { LayoutList, ChevronLeft, ChevronRight, Check } from "lucide-react";
  13: import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
  14: import { useMemo } from "react";   // For Random Quote Memoization
  15: 
  16: // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  17: export type LearningStrata =
  18:   | "program"
  19:   | "course"
  20:   | "subject"
  21:   | "unit"
  22:   | "lesson"
  23:   | "topic"
  24:   | "concept"
  25:   | "fact";
  26: 
  27: const VISTA_STRATA_PANEL = "ati-teas";
  28: const VISTA_STRATA_LEVEL = "Exams";
  29: const VISTA_STRATA_NAME = "Exam";
  30: const VISTA_STRATA_GROUP = "assessment";
  31: const VISTA_CHILD_LEVEL = "Exam";  // For Live Child Redirection
  32: const VISTA_DEFAULT_PERPAGE_LIST = 12;
  33: const VISTA_STRATA = VISTA_STRATA_LEVEL.toLocaleLowerCase();
  34: const VISTA_CHILD_STRATA = VISTA_CHILD_LEVEL.toLocaleLowerCase();
  35: const BASE_CHILD_ROUTE = `/web/${VISTA_STRATA_PANEL}/vista/${VISTA_CHILD_STRATA}`;
  36: const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_STRATA}`;
  37: 
  38: 
  39: // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  40: // Main Component
  41: export default function ExamsPage() {
  42:   const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  43: 
  44:   const [perPage, setPerPage] = useState(VISTA_DEFAULT_PERPAGE_LIST); // Default Per PAge
  45:   const [currentPage, setCurrentPage] = useState(1);
──── RN constants (lines 1-45) ────
   1: "use client";
   2: 
   3: import { useState, useEffect } from "react";
   4: import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
   5: import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
   6: import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
   7: import SearchBar from "@/lib/utils/data/SearchBar";
   8: import PerPageSelect from "@/lib/utils/data/PerPageSelect";
   9: import { useRouter, useSearchParams } from "next/navigation";
  10: import { APP_TITLE } from "@/lib/config/config";
  11: import Link from "next/link";
  12: import { LayoutList, ChevronLeft, ChevronRight, Check } from "lucide-react";
  13: import { VISTA_QUOTES } from "@/lib/constants/dashboards/nexus/vista/quotes";
  14: import { useMemo } from "react";   // For Random Quote Memoization
  15: 
  16: // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  17: export type LearningStrata =
  18:   | "program"
  19:   | "course"
  20:   | "subject"
  21:   | "unit"
  22:   | "lesson"
  23:   | "topic"
  24:   | "concept"
  25:   | "fact";
  26: 
  27: const VISTA_STRATA_PANEL = "nclex-rn";
  28: const VISTA_STRATA_LEVEL = "Exams";
  29: const VISTA_STRATA_NAME = "Exam";
  30: const VISTA_STRATA_GROUP = "assessment";
  31: const VISTA_CHILD_LEVEL = "Exam";  // For Live Child Redirection
  32: const VISTA_DEFAULT_PERPAGE_LIST = 12;
  33: const VISTA_STRATA = VISTA_STRATA_LEVEL.toLocaleLowerCase();
  34: const VISTA_CHILD_STRATA = VISTA_CHILD_LEVEL.toLocaleLowerCase();
  35: const BASE_CHILD_ROUTE = `/web/${VISTA_STRATA_PANEL}/vista/${VISTA_CHILD_STRATA}`;
  36: const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA_GROUP}/${VISTA_STRATA}`;
  37: 
  38: 
  39: // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  40: // Main Component
  41: export default function ExamsPage() {
  42:   const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  43: 
  44:   const [perPage, setPerPage] = useState(VISTA_DEFAULT_PERPAGE_LIST); // Default Per PAge
  45:   const [currentPage, setCurrentPage] = useState(1);
ATI grid@624 click@170 childPush@183 popup@101
RN  grid@624 click@170 childPush@183 popup@101
────────────────────────────
[ATI].click ctx:
 171:   const handleCardClick = (row: StrataItem) => {
 172:     setSelectedExam(row);
 173:     setShowModePopup(true);
 174:   };
 175: 
 176:   // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 177:   // Mode Slection Handler
 178:   const handleModeSelection = (mode: string) => {
 179:     if (!selectedExam) return;
 180: 
 181:     const identifier = selectedExam.guidId ?? selectedExam.id;
 182: 
 183:     router.push(
 184:       `${BASE_CHILD_ROUTE}/${layout}?mode=${encodeURIComponent(mode)}&identifier=${identifier}`

[ATI].nav ctx:
 184:       `${BASE_CHILD_ROUTE}/${layout}?mode=${encodeURIComponent(mode)}&identifier=${identifier}`
 185:     );
 186: 
 187:     setShowModePopup(false);
 188:   };
 189: 
 190:   // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 191: 
────────────────────────────
[RN].click ctx:
 171:   const handleCardClick = (row: StrataItem) => {
 172:     setSelectedExam(row);
 173:     setShowModePopup(true);
 174:   };
 175: 
 176:   // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 177:   // Mode Slection Handler
 178:   const handleModeSelection = (mode: string) => {
 179:     if (!selectedExam) return;
 180: 
 181:     const identifier = selectedExam.guidId ?? selectedExam.id;
 182: 
 183:     router.push(
 184:       `${BASE_CHILD_ROUTE}/${layout}?mode=${encodeURIComponent(mode)}&identifier=${identifier}`

[RN].nav ctx:
 184:       `${BASE_CHILD_ROUTE}/${layout}?mode=${encodeURIComponent(mode)}&identifier=${identifier}`
 185:     );
 186: 
 187:     setShowModePopup(false);
 188:   };
 189: 
 190:   // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 191: 