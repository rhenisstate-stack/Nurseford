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
          Nurseford. Start with a free account — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold border border-[#ff6b35]/80 dark:border-[#ff6b35]/60 bg-[#ff6b35]/15 dark:bg-[#ff6b35]/20 hover:bg-[#ff6b35]/25 dark:hover:bg-[#ff6b35]/30 text-[#ea580c] dark:text-[#ff8a65] shadow-2xs transition-all duration-200 active:scale-[0.98]"
          >
            Create Free Account
          </Link>
          <a
            href="#exams"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold border border-blue-500/80 dark:border-blue-400/60 bg-blue-500/15 dark:bg-blue-500/20 hover:bg-blue-500/25 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 shadow-2xs transition-all duration-200 active:scale-[0.98]"
          >
            Explore Exam Tracks
          </a>
        </div>

        <PulseLine variant="divider" className="mt-12" />
      </div>
    </section>
  );
}
