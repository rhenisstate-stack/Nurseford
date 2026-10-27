// src/lib/hooks/nexus/subscription/packages/useGlobalExamAccessGate.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import { SystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { getUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";
import { useExamSubscriptionAccess } from "./useExamSubscriptionAccess";

export interface UseGlobalExamAccessGateOptions {
  user: SystemUser | null;
  exam?: any | null;
  programSlug: string;
  flatTotal: number;
}

export function useGlobalExamAccessGate({
  user,
  exam,
  programSlug,
  flatTotal,
}: UseGlobalExamAccessGateOptions) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const isGuest = useMemo(() => {
    if (user?.userName && user.userName.toLowerCase() !== "guest") {
      return false;
    }
    const cookieUser = getUsernameCookie();
    if (cookieUser && cookieUser.toLowerCase() !== "guest") {
      return false;
    }
    return !user;
  }, [user]);

  const { isSubscribed, subscriptionsLoading } = useExamSubscriptionAccess({
    user,
    isGuest,
    programSlug,
    exam,
  });

  // Progressive Paywall Limits:
  // - Guest (not logged in): First 10 questions (indices 0 to 9)
  // - Registered user: 30% of total questions (first 10 count inside this 30%)
  // - Subscribed user: 100% of questions (unlimited)
  const GUEST_LIMIT = 10;
  const REGISTERED_PERCENT = 0.30;

  const allowedMaxIndex = useMemo(() => {
    if (flatTotal === 0) return 0;
    if (isSubscribed) return flatTotal - 1;
    if (isGuest) return Math.min(flatTotal - 1, GUEST_LIMIT - 1);
    const regLimit = Math.max(GUEST_LIMIT, Math.floor(flatTotal * REGISTERED_PERCENT));
    return Math.min(flatTotal - 1, regLimit - 1);
  }, [flatTotal, isSubscribed, isGuest]);

  const registeredLimitCount = useMemo(() => {
    return Math.max(GUEST_LIMIT, Math.floor(flatTotal * REGISTERED_PERCENT));
  }, [flatTotal]);

  const checkCanAccessIndex = useCallback(
    (targetIndex: number): boolean => {
      if (targetIndex > allowedMaxIndex) {
        if (isGuest) {
          setShowLoginModal(true);
        } else if (!isSubscribed) {
          setShowSubscriptionModal(true);
        }
        return false;
      }
      return true;
    },
    [allowedMaxIndex, isGuest, isSubscribed]
  );

  return {
    isGuest,
    isSubscribed,
    subscriptionsLoading,
    allowedMaxIndex,
    registeredLimitCount,
    showLoginModal,
    setShowLoginModal,
    showSubscriptionModal,
    setShowSubscriptionModal,
    checkCanAccessIndex,
  };
}
