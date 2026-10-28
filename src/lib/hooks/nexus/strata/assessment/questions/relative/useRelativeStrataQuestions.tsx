'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guidId: string;

  sectionId: number;

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

export const useRelativeStrataQuestions = () => {
  const [questions, setQuestions] = useState<StrataItem[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<StrataItem[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchQuestions = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataQuestions] Fetching Questions with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Program",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataQuestions] Raw result:", result);
      console.log("📦 [useRelativeStrataQuestions] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataQuestions] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataQuestions] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setQuestions(data);
      setFilteredQuestions(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataQuestions] Failed to fetch Questions:", err);
      setQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Questions when search changes
  useEffect(() => {
    fetchQuestions(questionSearch);
  }, [questionSearch, fetchQuestions]);

  // Filter Questions when search changes
  useEffect(() => {
    const filtered = questions
      .filter(question =>
        question.name?.toLowerCase().includes(questionSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataQuestions] Filtered ${filtered.length} Questions for search: "${questionSearch}"`
    );

    setFilteredQuestions(filtered);
  }, [questionSearch, questions]);

  return {
    questions,
    filteredQuestions,
    questionSearch,
    setQuestionSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
