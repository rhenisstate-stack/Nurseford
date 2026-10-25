// src/app/(web)/pages/heed/relative/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCheck, Clock, Inbox, Mail, MailOpen, RefreshCw, Star, Headset } from "lucide-react";
import SearchBar from "@/lib/utils/data/SearchBar";
import PerPageSelect from "@/lib/utils/data/PerPageSelect";
import { useRelativeHeedMessage } from "@/lib/hooks/users/heed/relative/useRelativeHeedMessage";
import { useUpdateHeedMessageStatus } from "@/lib/hooks/users/heed/status/useUpdateHeedMessageStatus";
import type { ClientReadStatus } from "@/lib/services/auth/supportService";
import HeedReplyBox from "../partials/HeedReplyBox";
import { categoryTone, timeAgo } from "../partials/heedFormat";

const DEFAULT_PER_PAGE = 10;

type Filter = "All" | ClientReadStatus;
const FILTERS: { key: Filter; label: string; icon: React.ReactNode }[] = [
  { key: "All", label: "All", icon: <Inbox className="h-3.5 w-3.5" /> },
  { key: "Unread", label: "Unread", icon: <Mail className="h-3.5 w-3.5" /> },
  { key: "Later", label: "Later", icon: <Clock className="h-3.5 w-3.5" /> },
  { key: "Starred", label: "Starred", icon: <Star className="h-3.5 w-3.5" /> },
];

