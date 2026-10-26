"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useRelativeHeedMessage } from "@/lib/hooks/users/heed/relative/useRelativeHeedMessage";

const HeedMessageBell: React.FC = () => {
  const { messages } = useRelativeHeedMessage({
    items: 100,
    clientStatus: "Unread",
    pollMs: 60_000,
  });
  const unreadCount = messages.length;

  return (
    <Link
      href="/pages/heed/relative"
      aria-label={unreadCount > 0 ? `${unreadCount} new messages` : "Messages"}
      title={unreadCount > 0 ? `${unreadCount} new message${unreadCount === 1 ? "" : "s"}` : "Messages"}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--text-color)]/25 text-[var(--text-color)] hover:bg-[var(--text-color)]/10 transition-colors"
    >
      <Bell className="w-[18px] h-[18px]" strokeWidth={2.5} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default HeedMessageBell;
