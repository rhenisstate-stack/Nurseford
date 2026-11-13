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
    status === "Resolved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
      : status === "Responded"
      ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
      : "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
  return (
    <span className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-bold ${classes}`}>
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
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy/70 dark:text-white/70 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-40 cursor-pointer";

  return (
    <main className="min-h-screen bg-[var(--content-bg)] px-4 pb-14 pt-24 text-[var(--text-color)]">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 text-center shadow-xs">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-6 h-[2px] bg-teal-600/70 dark:bg-teal-400/70" />
            <span className="font-mono text-xs font-bold tracking-widest uppercase text-teal-700 dark:text-teal-300">
              STUDENT SUPPORT &amp; COMMUNICATIONS
            </span>
            <span className="w-6 h-[2px] bg-teal-600/70 dark:bg-teal-400/70" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-navy dark:text-white mb-1.5">
            Support Inbox
          </h1>
          {unreadIds.length > 0 && (
            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              {unreadIds.length} new repl{unreadIds.length === 1 ? "y" : "ies"}
            </div>
          )}
        </div>

        {/* New conversation */}
        <HeedReplyBox />

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.key);
                  setCurrentPage(1);
                  setSelected([]);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  statusFilter === f.key
                    ? "bg-white dark:bg-[#1E293B] text-navy dark:text-white shadow-xs"
                    : "text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white"
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
            placeholder="Search conversations..."
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 font-bold text-navy dark:text-white">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={togglePageSelection}
                disabled={pageItems.length === 0}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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

            <span className="font-semibold text-navy/55 dark:text-white/50">
              {pageItems.length} of {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {unreadIds.length > 0 && (
              <button
                onClick={() => apply(unreadIds, "Read")}
                disabled={isUpdating}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold text-navy/80 dark:text-white/80 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold text-navy/80 dark:text-white/80 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 px-4 py-2 text-xs font-bold shadow-xs">
            <span className="text-blue-900 dark:text-blue-200">{selected.length} selected</span>
            <button onClick={() => apply(selected, "Read")} disabled={isUpdating} className="flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-1 text-navy dark:text-white hover:bg-blue-50 disabled:opacity-40 cursor-pointer"><MailOpen className="h-3 w-3" />Read</button>
            <button onClick={() => apply(selected, "Unread")} disabled={isUpdating} className="flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-1 text-navy dark:text-white hover:bg-blue-50 disabled:opacity-40 cursor-pointer"><Mail className="h-3 w-3" />Unread</button>
            <button onClick={() => apply(selected, "Later")} disabled={isUpdating} className="flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-1 text-navy dark:text-white hover:bg-blue-50 disabled:opacity-40 cursor-pointer"><Clock className="h-3 w-3" />Later</button>
            <button onClick={() => apply(selected, "Starred")} disabled={isUpdating} className="flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-3 py-1 text-navy dark:text-white hover:bg-blue-50 disabled:opacity-40 cursor-pointer"><Star className="h-3 w-3" />Star</button>
            <button onClick={() => setSelected([])} className="ml-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 hover:bg-slate-50 text-navy/70 dark:text-white/70 cursor-pointer">Clear</button>
          </div>
        )}

        {(error || updateError) && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error ?? updateError}
          </div>
        )}

        {/* Skeletons */}
        {!error && isLoading && messages.length === 0 && (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-4">
                <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!error && !isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] px-4 py-16 text-center shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-navy/40 dark:text-white/40">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-navy dark:text-white">
              {statusFilter === "All" ? "No messages yet" : `No ${statusFilter.toLowerCase()} messages`}
            </p>
            <p className="text-xs text-navy/55 dark:text-white/50 max-w-sm">
              Start a conversation above and our clinical support staff will follow up with you.
            </p>
          </div>
        )}

        {/* Conversation cards */}
        <div className="space-y-3">
          {pageItems.map((m) => {
            const isUnread = m.clientReadStatus === "Unread";
            const isStarred = m.clientReadStatus === "Starred";
            const isLater = m.clientReadStatus === "Later";
            const isSelected = selected.includes(m.guidId);

            return (
              <div
                key={m.guidId}
                className={`group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border p-4 pl-4.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30"
                    : isUnread
                    ? "border-blue-300/80 dark:border-blue-700/60 bg-blue-50/[0.2] dark:bg-blue-950/15"
                    : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Unread accent bar */}
                {isUnread && (
                  <span className="absolute inset-y-0 left-0 w-1.5 bg-blue-600 dark:bg-blue-400" />
                )}

                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={isSelected}
                  onChange={() => toggleSelect(m.guidId)}
                  aria-label="Select conversation"
                />

                <Link
                  href={`/pages/heed/current?id=${m.guidId}`}
                  className="flex min-w-0 flex-1 items-center gap-3.5"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 font-bold text-sm shadow-2xs">
                      {m.response ? (
                        <Headset className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <span>{(m.title?.[0] ?? "S").toUpperCase()}</span>
                      )}
                    </div>
                    {isUnread && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-white dark:border-[#1E293B] bg-blue-600" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className={`truncate text-sm md:text-base text-navy dark:text-white ${isUnread ? "font-bold" : "font-semibold"}`}>
                        {m.title}
                      </h2>
                      {isStarred && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />}
                      {isLater && <Clock className="h-3.5 w-3.5 shrink-0 text-orange-500" />}
                      <span className={`ml-auto shrink-0 text-[11px] ${isUnread ? "font-bold text-blue-600 dark:text-blue-400" : "text-navy/45 dark:text-white/40"}`}>
                        {timeAgo(m.respondedAt ?? m.updatedAt ?? m.createdAt)}
                      </span>
                    </div>

                    <p className={`mt-0.5 line-clamp-2 text-xs md:text-sm ${isUnread ? "text-navy/90 dark:text-white/90" : "text-navy/60 dark:text-white/60"}`}>
                      {m.response ? (
                        <>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">Support: </span>
                          {m.response}
                        </>
                      ) : (
                        m.message
                      )}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={m.status} />
                      <span className="rounded-md border border-slate-200/70 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-navy/70 dark:text-white/70">
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
                    <Star className={`h-4 w-4 ${isStarred ? "fill-amber-400 text-amber-500" : ""}`} />
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
          <div className="flex items-center justify-center gap-2 pt-3">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-navy dark:text-white shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              Prior
            </button>

            {getVisiblePages(safePage, totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className="select-none px-2 text-sm text-navy/40 dark:text-white/40">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 rounded-xl border text-xs font-bold transition shadow-2xs cursor-pointer ${
                    p === safePage
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-navy dark:text-white shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}