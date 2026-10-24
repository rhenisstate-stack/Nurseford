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
  cardNumber?: number;

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

  // Parent info
  parentId?: number;
  parentGuidId?: string;
  parentTableName?: string;
  parentName?: string;

  // Terminal Cluster (resolved parent node)
  terminalClusterId?: string;
  terminalClusterName?: string;

  // Style (from backend, drives card appearance)
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

export const useDistinctDominionSubscriptionItems = ({
  parentTableName,     //  PARENT LEVEL KEY (e.g. "program") — backend maps to strata_programs
  parentName,          //  SEGMENT VALUE (e.g. "Ati-Teas", "Hesi-A2") — differentiates items sharing parentTableName
  parentIdentifier,    //  PARENT STRATA IDENTIFIER (OPTIONAL — omit to fetch all items under parentTableName)
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  parentTableName: string;      // REQUIRED
  parentName?: string;          // OPTIONAL — Segment filter
  parentIdentifier?: string;    // OPTIONAL
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
  const FETCH_TYPE = 'DistinctFetch';

  useEffect(() => {
    const fetchSubscriptionItems = async () => {
      try {
        console.log("🚀 [useDistinctDominionSubscriptionItems] Fetching SubscriptionItems . . . 🪝");
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
            parentTableName,                           // PARENT LEVEL KEY
            ...(parentName ? { parentName } : {}),      // OPTIONAL — Segment filter, only sent when provided
            ...(parentIdentifier ? { identifier: parentIdentifier } : {}), // OPTIONAL — only sent when provided
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
          "❌ [useDistinctDominionSubscriptionItems] Failed to fetch SubscriptionItems:",
          err
        );
      }
    };

    fetchSubscriptionItems();
  }, [parentTableName, parentName, parentIdentifier, subscriptionItemSearch, page, perPage, sortColumn, sortDirection]);

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
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
