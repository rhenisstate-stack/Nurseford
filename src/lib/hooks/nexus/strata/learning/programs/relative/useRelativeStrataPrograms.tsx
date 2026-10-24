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

  coursesCount?: number;
}

export const useRelativeStrataPrograms = () => {
  const [programs, setPrograms] = useState<StrataItem[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<StrataItem[]>([]);
  const [programSearch, setProgramSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchPrograms = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataPrograms] Fetching Programs with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Program",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataPrograms] Raw result:", result);
      console.log("📦 [useRelativeStrataPrograms] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataPrograms] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataPrograms] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setPrograms(data);
      setFilteredPrograms(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataPrograms] Failed to fetch Programs:", err);
      setPrograms([]);
      setFilteredPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Programs when search changes
  useEffect(() => {
    fetchPrograms(programSearch);
  }, [programSearch, fetchPrograms]);

  // Filter Programs when search changes
  useEffect(() => {
    const filtered = programs
      .filter(program =>
        program.name?.toLowerCase().includes(programSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataPrograms] Filtered ${filtered.length} Programs for search: "${programSearch}"`
    );

    setFilteredPrograms(filtered);
  }, [programSearch, programs]);

  return {
    programs,
    filteredPrograms,
    programSearch,
    setProgramSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
