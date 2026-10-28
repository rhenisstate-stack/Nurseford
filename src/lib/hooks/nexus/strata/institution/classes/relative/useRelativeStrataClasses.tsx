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

}

export const useRelativeStrataClasses = () => {
  const [classes, setClasses] = useState<StrataItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<StrataItem[]>([]);
  const [classeSearch, setClasseSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchClasses = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataClasses] Fetching Classes with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "StrataClass",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataClasses] Raw result:", result);
      console.log("📦 [useRelativeStrataClasses] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataClasses] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataClasses] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setClasses(data);
      setFilteredClasses(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataClasses] Failed to fetch Classes:", err);
      setClasses([]);
      setFilteredClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Classes when search changes
  useEffect(() => {
    fetchClasses(classeSearch);
  }, [classeSearch, fetchClasses]);

  // Filter Classes when search changes
  useEffect(() => {
    const filtered = classes
      .filter(strataClass =>
        strataClass.name?.toLowerCase().includes(classeSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataClasses] Filtered ${filtered.length} Classes for search: "${classeSearch}"`
    );

    setFilteredClasses(filtered);
  }, [classeSearch, classes]);

  return {
    classes,
    filteredClasses,
    classeSearch,
    setClasseSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
