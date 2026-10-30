// Placeholder course catalogue served by GET /api/courses until the .NET
// backend exposes real course endpoints. Server-side only — never import
// this from a React component.
//
// Values mirror the live rhenisnursing.com NCLEX panels.

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

const NCLEX_RN_COURSES: Omit<CourseRecord, "examType">[] = [
  {
    id: 4, title: "Pharmacology NCLEX-RN", category: "subject",
    questionCount: 162, examCount: 14, doneCount: 0,
    easyPct: 29, mediumPct: 45, hardPct: 27, order: 1,
    subCategories: [
      { id: "pharm-cardio", title: "Cardiovascular", questionCount: 39, usedCount: 0, order: 1 },
      { id: "pharm-endo", title: "Endocrine", questionCount: 26, usedCount: 0, order: 2 },
      { id: "pharm-gi", title: "Gastrointestinal", questionCount: 15, usedCount: 0, order: 3 },
      { id: "pharm-heme", title: "Hematologic/Oncologic", questionCount: 13, usedCount: 0, order: 4 },
      { id: "pharm-immune", title: "Immune", questionCount: 12, usedCount: 0, order: 5 },
      { id: "pharm-integ", title: "Integumentary", questionCount: 1, usedCount: 0, order: 6 },
      { id: "pharm-musculo", title: "Musculoskeletal", questionCount: 2, usedCount: 0, order: 7 },
      { id: "pharm-neuro", title: "Neurologic", questionCount: 9, usedCount: 0, order: 8 },
      { id: "pharm-psych", title: "Psychiatric", questionCount: 18, usedCount: 0, order: 9 },
      { id: "pharm-repro", title: "Reproductive", questionCount: 9, usedCount: 0, order: 10 },
      { id: "pharm-resp", title: "Respiratory", questionCount: 7, usedCount: 0, order: 11 },
      { id: "pharm-urinary", title: "Urinary and Renal", questionCount: 3, usedCount: 0, order: 12 },
      { id: "pharm-admin", title: "Medication Administration", questionCount: 7, usedCount: 0, order: 13 },
      { id: "pharm-visual", title: "Visual and Auditory", questionCount: 1, usedCount: 0, order: 14 },
    ],
  },
  {
    id: 1, title: "Pediatrics/ Child health NCLEX-RN", category: "subject",
    questionCount: 209, examCount: 13, doneCount: 0,
    easyPct: 30, mediumPct: 39, hardPct: 30, order: 2,
    subCategories: [
      { id: "peds-cardio", title: "Cardiovascular", questionCount: 14, usedCount: 0, order: 1 },
      { id: "peds-endo", title: "Endocrine", questionCount: 11, usedCount: 0, order: 2 },
      { id: "peds-gi", title: "Gastrointestinal", questionCount: 24, usedCount: 0, order: 3 },
      { id: "peds-heme", title: "Hematologic", questionCount: 14, usedCount: 0, order: 4 },
      { id: "peds-immune", title: "Immune/Infectious Disease", questionCount: 15, usedCount: 0, order: 5 },
      { id: "peds-integ", title: "Integumentary", questionCount: 11, usedCount: 0, order: 6 },
      { id: "peds-multi", title: "Multisystem", questionCount: 41, usedCount: 0, order: 7 },
      { id: "peds-musculo", title: "Musculoskeletal", questionCount: 15, usedCount: 0, order: 8 },
      { id: "peds-neuro", title: "Neurologic", questionCount: 26, usedCount: 0, order: 9 },
      { id: "peds-repro", title: "Reproductive", questionCount: 5, usedCount: 0, order: 10 },
      { id: "peds-resp", title: "Respiratory", questionCount: 18, usedCount: 0, order: 11 },
      { id: "peds-urinary", title: "Urinary and Renal", questionCount: 7, usedCount: 0, order: 12 },
      { id: "peds-visual", title: "Visual and Auditory", questionCount: 8, usedCount: 0, order: 13 },
    ],
  },
  {
    id: 6, title: "Mental Health NCLEX-RN", category: "subject",
    questionCount: 135, examCount: 4, doneCount: 0,
    easyPct: 43, mediumPct: 36, hardPct: 22, order: 3,
    subCategories: [
      { id: "mh-cognitive", title: "Cognitive and Developmental Disorders", questionCount: 23, usedCount: 0, order: 1 },
      { id: "mh-mood", title: "Mood and Personality Disorders", questionCount: 41, usedCount: 0, order: 2 },
      { id: "mh-anxiety", title: "Anxiety Disorders, Trauma, and Addiction", questionCount: 46, usedCount: 0, order: 3 },
      { id: "mh-foundations", title: "Foundations and Therapeutic Communication", questionCount: 25, usedCount: 0, order: 4 },
    ],
  },
  {
    id: 5, title: "Maternal & Newborn NCLEX-RN", category: "subject",
    questionCount: 83, examCount: 4, doneCount: 0,
    easyPct: 27, mediumPct: 46, hardPct: 26, order: 4,
    subCategories: [
      { id: "mat-ante", title: "Antepartum", questionCount: 29, usedCount: 0, order: 1 },
      { id: "mat-labor", title: "Labor & Delivery", questionCount: 22, usedCount: 0, order: 2 },
      { id: "mat-newborn", title: "Newborn", questionCount: 23, usedCount: 0, order: 3 },
      { id: "mat-post", title: "Postpartum", questionCount: 9, usedCount: 0, order: 4 },
    ],
  },
  {
    id: 7, title: "Leadership & Management NCLEX-RN", category: "subject",
    questionCount: 166, examCount: 3, doneCount: 0,
    easyPct: 41, mediumPct: 40, hardPct: 19, order: 5,
    subCategories: [
      { id: "lead-deleg", title: "Delegation and Assignment", questionCount: 53, usedCount: 0, order: 1 },
      { id: "lead-ethical", title: "Ethical & Legal Issues", questionCount: 54, usedCount: 0, order: 2 },
      { id: "lead-prior", title: "Prioritization", questionCount: 59, usedCount: 0, order: 3 },
    ],
  },
  {
    id: 3, title: "Fundamentals NCLEX-RN", category: "subject",
    questionCount: 81, examCount: 4, doneCount: 0,
    easyPct: 37, mediumPct: 49, hardPct: 15, order: 6,
    subCategories: [
      { id: "fund-fluid", title: "Fluid, Electrolytes, and Acid-Base Balance", questionCount: 6, usedCount: 0, order: 1 },
      { id: "fund-safety", title: "Safety and Infection Control", questionCount: 40, usedCount: 0, order: 2 },
      { id: "fund-comfort", title: "Basic Care and Comfort", questionCount: 26, usedCount: 0, order: 3 },
      { id: "fund-nutrition", title: "Nutrition and Elimination", questionCount: 9, usedCount: 0, order: 4 },
    ],
  },
  {
    id: 12, title: "CASE STUDIES (NGN)", category: "subject",
    questionCount: 124, examCount: 7, doneCount: 0,
    easyPct: 0, mediumPct: 2, hardPct: 98, order: 7,
    subCategories: [
      { id: "ngn-adult", title: "Adult Health/Med-Surg", questionCount: 88, usedCount: 0, order: 1 },
      { id: "ngn-fund", title: "Fundamentals of Nursing", questionCount: 4, usedCount: 0, order: 2 },
      { id: "ngn-lead", title: "Leadership & Management", questionCount: 2, usedCount: 0, order: 3 },
      { id: "ngn-mat", title: "Maternal & Newborn", questionCount: 11, usedCount: 0, order: 4 },
      { id: "ngn-mh", title: "Mental Health", questionCount: 5, usedCount: 0, order: 5 },
      { id: "ngn-peds", title: "Pediatrics/ Child Health", questionCount: 12, usedCount: 0, order: 6 },
      { id: "ngn-pharm", title: "Pharmacology", questionCount: 2, usedCount: 0, order: 7 },
    ],
  },
  {
    id: 2, title: "Adult Health NCLEX-RN", category: "subject",
    questionCount: 722, examCount: 13, doneCount: 0,
    easyPct: 35, mediumPct: 40, hardPct: 25, order: 8,
    subCategories: [
      { id: "adult-cardio", title: "Cardiovascular", questionCount: 143, usedCount: 0, order: 1 },
      { id: "adult-endo", title: "Endocrine", questionCount: 62, usedCount: 0, order: 2 },
      { id: "adult-gi", title: "Gastrointestinal", questionCount: 101, usedCount: 0, order: 3 },
      { id: "adult-heme", title: "Hematologic", questionCount: 55, usedCount: 0, order: 4 },
      { id: "adult-immune", title: "Immune/Infectious Disease", questionCount: 38, usedCount: 0, order: 5 },
      { id: "adult-integ", title: "Integumentary", questionCount: 29, usedCount: 0, order: 6 },
      { id: "adult-multi", title: "Multisystem", questionCount: 30, usedCount: 0, order: 7 },
      { id: "adult-musculo", title: "Musculoskeletal", questionCount: 45, usedCount: 0, order: 8 },
      { id: "adult-neuro", title: "Neurologic", questionCount: 55, usedCount: 0, order: 9 },
      { id: "adult-repro", title: "Reproductive", questionCount: 26, usedCount: 0, order: 10 },
      { id: "adult-resp", title: "Respiratory", questionCount: 61, usedCount: 0, order: 11 },
      { id: "adult-urinary", title: "Urinary and Renal", questionCount: 58, usedCount: 0, order: 12 },
      { id: "adult-visual", title: "Visual and Auditory", questionCount: 19, usedCount: 0, order: 13 },
    ],
  },
  {
    id: 11, title: "Safe & Effective Care Environment", category: "clientNeed",
    questionCount: 65, examCount: 1, doneCount: 0,
    easyPct: 18, mediumPct: 40, hardPct: 42, order: 9,
    subCategories: [
      { id: "65776bbd-b428-48e0-b801-028725b4a5a5", title: "Safe & Effective Care Environment", questionCount: 65, usedCount: 0, order: 1 },
    ],
  },
  {
    id: 10, title: "Psychosocial Integrity", category: "clientNeed",
    questionCount: 344, examCount: 1, doneCount: 0,
    easyPct: 43, mediumPct: 35, hardPct: 21, order: 10,
    subCategories: [
      { id: "f1fad7ae-558f-4cec-bbdd-60e39a71c985", title: "Psychosocial Integrity", questionCount: 344, usedCount: 0, order: 1 },
    ],
  },
  {
    id: 9, title: "Physiological Integrity", category: "clientNeed",
    questionCount: 116, examCount: 1, doneCount: 0,
    easyPct: 3, mediumPct: 21, hardPct: 77, order: 11,
    subCategories: [
      { id: "a91a0a2b-386f-4b80-a93a-badb2883daa3", title: "Physiological Integrity", questionCount: 116, usedCount: 0, order: 1 },
    ],
  },
  {
    id: 8, title: "Health Promotion & Maintenance", category: "clientNeed",
    questionCount: 357, examCount: 1, doneCount: 0,
    easyPct: 39, mediumPct: 39, hardPct: 22, order: 12,
    subCategories: [
      { id: "b7ea7c21-ea87-4836-a70f-8c5d95776b02", title: "Health Promotion & Maintenance", questionCount: 357, usedCount: 0, order: 1 },
    ],
  },
];

