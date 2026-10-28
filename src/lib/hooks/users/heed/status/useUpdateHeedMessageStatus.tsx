'use client';

import { useCallback, useState } from "react";
import {
  updateSupportMessageClientStatus,
  type ClientReadStatus,
} from "@/lib/services/auth/supportService";

export const HEED_STATUS_EVENT = "heed-status-changed";

export const useUpdateHeedMessageStatus = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (guidIds: string[], status: ClientReadStatus): Promise<boolean> => {
      if (guidIds.length === 0) return true;

      try {
        setIsUpdating(true);
        setError(null);

        const result = await updateSupportMessageClientStatus(guidIds, status);

        if (result?.error || result?.success === false) {
          throw new Error(result.error ?? result.message ?? "Failed to Update Message ⚓");
        }

        window.dispatchEvent(new Event(HEED_STATUS_EVENT)); // everyone refetches
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to Update Message ⚓");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateStatus, isUpdating, error };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────