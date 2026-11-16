"use client";

import Image from "next/image";
import Link from "next/link";
import {
  HeartPulse,
  Award,
  Syringe,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface TrackItem {
  id: string;
  category: "rn" | "lpn";
  type: "nursing" | "exit";
  icon: typeof HeartPulse;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  accentColor: string;
  borderClass: string;
  badgeClass: string;
  btnClass: string;
  tagClass: string;
}

const tracks: TrackItem[] = [
  {
    id: "rn-nursing",
    category: "rn",
    type: "nursing",
    icon: HeartPulse,
    image: "/images/cards/rn-nursing-core.png",
    eyebrow: "RN Core Q-Bank",
    title: "RN Nursing Exams",
    description:
      "Comprehensive question banks organized by clinical specialty — Med-Surg, Pharmacology, Maternal-Newborn, Pediatrics, and Mental Health with step-by-step rationales.",
    tags: ["Med-Surg", "Pharmacology", "Maternal-Newborn", "Pediatrics"],
    href: "/dashboards/rn-nursing?track=nursing",
    accentColor: "#0d9488",
    borderClass:
      "border-slate-200 dark:border-slate-700/80 hover:border-teal-500/70 dark:hover:border-[#2FD9C4]/60",
    badgeClass:
      "bg-teal-500/15 text-teal-700 dark:text-[#2FD9C4] border-teal-500/30",
    btnClass:
      "border border-teal-600/50 bg-teal-600/10 hover:bg-teal-600/20 text-teal-800 dark:text-[#2FD9C4]",
    tagClass:
      "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  },
  {
    id: "rn-exit",
    category: "rn",
    type: "exit",
    icon: Award,
    image: "/images/cards/rn-exit-exam.png",
    eyebrow: "RN Graduation Readiness",
    title: "RN Exit Exams",
    description:
      "High-stakes simulations for comprehensive ATI & HESI RN exit examinations. Scenario-based clinical judgment items and predictor scoring to ensure exam-day pass readiness.",
    tags: ["ATI RN Exit", "HESI RN Exit", "Predictor Scoring", "Clinical Scenarios"],
    href: "/dashboards/rn-nursing?track=exit",
    accentColor: "#ea580c",
    borderClass:
      "border-slate-200 dark:border-slate-700/80 hover:border-[#ff6b35]/70 dark:hover:border-[#ff8a65]/60",
    badgeClass:
      "bg-[#ff6b35]/15 text-[#ea580c] dark:text-[#ff8a65] border-[#ff6b35]/30",
    btnClass:
      "border border-[#ff6b35]/50 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 text-[#ea580c] dark:text-[#ff8a65]",
    tagClass:
      "bg-[#ff6b35]/10 text-[#ea580c] dark:text-[#ff8a65] border-[#ff6b35]/20",
  },
  {
    id: "lpn-nursing",
    category: "lpn",
    type: "nursing",
    icon: Syringe,
    image: "/images/cards/pn-nursing-core.png",
    eyebrow: "PN Core Q-Bank",
    title: "LPN Nursing Exams",
    description:
      "Targeted practical nursing prep focusing on patient safety, nursing fundamentals, dosage calculations, med-surg care, and elder health with deep rationales.",
    tags: ["Fundamentals", "Dosage Calc", "Practical Med-Surg", "Gerontology"],
    href: "/dashboards/lpn-nursing?track=nursing",
    accentColor: "#059669",
    borderClass:
      "border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/70 dark:hover:border-emerald-400/60",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    btnClass:
      "border border-emerald-600/50 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300",
    tagClass:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  {
    id: "lpn-exit",
    category: "lpn",
    type: "exit",
    icon: GraduationCap,
    image: "/images/cards/pn-exit-exam.png",
    eyebrow: "PN Graduation Readiness",
    title: "LPN Exit Exams",
    description:
      "Comprehensive exit assessments for LPN/LVN students. Authentic ATI & HESI PN exit mock exams designed to verify clinical competency before graduation.",
    tags: ["ATI PN Exit", "HESI PN Exit", "Readiness Scoring", "Practice CATs"],
    href: "/dashboards/lpn-nursing?track=exit",
    accentColor: "#2563eb",
    borderClass:
      "border-slate-200 dark:border-slate-700/80 hover:border-blue-500/70 dark:hover:border-blue-400/60",
    badgeClass:
      "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    btnClass:
      "border border-blue-600/50 bg-blue-600/10 hover:bg-blue-600/20 text-blue-800 dark:text-blue-300",
    tagClass:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
];

export default function ExamTracks() {
  return (
    <section id="exams" className="py-14 md:py-20" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-[#2FD9C4] text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4 Distinct Exam Tracks</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-navy dark:text-white tracking-tight leading-tight">
            Targeted Practice for Every Stage
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-navy/65 dark:text-white/65 leading-relaxed">
            From comprehensive specialty nursing Q-Banks to high-stakes exit exam simulations,
            each category delivers verified questions, realistic mock exams, and deep clinical rationales.
          </p>
        </div>

        {/* 4 Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 max-w-6xl mx-auto">
          {tracks.map((track) => {
            const Icon = track.icon;
            return (
              <article
                key={track.id}
                className={`group relative rounded-2xl border-2 ${track.borderClass} bg-white dark:bg-[#1E293B] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Top Image Banner */}
                <div className="relative w-full h-48 sm:h-56 bg-slate-900 overflow-hidden">
                  <Image
                    src={track.image}
                    alt={track.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Floating Badges */}
                  <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase backdrop-blur-md bg-black/60 text-white border border-white/20 shadow-xs">
                    <Icon className="w-3.5 h-3.5 text-[#2FD9C4]" />
                    <span>{track.eyebrow}</span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-3 left-4 right-4 z-10">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                      {track.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs sm:text-sm text-navy/70 dark:text-white/70 leading-relaxed mb-4">
                      {track.description}
                    </p>

                    {/* Domain Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {track.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${track.tagClass}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                    <Link
                      href={track.href}
                      className={`w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm ${track.btnClass} shadow-2xs active:scale-[0.98] transition-all duration-200 cursor-pointer`}
                    >
                      <span>Explore {track.title}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 shrink-0 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
