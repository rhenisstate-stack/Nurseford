"use client";

import { useEffect, useState } from "react";
import { toSlug } from "@/lib/data/exam-subjects";

export interface PanelCourse {
  id: string;
  name: string;
  slug: string;
  category?: "core" | "exit";
}

const coursesCache = new Map<string, PanelCourse[]>();

export function usePanelCourses(panelSlug: string): {
  courses: PanelCourse[];
  isLoading: boolean;
} {
  const [courses, setCourses] = useState<PanelCourse[]>(() => {
    return coursesCache.get(panelSlug) ?? [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(!coursesCache.has(panelSlug));

  useEffect(() => {
    if (!panelSlug) return;
    let cancelled = false;

    const fetchDynamic = async () => {
      try {
        const res = await fetch(`/api/exams/${panelSlug}/subjects`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const subjects = Array.isArray(data?.subjects) ? data.subjects : [];

        if (!cancelled) {
          const mapped: PanelCourse[] = subjects.map(
            (s: { id: number | string; guidId?: string; name: string; slug?: string }) => {
              const isExit = /exit/i.test(s.name);
              return {
                id: String(s.guidId || s.id),
                name: s.name,
                slug: s.slug || toSlug(s.name),
                category: isExit ? "exit" : "core",
              };
            }
          );

          coursesCache.set(panelSlug, mapped);
          setCourses(mapped);
        }
      } catch (err) {
        console.warn(`[usePanelCourses] Failed to fetch courses for ${panelSlug}:`, err);
        if (!cancelled && !coursesCache.has(panelSlug)) {
          setCourses([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchDynamic();

    return () => {
      cancelled = true;
    };
  }, [panelSlug]);

  return { courses, isLoading };
}
