'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  departmentId: number;

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

  cohortsCount?: number;
}

export const useRelativeStrataDivisions = () => {
  const [divisions, setDivisions] = useState<StrataItem[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<StrataItem[]>([]);
  const [divisionSearch, setDivisionSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchDivisions = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataDivisions] Fetching Divisions with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Division",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataDivisions] Raw result:", result);
      console.log("📦 [useRelativeStrataDivisions] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataDivisions] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataDivisions] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setDivisions(data);
      setFilteredDivisions(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataDivisions] Failed to fetch Divisions:", err);
      setDivisions([]);
      setFilteredDivisions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Divisions when search changes
  useEffect(() => {
    fetchDivisions(divisionSearch);
  }, [divisionSearch, fetchDivisions]);

  // Filter Divisions when search changes
  useEffect(() => {
    const filtered = divisions
      .filter(division =>
        division.name?.toLowerCase().includes(divisionSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataDivisions] Filtered ${filtered.length} Divisions for search: "${divisionSearch}"`
    );

    setFilteredDivisions(filtered);
  }, [divisionSearch, divisions]);

  return {
    divisions,
    filteredDivisions,
    divisionSearch,
    setDivisionSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
