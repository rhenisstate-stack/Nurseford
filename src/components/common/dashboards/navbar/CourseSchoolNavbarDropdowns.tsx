"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CreditCard } from "lucide-react";

export function CourseSchoolNavbarDropdowns() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const track = searchParams?.get("track") || "";

  // Extract panel from pathname or track param
  const panelSlug = useMemo(() => {
    const match = pathname?.match(/\/dashboards\/([^/]+)/);
    if (match) return match[1];
    if (pathname?.includes("lpn") || pathname?.includes("nclex-pn") || track === "lpn" || track === "exit") {
      return "lpn-nursing";
    }
    return "rn-nursing";
  }, [pathname, track]);

  return (
    <div className="flex items-center shrink-0">
      {/* ─── SUBSCRIBE PLANS BUTTON ─── */}
      <Link
        href={`/dashboards/${panelSlug}/vista/subscriptions/items`}
        className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold
          bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-700 hover:to-emerald-700
          text-white shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 whitespace-nowrap cursor-pointer select-none shrink-0"
        title="View Subscription Plans"
      >
        <CreditCard className="w-3.5 h-3.5 text-white/90 shrink-0" />
        <span className="hidden sm:inline font-semibold text-white text-[11px] sm:text-xs">Subscribe</span>
        <span className="hidden xl:inline font-normal text-white/90">Plans</span>
      </Link>
    </div>
  );
}

export default CourseSchoolNavbarDropdowns;
