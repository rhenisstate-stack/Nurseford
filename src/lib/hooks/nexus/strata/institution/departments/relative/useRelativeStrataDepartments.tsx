'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  schoolId: number;

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

  divisionsCount?: number;
}

export const useRelativeStrataDepartments = () => {
  const [departments, setDepartments] = useState<StrataItem[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<StrataItem[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchDepartments = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataDepartments] Fetching Departments with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Department",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataDepartments] Raw result:", result);
      console.log("📦 [useRelativeStrataDepartments] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataDepartments] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataDepartments] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setDepartments(data);
      setFilteredDepartments(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataDepartments] Failed to fetch Departments:", err);
      setDepartments([]);
      setFilteredDepartments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Departments when search changes
  useEffect(() => {
    fetchDepartments(departmentSearch);
  }, [departmentSearch, fetchDepartments]);

  // Filter Departments when search changes
  useEffect(() => {
    const filtered = departments
      .filter(department =>
        department.name?.toLowerCase().includes(departmentSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataDepartments] Filtered ${filtered.length} Departments for search: "${departmentSearch}"`
    );

    setFilteredDepartments(filtered);
  }, [departmentSearch, departments]);

  return {
    departments,
    filteredDepartments,
    departmentSearch,
    setDepartmentSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
