"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function OverviewRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  useEffect(() => {
    if (action === "readiness") {
      router.replace("/dashboards/nclex-pn/practice/domains/111");
    } else {
      router.replace("/dashboards/nclex-pn/practice/domains/110");
    }
  }, [action, router]);

  return null;
}

export default function NclexPnPracticeOverviewPage() {
  return (
    <Suspense fallback={null}>
      <OverviewRedirect />
    </Suspense>
  );
}