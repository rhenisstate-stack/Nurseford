"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProgressAbsoluteRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboards/rn-nursing/vista/stats/progress");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-sm font-bold opacity-60">Redirecting to My Progress...</p>
    </div>
  );
}
