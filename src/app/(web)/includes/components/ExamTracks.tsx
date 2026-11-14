import { HeartPulse, DoorOpen } from "lucide-react";
import Link from "next/link";
import FeatureCard from "./FeatureCard";

const tracks = [
  {
    icon: HeartPulse,
    image: "/images/RNLPN.png",
    eyebrow: "Nursing Core Q-Bank",
    title: "RN & LPN Practice",
    description:
      "Thousands of nursing-style questions organized by specialty — med-surg, pediatrics, OB, mental health, and fundamentals — with detailed rationales for every answer.",
    tags: ["Med-Surg", "Peds", "OB", "Mental Health"],
    accent: "teal" as const,
    links: [
      { label: "RN Nursing", href: "/dashboards/rn-nursing" },
      { label: "LPN Nursing", href: "/dashboards/lpn-nursing" },
    ],
  },
  {
    icon: DoorOpen,
    image: "/images/cards/rn-exit-exam.png",
    eyebrow: "Exit Exams",
    title: "RN & PN Exit Exam",
    description:
      "Comprehensive review covering advanced nursing concepts with clinical application. Practice critical-thinking with real-world cases. Focused curriculum review with scenario-based clinical skills drills for confident transition.",
    tags: ["Comprehensive Content Review", "Critical-Thinking Scenarios", "Focused Curriculum", "Clinical Skills Practice", "Readiness", "Exam-Day Confidence"],
    accent: "blue" as const,
    links: [
      { label: "RN Exit Exams", href: "/dashboards/rn-nursing?track=exit" },
      { label: "LPN Exit Exams", href: "/dashboards/lpn-nursing?track=exit" },
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
            Targeted Practice for Every Stage
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            From comprehensive nursing school Q-Banks to exit exam preparations, each
            track includes hundreds of practice questions, timed test modes, and
            deep-dive rationales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
                      key={link.href + link.label}
                      href={link.href}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold border border-[#ff6b35]/80 dark:border-[#ff6b35]/60 bg-[#ff6b35]/15 dark:bg-[#ff6b35]/20 hover:bg-[#ff6b35]/25 dark:hover:bg-[#ff6b35]/30 text-[#ea580c] dark:text-[#ff8a65] transition-all duration-200 shadow-2xs active:scale-[0.98] cursor-pointer"
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
