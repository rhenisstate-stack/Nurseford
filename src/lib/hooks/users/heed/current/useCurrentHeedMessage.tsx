'use client';

import { useCallback, useEffect, useState } from "react";
import {
  fetchCurrentSupportMessage,
  type SupportMessageItem,
} from "@/lib/services/auth/supportService";
import { HEED_STATUS_EVENT } from "@/lib/hooks/users/heed/status/useUpdateHeedMessageStatus";

export type HeedMessageItem = SupportMessageItem;

export const useCurrentHeedMessage = (identifier: string | null) => {
  const [message, setMessage] = useState<HeedMessageItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isCancelled: () => boolean = () => false, silent = false) => {
      if (!identifier) return;

      try {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }

        const result = await fetchCurrentSupportMessage({ identifier });

        if (isCancelled()) return;

        if (result?.error || result?.success === false) {
          throw new Error(result.error ?? result.message ?? "Failed to Fetch Message ⚓");
        }

        setMessage(result?.data ?? null);
        setError(null);
      } catch (err) {
        if (isCancelled() || silent) return;
        setMessage(null);
        setError(err instanceof Error ? err.message : "Failed to Fetch Message ⚓");
      } finally {
        if (!silent && !isCancelled()) setIsLoading(false);
      }
    },
    [identifier]
  );

  useEffect(() => {
    if (!identifier) {
      setMessage(null);
      setError("No identifier Provided ⚓");
      return;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;

    load(isCancelled);

    const onChange = () => load(isCancelled, true);
    window.addEventListener(HEED_STATUS_EVENT, onChange);

    return () => {
      cancelled = true;
      window.removeEventListener(HEED_STATUS_EVENT, onChange);
    };
  }, [identifier, load]);

  return { message, isLoading, error };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────