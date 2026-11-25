import type { Metadata } from "next";
import { SAMPLE_QUESTIONS } from "@/lib/data/sample-questions";
import SampleQuestionsClient from "./SampleQuestionsClient";
import JsonLd, { buildQuizSchema } from "@/components/seo/JsonLd";
import { APP_NAME, SEO } from "@/lib/config/config";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SEO.siteUrl || "https://pubnurse.com").trim().replace(/\/+$/, "");
const pageUrl = `${siteUrl}/pages/sample-questions`;

export const metadata: Metadata = {
  title: "Free Nursing Practice Sample Questions with Clinical Rationales",
  description:
    "Practice board-standard nursing sample questions with detailed step-by-step clinical rationales across Med-Surg, Pharmacology, Scope of Practice, Dosage Calculation, and Priority Setting.",
  keywords: [
    "RN practice questions",
    "LPN sample questions",
    "NCLEX practice questions",
    "Nursing exit exam practice",
    "HESI exit questions",
    "ATI predictor practice",
    "Med-Surg sample questions",
    "pharmacology practice questions",
    "nursing clinical rationales",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Free Nursing Practice Sample Questions | ${APP_NAME}`,
    description:
      "Practice board-standard nursing sample questions with deep clinical rationales. Test your clinical judgment before starting a full Q-Bank session.",
    url: pageUrl,
    siteName: APP_NAME,
    type: "website",
    images: [
      {
        url: `${siteUrl}/logo/logo.png`,
        width: 800,
        height: 600,
        alt: `${APP_NAME} Sample Practice Questions`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Free RN, LPN & Exit Exam Sample Questions | ${APP_NAME}`,
    description:
      "Test your clinical judgment with free board-standard nursing practice questions and clinical rationales.",
    images: [`${siteUrl}/logo/logo.png`],
  },
};

export default function SampleQuestionsPage() {
  const quizJsonLd = buildQuizSchema(SAMPLE_QUESTIONS);

  return (
    <main style={{ backgroundColor: "var(--content-bg)" }} className="min-h-screen">
      <JsonLd data={quizJsonLd} />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 space-y-3">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-teal-600 dark:text-[#2FD9C4] font-bold">
            Free Board-Standard Practice Preview
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Free Nursing Practice Sample Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Test your clinical judgment with high-yield nursing practice questions and comprehensive step-by-step rationales across Med-Surg, Pharmacology, Pediatrics, and Prioritization.
          </p>
        </div>

        {/* Client Component with interactive filters, answer selection, and score stats */}
        <SampleQuestionsClient questions={SAMPLE_QUESTIONS} />
      </section>
    </main>
  );
}
