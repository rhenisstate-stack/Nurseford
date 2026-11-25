"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ShopTeaser() {
  return (
    <section id="shop" className="py-14 md:py-20" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-[#2FD9C4] mb-3">
            PUBNURSE SHOP
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-navy dark:text-white tracking-tight leading-tight">
            Study Materials You Can Own
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-navy/65 dark:text-white/65 leading-relaxed">
            Downloadable PDF &amp; WORD study documents for every exam track. Each pack is crafted by
            nursing educators and ready to print or study on any device.
          </p>
        </div>

        {/* Single Minimal Card */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#131d2e] p-7 sm:p-9 shadow-xs hover:shadow-md transition-all duration-300">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white mb-2.5">
              RN &amp; LPN Exam Packs
            </h3>
            <p className="text-xs sm:text-sm text-navy/65 dark:text-white/65 mb-8 leading-relaxed">
              RN Nursing Exams | RN Exit Exams | LPN Nursing Exams | LPN Exit Exams
            </p>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white">
                <span className="text-sm font-sans font-normal text-navy/60 dark:text-white/60 mr-1.5">
                  From
                </span>
                $49
              </div>

              <Link
                href="/pages/resources"
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#e5573f]/10 text-[#e5573f] dark:text-[#ff8a65] border border-[#e5573f]/30 hover:bg-[#e5573f] hover:text-white transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm"
              >
                <span>Browse Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
