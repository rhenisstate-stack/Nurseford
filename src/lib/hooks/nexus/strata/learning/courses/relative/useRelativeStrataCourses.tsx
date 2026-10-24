'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  programId: number;

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

  subjectsCount?: number;
}

export const useRelativeStrataCourses = () => {
  const [courses, setCourses] = useState<StrataItem[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<StrataItem[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchCourses = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataCourses] Fetching Courses with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Course",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataCourses] Raw result:", result);
      console.log("📦 [useRelativeStrataCourses] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataCourses] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataCourses] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setCourses(data);
      setFilteredCourses(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataCourses] Failed to fetch Courses:", err);
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Courses when search changes
  useEffect(() => {
    fetchCourses(courseSearch);
  }, [courseSearch, fetchCourses]);

  // Filter Courses when search changes
  useEffect(() => {
    const filtered = courses
      .filter(course =>
        course.name?.toLowerCase().includes(courseSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataCourses] Filtered ${filtered.length} Courses for search: "${courseSearch}"`
    );

    setFilteredCourses(filtered);
  }, [courseSearch, courses]);

  return {
    courses,
    filteredCourses,
    courseSearch,
    setCourseSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
