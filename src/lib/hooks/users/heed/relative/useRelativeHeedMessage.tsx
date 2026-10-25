'use client';

import { useEffect, useState, useCallback } from "react";
import {
  fetchRelativeSupportMessages,
  type ClientReadStatus,
  type SupportMessageItem,
} from "@/lib/services/auth/supportService";
import { HEED_STATUS_EVENT } from "@/lib/hooks/users/heed/status/useUpdateHeedMessageStatus";

export type HeedMessageItem = SupportMessageItem;

export const useRelativeHeedMessage = ({
  items = 20,
  clientStatus = null,
  pollMs = 0,
}: {
  items?: number;
  clientStatus?: ClientReadStatus | null;
  pollMs?: number;   // 0 = no polling
} = {}) => {
  const [messages, setMessages] = useState<HeedMessageItem[]>([]);
  const [messageSearch, setMessageSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(
    async (search: string, isCancelled: () => boolean = () => false, silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }

        const result = await fetchRelativeSupportMessages({
          dynamicItems: items,
          dynamicSearch: search,
          dynamicClientStatus: clientStatus ?? undefined,
        });

        if (isCancelled()) return;

        if (result?.error || result?.success === false) {
          throw new Error(result.error ?? result.message ?? "Failed to Fetch Messages ⚓");
        }

        setMessages(Array.isArray(result?.data) ? result.data : []);
        setError(null);
      } catch (err) {
        if (isCancelled() || silent) return; // background refreshes keep the last good list
        setMessages([]);
        setError(err instanceof Error ? err.message : "Failed to Fetch Messages ⚓");
      } finally {
        if (!silent && !isCancelled()) setIsLoading(false);
      }
    },
    [items, clientStatus]
  );

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    fetchMessages(messageSearch, isCancelled);

    // Any status change anywhere (page, bell, bulk) → refetch from the backend
    const onChange = () => fetchMessages(messageSearch, isCancelled, true);
    window.addEventListener(HEED_STATUS_EVENT, onChange);

    let timer: ReturnType<typeof setInterval> | undefined;
    if (pollMs > 0) {
      timer = setInterval(onChange, pollMs);
      window.addEventListener("focus", onChange);
    }

    return () => {
      cancelled = true;
      window.removeEventListener(HEED_STATUS_EVENT, onChange);
      window.removeEventListener("focus", onChange);
      if (timer) clearInterval(timer);
    };
  }, [messageSearch, fetchMessages, pollMs]);

  const refetch = useCallback(() => fetchMessages(messageSearch), [fetchMessages, messageSearch]);

  return {
    messages,
    messageSearch,
    setMessageSearch,
    isLoading,
    error,
    refetch,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────