"use client";

import { strataService } from "@/lib/services/nexus/strata/strataService";
import {
  isAllowedNursingProgram,
  type NursingProgramScope,
} from "./nursingProgramScope";

export interface ScopedProgramItem {
  id: number;
  guidId: string;
  name?: string;
  programName?: string;
  segment?: string;
  coursesCount?: number;
}

export interface ScopedExamItemBase {
  id: number;
  guidId?: string;
  programId?: number;
  programGuidId?: string;
  programName?: string;
}

interface ProgramListPayload {
  items?: ScopedProgramItem[];
  Items?: ScopedProgramItem[];
  results?: ScopedProgramItem[];
  Results?: ScopedProgramItem[];
}

interface ExamListPayload<T> {
  items?: T[];
  Items?: T[];
  results?: T[];
  Results?: T[];
  skewTotal?: number;
  SkewTotal?: number;
  totalResults?: number;
  total?: number;
  skewTotalPages?: number;
  SkewTotalPages?: number;
  totalPages?: number;
}

const PROGRAM_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedAllPrograms: { items: ScopedProgramItem[]; ts: number } | null = null;
let inflightProgramsPromise: Promise<ScopedProgramItem[]> | null = null;

function extractList<T>(res: unknown): T[] {
  const r = res as { data?: T[] | Record<string, unknown>; items?: T[] } | null | undefined;
  const data = r?.data ?? (r as Record<string, unknown> | null);
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  const found = [d.items, d.Items, d.results, d.Results, r?.items].find((c) =>
    Array.isArray(c)
  );
  return (found as T[] | undefined) ?? [];
}

export function clearAllowedProgramsCache() {
  cachedAllPrograms = null;
  inflightProgramsPromise = null;
}

/**
 * Fetches backend programs once (with inflight deduplication & 5-min in-memory cache)
 * and filters strictly to RN Nursing, LPN Nursing, and Exit Exam programs.
 */
export async function fetchAllowedNursingPrograms(
  scope: NursingProgramScope = "all"
): Promise<ScopedProgramItem[]> {
  if (
    cachedAllPrograms &&
    Date.now() - cachedAllPrograms.ts < PROGRAM_CACHE_TTL_MS
  ) {
    return cachedAllPrograms.items.filter((p) =>
      isAllowedNursingProgram(p, scope)
    );
  }

  if (!inflightProgramsPromise) {
    inflightProgramsPromise = (async () => {
      try {
        let res = await strataService<ScopedProgramItem[] | ProgramListPayload>(
          "Program",
          "RelativeFetch",
          { limit: 50 }
        );
        let items = extractList<ScopedProgramItem>(res);

        if (items.length === 0 || res?.error) {
          res = await strataService<ProgramListPayload>(
            "Program",
            "AbsoluteFetch",
            { dynamicPage: 1, dynamicPerPage: 100 }
          );
          items = extractList<ScopedProgramItem>(res);
        }

        if (items.length > 0) {
          cachedAllPrograms = { items, ts: Date.now() };
        }
        return items;
      } catch {
        return [];
      } finally {
        inflightProgramsPromise = null;
      }
    })();
  }

  const allPrograms = await inflightProgramsPromise;
  return allPrograms.filter((p) => isAllowedNursingProgram(p, scope));
}

export async function fetchScopedNominalExams<T extends ScopedExamItemBase>({
  scope = "all",
  page = 1,
  perPage = 20,
  search = "",
  sortColumn = "id",
  sortDirection = "desc",
  sliceMerged = true,
}: {
  scope?: NursingProgramScope;
  page?: number;
  perPage?: number;
  search?: string;
  sortColumn?: keyof T | null;
  sortDirection?: "asc" | "desc";
  sliceMerged?: boolean;
}): Promise<{ items: T[]; totalItems: number; totalPages: number }> {
  const programs = await fetchAllowedNursingPrograms(scope);
  if (programs.length === 0) {
    return { items: [], totalItems: 0, totalPages: 1 };
  }

  const cleanPage = Math.max(1, page);
  const cleanPerPage = Math.max(1, perPage);
  const trimmedSearch = search.trim();
  const effectiveCol = sortColumn ?? ("id" as keyof T);

  const responses = await Promise.all(
    programs.map(async (prog) => {
      const progId = String(prog.guidId || prog.id || "").trim();
      if (!progId) return null;
      try {
        const res = await strataService<ExamListPayload<T> | T[]>(
          "Exam",
          "NominalFetch",
          {
            identifier: progId,
            dynamicPage: cleanPage,
            dynamicPerPage: cleanPerPage,
            dynamicSearch: trimmedSearch,
            dynamicSortColumn: String(effectiveCol),
            dynamicSortDirection: sortDirection ?? "desc",
            dynamicLearningStrataName: "program",
          }
        );
        return { prog, res };
      } catch {
        return null;
      }
    })
  );

  const merged: T[] = [];
  const seen = new Set<string>();
  let totalSkewSum = 0;
  let allReturnedPartialPage = true;

  for (const entry of responses) {
    if (!entry || (entry.res?.error && !entry.res?.data)) continue;
    const rawItems = extractList<T>(entry.res);
    const dataObj =
      entry.res?.data && !Array.isArray(entry.res.data)
        ? (entry.res.data as ExamListPayload<T>)
        : {};
    const progTotal =
      dataObj.skewTotal ??
      dataObj.SkewTotal ??
      dataObj.totalResults ??
      dataObj.total ??
      rawItems.length;

    totalSkewSum += progTotal;
    if (rawItems.length >= cleanPerPage) {
      allReturnedPartialPage = false;
    }

    for (const item of rawItems) {
      const key = String(item.guidId || item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({
        ...item,
        programId: item.programId ?? entry.prog.id,
        programGuidId: item.programGuidId ?? entry.prog.guidId,
        programName: item.programName ?? entry.prog.name,
      });
    }
  }

  merged.sort((a, b) => {
    if (effectiveCol === "id") {
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return sortDirection === "asc" ? idA - idB : idB - idA;
    }
    const valA = a[effectiveCol];
    const valB = b[effectiveCol];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }
    const strA = String(valA ?? "");
    const strB = String(valB ?? "");
    return sortDirection === "asc"
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });

  // Backend NominalFetch does not always narrow skewTotal on dynamicSearch;
  // when all queried program pages are partial (< perPage), derive exact count.
  const totalItems =
    trimmedSearch && allReturnedPartialPage
      ? (cleanPage - 1) * cleanPerPage + merged.length
      : totalSkewSum;
  const totalPages = Math.max(1, Math.ceil(totalItems / cleanPerPage));

  const items =
    sliceMerged && responses.length > 1
      ? merged.slice(0, cleanPerPage)
      : merged;

  return { items, totalItems, totalPages };
}
