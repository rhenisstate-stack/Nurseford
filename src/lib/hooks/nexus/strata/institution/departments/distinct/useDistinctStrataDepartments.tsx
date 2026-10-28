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

  // Parent School info
  schoolId?: number;
  schoolGuidId?: string;
  schoolName?: string;

  divisionsCount?: number;
}

export const useDistinctStrataDepartments = ({
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
  const [departments, setDepartments] = useState<StrataItem[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<StrataItem[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'DistinctFetch';

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        console.log("🚀 [useDistinctStrataDepartments] Fetching Departments . . . 🪝");
        console.log("🧪 [Hook Params]", {
          departmentSearch,
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
          "Department",
          FETCH_TYPE,
          {
            identifier: parentIdentifier,  // PARENT STRATA IDENTIFIER PASSED TO BACKEND AS "identifier" PARAMETER
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: departmentSearch || "",
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

        setDepartments(items);
        setFilteredDepartments(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useDistinctStrataDepartments] Failed to fetch Departments:",
          err
        );
      }
    };

    fetchDepartments();
  }, [parentIdentifier, departmentSearch, page, perPage, sortColumn, sortDirection]);

  // Pass Departments when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredDepartments(departments);
  }, [departments]);

  return {
    departments,
    skewTotal,
    skewTotalPages,
    filteredDepartments,
    departmentSearch,
    setDepartmentSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
