'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

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

  subcategories_count?: number;

}

export const useDistinctStrataCategories = () => {
  const [categories, setCategories] = useState<StrataItem[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<StrataItem[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const FETCH_TYPE = 'AbsoluteFetch';

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("🚀 [useDistinctStrataCategories] Fetching categories...");

        const result = await strataService<StrataItem[]>("Category",  FETCH_TYPE,);

        console.log("📥 [useDistinctStrataCategories] Raw result:", result);
        console.log("📦 [useDistinctStrataCategories] result.data:", result?.data);
        console.log(
          "🔢 [useDistinctStrataCategories] Count:",
          Array.isArray(result?.data) ? result.data.length : "Not an array"
        );

        if (Array.isArray(result?.data)) {
          console.log(
            "🧪 [useDistinctStrataCategories] First 3 items:",
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
        console.error("❌ [useDistinctStrataCategories] Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories when search changes
  useEffect(() => {
    const filtered = categories
      .filter(category =>
        category.name?.toLowerCase().includes(categorySearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useDistinctStrataCategories] Filtered ${filtered.length} categories for search: "${categorySearch}"`
    );

    setFilteredCategories(filtered);
  }, [categorySearch, categories]);

  return {
    categories,
    filteredCategories,
    categorySearch,
    setCategorySearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
