"use client";

import { useState, useEffect } from "react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { APP_TITLE } from "@/lib/config/config";
import { Mail, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { submitSupportIssue } from "@/lib/services/auth/supportService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface ContactFormState {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: ContactFormState = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function ContactUsPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading: userLoading } = useCurrentSystemUser();

  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const primaryPhone = user.phones?.find((p) => p.isPrimary)?.phoneNumber;

    setForm((prev) => ({
      ...prev,
      fullName: user.userName ?? prev.fullName,
      email: user.email ?? prev.email,
      phone: primaryPhone ?? prev.phone,
    }));
  }, [user]);

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.fullName || !form.email || !form.message) {
      setError("Please fill in your name, email, and message before sending.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitSupportIssue({
        email: form.email,
        phone: form.phone,
        category: "other",
        message: form.subject
          ? `[${form.subject}] (from ${form.fullName}) — ${form.message}`
          : `(from ${form.fullName}) — ${form.message}`,
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      setSuccess("Your message has been sent successfully.");
      setIsSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to send your message right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="pt-16 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 md:p-4 space-y-6 w-full max-w-7xl mx-auto">

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--text-color)]/20 bg-gradient-to-br from-indigo-500 via-blue-800 to-pink-800 px-5 py-5 md:px-8 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-white/15 backdrop-blur-sm mx-auto sm:mx-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Contact Us
              </h1>
              <p className="mt-1 text-xs md:text-sm text-white/80 max-w-2xl">
                Have a question, a bug to report, or feedback about {APP_TITLE}?
                We&apos;d love to hear from you.
              </p>
            </div>
          </div>
        </div>
        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        {(error || success) && (
          <div className="flex justify-center">
            <div
              className={`relative max-w-md w-full px-4 py-3 rounded-xl shadow-md text-sm flex items-center gap-3
              ${error ? "bg-red-100 border border-red-200 text-red-800" : ""}
              ${success ? "bg-green-100 border border-green-200 text-green-800" : ""}`}
            >
              <span className="flex items-center justify-center leading-none">
                {error ? "⚠️" : "✅"}
              </span>
              <span className="flex-1 leading-tight">{error || success}</span>
              <button
                type="button"
                onClick={() => { setError(null); setSuccess(null) }}
                className={`absolute top-2 right-2 font-bold hover:text-gray-700 ${error ? "text-red-800" : "text-green-800"}`}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Side info */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 px-5 py-5 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Mail className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <h3 className="font-bold text-sm text-[var(--text-color)]">
                Response Time
              </h3>
              <p className="text-xs opacity-65 text-[var(--text-color)] leading-relaxed">
                Our team typically replies within one business day. For
                urgent account or billing issues, please say so in your
                subject line.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-5 py-5 space-y-2">
              <h3 className="font-bold text-sm text-[var(--text-color)]">
                Before You Write In
              </h3>
              <p className="text-xs opacity-65 text-[var(--text-color)] leading-relaxed">
                Check our Help &amp; Support page — many common questions
                about exams, billing, and account access are already
                answered there.
              </p>
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

            <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-5 py-5 space-y-1.5">
              <h3 className="font-bold text-sm text-[var(--text-color)]">
                Get Help Faster
              </h3>
              <p className="text-xs opacity-65 text-[var(--text-color)] leading-relaxed">
                When contacting support, include your account email, the exam or course
                you&apos;re working on, and a brief description of the issue.
              </p>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
          {/* Contact form */}
          <div className="lg:col-span-2 rounded-2xl border border-[var(--text-color)] bg-[var(--content-bg)] px-6 py-6">
            {isSubmitted ? (
              <div className="flex flex-col items-center text-center gap-3 py-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="font-bold text-base text-[var(--text-color)]">
                  Message sent ⚓
                </h2>
                <p className="text-xs md:text-sm opacity-65 text-[var(--text-color)] max-w-sm">
                  Thanks for Reaching Out. Our team will get back to you as
                  soon as possible.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[var(--text-color)]/10 text-[var(--text-color)] hover:bg-[var(--text-color)]/20 transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-color)]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      readOnly={!!user}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="Jane Doe"
                      className={`w-full rounded-xl border border-[var(--text-color)]/20 px-3.5 py-2.5 text-sm text-[var(--text-color)] outline-none focus:border-indigo-500 transition-colors ${user ? "bg-[var(--text-color)]/5 cursor-not-allowed" : "bg-transparent"
                        }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-color)]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      readOnly={!!user}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="jane@example.com"
                      className={`w-full rounded-xl border border-[var(--text-color)]/20 px-3.5 py-2.5 text-sm text-[var(--text-color)] outline-none focus:border-indigo-500 transition-colors ${user ? "bg-[var(--text-color)]/5 cursor-not-allowed" : "bg-transparent"
                        }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-color)]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    readOnly={!!user}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 555 123 4567"
                    className={`w-full rounded-xl border border-[var(--text-color)]/20 px-3.5 py-2.5 text-sm text-[var(--text-color)] outline-none focus:border-indigo-500 transition-colors ${user ? "bg-[var(--text-color)]/5 cursor-not-allowed" : "bg-transparent"
                      }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-color)]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    placeholder="e.g. Billing question, bug report, feedback"
                    className="w-full rounded-xl border border-[var(--text-color)]/20 bg-transparent px-3.5 py-2.5 text-sm text-[var(--text-color)] outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-color)]">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Tell us what's going on…"
                    className="w-full rounded-xl border border-[var(--text-color)]/20 bg-transparent px-3.5 py-2.5 text-sm text-[var(--text-color)] outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || userLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Sending…" : userLoading ? "Checking Your Session…" : "Submit and Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

        </div>

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────