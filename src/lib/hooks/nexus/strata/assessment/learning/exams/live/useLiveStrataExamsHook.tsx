// src\lib\hooks\dashboards\strata\assessment\learning\exams\live\useLiveStrataExams.tsx
'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";


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
// PROPORTIONAL ALLOCATION & SAMPLING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Proportionally distributes a target total among N items with given pool sizes,
 * ensuring each item gets at least 1 (if targetTotal >= pools.length) and never exceeds its pool size.
 * Uses the Largest Remainder Method (Hamilton method) to guarantee the sum equals targetTotal.
 */
function allocateProportionally(
  pools: { id: string; size: number }[],
  targetTotal: number
): Record<string, number> {
  const result: Record<string, number> = {};
  if (pools.length === 0 || targetTotal <= 0) return result;

  const totalSize = pools.reduce((sum, p) => sum + p.size, 0);
  if (targetTotal >= totalSize) {
    for (const p of pools) {
      result[p.id] = p.size;
    }
    return result;
  }

  // Calculate float quotas
  const quotas = pools.map((p) => {
    const raw = (targetTotal * p.size) / totalSize;
    const base = targetTotal >= pools.length ? Math.min(p.size, Math.max(1, Math.floor(raw))) : Math.min(p.size, Math.floor(raw));
    const remainder = raw - Math.floor(raw);
    return {
      id: p.id,
      size: p.size,
      allocated: base,
      remainder,
    };
  });

  let currentSum = quotas.reduce((sum, q) => sum + q.allocated, 0);

  // If base allocations sum is greater than targetTotal:
  if (currentSum > targetTotal) {
    quotas.sort((a, b) => b.allocated - a.allocated);
    for (const q of quotas) {
      while (q.allocated > 1 && currentSum > targetTotal) {
        q.allocated -= 1;
        currentSum -= 1;
      }
      if (currentSum === targetTotal) break;
    }
    if (currentSum > targetTotal) {
      for (const q of quotas) {
        while (q.allocated > 0 && currentSum > targetTotal) {
          q.allocated -= 1;
          currentSum -= 1;
        }
        if (currentSum === targetTotal) break;
      }
    }
  } else if (currentSum < targetTotal) {
    // Distribute remaining based on largest remainder
    quotas.sort((a, b) => b.remainder - a.remainder);
    let needed = targetTotal - currentSum;
    let progress = true;
    while (needed > 0 && progress) {
      progress = false;
      for (const q of quotas) {
        if (needed <= 0) break;
        if (q.allocated < q.size) {
          q.allocated += 1;
          needed -= 1;
          progress = true;
        }
      }
    }
  }

  for (const q of quotas) {
    result[q.id] = q.allocated;
  }
  return result;
}

