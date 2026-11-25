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
  packageMatchesExamSlug,
  isPackageActiveAndPaid,
} from "@/lib/hooks/nexus/subscription/packages/useExamSubscriptionAccess";
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

  const matchingSegments = useMemo(() => {
    const s = slug.toLowerCase();
    if (s === "lpn-nursing" || s === "nclex-pn" || s === "lpn-exit") {
      return ["LPN_NURSING", "NCLEX_PN", "LPN_EXIT"];
    }
    if (s === "rn-nursing" || s === "nclex-rn" || s === "rn-exit") {
      return ["RN_NURSING", "NCLEX_RN", "RN_EXIT"];
    }
    return [segment];
  }, [slug, segment]);

  const hasActiveSubscription = useMemo(() => {
    const ids = new Set(
      programs
        .filter((p) => matchingSegments.includes((p.segment ?? "").toUpperCase().trim()))
        .map((p) => p.guidId)
    );

    return filteredSubscriptionPackages.some((pkg) => {
      const p = pkg as PkgWithCluster;
      const isPaid = isPackageActiveAndPaid(pkg);
      if (!isPaid) return false;

      const tbl = (p.terminalClusterTableName ?? "").toLowerCase();
      const isProgramTbl = tbl === "strata_programs" || tbl === "programs" || tbl === "program";

      // 1. Direct GUID cluster match
      if (isProgramTbl && p.terminalClusterGuidId && ids.has(p.terminalClusterGuidId)) {
        return true;
      }

      // 2. Target segment match
      const target = (pkg.target ?? "").toUpperCase().trim();
      if (matchingSegments.includes(target)) {
        return true;
      }

      // 3. Exam slug / name match
      if (packageMatchesExamSlug(pkg, slug)) {
        return true;
      }

      return false;
    });
  }, [filteredSubscriptionPackages, programs, matchingSegments, slug]);

  const otherSubscriptions = useMemo<OtherSubscription[]>(() => {
    const out: OtherSubscription[] = [];
    const seen = new Set<string>();
    filteredSubscriptionPackages.forEach((pkg) => {
      const p = pkg as PkgWithCluster;
      const isPaid = isPackageActiveAndPaid(pkg);
      if (!isPaid) return;

      // If it matches current track, it is not an "other" subscription
      if (packageMatchesExamSlug(pkg, slug)) return;
      const target = (pkg.target ?? "").toUpperCase().trim();
      if (matchingSegments.includes(target)) return;

      const program = programs.find((x) => x.guidId === p.terminalClusterGuidId);
      if (program && matchingSegments.includes((program.segment ?? "").toUpperCase().trim())) return;

      const otherSlug = (program?.segment ?? pkg.target ?? "").toLowerCase().replace(/_/g, "-");
      if (!PANELS[otherSlug] || seen.has(otherSlug)) return;
      seen.add(otherSlug);
      out.push({ name: program?.name ?? PANELS[otherSlug], href: `/dashboards/${otherSlug}` });
    });
    return out;
  }, [filteredSubscriptionPackages, programs, matchingSegments, slug]);

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

  // Never gate subscription purchase or management pages
  if (parts[2] === "vista" && parts[3] === "subscriptions") return null;

  // Exams list is gated on "Start Exam" / "Exam Builder" click instead
  if (parts[2] === "exams") return null;
  if (parts[2] === "vista" && parts[3] === "assessment" && parts[4] === "exams") return null;

  return <PanelGate key={parts[1]} slug={parts[1]} />;
}