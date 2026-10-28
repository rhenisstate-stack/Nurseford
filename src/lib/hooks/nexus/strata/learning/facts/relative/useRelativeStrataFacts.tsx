'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  conceptId: number;

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

export const useRelativeStrataFactts = () => {
  const [facts, setFacts] = useState<StrataItem[]>([]);
  const [filteredFacts, setFilteredFacts] = useState<StrataItem[]>([]);
  const [factSearch, setFactSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchFacts = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataFactts] Fetching Facts with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Fact",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataFactts] Raw result:", result);
      console.log("📦 [useRelativeStrataFactts] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataFactts] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataFactts] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setFacts(data);
      setFilteredFacts(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataFactts] Failed to fetch Facts:", err);
      setFacts([]);
      setFilteredFacts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Facts when search changes
  useEffect(() => {
    fetchFacts(factSearch);
  }, [factSearch, fetchFacts]);

  // Filter Facts when search changes
  useEffect(() => {
    const filtered = facts
      .filter(fact =>
        fact.name?.toLowerCase().includes(factSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataFactts] Filtered ${filtered.length} Facts for search: "${factSearch}"`
    );

    setFilteredFacts(filtered);
  }, [factSearch, facts]);

  return {
    facts,
    filteredFacts,
    factSearch,
    setFactSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
