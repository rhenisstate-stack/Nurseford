'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import type { NursingProgramScope } from "@/lib/utils/exams/nursingProgramScope";
import { fetchScopedNominalExams } from "@/lib/utils/exams/scopedExamFetch";

export interface StrataItem {
  id: number;
  guidId: string;

  title: string;
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

  level?: string;
  difficulty?: string;
  order?: string;

  season?: string;
  module?: string;
  year?: number;

  resources?: string;
  prerequisites?: string;
  objectives?: string;
  instructions?: string;

  isFeatured?: boolean;
  hasCertificate?: boolean;
  language?: string;

  createdAt?: string;
  updatedAt?: string;

  // Parent Assessment info
  assessmentId?: number;
  assessmentGuidId?: string;
  assessmentName?: string;

  sectionsCount?: number;
  questionsCount?: number;
  attemptsAllowed?: number;
  passMark?: number;
  totalMarks?: number;
  duration?: number;

  examActions?: {
    id: number;
    guidId: string;
    userId: number;
    actionContent?: string;
    residualDuration?: number;
    attemptCount: number;
    isAttempted: boolean;
    status?: string;
    description?: string;
    createdAt: string;
  }[];

}

// dynamicLearningStrataName
export type LearningStrata =
  | "program"
  | "course"
  | "subject"
  | "unit"
  | "lesson"
  | "topic"
  | "concept"
  | "fact";

type StrataListData = {
  items?: StrataItem[];
  Items?: StrataItem[];
  results?: StrataItem[];
  Results?: StrataItem[];
  skewTotal?: number;
  SkewTotal?: number;
  skewTotalPages?: number;
  SkewTotalPages?: number;
  totalResults?: number;
  total?: number;
  totalPages?: number;
};

// Returns the payload whether the service wrapped it in `data` or not
const getListData = (res: unknown): StrataListData | StrataItem[] => {
  const r = res as { data?: StrataListData | StrataItem[] } | null | undefined;
  return r?.data ?? (r as StrataListData | null) ?? {};
};

// Pulls the items array out of any of the response shapes
const extractItems = (res: unknown): StrataItem[] => {
  const data = getListData(res);
  if (Array.isArray(data)) return data;
  const topLevelItems = (res as { items?: StrataItem[] } | null)?.items;
  const found = [data.items, data.Items, data.results, data.Results, topLevelItems].find(
    (candidate) => Array.isArray(candidate)
  );
  return found ?? [];
};

export const useNominalStrataExams = ({
  parentIdentifier = "",
  page = 1,
  perPage = 20,
  sortColumn = "id",
  sortDirection = "desc",
  dynamicLearningStrataName = null,
  allowEmptyParent = true,
  programScope = "all",
  sliceMerged = true,
}: {
  parentIdentifier?: string | null;
  page?: number | string;
  perPage?: number | string;
  sortColumn?: keyof StrataItem | null;
  sortDirection?: "asc" | "desc";
  dynamicLearningStrataName?: LearningStrata | null;
  allowEmptyParent?: boolean;
  programScope?: NursingProgramScope;
  sliceMerged?: boolean;
}) => {
  const [exams, setExams] = useState<StrataItem[]>([]);
  const [filteredExams, setFilteredExams] = useState<StrataItem[]>([]);
  const [examSearch, setExamSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

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
      // If parentIdentifier is undefined or null and empty parent is not permitted
      if ((parentIdentifier === undefined || parentIdentifier === null) && !allowEmptyParent) {
        setExams([]);
        setFilteredExams([]);
        setSkewTotal(0);
        setSkewTotalPages(1);
        setIsLoading(false);
        return;
      }

      const cleanIdentifier = (parentIdentifier ?? "").trim();
      const isParentEmpty = cleanIdentifier === "";

      if (isParentEmpty && !allowEmptyParent) {
        setExams([]);
        setFilteredExams([]);
        setSkewTotal(0);
        setSkewTotalPages(1);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("🚀 [useNominalStrataExams] Fetching Exams . . . 🪝");
        console.log("🧪 [Hook Params]", {
          examSearch,
          page: cleanPage,
          perPage: cleanPerPage,
          sortColumn,
          sortDirection,
          cleanIdentifier,
          isParentEmpty,
        });

        // When no specific parent identifier is provided, scale the fetch strictly
        // to RN Nursing, LPN Nursing, and Exit Exam programs via NominalFetch.
        if (isParentEmpty) {
          const scoped = await fetchScopedNominalExams<StrataItem>({
            scope: programScope,
            page: cleanPage,
            perPage: cleanPerPage,
            search: examSearch,
            sortColumn,
            sortDirection,
            sliceMerged,
          });
          setExams(scoped.items);
          setFilteredExams(scoped.items);
          setSkewTotal(scoped.totalItems);
          setSkewTotalPages(scoped.totalPages);
          return;
        }

        const result = await strataService<{
          items?: StrataItem[];
          results?: StrataItem[];
          skewPage?: number;
          skewPerPage?: number;
          skewTotal?: number;
          skewTotalPages?: number;
          skewSearch?: string | null;
          skewSort?: string | null;
          skewColumnSort?: string | null;
        }>(
          "Exam",
          "NominalFetch",
          {
            identifier: cleanIdentifier,
            dynamicPage: cleanPage,
            dynamicPerPage: cleanPerPage,
            dynamicSearch: examSearch || "",
            dynamicSortColumn: sortColumn ?? "id",
            dynamicSortDirection: sortDirection ?? "desc",
            dynamicLearningStrataName: dynamicLearningStrataName ?? "",
          }
        );

        console.log("📥 Raw result:", result);
        console.log("📦 result.data:", result?.data);

        if (result?.error && !result?.data) {
          throw new Error(result.error);
        }

        const rawItems = extractItems(result);
        const resDataRaw = getListData(result);
        const resData: StrataListData = Array.isArray(resDataRaw) ? {} : resDataRaw;

        const items = [...rawItems].sort((a, b) => {
          const effectiveCol = sortColumn ?? "id";
          const effectiveDir = sortDirection ?? "desc";
          if (effectiveCol === "id") {
            const idA = Number(a.id) || 0;
            const idB = Number(b.id) || 0;
            return effectiveDir === "asc" ? idA - idB : idB - idA;
          }
          return 0;
        });

        const totalItems =
          resData?.skewTotal ??
          resData?.SkewTotal ??
          resData?.totalResults ??
          resData?.total ??
          items.length;
        const totalPages =
          resData?.skewTotalPages ??
          resData?.SkewTotalPages ??
          resData?.totalPages ??
          1;

        setExams(items);
        setFilteredExams(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useNominalStrataExams] Failed to fetch Exams:",
          err
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [
    parentIdentifier,
    examSearch,
    cleanPage,
    cleanPerPage,
    sortColumn,
    sortDirection,
    dynamicLearningStrataName,
    allowEmptyParent,
    programScope,
    sliceMerged,
    refreshKey,
  ]);

  // Pass Exams when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredExams(exams);
  }, [exams]);

  return {
    exams,
    skewTotal,
    skewTotalPages,
    filteredExams,
    examSearch,
    setExamSearch,
    isLoading,
    refetch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
