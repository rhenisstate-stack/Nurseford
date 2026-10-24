// src\lib\hooks\dashboards\strata\assessment\learning\exams\live\useLiveStrataExams.tsx
'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";


// ═══════════════════════════════════════════════════════════════════════════════
// FULL SESSION RESPONSE (DynamicStrataSessionExamResponseDto)
// ═══════════════════════════════════════════════════════════════════════════════
export interface StrataExamSessionResponse {
  exam: StrataSessionExam;
  design?: StrataSessionExamDesign;
  modes: StrataSessionExamMode[];
  examActions: StrataSessionExamAction[];
  sections: StrataSessionSection[];
  resumeAnswers: Record<string | number, StrataSessionUserAnswer>; // keyed by questionId or questionGuidId
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT + MODE SELECTION STATE
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionSelection {
  selectedLayout: string;
  selectedMode: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM DESIGN
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionExamDesign {
  id: number;
  guidId: string;
  defaultLayout: string;
  allowLayoutSwitching: boolean;
  allowModeSwitching: boolean;
  description?: string;
  instructions?: string;
  orientation: string;
  reviewable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM MODE + RULES
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionExamModeRule {
  id: number;
  guidId: string;
  key: string;
  category: string;
  value: string;
  valueType: string;
  isEnabled: boolean;
  description?: string;
  instructions?: string;
}

export interface StrataSessionExamMode {
  id: number;
  guidId: string;
  mode: string;        // Enum label e.g. "Practice"
  modeValue: number;   // Enum int
  isEnabled: boolean;
  description?: string;
  instructions?: string;
  rules: StrataSessionExamModeRule[];
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM ACTION
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionExamAction {
  id: number;
  guidId: string;
  userId: number;
  actionType: string;
  actionValue: string;
  actionContent: string;
  residualDuration?: number;
  attemptCount?: number;
  isAttempted?: boolean;
  status?: string;
  description?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION PARTIALS
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionQuestionOption {
  id: number;
  guidId: string;
  answerContent: string;
  description?: string;
  option: string;
  group?: number;
  data?: string;
  link?: string;
  label?: string;
  order?: string;
  explanation?: string;
}

export interface StrataSessionQuestionContent {
  id: number;
  guidId: string;
  title: string;
  description: string;
  link?: string;
  prerequisites?: string;
  instructions?: string;
  isFeatured: boolean;
}

export interface StrataSessionQuestionMedia {
  id: number;
  guidId: string;
  type: string;
  mediaPath: string;
  thumbnailPath?: string;
  description?: string;
  instructions?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  isPrimary: boolean;
}

export interface StrataSessionQuestionMatrixCell {
  id: number;
  guidId: string;
  rowIndex: number;
  columnIndex: number;
  cellValue?: string;
  isCorrect: boolean;
  scoreWeight?: number;
  explanation?: string;
  isLocked: boolean;
}

export interface StrataSessionQuestionMatrix {
  id: number;
  guidId: string;
  title?: string;
  description?: string;
  topLeftCell?: string;
  rowCount: number;
  columnCount: number;
  rowHeaders: string;       // JSON string "[]"
  columnHeaders: string;    // JSON string "[]"
  responseType: string;     // "singleChoice" | "multipleChoice"
  isRequired: boolean;
  instructions?: string;
  allowPartialCredit: boolean;
  randomizeRows: boolean;
  randomizeColumns: boolean;
  cells: StrataSessionQuestionMatrixCell[];
}

export interface StrataSessionCorrectAnswer {
  id: number;
  guidId: string;
  questionId: number;
  questionOptionId?: number;
  questionContentId?: number;
  questionMatrixCellId?: number;
  questionMediaId?: number;
  correctOrder?: string;
  correctHotspot?: string;
  correctHighlight?: string;
  isCorrect: boolean;
  description?: string;
  hint?: string;
  explanationImage?: string;
  openEndedAnswer?: string;
  caseSensitive: boolean;
  scoreWeight?: number;
  allowPartialCredit: boolean;
  validationRules?: string;
}

export interface StrataSessionQuestionAction {
  id: number;
  guidId: string;
  userId: number;
  actionValue: string;
  actionContent: string;
  status?: string;
  description?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ANSWER (Resume Support)
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionUserAnswer {
  id: number;
  guidId: string;
  userId: number;
  examId: number;
  questionId: number;
  attemptNumber?: number;
  questionOptionId?: number;
  questionContentId?: number;
  questionMatrixCellId?: number;
  questionMediaId?: number;
  userAnswerData?: string;
  userOrder?: string;
  userHotspot?: string;
  userHighlight?: string;
  description?: string;
  openEndedAnswer?: string;
  caseSensitive: boolean;
  scoreWeight?: number;
  allowPartialCredit: boolean;
  validationRules?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION FULL
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionQuestionFull {
  id: number;
  guidId: string;
  questionText: string;
  metaQuestionText?: string;
  description?: string;
  target: string;
  type?: string;
  accessType?: string;
  accessGroup?: string;
  accessValue?: number;
  code?: string;
  status?: string;
  segment?: string;
  fragment?: string;
  link?: string;
  weight?: number;
  rating?: number;
  level?: string;
  difficulty?: string;
  year?: number;
  resources?: string;
  prerequisites?: string;
  instructions?: string;
  isFeatured: boolean;

  // Partials
  questionOptions: StrataSessionQuestionOption[];
  questionContents: StrataSessionQuestionContent[];
  questionMedias: StrataSessionQuestionMedia[];
  questionMatrices: StrataSessionQuestionMatrix[];
  questionCorrectAnswers: StrataSessionCorrectAnswer[];
  questionActions: StrataSessionQuestionAction[];

  // Resume
  savedUserAnswer?: StrataSessionUserAnswer;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionSection {
  id: number;
  guidId: string;
  name: string;
  description?: string;
  status?: string;
  questions: StrataSessionQuestionFull[];
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM CORE (DynamicStrataSessionExamDto)
// ─────────────────────────────────────────────────────────────────────────────
export interface StrataSessionExam {
  // Operation state
  success: boolean;
  message: string;

  // Identifiers
  id?: number;
  guidId?: string;

  // Assessment Parent (always present)
  assessmentId: number;
  assessmentGuidId: string;
  assessmentName: string;

  // Learning Hierarchy (optional — populated by depth)
  programId?: number;
  programGuidId?: string;
  programName?: string;

  courseId?: number;
  courseGuidId?: string;
  courseName?: string;

  subjectId?: number;
  subjectGuidId?: string;
  subjectName?: string;

  unitId?: number;
  unitGuidId?: string;
  unitName?: string;

  lessonId?: number;
  lessonGuidId?: string;
  lessonName?: string;

  topicId?: number;
  topicGuidId?: string;
  topicName?: string;

  conceptId?: number;
  conceptGuidId?: string;
  conceptName?: string;

  factId?: number;
  factGuidId?: string;
  factName?: string;

  // Counts + UX defaults
  sectionsCount: number;
  questionsCount: number;
  selectedLayout: string;
  selectedMode: string;

  // Core Fields
  title?: string;
  description?: string;
  target?: string;
  type?: string;
  accessType?: string;
  code?: string;
  status?: string;
  segment?: string;
  fragment?: string;
  link?: string;
  rating?: number;
  version?: string;
  tag?: string;
  series?: string;
  level?: string;
  difficulty?: string;
  order?: string;
  season?: string;
  duration?: number;
  module?: string;
  year?: number;

  passMark?: number;
  totalMarks?: number;
  attemptsAllowed?: number;
  validFrom?: string;
  validUntil?: string;

  resources?: string;
  prerequisites?: string;
  objectives?: string;
  instructions?: string;

  // Details table fields
  publishedAt?: string;
  hasCertificate?: boolean;
  price?: number;
  discount?: number;
  isFree?: boolean;
  currency?: string;
  waitlistEnabled?: boolean;

  // Metadata
  isFeatured?: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  shuffleQuestions: boolean;
  isTimed: boolean;
  timeLimitPerQuestion?: number;
  scoringType?: string;

  // UX Helpers
  redirectUrl?: string;
  notificationType?: string;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}



// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export const useLiveStrataExam = ({
  examIdentifier,
  page = 1,
  perPage = 500,
  sortColumn = null,
  sortDirection = "asc",
  selectedLayout = null,
  selectedMode = null,
  targetAttemptNumber = null,
}: {
  examIdentifier: string;

  page?: number;
  perPage?: number;

  sortColumn?: keyof StrataExamSessionResponse | null;

  sortDirection?: "asc" | "desc";

  selectedLayout?: string | null;

  selectedMode?: string | null;

  targetAttemptNumber?: number | null;
}) => {

  // ─────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────

  const [examSession, setExamSession] =
    useState<StrataExamSessionResponse | null>(null);

  const [examSearch, setExamSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [skewTotal, setSkewTotal] =
    useState<number>(0);

  const [skewTotalPages, setSkewTotalPages] =
    useState<number>(1);

  const FETCH_TYPE = "LiveFetch";

  // ─────────────────────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {

    if (!examIdentifier) return;

    const fetchExam = async () => {

      try {

        setLoading(true);
        setError(null);
        setExamSession(null);

        // console.log(
        //   "🚀 [useLiveStrataExam] Fetching Live Exam . . . ⚓"
        // );

        // console.log("🧪 Params:", {
        //   examIdentifier,
        //   page,
        //   perPage,
        //   sortColumn,
        //   sortDirection,
        //   selectedLayout,
        //   selectedMode,
        // });

        // IMPORTANT:
        // BACKEND EXPECTS:
        // dynamicExamLayout
        // dynamicExamMode

        const result = await strataService<StrataExamSessionResponse>(
          "Exam",
          FETCH_TYPE,
          {
            identifier: examIdentifier,
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: examSearch || "",
            dynamicSortColumn: sortColumn,
            dynamicSortDirection: sortDirection,
            dynamicExamLayout: selectedLayout,
            dynamicExamMode: selectedMode,
            ...(targetAttemptNumber !== null && targetAttemptNumber !== undefined
              ? { dynamicAttemptNumber: targetAttemptNumber }
              : {}),
          }
        );

        console.log("📥 RAW RESULT 📌:", result);

        if (result?.error) {
          throw new Error(result.error);
        }

        // Depending on your API wrapper:
        // result.data OR result.data.data

        const session = result?.data ?? null;
        console.log("🧠 FINAL SESSION ⚓:", session);
        setExamSession(session);

        // Fallback counts
        setSkewTotal(session?.exam?.questionsCount ?? 0);
        setSkewTotalPages(1);

      } catch (err: unknown) {

        console.error(
          "❌ Failed to fetch live exam:",
          err
        );

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown Error");
        }

      } finally {

        setLoading(false);

      }

    };

    fetchExam();

  }, [
    examIdentifier,
    examSearch,
    page,
    perPage,
    sortColumn,
    sortDirection,
    selectedLayout,
    selectedMode,
    targetAttemptNumber
  ]);

  // ─────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────

  return {
    examSession,
    loading,
    error,
    examSearch,
    setExamSearch,
    skewTotal,
    skewTotalPages,
    selectedLayout,
    selectedMode,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
