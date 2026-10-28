"use client";

import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { APP_TITLE } from "@/lib/config/config";
import { FileText } from "lucide-react";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ⚠️ ASSUMPTION: this is placeholder legal copy for layout/dev purposes only.
// Replace with counsel-reviewed Terms of Service before shipping to production.
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const LAST_UPDATED = "July 28, 2026";

interface TermsSection {
  id: string;
  title: string;
  body: string[];
}

const SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: [
      `By creating an account or otherwise accessing ${APP_TITLE} ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.`,
    ],
  },
  {
    id: "accounts",
    title: "2. Accounts",
    body: [
      "You're responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
      "You must provide accurate information when registering and keep it up to date.",
    ],
  },
  {
    id: "subscriptions",
    title: "3. Subscriptions & Payments",
    body: [
      "Certain features require a paid subscription. Prices, billing cycles, and available packages are shown at the time of purchase and may change with notice.",
      "Unless otherwise stated, subscriptions renew automatically until cancelled through your account settings.",
    ],
  },
  {
    id: "content",
    title: "4. Content & Study Materials",
    body: [
      `Notes, practice exams, and resource materials on the Platform are provided for educational and exam-preparation purposes only. ${APP_TITLE} does not guarantee any specific exam outcome or certification result.`,
      "You may not copy, redistribute, or resell Platform content without prior written permission.",
    ],
  },
  {
    id: "conduct",
    title: "5. Acceptable Use",
    body: [
      "You agree not to misuse the Platform, including attempting unauthorized access, disrupting service availability, or sharing account access with individuals outside your household or organization where prohibited by your plan.",
    ],
  },
  {
    id: "termination",
    title: "6. Termination",
    body: [
      "We may suspend or terminate accounts that violate these Terms. You may cancel your account at any time from your account settings.",
    ],
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    body: [
      `To the fullest extent permitted by law, ${APP_TITLE} and its team are not liable for indirect, incidental, or consequential damages arising from your use of the Platform.`,
    ],
  },
  {
    id: "changes",
    title: "8. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "contact",
    title: "9. Contact",
    body: [
      "Questions about these Terms can be sent through the Contact Us page.",
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function TermsOfServicePage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

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
        <div className="relative overflow-hidden rounded-2xl border border-[var(--text-color)]/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl px-6 py-8 md:px-10 md:py-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 mb-4">
            <FileText className="w-6 h-6 text-indigo-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-color)]">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs md:text-sm opacity-60 text-[var(--text-color)]">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Intro */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-6 py-5">
          <p className="text-sm leading-relaxed opacity-75 text-[var(--text-color)]">
            These Terms of Service govern your access to and use of{" "}
            {APP_TITLE}. Please read them carefully before using the
            Platform.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* Sections */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] px-6 py-2 divide-y divide-[var(--text-color)]/10">
          {SECTIONS.map((section) => (
            <section key={section.id} className="py-5">
              <h2 className="font-bold text-sm md:text-base text-[var(--text-color)] mb-2">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-xs md:text-sm leading-relaxed opacity-70 text-[var(--text-color)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────