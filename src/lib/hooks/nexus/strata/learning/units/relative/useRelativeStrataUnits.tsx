'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  subjectId: number;

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

  lessonsCount?: number;
}

export const useRelativeStrataUnits = () => {
  const [units, setUnits] = useState<StrataItem[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<StrataItem[]>([]);
  const [unitSearch, setUnitSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchUnits = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataUnits] Fetching Units with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Unit",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataUnits] Raw result:", result);
      console.log("📦 [useRelativeStrataUnits] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataUnits] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataUnits] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setUnits(data);
      setFilteredUnits(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataUnits] Failed to fetch Units:", err);
      setUnits([]);
      setFilteredUnits([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Units when search changes
  useEffect(() => {
    fetchUnits(unitSearch);
  }, [unitSearch, fetchUnits]);

  // Filter Units when search changes
  useEffect(() => {
    const filtered = units
      .filter(unit =>
        unit.name?.toLowerCase().includes(unitSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataUnits] Filtered ${filtered.length} Units for search: "${unitSearch}"`
    );

    setFilteredUnits(filtered);
  }, [unitSearch, units]);

  return {
    units,
    filteredUnits,
    unitSearch,
    setUnitSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
