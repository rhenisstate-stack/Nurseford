"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { getStoredSelectedExam } from "@/lib/constants/dashboards/examSelectionStorage";
import { EXAM_OPTION_MAP } from "@/lib/constants/dashboards/examOptions";

export default function DashboardsIndexPage() {
  const router = useRouter();
  const { user, loading } = useCurrentSystemUser();

  useEffect(() => {
    if (loading) return;

    // 1. Check user profile / category
    const categoryTarget = user?.categories?.[0]?.target?.toLowerCase() || "";
    const categoryDashboard = user?.categories?.[0]?.dashboard?.toLowerCase() || "";
    const userRoleDashboard = (user as { dashboardName?: string })?.dashboardName?.toLowerCase() || "";

    const candidate = [categoryTarget, categoryDashboard, userRoleDashboard].find(
      (slug) => slug && slug !== "current" && slug !== "web" && EXAM_OPTION_MAP[slug]
    );

    if (candidate) {
      router.replace(`/dashboards/${candidate}`);
      return;
    }

    // 2. Check stored user selection preference
    const stored = getStoredSelectedExam();
    if (stored && EXAM_OPTION_MAP[stored]) {
      router.replace(`/dashboards/${stored}`);
      return;
    }

    // 3. Default to RN Nursing Dashboard
    router.replace("/dashboards/rn-nursing");
  }, [user, loading, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors"
      style={{ backgroundColor: "var(--content-bg, #001326)", color: "var(--text-color, #ffffff)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        <p className="text-xs sm:text-sm text-navy/70 dark:text-white/70 font-mono tracking-wide">
          Connecting to your dashboard . . .
        </p>
      </div>
    </div>
  );
}
