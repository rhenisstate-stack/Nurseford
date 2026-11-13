import { ClipboardCheck, FileQuestion, ShieldCheck } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: ClipboardCheck,
    eyebrow: "Standalone Questions",
    title: "Custom Q-Bank Tests",
    description:
      "Prepare with unlimited custom practice tests that replicate the real test environment across Adult Health, Child Health, Pharmacology, Nutrition, Mental Health, Maternal & Newborn, and more — giving you a realistic simulation for RN, LPN, and Exit Exams.",
  },
  {
    icon: FileQuestion,
    eyebrow: "Practice Tests",
    title: "Personalized Practice Tests",
    description:
      "Craft personalized practice tests from a bank of 4,000+ nursing exam questions, each with detailed answer rationales for complete clarity, Review Mode and Videos. Our team of educators continuously expands the question bank with fresh material to master.",
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
            RN, LPN &amp; Exit Exams
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            With Nurseford, you&apos;ll access tailored nursing practice questions and illustrative
            videos designed by a team of experts to ensure you study smarter and
            achieve success with confidence.
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
