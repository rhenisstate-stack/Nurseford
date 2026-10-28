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

  // Parent Program info
  programId?: number;
  programGuidId?: string;
  programName?: string;

  subjectsCount?: number;
}

export const useDistinctStrataCourses = ({
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
  const [courses, setCourses] = useState<StrataItem[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<StrataItem[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'DistinctFetch';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("🚀 [useDistinctStrataCourses] Fetching Courses . . . 🪝");
        console.log("🧪 [Hook Params]", {
          courseSearch,
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
          "Course",
          FETCH_TYPE,
          {
            identifier: parentIdentifier,  // PARENT STRATA IDENTIFIER PASSED TO BACKEND AS "identifier" PARAMETER
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: courseSearch || "",
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

        setCourses(items);
        setFilteredCourses(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useDistinctStrataCourses] Failed to fetch Courses:",
          err
        );
      }
    };

    fetchCourses();
  }, [parentIdentifier, courseSearch, page, perPage, sortColumn, sortDirection]);

  // Pass Courses when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  return {
    courses,
    skewTotal,
    skewTotalPages,
    filteredCourses,
    courseSearch,
    setCourseSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
