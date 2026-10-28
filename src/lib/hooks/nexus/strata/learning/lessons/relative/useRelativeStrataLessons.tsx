'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  unitId: number;

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

  topicsCount?: number;
}

export const useRelativeStrataLessons = () => {
  const [lessons, setLessons] = useState<StrataItem[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<StrataItem[]>([]);
  const [lessonSearch, setLessonSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchLessons = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataLessons] Fetching Lessons with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Lesson",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataLessons] Raw result:", result);
      console.log("📦 [useRelativeStrataLessons] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataLessons] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataLessons] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setLessons(data);
      setFilteredLessons(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataLessons] Failed to fetch Lessons:", err);
      setLessons([]);
      setFilteredLessons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Lessons when search changes
  useEffect(() => {
    fetchLessons(lessonSearch);
  }, [lessonSearch, fetchLessons]);

  // Filter Lessons when search changes
  useEffect(() => {
    const filtered = lessons
      .filter(lesson =>
        lesson.name?.toLowerCase().includes(lessonSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataLessons] Filtered ${filtered.length} Lessons for search: "${lessonSearch}"`
    );

    setFilteredLessons(filtered);
  }, [lessonSearch, lessons]);

  return {
    lessons,
    filteredLessons,
    lessonSearch,
    setLessonSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
