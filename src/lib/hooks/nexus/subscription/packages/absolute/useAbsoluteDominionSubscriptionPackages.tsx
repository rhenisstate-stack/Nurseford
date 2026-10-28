'use client';

import { useEffect, useState } from "react";
import { dominionService } from "@/lib/services/nexus/dominion/dominionService";

export interface DominionItem {
  id: number;
  guidId: string;

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

  createdAt?: string;
  updatedAt?: string;

  // Parent Program info
  programId?: number;
  programGuidId?: string;
  programName?: string;

  subjectsCount?: number;
}

export const useAbsoluteDominionSubscriptionPackages = ({
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  page?: number;
  perPage?: number;
  sortColumn?: keyof DominionItem | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [subscriptionPackages, setSubscriptionPackages] = useState<DominionItem[]>([]);
  const [filteredSubscriptionPackages, setFilteredSubscriptionPackages] = useState<DominionItem[]>([]);
  const [subscriptionPackageSearch, setSubscriptionPackageSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchSubscriptionPackages = async () => {
      try {
        console.log("🚀 [useAbsoluteDominionSubscriptionPackages] Fetching SubscriptionPackages ... 🪝");
        console.log("🧪 [Hook Params]", {
          subscriptionPackageSearch,
          page,
          perPage,
          sortColumn,
          sortDirection,
        });

        const result = await dominionService<{
          items: DominionItem[];
          skewPage: number;
          skewPerPage: number;
          skewTotal: number;
          skewTotalPages: number;
          skewSearch?: string | null;
          skewSort?: string | null;
          skewColumnSort?: string | null;
        }>(
          "SubscriptionPackage",
          FETCH_TYPE,
          {
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: subscriptionPackageSearch || "",
            dynamicSortColumn: sortColumn,
            dynamicSortDirection: sortDirection,
          }
        );

        console.log("📥 Raw result:", result);
        console.log("📦 result.data:", result?.data);

        if (result?.error) {
          throw new Error(result.error);
        }

        const items = result?.data?.items ?? [];
        const totalItems = result?.data?.skewTotal ?? 0;
        const totalPages = result?.data?.skewTotalPages ?? 1;

        setSubscriptionPackages(items);
        setFilteredSubscriptionPackages(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useAbsoluteDominionSubscriptionPackages] Failed to fetch SubscriptionPackages:",
          err
        );
      }
    };

    fetchSubscriptionPackages();
  }, [subscriptionPackageSearch, page, perPage, sortColumn, sortDirection]);

  // Pass SubscriptionPackages when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredSubscriptionPackages(subscriptionPackages);
  }, [subscriptionPackages]);

  return {
    subscriptionPackages,
    skewTotal,
    skewTotalPages,
    filteredSubscriptionPackages,
    subscriptionPackageSearch,
    setSubscriptionPackageSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
