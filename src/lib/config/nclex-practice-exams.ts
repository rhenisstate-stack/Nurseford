import type { NclexExamType } from "@/lib/config/nclex-practice";

export interface NclexPracticeExamSpec {
  id: string;
  title: string;
  questionsCount: number;
  year: number;
  locked: boolean;
}

export const NCLEX_PRACTICE_EXAMS: Record<
  NclexExamType,
  { practice: NclexPracticeExamSpec[]; readiness: NclexPracticeExamSpec[] }
> = {
  "nclex-rn": { practice: [], readiness: [] },
  "nclex-pn": { practice: [], readiness: [] },
};
