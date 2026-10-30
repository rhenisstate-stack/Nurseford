import { Zap, FileText } from "lucide-react";
import FeatureCard from "./FeatureCard";

const subjects = [
  "Adult Health",
  "Child Health",
  "Med-Surg",
  "Fundamentals",
  "Pharmacology",
  "Maternal & Newborn",
  "Mental Health",
  "Critical Care",
  "Nutrition",
];

const tools = [
  {
    icon: Zap,
    eyebrow: "Quick Recall",
    title: "FlashCards",
    description:
      "Short and precise study notes for RN & LPN nursing exams and exit exams — perfect for rapid review and last-minute prep.",
    ctaLabel: "Get Started",
    href: "/auth/register",
    accent: "coral" as const,
  },
  {
    icon: FileText,
    eyebrow: "In-Depth Review",
    title: "Study Notes",
    description:
      "Detailed, organized and comprehensive notes covering RN and LPN nursing content for thorough exam preparation.",
    ctaLabel: "Start Now",
    href: "/auth/register",
    accent: "blue" as const,
  },
];

export default function StudyKit() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
            NurseFord Study Kit
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            FlashCards &amp; Study Notes
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Two powerful study tools designed to help you retain more and study
            smarter across every nursing exam track.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {tools.map((tool) => (
            <FeatureCard
              key={tool.title}
              icon={tool.icon}
              eyebrow={tool.eyebrow}
              title={tool.title}
              description={tool.description}
              tags={subjects}
              ctaLabel={tool.ctaLabel}
              href={tool.href}
              accent={tool.accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
