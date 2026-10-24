'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  examId: number;

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

  questionsCount?: number;
}

export const useRelativeStrataSections = () => {
  const [sections, setSections] = useState<StrataItem[]>([]);
  const [filteredSections, setFilteredSections] = useState<StrataItem[]>([]);
  const [sectionSearch, setSectionSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchSections = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataSections] Fetching Sections with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Program",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataSections] Raw result:", result);
      console.log("📦 [useRelativeStrataSections] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataSections] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataSections] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setSections(data);
      setFilteredSections(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataSections] Failed to fetch Sections:", err);
      setSections([]);
      setFilteredSections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Sections when search changes
  useEffect(() => {
    fetchSections(sectionSearch);
  }, [sectionSearch, fetchSections]);

  // Filter Sections when search changes
  useEffect(() => {
    const filtered = sections
      .filter(section =>
        section.name?.toLowerCase().includes(sectionSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataSections] Filtered ${filtered.length} Sections for search: "${sectionSearch}"`
    );

    setFilteredSections(filtered);
  }, [sectionSearch, sections]);

  return {
    sections,
    filteredSections,
    sectionSearch,
    setSectionSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
