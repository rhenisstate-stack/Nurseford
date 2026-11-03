/**
 * Course ID aliases for backward-compatible routing.
 * Fallback PHP counts and titles have been completely purged so live backend data is never overridden.
 */

export const COURSE_ID_ALIASES: Record<string, string> = {
  // Legacy frontend alias IDs (> 39) -> Real Backend .NET Course IDs (Program 9)
  "40": "34", // Legacy alias -> Backend 34 (ATI Exams)
  "41": "36", // Legacy alias -> Backend 36 (EXIT ATI)
  "42": "37", // Legacy alias -> Backend 37 (EXIT HESI)
  "43": "35", // Legacy alias -> Backend 35 (EXAMPLIFY Practice)
  "44": "38", // Legacy alias -> Backend 38 (GENERAL Exams)
};

export const PHP_COURSE_NAMES: Record<string, string> = {};

export const PHP_EXAM_COUNTS: Record<string, number> = {};

export function getPhpCalibratedExamCount(
  _subjectName: string,
  _courseName?: string
): number | null {
  return null;
}
