'use client';

import { useEffect, useState } from "react";
import { assessmentService } from "@/lib/services/nexus/strata/assessmentService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────
// EXAM + PER-USER RESULT (mirrors DynamicStrataExamResultDto)
// ───────────────────────────────────────────────────────────────────────────────────────────────────────
export interface StrataExamResultItem {
  id: number;
  guidId: string;

  // ── Exam Core ─────────────────────────────────────────────────────────────
  title?: string;
  description?: string;
  type?: string;
  accessType?: string;
  code?: string;
  status?: string;
  series?: string;
  segment?: string;
  level?: string;
  difficulty?: string;
  duration?: number;
  year?: number;
  passMark?: number;
  totalMarks?: number;
  attemptsAllowed?: number;
  rating?: number;
  version?: string;
  validFrom?: string;
  validUntil?: string;

  // ── Hierarchy ─────────────────────────────────────────────────────────────
  assessmentId?: number;
  assessmentGuidId?: string;
  assessmentName?: string;

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

  sectionsCount?: number;
  questionsCount?: number;

  // ── Per-User Result ───────────────────────────────────────────────────────
  userId?: number;
  examId?: number;

  attemptNumber?: number;
  isAttempted?: boolean;
  attemptedAt?: string;

  score?: number;
  percentageScore?: number;
  grade?: string;
  passed?: boolean;

  timeTaken?: number;
  reviewedAt?: string;

  totalAnswered?: number;
  totalCorrect?: number;
  totalWrong?: number;

  answers?: StrataResultAnswer[];
  wrongQuestionRefs?: StrataResultWrongQuestion[];

  createdAt?: string;
  updatedAt?: string;
}

export interface StrataExamDetail {
  publishedAt?: string;
  showResultsImmediately?: boolean;
  allowReview?: boolean;
  shuffleQuestions?: boolean;
  isTimed?: boolean;
  timeLimitPerQuestion?: number;
  hasCertificate?: boolean;
  price?: number;
  discount?: number;
  isFree?: boolean;
  currency?: string;
  scoringType?: string;
  instructions?: string;
  resources?: string;
  prerequisites?: string;
  objectives?: string;
  isFeatured?: boolean;
}

export interface StrataResultSection {
  id: number;
  guidId: string;
  name?: string;
  description?: string;
  status?: string;
  totalQuestions?: number;
}

export interface StrataResultAnswer {
  id: number;
  guidId: string;

  userId?: number;
  examId?: number;
  sectionId?: number;
  questionId?: number;
  attemptNumber?: number;

  userAnswerData?: string;
  description?: string;
  isCorrect?: boolean;
  caseSensitive?: boolean;
  scoreWeight?: number;
  allowPartialCredit?: boolean;
  validationRules?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface StrataResultWrongQuestion {
  questionId: number;
  questionGuidId: string;
  questionText?: string;

  sectionId?: number;
  sectionGuidId?: string;
  sectionName?: string;

  userAnswerData?: string;
  scoreWeight?: number;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────
// ROOT RESPONSE (mirrors DynamicStrataUserExamResultResponseDto)
// ───────────────────────────────────────────────────────────────────────────────────────────────────────
export interface StrataUserExamResultResponse {
  exam: StrataExamResultItem;
  examDetail?: StrataExamDetail | null;
  sections: StrataResultSection[];

  totalResults: number;
  currentPage: number;
  perPage: number;
  totalPages: number;

  results: StrataExamResultItem[];
}

export const useCurrentStrataAssessmentResult = (identifier: string | null) => {

  const [exam, setExam] = useState<StrataExamResultItem | null>(null);
  const [examDetail, setExamDetail] = useState<StrataExamDetail | null>(null);
  const [sections, setSections] = useState<StrataResultSection[]>([]);
  const [results, setResults] = useState<StrataExamResultItem[]>([]);

  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const FETCH_TYPE = 'CurrentFetch';

  useEffect(() => {
    if (!identifier) {
      setError("No identifier Provided ⚓");
      return;
    }

    const fetchExam = async () => {
      try {
        const result = await assessmentService<StrataUserExamResultResponse>(
          "Result",
          FETCH_TYPE,
          { identifier }
        );

        if (result?.error) {
          throw new Error(result.error);
        }

        const data = result?.data ?? null;

        setExam(data?.exam ?? null);
        setExamDetail(data?.examDetail ?? null);
        setSections(data?.sections ?? []);
        setResults(data?.results ?? []);

        setTotalResults(data?.totalResults ?? 0);
        setCurrentPage(data?.currentPage ?? 0);
        setPerPage(data?.perPage ?? 0);
        setTotalPages(data?.totalPages ?? 0);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    fetchExam();
  }, [identifier]);

  return {
    exam,
    examDetail,
    sections,
    results,
    totalResults,
    currentPage,
    perPage,
    totalPages,
    error,
  };

};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────