'use client';

import { useEffect, useState, useCallback } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

// Child Strata Counts
export interface StrataCounts {
  institutions: number;
  assessments: number;
  programs: number;
}

export interface StrataItem {
  id: number;
  guid_id: string;

  subCategoryId: number;

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

  is_featured?: boolean;
  language?: string;

  created_at?: string;
  updated_at?: string;

  strataCounts?: StrataCounts;
}

export const useRelativeStrataDomains = () => {
  const [domains, setDomains] = useState<StrataItem[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<StrataItem[]>([]);
  const [domainSearch, setDomainSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchDomains = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeStrataDomains] Fetching domains with search: "${search}"`);

      // Pass Search To Backend
      const result = await strataService<StrataItem[]>(
        "Domain",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeStrataDomains] Raw result:", result);
      console.log("📦 [useRelativeStrataDomains] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeStrataDomains] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeStrataDomains] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setDomains(data);
      setFilteredDomains(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeStrataDomains] Failed to fetch domains:", err);
      setDomains([]);
      setFilteredDomains([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch domains when search changes
  useEffect(() => {
    fetchDomains(domainSearch);
  }, [domainSearch, fetchDomains]);

  // Filter domains when search changes
  useEffect(() => {
    const filtered = domains
      .filter(domain =>
        domain.name?.toLowerCase().includes(domainSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeStrataDomains] Filtered ${filtered.length} domains for search: "${domainSearch}"`
    );

    setFilteredDomains(filtered);
  }, [domainSearch, domains]);

  return {
    domains,
    filteredDomains,
    domainSearch,
    setDomainSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
