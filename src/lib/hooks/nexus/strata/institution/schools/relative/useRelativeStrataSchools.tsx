'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  institutionId: number;

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

  schoolsCount?: number;
}

export const useRelativeStrataSchools = () => {
  const [schools, setSchools] = useState<StrataItem[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<StrataItem[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchSchools = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataSchools] Fetching Schools with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "School",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataSchools] Raw result:", result);
      console.log("📦 [useRelativeStrataSchools] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataSchools] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataSchools] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setSchools(data);
      setFilteredSchools(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataSchools] Failed to fetch Schools:", err);
      setSchools([]);
      setFilteredSchools([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Schools when search changes
  useEffect(() => {
    fetchSchools(schoolSearch);
  }, [schoolSearch, fetchSchools]);

  // Filter Schools when search changes
  useEffect(() => {
    const filtered = schools
      .filter(school =>
        school.name?.toLowerCase().includes(schoolSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataSchools] Filtered ${filtered.length} Schools for search: "${schoolSearch}"`
    );

    setFilteredSchools(filtered);
  }, [schoolSearch, schools]);

  return {
    schools,
    filteredSchools,
    schoolSearch,
    setSchoolSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
