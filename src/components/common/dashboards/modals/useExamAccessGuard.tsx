"use client";

import { useCallback, useMemo, useState } from "react";
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
import { ReminderModal } from "@/components/common/dashboards/modals/AccessReminderModals";

type PkgWithCluster = DiscreteSubscriptionPackage & {
  terminalClusterTableName?: string;
  terminalClusterGuidId?: string;
};

type Reason = null | "login" | "verify" | "subscribe";

export function useExamAccessGuard(slug: string, panelName: string) {
  const segment = slug.toUpperCase().replace(/-/g, "_");
  const badge = segment.replace(/_/g, " ");
  const loginHref = `/dashboards/${slug}/auth/login`;
  const verifyHref = `/dashboards/${slug}/auth/account/verify/email`;
  const packagesHref = `/dashboards/${slug}/vista/subscriptions/items`;

  const { user, loading } = useCurrentSystemUser();
  const { programs } = useRelativeStrataPrograms();
  const { filteredSubscriptionPackages, loading: subscriptionsLoading } = useDiscreteDominionSubscriptionPackages({
    page: 1,
    perPage: 100,
    sortColumn: null,
    sortDirection: "asc",
  });

  const [reason, setReason] = useState<Reason>(null);

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

  const otherSubscriptions = useMemo(() => {
    const out: { name: string; href: string }[] = [];
    const seen = new Set<string>();
    filteredSubscriptionPackages.forEach((pkg) => {
      const p = pkg as PkgWithCluster;
      const isPaid = isPackageActiveAndPaid(pkg);
      if (!isPaid) return;

      if (packageMatchesExamSlug(pkg, slug)) return;
      const target = (pkg.target ?? "").toUpperCase().trim();
      if (matchingSegments.includes(target)) return;

      const program = programs.find((x) => x.guidId === p.terminalClusterGuidId);
      if (program && matchingSegments.includes((program.segment ?? "").toUpperCase().trim())) return;

      const otherSlug = (program?.segment ?? pkg.target ?? "").toLowerCase().replace(/_/g, "-");
      if (!otherSlug || seen.has(otherSlug)) return;
      seen.add(otherSlug);
      out.push({ name: program?.name ?? otherSlug, href: `/dashboards/${otherSlug}` });
    });
    return out;
  }, [filteredSubscriptionPackages, programs, matchingSegments, slug]);

  const close = useCallback(() => setReason(null), []);

  /** Runs all checks. Calls onPass only if everything is valid. */
  const guard = useCallback(
    (needsSubscription: boolean, onPass: () => void) => {
      if (loading || subscriptionsLoading) return;
      if (!user) return setReason("login");
      if (!isEmailVerified) return setReason("verify");
      if (needsSubscription && !hasActiveSubscription) return setReason("subscribe");
      onPass();
    },
    [loading, subscriptionsLoading, user, isEmailVerified, hasActiveSubscription]
  );

  let modal: React.ReactNode = null;

  if (reason === "login") {
    modal = (
      <ReminderModal
        isOpen
        onClose={close}
        step={1}
        icon="🔐"
        tone="blue"
        badge={badge}
        title={`Log in to Start ${panelName} Exams`}
        description="You need an account to take exams, track your progress and keep your results."
        points={["Track your progress", "Save your exam results", "Unlock your subscription"]}
        primaryLabel="Log In Now"
        primaryHref={loginHref}
        secondaryLabel="Not Now"
        onPrimary={close}
      />
    );
  } else if (reason === "verify") {
    modal = (
      <ReminderModal
        isOpen
        onClose={close}
        step={2}
        icon="✉️"
        tone="amber"
        badge={badge}
        title="Verify your email to continue"
        description="Confirm your email to protect your account and start exams."
        points={["Check your inbox and spam folder", "Click the verification link", "Come back and start your exam"]}
        primaryLabel="Verify My Email"
        primaryHref={verifyHref}
        secondaryLabel="Not Now"
        onPrimary={close}
      />
    );
  } else if (reason === "subscribe") {
    const first = otherSubscriptions[0];
    modal = first ? (
      <ReminderModal
        isOpen
        onClose={close}
        step={3}
        icon="🧭"
        tone="violet"
        badge={badge}
        title={`You're Subscribed To ${first.name}`}
        description={`Your active plan doesn't include ${panelName}. Continue to your subscribed dashboard, or add ${panelName} with one of our easy plans.`}
        points={otherSubscriptions.map((s) => `✓ Subscribed: ${s.name}`)}
        primaryLabel={`Take me to ${first.name}`}
        primaryHref={first.href}
        tertiaryLabel={`🚀 Open our easy plans for ${panelName}`}
        tertiaryHref={packagesHref}
        secondaryLabel={`Stay in ${panelName}`}
        onPrimary={close}
      />
    ) : (
      <ReminderModal
        isOpen
        onClose={close}
        step={3}
        icon="⭐"
        tone="emerald"
        badge={badge}
        title={`Unlock full access to ${panelName}`}
        description="You need an active subscription to start this exam."
        points={["Full exam library", "Detailed explanations", "Progress tracking"]}
        primaryLabel="View Subscription Packages"
        primaryHref={packagesHref}
        secondaryLabel="Not Now"
        onPrimary={close}
      />
    );
  }

  return { guard, modal };
}