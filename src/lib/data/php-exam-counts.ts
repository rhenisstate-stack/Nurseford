/**
 * Course ID aliases and Course display names for .NET backend routing.
 * Fallback PHP counts have been completely purged so live backend data is never overridden.
 */

export const COURSE_ID_ALIASES: Record<string, string> = {
  // Legacy frontend alias IDs (> 39) -> Real Backend .NET Course IDs (Program 9)
  "40": "34", // Legacy alias -> Backend 34 (ATI Exams)
  "41": "36", // Legacy alias -> Backend 36 (EXIT ATI)
  "42": "37", // Legacy alias -> Backend 37 (EXIT HESI)
  "43": "35", // Legacy alias -> Backend 35 (EXAMPLIFY Practice)
  "44": "38", // Legacy alias -> Backend 38 (GENERAL Exams)
};

export const PHP_COURSE_NAMES: Record<string, string> = {
  // Accuplacer (Program 2)
  "1": "Arithmetic-Next Gen (Accuplacer)",
  "2": "Comprehensive Exam-Next Gen (Accuplacer)",
  "3": "Reading-Next Gen (Accuplacer)",
  "4": "Writing-Next Gen (Accuplacer)",

  // TEAS 7 Prep (Program 3)
  "5": "Comprehensive TEAS 7 Prep Tests",
  "6": "ENGLISH",
  "7": "MATH.",
  "8": "READING Comprehension.",
  "9": "SCIENCE",

  // GED (Program 4)
  "10": "Language Arts (GED)",
  "11": "Maths (GED)",
  "12": "Science (GED)",
  "13": "Social Studies (GED)",

  // HESI A2 (Program 5)
  "14": "Anatomy & Physiology",
  "15": "BIOLOGY",
  "16": "Comprehensive HESI A2 Exams",
  "17": "GRAMMAR",
  "18": "MATH",
  "19": "READING Comprehension",
  "20": "VOCABULARIES",

  // LPN Nursing (Program 6)
  "21": "ATI Exams (LPN)",
  "22": "EXAMPLIFY Practice (PN)",
  "23": "EXIT ATI Exams-LPN",
  "24": "EXIT HESI Exams-LPN",
  "25": "HESI Exams (LPN)",
  "26": "KAPLAN Exams",

  // NCLEX PN (Program 7)
  "27": "NCLEX PN-Readiness Assessment Tests",
  "28": "NCLEX-PN Practice Exams",
  "29": "Standalone Questions-NCLEX-PN",

  // NCLEX RN (Program 8)
  "30": "Client Needs",
  "31": "NCLEX RN- Readiness Assessment Tests",
  "32": "NCLEX-RN-Practice Exams",
  "33": "Standalone Questions-NCLEX-RN",

  // RN Nursing (Program 9)
  "34": "ATI Exams (RN)",
  "35": "EXAMPLIFY Practice (RN)",
  "36": "EXIT ATI Exams-RN",
  "37": "EXIT HESI Exams-RN",
  "38": "GENERAL Exams",
  "39": "HESI Exams (RN)",

  // Legacy alias IDs
  "40": "ATI Exams (RN)",
  "41": "EXIT ATI Exams-RN",
  "42": "EXIT HESI Exams-RN",
  "43": "EXAMPLIFY Practice (RN)",
  "44": "GENERAL Exams",
};

// Normalized name -> exam count map: all hardcoded counts cleared
export const PHP_EXAM_COUNTS: Record<string, number> = {};

export function getPhpCalibratedExamCount(
  _subjectName: string,
  _courseName?: string
): number | null {
  return null;
}
