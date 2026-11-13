"use client";

import { useState, useCallback } from "react";
import BrandText from "./BrandText";
import { FAQ_CATEGORIES } from "@/lib/data/faqs";

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
            📋 <BrandText text="Nurseford – Frequently Asked Questions (F.A.Qs)" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {FAQ_CATEGORIES.map((group, groupIndex) => (
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
