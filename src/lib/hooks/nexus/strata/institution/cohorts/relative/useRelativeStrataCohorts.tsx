'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  divisionId: number;

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

  classesCount?: number;
}

export const useRelativeStrataCohorts = () => {
  const [cohorts, setCohorts] = useState<StrataItem[]>([]);
  const [filteredCohorts, setFilteredCohorts] = useState<StrataItem[]>([]);
  const [cohortSearch, setCohortSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchCohorts = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataCohorts] Fetching Cohorts with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Cohort",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataCohorts] Raw result:", result);
      console.log("📦 [useRelativeStrataCohorts] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataCohorts] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataCohorts] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setCohorts(data);
      setFilteredCohorts(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataCohorts] Failed to fetch Cohorts:", err);
      setCohorts([]);
      setFilteredCohorts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Cohorts when search changes
  useEffect(() => {
    fetchCohorts(cohortSearch);
  }, [cohortSearch, fetchCohorts]);

  // Filter Cohorts when search changes
  useEffect(() => {
    const filtered = cohorts
      .filter(cohort =>
        cohort.name?.toLowerCase().includes(cohortSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataCohorts] Filtered ${filtered.length} Cohorts for search: "${cohortSearch}"`
    );

    setFilteredCohorts(filtered);
  }, [cohortSearch, cohorts]);

  return {
    cohorts,
    filteredCohorts,
    cohortSearch,
    setCohortSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
