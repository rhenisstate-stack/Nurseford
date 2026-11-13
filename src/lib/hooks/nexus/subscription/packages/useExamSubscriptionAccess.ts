'use client';

import { useMemo, useEffect } from "react";
import { SystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { getUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";
import {
  useDiscreteDominionSubscriptionPackages,
  DiscreteSubscriptionPackage,
  UserSubscriptionPackage,
} from "./dicreate/useDiscreteDominionSubscriptionPackages";

// Guid fields on an exam that a package's terminal cluster can point at
type ExamGuidField =
  | "programGuidId"
  | "courseGuidId"
  | "subjectGuidId"
  | "unitGuidId"
  | "lessonGuidId"
  | "topicGuidId"
  | "conceptGuidId"
  | "factGuidId";

// The only exam fields this hook reads (StrataSessionExam satisfies this)
export interface ExamAccessShape {
  programGuidId?: string | null;
  courseGuidId?: string | null;
  subjectGuidId?: string | null;
  unitGuidId?: string | null;
  lessonGuidId?: string | null;
  topicGuidId?: string | null;
  conceptGuidId?: string | null;
  factGuidId?: string | null;
  programName?: string | null;
  courseName?: string | null;
  subjectName?: string | null;
  title?: string | null;
}

// The only fields read from a payment-provider subscription record
// (Stripe, Paystack, PayPal, Flutterwave, IntaSend, Apple, M-Pesa)
interface ProviderSubscriptionLike {
  status?: string | null;
  subscriptionStatus?: string | null;
  providerStatus?: string | null;
  validFrom?: string | null;
  currentPeriodStart?: string | null;
  startTime?: string | null;
  purchaseDate?: string | null;
  validUntil?: string | null;
  currentPeriodEnd?: string | null;
  nextPaymentDate?: string | null;
  nextDueDate?: string | null;
  nextBillingTime?: string | null;
  nextBillingOrPeriodEnd?: string | null;
  expiresDate?: string | null;
}

// Maps a package's terminalClusterTableName to the matching guid field on the exam
// (Matches origin-repo/main access control hierarchy exactly)
export const TABLE_TO_EXAM_GUID_FIELD: Record<string, ExamGuidField> = {
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
  exam: ExamAccessShape | null | undefined,
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
function isProviderSubscriptionActive(pSub: ProviderSubscriptionLike | null | undefined): boolean {
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
  exam?: ExamAccessShape | null;
}) {
  const {
    filteredSubscriptionPackages,
    loading: subscriptionsLoading,
    refresh: refreshSubscriptions,
  } = useDiscreteDominionSubscriptionPackages({ page: 1, perPage: 200 });

  // Resolve stable username only for real authenticated users (prevents ghost access for guests)
  const username = useMemo(() => {
    if (user && user.id > 0 && user.userName && user.userName.toLowerCase() !== "guest") {
      return user.userName.toLowerCase().trim();
    }
    return null;
  }, [user]);

  const programFamily = useMemo(
    () => getProgramFamily(programSlug),
    [programSlug]
  );



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
    return hasDatabaseSubscription;
  }, [isGuest, hasDatabaseSubscription]);

  // Automatically revalidate subscriptions when user returns to tab (e.g. after subscribing in another tab)
  useEffect(() => {
    const handleRevalidate = () => {
      if (document.visibilityState === "visible" && !isGuest && user && user.id > 0) {
        refreshSubscriptions();
      }
    };
    document.addEventListener("visibilitychange", handleRevalidate);
    window.addEventListener("focus", handleRevalidate);
    window.addEventListener("subscription:updated", handleRevalidate);
    return () => {
      document.removeEventListener("visibilitychange", handleRevalidate);
      window.removeEventListener("focus", handleRevalidate);
      window.removeEventListener("subscription:updated", handleRevalidate);
    };
  }, [isGuest, user, refreshSubscriptions]);

  // Evict subscription cache on user logout or session expiration
  useEffect(() => {
    const handleLogout = () => {
      if (typeof window !== "undefined") {
        try {
          const localKeys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith("user_sub_") || k.startsWith("skew_blanc_"))) localKeys.push(k);
          }
          localKeys.forEach((k) => localStorage.removeItem(k));

          const sessionKeys: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && (k.startsWith("user_sub_") || k.startsWith("skew_blanc_"))) sessionKeys.push(k);
          }
          sessionKeys.forEach((k) => sessionStorage.removeItem(k));
        } catch { }
      }
    };

    window.addEventListener("session:logout", handleLogout);
    window.addEventListener("user-logout", handleLogout);
    window.addEventListener("user-session-expired", handleLogout);
    return () => {
      window.removeEventListener("session:logout", handleLogout);
      window.removeEventListener("user-logout", handleLogout);
      window.removeEventListener("user-session-expired", handleLogout);
    };
  }, []);

  return {
    isSubscribed,
    hasDatabaseSubscription,
    subscriptionsLoading,
    filteredSubscriptionPackages,
    refreshSubscriptions,
  };
}
