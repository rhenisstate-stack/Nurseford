/**
 * Fallback PHP counts, titles, and aliases have been completely purged so live backend data is never overridden.
 */

export const PHP_COURSE_NAMES: Record<string, string> = {};

export const PHP_EXAM_COUNTS: Record<string, number> = {};

export function getPhpCalibratedExamCount(
  _subjectName: string,
  _courseName?: string
): number | null {
  return null;
}
