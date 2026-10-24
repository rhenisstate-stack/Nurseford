'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  courseId: number;

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

  unitsCount?: number;
}

export const useRelativeStrataSubjects = () => {
  const [subjects, setSubjects] = useState<StrataItem[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<StrataItem[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchSubjects = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataSubjects] Fetching Subjects with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Subject",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataSubjects] Raw result:", result);
      console.log("📦 [useRelativeStrataSubjects] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataSubjects] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataSubjects] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setSubjects(data);
      setFilteredSubjects(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataSubjects] Failed to fetch Subjects:", err);
      setSubjects([]);
      setFilteredSubjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Subjects when search changes
  useEffect(() => {
    fetchSubjects(subjectSearch);
  }, [subjectSearch, fetchSubjects]);

  // Filter Subjects when search changes
  useEffect(() => {
    const filtered = subjects
      .filter(subject =>
        subject.name?.toLowerCase().includes(subjectSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataSubjects] Filtered ${filtered.length} Subjects for search: "${subjectSearch}"`
    );

    setFilteredSubjects(filtered);
  }, [subjectSearch, subjects]);

  return {
    subjects,
    filteredSubjects,
    subjectSearch,
    setSubjectSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
