'use client';

import { useEffect, useState } from "react";
import {
  fetchDistinctSupportMessages,
  type SupportMessageItem,
  type SupportMessagePage,
} from "@/lib/services/auth/supportService";

export type HeedMessageItem = SupportMessageItem;

export const useDistinctHeedMessage = ({
  parentIdentifier,   // PARENT MESSAGE GUID — REQUIRED (backend validates it as a GUID)
  page = 1,
  perPage = 20,
  sortColumn = null,
  sortDirection = "asc",
}: {
  parentIdentifier: string | null;
  page?: number;
  perPage?: number;
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc";
}) => {
  const [messages, setMessages] = useState<HeedMessageItem[]>([]);
  const [messageSearch, setMessageSearch] = useState("");
  const [skewTotal, setSkewTotal] = useState(0);
  const [skewTotalPages, setSkewTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parentIdentifier) {
      setMessages([]);
      setSkewTotal(0);
      setSkewTotalPages(1);
      return;
    }

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await fetchDistinctSupportMessages({
          identifier: parentIdentifier,
          dynamicPage: page,
          dynamicPerPage: perPage,
          dynamicSearch: messageSearch,
          dynamicSortColumn: sortColumn,
          dynamicSortDirection: sortDirection,
        });

        if (cancelled) return;

        if (result?.error || result?.success === false) {
          throw new Error(result.error ?? result.message ?? "Failed to Fetch Messages ⚓");
        }

        const data: Partial<SupportMessagePage> = result?.data ?? {};
        const items = data.items ?? [];
        const total = data.skewTotal ?? 0;
        const pages =
          data.skewTotalPages ?? Math.max(1, Math.ceil(total / Math.max(1, perPage)));

        setMessages(items);
        setSkewTotal(total);
        setSkewTotalPages(pages);
      } catch (err) {
        if (cancelled) return;
        setMessages([]);
        setSkewTotal(0);
        setSkewTotalPages(1);
        setError(err instanceof Error ? err.message : "Failed to Fetch Messages ⚓");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [parentIdentifier, messageSearch, page, perPage, sortColumn, sortDirection]);

  return {
    messages,
    skewTotal,
    skewTotalPages,
    messageSearch,
    setMessageSearch,
    isLoading,
    error,
  };
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────