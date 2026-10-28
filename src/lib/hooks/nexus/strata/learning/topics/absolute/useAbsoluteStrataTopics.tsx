'use client';

import { useEffect, useState } from "react";
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
  instructions?: string;

  isFeatured?: boolean;
  language?: string;

  createdAt?: string;
  updatedAt?: string;

  // Parent Lesson info
  lessonId?: number;
  lessonGuidId?: string;
  lessonName?: string;

  conceptsCount?: number;
}

export const useAbsoluteStrataTopics = ({
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  page?: number;
  perPage?: number;
  sortColumn?: keyof StrataItem | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [topics, setTopics] = useState<StrataItem[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<StrataItem[]>([]);
  const [topicSearch, setTopicSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        console.log("🚀 [useAbsoluteStrataTopics] Fetching Topics ... 🪝");
        console.log("🧪 [Hook Params]", {
          topicSearch,
          page,
          perPage,
          sortColumn,
          sortDirection,
        });

        const result = await strataService<{
          items: StrataItem[];
          skewPage: number;
          skewPerPage: number;
          skewTotal: number;
          skewTotalPages: number;
          skewSearch?: string | null;
          skewSort?: string | null;
          skewColumnSort?: string | null;
        }>(
          "Topic",
          FETCH_TYPE,
          {
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: topicSearch || "",
            dynamicSortColumn: sortColumn,
            dynamicSortDirection: sortDirection,
          }
        );

        console.log("📥 Raw result:", result);
        console.log("📦 result.data:", result?.data);

        if (result?.error) {
          throw new Error(result.error);
        }

        const items = result?.data?.items ?? [];
        const totalItems = result?.data?.skewTotal ?? 0;
        const totalPages = result?.data?.skewTotalPages ?? 1;

        setTopics(items);
        setFilteredTopics(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useAbsoluteStrataTopics] Failed to fetch Topics:",
          err
        );
      }
    };

    fetchTopics();
  }, [topicSearch, page, perPage, sortColumn, sortDirection]);

  // Pass Topics when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredTopics(topics);
  }, [topics]);

  return {
    topics,
    skewTotal,
    skewTotalPages,
    filteredTopics,
    topicSearch,
    setTopicSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
