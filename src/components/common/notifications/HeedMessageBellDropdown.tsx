"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import {
  FiMail,
  FiInbox,
  FiHelpCircle,
  FiMessageSquare,
  FiLogIn,
  FiUserPlus,
  FiCheckCircle,
} from "react-icons/fi";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useRelativeHeedMessage } from "@/lib/hooks/users/heed/relative/useRelativeHeedMessage";

interface HeedMessageBellDropdownProps {
  currentDashboard?: string;
  align?: "right" | "left" | "center";
  triggerClassName?: string;
}

function timeAgo(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function HeedMessageBellDropdown({
  currentDashboard = "rn-nursing",
  align = "right",
  triggerClassName,
}: HeedMessageBellDropdownProps) {
  const { user } = useCurrentSystemUser();
  const { messages, isLoading } = useRelativeHeedMessage({
    items: 50,
    pollMs: 60_000,
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const targetDashboard = currentDashboard.toLowerCase();

  // Calculate unread count
  const unreadMessages = messages.filter(
    (m) => m.clientReadStatus === "Unread" || !m.isRead
  );
  const unreadCount = unreadMessages.length;

  // Handle outside click & escape key
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

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    hoverTimeout.current = setTimeout(() => {
      setIsOpen(true);
    }, 80);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    closeTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const alignmentClass =
    align === "left"
      ? "left-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "right-0";

  const supportLink =
    targetDashboard && targetDashboard !== "web"
      ? `/dashboards/${targetDashboard}/vista/pages/contact-us`
      : `/pages/contact-us`;

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0 ? `${unreadCount} new messages` : "Notifications & Messages"
        }
        title={
          unreadCount > 0
            ? `${unreadCount} new message${unreadCount === 1 ? "" : "s"}`
            : "Notifications & Messages"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={
          triggerClassName ||
          "relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-lg border border-[var(--text-color)]/25 text-[var(--text-color)] hover:bg-[var(--text-color)]/10 transition-colors cursor-pointer"
        }
      >
        <Bell className="w-[18px] h-[18px] lg:w-5 lg:h-5" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Profile-Style Notification Dropdown Box */}
      {isOpen && (
        <div
          className={`absolute mt-3 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[#85AEEA] dark:border-white/20 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${alignmentClass}`}
        >
          {/* Top Header Card */}
          <div className="px-6 py-4 text-center border-b border-slate-300/80 dark:border-white/15">
            <div className="mx-auto mb-2 h-14 w-14 rounded-full overflow-hidden bg-indigo-100 dark:bg-slate-700 flex items-center justify-center shadow-inner relative text-indigo-600 dark:text-indigo-400">
              <Bell className="w-7 h-7" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-700" />
              )}
            </div>

            <div className="font-medium text-gray-900 dark:text-white text-base">
              {user?.userName ? `${user.userName}` : "Notifications & Messages"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "Support alerts, notifications & replies"}
            </div>

            <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {unreadCount > 0
                  ? `${unreadCount} Unread Message${unreadCount === 1 ? "" : "s"}`
                  : "All Messages Caught Up ⚓"}
              </span>
            </div>
          </div>

          {/* Account/Status Information rows */}
          <div className="px-5 py-2.5 space-y-1 mx-3 my-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-[#85AEEA] dark:border-white/15 transition-all">
            <div className="group flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-all duration-200 hover:bg-white/90 dark:hover:bg-white/10">
              <span className="text-black dark:text-gray-200 font-semibold">Unread</span>
              {unreadCount > 0 ? (
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {unreadCount} New
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  0 Unread
                </span>
              )}
            </div>

            <div className="group flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-all duration-200 hover:bg-white/90 dark:hover:bg-white/10">
              <span className="text-black dark:text-gray-200 font-semibold">Total Messages</span>
              <span className="font-medium text-gray-800 dark:text-gray-300">
                {messages.length}
              </span>
            </div>

            <div className="group flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-all duration-200 hover:bg-white/90 dark:hover:bg-white/10">
              <span className="text-black dark:text-gray-200 font-semibold">Notification Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
          </div>

          {/* Recent Messages Content Area ("with all content") */}
          <div className="mx-3 mb-2.5 max-h-[190px] overflow-y-auto space-y-1.5 rounded-xl border border-[#85AEEA]/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-2 scrollbar-thin">
            {isLoading && messages.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                <span>Checking messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                <Bell className="w-5 h-5 mx-auto mb-1 text-gray-400 opacity-60" />
                <p>No new messages or notifications ⚓</p>
              </div>
            ) : (
              messages.slice(0, 5).map((msg) => {
                const isUnread = msg.clientReadStatus === "Unread" || !msg.isRead;
                return (
                  <Link
                    key={msg.guidId || msg.id}
                    href="/pages/heed/relative"
                    onClick={() => setIsOpen(false)}
                    className={`group block p-2 rounded-lg transition-all border ${
                      isUnread
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60"
                        : "bg-white/70 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10"
                    } hover:shadow-xs`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 truncate max-w-[170px]">
                        {msg.category || "Notification"}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      )}
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {msg.title || "Support Update"}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5 leading-snug">
                      {msg.message}
                    </p>
                    {msg.response && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        <FiCheckCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">Staff reply received</span>
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Menu Actions (mirroring profile card links) */}
          <div className="border-t border-slate-300/80 dark:border-white/15 px-4 py-2 space-y-1">
            <Link
              href="/pages/heed/relative"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white transition-all hover:bg-indigo-500/10 dark:hover:bg-white/10"
            >
              <FiMail className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition" />
              <span>All Heed Messages</span>
            </Link>

            <Link
              href={supportLink}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-navy dark:text-white transition-all hover:bg-emerald-500/10 dark:hover:bg-white/10"
            >
              <FiHelpCircle className="text-emerald-600 dark:text-emerald-400 group-hover:rotate-6 transition" />
              <span>Contact Support / Help Desk</span>
            </Link>

            {/* Bottom Primary Button (mirroring the Sign Out button style) */}
            <div className="relative pt-1 pb-1">
              <Link
                href="/pages/heed/relative"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-900/60 bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-950/60 dark:to-red-950/60 hover:from-rose-200 hover:to-red-200 dark:hover:from-rose-900 dark:hover:to-red-900 transition cursor-pointer shadow-xs"
              >
                <FiInbox className="h-4 w-4" />
                <span>Open Message Inbox</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
