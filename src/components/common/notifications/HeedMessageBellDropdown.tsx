"use client";

import Link from "next/link";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaBullhorn } from "react-icons/fa6";
import {
  Send,
  X,
  CheckCheck,
  Clock,
  Inbox,
  Mail,
  MailOpen,
  RefreshCw,
  Star,
  Headset,
  MessageSquarePlus,
  Search,
  ExternalLink,
} from "lucide-react";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useRelativeHeedMessage } from "@/lib/hooks/users/heed/relative/useRelativeHeedMessage";
import {
  useUpdateHeedMessageStatus,
  HEED_STATUS_EVENT,
} from "@/lib/hooks/users/heed/status/useUpdateHeedMessageStatus";
import {
  submitSupportIssue,
  type ClientReadStatus,
} from "@/lib/services/auth/supportService";
import { categoryTone, timeAgo } from "@/app/(web)/pages/heed/partials/heedFormat";

interface HeedMessageBellDropdownProps {
  currentDashboard?: string;
  align?: "right" | "left" | "center";
  triggerClassName?: string;
}

type Filter = "All" | ClientReadStatus;

const FILTERS: { key: Filter; label: string; icon: React.ReactNode }[] = [
  { key: "All", label: "All", icon: <Inbox className="h-3 w-3" /> },
  { key: "Unread", label: "Unread", icon: <Mail className="h-3 w-3" /> },
  { key: "Later", label: "Later", icon: <Clock className="h-3 w-3" /> },
  { key: "Starred", label: "Starred", icon: <Star className="h-3 w-3" /> },
];

const CATEGORIES = [
  "Exam or Technical Issue",
  "Unable To Access Account",
  "Payment / Billing Issue",
  "Account Recovery Problem",
  "Something Else",
];

const MIN_LENGTH = 10;

function StatusBadge({ status }: { status?: string | null }) {
  const classes =
    status === "Resolved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
      : status === "Responded"
      ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
      : "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
  return (
    <span
      className={`whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${classes}`}
    >
      {status || "Open"}
    </span>
  );
}

