// src/lib/hooks/nexus/subscription/packages/useGlobalExamAccessGate.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import { SystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { getUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";
import { useExamSubscriptionAccess, type ExamAccessShape } from "./useExamSubscriptionAccess";

export interface UseGlobalExamAccessGateOptions {
  user: SystemUser | null;
  exam?: ExamAccessShape | null;
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
    if (user && user.id > 0 && user.userName && user.userName.toLowerCase() !== "guest") {
      return false;
    }
    return true;
  }, [user]);

  const { isSubscribed, subscriptionsLoading } = useExamSubscriptionAccess({
    user,
    isGuest,
    programSlug,
    exam,
  });

  // All questions returned by the backend are fully accessible (logic handled by ASP.NET backend)
  const allowedMaxIndex = useMemo(() => {
    return flatTotal > 0 ? flatTotal - 1 : 0;
  }, [flatTotal]);

  const registeredLimitCount = flatTotal;

  const checkCanAccessIndex = useCallback(
    (_targetIndex: number): boolean => {
      return true;
    },
    []
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