function sampleRandomItems<T>(items: T[], count: number): T[] {
  if (count <= 0) return [];
  if (count >= items.length) return [...items];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy.slice(0, count);
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
  builderMode = null,
  questionCount = null,
  examCount = null,
  subCategories = null,
  customTitle = null,
}: {
  examIdentifier: string;

  page?: number;
  perPage?: number;

  sortColumn?: keyof StrataExamSessionResponse | null;

  sortDirection?: "asc" | "desc";

  selectedLayout?: string | null;

  selectedMode?: string | null;

  targetAttemptNumber?: number | null;
  builderMode?: "questions" | "exams" | null;
  questionCount?: number | null;
  examCount?: number | null;
  subCategories?: string | null;
  customTitle?: string | null;
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
    if (!examIdentifier && !subCategories) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);
        setExamSession(null);

        // ─────────────────────────────────────────────────────────────
        // 1. BUILDER MODE: EXAMS (Subject-Level Custom Exam Builder)
        // ─────────────────────────────────────────────────────────────
        if (builderMode === "exams") {
          const subjectIds = (subCategories || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          if (subjectIds.length === 0) {
            throw new Error("No subjects selected for custom exam");
          }

          // Fetch nominal exams for each selected subject in parallel
          const subjectExamsList = await Promise.all(
            subjectIds.map(async (subjId) => {
              try {
                const res = await strataService<{ items?: StrataItem[] }>(
                  "Exam",
                  "NominalFetch",
                  {
                    identifier: subjId,
                    dynamicLearningStrataName: "subject",
                    dynamicPage: 1,
                    dynamicPerPage: 100,
                    dynamicSortColumn: "id",
                    dynamicSortDirection: "desc",
                  }
                );
                const rawData = (res?.data || res) as { items?: StrataItem[]; Items?: StrataItem[] } | undefined;
                const items = rawData?.items || rawData?.Items || (Array.isArray(rawData) ? (rawData as unknown as StrataItem[]) : []);
                return {
                  subjectId: subjId,
                  exams: items.map((e) => ({
                    id: String(e.guidId || e.id),
                    title: e.title || "Exam",
                    questionsCount: e.questionsCount || 45,
                  })),
                };
              } catch (err) {
                console.warn(`[useLiveStrataExam] Failed to fetch exams for subject ${subjId}:`, err);
                return { subjectId: subjId, exams: [] };
              }
            })
          );

          const totalAvailableExams = subjectExamsList.reduce((sum, s) => sum + s.exams.length, 0);
          if (totalAvailableExams === 0) {
            throw new Error("No exams available in the selected subjects");
          }

          const targetExamCount = examCount && examCount > 0
            ? Math.min(examCount, totalAvailableExams)
            : Math.min(3, totalAvailableExams);

          // Proportionally allocate targetExamCount across subjects
          const poolInputs = subjectExamsList.map((s) => ({
            id: s.subjectId,
            size: s.exams.length,
          }));
          const allocations = allocateProportionally(poolInputs, targetExamCount);

          // Pick allocated exams randomly from each subject
          const chosenExamIds: { id: string; subjectId: string }[] = [];
          for (const s of subjectExamsList) {
            const countForSubject = allocations[s.subjectId] || 0;
            if (countForSubject > 0) {
              const sampled = sampleRandomItems(s.exams, countForSubject);
              for (const e of sampled) {
                chosenExamIds.push({ id: e.id, subjectId: s.subjectId });
              }
            }
          }

          if (chosenExamIds.length === 0) {
            throw new Error("No exams could be selected from chosen subjects");
          }

          // Fetch live session for each chosen exam in parallel
          const liveSessions = await Promise.all(
            chosenExamIds.map(async ({ id }) => {
              try {
                const res = await strataService<StrataExamSessionResponse>(
                  "Exam",
                  FETCH_TYPE,
                  {
                    identifier: id,
                    dynamicExamLayout: selectedLayout,
                    dynamicExamMode: selectedMode,
                    dynamicPage: 1,
                    dynamicPerPage: 500,
                  }
                );
                const session = res?.data?.exam ? res.data : (res as unknown as StrataExamSessionResponse)?.exam ? (res as unknown as StrataExamSessionResponse) : null;
                return session;
              } catch (e) {
                console.warn(`[useLiveStrataExam] Failed to fetch live exam ${id}:`, e);
                return null;
              }
            })
          );

          const validSessions = liveSessions.filter(
            (s): s is StrataExamSessionResponse => s !== null && s.exam !== undefined
          );

          if (validSessions.length === 0) {
            throw new Error("Failed to load custom exams");
          }

          const firstSession = validSessions[0];

          // Build sections: each exam is a section with its FULL questions
          const sections: StrataSessionSection[] = validSessions.map((session, idx) => {
            const allQ = (session.sections ?? []).flatMap((sec) => sec.questions ?? []);
            return {
              id: session.exam.id || idx + 1,
              guidId: session.exam.guidId || String(idx + 1),
              name: session.exam.title || `Exam Section ${idx + 1}`,
              description: session.exam.description,
              questions: allQ,
            };
          });

          const totalQuestions = sections.reduce((sum, sec) => sum + sec.questions.length, 0);

          const combinedSession: StrataExamSessionResponse = {
            ...firstSession,
            exam: {
              ...firstSession.exam,
              title: customTitle || (validSessions.length <= 3 ? `Custom Exam: ${validSessions.map((s) => s.exam.title).join(" & ")}` : "Custom Exam"),
              questionsCount: totalQuestions,
              sectionsCount: sections.length,
              selectedLayout: selectedLayout || firstSession.exam.selectedLayout || "Generic",
              selectedMode: selectedMode || firstSession.exam.selectedMode || "Practice",
            },
            sections,
          };

          setExamSession(combinedSession);
          setSkewTotal(totalQuestions);
          setSkewTotalPages(1);
          return;
        }

        // ─────────────────────────────────────────────────────────────
        // 2. BUILDER MODE: QUESTIONS (Exam-Level Custom Exam Builder)
        // ─────────────────────────────────────────────────────────────
        const examIds = (subCategories || examIdentifier || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (builderMode === "questions" || (examIds.length > 1 && !builderMode)) {
          // Fetch all exams in parallel with resilient subject-to-exam fallback
          const liveSessions = await Promise.all(
            examIds.map(async (id) => {
              try {
                const res = await strataService<StrataExamSessionResponse>(
                  "Exam",
                  FETCH_TYPE,
                  {
                    identifier: id,
                    dynamicExamLayout: selectedLayout,
                    dynamicExamMode: selectedMode,
                    dynamicPage: 1,
                    dynamicPerPage: 500,
                  }
                );
                if (res?.data?.exam) return res.data;
                if ((res as unknown as StrataExamSessionResponse)?.exam) {
                  return res as unknown as StrataExamSessionResponse;
                }
                if (res?.error) {
                  console.warn(`[useLiveStrataExam] Live exam fetch error for ${id}:`, res.error);
                }
              } catch (e) {
                console.warn(`[useLiveStrataExam] Failed to fetch live exam ${id}:`, e);
              }

              // Fallback: If identifier is a subject ID/GUID instead of an exam ID, resolve nominal exams under it
              try {
                const nomRes = await strataService<{ items?: StrataItem[] }>(
                  "Exam",
                  "NominalFetch",
                  {
                    identifier: id,
                    dynamicLearningStrataName: "subject",
                    dynamicPage: 1,
                    dynamicPerPage: 10,
                  }
                );
                const rawItems = (nomRes?.data as { items?: StrataItem[] })?.items || (nomRes as unknown as { items?: StrataItem[] })?.items || [];
                if (rawItems.length > 0) {
                  const fallbackExamId = String(rawItems[0].guidId || rawItems[0].id);
                  const retryRes = await strataService<StrataExamSessionResponse>(
                    "Exam",
                    FETCH_TYPE,
                    {
                      identifier: fallbackExamId,
                      dynamicExamLayout: selectedLayout,
                      dynamicExamMode: selectedMode,
                      dynamicPage: 1,
                      dynamicPerPage: 500,
                    }
                  );
                  if (retryRes?.data?.exam) return retryRes.data;
                  if ((retryRes as unknown as StrataExamSessionResponse)?.exam) {
                    return retryRes as unknown as StrataExamSessionResponse;
                  }
                }
              } catch (fallbackErr) {
                console.warn(`[useLiveStrataExam] Nominal fallback failed for ${id}:`, fallbackErr);
              }

              return null;
            })
          );

          const validSessions = liveSessions.filter(
            (s): s is StrataExamSessionResponse => s !== null && s.exam !== undefined
          );

          if (validSessions.length === 0) {
            throw new Error("Failed to load selected exams");
          }

          const firstSession = validSessions[0];

          // Collect question pools for each exam
          const examPools = validSessions.map((session, idx) => {
            const allQ = (session.sections ?? []).flatMap((sec) => sec.questions ?? []);
            return {
              id: session.exam.guidId || String(session.exam.id || idx + 1),
              title: session.exam.title || `Section ${idx + 1}`,
              session,
              questions: allQ,
              size: allQ.length,
            };
          });

          const totalAvailableQuestions = examPools.reduce((sum, p) => sum + p.size, 0);
          const targetQuestions = questionCount && questionCount > 0
            ? Math.min(questionCount, totalAvailableQuestions)
            : totalAvailableQuestions;

          // Proportionally allocate targetQuestions across the exams
          const poolInputs = examPools.map((p) => ({ id: p.id, size: p.size }));
          const allocations = allocateProportionally(poolInputs, targetQuestions);

          // Build sections: each exam's sampled questions remain grouped in its section
          const sections: StrataSessionSection[] = examPools.map((p, idx) => {
            const alloc = allocations[p.id] || 0;
            const sampled = sampleRandomItems(p.questions, alloc);
            return {
              id: p.session.exam.id || idx + 1,
              guidId: p.session.exam.guidId || String(idx + 1),
              name: p.title,
              description: p.session.exam.description,
              questions: sampled,
            };
          });

          const totalSampled = sections.reduce((sum, sec) => sum + sec.questions.length, 0);

          const resolvedExamTitle = customTitle || (
            examPools.length <= 3
              ? `Custom Exam: ${examPools.map((p) => p.title).join(" & ")}`
              : `${firstSession.exam.subjectName || "Subject"} - Custom Exam`
          );

          const combinedSession: StrataExamSessionResponse = {
            ...firstSession,
            exam: {
              ...firstSession.exam,
              title: resolvedExamTitle,
              questionsCount: totalSampled,
              sectionsCount: sections.length,
              selectedLayout: selectedLayout || firstSession.exam.selectedLayout || "Generic",
              selectedMode: selectedMode || firstSession.exam.selectedMode || "Practice",
            },
            sections,
          };

          setExamSession(combinedSession);
          setSkewTotal(totalSampled);
          setSkewTotalPages(1);
          return;
        }

        // ─────────────────────────────────────────────────────────────
        // 3. STANDARD SINGLE EXAM FETCH
        // ─────────────────────────────────────────────────────────────
        const singleIdentifier = examIdentifier || examIds[0] || "";
        const result = await strataService<StrataExamSessionResponse>(
          "Exam",
          FETCH_TYPE,
          {
            identifier: singleIdentifier,
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

        if (result?.error) {
          throw new Error(result.error);
        }

        const session = result?.data ?? null;
        setExamSession(session);
        setSkewTotal(session?.exam?.questionsCount ?? 0);
        setSkewTotalPages(1);

      } catch (err: unknown) {
        console.error("❌ Failed to fetch live exam:", err);
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
    targetAttemptNumber,
    builderMode,
    questionCount,
    examCount,
    subCategories,
    customTitle,
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
