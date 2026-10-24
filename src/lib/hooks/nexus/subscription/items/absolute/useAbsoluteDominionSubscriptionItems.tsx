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

  // Pricing
  amount?: number;
  currency?: string;
  currencySymbol?: string;
  quantity?: number;
  exchangeRate?: number;
  planPrice?: number;
  priceDuration?: string;
  duration?: string;
  locale?: string;
  plan?: string;
  features?: string;
  metaDescription?: string;

  // Parent Program info
  programId?: number;
  programGuidId?: string;
  programName?: string;

  subjectsCount?: number;

  style?: {
    id?: number;
    guidId?: string;
    badgeName?: string;
    badgeBackground?: string;
    badgeColor?: string;
    badgeFontSize?: string;
    titleBackground?: string;
    titleColor?: string;
    titleFontSize?: string;
    descriptionColor?: string;
    descriptionFontSize?: string;
    bodyGradientDirection?: string;
    bodyGradientStart?: string;
    bodyGradientEnd?: string;
    bodyFontSize?: string;
    footerButtonBackground?: string;
    footerButtonColor?: string;
    footerButtonFontSize?: string;
    footerButtonText?: string;
    visibility?: boolean;
    metadata?: string;
  };
}

export const useAbsoluteDominionSubscriptionItems = ({
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
  const [subscriptionItems, setSubscriptionItems] = useState<DominionItem[]>([]);
  const [filteredSubscriptionItems, setFilteredSubscriptionItems] = useState<DominionItem[]>([]);
  const [subscriptionItemSearch, setSubscriptionItemSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const FETCH_TYPE = 'AbsoluteFetch';

  useEffect(() => {
    const fetchSubscriptionItems = async () => {
      try {
        console.log("🚀 [useAbsoluteDominionSubscriptionItems] Fetching SubscriptionItems ... 🪝");
        console.log("🧪 [Hook Params]", {
          subscriptionItemSearch,
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
          "SubscriptionItem",
          FETCH_TYPE,
          {
            dynamicPage: page,
            dynamicPerPage: perPage,
            dynamicSearch: subscriptionItemSearch || "",
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

        setSubscriptionItems(items);
        setFilteredSubscriptionItems(items);
        setSkewTotal(totalItems);
        setSkewTotalPages(totalPages);

      } catch (err) {
        console.error(
          "❌ [useAbsoluteDominionSubscriptionItems] Failed to fetch SubscriptionItems:",
          err
        );
      }
    };

    fetchSubscriptionItems();
  }, [subscriptionItemSearch, page, perPage, sortColumn, sortDirection]);

  // Pass SubscriptionItems when search changes [ Frontend is just to display !]
  useEffect(() => {
    setFilteredSubscriptionItems(subscriptionItems);
  }, [subscriptionItems]);

  return {
    subscriptionItems,
    skewTotal,
    skewTotalPages,
    filteredSubscriptionItems,
    subscriptionItemSearch,
    setSubscriptionItemSearch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
