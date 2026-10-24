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

  // Parent Division info
  divisionId?: number;
  divisionGuidId?: string;
  divisionName?: string;

  classesCount?: number;
}

export const useDistinctStrataCohorts = ({
  parentIdentifier,   //  PARENT STRATA IDENTIFIER
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  parentIdentifier: string;   //  PARENT STRATA IDENTIFIER - REQUIRED.
  page?: number;
  perPage?: number;
  sortColumn?: keyof StrataItem | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [cohorts, setCohorts] = useState<StrataItem[]>([]);
  const [filteredCohorts, setFilteredCohorts] = useState<StrataItem[]>([]);
  const [cohortSearch, setCohortSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'DistinctFetch';

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        console.log("🚀 [useDistinctStrataCohorts] Fetching Cohorts . . . 🪝");
        console.log("🧪 [Hook Params]", {
          cohortSearch,
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
          "Cohort",
          FETCH_TYPE,
          {
            identifier: parentIdentifier,  // PARENT STRATA IDENTIFIER PASSED TO BACKEND AS "identifier" PARAMETER
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: cohortSearch || "",
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

        setCohorts(items);
        setFilteredCohorts(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useDistinctStrataCohorts] Failed to fetch Cohorts:",
          err
        );
      }
    };

    fetchCohorts();
  }, [parentIdentifier, cohortSearch, page, perPage, sortColumn, sortDirection]);

  // Pass Cohorts when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredCohorts(cohorts);
  }, [cohorts]);

  return {
    cohorts,
    skewTotal,
    skewTotalPages,
    filteredCohorts,
    cohortSearch,
    setCohortSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
