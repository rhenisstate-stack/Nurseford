import Link from "next/link";

interface ShopSummaryButtonsProps {
  category: string;
}

export default function ShopSummaryButtons({ category }: ShopSummaryButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-10">
      <Link
        href="/pages/resources"
        className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
      >
        ACCESS {category.toUpperCase()} Q BANK
      </Link>
      <Link
        href="/pages/resources"
        className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
      >
        BUY NURSEFORD PDF/WORD DOCS
      </Link>
    </div>
  );
}
