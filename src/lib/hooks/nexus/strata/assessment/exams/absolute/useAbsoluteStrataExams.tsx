'use client';

import { useEffect, useState } from "react";
import type { NursingProgramScope } from "@/lib/utils/exams/nursingProgramScope";
import { fetchScopedNominalExams } from "@/lib/utils/exams/scopedExamFetch";

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
  duration?: number;

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
  programScope = "all",
}: {
  page?: number;
  perPage?: number;
  sortColumn?: keyof StrataItem | null;
  sortDirection?: "asc" | "desc";
  programScope?: NursingProgramScope;
}) => {
  const [exams, setExams] = useState<StrataItem[]>([]);
  const [filteredExams, setFilteredExams] = useState<StrataItem[]>([]);
  const [examSearch, setExamSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const scoped = await fetchScopedNominalExams<StrataItem>({
          scope: programScope,
          page,
          perPage,
          search: examSearch,
          sortColumn,
          sortDirection,
          sliceMerged: true,
        });

        setExams(scoped.items);
        setFilteredExams(scoped.items);
        setSkewTotal(scoped.totalItems);
        setSkewTotalPages(scoped.totalPages);
      } catch (err) {
        console.error(
          "❌ [useAbsoluteStrataExams] Failed to fetch Exams:",
          err
        );
      }
    };

    fetchExams();
  }, [examSearch, page, perPage, sortColumn, sortDirection, programScope]);

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
