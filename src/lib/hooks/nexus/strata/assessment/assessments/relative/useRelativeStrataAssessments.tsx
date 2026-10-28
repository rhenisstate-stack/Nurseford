'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guidId: string;

  domainId: number;

  name: string;
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

  examsCount?: number;
}

export const useRelativeStrataAssessments = () => {
  const [assessments, setAssessments] = useState<StrataItem[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<StrataItem[]>([]);
  const [assessmentSearch, setAssessmentSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchAssessments = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataAssessments] Fetching Assessments with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Assessment",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataAssessments] Raw result:", result);
      console.log("📦 [useRelativeStrataAssessments] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataAssessments] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataAssessments] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setAssessments(data);
      setFilteredAssessments(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataAssessments] Failed to fetch Assessments:", err);
      setAssessments([]);
      setFilteredAssessments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Assessments when search changes
  useEffect(() => {
    fetchAssessments(assessmentSearch);
  }, [assessmentSearch, fetchAssessments]);

  // Filter Assessments when search changes
  useEffect(() => {
    const filtered = assessments
      .filter(assessment =>
        assessment.name?.toLowerCase().includes(assessmentSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataAssessments] Filtered ${filtered.length} Assessments for search: "${assessmentSearch}"`
    );

    setFilteredAssessments(filtered);
  }, [assessmentSearch, assessments]);

  return {
    assessments,
    filteredAssessments,
    assessmentSearch,
    setAssessmentSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
