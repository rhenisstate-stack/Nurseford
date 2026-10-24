'use client';

import { useEffect, useState, useCallback } from "react";
import { dominionService } from "@/lib/services/nexus/dominion/dominionService";

export interface DominionItem {
  id: number;
  guid_id: string;

  programId: number;

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
}

export const useRelativeDominionSubscriptionPackages = () => {
  const [subscriptionPackages, setSubscriptionPackages] = useState<DominionItem[]>([]);
  const [filteredSubscriptionPackages, setFilteredSubscriptionPackages] = useState<DominionItem[]>([]);
  const [subscriptionPackageSearch, setSubscriptionPackageSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchSubscriptionPackages = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeDominionSubscriptionPackages] Fetching SubscriptionPackages with search: "${search}"`);

      // Pass Search To Backend
      const result = await dominionService<DominionItem[]>(
        "SubscriptionPackage",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeDominionSubscriptionPackages] Raw result:", result);
      console.log("📦 [useRelativeDominionSubscriptionPackages] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeDominionSubscriptionPackages] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeDominionSubscriptionPackages] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setSubscriptionPackages(data);
      setFilteredSubscriptionPackages(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeDominionSubscriptionPackages] Failed to fetch SubscriptionPackages:", err);
      setSubscriptionPackages([]);
      setFilteredSubscriptionPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch SubscriptionPackages when search changes
  useEffect(() => {
    fetchSubscriptionPackages(subscriptionPackageSearch);
  }, [subscriptionPackageSearch, fetchSubscriptionPackages]);

  // Filter SubscriptionPackages when search changes
  useEffect(() => {
    const filtered = subscriptionPackages
      .filter(subscriptionPackage =>
        subscriptionPackage.name?.toLowerCase().includes(subscriptionPackageSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeDominionSubscriptionPackages] Filtered ${filtered.length} SubscriptionPackages for search: "${subscriptionPackageSearch}"`
    );

    setFilteredSubscriptionPackages(filtered);
  }, [subscriptionPackageSearch, subscriptionPackages]);

  return {
    subscriptionPackages,
    filteredSubscriptionPackages,
    subscriptionPackageSearch,
    setSubscriptionPackageSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
