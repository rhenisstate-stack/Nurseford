import Link from "next/link";

const examNames = [
  "RN Nursing Exam",
  "LPN Nursing Exam",
  "RN Exit Exams",
  "LPN Exit Exams",
];

export default function ShopTeaser() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
            Rhenis Shop
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            Study Materials You Can Own
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Downloadable PDF &amp; WORD study documents for every exam track.
            Each pack is crafted by nursing educators and ready to print or
            study on any device.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <article className="rounded-2xl border border-black/50 dark:border-border bg-[#EEF3FE] dark:bg-paper-dim p-7 flex flex-col shadow-xs hover:shadow-md transition-all duration-200">
            <h3 className="font-serif text-lg font-semibold text-navy mb-3">
              All Exam Packs
            </h3>
            <p className="text-sm text-navy/70 leading-relaxed mb-6">
              {examNames.map((name, i) => (
                <span key={name}>
                  {i > 0 && <span className="text-navy/30 mx-1">|</span>}
                  {name}
                </span>
              ))}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl font-semibold text-navy">
                From $49
              </span>
              <Link
                href="/pages/resources"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
              >
                Browse Shop
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
