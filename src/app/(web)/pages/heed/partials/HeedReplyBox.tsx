"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X, MessageSquarePlus } from "lucide-react";
import {
  submitSupportIssue,
  type SupportMessageItem,
} from "@/lib/services/auth/supportService";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";

const CATEGORIES = [
  "Unable To Access Account",
  "Account Recovery Problem",
  "Payment / Billing Issue",
  "Exam or Technical Issue",
  "Something Else",
];

const MIN_LENGTH = 10;

export default function HeedReplyBox({
  parent = null,
  onSent,
}: {
  parent?: SupportMessageItem | null;
  onSent?: (text: string, sentAt: string) => void;
}) {
  const { user } = useCurrentSystemUser();

  const [open, setOpen] = useState(!!parent);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text, open]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleSend = async () => {
    setError("");
    setSuccess("");

    const clean = text.trim();
    if (clean.length < MIN_LENGTH) {
      setError(`Write at least ${MIN_LENGTH} characters (${clean.length}/${MIN_LENGTH})`);
      return;
    }

    const rawPhone = user?.phones?.find((p) => p.isPrimary)?.phoneNumber;
    const userPhone = rawPhone
      ? rawPhone.startsWith("+") ? rawPhone : "+" + rawPhone.replace(/\D/g, "")
      : "";

    const email = parent?.email || user?.email || "";
    const phone = parent?.phone || userPhone;

    if (!email) {
      setError("No email on file for your account. Please use the Support page.");
      return;
    }

    const body = parent
      ? `[Reply to "${parent.title}" · Ref ${parent.guidId}]\n\n${clean}`
      : clean;

    try {
      setIsSending(true);

      const result = await submitSupportIssue({
        ...(user ? { userGuidId: user.guidId } : {}),
        email,
        phone,
        category: parent?.category ?? category,
        message: body,
      });

      if (result?.error || result?.success === false) {
        throw new Error(result.error ?? result.message ?? "Failed to send message ⚓");
      }

      setText("");
      setSuccess("Sent ✅");
      onSent?.(clean, new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message ⚓");
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSending) handleSend();
    }
  };

  // ── Collapsed "new message" button (list page) ──
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-4 text-left shadow-xs transition-all duration-200 hover:border-blue-400 hover:shadow-md dark:hover:border-blue-500/50"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shadow-2xs">
            <MessageSquarePlus className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-navy dark:text-white">
              Start A New Conversation
            </span>
            <span className="block text-xs text-navy/55 dark:text-white/50">
              Need assistance with practice exams, account access, or technical support?
            </span>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#0A2540] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors">
          New Message
        </span>
      </button>
    );
  }

  const composer = (
    <>
      <div className="flex items-end gap-2.5">
        <textarea
          ref={areaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={parent ? "Type a reply . . ." : "Tell us what you need assistance with . . ."}
          className="max-h-40 flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2.5 text-sm text-navy dark:text-white placeholder:text-navy/40 dark:placeholder:text-white/40 outline-none transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          onClick={handleSend}
          disabled={isSending || text.trim().length === 0}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs transition hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className={`h-4 w-4 ${isSending ? "animate-pulse" : ""}`} />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1 text-[11px]">
        <span className="text-navy/45 dark:text-white/40">Press Enter to send · Shift+Enter for new line</span>
        {error ? (
          <span className="font-semibold text-red-500">{error}</span>
        ) : success ? (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{success}</span>
        ) : (
          <span className="text-navy/45 dark:text-white/40">{text.trim().length} chars</span>
        )}
      </div>
    </>
  );

  // ── Reply composer (single message page) ──
  if (parent) return <div>{composer}</div>;

  // ── New conversation card (list page) ──
  return (
    <section className="space-y-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-navy dark:text-white">
          <MessageSquarePlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          New Message To Support
        </h2>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="rounded-lg p-1.5 text-navy/50 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-navy dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              category === c
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-navy/70 dark:text-white/70 hover:bg-slate-200/80 dark:hover:bg-slate-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {composer}
    </section>
  );
}