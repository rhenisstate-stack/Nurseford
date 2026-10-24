import { Library, HeartPulse, Award, DoorOpen } from "lucide-react";
import Link from "next/link";
import FeatureCard from "./FeatureCard";

const tracks = [
  {
    icon: Library,
    image: "/images/cards/teas-hesi.png",
    eyebrow: "Entrance Exams",
    title: "TEAS 7 & HESI A2 Prep",
    description:
      "Get into your nursing program with focused prep for the two most common entrance exams. Covers reading, math, science, and English language & usage.",
    tags: ["Reading", "Math", "Science", "English"],
    accent: "coral" as const,
    links: [
      { label: "TEAS 7 PREP", href: "/pages/exams/ati-teas" },
      { label: "HESI A2 PREP", href: "/pages/exams/hesi-a2" },
    ],
  },
  {
    icon: HeartPulse,
    image: "/images/RNLPN.png",
    eyebrow: "Nursing Core Q-Bank",
    title: "RN & LPN Practice",
    description:
      "Thousands of NCLEX-style questions organized by specialty — med-surg, pediatrics, OB, mental health, and fundamentals — with detailed rationales for every answer.",
    tags: ["Med-Surg", "Peds", "OB", "Mental Health"],
    accent: "teal" as const,
    links: [
      { label: "RN Nursing", href: "/pages/exams/rn-nursing" },
      { label: "LPN Nursing", href: "/pages/exams/lpn-nursing" },
    ],
  },
  {
    icon: Award,
    image: "/images/cards/nclex-rn.png",
    eyebrow: "Licensure Exams",
    title: "NCLEX-RN & NCLEX-PN",
    description:
      "Adaptive question banks that mirror the real CAT format. Build test-taking stamina with timed practice exams and track your readiness score.",
    tags: ["CAT Format", "Adaptive", "Readiness Score"],
    accent: "blue" as const,
    links: [
      { label: "NCLEX-RN", href: "/pages/exams/nclex-rn" },
      { label: "NCLEX-PN", href: "/pages/exams/nclex-pn" },
    ],
  },
  {
    icon: DoorOpen,
    image: "/images/cards/rn-exit-exam.png",
    eyebrow: "Exit Exams",
    title: "RN & PN Exit Exam",
    description:
      "Comprehensive review covering advanced nursing concepts with clinical application. Practice critical-thinking with real-world cases. Focused PN curriculum review with scenario-based clinical skills drills for confident licensure transition.",
    tags: ["Comprehensive Content Review", "Critical-Thinking Scenarios", "Focused PN Curriculum", "Clinical Skills Practice", "Licensure Readiness", "Exam-Day Confidence"],
    accent: "blue" as const,
    links: [
      { label: "RN Nursing", href: "/pages/exams/rn-nursing" },
      { label: "LPN Nursing", href: "/pages/exams/lpn-nursing" },
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
            One Platform, Every Nursing Exam
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Whether you are preparing for your first entrance exam or studying
            for licensure, we have a dedicated track for every stage.
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
