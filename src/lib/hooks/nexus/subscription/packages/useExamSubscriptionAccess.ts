'use client';

import { useMemo, useEffect } from "react";
import { SystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
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
 * Strict slug/name matching for fallback when hierarchy GUIDs are not available on exam
 */
export function packageMatchesExamSlug(
  pkg: DiscreteSubscriptionPackage,
  programSlug: string = ""
): boolean {
  const p = (programSlug || "").toLowerCase();
  const name = (pkg.name || "").toLowerCase();
  const cluster = (pkg.terminalClusterName || "").toLowerCase();
  const combined = `${name} ${cluster}`;

  // ATI TEAS
  if (p === "ati-teas" || p.includes("teas")) {
    return combined.includes("teas") || cluster.includes("teas") || cluster.includes("ati");
  }

  // HESI A2
  if (p === "hesi-a2" || p.includes("hesi")) {
    return combined.includes("hesi");
  }

  // RN Nursing / NCLEX-RN (must be RN, explicitly NOT PN or LPN)
  if (
    p === "rn-nursing" ||
    p === "nclex-rn" ||
    (p.includes("rn") && !p.includes("pn") && !p.includes("lpn"))
  ) {
    const isPn = /\b(pn|lpn|nclex-?pn|practical)\b/i.test(combined);
    if (isPn) return false;
    return /\b(rn|nclex-?rn|registered\s*nurse)\b/i.test(combined);
  }

  // LPN / PN Nursing / NCLEX-PN (must be PN or LPN)
  if (p === "lpn-nursing" || p === "nclex-pn" || p.includes("pn") || p.includes("lpn")) {
    return /\b(pn|lpn|nclex-?pn|practical)\b/i.test(combined);
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
  const status = String(pSub.status || pSub.subscriptionStatus || pSub.providerStatus || "").trim().toLowerCase();
  const isActive =
    status === "active" ||
    status === "valid" ||
    status === "approved" ||
    status === "completed" ||
    status === "current" ||
    status === "live" ||
    status === "trialing";

  if (!isActive) return false;

  const start = pSub.validFrom || pSub.currentPeriodStart || pSub.startTime || pSub.purchaseDate;
  if (isDateInFuture(start)) return false;

  const expiry = pSub.validUntil || pSub.currentPeriodEnd || pSub.nextPaymentDate || pSub.nextDueDate || pSub.nextBillingTime || pSub.nextBillingOrPeriodEnd || pSub.expiresDate;
  if (isDateExpired(expiry)) return false;

  return true;
}

/**
 * A package is active and paid if the logged-in user actually has an active subscription
 * in userSubscriptions OR in any of the payment provider subscription sub-arrays.
 */
export function isPackageActiveAndPaid(pkg: DiscreteSubscriptionPackage): boolean {
  if (Array.isArray(pkg.userSubscriptions) && pkg.userSubscriptions.some(subscriptionIsActive)) {
    return true;
  }

  if (Array.isArray(pkg.stripeSubscriptions) && pkg.stripeSubscriptions.some(isProviderSubscriptionActive)) return true;
  if (Array.isArray(pkg.payStackSubscriptions) && pkg.payStackSubscriptions.some(isProviderSubscriptionActive)) return true;
  if (Array.isArray(pkg.payPalSubscriptions) && pkg.payPalSubscriptions.some(isProviderSubscriptionActive)) return true;
  if (Array.isArray(pkg.flutterWaveSubscriptions) && pkg.flutterWaveSubscriptions.some(isProviderSubscriptionActive)) return true;
  if (Array.isArray(pkg.intaSendSubscriptions) && pkg.intaSendSubscriptions.some(isProviderSubscriptionActive)) return true;
  if (Array.isArray(pkg.appleSubscriptions) && pkg.appleSubscriptions.some(isProviderSubscriptionActive)) return true;
  if (Array.isArray(pkg.mPesaSubscriptions) && pkg.mPesaSubscriptions.some(isProviderSubscriptionActive)) return true;

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

  const sessionCached = useMemo(() => {
    if (typeof window === "undefined" || !user?.userName || isGuest) return false;
    try {
      const direct = sessionStorage.getItem(`user_sub_${user.userName}_${programSlug}`) === "true";
      const universal = sessionStorage.getItem(`user_sub_universal_${user.userName}`) === "true";
      return direct || universal;
    } catch {
      return false;
    }
  }, [user?.userName, programSlug, isGuest]);

  const hasDatabaseSubscription = useMemo(() => {
    // If explicitly marked as guest or packages haven't loaded yet, not subscribed
    if (isGuest || !filteredSubscriptionPackages || filteredSubscriptionPackages.length === 0) {
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
    // 1. If database explicitly confirms active subscription, user is subscribed
    if (hasDatabaseSubscription) return true;
    // 2. If user already proved active subscription in this session, keep access active
    // so network hiccups or background revalidations NEVER revoke access mid-exam
    if (sessionCached) return true;
    // 3. Otherwise, if query is still loading, wait for response
    if (subscriptionsLoading) return false;
    return false;
  }, [isGuest, hasDatabaseSubscription, sessionCached, subscriptionsLoading]);

  // Cache confirmed subscriptions in sessionStorage
  useEffect(() => {
    if (typeof window === "undefined" || !user?.userName || isGuest) return;

    if (hasDatabaseSubscription) {
      try {
        sessionStorage.setItem(`user_sub_${user.userName}_${programSlug}`, "true");
        const hasUniversal = filteredSubscriptionPackages?.some(
          (pkg) => isUniversalPackage(pkg) && isPackageActiveAndPaid(pkg)
        );
        if (hasUniversal) {
          sessionStorage.setItem(`user_sub_universal_${user.userName}`, "true");
        }
      } catch {}
    }
  }, [hasDatabaseSubscription, filteredSubscriptionPackages, user?.userName, programSlug, isGuest]);

  // Only evict subscription cache on explicit user logout
  useEffect(() => {
    const handleLogout = () => {
      if (typeof window !== "undefined") {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith("user_sub_")) keysToRemove.push(k);
          }
          keysToRemove.forEach((k) => sessionStorage.removeItem(k));
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
