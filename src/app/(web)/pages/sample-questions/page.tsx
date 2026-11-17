import type { Metadata } from "next";
import Link from "next/link";
import { SAMPLE_QUESTIONS } from "@/lib/data/sample-questions";
import SampleQuestionCard from "./SampleQuestionCard";

export const metadata: Metadata = {
  title: "Free RN, LPN & Exit Exam Sample Questions",
  description:
    "Practice free RN Nursing, LPN Nursing, and Exit Exam sample questions with detailed clinical rationales across Med-Surg, Pharmacology, Pediatrics, Dosage Calculation, and Priority Setting.",
  alternates: { canonical: "/pages/sample-questions" },
};

export default function SampleQuestionsPage() {
  return (
    <main style={{ backgroundColor: "var(--content-bg)" }}>
      <section className="mx-auto max-w-4xl px-5 pt-24 pb-16">
        <div className="text-center mb-10">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-3">
            Free Practice Preview
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold text-navy tracking-tight mb-4">
            RN, LPN &amp; Exit Exam Sample Questions
          </h1>
          <p className="text-sm md:text-base text-navy/65 max-w-2xl mx-auto">
            Test your clinical judgment with representative nursing practice
            questions and step-by-step rationales before starting a full Q-Bank
            session.
          </p>
        </div>

        {SAMPLE_QUESTIONS.length > 0 ? (
          <div className="space-y-6">
            {SAMPLE_QUESTIONS.map((item, idx) => (
              <SampleQuestionCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            Practice questions load dynamically from your active exam banks.
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-coral/30 bg-coral/10 p-6 text-center">
          <h2 className="font-serif text-xl font-semibold text-navy mb-2">
            Ready for Full Practice Exams?
          </h2>
          <p className="text-sm text-navy/70 mb-4">
            Unlock timed exams, progress tracking, and subject-level analytics.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboards/rn-nursing"
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              Open RN Dashboard
            </Link>
            <Link
              href="/dashboards/lpn-nursing"
              className="rounded-xl border border-border bg-paper px-5 py-2.5 text-sm font-semibold text-navy hover:border-teal-500 transition"
            >
              Open LPN Dashboard
            </Link>
            <Link
              href="/dashboards/rn-nursing/vista/subscriptions/items"
              className="rounded-xl border border-border bg-paper px-5 py-2.5 text-sm font-semibold text-navy hover:border-coral transition"
            >
              View Subscription Plans
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
