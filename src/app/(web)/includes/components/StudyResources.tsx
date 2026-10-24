import { BookOpen, Stethoscope, Brain, Heart, Target } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: BookOpen,
    image: "/images/cards/teas-hesi.png",
    eyebrow: "Nursing Core",
    title: "Fundamentals of Nursing",
    description:
      "Master core nursing concepts, skills, and patient care basics with comprehensive study guides and practice materials.",
    href: "/pages/exams/ati-teas",
    accent: "coral" as const,
  },
  {
    icon: Stethoscope,
    image: "/images/cards/pharm-medsurg.png",
    eyebrow: "Nursing Core",
    title: "Pharmacology & Med-Surg Mastery",
    description:
      "Master the complexities of Pharmacology and Medical-Surgical Nursing with detailed study materials and expert notes.",
    href: "/pages/exams/rn-nursing",
    accent: "teal" as const,
  },
  {
    icon: Brain,
    eyebrow: "Foundations",
    title: "Pediatrics/Child Health",
    image: "/images/cards/pediatrics-child-health.png",
    description:
      "Explore study materials covering pediatric nursing and child health, including developmental stages and common conditions.",
    href: "/pages/exams/hesi-a2",
    accent: "coral" as const,
  },
  {
    icon: Heart,
    image: "/images/cards/mental-health-maternal.png",
    eyebrow: "Specialty",
    title: "Mental Health & Maternal and Newborn Care",
    description:
      "Prepare for Mental Health and Maternal-Newborn Nursing exams with structured study guides and expert support.",
    href: "/pages/exams/lpn-nursing",
    accent: "purple" as const,
  },
  {
    icon: Target,
    image: "/images/cards/free-practice-tests.png",
    eyebrow: "Free Tools",
    title: "Free Practice Tests & CATs",
    description:
      "Test your knowledge with free practice exams and Clinical Assessment Tests that simulate real exam conditions.",
    href: "/dashboards",
    accent: "green" as const,
  },
];

export default function StudyResources() {
  return (
    <section id="study-resources" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
            Rhenis Study Resources
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            Study Materials for Every Learner
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Choose the format that works best for you — from targeted exam prep
            to specialised nursing core study materials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              image={feature.image}
              eyebrow={feature.eyebrow}
              title={feature.title}
              description={feature.description}
              href={feature.href}
              ctaLabel="Explore"
              accent={feature.accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
