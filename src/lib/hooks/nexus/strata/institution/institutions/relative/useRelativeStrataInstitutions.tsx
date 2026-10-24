'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  domainId: number;

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

  created_at?: string;
  updated_at?: string;

  schoolsCount?: number;
}

export const useRelativeStrataInstitutions = () => {
  const [institutions, setInstitutions] = useState<StrataItem[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<StrataItem[]>([]);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchInstitutions = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataInstitutions] Fetching Institutions with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Institution",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataInstitutions] Raw result:", result);
      console.log("📦 [useRelativeStrataInstitutions] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataInstitutions] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataInstitutions] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setInstitutions(data);
      setFilteredInstitutions(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataInstitutions] Failed to fetch Institutions:", err);
      setInstitutions([]);
      setFilteredInstitutions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Institutions when search changes
  useEffect(() => {
    fetchInstitutions(institutionSearch);
  }, [institutionSearch, fetchInstitutions]);

  // Filter Institutions when search changes
  useEffect(() => {
    const filtered = institutions
      .filter(institution =>
        institution.name?.toLowerCase().includes(institutionSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataInstitutions] Filtered ${filtered.length} Institutions for search: "${institutionSearch}"`
    );

    setFilteredInstitutions(filtered);
  }, [institutionSearch, institutions]);

  return {
    institutions,
    filteredInstitutions,
    institutionSearch,
    setInstitutionSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
