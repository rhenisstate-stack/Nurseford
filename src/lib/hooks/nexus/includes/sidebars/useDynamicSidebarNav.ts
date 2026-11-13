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

// Guaranteed fallback items so the sidebar is never empty before the first fetch
const DEFAULT_FALLBACKS: Record<string, SidebarNavItem[]> = {
  "nclex-rn": [
    { id: "c05ca275-d7a1-402a-958f-642db853f2df", name: "NCLEX-RN Practice Exams", slug: "nclex-rn-practice-exams", order: 1, href: "/dashboards/nclex-rn/exams/nclex-rn-practice-exams/c05ca275-d7a1-402a-958f-642db853f2df" },
    { id: "243a4f96-c974-4150-9cb5-c46c14723850", name: "NCLEX-RN Readiness Assessment", slug: "nclex-rn-readiness-assessment-tests", order: 2, href: "/dashboards/nclex-rn/exams/nclex-rn-readiness-assessment-tests/243a4f96-c974-4150-9cb5-c46c14723850" },
    { id: "8ceb8bea-c04b-4a55-94ba-5d6368bdcaaa", name: "NCLEX-RN Standalone Exams", slug: "nclex-rn-standalone-exams", order: 3, href: "/dashboards/nclex-rn/exams/nclex-rn-standalone-exams/8ceb8bea-c04b-4a55-94ba-5d6368bdcaaa" },
  ],
  "nclex-pn": [
    { id: "1cb41630-1203-42ae-8844-92afa60eea9b", name: "NCLEX-PN Practice Exams", slug: "nclex-pn-practice-exams", order: 1, href: "/dashboards/nclex-pn/exams/nclex-pn-practice-exams/1cb41630-1203-42ae-8844-92afa60eea9b" },
    { id: "176de88a-d9de-48d3-a76f-24f1e71f016c", name: "NCLEX-PN Readiness Assessment", slug: "nclex-pn-readiness-assessment-tests", order: 2, href: "/dashboards/nclex-pn/exams/nclex-pn-readiness-assessment-tests/176de88a-d9de-48d3-a76f-24f1e71f016c" },
    { id: "3f25e1cf-dc97-4c77-a8be-1c2472dae993", name: "NCLEX-PN Standalone Exams", slug: "nclex-pn-standalone-exams", order: 3, href: "/dashboards/nclex-pn/exams/nclex-pn-standalone-exams/3f25e1cf-dc97-4c77-a8be-1c2472dae993" },
  ],
  "rn-nursing": [
    { id: "34", name: "ATI Exam (RN)", slug: "ati-exams-rn", order: 1, href: "/dashboards/rn-nursing/exams/ati-exams-rn/34" },
    { id: "35", name: "EXAMPLIFY Practice", slug: "examplify-practice-rn", order: 2, href: "/dashboards/rn-nursing/exams/examplify-practice-rn/35" },
    { id: "38", name: "GENERAL Exams", slug: "general-exams", order: 3, href: "/dashboards/rn-nursing/exams/general-exams/38" },
    { id: "39", name: "HESI EXAM (RN)", slug: "hesi-exams-rn", order: 4, href: "/dashboards/rn-nursing/exams/hesi-exams-rn/39" },
  ],
  "rn-exit": [
    { id: "36", name: "EXIT ATI Exams-RN", slug: "exit-ati-exams-rn", order: 1, href: "/dashboards/rn-nursing/exams/exit-ati-exams-rn/36" },
    { id: "37", name: "EXIT HESI Exams-RN", slug: "exit-hesi-exams-rn", order: 2, href: "/dashboards/rn-nursing/exams/exit-hesi-exams-rn/37" },
  ],
  "lpn-nursing": [
    { id: "21", name: "ATI Exams (LPN)", slug: "ati-exams-lpn", order: 1, href: "/dashboards/lpn-nursing/exams/ati-exams-lpn/21" },
    { id: "22", name: "EXAMPLIFY Practice (PN)", slug: "examplify-practice-pn", order: 2, href: "/dashboards/lpn-nursing/exams/examplify-practice-pn/22" },
    { id: "25", name: "HESI Exams (LPN)", slug: "hesi-exams-lpn", order: 3, href: "/dashboards/lpn-nursing/exams/hesi-exams-lpn/25" },
    { id: "26", name: "KAPLAN EXAMS", slug: "kaplan-exams", order: 4, href: "/dashboards/lpn-nursing/exams/kaplan-exams/26" },
  ],
  "lpn-exit": [
    { id: "23", name: "EXIT ATI Exams-LPN", slug: "exit-ati-exams-lpn", order: 1, href: "/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23" },
    { id: "24", name: "EXIT HESI Exams-LPN", slug: "exit-hesi-exams-lpn", order: 2, href: "/dashboards/lpn-nursing/exams/exit-hesi-exams-lpn/24" },
  ],
  "ati-teas": [
    { id: "5", name: "Comprehensive TEAS 7 Prep", slug: "comprehensive-ati-teas-tests", order: 1, href: "/dashboards/ati-teas/exams/comprehensive-ati-teas-tests/5" },
    { id: "6", name: "English", slug: "english", order: 2, href: "/dashboards/ati-teas/exams/english/6" },
    { id: "7", name: "Math", slug: "math", order: 3, href: "/dashboards/ati-teas/exams/math/7" },
    { id: "8", name: "Reading Comprehension", slug: "reading-comprehension", order: 4, href: "/dashboards/ati-teas/exams/reading-comprehension/8" },
    { id: "9", name: "Science", slug: "science", order: 5, href: "/dashboards/ati-teas/exams/science/9" },
  ],
  "hesi-a2": [
    { id: "16", name: "Comprehensive HESI A2", slug: "comprehensive-hesi-a2-exams", order: 1, href: "/dashboards/hesi-a2/exams/comprehensive-hesi-a2-exams/16" },
    { id: "19", name: "Reading Comprehension", slug: "reading-comprehension", order: 2, href: "/dashboards/hesi-a2/exams/reading-comprehension/19" },
    { id: "15", name: "Biology", slug: "biology", order: 3, href: "/dashboards/hesi-a2/exams/biology/15" },
    { id: "18", name: "Math", slug: "math", order: 4, href: "/dashboards/hesi-a2/exams/math/18" },
    { id: "17", name: "Grammar", slug: "grammar", order: 5, href: "/dashboards/hesi-a2/exams/grammar/17" },
    { id: "20", name: "Vocabularies", slug: "vocabularies", order: 6, href: "/dashboards/hesi-a2/exams/vocabularies/20" },
    { id: "14", name: "Anatomy & Physiology", slug: "anatomy-physiology", order: 7, href: "/dashboards/hesi-a2/exams/anatomy-physiology/14" },
  ],
};

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
