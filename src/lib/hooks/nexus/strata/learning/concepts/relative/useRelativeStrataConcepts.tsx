'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  topicId: number;

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

  factsCount?: number;
}

export const useRelativeStrataConcepts = () => {
  const [concepts, setConcepts] = useState<StrataItem[]>([]);
  const [filteredConcepts, setFilteredConcepts] = useState<StrataItem[]>([]);
  const [conceptSearch, setConceptSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchConcepts = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataConcepts] Fetching Concepts with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Concept",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataConcepts] Raw result:", result);
      console.log("📦 [useRelativeStrataConcepts] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataConcepts] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataConcepts] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setConcepts(data);
      setFilteredConcepts(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataConcepts] Failed to fetch Concepts:", err);
      setConcepts([]);
      setFilteredConcepts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Concepts when search changes
  useEffect(() => {
    fetchConcepts(conceptSearch);
  }, [conceptSearch, fetchConcepts]);

  // Filter Concepts when search changes
  useEffect(() => {
    const filtered = concepts
      .filter(concept =>
        concept.name?.toLowerCase().includes(conceptSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataConcepts] Filtered ${filtered.length} Concepts for search: "${conceptSearch}"`
    );

    setFilteredConcepts(filtered);
  }, [conceptSearch, concepts]);

  return {
    concepts,
    filteredConcepts,
    conceptSearch,
    setConceptSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
