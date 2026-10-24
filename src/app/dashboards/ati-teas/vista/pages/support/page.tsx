"use client";

import { useState } from "react";
import Link from "next/link";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { APP_TITLE } from "@/lib/config/config";
import {
  LifeBuoy,
  ChevronDown,
  BookOpen,
  CreditCard,
  UserCog,
  Mail,
  ArrowRight,
} from "lucide-react";

const CURRENT_PANEL = "ati-teas";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const HELP_CATEGORIES = [
  { icon: BookOpen, title: "Studying & Exams", description: "Notes, practice exams, progress tracking" },
  { icon: CreditCard, title: "Billing & Subscriptions", description: "Plans, payments, and upgrades" },
  { icon: UserCog, title: "Account & Access", description: "Login, password, profile settings" },
];

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How do I start a practice exam?",
    answer:
      "Open your dashboard, choose an assessment from the Assessments section, then select an exam to begin. Your progress is saved automatically, and you can resume any exam that's in progress from the home dashboard.",
  },
  {
    id: "faq-2",
    question: "Can I switch subscription plans later?",
    answer:
      "Yes. Visit \"My Subscriptions\" from your dashboard to see your current plan and explore available packages. Changes typically apply to your next billing cycle.",
  },
  {
    id: "faq-3",
    question: "I forgot my password — what do I do?",
    answer:
      "Use the \"Forgot Password\" link on the login page to receive a reset link by email. If you don't see the email within a few minutes, check your spam folder before reaching out to support.",
  },
  {
    id: "faq-4",
    question: "Are the notes and questions updated regularly?",
    answer:
      "Yes. Our content team reviews and refreshes notes, resource categories, and question banks on an ongoing basis to keep everything aligned with current exam expectations.",
  },
  {
    id: "faq-5",
    question: "How do I report an issue with a question or note?",
    answer:
      "Reach out through the Contact Us page with as much detail as possible — the exam name, question, and what looked off. Our team reviews every report.",
  },
];

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function HelpSupportPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <main
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 md:p-4 space-y-6 w-full max-w-7xl mx-auto">

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--text-color)]/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl px-6 py-8 md:px-10 md:py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 mb-4">
            <LifeBuoy className="w-6 h-6 text-indigo-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-color)]">
            Help &amp; Support
          </h1>
          <p className="mt-3 text-sm md:text-base opacity-70 text-[var(--text-color)] max-w-2xl mx-auto">
            Find quick answers below, or reach the {APP_TITLE} team directly
            if you need more help.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HELP_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-5 py-5 space-y-2 hover:shadow-md hover:border-[var(--text-color)]/30 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-color)]">
                  {category.title}
                </h3>
                <p className="text-xs opacity-65 text-[var(--text-color)]">
                  {category.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* FAQ Accordion */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-color)] mb-3">
            Frequently Asked Questions
          </h2>

          <div className="space-y-2.5">
            {FAQS.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-sm text-[var(--text-color)]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-[var(--text-color)] opacity-60 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 text-xs md:text-sm opacity-70 leading-relaxed text-[var(--text-color)]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Still need help */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-color)]">
                Still need a hand?
              </h3>
              <p className="text-xs opacity-65 text-[var(--text-color)]">
                Our support team typically responds within one business day.
              </p>
            </div>
          </div>

          <Link
            href={`/dashboards/${CURRENT_PANEL}/vista/pages/contact-us`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:scale-105 transition-transform duration-200 shrink-0"
          >
            Contact Support
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────