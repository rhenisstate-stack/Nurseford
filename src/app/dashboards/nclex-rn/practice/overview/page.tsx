"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function OverviewRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  useEffect(() => {
    if (action === "readiness") {
      router.replace("/dashboards/nclex-rn/practice/domains/121");
    } else {
      router.replace("/dashboards/nclex-rn/practice/domains/120");
    }
  }, [action, router]);

  return null;
}

export default function NclexRnPracticeOverviewPage() {
  return (
    <Suspense fallback={null}>
      <OverviewRedirect />
    </Suspense>
  );
}