'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guidId: string;

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

  isFeatured?: boolean;
  language?: string;

  created_at?: string;
  updated_at?: string;

  domains_count?: number;
}

export const useRelativeStrataCategories = () => {
  const [categories, setCategories] = useState<StrataItem[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<StrataItem[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchCategories = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataCategories] Fetching categories with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Category",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataCategories] Raw result:", result);
      console.log("📦 [useRelativeStrataCategories] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataCategories] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataCategories] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setCategories(data);
      setFilteredCategories(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataCategories] Failed to fetch categories:", err);
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch categories when search changes
  useEffect(() => {
    fetchCategories(categorySearch);
  }, [categorySearch, fetchCategories]);

  // Filter categories when search changes
  useEffect(() => {
    const filtered = categories
      .filter(category =>
        category.name?.toLowerCase().includes(categorySearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataCategories] Filtered ${filtered.length} categories for search: "${categorySearch}"`
    );

    setFilteredCategories(filtered);
  }, [categorySearch, categories]);

  return {
    categories,
    filteredCategories,
    categorySearch,
    setCategorySearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