export default function HeedMessageBellDropdown({
  currentDashboard = "rn-nursing",
  align = "right",
  triggerClassName,
}: HeedMessageBellDropdownProps) {
  const { user } = useCurrentSystemUser();
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Filter>("All");
  const [searchInput, setSearchInput] = useState("");

  // Start new conversation / type box state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [composerText, setComposerText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Hook for messages
  const { messages, setMessageSearch, isLoading, error, refetch } = useRelativeHeedMessage({
    items: 60,
    clientStatus: statusFilter === "All" ? null : statusFilter,
  });

  const { updateStatus, isUpdating } = useUpdateHeedMessageStatus();

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setMessageSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, setMessageSearch]);

  // Clear success notification
  useEffect(() => {
    if (!sendSuccess) return;
    const t = setTimeout(() => setSendSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [sendSuccess]);

  // Auto-grow textarea
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [composerText, isComposerOpen]);

  // Click-away & Escape key handler:
  // MUST NOT disappear when the mouse leaves. Stays open until user clicks away,
  // clicks the close button (✕), or presses Escape.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Hover to open (optional smooth entry), but NO mouseLeave auto-close!
  const handleMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleToggleClick = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsOpen((prev) => !prev);
  };

  const unreadMessages = messages.filter(
    (m) => m.clientReadStatus === "Unread" || !m.isRead
  );
  const unreadIds = unreadMessages.map((m) => m.guidId).filter(Boolean);

  const applyStatus = async (ids: string[], status: ClientReadStatus) => {
    if (!ids.length) return;
    await updateStatus(ids, status);
    refetch();
  };

  // Submit new conversation
  const handleSendNewConversation = async () => {
    setSendError("");
    setSendSuccess("");

    const clean = composerText.trim();
    if (clean.length < MIN_LENGTH) {
      setSendError(`Write at least ${MIN_LENGTH} characters (${clean.length}/${MIN_LENGTH})`);
      return;
    }

    const rawPhone = user?.phoneNumber || "";
    const userPhone = rawPhone
      ? rawPhone.startsWith("+")
        ? rawPhone
        : "+" + rawPhone.replace(/\D/g, "")
      : "+10000000000";

    const email =
      user?.email ||
      (user?.userName ? `${user.userName}@pubnurse.com` : "support@pubnurse.com");

    try {
      setIsSending(true);
      const result = await submitSupportIssue({
        ...(user?.guidId ? { userGuidId: user.guidId } : {}),
        email,
        phone: userPhone,
        category,
        message: clean,
      });

      if (result?.error || result?.success === false) {
        throw new Error(result.error ?? result.message ?? "Failed to send message ⚓");
      }

      setComposerText("");
      setSendSuccess("Message sent to PubNurse Support ✅");
      setIsComposerOpen(false);
      window.dispatchEvent(new CustomEvent(HEED_STATUS_EVENT));
      refetch();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send message ⚓");
    } finally {
      setIsSending(false);
    }
  };

  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSending) handleSendNewConversation();
    }
  };

  const alignmentClass =
    align === "left"
      ? "sm:left-0 sm:right-auto"
      : align === "center"
      ? "sm:left-1/2 sm:-translate-x-1/2 sm:right-auto"
      : "sm:right-0 sm:left-auto";

  const actionIconBtn =
    "flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-600 dark:text-slate-300 shadow-2xs cursor-pointer";

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
    >
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggleClick}
        aria-label={
          unreadIds.length > 0
            ? `${unreadIds.length} new messages`
            : "Notifications & Messages"
        }
        title={
          unreadIds.length > 0
            ? `${unreadIds.length} new message${unreadIds.length === 1 ? "" : "s"}`
            : "Message Support"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={
          triggerClassName ||
          "relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-lg border border-[var(--text-color)]/25 text-[var(--text-color)] hover:bg-[var(--text-color)]/10 transition-colors cursor-pointer"
        }
      >
        <FaBullhorn className="w-[16px] h-[16px] lg:w-[18px] lg:h-[18px]" />
        {unreadIds.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
            {unreadIds.length > 99 ? "99+" : unreadIds.length}
          </span>
        )}
      </button>

      {/* Dropdown with all components of the Heed page */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/25 sm:hidden z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="dialog"
            aria-label="Message Support"
            className={`fixed sm:absolute inset-x-2 top-14 sm:top-full mt-1 sm:mt-2 sm:w-[460px] max-w-[calc(100vw-1.5rem)] max-h-[min(650px,calc(100vh-4.5rem))] sm:max-h-[min(650px,calc(100vh-5rem))] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col ${alignmentClass}`}
          >
          {/* Header */}
          <div className="bg-white dark:bg-[#1E293B] border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                <FaBullhorn className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-navy dark:text-white leading-tight">Support Messages</h3>
                  {unreadIds.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                      {unreadIds.length} new
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                      All caught up
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-navy/55 dark:text-white/50 leading-tight">
                  Clinical &amp; technical inquiries
                </p>
              </div>
            </div>

            {/* Header Toolbar */}
            <div className="flex items-center gap-1 text-navy/60 dark:text-white/60">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isLoading}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-navy dark:hover:text-white transition cursor-pointer"
                title="Refresh messages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-navy dark:hover:text-white transition cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Container with All Components */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin bg-slate-50/70 dark:bg-[#0F172A]">
            {/* 1. Start New Conversation / Composer Box */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#16233B] p-2.5 shadow-2xs">
              {!isComposerOpen ? (
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(true)}
                  className="group flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 p-2 text-xs font-semibold text-navy/80 dark:text-white/80 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquarePlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Start A New Conversation</span>
                  </div>
                  <span className="text-[10px] font-bold rounded-md bg-white dark:bg-slate-700 px-2 py-0.5 shadow-2xs border border-slate-200/80 dark:border-slate-600 text-blue-600 dark:text-blue-300">
                    + New
                  </span>
                </button>
              ) : (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-navy dark:text-white">
                      <MessageSquarePlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>New Message To Support</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsComposerOpen(false)}
                      className="p-1 rounded-md text-navy/40 dark:text-white/40 hover:text-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                          category === c
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-navy/70 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Textarea Type Box */}
                  <div className="flex items-end gap-2 pt-1">
                    <textarea
                      ref={areaRef}
                      rows={2}
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={onComposerKeyDown}
                      placeholder="Type your inquiry here..."
                      className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/20 text-navy dark:text-white placeholder:text-navy/40 dark:placeholder:text-white/40"
                    />
                    <button
                      type="button"
                      onClick={handleSendNewConversation}
                      disabled={isSending || composerText.trim().length === 0}
                      aria-label="Send"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      <Send className={`h-4 w-4 ${isSending ? "animate-pulse" : ""}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-1 text-[10px]">
                    <span className="text-navy/45 dark:text-white/40">
                      Enter to send · Shift+Enter for newline
                    </span>
                    {sendError ? (
                      <span className="font-semibold text-red-500">{sendError}</span>
                    ) : sendSuccess ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sendSuccess}</span>
                    ) : (
                      <span className="text-navy/45 dark:text-white/40">
                        {composerText.trim().length} chars
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Filters & Search Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                {/* Status Filter Pills */}
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 p-0.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setStatusFilter(f.key)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition cursor-pointer ${
                        statusFilter === f.key
                          ? "bg-white dark:bg-[#1E293B] text-navy dark:text-white shadow-2xs"
                          : "text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white"
                      }`}
                    >
                      {f.icon}
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mark All Read Button */}
                {unreadIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => applyStatus(unreadIds, "Read")}
                    disabled={isUpdating}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-navy/80 dark:text-white/80 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-navy/40 dark:text-white/40" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#16233B] pl-8 pr-3 py-1.5 text-xs text-navy dark:text-white placeholder:text-navy/40 dark:placeholder:text-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Skeletons on loading */}
            {isLoading && messages.length === 0 && (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-white/5"
                  >
                    <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2.5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && messages.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-8 text-center bg-white dark:bg-[#16233B] shadow-2xs">
                <Inbox className="h-7 w-7 text-navy/40 dark:text-white/40" />
                <p className="text-xs font-bold text-navy dark:text-white">
                  {statusFilter === "All"
                    ? "No conversations yet"
                    : `No ${statusFilter.toLowerCase()} messages`}
                </p>
                <p className="text-[11px] text-navy/55 dark:text-white/50">
                  Start a conversation above and our team will get back to you.
                </p>
              </div>
            )}

            {/* 3. Conversation Cards List */}
            <div className="space-y-2">
              {messages.map((m) => {
                const isUnread = m.clientReadStatus === "Unread" || !m.isRead;
                const isStarred = m.clientReadStatus === "Starred";
                const isLater = m.clientReadStatus === "Later";

                return (
                  <div
                    key={m.guidId || m.id}
                    className={`group relative flex items-start gap-2.5 overflow-hidden rounded-xl border p-2.5 transition duration-150 hover:shadow-xs ${
                      isUnread
                        ? "border-blue-300/80 dark:border-blue-700/60 bg-blue-50/[0.2] dark:bg-blue-950/15"
                        : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#16233B] hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Unread accent bar */}
                    {isUnread && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-blue-600 dark:bg-blue-400" />
                    )}

                    {/* Avatar box */}
                    <Link
                      href={`/pages/heed/current?id=${m.guidId}`}
                      onClick={() => setIsOpen(false)}
                      className="relative shrink-0 mt-0.5"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 text-xs font-bold shadow-2xs"
                      >
                        {m.response ? (
                          <Headset className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <span>{(m.title?.[0] ?? "S").toUpperCase()}</span>
                        )}
                      </div>
                      {isUnread && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full border border-white dark:border-slate-900 bg-blue-600" />
                      )}
                    </Link>

                    {/* Conversation Content Preview */}
                    <Link
                      href={`/pages/heed/current?id=${m.guidId}`}
                      onClick={() => setIsOpen(false)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <h5
                          className={`truncate text-xs ${
                            isUnread
                              ? "font-bold text-navy dark:text-white"
                              : "font-semibold text-navy/85 dark:text-white/85"
                          }`}
                        >
                          {m.title || "Support Conversation"}
                        </h5>
                        {isStarred && (
                          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-500" />
                        )}
                        {isLater && (
                          <Clock className="h-3 w-3 shrink-0 text-orange-500" />
                        )}
                        <span
                          className={`ml-auto shrink-0 text-[10px] ${
                            isUnread ? "font-bold text-blue-600 dark:text-blue-400" : "text-navy/40 dark:text-white/40"
                          }`}
                        >
                          {timeAgo(m.respondedAt ?? m.updatedAt ?? m.createdAt)}
                        </span>
                      </div>

                      {/* Snippet */}
                      <p
                        className={`mt-0.5 line-clamp-2 text-[11px] leading-snug ${
                          isUnread
                            ? "text-navy/90 dark:text-white/90"
                            : "text-navy/60 dark:text-white/60"
                        }`}
                      >
                        {m.response ? (
                          <>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              Support:{" "}
                            </span>
                            {m.response}
                          </>
                        ) : (
                          m.message
                        )}
                      </p>

                      {/* Badges row */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={m.status} />
                        <span className="rounded-md border border-slate-200/70 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-navy/70 dark:text-white/70">
                          {m.category || "General"}
                        </span>
                      </div>
                    </Link>

                    {/* Quick action buttons */}
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          applyStatus([m.guidId], isStarred ? "Read" : "Starred")
                        }
                        disabled={isUpdating}
                        title={isStarred ? "Remove star" : "Star"}
                        className={actionIconBtn}
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            isStarred ? "fill-amber-400 text-amber-500" : ""
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          applyStatus([m.guidId], isLater ? "Read" : "Later")
                        }
                        disabled={isUpdating}
                        title={isLater ? "Remove from later" : "Mark for later"}
                        className={actionIconBtn}
                      >
                        <Clock
                          className={`h-3.5 w-3.5 ${
                            isLater ? "text-orange-500" : ""
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          applyStatus([m.guidId], isUnread ? "Read" : "Unread")
                        }
                        disabled={isUpdating}
                        title={isUnread ? "Mark as read" : "Mark as unread"}
                        className={actionIconBtn}
                      >
                        {isUnread ? (
                          <MailOpen className="h-3.5 w-3.5" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#16233B] flex items-center justify-between gap-2 shrink-0 text-xs">
            <span className="text-[11px] font-medium text-navy/55 dark:text-white/50">
              {messages.length} conversation{messages.length === 1 ? "" : "s"}
            </span>

            <Link
              href="/pages/heed/relative"
              onClick={() => setIsOpen(false)}
              className="py-1 px-3 rounded-lg bg-[#0A2540] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open Full Inbox</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </Link>
          </div>
        </div>
      </>
    )}
  </div>
);
}
