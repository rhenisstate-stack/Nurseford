'use client';

import { useEffect, useState, useCallback } from "react";
import { dominionService } from "@/lib/services/nexus/dominion/dominionService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Shared fields present on every provider sub-record (Stripe, Paystack, etc.)
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
interface ProviderSubscriptionCommon {
  subscriptionId: number;
  subscriptionGuidId: string;
  subscriptionStatus: string;
  validFrom: string;
  validUntil?: string | null;
  createdAt: string;
}

export interface UserSubscriptionPackage {
  subscriptionId: number;
  subscriptionGuidId: string;
  subscriptionStatus: string;
  subscriptionHasPaid: string;
  subscriptionAutoRenew: string;
  validFrom: string;
  validUntil?: string | null;
  createdAt: string;
}

export interface SubscriptionProviderPackage {
  providerName: string;
  externalId: string;
  providerStatus?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
  nextBillingOrPeriodEnd?: string | null;
}

export interface StripeSubscriptionPackage extends ProviderSubscriptionCommon {
  guidId: string;
  externalId: string;
  customerId?: string | null;
  priceId?: string | null;
  productId?: string | null;
  status?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialStart?: string | null;
  trialEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  collectionMethod?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
}

export interface PayStackSubscriptionPackage extends ProviderSubscriptionCommon {
  guidId: string;
  externalId: string;
  customerCode?: string | null;
  planCode?: string | null;
  status?: string | null;
  nextPaymentDate?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
}

export interface IntaSendSubscriptionPackage extends ProviderSubscriptionCommon {
  guidId: string;
  externalId: string;
  planId?: string | null;
  customerId?: string | null;
  status?: string | null;
  billingCycleStart?: string | null;
  billingCycleEnd?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
}

export interface FlutterWaveSubscriptionPackage extends ProviderSubscriptionCommon {
  guidId: string;
  externalId: string;
  planId?: string | null;
  customerId?: string | null;
  status?: string | null;
  nextDueDate?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
}

export interface PayPalSubscriptionPackage extends ProviderSubscriptionCommon {
  guidId: string;
  externalId: string;
  planId?: string | null;
  subscriberId?: string | null;
  status?: string | null;
  startTime?: string | null;
  nextBillingTime?: string | null;
  lastPaymentTime?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
}

export interface AppleSubscriptionPackage extends ProviderSubscriptionCommon {
  guidId: string;
  externalId: string;
  originalTransactionId?: string | null;
  productId?: string | null;
  status?: string | null;
  environment?: string | null;
  autoRenewStatus: boolean;
  purchaseDate?: string | null;
  expiresDate?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
}

export interface MpesaSubscriptionPackage extends ProviderSubscriptionCommon {
  guidId: string;
  externalId: string;
  checkoutRequestId?: string | null;
  merchantRequestId?: string | null;
  mpesaReceiptNumber?: string | null;
  phoneNumber?: string | null;
  status?: string | null;
  nextPaymentDate?: string | null;
  currency?: string | null;
  amount?: number | null;
  lastEventType?: string | null;
  lastSyncedAt?: string | null;
}

// Restricted system-user projection (AbsoluteSystemUserResponseDto subset used by Packages)
export interface RestrictedSystemUser {
  success: boolean;
  id: number;
  guidId: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  role?: string | null;
}

// Shape of DynamicSubscriptionItemResponseDto not fully known here — keep loose
// but structured, refine once that DTO's fields are confirmed.
export type SubscriptionItemSummary = Record<string, unknown>;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Mirrors DynamicSubscriptionPackageResponseDto exactly (camelCased by System.Text.Json)
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export interface DiscreteSubscriptionPackage {
  success: boolean;
  notificationType?: string | null;
  message?: string | null;
  redirectUrl?: string | null;
  returnUrl?: string | null;

  id: number;
  guidId: string;
  name: string;
  description?: string | null;
  amount: number;
  currency: string;
  target: string;
  status?: string | null;
  hasPaid?: string | null;
  autoRenew?: string | null;
  type?: string | null;
  plan?: string | null;
  duration?: string | null;
  priceDuration?: string | null;
  isFeatured: boolean;

  terminalClusterId?: string | null;
  terminalClusterName?: string | null;
  terminalClusterGuidId?: string | null;
  terminalClusterTableName?: string | null;

  isAuthenticated: boolean;

  createdAt: string;
  updatedAt?: string | null;

  userSubscriptions: UserSubscriptionPackage[];
  subscriptionProviders: SubscriptionProviderPackage[];

  subscriptionItems: SubscriptionItemSummary[];
  systemUsers: RestrictedSystemUser[];

  stripeSubscriptions: StripeSubscriptionPackage[];
  payStackSubscriptions: PayStackSubscriptionPackage[];
  intaSendSubscriptions: IntaSendSubscriptionPackage[];
  flutterWaveSubscriptions: FlutterWaveSubscriptionPackage[];
  payPalSubscriptions: PayPalSubscriptionPackage[];
  appleSubscriptions: AppleSubscriptionPackage[];
  mPesaSubscriptions: MpesaSubscriptionPackage[]; // note: lowercase "m" — only first char is camelCased
}

export const useDiscreteDominionSubscriptionPackages = ({
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  page?: number;
  perPage?: number;
  sortColumn?: keyof DiscreteSubscriptionPackage | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [subscriptionPackages, setSubscriptionPackages] = useState<DiscreteSubscriptionPackage[]>([]);
  const [filteredSubscriptionPackages, setFilteredSubscriptionPackages] = useState<DiscreteSubscriptionPackage[]>([]);
  const [subscriptionPackageSearch, setSubscriptionPackageSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState<number>(0);
  const [skewTotalPages, setSkewTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const FETCH_TYPE = 'DiscreteFetch';

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchSubscriptionPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🚀 [useDiscreteDominionSubscriptionPackages] Fetching SubscriptionPackages ... 🪝");
        console.log("🧪 [Hook Params]", {
          subscriptionPackageSearch,
          page,
          perPage,
          sortColumn,
          sortDirection,
        });

        const result = await dominionService<{
          items: DiscreteSubscriptionPackage[];
          skewPage: number;
          skewPerPage: number;
          skewTotal: number;
          skewTotalPages: number;
          skewSearch?: string | null;
          skewSortColumn?: string | null;
          skewSortDirection?: string | null;
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

        if (!cancelled) {
          setSubscriptionPackages(items);
          setFilteredSubscriptionPackages(items);
          setSkewTotal(totalItems);
          setSkewTotalPages(totalPages);
        }

      } catch (err) {
        console.error(
          "❌ [useDiscreteDominionSubscriptionPackages] Failed to fetch SubscriptionPackages:",
          err
        );
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch subscriptions");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSubscriptionPackages();

    return () => {
      cancelled = true;
    };
  }, [subscriptionPackageSearch, page, perPage, sortColumn, sortDirection, refreshKey]);

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
    loading,
    error,
    refresh,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
