"use client";

import { useState, useCallback } from "react";
import BrandText from "./BrandText";
import { FAQ_CATEGORIES } from "@/lib/data/faqs";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>("0-0");

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const displayedCategories = FAQ_CATEGORIES.filter((group) => {
    if (activeCategory === "all") return true;
    return group.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  return (
    <section id="faq" className="py-8 md:py-10" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-[#2FD9C4] text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-navy dark:text-white tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-navy/65 dark:text-white/65 leading-relaxed">
            Everything you need to know about PubNurse exam tracks, question banks, study materials, and subscriptions.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeCategory === "all"
                  ? "bg-navy dark:bg-white text-white dark:text-navy shadow-sm scale-105"
                  : "bg-white dark:bg-white/10 text-navy/70 dark:text-white/70 border border-slate-200 dark:border-white/10 hover:border-navy/40"
              }`}
            >
              All Questions
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveCategory(cat.category)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.category
                    ? "bg-teal-600 text-white shadow-sm scale-105"
                    : "bg-white dark:bg-white/10 text-navy/70 dark:text-white/70 border border-slate-200 dark:border-white/10 hover:border-teal-500/50"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {displayedCategories.map((group, groupIndex) => (
            <div
              key={group.category}
              className="rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] overflow-hidden shadow-xs"
            >
              {/* Category Header */}
              <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-navy dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-[#2FD9C4]" />
                  <span>{group.category}</span>
                </h3>
                <span className="text-[11px] font-mono text-navy/40 dark:text-white/40 font-semibold">
                  {group.items.length} items
                </span>
              </div>

              {/* Accordion Items */}
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {group.items.map((faq, itemIndex) => {
                  const id = `${groupIndex}-${itemIndex}`;
                  const isOpen = openId === id;
                  const panelId = `faq-panel-${id}`;
                  const buttonId = `faq-button-${id}`;

                  return (
                    <div
                      key={faq.question}
                      className={isOpen ? "bg-slate-50/70 dark:bg-white/[0.02]" : ""}
                    >
                      <h4>
                        <button
                          id={buttonId}
                          type="button"
                          className="flex items-center justify-between w-full text-left px-5 sm:px-6 py-4 text-xs sm:text-sm font-bold text-navy dark:text-white hover:text-teal-700 dark:hover:text-[#2FD9C4] transition-colors cursor-pointer"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => toggle(id)}
                        >
                          <span className="pr-3 leading-snug">
                            <BrandText text={faq.question} />
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 text-navy/40 dark:text-white/40 transition-transform duration-200 ${
                              isOpen ? "rotate-180 text-teal-600 dark:text-[#2FD9C4]" : ""
                            }`}
                          />
                        </button>
                      </h4>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        hidden={!isOpen}
                      >
                        <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-navy/70 dark:text-white/70 leading-relaxed border-l-2 border-teal-500/50 ml-5 sm:ml-6 mb-2">
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
