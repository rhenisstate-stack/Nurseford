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

  // Per-User Result ───────────────────────────────────────────────────────
  userId?: number;
  examId?: number;
  examGuidId?: string;
  userName?: string; // used only for masked display in comparisons

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
export interface StrataUserResultGroup {
  userId: number;
  userGuidId?: string;
  userName?: string;
  email?: string;
  results: StrataExamResultItem[];
}

export interface StrataUserExamResultResponse {
  users: StrataUserResultGroup[];
  totalUsers: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

export const useAbsoluteStrataAssessmentResults = ({
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  page?: number;
  perPage?: number;
  sortColumn?: keyof StrataExamResultItem | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [examresults, setExams] = useState<StrataExamResultItem[]>([]);
  const [filteredExamResults, setFilteredExams] = useState<StrataExamResultItem[]>([]);
  const [examResultSearch, setExamResultSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchExams = async () => {
      try {
        console.log("🚀 [useAbsoluteStrataAssessmentResults] Fetching Exams ... 🪝");
        console.log("🧪 [Hook Params]", {
          examResultSearch,
          page,
          perPage,
          sortColumn,
          sortDirection,
        });

        const result = await assessmentService<{
          users: StrataUserResultGroup[];
          totalUsers: number;
          currentPage: number;
          perPage: number;
          totalPages: number;
        }>(
          "Result",
          FETCH_TYPE,
          {
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

        const userGroups = result?.data?.users ?? [];
        const totalUsers = result?.data?.totalUsers ?? 0;
        const totalPages = result?.data?.totalPages ?? 1;

        // Flatten every user's results into a single array so the page can
        // separate "my attempts" from "everyone else's" locally, without a
        // second request. Each row already carries its own userId.
        const flattened: StrataExamResultItem[] = userGroups.flatMap((u) =>
          (u.results ?? []).map((r) => ({
            ...r,
            userId: r.userId ?? u.userId,
            // Carried purely so the UI can render a masked/blurred label in the
            // comparison table — real name/email are never shown unmasked.
            userName: u.userName,
          }))
        );

        setExams(flattened);
        setFilteredExams(flattened);
        setSkewTotal(totalUsers);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useAbsoluteStrataAssessmentResults] Failed to fetch Exams:",
          err
        );
      }
    };

    fetchExams();
  }, [examResultSearch, page, perPage, sortColumn, sortDirection]);

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
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────