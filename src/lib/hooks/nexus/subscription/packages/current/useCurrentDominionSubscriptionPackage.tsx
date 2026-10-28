'use client';

import { useEffect, useState } from "react";
import { dominionService } from "@/lib/services/nexus/dominion/dominionService";

export interface DominionItem {
  id: number;
  guidId: string;

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

  createdAt?: string;
  updatedAt?: string;
}

export const useCurrentDominionSubscriptionPackage = (identifier: string | null) => {

  const [subscriptionPackage, setSubscriptionPackage] = useState<DominionItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const FETCH_TYPE = 'CurrentFetch';

  useEffect(() => {
    if (!identifier) {
      setError("No identifier Provided ⚓");
      return;
    }

    const fetchSubscriptionPackage = async () => {
      try {
        const result = await dominionService<DominionItem>(
          "SubscriptionPackage",
          FETCH_TYPE,
          { identifier }
        );

        if (result?.error) {
          throw new Error(result.error);
        }

        setSubscriptionPackage(result?.data ?? null);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } 
    };

    fetchSubscriptionPackage();
  }, [identifier]);

  return {
    subscriptionPackage,
    error,
  };

};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
