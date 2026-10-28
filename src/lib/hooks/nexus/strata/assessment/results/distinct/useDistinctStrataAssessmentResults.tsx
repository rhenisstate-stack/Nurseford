'use client';

import { useEffect, useState } from "react";
import { assessmentService } from "@/lib/services/nexus/strata/assessmentService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────
// EXAM RESULTS + PER-USER 
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
  examGuidId?: string;
  
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
  examDetail?: StrataExamDetail | null;

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

export const useDistinctStrataAssessmentResults = ({
  parentIdentifier,   //  PARENT STRATA IDENTIFIER
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  parentIdentifier: string;   //  PARENT STRATA IDENTIFIER - REQUIRED.
  page?: number;
  perPage?: number;
  sortColumn?: keyof StrataExamResultItem | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [examResults, setExams] = useState<StrataExamResultItem[]>([]);
  const [filteredExamResults, setFilteredExams] = useState<StrataExamResultItem[]>([]);
  const [examResultSearch, setExamResultSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'DistinctFetch';

  useEffect(() => {
    const fetchExams = async () => {
      try {
        console.log("🚀 [useDistinctStrataAssessmentResults] Fetching Exams . . . 🪝");
        console.log("🧪 [Hook Params]", {
          examResultSearch,
          page,
          perPage,
          sortColumn,
          sortDirection,
        });

        const result = await assessmentService<{
          items: StrataExamResultItem[];
          skewPage: number;
          skewPerPage: number;
          skewTotal: number;
          skewTotalPages: number;
          skewSearch?: string | null;
          skewSort?: string | null;
          skewColumnSort?: string | null;
        }>(
          "Result",
          FETCH_TYPE,
          {
            identifier: parentIdentifier,  // PARENT STRATA IDENTIFIER PASSED TO BACKEND AS "identifier" PARAMETER
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: examResultSearch || "",
            dynamicSortColumn: sortColumn,
            dynamicSortDirection: sortDirection,
          }
        );

        console.log("📥 Raw result:", result);
        console.log("📦 result.data:", result?.data);

        if (result?.error) {
          throw new Error(result.error);
        }

        const items = result?.data?.items ?? [];
        const totalItems = result?.data?.skewTotal ?? 0;
        const totalPages = result?.data?.skewTotalPages ?? 1;

        setExams(items);
        setFilteredExams(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useDistinctStrataAssessmentResults] Failed to fetch Exams:",
          err
        );
      }
    };

    fetchExams();
  }, [parentIdentifier, examResultSearch, page, perPage, sortColumn, sortDirection]);

  // Pass Exams when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredExams(examResults);
  }, [examResults]);

  return {
    examResults,
    skewTotal,
    skewTotalPages,
    filteredExamResults,
    examResultSearch,
    setExamResultSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
