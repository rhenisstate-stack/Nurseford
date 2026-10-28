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

type ResultsListData = {
  results?: StrataExamResultItem[];
  Results?: StrataExamResultItem[];
  items?: StrataExamResultItem[];
  Items?: StrataExamResultItem[];
  totalResults?: number;
  TotalResults?: number;
  skewTotal?: number;
  total?: number;
  totalPages?: number;
  TotalPages?: number;
  skewTotalPages?: number;
};

// Returns the payload whether the service wrapped it in `data` or not
const getResultsData = (res: unknown): ResultsListData | StrataExamResultItem[] => {
  const r = res as { data?: ResultsListData | StrataExamResultItem[] } | null | undefined;
  return r?.data ?? (r as ResultsListData | null) ?? {};
};

export const useRelativeStrataAssessmentResults = ({
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  page?: number | string;
  perPage?: number | string;
  sortColumn?: keyof StrataExamResultItem | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [examresults, setExams] = useState<StrataExamResultItem[]>([]);
  const [filteredExamResults, setFilteredExams] = useState<StrataExamResultItem[]>([]);
  const [examResultSearch, setExamResultSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const FETCH_TYPE = 'RelativeFetch';

  const refetch = () => setRefreshKey((prev) => prev + 1);

  const cleanPage =
    typeof page === "number" && !isNaN(page)
      ? page
      : parseInt(String(page) || "1", 10) || 1;
  const cleanPerPage =
    typeof perPage === "number" && !isNaN(perPage)
      ? perPage
      : parseInt(String(perPage) || "20", 10) || 20;

  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        console.log("🚀 [useRelativeStrataAssessmentResults] Fetching Exams ... 🪝");
        console.log("🧪 [Hook Params]", {
          examResultSearch,
          page: cleanPage,
          perPage: cleanPerPage,
          sortColumn,
          sortDirection,
        });

        const result = await assessmentService<
          | {
              exam?: StrataExamResultItem;
              examDetail?: unknown;
              sections?: unknown[];
              totalResults?: number;
              currentPage?: number;
              perPage?: number;
              totalPages?: number;
              results?: StrataExamResultItem[];
              items?: StrataExamResultItem[];
            }
          | StrataExamResultItem[]
        >(
          "Result",
          FETCH_TYPE,
          {
            dynamicPage: cleanPage,
            dynamicPerPage: cleanPerPage,
            dynamicSearch: examResultSearch || "",
            dynamicSortColumn: sortColumn,
            dynamicSortDirection: sortDirection,
          }
        );

        console.log("📥 Raw result:", result);
        console.log("📦 result.data:", result?.data);

        if (result?.error && !result?.data) {
          throw new Error(result.error);
        }

             const rawData = getResultsData(result);
        const dataObj: ResultsListData = Array.isArray(rawData) ? {} : rawData;
        const topLevel = (result ?? {}) as unknown as ResultsListData;

        const items: StrataExamResultItem[] = Array.isArray(rawData)
          ? rawData
          : [
              dataObj.results,
              dataObj.Results,
              dataObj.items,
              dataObj.Items,
              topLevel.results,
              topLevel.items,
            ].find((candidate): candidate is StrataExamResultItem[] => Array.isArray(candidate)) ?? [];

        const totalItems =
          dataObj.totalResults ??
          dataObj.TotalResults ??
          dataObj.skewTotal ??
          dataObj.total ??
          topLevel.totalResults ??
          items.length;

        const totalPages =
          dataObj.totalPages ??
          dataObj.TotalPages ??
          dataObj.skewTotalPages ??
          1;

        setExams(items);
        setFilteredExams(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useRelativeStrataAssessmentResults] Failed to fetch Exams:",
          err
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [examResultSearch, cleanPage, cleanPerPage, sortColumn, sortDirection, refreshKey]);

  // Pass Exams when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredExams(examresults);
  }, [examresults]);

  return {
    examresults,
    skewTotal,
    skewTotalPages,
    filteredExamResults,
    examResultSearch,
    setExamResultSearch,
    isLoading,
    refetch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────