"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CreditCard } from "lucide-react";
import type { SubjectTopic } from "@/lib/data/subject-breakdown";
import type { SampleQuestion } from "@/lib/data/sample-questions";
import type { StudyDoc } from "@/lib/data/study-materials";
import HeroIntroBullets, { type HeroIntroBullet } from "./HeroIntroBullets";
import BrandText from "../BrandText";
import SubscriptionItem from "@/app/(web)/pages/subscription/item/SubscriptionItem";

export interface ExamLandingConfig {
  dashboardName: string;
  programName: string;
  parentTableName: string;
  parentName: string;
  tagline: string;
  taglineColor?: string;
  barColor?: string;
  heroImage?: string;
  heroImageLight?: string;
  title?: string;
  titleHighlight?: string;
  titleHighlightClass?: string;
  intro: string;
  introPoints?: HeroIntroBullet[];
  subjects: SubjectTopic[];
  samples: Record<string, SampleQuestion>;
  shopDocs: StudyDoc[];
  stats: { value: string; label: string }[];
  accent?: "coral" | "teal" | "blue" | "green" | "purple";
  showSubjects?: boolean;
  showSamples?: boolean;
  prepFormatLabel?: string;
  prepFormatCards?: {
    title: string;
    intro?: string;
    subtitle?: string;
    items?: string[];
    footer?: string;
  }[];
}

const accentMap = {
  coral: { text: "text-coral", bar: "bg-coral", badge: "border-coral/20 bg-coral/10 text-coral" },
  teal: { text: "text-teal", bar: "bg-teal", badge: "border-teal/20 bg-teal/10 text-teal" },
  blue: { text: "text-sage", bar: "bg-sage", badge: "border-sage/20 bg-sage/10 text-sage" },
  green: { text: "text-green", bar: "bg-green", badge: "border-green/20 bg-green/10 text-green" },
  purple: { text: "text-purple", bar: "bg-purple", badge: "border-purple/20 bg-purple/10 text-purple" },
} as const;

