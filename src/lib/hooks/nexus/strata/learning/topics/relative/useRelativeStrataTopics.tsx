'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  lessonId: number;

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

  conceptsCount?: number;
}

export const useRelativeStrataTopics = () => {
  const [topics, setTopics] = useState<StrataItem[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<StrataItem[]>([]);
  const [topicSearch, setTopicSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchTopics = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataTopics] Fetching Topics with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Topic",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataTopics] Raw result:", result);
      console.log("📦 [useRelativeStrataTopics] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataTopics] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataTopics] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setTopics(data);
      setFilteredTopics(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataTopics] Failed to fetch Topics:", err);
      setTopics([]);
      setFilteredTopics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Topics when search changes
  useEffect(() => {
    fetchTopics(topicSearch);
  }, [topicSearch, fetchTopics]);

  // Filter Topics when search changes
  useEffect(() => {
    const filtered = topics
      .filter(topic =>
        topic.name?.toLowerCase().includes(topicSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataTopics] Filtered ${filtered.length} Topics for search: "${topicSearch}"`
    );

    setFilteredTopics(filtered);
  }, [topicSearch, topics]);

  return {
    topics,
    filteredTopics,
    topicSearch,
    setTopicSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
