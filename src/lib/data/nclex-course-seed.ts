export type NclexExamType = "nclex-rn" | "nclex-pn";
export type CourseCategory = "subject" | "clientNeed";

export interface SubCategoryRecord {
  id: string;
  title: string;
  questionCount: number;
  usedCount: number;
  order: number;
}

export interface CourseRecord {
  id: number;
  examType: NclexExamType;
  title: string;
  category: CourseCategory;
  questionCount: number;
  examCount: number;
  doneCount: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
  order: number;
  subCategories: SubCategoryRecord[];
}

export const COURSE_PLACEHOLDERS: CourseRecord[] = [];
