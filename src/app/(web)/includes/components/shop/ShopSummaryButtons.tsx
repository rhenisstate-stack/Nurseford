import Link from "next/link";

interface ShopSummaryButtonsProps {
  category: string;
}

export default function ShopSummaryButtons({ category }: ShopSummaryButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-10">
      <Link
        href="/pages/resources"
        className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold border border-[#ff6b35]/80 dark:border-[#ff6b35]/60 bg-[#ff6b35]/15 dark:bg-[#ff6b35]/20 hover:bg-[#ff6b35]/25 dark:hover:bg-[#ff6b35]/30 text-[#ea580c] dark:text-[#ff8a65] shadow-2xs transition-all duration-200 active:scale-[0.98]"
      >
        ACCESS {category.toUpperCase()} Q BANK
      </Link>
      <Link
        href="/pages/resources"
        className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold border border-blue-500/80 dark:border-blue-400/60 bg-blue-500/15 dark:bg-blue-500/20 hover:bg-blue-500/25 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 shadow-2xs transition-all duration-200 active:scale-[0.98]"
      >
        BUY NURSEFORD PDF/WORD DOCS
      </Link>
    </div>
  );
}
