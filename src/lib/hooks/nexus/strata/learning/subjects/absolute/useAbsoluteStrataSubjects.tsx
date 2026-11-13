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

  // Parent Course info
  courseId?: number;
  courseGuidId?: string;
  courseName?: string;

  unitsCount?: number;
}

export const useAbsoluteStrataSubjects = ({
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
  const [subjects, setSubjects] = useState<StrataItem[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<StrataItem[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const fetchPerPage = Math.max(perPage, 300);
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
          "Subject",
          FETCH_TYPE,
          {
            dynamicPage: 1,
            dynamicPerPage: fetchPerPage,
            dynamicSearch: subjectSearch || "",
            dynamicSortColumn: sortColumn,
            dynamicSortDirection: sortDirection,
          }
        );

        if (result?.error) {
          throw new Error(result.error);
        }

        const rawItems = result?.data?.items ?? [];
        const allowed = rawItems.filter((s) =>
          isAllowedNursingCourse(
            {
              name: s.courseName || s.name,
              segment: s.segment,
            },
            programScope
          )
        );
        const totalItems = allowed.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, perPage)));
        const start = (Math.max(1, page) - 1) * Math.max(1, perPage);
        const items = allowed.slice(start, start + Math.max(1, perPage));

        setSubjects(items);
        setFilteredSubjects(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);
      } catch (err) {
        console.error(
          "❌ [useAbsoluteStrataSubjects] Failed to fetch Subjects:",
          err
        );
      }
    };

    fetchSubjects();
  }, [subjectSearch, page, perPage, sortColumn, sortDirection, programScope]);

  // Pass Subjects when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredSubjects(subjects);
  }, [subjects]);

  return {
    subjects,
    skewTotal,
    skewTotalPages,
    filteredSubjects,
    subjectSearch,
    setSubjectSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
