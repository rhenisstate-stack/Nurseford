"use client";

import { useEffect, useState } from "react";

// In-memory store of schools for the current context (subject, course, or program)
let currentSchools: string[] = [];
const schoolListeners = new Set<(schools: string[]) => void>();

export function setAvailableSchools(schools: string[]) {
  currentSchools = schools;
  schoolListeners.forEach((fn) => fn(schools));
}

let cachedDynamicSchools: string[] | null = null;

export function useNursingSchools(panelSlug?: string): {
  schools: string[];
  isLoading: boolean;
} {
  const [schools, setSchools] = useState<string[]>(() => currentSchools);
  const [isLoading, setIsLoading] = useState<boolean>(() => currentSchools.length === 0);

  useEffect(() => {
    let cancelled = false;

    // 1. Subscribe to reactive changes pushed by active exam / subject page
    const onUpdate = (newSchools: string[]) => {
      setSchools(newSchools);
      setIsLoading(false);
    };
    schoolListeners.add(onUpdate);

    // 2. Listen to window event dispatched by exam hierarchy / course pages
    const handleAvailableSchoolsUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ schools: string[] }>;
      if (Array.isArray(custom.detail?.schools)) {
        setAvailableSchools(custom.detail.schools);
      }
    };

    window.addEventListener(
      "nurseford-available-schools-update",
      handleAvailableSchoolsUpdate
    );

    // 3. Ask active page if it already has schools ready
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("nurseford-request-available-schools")
      );
    }

    // 4. If currentSchools is empty and not cached, fetch dynamic schools list from backend
    if (currentSchools.length === 0) {
      if (cachedDynamicSchools && cachedDynamicSchools.length > 0) {
        setSchools(cachedDynamicSchools);
        setIsLoading(false);
      } else {
        const fetchDynamicSchools = async () => {
          try {
            const res = await fetch("/api/nexus/strata/institution/school?fetchtype=absolute");
            if (!res.ok) throw new Error("fetch failed");
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.schools)
                  ? data.schools
                  : [];

            const extracted = list
              .map((item: any) =>
                typeof item === "string"
                  ? item.trim()
                  : (item?.name || item?.schoolName || item?.title || "").trim()
              )
              .filter(Boolean)
              .sort((a: string, b: string) => a.localeCompare(b));

            if (!cancelled && extracted.length > 0) {
              cachedDynamicSchools = extracted;
              if (currentSchools.length === 0) {
                setSchools(extracted);
              }
            }
          } catch (err) {
            console.warn("[useNursingSchools] Dynamic schools fetch failed:", err);
          } finally {
            if (!cancelled) setIsLoading(false);
          }
        };

        fetchDynamicSchools();
      }
    }

    return () => {
      cancelled = true;
      schoolListeners.delete(onUpdate);
      window.removeEventListener(
        "nurseford-available-schools-update",
        handleAvailableSchoolsUpdate
      );
    };
  }, [panelSlug]);

  return { schools, isLoading };
}