const NCLEX_PN_COURSES: Omit<CourseRecord, "examType">[] = [
  {
    id: 3, title: "Pharmacology NCLEX-PN", category: "subject",
    questionCount: 0, examCount: 14, doneCount: 0,
    easyPct: 0, mediumPct: 0, hardPct: 0, order: 1,
    subCategories: [

    ],
  },
  {
    id: 2, title: "Pediatrics/Child Health NCLEX-PN", category: "subject",
    questionCount: 69, examCount: 13, doneCount: 0,
    easyPct: 46, mediumPct: 35, hardPct: 19, order: 2,
    subCategories: [
      { id: "pn-peds-cardio", title: "Cardiovascular", questionCount: 9, usedCount: 0, order: 1 },
      { id: "pn-peds-endo", title: "Endocrine", questionCount: 6, usedCount: 0, order: 2 },
      { id: "pn-peds-gi", title: "Gastrointestinal", questionCount: 16, usedCount: 0, order: 3 },
      { id: "pn-peds-heme", title: "Hematologic", questionCount: 3, usedCount: 0, order: 4 },
      { id: "pn-peds-immune", title: "Immune/Infectious Disease", questionCount: 9, usedCount: 0, order: 5 },
      { id: "pn-peds-integ", title: "Integumentary", questionCount: 2, usedCount: 0, order: 6 },
      { id: "pn-peds-multi", title: "Multisystem", questionCount: 4, usedCount: 0, order: 7 },
      { id: "pn-peds-musculo", title: "Musculoskeletal", questionCount: 4, usedCount: 0, order: 8 },
      { id: "pn-peds-neuro", title: "Neurologic", questionCount: 12, usedCount: 0, order: 9 },
      { id: "pn-peds-repro", title: "Reproductive", questionCount: 2, usedCount: 0, order: 10 },
      { id: "pn-peds-resp", title: "Respiratory", questionCount: 10, usedCount: 0, order: 11 },
      { id: "pn-peds-urinary", title: "Urinary and Renal", questionCount: 4, usedCount: 0, order: 12 },
      { id: "pn-peds-visual", title: "Visual and Auditory", questionCount: 1, usedCount: 0, order: 13 },
    ],
  },
  {
    id: 6, title: "Mental Health NCLEX-PN", category: "subject",
    questionCount: 92, examCount: 4, doneCount: 0,
    easyPct: 50, mediumPct: 33, hardPct: 17, order: 3,
    subCategories: [
      { id: "pn-mh-cognitive", title: "Cognitive and Developmental Disorders", questionCount: 27, usedCount: 0, order: 1 },
      { id: "pn-mh-mood", title: "Mood and Personality Disorders", questionCount: 27, usedCount: 0, order: 2 },
      { id: "pn-mh-anxiety", title: "Anxiety Disorders, Trauma, and Addiction", questionCount: 21, usedCount: 0, order: 3 },
      { id: "pn-mh-foundations", title: "Foundations and Therapeutic Communication", questionCount: 17, usedCount: 0, order: 4 },
    ],
  },
  {
    id: 5, title: "Maternal & Newborn NCLEX-PN", category: "subject",
    questionCount: 98, examCount: 4, doneCount: 0,
    easyPct: 24, mediumPct: 41, hardPct: 35, order: 4,
    subCategories: [
      { id: "pn-mat-ante", title: "Antepartum", questionCount: 35, usedCount: 0, order: 1 },
      { id: "pn-mat-labor", title: "Labor & Delivery", questionCount: 17, usedCount: 0, order: 2 },
      { id: "pn-mat-newborn", title: "Newborn", questionCount: 24, usedCount: 0, order: 3 },
      { id: "pn-mat-post", title: "Postpartum", questionCount: 22, usedCount: 0, order: 4 },
    ],
  },
  {
    id: 4, title: "Management of Care NCLEX-PN", category: "subject",
    questionCount: 0, examCount: 3, doneCount: 0,
    easyPct: 0, mediumPct: 0, hardPct: 0, order: 5,
    subCategories: [

    ],
  },
  {
    id: 8, title: "Fundamentals NCLEX-PN", category: "subject",
    questionCount: 207, examCount: 4, doneCount: 0,
    easyPct: 51, mediumPct: 37, hardPct: 13, order: 6,
    subCategories: [
      { id: "pn-fund-promo", title: "Health Promotion", questionCount: 11, usedCount: 0, order: 1 },
      { id: "pn-fund-safety", title: "Safety and Infection Control", questionCount: 73, usedCount: 0, order: 2 },
      { id: "pn-fund-comfort", title: "Basic Care and Comfort", questionCount: 31, usedCount: 0, order: 3 },
      { id: "pn-fund-pharm", title: "Pharmacological and Parenteral Therapies", questionCount: 11, usedCount: 0, order: 4 },
      { id: "pn-fund-risk", title: "Reduction of Risk Potential", questionCount: 28, usedCount: 0, order: 5 },
      { id: "pn-fund-adapt", title: "Physiological Adaptation", questionCount: 21, usedCount: 0, order: 6 },
      { id: "pn-fund-psych", title: "Psychosocial Integrity", questionCount: 32, usedCount: 0, order: 7 },
    ],
  },
  {
    id: 7, title: "Case Studies (NGN)", category: "subject",
    questionCount: 53, examCount: 7, doneCount: 0,
    easyPct: 0, mediumPct: 2, hardPct: 98, order: 7,
    subCategories: [
      { id: "pn-ngn-fund", title: "Fundamentals of Nursing", questionCount: 8, usedCount: 0, order: 1 },
      { id: "pn-ngn-mat", title: "Maternal & Newborn", questionCount: 10, usedCount: 0, order: 2 },
      { id: "pn-ngn-mh", title: "Mental Health", questionCount: 23, usedCount: 0, order: 3 },
      { id: "pn-ngn-peds", title: "Pediatrics/ Child Health", questionCount: 12, usedCount: 0, order: 4 },
    ],
  },
  {
    id: 1, title: "Adult Health NCLEX-PN", category: "subject",
    questionCount: 228, examCount: 13, doneCount: 0,
    easyPct: 38, mediumPct: 39, hardPct: 23, order: 8,
    subCategories: [
      { id: "pn-adult-cardio", title: "Cardiovascular", questionCount: 27, usedCount: 0, order: 1 },
      { id: "pn-adult-endo", title: "Endocrine", questionCount: 11, usedCount: 0, order: 2 },
      { id: "pn-adult-gi", title: "Gastrointestinal", questionCount: 16, usedCount: 0, order: 3 },
      { id: "pn-adult-heme", title: "Hematologic", questionCount: 7, usedCount: 0, order: 4 },
      { id: "pn-adult-immune", title: "Immune/Infectious Disease", questionCount: 14, usedCount: 0, order: 5 },
      { id: "pn-adult-integ", title: "Integumentary", questionCount: 25, usedCount: 0, order: 6 },
      { id: "pn-adult-multi", title: "Multisystem", questionCount: 32, usedCount: 0, order: 7 },
      { id: "pn-adult-musculo", title: "Musculoskeletal", questionCount: 19, usedCount: 0, order: 8 },
      { id: "pn-adult-neuro", title: "Neurologic", questionCount: 28, usedCount: 0, order: 9 },
      { id: "pn-adult-repro", title: "Reproductive", questionCount: 7, usedCount: 0, order: 10 },
      { id: "pn-adult-resp", title: "Respiratory", questionCount: 14, usedCount: 0, order: 11 },
      { id: "pn-adult-urinary", title: "Urinary and Renal", questionCount: 24, usedCount: 0, order: 12 },
      { id: "pn-adult-visual", title: "Visual and Auditory", questionCount: 13, usedCount: 0, order: 13 },
    ],
  },
  {
    id: 12, title: "Safe & Effective Care Environment", category: "clientNeed",
    questionCount: 195, examCount: 1, doneCount: 0,
    easyPct: 30, mediumPct: 40, hardPct: 30, order: 9,
    subCategories: [
      { id: "pn-client-sece", title: "Safe & Effective Care Environment", questionCount: 195, usedCount: 0, order: 1 },
    ],
  },
  {
    id: 11, title: "Psychosocial Integrity", category: "clientNeed",
    questionCount: 92, examCount: 1, doneCount: 0,
    easyPct: 43, mediumPct: 35, hardPct: 21, order: 10,
    subCategories: [
      { id: "pn-client-psi", title: "Psychosocial Integrity", questionCount: 92, usedCount: 0, order: 1 },
    ],
  },
  {
    id: 10, title: "Physiological Integrity", category: "clientNeed",
    questionCount: 280, examCount: 1, doneCount: 0,
    easyPct: 25, mediumPct: 45, hardPct: 30, order: 11,
    subCategories: [
      { id: "pn-client-pi", title: "Physiological Integrity", questionCount: 280, usedCount: 0, order: 1 },
    ],
  },
  {
    id: 9, title: "Health Promotion & Maintenance", category: "clientNeed",
    questionCount: 153, examCount: 1, doneCount: 0,
    easyPct: 39, mediumPct: 39, hardPct: 22, order: 12,
    subCategories: [
      { id: "pn-client-hpm", title: "Health Promotion & Maintenance", questionCount: 153, usedCount: 0, order: 1 },
    ],
  },
];

export const COURSE_PLACEHOLDERS: CourseRecord[] = [
  ...NCLEX_RN_COURSES.map((c) => ({ ...c, examType: "nclex-rn" as const })),
  ...NCLEX_PN_COURSES.map((c) => ({ ...c, examType: "nclex-pn" as const })),
];
