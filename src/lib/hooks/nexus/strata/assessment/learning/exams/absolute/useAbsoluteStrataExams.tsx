'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guidId: string;

  title: string;
  description?: string;

  target?: string;
  type?: string;
  code?: string;
  status?: string;

  segment?: string;
  fragment?: string;
  link?: string;

  ratings?: number;
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
  language?: string;

  createdAt?: string;
  updatedAt?: string;

  // Parent Assessment info
  assessmentId?: number;
  assessmentGuidId?: string;
  assessmentName?: string;

  sectionsCount?: number;
}

export const useAbsoluteStrataExams = ({
  page = 1,
  perPage = 20,
  sortColumn = "id",
  sortDirection = "desc",
}: {
  page?: number;
  perPage?: number;
  sortColumn?: keyof StrataItem | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [exams, setExams] = useState<StrataItem[]>([]);
  const [filteredExams, setFilteredExams] = useState<StrataItem[]>([]);
  const [examSearch, setExamSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchExams = async () => {
      try {
        console.log("🚀 [useAbsoluteStrataExams] Fetching Exams ... 🪝");
        console.log("🧪 [Hook Params]", {
          examSearch,
          page,
          perPage,
          sortColumn,
          sortDirection,
        });

        const result = await strataService<{
          items: StrataItem[];
          skewPage: number;
          skewPerPage: number;
          skewTotal: number;
          skewTotalPages: number;
          skewSearch?: string | null;
          skewSort?: string | null;
          skewColumnSort?: string | null;
        }>(
          "Exam",
          FETCH_TYPE,
          {
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: examSearch || "",
            dynamicSortColumn: sortColumn ?? "id",
            dynamicSortDirection: sortDirection ?? "desc",
          }
        );

        console.log("📥 Raw result:", result);
        console.log("📦 result.data:", result?.data);

        if (result?.error) {
          throw new Error(result.error);
        }

        const rawItems = result?.data?.items ?? [];
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
        const totalItems = result?.data?.skewTotal ?? 0;
        const totalPages = result?.data?.skewTotalPages ?? 1;

        setExams(items);
        setFilteredExams(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useAbsoluteStrataExams] Failed to fetch Exams:",
          err
        );
      }
    };

    fetchExams();
  }, [examSearch, page, perPage, sortColumn, sortDirection]);

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
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
