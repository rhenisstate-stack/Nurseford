import { Library, HeartPulse, Award, DoorOpen } from "lucide-react";
import Link from "next/link";
import FeatureCard from "./FeatureCard";

const tracks = [
  {
    icon: HeartPulse,
    image: "/images/RNLPN.png",
    eyebrow: "Nursing Core Q-Bank",
    title: "RN & LPN Nursing Exams",
    description:
      "Thousands of nursing questions organized by specialty — med-surg, pediatrics, OB, mental health, and fundamentals — with detailed rationales for every answer.",
    tags: ["Med-Surg", "Peds", "OB", "Mental Health", "Fundamentals"],
    accent: "teal" as const,
    links: [
      { label: "RN Nursing", href: "/pages/exams/rn-nursing" },
      { label: "LPN Nursing", href: "/pages/exams/lpn-nursing" },
    ],
  },
  {
    icon: DoorOpen,
    image: "/images/cards/rn-exit-exam.png",
    eyebrow: "Exit Exams",
    title: "RN & LPN Exit Exams",
    description:
      "Comprehensive end-of-program review covering advanced nursing concepts with clinical application. Practice critical-thinking scenarios with ATI & HESI exit exam question banks for confident graduation transition.",
    tags: ["Comprehensive Review", "Critical Thinking", "ATI Exit Prep", "HESI Exit Prep", "Licensure Readiness"],
    accent: "blue" as const,
    links: [
      { label: "RN Exit Exams", href: "/dashboards/rn-nursing/exams/exit-ati-exams-rn/36" },
      { label: "LPN Exit Exams", href: "/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23" },
    ],
  },
];

export default function ExamTracks() {
  return (
    <section id="exams" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
            Exam Tracks
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            RN &amp; LPN Nursing and Exit Exam Prep
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Focused, high-yield question banks and comprehensive exit assessments for Registered Nursing and Practical Nursing students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tracks.map((track) => (
            <FeatureCard
              key={track.title}
              icon={track.icon}
              image={track.image}
              eyebrow={track.eyebrow}
              title={track.title}
              description={track.description}
              tags={track.tags}
              accent={track.accent}
            >
              {track.links && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {track.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
}
