import type { StudyDoc } from "@/lib/data/study-materials";

interface ShopCardProps {
  doc: StudyDoc;
}

export default function ShopCard({ doc }: ShopCardProps) {
  return (
    <article className="rounded-2xl border border-black/50 dark:border-border bg-paper-dim p-7 flex flex-col transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl">
      <h3 className="font-serif text-lg font-semibold text-navy mb-2">
        {doc.title}
      </h3>
      <div className="flex gap-2 mb-4">
        {doc.formats.map((fmt) => (
          <span
            key={fmt}
            className="inline-block px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-paper text-navy/50 border border-border uppercase"
          >
            {fmt}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-serif text-xl font-semibold text-navy">
          ${doc.price}
        </span>
        <a
          href="/pages/resources"
          className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
        >
          Get Now
        </a>
      </div>
    </article>
  );
}
