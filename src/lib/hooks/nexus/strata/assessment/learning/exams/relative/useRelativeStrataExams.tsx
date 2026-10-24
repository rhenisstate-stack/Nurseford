// src\lib\hooks\dashboards\strata\assessment\learning\exams\relative\useRelativeStrataExams.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

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

export const useRelativeStrataExams = () => {
  const [exams, setExams] = useState<StrataItem[]>([]);
  const [filteredExams, setFilteredExams] = useState<StrataItem[]>([]);
  const [examSearch, setExamSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchExams = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataExams] Fetching Exams with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Exam",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataExams] Raw result:", result);
      console.log("📦 [useRelativeStrataExams] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataExams] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataExams] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setExams(data);
      setFilteredExams(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataExams] Failed to fetch Exams:", err);
      setExams([]);
      setFilteredExams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
