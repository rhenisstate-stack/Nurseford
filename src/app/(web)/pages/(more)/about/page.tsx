// src/app/(web)/pages/(more)/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import PulseLine from "@/app/(web)/includes/components/PulseLine";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn more about our platform, mission, and the team behind it.",
};

const stats = [
    { value: "50K+", label: "Students" },
    { value: "25K+", label: "Practice Questions" },
    { value: "96%", label: "NCLEX Pass Rate" },
    { value: "24/7", label: "Study Access" },
];

const values = [
    {
        icon: "🎯",
        title: "Focused Practice",
        desc: "Every question is written by nursing educators and mapped to the exact content tested on your exam.",
    },
    {
        icon: "📊",
        title: "Smart Analytics",
        desc: "Real-time performance tracking shows your strengths and the weak areas that need attention.",
    },
    {
        icon: "⚡",
        title: "Real-time Feedback",
        desc: "Detailed rationales for every answer help you understand each concept, not just memorize it.",
    },
];

export default function AboutPage() {
    return (
        <main>
            {/* ── Hero ── */}
            <section className="relative overflow-hidden" style={{ backgroundColor: "var(--content-bg)" }}>
                <div className="relative mx-auto max-w-6xl px-5 pt-24 pb-12 md:pt-20 md:pb-16 text-center">
                    <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-4">
                        Our Story
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-navy mb-6">
                        Built for Students. Driven by Results<span className="text-coral">.</span>
                    </h1>
                    <p className="text-lg text-navy/60 leading-relaxed max-w-2xl mx-auto">
                        We&apos;re on a mission to make nursing exam preparation smarter, more
                        accessible, and genuinely effective — for every student, everywhere.
                    </p>
                </div>
            </section>

            {/* ── Mission ── */}
            <section className="py-12 md:py-16">
                <div className="mx-auto max-w-6xl px-5 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
                            Our Mission
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-4">
                            Quality Prep for Every Student
                        </h2>
                        <p className="text-navy/60 leading-relaxed mb-4">
                            We believe every student deserves access to high-quality exam practice
                            tools — not just those who can afford expensive prep courses or tutors.
                        </p>
                        <p className="text-navy/60 leading-relaxed">
                            Our platform combines realistic practice questions, expert rationales,
                            and real-time performance analytics to give you the edge you need to
                            pass your nursing exam.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map(({ value, label }) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-black/50 dark:border-border bg-paper-dim px-4 py-6 text-center"
                            >
                                <div className="font-serif text-2xl md:text-3xl font-semibold text-teal">
                                    {value}
                                </div>
                                <div className="mt-1 text-xs text-navy/50 font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="bg-paper-dim py-12 md:py-16">
                <div className="mx-auto max-w-6xl px-5">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
                            What We Stand For
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
                            Values That Guide Us
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {values.map(({ icon, title, desc }) => (
                            <article
                                key={title}
                                className="relative rounded-2xl border border-black/50 dark:border-border bg-paper p-7 flex flex-col overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral" />
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-coral/20 bg-coral/10 mb-4">
                                    <span className="text-lg" aria-hidden="true">{icon}</span>
                                </div>
                                <h3 className="font-serif text-xl font-semibold text-navy mb-3">{title}</h3>
                                <p className="text-sm text-navy/60 leading-relaxed">{desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-12 md:py-16">
                <div className="mx-auto max-w-3xl px-5 text-center">
                    <PulseLine variant="divider" className="mb-12" />
                    <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-3">
                        Ready to Start?
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-4">
                        Join Thousands of Nursing Students
                    </h2>
                    <p className="text-navy/60 leading-relaxed max-w-xl mx-auto mb-8">
                        Start with a free account and get instant access to practice questions,
                        study guides, and more.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/pages/contact-us"
                            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-medium text-navy border border-border-light hover:bg-paper-dim transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
