'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import {
  isAllowedNursingCourse,
  type NursingProgramScope,
} from "@/lib/utils/exams/nursingProgramScope";

export interface StrataItem {
  id: number;
  guidId: string;

  name: string;
  description?: string;

  target?: string;
  type?: string;
  accessType?: string;
  code?: string;
  status?: string;

  segment?: string;
  fragment?: string;
  link?: string;

  rating?: number;
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

export const useAbsoluteStrataCourses = ({
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
  programScope = "all",
}: {
  page?: number;
  perPage?: number;
  sortColumn?: keyof StrataItem | null;
  sortDirection?: "asc" | "desc";
  programScope?: NursingProgramScope;
}) => {
  const [courses, setCourses] = useState<StrataItem[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<StrataItem[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchPerPage = Math.max(perPage, 100);
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
            dynamicPage: 1,
            dynamicPerPage: fetchPerPage,
            dynamicSearch: courseSearch || "",
            dynamicSortColumn: sortColumn,
            dynamicSortDirection: sortDirection,
          }
        );

        if (result?.error) {
          throw new Error(result.error);
        }

        const rawItems = result?.data?.items ?? [];
        const allowed = rawItems.filter((c) =>
          isAllowedNursingCourse(c, programScope)
        );
        const totalItems = allowed.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, perPage)));
        const start = (Math.max(1, page) - 1) * Math.max(1, perPage);
        const items = allowed.slice(start, start + Math.max(1, perPage));

        setCourses(items);
        setFilteredCourses(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);
      } catch (err) {
        console.error(
          "❌ [useAbsoluteStrataCourses] Failed to fetch Courses:",
          err
        );
      }
    };

    fetchCourses();
  }, [courseSearch, page, perPage, sortColumn, sortDirection, programScope]);

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
