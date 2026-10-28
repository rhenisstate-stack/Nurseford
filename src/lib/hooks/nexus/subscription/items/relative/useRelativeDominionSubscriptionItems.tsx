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

export const useRelativeDominionSubscriptionItems = () => {
  const [subscriptionItems, setSubscriptionItems] = useState<DominionItem[]>([]);
  const [filteredSubscriptionItems, setFilteredSubscriptionItems] = useState<DominionItem[]>([]);
  const [subscriptionItemSearch, setSubscriptionItemSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const FETCH_TYPE = 'RelativeFetch';

  // useCallback at top level
  const fetchSubscriptionItems = useCallback(async (search: string) => {
    try {
      setIsLoading(true);
      console.log(`🚀 [useRelativeDominionSubscriptionItems] Fetching SubscriptionItems with search: "${search}"`);

      // Pass Search To Backend
      const result = await dominionService<DominionItem[]>(
        "SubscriptionItem",
        FETCH_TYPE,
        search
          ? { dynamicSearch: search, limit: 20 }
          : { limit: 20 }
      );

      console.log("📥 [useRelativeDominionSubscriptionItems] Raw result:", result);
      console.log("📦 [useRelativeDominionSubscriptionItems] result.data:", result?.data);
      console.log(
        "🔢 [useRelativeDominionSubscriptionItems] Count:",
        Array.isArray(result?.data) ? result.data.length : "Not an array"
      );

      if (Array.isArray(result?.data)) {
        console.log(
          "🧪 [useRelativeDominionSubscriptionItems] First 3 items:",
          result.data.slice(0, 3)
        );
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const data = result?.data ?? [];

      setSubscriptionItems(data);
      setFilteredSubscriptionItems(data.slice(0, 20));

    } catch (err) {
      console.error("❌ [useRelativeDominionSubscriptionItems] Failed to fetch SubscriptionItems:", err);
      setSubscriptionItems([]);
      setFilteredSubscriptionItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch SubscriptionItems when search changes
  useEffect(() => {
    fetchSubscriptionItems(subscriptionItemSearch);
  }, [subscriptionItemSearch, fetchSubscriptionItems]);

  // Filter SubscriptionItems when search changes
  useEffect(() => {
    const filtered = subscriptionItems
      .filter(subscriptionItem =>
        subscriptionItem.name?.toLowerCase().includes(subscriptionItemSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useRelativeDominionSubscriptionItems] Filtered ${filtered.length} SubscriptionItems for search: "${subscriptionItemSearch}"`
    );

    setFilteredSubscriptionItems(filtered);
  }, [subscriptionItemSearch, subscriptionItems]);

  return {
    subscriptionItems,
    filteredSubscriptionItems,
    subscriptionItemSearch,
    setSubscriptionItemSearch,
    isLoading,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
