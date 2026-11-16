"use client";

import Link from "next/link";
import {
  FileText,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  FileCheck2,
} from "lucide-react";

const shopPacks = [
  {
    id: "rn-exit-pack",
    badge: "Top Choice",
    eyebrow: "RN Exit Prep",
    title: "RN Exit Exam Mastery Pack",
    price: "$49",
    formats: ["PDF", "WORD"],
    description:
      "Comprehensive downloadable study pack for ATI & HESI RN exit exams with scenario walkthroughs and high-yield review sheets.",
    highlights: [
      "Next-Gen Clinical Scenarios",
      "Predictor Rationale Summaries",
      "Printable High-Yield Review Sheets",
    ],
    borderClass:
      "border-slate-200 dark:border-slate-700/80 hover:border-coral/70 dark:hover:border-coral/60",
    badgeColor: "bg-coral/15 text-[#ea580c] dark:text-[#ff8a65] border-coral/30",
    btnClass:
      "border border-[#ff6b35]/60 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 text-[#ea580c] dark:text-[#ff8a65]",
  },
  {
    id: "lpn-exit-pack",
    badge: "Most Popular",
    eyebrow: "LPN Exit Prep",
    title: "LPN Exit Exam Readiness Pack",
    price: "$49",
    formats: ["PDF", "WORD"],
    description:
      "Essential study pack tailored for practical nursing exit candidates, covering core med-surg, fundamentals, and medication math.",
    highlights: [
      "ATI & HESI PN Exit Core Concepts",
      "Dosage Calculation Formulas",
      "Focused Clinical Skills Drills",
    ],
    borderClass:
      "border-slate-200 dark:border-slate-700/80 hover:border-blue-500/70 dark:hover:border-blue-400/60",
    badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    btnClass:
      "border border-blue-600/60 bg-blue-600/10 hover:bg-blue-600/20 text-blue-800 dark:text-blue-300",
  },
  {
    id: "core-specialties-pack",
    badge: "Clinical Core",
    eyebrow: "RN & LPN Specialties",
    title: "Core Nursing Study Guides",
    price: "$49",
    formats: ["PDF", "WORD"],
    description:
      "In-depth guides for specialty coursework — Med-Surg, Pharmacology, Pediatrics, OB, and Mental Health organized for fast recall.",
    highlights: [
      "Pharmacology Pearls & Black Box Warnings",
      "Maternal & Pediatric Disease Summaries",
      "Ready to print or read on any device",
    ],
    borderClass:
      "border-slate-200 dark:border-slate-700/80 hover:border-teal-500/70 dark:hover:border-teal-400/60",
    badgeColor: "bg-teal-500/15 text-teal-700 dark:text-[#2FD9C4] border-teal-500/30",
    btnClass:
      "border border-teal-600/60 bg-teal-600/10 hover:bg-teal-600/20 text-teal-800 dark:text-[#2FD9C4]",
  },
];

export default function ShopTeaser() {
  return (
    <section id="shop" className="py-14 md:py-20" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Nurseford Shop</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-navy dark:text-white tracking-tight leading-tight">
            Study Materials You Can Own
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-navy/65 dark:text-white/65 leading-relaxed">
            Downloadable PDF and WORD study documents for every exam track.
            Each pack is crafted by experienced nursing educators and ready to print or study offline on any device.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 max-w-6xl mx-auto">
          {shopPacks.map((pack) => (
            <article
              key={pack.id}
              className={`rounded-2xl border-2 ${pack.borderClass} bg-white dark:bg-[#1E293B] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group`}
            >
              <div>
                {/* Header Row: Eyebrow + Format Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${pack.badgeColor}`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{pack.eyebrow}</span>
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-navy/50 dark:text-white/50">
                    {pack.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl font-bold text-navy dark:text-white mb-2 leading-snug">
                  {pack.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-navy/65 dark:text-white/65 leading-relaxed mb-4">
                  {pack.description}
                </p>

                {/* Feature Highlights */}
                <ul className="space-y-2 mb-6">
                  {pack.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-navy/80 dark:text-white/80 leading-snug"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & Action Row */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-navy/40 dark:text-white/40">
                    Instant Access
                  </span>
                  <span className="font-serif text-2xl font-bold text-navy dark:text-white">
                    {pack.price}
                  </span>
                </div>

                <Link
                  href="/pages/resources"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${pack.btnClass} shadow-2xs active:scale-[0.98] transition-all duration-200 cursor-pointer`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get Pack</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 sm:mt-12 max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="p-2.5 rounded-xl bg-white dark:bg-white/10 text-teal-600 dark:text-[#2FD9C4] shrink-0 shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-navy dark:text-white">
                Looking for specific subjects or custom review packs?
              </p>
              <p className="text-[11px] sm:text-xs text-navy/60 dark:text-white/60">
                Explore our full library of printable study guides, cheat-sheets, and comprehensive exam packs.
              </p>
            </div>
          </div>
          <Link
            href="/pages/resources"
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border border-navy/70 dark:border-white/40 bg-navy dark:bg-white text-white dark:text-navy hover:opacity-90 shadow-xs active:scale-[0.98] transition-all"
          >
            <span>Browse Full Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
