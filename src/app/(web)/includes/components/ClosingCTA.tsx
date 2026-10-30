import Link from "next/link";
import PulseLine from "./PulseLine";

export default function ClosingCTA() {
  return (
    <section className="bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <PulseLine variant="divider" className="mb-12" />

        <span className="inline-block font-mono text-xs tracking-widest uppercase text-coral mb-3">
          Ready to Begin?
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight mb-4">
          Your Nursing Career Starts Here
        </h2>
        <p className="text-navy/60 leading-relaxed max-w-xl mx-auto mb-8">
          Join thousands of nursing students preparing for their exams with
          NurseFord. Start with a free account — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
          >
            Create Free Account
          </Link>
          <a
            href="#exams"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-medium text-navy border border-border-light hover:bg-paper-dim transition-colors"
          >
            Explore Exam Tracks
          </a>
        </div>

        <PulseLine variant="divider" className="mt-12" />
      </div>
    </section>
  );
}
