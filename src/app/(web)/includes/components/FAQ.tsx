"use client";

import { useState, useCallback } from "react";
import BrandText from "./BrandText";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  category: string;
  tint: string;
  headerBg: string;
  headerText: string;
  items: FaqItem[];
}

const faqData: FaqCategory[] = [
  {
    category: "General Information",
    tint: "coral",
    headerBg: "bg-coral/10",
    headerText: "text-coral",
    items: [
      {
        question: "What is Rhenis Nursing?",
        answer:
          "Rhenis Nursing is a premier online platform providing comprehensive nursing exam preparation, including NCLEX-RN/PN, TEAS 7 Prep, HESI A2, and specialized RN and LPN Q-Banks. Our resources cover Med-Surg, Fundamentals, Maternal-Newborn, Mental Health, Pediatrics, and more.",
      },
      {
        question: "Who can benefit from Rhenis Nursing?",
        answer:
          "Nursing students, graduates preparing for licensure exams, practicing nurses refreshing their knowledge, and educators seeking reliable question banks can all benefit.",
      },
      {
        question: "What makes Rhenis Nursing different from other prep sites?",
        answer:
          "We offer exam-blueprint-aligned content, rationales for every answer, adaptive practice modes, performance tracking, and coverage across multiple nursing specialties—all designed by experienced nurse educators.",
      },
      {
        question: "Is Rhenis Nursing suitable for international nursing exams?",
        answer:
          "Yes! While our primary focus is on NCLEX, TEAS 7 Prep, and HESI exams, many international nursing students use Rhenis Nursing to strengthen their knowledge of core nursing concepts and clinical reasoning.",
      },
      {
        question: "Does Rhenis Nursing offer guidance on study strategies?",
        answer:
          "Absolutely. Alongside our practice questions, we provide expert tips, time-management strategies, and exam-day techniques to help you study smarter and boost your confidence.",
      },
    ],
  },
  {
    category: "Content and Features",
    tint: "sage",
    headerBg: "bg-sage/10",
    headerText: "text-sage",
    items: [
      {
        question: "Which exams are supported?",
        answer:
          "NCLEX-RN & NCLEX-PN, TEAS 7 Prep, HESI A2, RN Nursing Q-Bank and LPN Nursing Q-Bank, Specialty content: Med-Surg, Fundamentals, Maternal-Newborn, Mental Health, Pediatrics, Pharmacology, and more.",
      },
      {
        question: "How many practice questions are available?",
        answer:
          "We offer thousands of high-quality questions that mimic real exam formats, including alternate-format questions (SATA, drag-and-drop, hotspot).",
      },
      {
        question: "Are the questions updated to the latest exam standards?",
        answer:
          "Absolutely. Our team reviews and updates all content to reflect the most current NCLEX and nursing exam blueprints.",
      },
      {
        question: "Do the questions include rationales?",
        answer:
          "Yes. Each question includes detailed rationales explaining why the correct answer is right and why other options are incorrect, strengthening your critical-thinking skills.",
      },
      {
        question: "Can I track my performance?",
        answer:
          "Yes. Our performance analytics dashboard highlights strengths and weaknesses, so you can focus on areas needing improvement.",
      },
    ],
  },
  {
    category: "Access and Pricing",
    tint: "navy",
    headerBg: "bg-navy/10",
    headerText: "text-navy",
    items: [
      {
        question: "How do I sign up and start practicing?",
        answer:
          "Click Sign Up on the homepage, create an account, choose a subscription plan, and immediately access the Q-Bank and practice exams.",
      },
      {
        question: "What plans or pricing options are available?",
        answer:
          "We offer flexible plans—monthly, quarterly, and yearly subscriptions—to fit your study schedule and budget.",
      },
      {
        question: "Is there a free trial or sample questions?",
        answer:
          "Yes. You can try a limited selection of free questions before committing to a paid plan.",
      },
      {
        question: "Can I cancel my subscription?",
        answer:
          "Yes. Subscriptions can be canceled anytime before the next billing cycle. Review our refund policy for details.",
      },
      {
        question: "Can I upgrade my plan later if I need more features?",
        answer:
          "Yes. You can upgrade at any time—your progress and performance data will transfer seamlessly to your new plan.",
      },
    ],
  },
  {
    category: "Technical and Support",
    tint: "border-light",
    headerBg: "bg-border-light/20",
    headerText: "text-navy-light",
    items: [
      {
        question: "Can I access Rhenis Nursing on mobile devices?",
        answer:
          "Absolutely. The platform is mobile-responsive, so you can study on your phone or tablet anywhere.",
      },
      {
        question: "What should I do if I forget my password?",
        answer:
          'Use the "Forgot Password?" link on the login page to reset your password via your registered email.',
      },
      {
        question: "How can I contact support?",
        answer:
          "Reach our team through the Contact Us form on the website or by email. We aim to respond within 24–48 hours.",
      },
      {
        question: "Does Rhenis Nursing work on tablets or mobile browsers?",
        answer:
          "Yes. Our platform is fully responsive and optimized for desktops, tablets, and mobile devices so you can study on the go.",
      },
      {
        question: "Are my test scores and personal information secure?",
        answer:
          "Absolutely. Rhenis Nursing uses industry-standard encryption and strict privacy practices to protect your data and exam results.",
      },
    ],
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section id="faq" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
            FAQ
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            📋 <BrandText text="Rhenis Nursing – Frequently Asked Questions (F.A.Qs)" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {faqData.map((group, groupIndex) => (
            <div key={group.category} className="flex flex-col">
              <div
                className={`${group.headerBg} rounded-t-2xl px-5 py-4 border border-b-0 border-black/50 dark:border-border`}
              >
                <h3
                  className={`font-serif text-base font-semibold ${group.headerText}`}
                >
                  {group.category}
                </h3>
              </div>
              <div className="divide-y divide-border border border-black/50 dark:border-border rounded-b-2xl bg-paper flex-1">
                {group.items.map((faq, itemIndex) => {
                  const id = `${groupIndex}-${itemIndex}`;
                  const isOpen = openId === id;
                  const panelId = `faq-panel-${id}`;
                  const buttonId = `faq-button-${id}`;

                  return (
                    <div key={faq.question}>
                      <h4>
                        <button
                          id={buttonId}
                          type="button"
                          className="flex items-center justify-between w-full text-left px-5 py-4 text-sm font-medium text-navy hover:bg-paper-dim/50 transition-colors"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => toggle(id)}
                        >
                          <span className="pr-3"><BrandText text={faq.question} /></span>
                          <svg
                            viewBox="0 0 24 24"
                            className={`w-4 h-4 shrink-0 text-navy/50 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </h4>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                      >
                        <div className="px-5 pb-4 text-sm text-navy/60 leading-relaxed">
                          <BrandText text={faq.answer} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
