'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guidId: string;

  categoryId: number;

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

  isFeatured?: boolean;
  language?: string;

  createdAt?: string;
  updatedAt?: string;

  domainsCount?: number;
}

export const useCurrentStrataSubCategory = (identifier: string | null) => {

  const [subcategory, setSubCategory] = useState<StrataItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const FETCH_TYPE = 'CurrentFetch';

  useEffect(() => {
    if (!identifier) {
      setError("No identifier Provided ⚓");
      return;
    }

    const fetchSubCategory = async () => {
      try {
        const result = await strataService<StrataItem>(
          "SubCategory",
          FETCH_TYPE,
          { identifier }
        );

        if (result?.error) {
          throw new Error(result.error);
        }

        setSubCategory(result?.data ?? null);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } 
    };

    fetchSubCategory();
  }, [identifier]);

  return {
    subcategory,
    error,
  };

};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