function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={faq.q} className="rounded-2xl border border-black/50 dark:border-border bg-paper overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex items-center justify-between w-full text-left px-5 py-4 text-sm font-medium text-black dark:text-white hover:bg-paper-dim transition-colors"
              aria-expanded={isOpen}
            >
              <span className="pr-3"><BrandText text={faq.q} /></span>
              <span className={`text-coral transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm text-black dark:text-white leading-relaxed"><BrandText text={faq.a} /></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ExamLandingPage({ config }: { config: ExamLandingConfig }) {
  const {
    dashboardName,
    programName,
    parentTableName,
    parentName,
    barColor,
    title,
    titleHighlight,
    titleHighlightClass,
    intro,
    introPoints,
    subjects,
    samples,
    accent = "coral",
    showSubjects = true,
    showSamples = true,
    prepFormatLabel,
    prepFormatCards,
  } = config;

  const s = accentMap[accent];
  const samplesList = Object.values(samples);

  const renderTitle = () => {
    const fallback = title ?? `${programName} Exam Prep with Rhenis Nursing`;
    if (titleHighlight) {
      const idx = fallback.indexOf(titleHighlight);
      if (idx >= 0) {
        return (
          <>
            <BrandText text={fallback.slice(0, idx)} />
            <span className={titleHighlightClass ?? "text-coral"}>{titleHighlight}</span>
            <BrandText text={fallback.slice(idx + titleHighlight.length)} />
          </>
        );
      }
    }
    return <BrandText text={fallback} />;
  };

  const faqs = [
    {
      q: `What is Rhenis Nursing ${programName}?`,
      a: `Rhenis Nursing offers expert-crafted study materials and Q-Banks to help you prepare for the ${programName} exam and boost your nursing school admission chances.`,
    },
    {
      q: `What subjects are covered in your ${programName} materials?`,
      a: `Our ${programName} preparation covers every content area tested on the real exam, with detailed study guides and practice questions.`,
    },
    {
      q: "In what formats are the study materials available?",
      a: "All materials are downloadable as PDF and Word documents for easy use on any device or for printing.",
    },
    {
      q: "How do I access my purchased downloads?",
      a: "Once your purchase is complete, you'll receive an instant download link and confirm download.",
    },
    {
      q: "Are the questions aligned with the current test plan?",
      a: "Yes, all our practice questions and study guides follow the latest exam guidelines.",
    },
    {
      q: "Can I create custom practice tests?",
      a: "Yes, our Q-Bank platform allows you to build custom quizzes targeting specific subjects or weak areas.",
    },
  ];

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "var(--content-bg)" }}>
        <div className="relative z-10 max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(70px_+_1.5rem)] sm:pt-[calc(74px_+_2rem)] pb-4 sm:pb-6 text-center flex flex-col items-center">
          <div className="text-center w-full max-w-4xl mx-auto">
            <h1 className="font-serif text-xl sm:text-[1.65rem] md:text-[1.85rem] lg:text-[2.05rem] xl:text-[2.2rem] font-semibold leading-tight tracking-tight text-black dark:text-white mb-2.5 sm:mb-3 whitespace-normal md:whitespace-nowrap">
              {renderTitle()}<span className="text-coral">.</span>
            </h1>
            {introPoints && introPoints.length > 0 ? (
              <HeroIntroBullets bullets={introPoints} iconClass={barColor ?? s.bar} maxWidth="max-w-fit mx-auto" />
            ) : (
              <p className="text-sm sm:text-base text-black dark:text-white font-normal leading-relaxed mb-3"><BrandText text={intro} /></p>
            )}
            <div className="flex w-full flex-row flex-wrap items-center justify-center gap-6 sm:gap-[112px] mt-3 sm:mt-4">
              <a
                href="#plans"
                className={`group inline-flex flex-col items-center justify-center gap-0.5 rounded-full px-5 py-2 text-xs font-semibold text-[#0c1929] ${barColor ?? s.bar} shadow-md shadow-black/20 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5 sm:px-6`}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:scale-110">
                    <CreditCard size={12} />
                  </span>
                  View Subscription
                </span>
                <span className="text-[10px] font-normal text-[#0c1929]/70">Browse plans</span>
              </a>
              <Link
                href={`/dashboards/${dashboardName}`}
                className="group inline-flex flex-col items-center justify-center gap-0.5 rounded-full bg-coral px-5 py-2 text-xs font-semibold text-[#0c1929] shadow-md shadow-black/20 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-coral-hover sm:px-6"
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:scale-110">
                    <BookOpen size={12} />
                  </span>
                  Access Exams
                </span>
                <span className="text-[10px] font-normal text-[#0c1929]/70">Start practicing</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*  Exam Plans (populated from the admin dashboard) ── */}
      <section id="plans" className="scroll-mt-20 py-3 md:py-4">
        <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
          <SubscriptionItem
            parentTableName={parentTableName || "program"}
            parentName={parentName}
            dashboardName={dashboardName}
            showSearch={false}
          />
        </div>
      </section>

      {/* ── Prep format ── */}
      {prepFormatLabel && (
        <section className="text-center pb-12 -mt-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] ${barColor ?? s.bar} hover:opacity-90 transition-colors`}
          >
            {prepFormatLabel}
          </button>
        </section>
      )}

      {/* ── Prep format cards ── */}
      {prepFormatCards && prepFormatCards.length > 0 && (
        <section className="pb-12 -mt-6">
          <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {prepFormatCards.map((card) => (
                <article
                  key={card.title}
                  className="relative rounded-2xl border border-black/50 dark:border-border bg-paper p-7 flex flex-col overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor ?? s.bar}`} />
                  <h3 className="font-serif text-xl font-semibold text-black dark:text-white mb-4">{card.title}</h3>
                  {card.intro && <p className="text-sm text-black dark:text-white leading-relaxed mb-3">{card.intro}</p>}
                  {card.subtitle && <p className="text-sm text-black dark:text-white leading-relaxed mb-2">{card.subtitle}</p>}
                  {card.items && card.items.length > 0 && (
                    <ul className="space-y-2 text-sm text-black dark:text-white leading-relaxed">
                      {card.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className={`${s.text} shrink-0`}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {card.footer && <p className="text-sm text-black dark:text-white leading-relaxed mt-3">{card.footer}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Subject breakdown ── */}
      {showSubjects && (
        <section id="subjects" className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className={`inline-block font-mono text-xs tracking-widest uppercase ${s.text} mb-3`}>
                Subject Breakdown
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
                What the {programName} Covers
              </h2>
              <p className="mt-4 text-black dark:text-white leading-relaxed">
                Master every section tested on the exam with focused study guides
                and realistic practice questions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((subject) => (
                <article
                  key={subject.name}
                  className="relative rounded-2xl border border-black/50 dark:border-border bg-paper p-7 flex flex-col overflow-hidden"
                >
                  {subject.image && (
                    <>
                      <Image
                        src={subject.image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-paper/80" aria-hidden="true" />
                    </>
                  )}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 z-10 ${s.bar}`} />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${s.badge} mb-4`}>
                      <span className="text-lg" aria-hidden="true">{subject.icon}</span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-black dark:text-white mb-4">{subject.name}</h3>
                    <ul className="space-y-2.5 text-sm text-black dark:text-white leading-relaxed">
                      {subject.topics.map((topic) => (
                        <li key={topic} className="flex gap-2">
                          <span className={`${s.text} shrink-0`}>•</span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sample questions ── */}
      {showSamples && samplesList.length > 0 && (
        <section id="samples" className="bg-paper-dim py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className={`inline-block font-mono text-xs tracking-widest uppercase ${s.text} mb-3`}>
                Try It First
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
                {programName} Sample Questions
              </h2>
              <p className="mt-4 text-black dark:text-white leading-relaxed">
                Get a feel for the exam with free sample questions from our Q-Bank.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {samplesList.map((sample) => (
                <article
                  key={sample.title}
                  className="rounded-2xl border border-black/50 dark:border-border bg-paper p-6 flex flex-col"
                >
                  <h3 className={`font-mono text-xs tracking-widest uppercase font-semibold ${s.text} mb-3`}>
                    {sample.title}
                  </h3>
                  <p className="text-sm text-black dark:text-white leading-relaxed mb-4">{sample.question}</p>
                  <ul className="space-y-2 mt-auto">
                    {sample.options.map((option) => (
                      <li
                        key={option}
                        className="rounded-lg border border-border bg-paper-dim px-3 py-2 text-sm text-black dark:text-white"
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section id="faq" className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <span className={`inline-block font-mono text-xs tracking-widest uppercase ${s.text} mb-3`}>
              FAQ
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
              {programName} FAQs
            </h2>
          </div>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="bg-paper py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5 md:px-8 lg:px-12 text-center">
          <span className={`inline-block font-mono text-xs tracking-widest uppercase ${s.text} mb-3`}>
            Ready to Begin?
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight mb-4">
            Get Started With {programName} Prep
          </h2>
          <p className="text-black dark:text-white leading-relaxed max-w-xl mx-auto mb-8">
            Join thousands of nursing students preparing for their exams with
            Rhenis. Start with a free account — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href={`/dashboards/${dashboardName}`}
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-medium text-black dark:text-white border border-border-light hover:bg-paper-dim transition-colors"
            >
              Access Exams Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
