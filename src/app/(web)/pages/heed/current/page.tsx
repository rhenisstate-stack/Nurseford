// src/app/(web)/pages/heed/current/page.tsx
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CheckCheck, Clock, Headset, Mail, Star } from "lucide-react";
import { useCurrentHeedMessage } from "@/lib/hooks/users/heed/current/useCurrentHeedMessage";
import { useUpdateHeedMessageStatus } from "@/lib/hooks/users/heed/status/useUpdateHeedMessageStatus";
import HeedReplyBox from "../partials/HeedReplyBox";
import { categoryTone, formatDay, formatTime } from "../partials/heedFormat";

function Badge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-bold ${tone}`}>
      {children}
    </span>
  );
}

function DaySeparator({ value }: { value?: string | null }) {
  const label = formatDay(value);
  if (!label) return null;
  return (
    <div className="my-2 flex justify-center">
      <span className="rounded-full bg-[var(--text-color)]/10 px-3 py-1 text-[11px] font-semibold opacity-80">
        {label}
      </span>
    </div>
  );
}

function SupportAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow">
      <Headset className="h-4 w-4" />
    </div>
  );
}

type LocalReply = { id: number; text: string; sentAt: string };

function CurrentHeedMessageView() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("id");

  const { message, isLoading, error } = useCurrentHeedMessage(identifier);
  const { updateStatus, isUpdating, error: updateError } = useUpdateHeedMessageStatus();

  // Replies sent from this page. The backend has no threading yet, so they live here for the session.
  const [localReplies, setLocalReplies] = useState<LocalReply[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-mark as Read the first time THIS message is opened (never downgrades Starred / Later)
  const autoMarkedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!message) return;
    if (autoMarkedFor.current === message.guidId) return;
    autoMarkedFor.current = message.guidId;
    if (message.clientReadStatus === "Unread") updateStatus([message.guidId], "Read");
  }, [message, updateStatus]);

  useEffect(() => {
    if (localReplies.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [localReplies.length]);

  const isStarred = message?.clientReadStatus === "Starred";
  const isLater = message?.clientReadStatus === "Later";
  const hasReply = !!message?.response;

  const statusTone =
    message?.status === "Resolved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
      : message?.status === "Responded"
      ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
      : "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";

  const actionBtn = "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy/70 dark:text-white/70 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-40 cursor-pointer";

  return (
    <main className="min-h-screen bg-[var(--content-bg)] px-3 pb-10 pt-24 text-[var(--text-color)]">
      <div className="mx-auto max-w-3xl space-y-3">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] px-5 py-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/pages/heed/relative"
              aria-label="Back to messages"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy dark:text-white transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            {message ? (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 font-bold text-sm shadow-2xs">
                  {message.response ? (
                    <Headset className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <span>{(message.title?.[0] ?? "S").toUpperCase()}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-base font-bold md:text-lg text-navy dark:text-white">{message.title}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={statusTone}>{message.status}</Badge>
                    <Badge tone="bg-slate-100 text-slate-700 border-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">{message.category}</Badge>
                    <Badge tone="bg-purple-50 text-purple-700 border-purple-200/70 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60">{message.priority}</Badge>
                    {isStarred && <Badge tone="bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300">★ Starred</Badge>}
                    {isLater && <Badge tone="bg-orange-50 text-orange-700 border-orange-200/70 dark:bg-orange-950/40 dark:text-orange-300">Later</Badge>}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => updateStatus([message.guidId], isStarred ? "Read" : "Starred")}
                    disabled={isUpdating}
                    title={isStarred ? "Remove star" : "Star"}
                    className={actionBtn}
                  >
                    <Star className={`h-4 w-4 ${isStarred ? "fill-amber-400 text-amber-500" : ""}`} />
                  </button>
                  <button
                    onClick={() => updateStatus([message.guidId], isLater ? "Read" : "Later")}
                    disabled={isUpdating}
                    title={isLater ? "Remove from later" : "Mark for later"}
                    className={actionBtn}
                  >
                    <Clock className={`h-4 w-4 ${isLater ? "text-orange-500" : ""}`} />
                  </button>
                  <button
                    onClick={() => updateStatus([message.guidId], "Unread")}
                    disabled={isUpdating || message.clientReadStatus === "Unread"}
                    title="Mark as unread"
                    className={actionBtn}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <h1 className="text-base font-bold text-navy dark:text-white">Conversation</h1>
            )}
          </div>

          {updateError && <p className="mt-2 text-xs text-red-500">{updateError}</p>}
        </div>

        {/* States */}
        {isLoading && (
          <div className="space-y-3 py-6">
            <div className="ml-auto h-16 w-2/3 animate-pulse rounded-2xl bg-[var(--text-color)]/10" />
            <div className="h-20 w-3/4 animate-pulse rounded-2xl bg-[var(--text-color)]/10" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-500 bg-red-500/10 px-4 py-6 text-center text-sm">
            {error}
          </div>
        )}

        {/* Conversation */}
        {!isLoading && !error && message && (
          <section className="space-y-3 rounded-2xl border bg-[var(--text-color)]/[0.03] p-3 md:p-5">
            <DaySeparator value={message.createdAt} />

            {/* 1. YOUR MESSAGE — right */}
            <div className="flex justify-end">
              <div className="max-w-[85%] md:max-w-[75%]">
                <p className="mb-1 mr-2 text-right text-[11px] font-bold uppercase tracking-wide opacity-60">
                  Your Message
                </p>
                <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-white shadow-md">
                  <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-blue-100">
                    <span>{formatTime(message.createdAt)}</span>
                    {hasReply ? (
                      <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </div>
                </div>
                {(message.email || message.phone) && (
                  <p className="mr-2 mt-1 text-right text-[10px] opacity-50">
                    {[message.email, message.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>

            {/* 2. SUPPORT TEAM MESSAGE — left */}
            {hasReply && <DaySeparator value={message.respondedAt} />}

            <div className="flex items-end gap-2">
              <SupportAvatar />
              <div className="max-w-[85%] md:max-w-[75%]">
                <p className="mb-1 ml-2 text-[11px] font-bold uppercase tracking-wide opacity-60">
                  Support Team Message
                </p>

                {hasReply ? (
                  <div className="rounded-2xl rounded-tl-sm border border-blue-400/50 bg-[var(--content-bg)] px-4 py-2.5 shadow-md">
                    <p className="whitespace-pre-wrap break-words text-sm">{message.response}</p>
                    <div className="mt-1 text-right text-[10px] opacity-50">
                      {formatTime(message.respondedAt)}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl rounded-tl-sm border bg-[var(--content-bg)] px-4 py-3 shadow-md">
                    <div className="flex items-center gap-1.5">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-color)]/50"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                      <span className="ml-2 text-xs opacity-70">Our team is working on it ⚓</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Replies sent from this page */}
            {localReplies.map((r) => (
              <div key={r.id} className="flex justify-end">
                <div className="max-w-[85%] md:max-w-[75%]">
                  <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-white shadow-md">
                    <p className="whitespace-pre-wrap break-words text-sm">{r.text}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-blue-100">
                      <span>{formatTime(r.sentAt)}</span>
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {localReplies.length > 0 && (
              <p className="text-center text-[11px] opacity-50">
                Your reply was sent to our team. They will answer it as a new message ⚓
              </p>
            )}

            <div ref={bottomRef} />

            {/* 3. REPLY TO OUR TEAM — composer */}
            <div className="sticky bottom-3 rounded-3xl border bg-[var(--content-bg)] p-3 shadow-lg">
              <p className="mb-2 ml-2 text-[11px] font-bold uppercase tracking-wide opacity-60">
                Reply To Our Team
              </p>
              <HeedReplyBox
                parent={message}
                onSent={(text, sentAt) =>
                  setLocalReplies((prev) => [...prev, { id: Date.now(), text, sentAt }])
                }
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function CurrentHeedMessagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 text-center opacity-70">Loading . . . ⚓</div>}>
      <CurrentHeedMessageView />
    </Suspense>
  );
}