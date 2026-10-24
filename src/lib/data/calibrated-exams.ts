/**
 * Manual calibration definitions for subjects and exams.
 * Kept for interface compatibility; all calibrations purged so live backend data is never overridden.
 */

export interface CalibratedExamRule {
  match: string | RegExp;
  title: string;
  questionsCount: number;
  season?: string | null;
  year?: number;
  accessType?: "Free" | "Restricted";
  modes?: ("Practice" | "Review" | "Exam")[];
}

export interface SubjectCalibration {
  subjectKey: string;
  subjectIds?: (string | number)[];
  subjectName?: string;
  hideDuration?: boolean;
  hideSeason?: boolean;
  showCustomTestButton?: boolean;
  exams: CalibratedExamRule[];
}

export const SUBJECT_CALIBRATIONS: SubjectCalibration[] = [];

export function findSubjectCalibration(
  _subjectNameOrKey: string,
  _subjectId?: string | number
): SubjectCalibration | undefined {
  return undefined;
}

export interface CalibratableExam {
  id?: number | string;
  guidId?: string;
  title?: string;
  year?: number;
  season?: string | null;
  accessType?: string;
  modes?: string[];
  questionsCount?: number;
}

export function calibrateSubjectExams<T extends CalibratableExam>(
  _subjectNameOrKey: string,
  rawExams: T[],
  _subjectId?: string | number
): T[] {
  return rawExams || [];
}
