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
        className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-3 text-sm font-bold opacity-80 transition hover:opacity-100 hover:border-blue-500 hover:bg-blue-500/5"
      >
        <MessageSquarePlus className="h-4 w-4 transition group-hover:scale-110" />
        Start A New Conversation
      </button>
    );
  }

  const composer = (
    <>
      <div className="flex items-end gap-2">
        <textarea
          ref={areaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={parent ? "Type a reply . . ." : "Tell us what you need . . ."}
          className="max-h-40 flex-1 resize-none rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
        <button
          onClick={handleSend}
          disabled={isSending || text.trim().length === 0}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className={`h-4 w-4 ${isSending ? "animate-pulse" : ""}`} />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-2 text-[11px]">
        <span className="opacity-50">Enter to send · Shift+Enter for new line</span>
        {error ? (
          <span className="font-semibold text-red-500">{error}</span>
        ) : success ? (
          <span className="font-semibold text-green-500">{success}</span>
        ) : (
          <span className="opacity-50">{text.trim().length} chars</span>
        )}
      </div>
    </>
  );

  // ── Reply composer (single message page) ──
  if (parent) return <div>{composer}</div>;

  // ── New conversation card (list page) ──
  return (
    <section className="space-y-3 rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <MessageSquarePlus className="h-4 w-4" />
          New Message To Support
        </h2>
        <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 opacity-60 hover:bg-[var(--text-color)]/10 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              category === c ? "border-blue-600 bg-blue-600 text-white" : "hover:bg-[var(--text-color)]/10"
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