'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  categoryId: number;

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

  is_featured?: boolean;
  language?: string;

  created_at?: string;
  updated_at?: string;

  domains_count?: number;
}

export const useRelativeStrataSubCategories = () => {
  const [subcategories, setSubCategories] = useState<StrataItem[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<StrataItem[]>([]);
  const [subcategorySearch, setSubCategorySearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchSubCategories = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataSubCategories] Fetching subcategories with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "SubCategory",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataSubCategories] Raw result:", result);
      console.log("📦 [useRelativeStrataSubCategories] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataSubCategories] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataSubCategories] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setSubCategories(data);
      setFilteredSubCategories(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataSubCategories] Failed to fetch subcategories:", err);
      setSubCategories([]);
      setFilteredSubCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch subcategories when search changes
  useEffect(() => {
    fetchSubCategories(subcategorySearch);
  }, [subcategorySearch, fetchSubCategories]);

  // Filter subcategories when search changes
  useEffect(() => {
    const filtered = subcategories
      .filter(subcategory =>
        subcategory.name?.toLowerCase().includes(subcategorySearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataSubCategories] Filtered ${filtered.length} subcategories for search: "${subcategorySearch}"`
    );

    setFilteredSubCategories(filtered);
  }, [subcategorySearch, subcategories]);

  return {
    subcategories,
    filteredSubCategories,
    subcategorySearch,
    setSubCategorySearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
