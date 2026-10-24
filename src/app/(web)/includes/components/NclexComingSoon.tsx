import { ClipboardCheck, FileQuestion, ShieldCheck } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: ClipboardCheck,
    eyebrow: "Standalone Questions",
    title: "NCLEX Create Tests",
    description:
      "Prepare with unlimited NCLEX Create Tests that replicate the real test environment. Even better, our experts are developing new features — and includes all subjects e.g Adult Health, Child Health, Pharmacology, Nutrition, Mental Health, Maternal & Newborn etc — to give you an even closer simulation of the actual NCLEX.",
  },
  {
    icon: FileQuestion,
    eyebrow: "Practice Tests",
    title: "Personalized Practice Tests",
    description:
      "Craft personalized practice tests from a bank of 4,000+ NCLEX-style questions, each with detailed answer rationales for complete clarity, Review Mode and Videos. And this is just the beginning — our team of experts is currently expanding the question bank with even more practice sets and live tutoring so you'll always have fresh material to master.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Readiness Assessment",
    title: "Readiness Assessments",
    description:
      "Boost your confidence with unlimited readiness assessments, each providing a predictor score and detailed progress tracking. Plus, our upcoming updates will include expanded readiness tools, giving you deeper insight into your strengths and areas for growth before exam day.",
  },
];

export default function NclexComingSoon() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            NCLEX RN &amp; PN
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            With Rhenis, you&apos;ll access tailored NCLEX questions and illustrative
            videos designed by a team of experts to ensure you study smarter and
            achieve success with confidence and become a licensed nurse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <FeatureCard
              key={feature.eyebrow}
              icon={feature.icon}
              eyebrow={feature.eyebrow}
              title={feature.title}
              description={feature.description}
              accent="blue"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
