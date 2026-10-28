// Typed subject catalog served by GET /api/exams/[examType]/subjects.
//
// Every dashboard renders its subject cards from the backend courses when available.
// When the backend is unreachable or returns empty, these catalog entries provide a
// guaranteed fallback so the card rows never render completely empty.

import { COURSE_PLACEHOLDERS } from "@/lib/data/nclex-course-seed";

export interface ExamSubject {
  name: string;
  slug: string;
  href: string;
}

import type { DashboardSubCategory } from "@/lib/hooks/home/useExamCourses";

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

function nclexSubjects(examType: "nclex-rn" | "nclex-pn"): ExamSubject[] {
  return COURSE_PLACEHOLDERS.filter((c) => c.examType === examType)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      name: c.title,
      slug: toSlug(c.title),
      href: "/register",
    }));
}

const ATI_TEAS_SUBJECTS: ExamSubject[] = [
  { name: "SCIENCE", slug: "science", href: "/register" },
  { name: "READING Comp", slug: "reading-comprehension", href: "/register" },
  { name: "MATH", slug: "math", href: "/register" },
  { name: "ENGLISH", slug: "english", href: "/register" },
];

const HESI_A2_SUBJECTS: ExamSubject[] = [
  { name: "READING COMP...", slug: "reading-comprehension", href: "/register" },
  { name: "BIOLOGY", slug: "biology", href: "/register" },
  { name: "MATH", slug: "math", href: "/register" },
  { name: "GRAMMAR", slug: "grammar", href: "/register" },
  { name: "VOCABULARY", slug: "vocabulary", href: "/register" },
  { name: "ANATOMY", slug: "anatomy", href: "/register" },
];

const NCLEX_RN_SUBJECTS: ExamSubject[] = nclexSubjects("nclex-rn");
const NCLEX_PN_SUBJECTS: ExamSubject[] = nclexSubjects("nclex-pn");

const RN_NURSING_SUBJECTS: ExamSubject[] = [
  { name: "HESI EXAM", slug: "hesi-exam", href: "/register" },
  { name: "ATI EXAM", slug: "ati-exam", href: "/register" },
  { name: "EXIT ATI", slug: "exit-ati", href: "/register" },
  { name: "EXIT HESI", slug: "exit-hesi", href: "/register" },
  { name: "EXAMPLIFY", slug: "examplify", href: "/register" },
  { name: "GENERAL", slug: "general", href: "/register" },
];

const LPN_NURSING_SUBJECTS: ExamSubject[] = [
  { name: "HESI EXAMS", slug: "hesi-exams", href: "/register" },
  { name: "ATI EXAMS", slug: "ati-exams", href: "/register" },
  { name: "EXIT ATI", slug: "exit-ati", href: "/register" },
  { name: "EXIT HESI", slug: "exit-hesi", href: "/register" },
  { name: "EXAMPLIFY", slug: "examplify", href: "/register" },
  { name: "KAPLAN", slug: "kaplan", href: "/register" },
];

const CNA_SUBJECTS: ExamSubject[] = [
  { name: "BASIC NURSING", slug: "basic-nursing", href: "/register" },
  { name: "CLIENT RIGHTS", slug: "client-rights", href: "/register" },
  { name: "COMMUNICATION", slug: "communication", href: "/register" },
  { name: "SAFETY & EMERGENCY", slug: "safety-emergency", href: "/register" },
];

const GED_SUBJECTS: ExamSubject[] = [
  { name: "MATHEMATICAL REASONING", slug: "mathematical-reasoning", href: "/register" },
  { name: "REASONING THROUGH LANGUAGE ARTS", slug: "reasoning-through-language-arts", href: "/register" },
  { name: "SCIENCE", slug: "science", href: "/register" },
  { name: "SOCIAL STUDIES", slug: "social-studies", href: "/register" },
];

const PRE_NURSING_SUBJECTS: ExamSubject[] = [
  { name: "ANATOMY & PHYSIOLOGY", slug: "anatomy-physiology", href: "/register" },
  { name: "MICROBIOLOGY", slug: "microbiology", href: "/register" },
  { name: "CHEMISTRY", slug: "chemistry", href: "/register" },
  { name: "PSYCHOLOGY", slug: "psychology", href: "/register" },
];

const CERTIFICATION_SUBJECTS: ExamSubject[] = [
  { name: "CLINICAL KNOWLEDGE", slug: "clinical-knowledge", href: "/register" },
  { name: "PATIENT CARE", slug: "patient-care", href: "/register" },
  { name: "SAFETY & PROTOCOLS", slug: "safety-protocols", href: "/register" },
  { name: "PHARMACOLOGY", slug: "pharmacology", href: "/register" },
];

const ACCUPLACER_SUBJECTS: ExamSubject[] = [
  { name: "ARITHMETIC", slug: "arithmetic", href: "/register" },
  { name: "READING", slug: "reading", href: "/register" },
  { name: "WRITING", slug: "writing", href: "/register" },
  { name: "COMPREHENSIVE", slug: "comprehensive", href: "/register" },
];

export const EXAM_SUBJECTS: Record<string, ExamSubject[]> = {
  "ati-teas": ATI_TEAS_SUBJECTS,
  "hesi-a2": HESI_A2_SUBJECTS,
  "nclex-rn": NCLEX_RN_SUBJECTS,
  "nclex-pn": NCLEX_PN_SUBJECTS,
  "rn-nursing": RN_NURSING_SUBJECTS,
  "lpn-nursing": LPN_NURSING_SUBJECTS,
  "cna": CNA_SUBJECTS,
  "ged": GED_SUBJECTS,
  "pre-nursing": PRE_NURSING_SUBJECTS,
  "certification": CERTIFICATION_SUBJECTS,
  "accuplacer": ACCUPLACER_SUBJECTS,
};

export const VALID_EXAM_TYPES = Object.keys(EXAM_SUBJECTS);

export function getExamSubjects(examType: string): ExamSubject[] | null {
  return EXAM_SUBJECTS[examType] ?? null;
}