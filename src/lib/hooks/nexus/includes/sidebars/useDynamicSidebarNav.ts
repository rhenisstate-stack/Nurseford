"use client";

import { useEffect, useState, useMemo } from "react";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import type { BackendSubject } from "@/lib/data/exam-subjects";

export interface SidebarNavItem {
  id: string | number;
  guidId?: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  href: string;
}

// In-memory cache across sidebar instances so navigation is instant with 0 flicker
const globalSidebarNavCache = new Map<string, SidebarNavItem[]>();

// Fallbacks purged: sidebar items strictly load dynamically from live backend API
const DEFAULT_FALLBACKS: Record<string, SidebarNavItem[]> = {};

function getDashboardPanel(examType: string): string {
  if (examType === "rn-exit") return "rn-nursing";
  if (examType === "lpn-exit") return "lpn-nursing";
  return examType;
}

/**
 * Hook to dynamically load sidebar courses and subjects from the backend / admin dashboard.
 * - Names strictly mirror the admin dashboard (`item.name`).
 * - Order and arrangement strictly follow the admin dashboard (`item.order`).
 * - URLs resolve to `/dashboards/{panel}/exams/{slug}/{id}`.
 */
export function useDynamicSidebarNav(examTypes: string[] = []) {
  const key = useMemo(() => examTypes.join(","), [examTypes]);

  const [itemsByExam, setItemsByExam] = useState<Record<string, SidebarNavItem[]>>(() => {
    const initial: Record<string, SidebarNavItem[]> = {};
    for (const t of examTypes) {
      initial[t] = globalSidebarNavCache.get(t) || DEFAULT_FALLBACKS[t] || [];
    }
    return initial;
  });

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      const updates: Record<string, SidebarNavItem[]> = {};

      await Promise.all(
        examTypes.map(async (t) => {
          try {
            const res = await fetch(`/api/exams/${t}/subjects`, {
              headers: { ...renderSystemSessionHeaders() },
              cache: "no-store",
            });
            if (!res.ok) return;
            const data = await res.json();
            const list: BackendSubject[] = Array.isArray(data?.subjects) ? data.subjects : [];
            if (list.length > 0) {
              const panel = getDashboardPanel(t);
              const mapped: SidebarNavItem[] = list
                .map((s, idx) => {
                  const identifier = s.guidId || s.id;
                  const slug = s.slug || String(identifier);
                  return {
                    id: String(identifier),
                    guidId: s.guidId,
                    name: s.name,
                    slug,
                    description: s.description,
                    order: s.order ?? idx + 1,
                    href: `/dashboards/${panel}/exams/${slug}/${identifier}`,
                  };
                })
                .sort((a, b) => a.order - b.order);

              globalSidebarNavCache.set(t, mapped);
              updates[t] = mapped;
            }
          } catch (err) {
            console.error(`[useDynamicSidebarNav] Failed to load dynamic subjects for ${t}:`, err);
          }
        })
      );

      if (!cancelled && Object.keys(updates).length > 0) {
        setItemsByExam((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return itemsByExam;
}
