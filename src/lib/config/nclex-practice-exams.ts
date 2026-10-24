import type { NclexExamType } from "@/lib/config/nclex-practice";

export interface NclexPracticeExamSpec {
  id: string;
  title: string;
  questionsCount: number;
  year: number;
  locked: boolean;
}

// The NCLEX practice / readiness exam catalog.
//
// These are the live records served by the practice group (RN: 27, PN: 5) and
// the readiness group (RN: 28, PN: 30):
//
//   Practice  -> NCLEX-RN Practice Exam 1..4
//   Readiness -> NCLEX RN-Readiness Assessment Test-1..6
//
// The practice hub counts them and the examinations pages render them as
// LOCKED exam cards. When the backend returns real records for those groups
// the hook result takes precedence — this catalog is only the fallback so the
// flows never render empty.
export const NCLEX_PRACTICE_EXAMS: Record<
  NclexExamType,
  { practice: NclexPracticeExamSpec[]; readiness: NclexPracticeExamSpec[] }
> = {
  "nclex-rn": {
    practice: [
      { id: "nclex-rn-practice-1", title: "NCLEX-RN Practice Exam 1", questionsCount: 123, year: 2025, locked: true },
      { id: "nclex-rn-practice-2", title: "NCLEX-RN Practice Exam 2", questionsCount: 122, year: 2025, locked: true },
      { id: "nclex-rn-practice-3", title: "NCLEX-RN Practice Exam 3", questionsCount: 100, year: 2025, locked: true },
      { id: "nclex-rn-practice-4", title: "NCLEX-RN Practice Exam-4", questionsCount: 123, year: 2025, locked: true },
    ],
    readiness: [
      { id: "nclex-rn-rat-1", title: "NCLEX RN-Readiness Assessment Test-1", questionsCount: 104, year: 2025, locked: true },
      { id: "nclex-rn-rat-2", title: "NCLEX RN-Readiness Assessment Test-2", questionsCount: 106, year: 2025, locked: true },
      { id: "nclex-rn-rat-3", title: "NCLEX RN-Readiness Assessment Test-3", questionsCount: 38, year: 2025, locked: true },
      { id: "nclex-rn-rat-4", title: "NCLEX RN-Readiness Assessment Test-4", questionsCount: 97, year: 2025, locked: true },
      { id: "nclex-rn-rat-5", title: "NCLEX RN-Readiness Assessment Test-5", questionsCount: 96, year: 2025, locked: true },
      { id: "nclex-rn-rat-6", title: "NCLEX RN-Readiness Assessment Test-6", questionsCount: 93, year: 2025, locked: true },
    ],
  },
  "nclex-pn": {
    practice: [
      { id: "nclex-pn-practice-1", title: "NCLEX-PN Practice Exam 1", questionsCount: 123, year: 2025, locked: true },
      { id: "nclex-pn-practice-2", title: "NCLEX-PN Practice Exam 2", questionsCount: 122, year: 2025, locked: true },
      { id: "nclex-pn-practice-3", title: "NCLEX-PN Practice Exam 3", questionsCount: 100, year: 2025, locked: true },
      { id: "nclex-pn-practice-4", title: "NCLEX-PN Practice Exam-4", questionsCount: 123, year: 2025, locked: true },
    ],
    readiness: [
      { id: "nclex-pn-rat-1", title: "NCLEX PN-Readiness Assessment Test-1", questionsCount: 104, year: 2025, locked: true },
      { id: "nclex-pn-rat-2", title: "NCLEX PN-Readiness Assessment Test-2", questionsCount: 106, year: 2025, locked: true },
      { id: "nclex-pn-rat-3", title: "NCLEX PN-Readiness Assessment Test-3", questionsCount: 38, year: 2025, locked: true },
      { id: "nclex-pn-rat-4", title: "NCLEX PN-Readiness Assessment Test-4", questionsCount: 97, year: 2025, locked: true },
      { id: "nclex-pn-rat-5", title: "NCLEX PN-Readiness Assessment Test-5", questionsCount: 96, year: 2025, locked: true },
      { id: "nclex-pn-rat-6", title: "NCLEX PN-Readiness Assessment Test-6", questionsCount: 93, year: 2025, locked: true },
    ],
  },
};