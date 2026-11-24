"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
import {
  useDiscreteDominionSubscriptionPackages,
  DiscreteSubscriptionPackage,
} from "@/lib/hooks/nexus/subscription/packages/dicreate/useDiscreteDominionSubscriptionPackages";
import {
  AccessGate,
  type OtherSubscription,
} from "@/components/common/dashboards/modals/AccessReminderModals";

const PANELS: Record<string, string> = {
  "ati-teas": "ATI TEAS",
  "hesi-a2": "HESI A2",
  "pre-nursing": "Pre Nursing",
  "rn-nursing": "RN Nursing",
  "lpn-nursing": "LPN Nursing",
  "nclex-rn": "NCLEX RN",
  "nclex-pn": "NCLEX PN",
  "rn-exit": "RN Exit",
  "lpn-exit": "LPN Exit",
  certification: "Certification",
};

type PkgWithCluster = DiscreteSubscriptionPackage & {
  terminalClusterTableName?: string;
  terminalClusterGuidId?: string;
};

function PanelGate({ slug }: { slug: string }) {
  const segment = slug.toUpperCase().replace(/-/g, "_");
  const { user, loading: isUserLoading } = useCurrentSystemUser();
  const { programs } = useRelativeStrataPrograms();
  const { filteredSubscriptionPackages } = useDiscreteDominionSubscriptionPackages({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const isEmailVerified = useMemo(() => {
    const u = user as unknown as {
      emailVerified?: boolean;
      isEmailVerified?: boolean;
      emailVerifiedAt?: string | null;
    } | null;
    if (!u) return false;
    if (u.emailVerified !== undefined) return !!u.emailVerified;
    if (u.isEmailVerified !== undefined) return !!u.isEmailVerified;
    if (u.emailVerifiedAt !== undefined) return !!u.emailVerifiedAt;
    return true;
  }, [user]);

  const hasActiveSubscription = useMemo(() => {
    const ids = new Set(programs.filter((p) => p.segment === segment).map((p) => p.guidId));
    return filteredSubscriptionPackages.some((pkg) => {
      const p = pkg as PkgWithCluster;
      return (
        p.terminalClusterTableName === "strata_programs" &&
        !!p.terminalClusterGuidId &&
        ids.has(p.terminalClusterGuidId) &&
        !!p.userSubscriptions?.some((s) => s.subscriptionStatus === "Active")
      );
    });
  }, [filteredSubscriptionPackages, programs, segment]);

  const otherSubscriptions = useMemo<OtherSubscription[]>(() => {
    const out: OtherSubscription[] = [];
    const seen = new Set<string>();
    filteredSubscriptionPackages.forEach((pkg) => {
      const p = pkg as PkgWithCluster;
      if (p.terminalClusterTableName !== "strata_programs" || !p.terminalClusterGuidId) return;
      if (!p.userSubscriptions?.some((s) => s.subscriptionStatus === "Active")) return;
      const program = programs.find((x) => x.guidId === p.terminalClusterGuidId);
      if (!program || program.segment === segment) return;
      const otherSlug = (program.segment ?? "").toLowerCase().replace(/_/g, "-");
      if (!PANELS[otherSlug] || seen.has(otherSlug)) return;
      seen.add(otherSlug);
      out.push({ name: program.name ?? PANELS[otherSlug], href: `/dashboards/${otherSlug}` });
    });
    return out;
  }, [filteredSubscriptionPackages, programs, segment]);

  return (
    <AccessGate
      isUserLoading={isUserLoading}
      isLoggedIn={!!user}
      isEmailVerified={isEmailVerified}
      hasActiveSubscription={hasActiveSubscription}
      otherSubscriptions={otherSubscriptions}
      panelName={PANELS[slug]}
      badge={segment.replace(/_/g, " ")}
      loginHref={`/dashboards/${slug}/auth/login`}
      verifyHref={`/dashboards/${slug}/auth/account/verify/email`}
      packagesHref={`/dashboards/${slug}/vista/subscriptions/items`}
      homeHref="/"
      lock
    />
  );
}

export default function DashboardsAccessGate() {
  const pathname = usePathname() ?? "";
  const parts = pathname.split("/").filter(Boolean);

  // Only /dashboards/<known-panel>/...  (admin, home, everything else untouched)
  if (parts[0] !== "dashboards" || !PANELS[parts[1]]) return null;

  // Never gate the auth pages
  if (parts[2] === "auth") return null;

  // Exams list is gated on "Start Exam" / "Exam Builder" click instead
  if (parts[2] === "exams") return null;
  if (parts[2] === "vista" && parts[3] === "assessment" && parts[4] === "exams") return null;

  return <PanelGate key={parts[1]} slug={parts[1]} />;
}