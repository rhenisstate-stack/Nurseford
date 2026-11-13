'use client';

import { useEffect, useState, useCallback } from "react";
import type { NursingProgramScope } from "@/lib/utils/exams/nursingProgramScope";
import { fetchScopedNominalExams } from "@/lib/utils/exams/scopedExamFetch";

export interface StrataItem {
  id: number;
  guidId: string;

  assessmentId: number;

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

  created_at?: string;
  updated_at?: string;

  sectionsCount?: number;
}

export const useRelativeStrataExams = (
  programScope: NursingProgramScope = "all"
) => {
  const [exams, setExams] = useState<StrataItem[]>([]);
  const [filteredExams, setFilteredExams] = useState<StrataItem[]>([]);
  const [examSearch, setExamSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // useCallback at top level
  const fetchExams = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      const scoped = await fetchScopedNominalExams<StrataItem>({
        scope: programScope,
        page: 1,
        perPage: 20,
        search,
        sortColumn: "id",
        sortDirection: "desc",
        sliceMerged: true,
      });

      setExams(scoped.items);
      setFilteredExams(scoped.items.slice(0, 20));
    } catch (err) {
      console.error("❌ [useRelativeStrataExams] Failed to fetch Exams:", err);
      setExams([]);
      setFilteredExams([]);
    } finally {
      setIsLoading(false);
    }
  }, [programScope]);

  // Fetch Exams when search changes
  useEffect(() => {
    fetchExams(examSearch);
  }, [examSearch, fetchExams]);

  // Filter Exams when search changes
  useEffect(() => {
    const filtered = exams
      .filter(exam =>
        exam.title?.toLowerCase().includes(examSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataExams] Filtered ${filtered.length} Exams for search: "${examSearch}"`
    );

    setFilteredExams(filtered);
  }, [examSearch, exams]);

  return {
    exams,
    filteredExams,
    examSearch,
    setExamSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