function StatusBadge({ status }: { status?: string | null }) {
  const classes =
    status === "Resolved" ? "bg-green-100 text-green-800"
    : status === "Responded" ? "bg-blue-100 text-blue-800"
    : "bg-yellow-100 text-yellow-800";
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${classes}`}>
      {status || "—"}
    </span>
  );
}

const getVisiblePages = (current: number, total: number, windowSize = 2) => {
  const pages: (number | "ellipsis")[] = [];
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);
  pages.push(1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  if (total > 1) pages.push(total);
  return pages;
};

export default function RelativeHeedMessagesPage() {
  const [statusFilter, setStatusFilter] = useState<Filter>("All");

  const { messages, setMessageSearch, isLoading, error, refetch } = useRelativeHeedMessage({
    items: 100,
    clientStatus: statusFilter === "All" ? null : statusFilter,
  });
  const { updateStatus, isUpdating, error: updateError } = useUpdateHeedMessageStatus();

  const [searchInput, setSearchInput] = useState("");
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setMessageSearch(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, setMessageSearch]);

  useEffect(() => {
    setSelected((prev) => {
      const next = prev.filter((id) => messages.some((m) => m.guidId === id));
      return next.length === prev.length ? prev : next;
    });
  }, [messages]);

  const total = messages.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(
    () => messages.slice((safePage - 1) * perPage, safePage * perPage),
    [messages, safePage, perPage]
  );

  const unreadIds = useMemo(
    () => messages.filter((m) => m.clientReadStatus === "Unread").map((m) => m.guidId),
    [messages]
  );

  const allPageSelected = pageItems.length > 0 && pageItems.every((m) => selected.includes(m.guidId));

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const togglePageSelection = () =>
    setSelected(allPageSelected ? [] : pageItems.map((m) => m.guidId));

  const apply = async (ids: string[], status: ClientReadStatus) => {
    const ok = await updateStatus(ids, status);
    if (ok) setSelected([]);
  };

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-full border transition hover:scale-110 hover:bg-[var(--text-color)]/10 active:scale-95 disabled:opacity-40";

  return (
    <main className="min-h-screen bg-[var(--content-bg)] px-3 pb-10 pt-20 text-[var(--text-color)]">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-[var(--text-color)]/40 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-5 py-4 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold md:text-3xl">Your Inbox</h1>
          <p className="text-sm opacity-70">Conversations with our support team ⚓</p>
          {unreadIds.length > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {unreadIds.length} new repl{unreadIds.length === 1 ? "y" : "ies"}
            </span>
          )}
        </div>

        {/* New conversation */}
        <HeedReplyBox />

        {/* Filters + search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-full border bg-[var(--text-color)]/5 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.key);
                  setCurrentPage(1);
                  setSelected([]);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  statusFilter === f.key
                    ? "bg-blue-600 text-white shadow"
                    : "opacity-70 hover:bg-[var(--text-color)]/10 hover:opacity-100"
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>

          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search conversations . . . 🏌️‍♂️"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={togglePageSelection}
                disabled={pageItems.length === 0}
              />
              Select page
            </label>

            <PerPageSelect
              value={perPage}
              onChange={(v) => {
                setPerPage(v);
                setCurrentPage(1);
              }}
            />

            <span className="text-xs font-bold opacity-70">
              {pageItems.length} of {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {unreadIds.length > 0 && (
              <button
                onClick={() => apply(unreadIds, "Read")}
                disabled={isUpdating}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition hover:bg-[var(--text-color)]/10 disabled:opacity-40"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition hover:bg-[var(--text-color)]/10 disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-xs font-bold shadow-sm">
            <span>{selected.length} selected</span>
            <button onClick={() => apply(selected, "Read")} disabled={isUpdating} className="flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-[var(--text-color)]/10 disabled:opacity-40"><MailOpen className="h-3 w-3" />Read</button>
            <button onClick={() => apply(selected, "Unread")} disabled={isUpdating} className="flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-[var(--text-color)]/10 disabled:opacity-40"><Mail className="h-3 w-3" />Unread</button>
            <button onClick={() => apply(selected, "Later")} disabled={isUpdating} className="flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-[var(--text-color)]/10 disabled:opacity-40"><Clock className="h-3 w-3" />Later</button>
            <button onClick={() => apply(selected, "Starred")} disabled={isUpdating} className="flex items-center gap-1 rounded-full border px-3 py-1 hover:bg-[var(--text-color)]/10 disabled:opacity-40"><Star className="h-3 w-3" />Star</button>
            <button onClick={() => setSelected([])} className="ml-auto rounded-full border px-3 py-1 hover:bg-[var(--text-color)]/10">Clear</button>
          </div>
        )}

        {(error || updateError) && (
          <div className="rounded-xl border border-red-500 bg-red-500/10 px-4 py-3 text-sm">
            {error ?? updateError}
          </div>
        )}

        {/* Skeletons */}
        {!error && isLoading && messages.length === 0 && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-2xl border p-4">
                <div className="h-12 w-12 rounded-full bg-[var(--text-color)]/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-[var(--text-color)]/10" />
                  <div className="h-3 w-2/3 rounded bg-[var(--text-color)]/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!error && !isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-14 text-center">
            <Inbox className="h-10 w-10 opacity-40" />
            <p className="text-sm font-semibold opacity-80">
              {statusFilter === "All" ? "No replies yet" : `No ${statusFilter.toLowerCase()} messages`}
            </p>
            <p className="text-xs opacity-50">Start a conversation above and we will get back to you ⚓</p>
          </div>
        )}

        {/* Conversation cards */}
        <div className="space-y-2.5">
          {pageItems.map((m) => {
            const isUnread = m.clientReadStatus === "Unread";
            const isStarred = m.clientReadStatus === "Starred";
            const isLater = m.clientReadStatus === "Later";
            const isSelected = selected.includes(m.guidId);

            return (
              <div
                key={m.guidId}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3.5 pl-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10"
                    : isUnread
                    ? "border-red-500/50 bg-red-500/[0.04]"
                    : "hover:bg-[var(--text-color)]/[0.04]"
                }`}
              >
                {/* Unread accent bar */}
                {isUnread && <span className="absolute inset-y-0 left-0 w-1 bg-red-500" />}

                <input
                  type="checkbox"
                  className="shrink-0"
                  checked={isSelected}
                  onChange={() => toggleSelect(m.guidId)}
                  aria-label="Select conversation"
                />

                <Link
                  href={`/pages/heed/current?id=${m.guidId}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white shadow ${categoryTone(m.category)}`}>
                      {(m.title?.[0] ?? "?").toUpperCase()}
                    </div>
                    {isUnread && (
                      <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-[var(--content-bg)] bg-red-500" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className={`truncate text-sm md:text-base ${isUnread ? "font-extrabold" : "font-semibold"}`}>
                        {m.title}
                      </h2>
                      {isStarred && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-500" />}
                      {isLater && <Clock className="h-3.5 w-3.5 shrink-0 text-orange-500" />}
                      <span className={`ml-auto shrink-0 text-[11px] ${isUnread ? "font-bold text-red-500" : "opacity-60"}`}>
                        {timeAgo(m.respondedAt ?? m.updatedAt ?? m.createdAt)}
                      </span>
                    </div>

                    <p className={`mt-0.5 line-clamp-2 text-xs md:text-sm ${isUnread ? "opacity-90" : "opacity-65"}`}>
                      {m.response ? (
                        <>
                          <Headset className="mr-1 inline h-3.5 w-3.5 -translate-y-px text-blue-500" />
                          <span className="font-semibold text-blue-500">Support: </span>
                          {m.response}
                        </>
                      ) : (
                        m.message
                      )}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={m.status} />
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-800">
                        {m.category}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Quick actions */}
                <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row">
                  <button
                    onClick={() => apply([m.guidId], isStarred ? "Read" : "Starred")}
                    disabled={isUpdating}
                    title={isStarred ? "Remove star" : "Star"}
                    className={iconBtn}
                  >
                    <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-500" : ""}`} />
                  </button>
                  <button
                    onClick={() => apply([m.guidId], isLater ? "Read" : "Later")}
                    disabled={isUpdating}
                    title={isLater ? "Remove from later" : "Mark for later"}
                    className={iconBtn}
                  >
                    <Clock className={`h-4 w-4 ${isLater ? "text-orange-500" : ""}`} />
                  </button>
                  <button
                    onClick={() => apply([m.guidId], isUnread ? "Read" : "Unread")}
                    disabled={isUpdating}
                    title={isUnread ? "Mark as read" : "Mark as unread"}
                    className={iconBtn}
                  >
                    {isUnread ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
              className="rounded-full border px-4 py-1.5 text-sm font-bold transition hover:bg-[var(--text-color)]/10 disabled:opacity-40"
            >
              Prior
            </button>

            {getVisiblePages(safePage, totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className="select-none px-2 text-sm opacity-60">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`h-9 w-9 rounded-full border text-sm font-bold transition ${
                    p === safePage
                      ? "border-blue-600 bg-blue-600 text-white shadow"
                      : "hover:bg-[var(--text-color)]/10"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
              className="rounded-full border px-4 py-1.5 text-sm font-bold transition hover:bg-[var(--text-color)]/10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}