// Typed subject models and utilities for dashboard routes.
// All subject cards and exam lists are fetched 100% dynamically from the live backend.

import type { DashboardSubCategory } from "@/lib/hooks/home/useExamCourses";

export interface ExamSubject {
  name: string;
  slug: string;
  href: string;
}

// Subject record served by GET /api/exams/[examType]/subjects.
export interface BackendSubject {
  id: number | string;
  guidId?: string;
  name: string;
  slug: string;
  description?: string;
  examCount?: number;
  questionCount?: number;
  subCategories?: DashboardSubCategory[];
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const VALID_EXAM_TYPES = [
  "ati-teas",
  "hesi-a2",
  "nclex-rn",
  "nclex-pn",
  "rn-nursing",
  "lpn-nursing",
  "cna",
  "ged",
  "pre-nursing",
  "certification",
  "accuplacer",
] as const;

export function getExamSubjects(_examType: string): ExamSubject[] | null {
  return null;
}
