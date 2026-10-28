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

  // Parent Cohort info
  cohortId?: number;
  cohortGuidId?: string;
  cohortName?: string;
}

export const useAbsoluteStrataClasses = ({
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
  const [classes, setClasses] = useState<StrataItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<StrataItem[]>([]);
  const [classSearch, setClassSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log("🚀 [useAbsoluteStrataClasses] Fetching Classes ... 🪝");
        console.log("🧪 [Hook Params]", {
          classSearch,
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
          "StrataClass",
          FETCH_TYPE,
          {
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: classSearch || "",
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

        setClasses(items);
        setFilteredClasses(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useAbsoluteStrataClasses] Failed to fetch Classes:",
          err
        );
      }
    };

    fetchClasses();
  }, [classSearch, page, perPage, sortColumn, sortDirection]);

  // Pass Classes when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredClasses(classes);
  }, [classes]);

  return {
    classes,
    skewTotal,
    skewTotalPages,
    filteredClasses,
    classSearch,
    setClassSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
