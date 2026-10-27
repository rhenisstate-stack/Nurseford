'use client';

import { useMemo, useEffect } from "react";
import { SystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { getUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";
import {
  useDiscreteDominionSubscriptionPackages,
  DiscreteSubscriptionPackage,
  UserSubscriptionPackage,
} from "./dicreate/useDiscreteDominionSubscriptionPackages";

// Maps a package's terminalClusterTableName to the matching guid field on the exam
// (Matches origin-repo/main access control hierarchy exactly)
export const TABLE_TO_EXAM_GUID_FIELD: Record<string, string> = {
  strata_programs: "programGuidId",
  programs: "programGuidId",
  program: "programGuidId",
  strata_courses: "courseGuidId",
  courses: "courseGuidId",
  course: "courseGuidId",
  strata_subjects: "subjectGuidId",
  subjects: "subjectGuidId",
  subject: "subjectGuidId",
  strata_units: "unitGuidId",
  units: "unitGuidId",
  unit: "unitGuidId",
  strata_lessons: "lessonGuidId",
  lessons: "lessonGuidId",
  lesson: "lessonGuidId",
  strata_topics: "topicGuidId",
  topics: "topicGuidId",
  topic: "topicGuidId",
  strata_concepts: "conceptGuidId",
  concepts: "conceptGuidId",
  concept: "conceptGuidId",
  strata_facts: "factGuidId",
  facts: "factGuidId",
  fact: "factGuidId",
};

/**
 * Universal passes cover all exams platform-wide
 */
export function isUniversalPackage(pkg: DiscreteSubscriptionPackage): boolean {
  const name = (pkg.name || "").toLowerCase();
  const cluster = (pkg.terminalClusterName || "").toLowerCase();
  const target = (pkg.target || "").toLowerCase();
  const combined = `${name} ${cluster} ${target}`;

  return (
    combined.includes("all access") ||
    combined.includes("all-access") ||
    combined.includes("all plans") ||
    combined.includes("complete pass") ||
    combined.includes("ultimate pass") ||
    combined.includes("master pass")
  );
}

/**
 * Normalizes program slugs into family domains
 * (e.g. rn-nursing and nclex-rn both belong to 'rn'; lpn-nursing and nclex-pn belong to 'pn')
 */
export function getProgramFamily(slug: string): string {
  const p = (slug || "").toLowerCase().trim();
  if (
    p === "rn-nursing" ||
    p === "nclex-rn" ||
    (p.includes("rn") && !p.includes("pn") && !p.includes("lpn"))
  ) {
    return "rn";
  }
  if (
    p === "lpn-nursing" ||
    p === "nclex-pn" ||
    p.includes("pn") ||
    p.includes("lpn")
  ) {
    return "pn";
  }
  if (p === "ati-teas" || p.includes("teas")) return "teas";
  if (p === "hesi-a2" || p.includes("hesi")) return "hesi";
  if (p === "cna" || p.includes("cna")) return "cna";
  if (p === "ged" || p.includes("ged")) return "ged";
  return p;
}

/**
 * Strict slug/name/target matching for fallback when hierarchy GUIDs are not available on exam
 */
export function packageMatchesExamSlug(
  pkg: DiscreteSubscriptionPackage,
  programSlug: string = ""
): boolean {
  const p = (programSlug || "").toLowerCase().trim();
  const name = (pkg.name || "").toLowerCase();
  const cluster = (pkg.terminalClusterName || "").toLowerCase();
  const target = (pkg.target || "").toLowerCase();
  const combined = `${name} ${cluster} ${target}`;

  // ATI TEAS
  if (p === "ati-teas" || p.includes("teas")) {
    return (
      combined.includes("teas") ||
      cluster.includes("teas") ||
      cluster.includes("ati") ||
      target.includes("teas")
    );
  }

  // HESI A2
  if (p === "hesi-a2" || p.includes("hesi")) {
    return combined.includes("hesi") || target.includes("hesi");
  }

  // RN Nursing / NCLEX-RN (must be RN, explicitly NOT PN or LPN)
  if (
    p === "rn-nursing" ||
    p === "nclex-rn" ||
    (p.includes("rn") && !p.includes("pn") && !p.includes("lpn"))
  ) {
    const isPn = /\b(pn|lpn|nclex-?pn|practical)\b/i.test(combined);
    if (isPn) return false;
    return (
      /\b(rn|nclex-?rn|registered\s*nurse)\b/i.test(combined) ||
      combined.includes("rn")
    );
  }

  // LPN / PN Nursing / NCLEX-PN (must be PN or LPN)
  if (
    p === "lpn-nursing" ||
    p === "nclex-pn" ||
    p.includes("pn") ||
    p.includes("lpn")
  ) {
    return (
      /\b(pn|lpn|nclex-?pn|practical)\b/i.test(combined) ||
      combined.includes("pn") ||
      combined.includes("lpn")
    );
  }

  // CNA
  if (p === "cna" || p.includes("cna")) {
    return /\b(cna)\b/i.test(combined);
  }

  // GED
  if (p === "ged" || p.includes("ged")) {
    return /\b(ged)\b/i.test(combined);
  }

  // Pre-Nursing
  if (p === "pre-nursing" || p.includes("pre-nursing")) {
    return /\b(pre-?nursing)\b/i.test(combined);
  }

  // Certification
  if (p === "certification" || p.includes("certification")) {
    return /\b(cert|certification)\b/i.test(combined);
  }

  return false;
}

/**
 * Tests if a package matches an exam using origin-repo hierarchy logic with slug and name fallback
 */
export function packageMatchesExam(
  pkg: DiscreteSubscriptionPackage,
  exam: any | null | undefined,
  programSlug: string = ""
): boolean {
  if (isUniversalPackage(pkg)) return true;

  if (exam && pkg.terminalClusterTableName && pkg.terminalClusterGuidId) {
    const guidField = TABLE_TO_EXAM_GUID_FIELD[pkg.terminalClusterTableName];
    if (guidField && exam[guidField]) {
      return (
        String(exam[guidField]).toLowerCase().trim() ===
        String(pkg.terminalClusterGuidId).toLowerCase().trim()
      );
    }
  }

  // Check if cluster name or package name matches exam program/course/subject/title
  if (exam) {
    const clusterName = (pkg.terminalClusterName || "").toLowerCase().trim();
    if (clusterName) {
      const pName = (exam.programName || "").toLowerCase();
      const cName = (exam.courseName || "").toLowerCase();
      const sName = (exam.subjectName || exam.title || "").toLowerCase();
      if (
        (pName && (pName.includes(clusterName) || clusterName.includes(pName))) ||
        (cName && (cName.includes(clusterName) || clusterName.includes(cName))) ||
        (sName && (sName.includes(clusterName) || clusterName.includes(sName)))
      ) {
        return true;
      }
    }
  }

  return packageMatchesExamSlug(pkg, programSlug);
}

/**
 * Checks whether an ISO or SQL date string is expired.
 * Handles SQL/Postgres/MySQL placeholder dates ('0000-12-31', '0001-01-01', year < 2000)
 * which signify an indefinite / lifetime unexpiring plan.
 */
export function isDateExpired(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const raw = dateStr.trim();
  if (!raw) return false;
  if (raw.startsWith("0000") || raw.startsWith("0001")) return false;
  const expiry = new Date(raw);
  if (isNaN(expiry.getTime())) return false;
  if (expiry.getFullYear() < 2000) return false;
  return expiry < new Date();
}

/**
 * Checks whether a start date is set in the future.
 */
export function isDateInFuture(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const raw = dateStr.trim();
  if (!raw) return false;
  if (raw.startsWith("0000") || raw.startsWith("0001")) return false;
  const start = new Date(raw);
  if (isNaN(start.getTime())) return false;
  if (start.getFullYear() < 2000) return false;
  return start > new Date();
}

/**
 * Checks if a specific UserSubscription record is active, paid, and unexpired
 * (Direct 1:1 implementation from origin-repo/main subscriptionIsActive with SQL date-placeholder safety)
 */
export function subscriptionIsActive(sub: UserSubscriptionPackage): boolean {
  const status = (sub.subscriptionStatus || "").trim().toLowerCase();
  const paid = (sub.subscriptionHasPaid || "").trim().toLowerCase();

  // Status must be Active and Payment must be Yes (or Paid)
  const isActive =
    status === "active" ||
    status === "valid" ||
    status === "approved" ||
    status === "completed" ||
    status === "current" ||
    status === "live";

  const isPaid =
    paid === "yes" ||
    paid === "paid" ||
    paid === "true" ||
    paid === "1" ||
    paid === "completed" ||
    paid === "approved" ||
    paid === "success";

  if (!isActive || !isPaid) {
    return false;
  }

  if (isDateInFuture(sub.validFrom)) {
    return false;
  }
  if (isDateExpired(sub.validUntil)) {
    return false;
  }

  return true;
}

/**
 * Checks if a specific Provider subscription record (Stripe, Paystack, etc.) is active and unexpired
 */
function isProviderSubscriptionActive(pSub: any): boolean {
  if (!pSub) return false;
  const status = String(
    pSub.status || pSub.subscriptionStatus || pSub.providerStatus || ""
  )
    .trim()
    .toLowerCase();
  const isActive =
    status === "active" ||
    status === "valid" ||
    status === "approved" ||
    status === "completed" ||
    status === "current" ||
    status === "live" ||
    status === "trialing";

  if (!isActive) return false;

  const start =
    pSub.validFrom ||
    pSub.currentPeriodStart ||
    pSub.startTime ||
    pSub.purchaseDate;
  if (isDateInFuture(start)) return false;

  const expiry =
    pSub.validUntil ||
    pSub.currentPeriodEnd ||
    pSub.nextPaymentDate ||
    pSub.nextDueDate ||
    pSub.nextBillingTime ||
    pSub.nextBillingOrPeriodEnd ||
    pSub.expiresDate;
  if (isDateExpired(expiry)) return false;

  return true;
}

/**
 * A package is active and paid if the logged-in user actually has an active subscription
 * in userSubscriptions OR in any of the payment provider subscription sub-arrays.
 */
export function isPackageActiveAndPaid(pkg: DiscreteSubscriptionPackage): boolean {
  if (
    Array.isArray(pkg.userSubscriptions) &&
    pkg.userSubscriptions.some(subscriptionIsActive)
  ) {
    return true;
  }

  if (
    Array.isArray(pkg.stripeSubscriptions) &&
    pkg.stripeSubscriptions.some(isProviderSubscriptionActive)
  )
    return true;
  if (
    Array.isArray(pkg.payStackSubscriptions) &&
    pkg.payStackSubscriptions.some(isProviderSubscriptionActive)
  )
    return true;
  if (
    Array.isArray(pkg.payPalSubscriptions) &&
    pkg.payPalSubscriptions.some(isProviderSubscriptionActive)
  )
    return true;
  if (
    Array.isArray(pkg.flutterWaveSubscriptions) &&
    pkg.flutterWaveSubscriptions.some(isProviderSubscriptionActive)
  )
    return true;
  if (
    Array.isArray(pkg.intaSendSubscriptions) &&
    pkg.intaSendSubscriptions.some(isProviderSubscriptionActive)
  )
    return true;
  if (
    Array.isArray(pkg.appleSubscriptions) &&
    pkg.appleSubscriptions.some(isProviderSubscriptionActive)
  )
    return true;
  if (
    Array.isArray(pkg.mPesaSubscriptions) &&
    pkg.mPesaSubscriptions.some(isProviderSubscriptionActive)
  )
    return true;

  return false;
}

export function useExamSubscriptionAccess({
  user,
  isGuest,
  programSlug,
  exam,
}: {
  user: SystemUser | null;
  isGuest: boolean;
  programSlug: string;
  exam?: any | null;
}) {
  const {
    filteredSubscriptionPackages,
    loading: subscriptionsLoading,
    refresh: refreshSubscriptions,
  } = useDiscreteDominionSubscriptionPackages({ page: 1, perPage: 200 });

  // Resolve stable username even if user state is momentarily revalidating
  const username = useMemo(() => {
    if (user?.userName && user.userName.toLowerCase() !== "guest") {
      return user.userName.toLowerCase().trim();
    }
    const cookieUser = getUsernameCookie();
    if (cookieUser && cookieUser.toLowerCase() !== "guest") {
      return cookieUser.toLowerCase().trim();
    }
    return null;
  }, [user?.userName]);

  const programFamily = useMemo(
    () => getProgramFamily(programSlug),
    [programSlug]
  );

  // Persistent Cross-Tab & Cross-Slug Cache (LocalStorage + SessionStorage)
  // Guarantees that once a user is verified as subscribed, network hiccups,
  // tab changes, or backend JWT expirations NEVER demote them to 30% paywall.
  const persistentCached = useMemo(() => {
    if (typeof window === "undefined" || !username || isGuest) return false;
    try {
      const slugLower = (programSlug || "").toLowerCase().trim();
      const directKey = `user_sub_${username}_${slugLower}`;
      const familyKey = `user_sub_family_${username}_${programFamily}`;
      const universalKey = `user_sub_universal_${username}`;

      // 1. Check universal platform access
      if (
        localStorage.getItem(universalKey) === "true" ||
        sessionStorage.getItem(universalKey) === "true"
      ) {
        return true;
      }

      // 2. Check direct program slug (e.g. rn-nursing)
      if (
        localStorage.getItem(directKey) === "true" ||
        sessionStorage.getItem(directKey) === "true"
      ) {
        return true;
      }

      // 3. Check program family (e.g. rn covers both nclex-rn and rn-nursing; pn covers nclex-pn and lpn-nursing)
      if (
        localStorage.getItem(familyKey) === "true" ||
        sessionStorage.getItem(familyKey) === "true"
      ) {
        return true;
      }

      // 4. Check active subscription detail with unexpired validUntil
      const detailRaw =
        localStorage.getItem(`user_sub_detail_${username}_${programFamily}`) ||
        sessionStorage.getItem(`user_sub_detail_${username}_${programFamily}`);
      if (detailRaw) {
        try {
          const parsed = JSON.parse(detailRaw);
          if (parsed?.subscribed && !isDateExpired(parsed.validUntil)) {
            return true;
          }
        } catch {}
      }

      return false;
    } catch {
      return false;
    }
  }, [username, programSlug, programFamily, isGuest]);

  const hasDatabaseSubscription = useMemo(() => {
    // If explicitly marked as guest or packages haven't loaded yet, not subscribed
    if (
      isGuest ||
      !filteredSubscriptionPackages ||
      filteredSubscriptionPackages.length === 0
    ) {
      return false;
    }

    return filteredSubscriptionPackages.some((pkg) => {
      // Must be actively purchased by this user
      const active = isPackageActiveAndPaid(pkg);
      if (!active) return false;
      return packageMatchesExam(pkg, exam, programSlug);
    });
  }, [isGuest, filteredSubscriptionPackages, exam, programSlug]);

  const isSubscribed = useMemo(() => {
    if (isGuest) return false;
    // 1. If database currently confirms active subscription, user is subscribed
    if (hasDatabaseSubscription) return true;
    // 2. If user already proved active subscription in this browser, keep access permanently active!
    // Background token expiration or empty API responses will NEVER revoke access mid-exam!
    if (persistentCached) return true;
    // 3. Otherwise, if query is still loading and we have no prior proof, wait
    if (subscriptionsLoading) return false;
    return false;
  }, [isGuest, hasDatabaseSubscription, persistentCached, subscriptionsLoading]);

  // Cache confirmed subscriptions in both localStorage (permanent) and sessionStorage
  useEffect(() => {
    if (typeof window === "undefined" || !username || isGuest) return;

    if (hasDatabaseSubscription) {
      try {
        const slugLower = (programSlug || "").toLowerCase().trim();
        const directKey = `user_sub_${username}_${slugLower}`;
        const familyKey = `user_sub_family_${username}_${programFamily}`;
        const universalKey = `user_sub_universal_${username}`;

        localStorage.setItem(directKey, "true");
        localStorage.setItem(familyKey, "true");
        sessionStorage.setItem(directKey, "true");
        sessionStorage.setItem(familyKey, "true");

        // Cache any active subscription expiry date
        const activeSub = filteredSubscriptionPackages
          ?.filter(
            (pkg) =>
              isPackageActiveAndPaid(pkg) &&
              packageMatchesExam(pkg, exam, programSlug)
          )
          ?.flatMap((pkg) => pkg.userSubscriptions || [])
          ?.find(subscriptionIsActive);

        if (activeSub) {
          localStorage.setItem(
            `user_sub_detail_${username}_${programFamily}`,
            JSON.stringify({
              subscribed: true,
              validUntil: activeSub.validUntil || null,
              cachedAt: Date.now(),
            })
          );
        }

        const hasUniversal = filteredSubscriptionPackages?.some(
          (pkg) => isUniversalPackage(pkg) && isPackageActiveAndPaid(pkg)
        );
        if (hasUniversal) {
          localStorage.setItem(universalKey, "true");
          sessionStorage.setItem(universalKey, "true");
        }
      } catch {}
    }
  }, [
    hasDatabaseSubscription,
    filteredSubscriptionPackages,
    username,
    programSlug,
    programFamily,
    exam,
    isGuest,
  ]);

  // Only evict subscription cache on explicit user logout
  useEffect(() => {
    const handleLogout = () => {
      if (typeof window !== "undefined") {
        try {
          const localKeys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("user_sub_")) localKeys.push(k);
          }
          localKeys.forEach((k) => localStorage.removeItem(k));

          const sessionKeys: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith("user_sub_")) sessionKeys.push(k);
          }
          sessionKeys.forEach((k) => sessionStorage.removeItem(k));
        } catch {}
      }
    };

    window.addEventListener("session:logout", handleLogout);
    return () => window.removeEventListener("session:logout", handleLogout);
  }, []);

  return {
    isSubscribed,
    hasDatabaseSubscription,
    subscriptionsLoading,
    filteredSubscriptionPackages,
    refreshSubscriptions,
  };
}
